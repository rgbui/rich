import React from "react";
import { PopoverPosition } from "../../extensions/popover/position";
import { Point, Rect, RectUtility } from "../../src/common/point";
import { MenuItemType } from "./declare";
import { MenuItem } from "./item";
export class MenuBox extends React.Component<{ items: MenuItemType[], deep: number, select: (item: MenuItemType, event?: MouseEvent) => void }>{
    render() {
        return <div className='sy-menu-box' ref={e => this.el = e} style={{ top: this.point.y, left: this.point.x }}>
            {this.props.items.map((item, index) => {
                return <MenuItem key={index} item={item} deep={this.props.deep + 1} select={this.props.select} ></MenuItem>
            })}
        </div>
    }
    el: HTMLElement;
    point = new Point(0, 0);
    open(pos: PopoverPosition) {
        this.point = pos.roundArea.leftTop;
        this.forceUpdate(() => {
            if (this.el) {
                var b = Rect.from(this.el.getBoundingClientRect());
                pos.elementArea = b;
                var newPoint = RectUtility.cacPopoverPosition(pos);
                if (!this.point.equal(newPoint)) {
                    this.point = newPoint;
                    console.log('newPoint', this.point);
                    this.forceUpdate();
                }
            }
        })
    }
}
