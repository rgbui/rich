import React from "react";
import ReactDOM from 'react-dom';
import { Block } from "../../block";
import { Point } from "../../common/point";
import { Icon } from "../../component/icon";
import { SelectorView } from "./render";
import Tooltip from "rc-tooltip";

export class Bar extends React.Component<{ selectorView: SelectorView }>{
    constructor(props) {
        super(props);
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
    get selector() {
        return this.props.selectorView.selector;
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
        if (this.isDown) {
            var curentPoint = Point.from(event);
            if (this.point.remoteBy(curentPoint, 5)) {
                if (this.isDrag != true) {
                    this.isDrag = true;
                    var cloneNode = this.dragBlock.el.cloneNode(true);
                    this.dragCopyEle.innerHTML = '';
                    this.dragCopyEle.style.display = 'block';
                    var bound = this.dragBlock.el.getBoundingClientRect();
                    this.dragCopyEle.style.width = bound.width + 'px';
                    this.dragCopyEle.style.height = bound.height + 'px';
                    this.dragCopyEle.appendChild(cloneNode);
                }
                else if (this.isDrag) {
                    this.dragCopyEle.style.top = event.y + 'px';
                    this.dragCopyEle.style.left = event.x + 'px';
                }
            }
        }
    }
    private async onMouseup(event: MouseEvent) {
        if (this.isDown) {
            this.isDown = false;
            this.point = new Point(0, 0);
            if (this.isDrag == true) {
                try {
                    if (this.selector.dropBlock) this.selector.dropBlock.onDragLeave();
                    if (this.selector.dropBlock && this.selector.dropArrow) {
                        await this.selector.onMoveBlock(this.dragBlock, this.selector.dropBlock, this.selector.dropArrow as any);
                    }
                }
                catch (ex) {
                    this.selector.page.onError(ex);
                }
                finally {
                    this.dragCopyEle.style.display = 'none';
                    this.dragCopyEle.innerHTML = '';
                    this.isDrag = false;
                    delete this.selector.dropBlock;
                    delete this.selector.dropArrow;
                    delete this.dragBlock;
                }
            }
            else {
                this.selector.openMenu(event);
            }
        }
    }
    hide() {
        this.barEle.style.display = 'none';
    }
    dragBlock: Block;
    onStart(dragBlock: Block) {
        this.dragBlock = dragBlock;
        var bound = dragBlock.getVisibleBound();
        var pos = this.selector.relativePageOffset(Point.from(bound));
        this.barEle.style.top = pos.y + 'px';
        this.barEle.style.left = pos.x + 'px';
        this.barEle.style.display = 'flex';
    }
    private dragCopyEle: HTMLElement;
    private barEle: HTMLElement;
    render() {
        return <div>
            <div className='sy-selector-drag-copy' ref={e => this.dragCopyEle = e}></div>
            <div className='sy-selector-bar' ref={e => this.barEle = e} onMouseDown={e => this.onMousedown(e.nativeEvent)}>
                <Tooltip placement="left" trigger={['hover']}
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