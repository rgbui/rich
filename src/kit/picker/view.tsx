import React from "react";
import { BlockPicker } from ".";
import { Line } from "../../../blocks/board/line/line";
import { RotatingSvg } from "../../../component/svgs";
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
        var pickers = block.getBlockBoardSelector([BoardPointType.path, BoardPointType.movePort, BoardPointType.connectPort, BoardPointType.resizePort]);
        return <g key={block.id}>
            {pickers.map((pi, i) => {
                switch (pi.type) {
                    case BoardPointType.path:
                        return <path onMouseDown={e => this.picker.onResizeBlock(block, pi.arrows, e)} style={{ cursor: i == 0 || i == 2 ? "ns-resize" : "ew-resize" }} d={pi.poly.pathString()} key={i}></path>
                    case BoardPointType.movePort:
                        return <circle onMouseDown={e => this.picker.onMovePortBlock(block as Line, pi.arrows, e)} className="move-port" key={i} cx={pi.point.x} cy={pi.point.y} r={r}   ></circle>
                    case BoardPointType.connectPort:
                        return <circle onMouseDown={e => this.picker.onCreateBlockConnect(block, pi.arrows, e)} className="connect" key={i} cx={pi.point.x} cy={pi.point.y} r={connectR}  ></circle>
                    case BoardPointType.resizePort:
                        return <circle
                            key={i}
                            onMouseDown={e => this.picker.onResizeBlock(block, pi.arrows, e)}
                            style={{ cursor: i == 0 || i == 2 ? 'ne-resize' : 'se-resize' }}
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