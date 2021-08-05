import React, { CSSProperties } from "react";
import ReactDOM from "react-dom";
import { Point, Rect, RectUtility } from "../../src/common/point";
import { SyExtensionsComponent } from "../sy.component";
import { PopoverPosition } from "./position";
import './style.less';
class Popover extends SyExtensionsComponent<{ component: typeof React.Component }> {
    visible: boolean;
    point: Point = new Point(0, 0);
    private mask: boolean = false;
    private el: HTMLElement;
    async open<T extends React.Component>(pos: PopoverPosition) {
        this.visible = true;
        this.point = pos.roundArea.leftTop;
        this.mask = pos.mask == true ? true : false;
        return new Promise((resolve: (ins: T) => void, reject) => {
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
                resolve(this.cp as T);
            })
        })
    }
    cp: React.Component;
    render() {
        var CP = this.props.component;
        var style: CSSProperties = {
            top: this.point.y,
            left: this.point.x
        }
        return this.visible && <div className='shy-popover-box' ref={e => this.el = e}>
            {this.mask && <div className='shy-popover-mask'></div>}
            <div style={style} className='shy-popover'><CP ref={e => this.cp}></CP></div>
        </div>
    }
    onClose() {
        this.close();
        this.emit('close');
    }
    close() {
        this.visible = false;
        this.forceUpdate();
    }
}
let maps = new Map<typeof React.Component, Popover>();
export async function PopoverSingleton(CP: typeof React.Component) {
    return new Promise((resolve: (data: Popover) => void, reject) => {
        if (maps.has(CP)) return resolve(maps.get(CP))
        var ele = document.createElement('div');
        document.body.appendChild(ele);
        ReactDOM.render(<Popover component={CP} ref={e => {
            maps.set(CP, e);
            resolve(e as Popover);
        }} />, ele);
    })
}