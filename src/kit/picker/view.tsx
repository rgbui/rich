import React from "react";
import ReactDOM, { createPortal } from "react-dom";
import { BlockPicker } from ".";
import { Block } from "../../block";
import { BoardPointType } from "../../block/partial/board";
import "./style.less";
export class BlockPickerView extends React.Component<{ picker: BlockPicker }> {
    constructor(props) {
        super(props);
        this.picker.view = this;
    }
    get picker() {
        return this.props.picker;
    }
    renderBlockRange(block: Block) {
        var r = 5;
        var connectR = 3;
        var pickers = block.getBlockPicker();
        return <g key={block.id}>
            {pickers.map((pi, i) => {
                switch (pi.type) {
                    case BoardPointType.path:
                        return <path onMouseDown={e => this.picker.onResizeBlock(block, pi.arrows, e)} style={{ cursor: i == 0 || i == 2 ? "ns-resize" : "ew-resize" }} d={pi.poly.pathString()} key={i}></path>
                        break;
                    case BoardPointType.connectPort:
                        return <circle onMouseDown={e => this.picker.onCreateBlockConnect(block, pi.arrows, e)} className="connect" key={i} cx={pi.point.x} cy={pi.point.y} r={connectR}  ></circle>
                        break;
                    case BoardPointType.resizePort:
                        return <circle
                            key={i}
                            onMouseDown={e => this.picker.onResizeBlock(block, pi.arrows, e)}
                            style={{ cursor: i == 0 || i == 2 ? 'se-resize' : 'ne-resize' }}
                            r={r} cx={pi.point.x} cy={pi.point.y}
                        ></circle>
                        break;
                }
            })}
        </g >
        // var r = 5;
        // var rect = b.rect.relative(b.rect.leftTop);
        // var rs = RectUtility.getRectLineRects(rect, 1);
        // var extendRect = rect.extend(20);
        // var centerPoints = extendRect.centerPoints;
        // var connectR = 3;
        // return <g key={b.block.id} transform={`matrix(${b.matrix.getValues().join(",")})`}>
        //     {rs.map((r, i) => {
        //         var arrow = 'top';
        //         if (i == 1) arrow = 'right';
        //         else if (i == 2) arrow = 'bottom';
        //         else if (i == 3) arrow = 'left';
        //         return <path onMouseDown={e => this.picker.onResizeBlock(b, arrow, e)} style={{ cursor: i == 0 || i == 2 ? "ns-resize" : "ew-resize" }} d={r.pathString} key={i}></path>
        //     })}
        //     <circle onMouseDown={e => this.picker.onResizeBlock(b, 'leftTop', e)} style={{ cursor: 'se-resize' }} r={r} cx={rect.leftTop.x} cy={rect.leftTop.y}></circle>
        //     <circle onMouseDown={e => this.picker.onResizeBlock(b, 'rightTop', e)} style={{ cursor: 'ne-resize' }} r={r} cx={rect.rightTop.x} cy={rect.rightTop.y}></circle>
        //     <circle onMouseDown={e => this.picker.onResizeBlock(b, 'leftBottom', e)} style={{ cursor: 'ne-resize' }} r={r} cx={rect.leftBottom.x} cy={rect.leftBottom.y}></circle>
        //     <circle onMouseDown={e => this.picker.onResizeBlock(b, 'rightBottom', e)} style={{ cursor: 'se-resize' }} r={r} cx={rect.rightBottom.x} cy={rect.rightBottom.y}></circle>
        //     {centerPoints.map((rc, i) => {
        //         var arrow = 'top';
        //         if (i == 1) arrow = 'right';
        //         else if (i == 2) arrow = 'bottom';
        //         else if (i == 3) arrow = 'left';
        //         return <circle onMouseDown={e => this.picker.onCreateBlockConnect(b, arrow, e)} className="connect" key={i} cx={rc.x} cy={rc.y} r={connectR}  ></circle>
        //     })}
        // </g>
    }
    render() {
        return <div className='shy-kit-picker'>
            {this.picker.visible && <svg className="shy-kit-picker-svg" style={{ zIndex: 10000 }}>
                {this.picker.blocks.map(block => {
                    return this.renderBlockRange(block);
                })}
            </svg>}
        </div>
    }
}