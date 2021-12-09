import React from "react";
import { PopoverPosition } from "../../../extensions/popover/position";
import { Point, Rect, RectUtility } from "../../../src/common/point";
import { LayerWield, popoverLayer } from "../../lib/zindex";
import { MenuItemType } from "./declare";
import { MenuItem } from "./item";
export class MenuBox extends React.Component<{ items: MenuItemType[], deep: number, select: (item: MenuItemType, event?: MouseEvent) => void }>{
    render() {
        return <div className='shy-menu-box' ref={e => this.el = e} style={{
            top: this.point.y,
            left: this.point.x,
            zIndex: popoverLayer.zoom(LayerWield.menuBox),
            overflowY: this.props.items.exists(g => g.childs && g.childs.length > 0) ? "visible" : "auto"
        }}>{this.props.items.map((item, index) => {
            return <MenuItem key={index} item={item} deep={this.props.deep + 1} select={this.props.select} ></MenuItem>
        })}
        </div>
    }
    el: HTMLElement;
    point = new Point(0, 0);
    open(pos: PopoverPosition) {
        this.point = pos.roundArea ? pos.roundArea.leftTop : pos.roundPoint;
        this.forceUpdate(() => {
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
