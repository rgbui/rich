import React, { CSSProperties } from "react";
import ReactDOM from "react-dom";
import { FixedViewScroll } from "../../../src/common/scroll";
import { Point, Rect } from "../../../src/common/vector/point";
import { SyncLoad } from "../../lib/sync";
import "./style.less";
import { dom } from "../../../src/common/dom";
export type OverlayPlacement = 'top' | 'left' | 'right' | 'bottom';

export class ToolTipOverlay extends React.Component {
    constructor(props) {
        super(props);
        this.fvs.on('change', (offset: Point) => {
            if (this.panel) return;
            if (this.visible == true && this.el)
                this.el.style.transform = `translate(${offset.x}px,${offset.y}px)`
        })
    }
    render() {
      
        if (this.visible !== true) return <div ref={e => this.el = e} className="shy-box-tip" style={{ display: 'none', ...this.boxStyle }}></div>
        var ov = typeof this.overlay == 'function' ? this.overlay() : this.overlay;
        return <div className="shy-box-tip" ref={e => this.el = e} style={{
            top: this.point.y,
            left: this.point.x, ...this.boxStyle,
            zIndex: this.zindex ? this.zindex.toString() : undefined
        }}>
            <div className="shy-box-tip-overlay" style={this.overlayStyle} ref={e => this.overlayEl = e}>{ov}</div>
        </div>
    }
    private fvs: FixedViewScroll = new FixedViewScroll();
    arrow: HTMLElement;
    el: HTMLElement;
    tipEl: HTMLElement;
    overlayEl: HTMLElement;
    overlay: React.ReactNode | (() => React.ReactNode);
    visible: boolean;
    point: Point = new Point(0, 0);
    mouseLeaveDelay?: number;
    placement: OverlayPlacement;
    overlayStyle?: CSSProperties = {};
    boxStyle?: CSSProperties = {};
    disabledAutoClose = false;
    align: 'left' | 'right' | 'center' = 'center';
    close: () => void;
    zindex: number;
    panel?: HTMLElement;
    open(el: HTMLElement,
        options: {
            overlay: React.ReactNode | (() => React.ReactNode),
            panel?: HTMLElement,
            placement?: OverlayPlacement,
            mouseLeaveDelay?: number,
            disabledAutoClose?: boolean,
            boxStyle?: CSSProperties,
            align?: 'left' | 'right' | 'center',
            close?: () => void,
            zindex?: number
        }) {
        this.tipEl = el;
        this.fvs.bind(this.tipEl);
        this.close = options?.close || undefined;
        this.el.style.transform = 'none';
        this.align = options?.align || 'center';
        this.mouseLeaveDelay = options.mouseLeaveDelay;
        this.overlay = options.overlay;
        this.panel = options.panel;
        this.placement = options.placement;
        this.boxStyle = options.boxStyle || {};
        this.disabledAutoClose = typeof options?.disabledAutoClose == 'boolean' ? options.disabledAutoClose : false;
        this.visible = true;
        this.zindex = options.zindex || undefined
        this.forceUpdate(() => {
            this.adjustmentPosition();
        })
    }
    onClose() {
        this.fvs.unbind();
        if (this.leaveTime) {
            clearTimeout(this.leaveTime);
            this.leaveTime = null;
        }
        this.visible = false;
        if (this.close) this.close();
        this.forceUpdate();
    }
    adjustmentPosition() {
        if (this.visible && this.overlayEl) {
            var tipRect = Rect.fromEle(this.tipEl);
            var overlayRect = Rect.fromEle(this.overlayEl);
            var windowRect = Rect.fromWindow();
            if (this.panel) {
                var r = dom(this.panel).closest(x => dom(x).style('position') == 'absolute');
                if (r) {
                    var rt = Rect.fromEle(r as HTMLElement);
                    rt.move(0, 0 - (r as HTMLElement).scrollTop);
                    console.log(rt, tipRect, r);
                    tipRect.moveTo(tipRect.x - rt.x, tipRect.y - rt.y);
                    windowRect.moveTo(windowRect.x - rt.x, windowRect.y - rt.y);
                    overlayRect.moveTo(overlayRect.x - rt.x, overlayRect.y - rt.y);
                }
            }
            var size = 10;
            this.overlayStyle = {};
            var place = this.placement;
            if (!place) {
                if (tipRect.top - overlayRect.height - size < windowRect.top) place = 'bottom'
                else if (tipRect.bottom + overlayRect.height + size > windowRect.bottom) place = 'top'
                else place = 'bottom'
            }
            switch (place) {
                case 'top':
                    this.point.y = tipRect.top - size - overlayRect.height;
                    if (this.align == 'center') this.point.x = tipRect.center - overlayRect.width / 2;
                    else if (this.align == 'left') this.point.x = tipRect.x;
                    else if (this.align == 'right') this.point.x = tipRect.right - overlayRect.width;
                    if (this.point.x < windowRect.left) this.point.x = 20;
                    else if (this.point.x + overlayRect.width > windowRect.right) this.point.x = windowRect.right - overlayRect.width - 20;
                    this.overlayStyle.marginBottom = size;
                    break;
                case 'bottom':
                    this.point.y = tipRect.bottom;
                    if (this.align == 'center') this.point.x = tipRect.center - overlayRect.width / 2;
                    else if (this.align == 'left') this.point.x = tipRect.x;
                    else if (this.align == 'right') this.point.x = tipRect.right - overlayRect.width;
                    if (this.point.x < windowRect.left) this.point.x = 20;
                    else if (this.point.x + overlayRect.width > windowRect.right) this.point.x = windowRect.right - overlayRect.width - 20;
                    this.overlayStyle.marginTop = size;
                    break;
                case 'left':
                    if (this.align == 'center') this.point.y = tipRect.middle - overlayRect.height / 2;
                    else if (this.align == 'left') this.point.y = tipRect.y;
                    else if (this.align == 'right') this.point.y = tipRect.bottom - overlayRect.height;
                    this.point.x = tipRect.x - (overlayRect.width + size);
                    this.overlayStyle.marginRight = size;
                    break;
                case 'right':
                    if (this.align == 'center')
                        this.point.y = tipRect.middle - overlayRect.height / 2;
                    else if (this.align == 'left')
                        this.point.y = tipRect.y;
                    else if (this.align == 'right')
                        this.point.y = tipRect.bottom - overlayRect.height;
                    this.point.x = tipRect.right;
                    this.overlayStyle.marginLeft = size;
                    break;
            }
            this.forceUpdate();
        }
    }
    componentDidMount() {
        document.addEventListener('mousemove', this.mousemove)
    }
    componentWillUnmount() {
        document.removeEventListener('mousemove', this.mousemove)
    }
    leaveTime;
    mousemove = (event: MouseEvent) => {
        if (this.visible == true) {
            if (this.disabledAutoClose == true) return;
            var e = event.target as HTMLElement;
            if (this.el && this.tipEl) {
                if (this.el.contains(e) || this.tipEl.contains(e)) {
                    return;
                }
            }
            if (!this.leaveTime)
                this.leaveTime = setTimeout(() => {
                    clearTimeout(this.leaveTime);
                    this.leaveTime = null;
                    this.onClose();
                }, (this.mouseLeaveDelay || 0.1) * 1000);
        }
    }
}



var toolTipOverlay: ToolTipOverlay;
var sc = new SyncLoad<ToolTipOverlay>()
async function openOverlay(el: HTMLElement,
    options: {
        overlay: React.ReactNode,
        placement?: OverlayPlacement,
        disabledAutoClose?: boolean,
        boxStyle?: CSSProperties,
        align?: 'left' | 'right' | 'center',
        close?: () => void;
    }) {
    toolTipOverlay = await sc.create((c) => {
        ReactDOM.render(<ToolTipOverlay ref={e => c(e)}></ToolTipOverlay>,
            document.body.appendChild(document.createElement('div'))
        );
    });
    toolTipOverlay.open(el, options);
}

export class BoxTip extends React.Component<{
    disabled?: boolean,
    overlay?: React.ReactNode,
    children?: React.ReactNode,
    /**0.1s */
    mouseEnterDelay?: number;
    /**0.1s */
    mouseLeaveDelay?: number;
    placement?: OverlayPlacement,

    boxStyle?: CSSProperties,
    /**
     * 支持鼠标点击时打开
     */
    mousedownOpen?: boolean,
    /**
     * 禁用鼠标按下关闭
     */
    disableMousedownClose?: boolean,
    /**
     * 禁用鼠标进入时自动打开
     * 禁用鼠标离开时自动关闭
     */
    disabledMouseEnterOrLeave?: boolean,
    onVisible?: (el: HTMLElement) => void,
    onClose?: (el: HTMLElement) => void,
    onMouseEnter?: (el: HTMLElement) => void,
    onMouseLeave?: (el: HTMLElement) => void,
    cacOverEle?: (el: HTMLElement) => HTMLElement,
    align?: 'left' | 'right' | 'center',
}>{
    el: HTMLElement;
    componentDidMount() {
        if (!this.props.overlay) return;
        if (this.props.disabled) return;
        this.el = ReactDOM.findDOMNode(this) as HTMLElement;
        this.el.addEventListener('mouseenter', this.mouseenter);
        this.el.addEventListener('mouseleave', this.mouseleave);
        this.el.addEventListener('mousedown', this.mousedown);
        this.el.addEventListener('mouseup', this.mousedown);
    }
    componentWillUnmount() {
        if (!this.props.overlay) return;
        if (this.props.disabled) return;
        if (this.el) {
            this.el.removeEventListener('mouseenter', this.mouseenter);
            this.el.removeEventListener('mouseleave', this.mouseleave);
            this.el.removeEventListener('mousedown', this.mousedown);
            this.el.removeEventListener('mouseup', this.mousedown);
        }
    }
    mousedown = (event: MouseEvent) => {
        if (this.props.mousedownOpen == true) {
            this.open()
            return;
        }
        if (this.props.disableMousedownClose == true) return;
        this.close();
    }
    enterTime;
    mouseenter = (event: MouseEvent) => {
        if (this.props.disabledMouseEnterOrLeave == true) return;
        if (!this.props.overlay) return;
        if (this.props.disabled) return;
        if (this.props.onMouseEnter) {
            this.props.onMouseEnter(this.el);
        }
        if (this.enterTime) {
            clearTimeout(this.enterTime);
            this.enterTime = null;
        }
        this.enterTime = setTimeout(async () => {
            this.open()
        }, (this.props.mouseEnterDelay || 0.6) * 1000);
    }

    mouseleave = async (event: MouseEvent) => {
        if (this.props.disabledMouseEnterOrLeave == true) return;
        if (!this.props.overlay) return;
        if (this.props.disabled) return;
        if (this.props.onMouseLeave) {
            this.props.onMouseLeave(this.el);
        }
        if (this.enterTime) {
            clearTimeout(this.enterTime);
            this.enterTime = null;
        }
    }
    render() {
        return this.props.children;
    }
    /**
     * 表示toolTipOverlay相对于当前元素是否可见
     * toolTipOverlay只有一个实例，而currentVisible是针对当前元素的
     */
    currentVisible = false;
    async open() {
        clearTimeout(this.enterTime);
        this.enterTime = null;
        var el = this.el;
        if (this.props.cacOverEle) el = this.props.cacOverEle(el);
        this.currentVisible = true;
        var self = this;
        if (this.props.onVisible) {
            this.props.onVisible(this.el);
        }
        await openOverlay(el, {
            overlay: this.props.overlay,
            placement: this.props.placement,
            disabledAutoClose: this.props.disabledMouseEnterOrLeave == true ? true : false,
            boxStyle: this.props.boxStyle,
            align: this.props.align,
            close() {
                self.currentVisible = false;
                if (self.props.onClose) self.props.onClose(self.el);
            }
        })
    }
    async toggle() {
        if (toolTipOverlay?.visible) {
            this.close()
        }
        else {
            this.open()
        }
    }
    close() {
        if (!this.props.overlay) return;
        if (this.props.disabled) return;
        if (this.enterTime) {
            clearTimeout(this.enterTime);
            this.enterTime = null;
        }
        if (!toolTipOverlay) return;
        if (toolTipOverlay?.visible == false) return;
        if (this.currentVisible == true && toolTipOverlay) {
            toolTipOverlay.onClose()
        }
        if (this.currentVisible == true && this.props.onClose) {
            this.props.onClose(this.el);
        }
        this.currentVisible = false;
    }
}