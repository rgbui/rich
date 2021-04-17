import React from "react";
import ReactDOM from 'react-dom';
import { Block } from "../../block/base";
import { Point } from "../../common/point";
import { Icon } from "../../component/icon";
import { SelectorView } from "./render";

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
    private x: number;
    private y: number;
    private isDown: Boolean;
    private onMousedown(event: MouseEvent) {
        this.x = event.x;
        this.y = event.y;
        this.isDown = true;
        this.selector.isDrag = false;
    }
    private mousemove: (event: MouseEvent) => void;
    private mouseup: (event: MouseEvent) => void;
    private async onMousemove(event: MouseEvent) {
        if (this.isDown) {
            if (Math.abs(event.x - this.x) > 5 || Math.abs(event.y - this.y) > 5) {
                if (this.selector.isDrag != true) {
                    this.selector.isDrag = true;
                    var cloneNode = this.dragBlock.el.cloneNode(true);
                    this.dragCopyEle.innerHTML = '';
                    this.dragCopyEle.style.display = 'block';
                    var bound = this.dragBlock.el.getBoundingClientRect();
                    this.dragCopyEle.style.width = bound.width + 'px';
                    this.dragCopyEle.style.height = bound.height + 'px';
                    this.dragCopyEle.appendChild(cloneNode);
                }
                else if (this.selector.isDrag) {
                    this.dragCopyEle.style.top = event.y + 'px';
                    this.dragCopyEle.style.left = event.x + 'px';
                }
            }
        }
    }
    private async onMouseup(event: MouseEvent) {
        if (this.isDown) {
            this.isDown = false;
            this.x = 0;
            this.y = 0;
            if (this.selector.isDrag == true) {
                if (this.selector.overBlock && this.selector.overBlock.dropBlock) {
                    var dropBlock = this.selector.overBlock.dropBlock;
                    var cls = Array.from(dropBlock.el.classList);
                    var cl = cls.find(g => g.startsWith('sy-block-drag-over'));
                    if (cl) {
                        cl = cl.replace('sy-block-drag-over-', '');
                        console.log(cl);
                        await this.selector.onMoveBlock(this.dragBlock, dropBlock, cl as any);
                    }
                    dropBlock.onDragLeave();
                }
                this.selector.isDrag = false;
            }
            else {
                this.selector.openMenu(event);
            }
            this.dragCopyEle.style.display = 'none';
            this.dragCopyEle.innerHTML = '';
            delete this.dragBlock;
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
                <Icon icon='drag:sy'></Icon>
            </div>
        </div>
    }
}