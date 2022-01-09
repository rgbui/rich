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
                            style={{ cursor: i == 0 || i == 2 ? 'ne-resize' : 'se-resize' }}
                            r={r} cx={pi.point.x} cy={pi.point.y}
                        ></circle>
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