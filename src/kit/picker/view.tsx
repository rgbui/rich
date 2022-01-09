import React from "react";
import ReactDOM, { createPortal } from "react-dom";
import { BlockPicker } from ".";
import { Block } from "../../block";
import { Matrix } from "../../common/matrix";
import { Rect, RectUtility } from "../../common/point";
import "./style.less";
export class BlockPickerView extends React.Component<{ picker: BlockPicker }> {
    constructor(props) {
        super(props);
        this.node = document.body.appendChild(document.createElement('div'));
        this.picker.view = this;
    }
    private node: HTMLElement;
    get picker() {
        return this.props.picker;
    }
    componentWillUnmount() {
        if (this.node) this.node.remove()
    }
    el: HTMLElement;
    componentDidMount() {
        this.el = ReactDOM.findDOMNode(this) as HTMLElement;
    }
    renderBlockRange(b: { block: Block, rect: Rect, matrix: Matrix; }) {
        var r = 5;
        var rect = b.rect.relative(b.rect.leftTop);
        var rs = RectUtility.getRectLineRects(rect, 1);
        var extendRect = rect.extend(20);
        var centerPoints = extendRect.centerPoints;
        var connectR = 3;
        return <g key={b.block.id} transform={`matrix(${b.matrix.getValues().join(",")})`}>
            {rs.map((r, i) => {
                var arrow = 'top';
                if (i == 1) arrow = 'right';
                else if (i == 2) arrow = 'bottom';
                else if (i == 3) arrow = 'left';
                return <path onMouseDown={e => this.picker.onResizeBlock(b, arrow, e)} style={{ cursor: i == 0 || i == 2 ? "ns-resize" : "ew-resize" }} d={r.pathString} key={i}></path>
            })}
            <circle onMouseDown={e => this.picker.onResizeBlock(b, 'leftTop', e)} style={{ cursor: 'se-resize' }} r={r} cx={rect.leftTop.x} cy={rect.leftTop.y}></circle>
            <circle onMouseDown={e => this.picker.onResizeBlock(b, 'rightTop', e)} style={{ cursor: 'ne-resize' }} r={r} cx={rect.rightTop.x} cy={rect.rightTop.y}></circle>
            <circle onMouseDown={e => this.picker.onResizeBlock(b, 'leftBottom', e)} style={{ cursor: 'ne-resize' }} r={r} cx={rect.leftBottom.x} cy={rect.leftBottom.y}></circle>
            <circle onMouseDown={e => this.picker.onResizeBlock(b, 'rightBottom', e)} style={{ cursor: 'se-resize' }} r={r} cx={rect.rightBottom.x} cy={rect.rightBottom.y}></circle>
            {centerPoints.map((rc, i) => {
                var arrow = 'top';
                if (i == 1) arrow = 'right';
                else if (i == 2) arrow = 'bottom';
                else if (i == 3) arrow = 'left';
                return <circle onMouseDown={e => this.picker.onCreateBlockConnect(b, arrow, e)} className="connect" key={i} cx={rc.x} cy={rc.y} r={connectR}  ></circle>
            })}
        </g>
    }
    render() {
        return createPortal(<div className='shy-kit-picker'>
            {this.picker.visible && <svg className="shy-kit-picker-svg" style={{ zIndex: 10000 }}>
                {this.picker.blockRanges.map(range => {
                    return this.renderBlockRange(range);
                })}
            </svg>}
        </div>, this.node)
    }
}