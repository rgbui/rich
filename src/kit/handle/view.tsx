import React from "react";
import ReactDOM from 'react-dom';
import { Point } from "../../common/point";
import { Icon } from "../../../component/view/icon";
import { Handle } from ".";
import { DropDirection } from "./direction";
import { Tip } from "../../../component/view/tip";
import { LangID } from "../../../i18n/declare";
import DragHandle from "../../assert/svg/DragHandle.svg";

export class HandleView extends React.Component<{ handle: Handle }>{
    constructor(props) {
        super(props);
        this.handle.view = this;
    }
    get handle() {
        return this.props.handle;
    }
    el: HTMLElement;
    componentDidMount() {
        this.el = ReactDOM.findDOMNode(this) as HTMLElement;
        document.addEventListener('mousemove', this.onMousemove);
        document.addEventListener('mouseup', this.onMouseup);
    }
    componentWillUnmount() {
        document.removeEventListener('mousemove', this.onMousemove);
        document.removeEventListener('mouseup', this.onMouseup);
    }
    private point = new Point(0, 0);
    isDown: Boolean;
    isDrag: boolean = false;
    private onMousedown(event: MouseEvent) {
        if (this.toolTip) this.toolTip.close();
        this.point = Point.from(event);
        this.isDown = true;
        this.isDrag = false;
        this.shipBlock();
    }
    private onMousemove = async (event: MouseEvent) => {
        if (this.isDown == true) {
            if (!this.isDrag && this.point.remoteBy(Point.from(event), 5)) {
                this.isDrag = true;
                this.shipMoveBlock();
            }
            if (this.isDrag == true) {
                this.moveDrag(event);
            }
        }
    }
    private onMouseup = async (event: MouseEvent) => {
        if (this.isDown == true) {
            try {
                if (this.isDrag == true) this.handle.onDropBlock()
                else this.handle.onClickBlock(event);
            }
            catch (ex) {
                this.handle.kit.emit('error', ex);
            }
            finally {
                this.landBlock();
                this.handle.onDropEnd();
                this.isDrag = false;
                this.isDown = false;
                this.handle.dropDirection = DropDirection.none;
                this.handle.dropBlock = null;
            }
        }
    }
    private dragCopyEle: HTMLElement;
    private shipBlock() {
        if (this.handle.kit.explorer.hasSelectionRange && this.handle.handleBlock && this.handle.kit.explorer.selectedBlocks.exists(c => c.find(g => g == this.handle.handleBlock, true) ? true : false)) {
            this.handle.dragBlocks = this.handle.kit.explorer.selectedBlocks.map(c => c);
        }
        else this.handle.dragBlocks = [this.handle.handleBlock]
    }
    private shipMoveBlock() {
        if (this.handle.dragBlocks.length > 0) {
            var dragBlocks = this.handle.dragBlocks;
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
    handleEle: HTMLElement;
    toolTip: Tip;
    render() {
        return <div>
            <div className='sy-selector-drag-copy' ref={e => this.dragCopyEle = e}></div>
            <div className='sy-selector-bar'
                ref={e => this.handleEle = e}
                onMouseDown={e => this.onMousedown(e.nativeEvent)}>
                <Tip placement='left' ref={e => { this.toolTip = e; }} id={LangID.bar} >
                    <span>
                        <Icon icon={DragHandle} size={14}></Icon>
                    </span>
                </Tip>
            </div>
        </div>
    }
}