import React, { CSSProperties } from "react";
import ReactDOM from "react-dom";
import { FixedViewScroll } from "../../../src/common/scroll";
import { Point, Rect } from "../../../src/common/vector/point";
import { SyncLoad } from "../../lib/sync";
import "./style.less";
export type OverlayPlacement = 'top' | 'left' | 'right' | 'bottom';
class ToolTipOverlay extends React.Component {
    constructor(props) {
        super(props);
        this.fvs.on('change', (offset: Point) => {
            if (this.visible == true && this.el)
                this.el.style.transform = `translate(${offset.x}px,${offset.y}px)`
        })
    }
    render() {
        if (this.visible !== true) return <div ref={e => this.el = e} className="shy-tooltip" style={{ display: 'none' }}></div>
        return <div className="shy-tooltip" ref={e => this.el = e} style={{ top: this.point.y, left: this.point.x }}>
            <div className={"shy-tooltip-arrow " + (this.placement)} style={this.arrowStyle} ref={e => this.arrow = e}><span><em></em></span></div>
            <div className="shy-tooltip-overlay" style={this.overlayStyle} ref={e => this.overlayEl = e}>{this.overlay}</div>
        </div>
    }
    private fvs: FixedViewScroll = new FixedViewScroll();
    arrow: HTMLElement;
    el: HTMLElement;
    tipEl: HTMLElement;
    overlayEl: HTMLElement;
    overlay: React.ReactNode;
    visible: boolean;
    point: Point = new Point(0, 0);
    mouseLeaveDelay?: number;
    placement: OverlayPlacement = 'top';
    arrowStyle?: CSSProperties = {};
    overlayStyle?: CSSProperties = {};
    open(el: HTMLElement,
        options: {
            overlay: React.ReactNode,
            placement?: OverlayPlacement,
            mouseLeaveDelay?: number;
        }) {
        this.tipEl = el;
        this.fvs.bind(this.tipEl);
        this.el.style.transform = 'none';
        this.mouseLeaveDelay = options.mouseLeaveDelay;
        this.overlay = options.overlay;
        this.placement = options.placement;
        if (!this.placement) this.placement = 'top';
        this.visible = true;
        this.forceUpdate(() => {
            this.adjustmentPosition();
        })
    }
    close() {
        this.fvs.unbind();
        if (this.leaveTime) {
            clearTimeout(this.leaveTime);
            this.leaveTime = null;
        }
        this.visible = false;
        this.forceUpdate();
    }
    adjustmentPosition() {
        if (this.visible && this.overlayEl) {
            var tipRect = Rect.fromEle(this.tipEl);
            var overlayRect = Rect.fromEle(this.overlayEl);
            var size = 16;
            this.arrowStyle = {};
            this.overlayStyle = {};
            var pc = this.placement;
            var e = this.el.querySelector('.shy-tooltip-arrow') as HTMLElement;
            if (pc == 'top') {
                if (tipRect.top - size - overlayRect.height < 30) {
                    pc = 'bottom'
                    e.classList.remove('top', 'left', 'right');
                    e.classList.add('bottom');
                }
            }
            else if (pc == 'bottom') {
                if (tipRect.bottom + size + overlayRect.height > window.innerHeight - 30) {
                    pc = 'top'
                    e.classList.remove('bottom', 'left', 'right');
                    e.classList.add('top');
                }
            }
            switch (pc) {
                case 'top':
                    this.arrowStyle.bottom = 0;
                    this.arrowStyle.width = overlayRect.width;
                    this.arrowStyle.height = size;
                    this.point.y = tipRect.top - size - overlayRect.height;
                    this.point.x = tipRect.center - overlayRect.width / 2;
                    this.overlayStyle.marginBottom = size;
                    break;
                case 'bottom':
                    this.arrowStyle.top = 0;
                    this.arrowStyle.width = overlayRect.width;
                    this.arrowStyle.height = size;
                    this.point.y = tipRect.bottom;
                    this.point.x = tipRect.center - overlayRect.width / 2;
                    this.overlayStyle.marginTop = size;
                    break;
                case 'left':
                    this.arrowStyle.right = 0;
                    this.arrowStyle.width = size;
                    this.arrowStyle.height = overlayRect.height;
                    this.point.y = tipRect.middle - overlayRect.height / 2;
                    this.point.x = tipRect.x - (overlayRect.width + size);
                    this.overlayStyle.marginRight = size;
                    break;
                case 'right':
                    this.arrowStyle.left = 0;
                    this.arrowStyle.width = size;
                    this.arrowStyle.height = overlayRect.height;
                    this.point.y = tipRect.middle - overlayRect.height / 2;
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
                    this.close();
                }, (this.mouseLeaveDelay || 0.1) * 1000);
        }
    }
}



var toolTipOverlay: ToolTipOverlay;
var sc = new SyncLoad<ToolTipOverlay>()
async function openOverlay(el: HTMLElement,
    options: {
        overlay: React.ReactNode,
        placement?: OverlayPlacement
    }) {
    toolTipOverlay = await sc.create((c) => {
        ReactDOM.render(<ToolTipOverlay ref={e => c(e)}></ToolTipOverlay>,
            document.body.appendChild(document.createElement('div'))
        );
    });
    toolTipOverlay.open(el, options);
}

export class ToolTip extends React.Component<{
    overlay?: React.ReactNode,
    children?: React.ReactNode,
    /**0.1s */
    mouseEnterDelay?: number;
    /**0.1s */
    mouseLeaveDelay?: number;
    placement?: OverlayPlacement,
    mouseenter?: (event: MouseEvent, tip: ToolTip) => void
}>{
    el: HTMLElement;
    componentDidMount() {
        if (!this.props.overlay) return;
        this.el = ReactDOM.findDOMNode(this) as HTMLElement;
        this.el.addEventListener('mouseenter', this.mouseenter);
        this.el.addEventListener('mouseleave', this.mouseleave);
        this.el.addEventListener('mousedown', this.mousedown);
        this.el.addEventListener('mouseup', this.mousedown);
    }
    componentWillUnmount() {
        if (!this.props.overlay) return;
        if (this.el) {
            this.el.removeEventListener('mouseenter', this.mouseenter);
            this.el.removeEventListener('mouseleave', this.mouseleave);
            this.el.removeEventListener('mousedown', this.mousedown);
            this.el.removeEventListener('mouseup', this.mousedown);
        }
    }
    mousedown = (event: MouseEvent) => {
        this.close();
    }
    enterTime;
    mouseenter = (event: MouseEvent) => {
        if (!this.props.overlay) return;
        if (this.enterTime) {
            clearTimeout(this.enterTime);
            this.enterTime = null;
        }
        this.enterTime = setTimeout(async () => {
            clearTimeout(this.enterTime);
            this.enterTime = null;
            if (typeof this.props.mouseenter == 'function')
                this.props.mouseenter(event, this)
            await openOverlay(this.el, { overlay: this.props.overlay, placement: this.props.placement })
        }, (this.props.mouseEnterDelay || 0.6) * 1000);
    }
    mouseleave = async (event: MouseEvent) => {
        if (!this.props.overlay) return;
        if (this.enterTime) {
            clearTimeout(this.enterTime);
            this.enterTime = null;
        }
    }
    updateView() {
        this.forceUpdate(() => {
            this.el = ReactDOM.findDOMNode(this) as HTMLElement;
            openOverlay(this.el, { overlay: this.props.overlay, placement: this.props.placement })
        })
    }
    render() {
        return this.props.children;
    }
    close() {
        if (!this.props.overlay) return;
        if (this.enterTime) {
            clearTimeout(this.enterTime);
            this.enterTime = null;
        }
        if (toolTipOverlay) {
            toolTipOverlay.close()
        }
    }
}