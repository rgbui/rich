import lodash from "lodash";
import React from "react";
import ReactDOM from "react-dom";
import { Singleton } from "../../component/lib/Singleton";
import { Avatar } from "../../component/view/avator/face";
import { channel } from "../../net/channel";
import { KeyboardCode } from "../../src/common/keys";
import { Point, Rect, RectUtility } from "../../src/common/vector/point";
import { UserBasic } from "../../types/user";
import { InputTextPopSelector } from "../common/input.pop";
import { PopoverPosition } from "../popover/position";
import { Spin } from "../../component/view/spin";
import { popoverLayer } from "../../component/lib/zindex";

/**
 * 用户输入@触发
 */
class AtUserSelector extends InputTextPopSelector {
    async open(
        round: Rect,
        text: string,
        callback: (...args: any[]) => void): Promise<boolean> {
        this._select = callback;
        this.round = round;
        this.pos = round.leftBottom;
        if(!this.visible)
        {
            this.selectIndex = 0;
        }
        this.visible = true;
        var t = text.replace(/^@/, '');
        this.text = t;
        /**
         * 修复输入@+空格时，自动关掉搜索框
         */
        if (this.text.startsWith(' ')) {
            this.close();
            return this.visible;
        }
        if (this.searchWord && this.text.startsWith(this.searchWord) && this.links.length == 0) {
            if (this.searchIsEmpty == true) {
                this.close();
                return this.visible;
            }
            this.searchIsEmpty = true;
        }
        else {
            var r = await channel.get('/ws/member/word/query', {});
            this.allLinks = r.data;
            this.links = lodash.cloneDeep(r.data.list);
            this.searchIsEmpty = false;
        }
        this.syncSearch();
        return this.visible;
    }
    private round: Rect;
    allLinks: { list: UserBasic[], total: number, size: number } = { list: [], total: 0, size: 200 }
    links: UserBasic[] = [];
    loading = false;
    searchWord: string = '';
    searchIsEmpty: boolean = false;
    syncSearch = lodash.debounce(async () => {
        this.loading = true;
        this.searchWord = this.text;
        if (this.visible == false) return;
        this.adjuctPosition();
        var result = [];
        if (!this.searchWord) {
            result = this.allLinks.list.filter(g => true);
        } else if (this.allLinks.total <= this.allLinks.size) {
            result = this.allLinks.list.filter(g => g.name.startsWith(this.searchWord));
        }
        else {
            result = (await channel.get('/ws/member/word/query', { word: this.searchWord })).data.list;
        }
        this.links = result
        if (this.selectIndex >= this.links.length) {
            this.selectIndex = 0;
        }
        this.loading = false;
        this.adjuctPosition();
    }, 1000)
    private get isSelectIndex() {
        return this.selectIndex >= 0 && this.selectIndex < this.links.length;
    }
    private renderLinks() {
        return <div>
            {this.loading && <div className="flex-center gap-h-10"><Spin></Spin></div>}
            {!this.loading && this.links.map((link, i) => {
                return <div
                    onMouseDown={e => this.onSelect(link)} className={"padding-w-10 flex item-hover cursor round padding-5 " + ((i + 1) == this.selectIndex ? "  item-hover-focus" : "")}
                    key={link.id}>
                    <Avatar size={30} userid={(link as any).userid}></Avatar>
                    <span className="gap-l-5 text-overflow">{link.name}</span>
                </div>
            })}
            {!this.loading && this.searchWord && this.links.length == 0 && <div className="flex-center gap-h-10 remark">没有搜索到</div>}
        </div>
    }
    render() {
        var style: Record<string, any> = {
            top: this.pos.y,
            left: this.pos.x,
            display: this.visible ? 'block' : 'none',
            zIndex: popoverLayer.zoom(this)
        }
        return <div className='pos w-180 max-h-200 bg-white overlay-y  round shadow border' style={style}>{this.renderLinks()}</div>
    }
    private onSelect(block) {
        this._select({ url: '/user/mention', isLine: true, userid: (block as any).userid, })
        this.close();
    }
    private visible: boolean = false;
    private pos: Point = new Point(0, 0)
    private selectIndex: number = 0;
    private _select: (block: Record<string, any>) => void;
    private text: string;
    private get selectBlockData() {
        var b = this.links[this.selectIndex];
        return b;
    }
    private close() {
        this.searchIsEmpty = false;
        this.loading = false;
        this.text = '';
        this.searchWord = '';
        this.selectIndex = 0;
        if (this.visible == true) {
            this.visible = false;
            this.forceUpdate();
        }
    }
    private adjuctPosition() {
        this.forceUpdate(() => {
            var selectorEl = this.el;
            if (selectorEl) {
                var b = Rect.fromEle(selectorEl);
                var pos: PopoverPosition = {
                    roundArea: this.round,
                    elementArea: b
                }
                var newPoint = RectUtility.cacPopoverPosition(pos);
                if (!this.pos.equal(newPoint)) {
                    this.pos = newPoint;
                    this.forceUpdate();
                }
            }
        })
    }
    onClose(): void {
        this.close()
    }
    /**
     * 向上选择内容
     */
    private keydown() {
        if (!this.isSelectIndex) this.selectIndex = -1;
        if (this.selectIndex < this.links.length - 1) {
            this.selectIndex += 1;
            this.forceUpdate();
        }
    }
    /**
     * 向下选择内容
     */
    private keyup() {
        if (!this.isSelectIndex) this.selectIndex = this.links.length - 1;
        if (this.selectIndex > 0) {
            this.selectIndex -= 1;
            this.forceUpdate();
        }
    }
    private el: HTMLElement;
    componentDidMount() {
        this.el = ReactDOM.findDOMNode(this) as HTMLElement;
        document.addEventListener('mousedown', this.onGlobalMousedown);
    }
    componentWillUnmount() {
        document.removeEventListener('mousedown', this.onGlobalMousedown);
    }
    componentDidUpdate() {
        var el = this.el.querySelector('.selected') as HTMLElement;
        if (el) {
            el.scrollIntoView({
                block: "nearest",
                inline: "nearest"
            });
        }
    }
    onGlobalMousedown = (event: MouseEvent) => {
        if (this.visible == true && this.el) {
            var target = event.target as HTMLElement;
            if (this.el.contains(target)) return;
            this.close();
        }
    }
    onKeydown(event: KeyboardEvent) {
        if (this.visible == true) {
            switch (event.key) {
                case KeyboardCode.ArrowDown:
                    this.keydown();
                    return true;
                case KeyboardCode.ArrowUp:
                    this.keyup();
                    return true;
                case KeyboardCode.Enter:
                    var block = this.selectBlockData;
                    this.close();
                    if (block) return {
                        blockData: {
                            url: '/user/mention',
                            isLine: true,
                            userid: (block as any).userid
                        }
                    };
                    else return false;
            }
        }
        return false;
    }
}
export async function useAtUserSelector() {
    return await Singleton(AtUserSelector);
}
