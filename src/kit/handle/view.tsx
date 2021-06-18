import React from "react";
import ReactDOM from 'react-dom';
import { Point } from "../../common/point";
import { Icon } from "../../component/icon";
import Tooltip from "rc-tooltip";
import { Bar } from ".";
import { DropDirection } from "./direction";


export class BarView extends React.Component<{ bar: Bar }>{
    constructor(props) {
        super(props);
        this.bar.view = this;
    }
    get bar() {
        return this.props.bar;
    }
    el: HTMLElement;
    componentDidMount() {
        this.el = ReactDOM.findDOMNode(this) as HTMLElement;
        document.addEventListener('mousemove', (this.mousemove = this.onMousemove.bind(this)));
        document.addEventListener('mouseup', (this.mouseup = this.onMouseup.bind(this)));
    }
    componentWillUnmount() {
        document.removeEventListener('mousemove', this.mousemove);
        document.removeEventListener('mouseup', this.mouseup);
    }
    private point = new Point(0, 0);
    isDown: Boolean;
    isDrag: boolean = false;
    private onMousedown(event: MouseEvent) {
        this.point = Point.from(event);
        this.isDown = true;
        this.isDrag = false;
    }
    private mousemove: (event: MouseEvent) => void;
    private mouseup: (event: MouseEvent) => void;
    private async onMousemove(event: MouseEvent) {
        if (this.isDown == true) {
            if (this.point.remoteBy(Point.from(event), 5)) {
                this.isDrag = true;
                this.shipBlock();
            }
            if (this.isDrag == true) {
                this.moveDrag(event);
            }
        }
    }
    private async onMouseup(event: MouseEvent) {
        if (this.isDown == true) {
            try {
                if (this.isDrag == true) {
                    if (this.bar.dropBlock)
                        this.bar.kit.emit('dragMoveBlocks',
                            this.bar.dragBlocks,
                            this.bar.dropBlock,
                            this.bar.dropDirection)
                }
                else {
                    this.bar.kit.emit('openMenu', this.bar.dragBlocks, event)
                }
            }
            catch (ex) {
                this.bar.kit.emit('error', ex);
            }
            finally {
                this.landBlock();
                this.isDrag = false;
                this.isDown = false;
                this.bar.dropDirection = DropDirection.none;
                this.bar.dropBlock = null;
            }
        }
    }
    private dragCopyEle: HTMLElement;
    private shipBlock() {
        this.bar.dragBlocks = this.bar.kit.explorer.selectedBlocks;
        if (this.bar.dragBlocks.length > 0) {
            var dragBlocks = this.bar.dragBlocks;
            var cloneNode = dragBlocks.first().el.cloneNode(true);
            this.dragCopyEle.innerHTML = '';
            this.dragCopyEle.style.display = 'block';
            var bound = dragBlocks.first().el.getBoundingClientRect();
            this.dragCopyEle.style.width = bound.width + 'px';
            this.dragCopyEle.style.height = bound.height + 'px';
            this.dragCopyEle.appendChild(cloneNode);
        }
    }
    private moveDrag(event: MouseEvent) {
        this.dragCopyEle.style.display = 'block';
        this.dragCopyEle.style.top = event.y + 'px';
        this.dragCopyEle.style.left = event.x + 'px';
    }
    private landBlock() {
        this.dragCopyEle.style.display = 'none';
        this.dragCopyEle.innerHTML = '';
    }
    barEle: HTMLElement;
    render() {
        return <div>
            <div className='sy-selector-drag-copy' ref={e => this.dragCopyEle = e}></div>
            <div className='sy-selector-bar' ref={e => this.barEle = e} onMouseDown={e => this.onMousedown(e.nativeEvent)}>
                <Tooltip mouseEnterDelay={0.8} placement="left" trigger={['hover']}
                    overlay={<div className='sy-tooltip-content'>
                        <span><b>Drag</b> to Move</span><br />
                        <span><b>Click</b> to Open Menu</span></div>}><span>
                        <Icon icon='drag:sy' size={14}></Icon>
                    </span>
                </Tooltip>
            </div>
        </div>
    }
}