import React, { ReactNode } from "react";
import { createPortal } from "react-dom";
import { Point, Rect } from "../../../src/common/vector/point";


export class RichTool extends React.Component<{ click: (command: string, data: Record<string, any>) => void }> {
    point: Point;
    toolStyle: Record<string, any> = {};
    open(rect: Rect, toolStyle: Record<string, any>) {
        this.toolStyle = toolStyle;
        var point = rect.leftTop;
        point.move(0, -40);
        this.point = point;
        this.visible = true;
        this.forceUpdate()
    }
    hide() {
        this.visible = false;
        this.forceUpdate()
    }
    click(command: string) {
        if (command == 'bold') this.toolStyle.fontWeight = 'bold';
        else if (command == 'unbold') this.toolStyle.fontWeight = 'normal';
        if (typeof this.props.click == 'function')
            this.props.click(command, undefined)
        this.hide()
    }
    el: HTMLElement;
    render(): ReactNode {
        return createPortal(<div ref={e => this.el = e} style={{ display: this.visible ? "flex" : "none" }} className="flex border padding-w-10 h-30 r-size-24 r-round r-item-hover r-cursor ">
            <span className={this.toolStyle.fontWeight == 'bold' ? " link" : ""} onClick={e => this.click(this.toolStyle.fontWeight == 'bold' ? "unbold" : "bold")}>

            </span>
        </div>, document.body)
    }
    visible: boolean = false;

}