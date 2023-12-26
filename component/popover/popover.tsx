import React, { CSSProperties } from "react";
import ReactDOM from "react-dom";
import { Point, Rect, RectUtility } from "../../src/common/vector/point";
import { EventsComponent } from "../lib/events.component";
import { PopoverPosition } from "./position";
import './style.less';
import { popoverLayer } from "../lib/zindex";
export class Popover<T extends React.Component> extends EventsComponent<{
    component: { new(...args: any[]): T },
    shadow?: boolean,
    args?: Record<string, any>,
    mask?: boolean,
    visible?: "hidden" | "none",
    frame?: boolean,
    did?: (e: any) => void
}> {
    visible: boolean;
    point: Point = new Point(0, 0);
    private el: HTMLElement;
    private pos: PopoverPosition;
    async open(pos: PopoverPosition): Promise<T> {
        this.visible = true;
        this.maskZindex = popoverLayer.zoom(this);
        this.zindex = popoverLayer.zoom(this);
        this.pos = pos;
        if (this.props.visible == 'hidden') {
            if (this.box) this.box.style.display = 'block';
        }
        if (!pos.roundArea && pos.roundPoint) {
            pos.roundArea = new Rect(pos.roundPoint.x, pos.roundPoint.y, 0, 0);
        }
        if (pos.center == true) {
            this.point = new Point(window.innerWidth / 2, window.innerHeight / 2);
        }
        else if (pos.dockRight) {
            return new Promise((resolve: (ins: T) => void, reject) => {
                this.forceUpdate(() => {
                    resolve(this.cp);
                })
            })
        }
        else if (pos.fixPoint) {
            this.point = pos.fixPoint;
            return new Promise((resolve: (ins: T) => void, reject) => {
                this.forceUpdate(() => {
                    resolve(this.cp);
                })
            })
        }
        else this.point = pos.roundArea.leftTop;
        return new Promise((resolve: (ins: T) => void, reject) => {
            this.forceUpdate(() => {
                this.updateLayout();
                resolve(this.cp);
            })
        })
    }
    cp: T;
    private box: HTMLElement;
    render() {
        if (typeof this.maskZindex == 'undefined') {
            this.maskZindex = popoverLayer.zoom(this);
        }
        if (typeof this.zindex == 'undefined') {
            this.zindex = popoverLayer.zoom(this);
        }
        var CP = this.props.component;
        var style: CSSProperties = {
            top: this.point.y,
            left: this.point.x,
            pointerEvents: 'visible'
        }
        if (this.pos?.dockRight) {
            style = {
                right: 0,
                top: this.pos.centerTop || 0,
                bottom: 0
            }
        }
        if (this.props.frame) {
            style.background = 'none';
            style.backgroundColor = 'transparent';
            style.boxShadow = 'none';
        }
        if (this.props.visible == 'hidden') {
            return <div className="shy-popover-box" ref={e => this.box = e} style={{ zIndex: this.zindex, pointerEvents: 'none', display: this.visible == true ? "block" : "none" }}>
                {this.props.mask == true && <div style={{ pointerEvents: 'visible' }} className={'shy-popover-mask' + (this.props.shadow ? " shy-popover-mask-shadow" : "")} onMouseDown={e => this.onClose(e)}></div>}
                <div style={style} className='shy-popover' ref={e => this.el = e}><CP {...this.props.args} ref={e => { this.cp = e; if (this.cp) (this.cp as any).popover = this as any }}></CP></div>
            </div>
        }
        else {
            return <div className="shy-popover-box" ref={e => this.box = e} style={{ zIndex: this.zindex, pointerEvents: 'none', display: this.visible == false ? 'none' : undefined }} >{this.visible && <>
                {this.props.mask == true && <div style={{ pointerEvents: 'visible' }} className={'shy-popover-mask' + (this.props.shadow ? " shy-popover-mask-shadow" : "")} onMouseDown={e => this.onClose(e)}></div>}
                <div style={style} className='shy-popover' ref={e => this.el = e}><CP {...this.props.args} ref={e => { { this.cp = e; if (this.cp) (this.cp as any).popover = this as any } }}></CP></div>
            </>}</div>
        }
    }
    onClose(event?: React.MouseEvent) {
        if (event) event.stopPropagation();
        this.close();
        this.emit('close');
    }
    zindex: number;
    maskZindex: number;
    close() {
        popoverLayer.clear(this);
        this.visible = false;
        if (this.props.visible == 'hidden') {
            this.box.style.display = 'none';
        }
        else this.forceUpdate();
    }
    componentDidMount() {
        document.addEventListener('mousedown', this.onGlobalMousedown, true);
        if (typeof this.props.did == 'function') this.props.did(this);
    }
    componentWillUnmount() {
        document.removeEventListener('mousedown', this.onGlobalMousedown, true);
    }
    onGlobalMousedown = (event: MouseEvent) => {
        if (this._stopMousedownClose == true) {
            this._stopMousedownClose = true;
            return;
        }
        if (this.el) {
            var target = event.target as HTMLDivElement;
            if (this.el.contains(target)) return;
            /**
             * 这说明是在弹窗点开的菜单
             */
            if (target && target.closest('.shy-menu-panel')) return;
            if (target && target.closest('.shy-popover-box') && !(this.box === target || this.box.contains(target))) return;
            this.onClose();
        }
    }
    updateLayout() {
        if (this.pos.fixPoint) return;
        var pos = this.pos;
        if (this.el) {
            var b = Rect.from(this.el.getBoundingClientRect());
            console.log('bbbb',b);
            if (pos.center == true) {
                this.point = new Point(
                    (window.innerWidth - b.width) / 2,
                    pos.centerTop ? pos.centerTop : (window.innerHeight - b.height) / 2);
                this.forceUpdate();
            }
            else if (pos.dockRight) {
                this.forceUpdate();
            }
            else if (pos.roundArea) {
                pos.elementArea = b;
                var newPoint = RectUtility.cacPopoverPosition(pos);
                if (!this.point.equal(newPoint)) {
                    this.point = newPoint;
                    this.forceUpdate();
                }
            }
        }
    }

    /***
     * 弹窗有时候会打另一个弹窗，点在空白处，两个弹窗都会关闭，这里主动设置不关闭
     */
    private _stopMousedownClose: boolean = false;
    stopMousedownClose(close?: boolean) {
        if (typeof close == 'boolean') { this._stopMousedownClose = close; return; }
        this._stopMousedownClose = true;
    }
}

type MapC<T extends React.Component> = Map<{ new(...args: any[]): T }, Popover<T>>

let maps: MapC<React.Component> = new Map();
/**
 * 
 * @param CP 
 * @param props visible:hidden 表示当前的popover是否隐藏内容，还是让内容消失重绘(visible:none)
 * @returns 
 */
export async function PopoverSingleton<T extends React.Component>(CP: { new(...args: any[]): T },
    props?: { slow?: boolean, mask?: boolean, frame?: boolean, style?: CSSProperties, visible?: 'hidden' | "none", shadow?: boolean }, args?: Record<string, any>) {
    return new Promise((resolve: (data: Popover<T>) => void, reject) => {
        if (maps.has(CP)) return resolve(maps.get(CP) as any)
        var ele = document.createElement('div');
        document.body.appendChild(ele);
        ReactDOM.render(<Popover<T> {...(props || {})} args={args || {}} component={CP} ref={e => {

            maps.set(CP, e);
            if (props?.slow !== true)
                resolve(e);
        }}
            did={(e) => {
                maps.set(CP, e);
                if (props?.slow == true) resolve(maps.get(CP) as any);
            }}
        ></Popover>, ele)

    })
}