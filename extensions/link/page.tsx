import React from "react";
import ReactDOM from "react-dom";
import { Singleton } from "../../component/lib/Singleton";
import { PageSvg, Plus2Svg } from "../../component/svgs";
import { Divider } from "../../component/view/grid";
import { Icon } from "../../component/view/icon";
import { channel } from "../../net/channel";
import { KeyboardCode } from "../../src/common/keys";
import { Point, Rect } from "../../src/common/vector/point";
import { InputTextPopSelector } from "../common/input.pop";
import { IconArguments } from "../icon/declare";
import "./style.less";

/**
 * 用户输入[[触发
 */
class PageLinkSelector extends InputTextPopSelector {
    async open(
        round: Rect,
        text: string,
        callback: (...args: any[]) => void): Promise<boolean> {
        this._select = callback;
        this.pos = round.leftTop;
        var rs = channel.query('/ws/current/pages');
        this.visible = true;
        var t = text.replace(/\[\[|【【/, '');
        if (t) { this.text = t; this.syncSearch() }
        else {
            this.links = rs.map(r => {
                return {
                    id: r.id,
                    text: r.text,
                    icon: r.icon
                }
            });
            this.forceUpdate();
        }
        return true;
    }
    links: { icon: IconArguments, id: string, text: string }[] = [];
    private async syncSearch() {
       var rs= channel.query('/ws/current/pages')
    }
    private get isSelectIndex() {
        return this.selectIndex >= 0 && this.selectIndex < this.links.length;
    }
    private renderLinks() {
        return <div>
            <a className={"shy-page-link-item" + (0 == this.selectIndex ? " selected" : "")} onMouseDown={e => this.onSelect({ name: 'create' })}><Icon icon={Plus2Svg}></Icon><span>创建{this.text || '新页面'}</span></a>
            <Divider></Divider>
            {this.links.map((link, i) => {
                return <a onMouseDown={e => this.onSelect(link)} className={"shy-page-link-item" + ((i + 1) == this.selectIndex ? " selected" : "")} key={link.id}><Icon icon={link.icon || PageSvg}></Icon><span>{link.text}</span></a>
            })}
        </div>
    }
    render() {
        var style: Record<string, any> = {
            top: this.pos.y,
            left: this.pos.x
        }
        return <div>
            {this.visible && <div className='shy-page-link' style={style}>{this.renderLinks()}</div>}
        </div>
    }
    private onSelect(block) {
        if (block.name == 'create') {
            this._select({ url: '/link/line', isLine: true, text: this.text })
        }
        else {
            this._select({ url: '/link/line', isLine: true, pageId: block.id, text: block.text, icon: block.icon })
        }
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
        if (this.visible == true) {
            this.visible = false;
            this.forceUpdate();
        }
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
                    if (block) return { block };
                    else return false;
            }
        }
        return false;
    }
}
export async function usePageLinkSelector() {
    return await Singleton(PageLinkSelector);
}
