import React, { CSSProperties } from "react";
import { OverlayPlacement } from ".";
import ReactDOM from "react-dom";
import { SyncLoad } from "../../lib/sync";
import { ToolTipOverlay } from "./box";

var sc = new SyncLoad<ToolTipOverlay>()
var ms = new Map<HTMLElement, ToolTipOverlay>();
async function openOverlay(el: HTMLElement,
    options: {
        panel: HTMLElement,
        overlay: React.ReactNode,
        placement?: OverlayPlacement,
        disabledAutoClose?: boolean,
        boxStyle?: CSSProperties,
        align?: 'left' | 'right' | 'center',
        close?: () => void;
        zindex?:number
    }) {
    var toolTipOverlay = await sc.create((c) => {
        var t = ms.get(options.panel);
        if (t) return c(t)
        else {
            ReactDOM.render(<ToolTipOverlay ref={e => {
                ms.set(options.panel, e);
                c(e)
            }}></ToolTipOverlay>,
                options.panel.appendChild(document.createElement('div'))
            );
        }
    });
    toolTipOverlay.open(el, options);
    return toolTipOverlay
}

export class FixBoxTip extends React.Component<{
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
    panel?: HTMLElement;
    cacPanel?: () => HTMLElement,
    align?: 'left' | 'right' | 'center',
    zindex?:number
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
        var panel = this.props.panel;
        if (typeof this.props.cacPanel == 'function') panel = this.props.cacPanel();
        this.toolTipOverlay = await openOverlay(el,{
            panel,
            overlay: this.props.overlay,
            placement: this.props.placement,
            disabledAutoClose: this.props.disabledMouseEnterOrLeave == true ? true : false,
            boxStyle: this.props.boxStyle,
            align: this.props.align,
            zindex:this.props.zindex,
            close() {
                self.currentVisible = false;
                if (self.props.onClose) self.props.onClose(self.el);
            }
        })
    }
    toolTipOverlay: ToolTipOverlay;
    async toggle() {
        if (this.toolTipOverlay?.visible) {
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
        if (!this.toolTipOverlay) return;
        if (this.toolTipOverlay?.visible == false) return;
        if (this.currentVisible == true && this.toolTipOverlay) {
            this.toolTipOverlay.onClose()
        }
        if (this.currentVisible == true && this.props.onClose) {
            this.props.onClose(this.el);
        }
        this.currentVisible = false;
    }
}