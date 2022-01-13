import React from "react";
import { BlockPicker } from ".";
import { Line } from "../../../blocks/board/line/line";
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
    renderRotate(block: Block) {
        return <g>
            <path d="M40.1201 16C37.1747 10.0731 31.0586 6 23.9912 6C16.9237 6 10.9454 10.0731 8 16" stroke="#333" stroke-width="2"
                stroke-linecap="round" /><path
                d="M8 8V16"
                stroke-width="2"
                stroke-linecap="round" /><path
                d="M14.7803 16L8.00013 16"
                stroke-width="2"
                stroke-linecap="round" /><path
                d="M8 32C10.9454 37.9269 17.0615 42 24.129 42C31.1964 42 37.1747 37.9269 40.1201 32" stroke="#333" stroke-width="2"
                stroke-linecap="round"
            /><path d="M40.1201 40V32"
                stroke-linecap="round"
            /><path d="M33.3398 32L40.12 32"
                stroke-linecap="round" /></g>
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
                        break;
                }
            })}
            {this.renderRotate(block)}
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