import React, { ReactNode } from "react";
import { createPortal } from "react-dom";
import { Point, Rect } from "../../../src/common/vector/point";
import { BoldSvg } from "../../svgs";
import { Icon } from "../icon";


export class RichTool extends React.Component<{ click: (command: string) => void }> {
    point: Point;
    open(rect: Rect) {
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
        if (typeof this.props.click == 'function')
            this.props.click(command)
        this.hide()
    }
    render(): ReactNode {
        return createPortal(<div style={{ display: this.visible ? "flex" : "none" }} className="flex border padding-w-10 h-30 r-size-24 r-round r-item-hover r-cursor ">
            <span onClick={e => this.click('bold')}><Icon size={16} icon={BoldSvg}></Icon></span>
        </div>, document.body)
    }
    visible: boolean = false;
}