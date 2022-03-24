import React from "react";
import { BlockPicker } from ".";
import { Line } from "../../../blocks/board/line/line";
import { PlusSvg, RotatingSvg } from "../../../component/svgs";
import { Block } from "../../block";
import { BoardPointType } from "../../block/partial/board";
import { PointArrow } from "../../common/vector/point";
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
        var pickers = block.getBlockBoardSelector([BoardPointType.path, BoardPointType.movePort, BoardPointType.connectPort, BoardPointType.resizePort]);
        return <g key={block.id}>
            {pickers.map((pi, i) => {
                switch (pi.type) {
                    case BoardPointType.path:
                        var cursor = 'n-resize';
                        if (pi.arrows.includes(PointArrow.right)) cursor = 'e-resize';
                        else if (pi.arrows.includes(PointArrow.bottom)) cursor = 's-resize';
                        else if (pi.arrows.includes(PointArrow.left)) cursor = 'w-resize';
                        return <path onMouseDown={e => this.picker.onResizeBlock(block, pi.arrows, e)}
                            style={{ cursor: cursor }}
                            d={pi.poly.pathString()} key={i}></path>
                    case BoardPointType.movePort:
                        return <circle onMouseDown={e => this.picker.onMovePortBlock(block as Line, pi.arrows, e)} className="move-port" key={i} cx={pi.point.x} cy={pi.point.y} r={r}   ></circle>
                    case BoardPointType.connectPort:
                        return <circle onMouseDown={e => this.picker.onCreateBlockConnect(block, pi.arrows, e)} className="connect" key={i} cx={pi.point.x} cy={pi.point.y} r={connectR}  ></circle>
                    case BoardPointType.resizePort:
                        var cursor = 'ne-resize';
                        if (pi.arrows.includes(PointArrow.top) && pi.arrows.includes(PointArrow.right)) cursor = 'ne-resize'
                        else if (pi.arrows.includes(PointArrow.top) && pi.arrows.includes(PointArrow.left)) cursor = 'nw-resize'
                        else if (pi.arrows.includes(PointArrow.bottom) && pi.arrows.includes(PointArrow.left)) cursor = 'sw-resize'
                        else if (pi.arrows.includes(PointArrow.bottom) && pi.arrows.includes(PointArrow.right)) cursor = 'se-resize'
                        return <circle
                            key={i}
                            onMouseDown={e => this.picker.onResizeBlock(block, pi.arrows, e)}
                            style={{ cursor: cursor }}
                            r={r} cx={pi.point.x} cy={pi.point.y}
                        ></circle>
                        break;
                    case BoardPointType.rotatePort:
                        return <foreignObject key={i}
                            width={20}
                            height={20}
                            onMouseDown={e => this.picker.onRotateBlock(block, pi, e)} x={pi.point.x} y={pi.point.y}>
                            <RotatingSvg></RotatingSvg>
                        </foreignObject>
                        break;
                    case BoardPointType.mindAdd:
                        return <foreignObject key={i}
                            width={20}
                            height={20}
                            onMouseDown={e => this.picker.onPickerMousedown(block, pi, e)}
                            x={pi.point.x - 10}
                            y={pi.point.y - 10}>
                            <PlusSvg></PlusSvg>
                        </foreignObject>
                        break;
                }
            })}
        </g>
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