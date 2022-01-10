import React from "react";
import { Kit } from ".."
import { Block } from "../../block";
import { BoardPointType } from "../../block/partial/board";
import "./style.less";

export class BoardBlockHover extends React.Component<{ kit: Kit }>{
    visible: boolean = false;
    block: Block;
    renderBlock(block: Block) {
        var connectR = 5;
        var pickers = block.getBlockPicker();
        return <g key={block.id}>
            {pickers.map((pi, i) => {
                switch (pi.type) {
                    case BoardPointType.path:
                        return <path style={{ cursor: i == 0 || i == 2 ? "ns-resize" : "ew-resize" }} d={pi.poly.pathString()} key={i}></path>
                    case BoardPointType.connectPort:
                        return <circle className="connect" key={i} cx={pi.point.x} cy={pi.point.y} r={connectR}></circle>
                }
            })}
        </g>
    }
    render(): React.ReactNode {
        return <div className='shy-kit-board-hover'>
            {this.block && <svg className="shy-kit-board-hover-svg" style={{ zIndex: 10000 }}>
                {this.renderBlock(this.block)}
            </svg>}
        </div>
    }
}