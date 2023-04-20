import React, { CSSProperties, ReactNode } from "react";
import { createPortal } from "react-dom";
import { Point, Rect } from "../../../../src/common/vector/point";
import { BoldSvg, CodeSvg, DeleteLineSvg, ItalicSvg, QuoteSvg } from "../../../svgs";
import { Icon } from "../../icon";

export class InputChatTool extends React.Component<{
    click: (command: 'bold' | 'delete' | 'code' | 'quote' | 'italic') => void
}> {
    point: Point = new Point();
    node: Node;
    nodeStartOffset: number;
    nodeEndOffset: number;
    open(rect: Rect) {
        var point = rect.leftTop.move(0, -40);
        this.point = point;
        var sel = window.getSelection();
        this.node = sel.focusNode as Node;
        if (sel.focusOffset > sel.anchorOffset) {
            this.nodeEndOffset = sel.focusOffset;
            this.nodeStartOffset = sel.anchorOffset;
        }
        else {
            this.nodeEndOffset = sel.anchorOffset;
            this.nodeStartOffset = sel.focusOffset;
        }
        this.visible = true;
        this.forceUpdate()
    }
    hide() {
        this.visible = false;
        this.forceUpdate()
    }
    el: HTMLElement;
    render(): ReactNode {
        var style: CSSProperties = {
            left: this.point.x,
            top: this.point.y,
            userSelect: 'none',
            zIndex: '10000'
        }
        if (this.visible == false) style.display = 'none'
        return createPortal(<div
            className="pos bg-white round shadow"
            ref={e => this.el = e}
            style={style}>
            <div className="flex border padding-w-10 h-30 r-size-24 r-round r-item-hover r-cursor r-flex-center ">
                <span onMouseDown={e => this.onClick('bold')}><Icon size={16} icon={BoldSvg}></Icon></span>
                <span onMouseDown={e => this.onClick('italic')}><Icon size={16} icon={ItalicSvg}></Icon></span>
                <span onMouseDown={e => this.onClick('delete')}><Icon size={16} icon={DeleteLineSvg}></Icon></span>
                <span onMouseDown={e => this.onClick('quote')}><Icon size={16} icon={QuoteSvg}></Icon></span>
                <span onMouseDown={e => this.onClick('code')}><Icon size={16} icon={CodeSvg}></Icon></span>
            </div>
        </div>, this.panel)
    }
    visible: boolean = false;
    onClick(command: string) {
        this.props.click(command as any);
        this.hide()
    }
    private _panel: HTMLElement;
    get panel() {
        if (!this._panel) {
            this._panel = document.createElement('div');
            document.body.appendChild(this._panel)
        }
        return this._panel;
    }
    componentWillUnmount(): void {
        if (this.panel) this.panel.remove()
    }
}