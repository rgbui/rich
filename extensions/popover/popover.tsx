import React, { CSSProperties } from "react";
import ReactDOM from "react-dom";
import { Point, Rect, RectUtility } from "../../src/common/point";
import { EventsComponent } from "../events.component";
import { PopoverPosition } from "./position";
import './style.less';
class Popover extends EventsComponent<{ component: typeof React.Component, args?: Record<string, any>, mask?: boolean, visible?: "hidden" | "none" }> {
    visible: boolean;
    point: Point = new Point(0, 0);
    private el: HTMLElement;
    async open<T extends React.Component>(pos: PopoverPosition) {
        this.visible = true;
        if (this.props.visible == 'hidden') {
            if (this.box) this.box.style.display = 'block';
        }
        this.point = pos.roundArea.leftTop;
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
    private box: HTMLElement;
    render() {
        var CP = this.props.component;
        var style: CSSProperties = {
            top: this.point.y,
            left: this.point.x
        }
        if (this.props.visible == 'hidden') {
            return <div ref={e => this.box = e} style={{ display: this.visible == true ? "block" : "none" }}>
                {this.props.mask == true && <div className='shy-popover-mask' onMouseDown={e => this.onClose()}></div>}
                <div style={style} className='shy-popover' ref={e => this.el = e}><CP {...this.props.args} ref={e => this.cp = e}></CP></div>
            </div>
        }
        else {
            return <div ref={e => this.box = e} >{this.visible && <>
                {this.props.mask == true && <div className='shy-popover-mask' onMouseDown={e => this.onClose()}></div>}
                <div style={style} className='shy-popover' ref={e => this.el = e}><CP {...this.props.args} ref={e => this.cp = e}></CP></div>
            </>}</div>
        }
    }
    onClose() {
        this.close();
        this.emit('close');
    }
    close() {
        this.visible = false;
        if (this.props.visible == 'hidden') {
            this.box.style.display = 'none';
        }
        else
            this.forceUpdate();
    }
    componentDidMount() {
        document.addEventListener('mousedown', this.onGlobalMousedown, true);
    }
    componentWillUnmount() {
        document.removeEventListener('mousedown', this.onGlobalMousedown, true);
    }
    onGlobalMousedown = (event: MouseEvent) => {
        if (this.el && this.props.mask != true) {
            var target = event.target as HTMLDivElement;
            if (this.el.contains(target)) return;
            this.onClose();
        }
    }
}
let maps = new Map<typeof React.Component, Popover>();
/**
 * 
 * @param CP 
 * @param props visible:hidden 表示当前的popover是否隐藏内容，还是让内容消失重绘(visible:none)
 * @returns 
 */
export async function PopoverSingleton(CP: typeof React.Component, props?: { mask?: boolean, visible?: 'hidden' | "none" }, args?: Record<string, any>) {
    return new Promise((resolve: (data: Popover) => void, reject) => {
        if (maps.has(CP)) return resolve(maps.get(CP))
        var ele = document.createElement('div');
        document.body.appendChild(ele);
        ReactDOM.render(<Popover {...(props || {})} args={args || {}} component={CP} ref={e => {
            maps.set(CP, e);
            resolve(e as Popover);
        }} />, ele);
    })
}