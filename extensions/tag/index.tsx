import React from "react";
import ReactDOM from "react-dom";
import { Singleton } from "../../component/lib/Singleton";
import { KeyboardCode } from "../../src/common/keys";
import { Rect, Point, RectUtility } from "../../src/common/vector/point";
import { InputTextPopSelector } from "../common/input.pop";
import lodash from "lodash";
import { PlusSvg, TopicSvg } from "../../component/svgs";
import { Divider } from "../../component/view/grid";
import { Icon } from "../../component/view/icon";
import { Spin } from "../../component/view/spin";
import { channel } from "../../net/channel";
import { BlockUrlConstant } from "../../src/block/constant";
import { PopoverPosition } from "../popover/position";

/**
 * 用户输入#触发
 */
class TagSelector extends InputTextPopSelector {
    onClose(): void {
        this.close();
    }
    async open(
        round: Rect,
        text: string,
        callback: (...args: any[]) => void): Promise<boolean> {
        this._select = callback;
        this.round = round;
        this.pos = round.leftBottom;
        this.visible = true;
        var t = text.replace(/^#/, '');
        if (t) {
            this.text = t;
            this.forceUpdate();
            this.syncSearch();
        }
        else {
            this.text = '';
            var rs = channel.query('/ws/current/pages');
            this.links = rs.map(r => {
                return {
                    id: r.id,
                    text: r.text,
                    icon: r.icon
                }
            });
            this.adjuctPosition();
        }
        return true;
    }
    private round: Rect;
    links: { id: string, text: string }[] = [];
    loading = false;
    searchWord: string = '';
    syncSearch = lodash.debounce(async () => {
        if (!this.text) return;
        this.loading = true;
        this.searchWord = this.text;
        if (!this.visible) return;
        this.adjuctPosition();
        var r = await channel.get('/tag/word/query', { word: this.searchWord });
        if (!this.visible) return;
        if (r.ok) {
            this.links = r.data.list;
        }
        else this.links = [];
        if (this.selectIndex > this.links.length) {
            this.selectIndex = 1;
        }
        this.loading = false;
        this.adjuctPosition();
    }, 700)
    private get isSelectIndex() {
        return this.selectIndex >= 0 && this.selectIndex < this.links.length;
    }
    private renderLinks() {
        return <div>
            <a className={"h-30 gap-l-10 text item-hover cursor round padding-w-10 flex" + (0 == this.selectIndex ? " item-hover-focus" : "")} onMouseDown={e => this.onSelect({ name: 'create' })}>
                <span className="flex flex-inline size-24 item-hover round">
                    <Icon size={18} icon={PlusSvg}></Icon>
                </span>
                <span className="f-14">
                    <Icon size={18} icon={TopicSvg}></Icon>
                    创建<b className="bold">{this.text || '标签'}</b>
                </span>
            </a>
            <Divider></Divider>
            {this.loading && <div className="flex-center gap-h-30"><Spin></Spin></div>}
            {!this.loading && this.links.map((link, i) => {
                return <a onMouseDown={e => this.onSelect(link)} className={"h-30 gap-l-10 text  item-hover cursor round padding-w-10 flex" + ((i + 1) == this.selectIndex ? " item-hover-focus" : "")} key={link.id}>
                    <span className="flex flex-inline size-24 item-hover round"> <Icon size={18} icon={TopicSvg}></Icon></span>
                    <span className="f-14">{link.text || '新页面'}</span></a>
            })}
            {!this.loading && this.links.length == 0 && this.searchWord && <div className="remark flex-center gap-h-10 f-14">没有搜索到</div>}
        </div>
    }
    render() {
        var style: Record<string, any> = {
            top: this.pos.y,
            left: this.pos.x,
            display: this.visible ? 'block' : 'none'
        }
        return <div ref={e => this.el = e}
            style={style}
            className='pos w-180 max-h-200 bg-white overlay-y  round shadow border'>{this.renderLinks()}
        </div>
    }
    private onSelect(block) {
        if (block.name == 'create') {
            this._select({ url: BlockUrlConstant.Tag, isLine: true, content: this.text || "标签" })
        }
        else {
            this._select({ url: BlockUrlConstant.Tag, isLine: true, content: block.text, tagText: block.text, tagId: block.id })
        }
        this.close();
    }
    private visible: boolean = false;
    private pos: Point = new Point(0, 0)
    private selectIndex: number = 1;
    private _select: (block: Record<string, any>) => void;
    private text: string;
    private get selectBlockData() {
        if (this.selectIndex == 0) {
            return {
                name: 'create'
            }
        }
        var b = this.links[this.selectIndex - 1];
        return b;
    }
    private close() {
        this.text = '';
        this.searchWord = '';
        this.loading = false;
        this.selectIndex = 1;
        if (this.visible == true) {
            this.visible = false;
            this.forceUpdate();
        }
    }
    /**
     * 向上选择内容
     */
    private keydown() {
        if (!this.isSelectIndex) {
            this.selectIndex = 0;
            this.forceUpdate();
            return;
        }
        if (this.selectIndex < this.links.length + 1) {
            this.selectIndex += 1;
            this.forceUpdate();
        }
    }
    /**
     * 向下选择内容
     */
    private keyup() {
        if (!this.isSelectIndex) {
            this.selectIndex = this.links.length;
            this.forceUpdate();
            return;
        }
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
        var el = this.el.querySelector('.item-hover-focus') as HTMLElement;
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
                    var block: any = this.selectBlockData;
                    var text = this.text;
                    this.close();
                    if ((block as any)?.name == 'create') {
                        return {
                            blockData: {
                                url: BlockUrlConstant.Tag,
                                content: text || '标签',
                                isLine: true,
                                tagText: text || '标签'
                            }
                        }
                    }
                    else if (block)
                        return {
                            blockData: {
                                url: BlockUrlConstant.Tag,
                                isLine: true,
                                content: block.text,
                                tagText: block.text,
                                tagId: block.id,
                            }
                        };
                    else return false;
            }
        }
        return false;
    }
    private adjuctPosition() {
        this.forceUpdate(() => {
            var selectorEl = this.el.querySelector('.item-hover-focus') as HTMLElement;
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
}
export async function useTagSelector() {
    return await Singleton(TagSelector);
}