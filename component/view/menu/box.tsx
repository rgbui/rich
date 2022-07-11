import React, { CSSProperties } from "react";
import { MenuPanel } from ".";
import { PopoverPosition } from "../../../extensions/popover/position";
import { Point, Rect, RectUtility } from "../../../src/common/vector/point";
import { popoverLayer } from "../../lib/zindex";
import { MenuItem } from "./declare";
import { MenuItemView } from "./item";
import { MenuView } from "./menu";
export class MenuBox extends React.Component<{
    parent:MenuPanel<any>| MenuView,
    items: MenuItem[],
    style?: CSSProperties,
    deep: number,
    input: (item: MenuItem) => void,
    select: (item: MenuItem, event?: MouseEvent) => void,
    click: (item: MenuItem, event?: React.MouseEvent, name?: string,mv?:MenuItemView) => void
}>{
    render() {
        var isVisible = this.props.style?.overflow == 'visible' || this.props.items.exists(g => g.childs && g.childs.length > 0)
        return <div className='shy-menu-box' ref={e => this.el = e} style={{
            top: this.point.y,
            left: this.point.x,
            zIndex: popoverLayer.zoom(this),
            ...(this.props.style || {}),
            overflowY: isVisible ? "visible" : "auto",
            maxHeight: isVisible ? '100vh' : undefined,
        }}>{this.props.items.map((item, index) => {
            return <MenuItemView parent={this.props.parent} key={index}
                item={item} deep={this.props.deep + 1}
                select={this.props.select}
                input={this.props.input}
                click={this.props.click}
            ></MenuItemView>
        })}
        </div>
    }
    el: HTMLElement;
    point = new Point(0, 0);
    open(pos: PopoverPosition) {
        if (pos.fixPoint) this.point = pos.fixPoint;
        else this.point = pos.roundArea ? pos.roundArea.leftTop : pos.roundPoint;
        if (pos.fixPoint) {
            this.forceUpdate()
        }
        else this.forceUpdate(() => {
            if (this.el) {
                var b = Rect.from(this.el.getBoundingClientRect());
                pos.elementArea = b;
                var newPoint = RectUtility.cacPopoverPosition(pos);
                if (!this.point.equal(newPoint)) {
                    this.point = newPoint;
                    this.forceUpdate();
                }
            }
        })
    }
}
