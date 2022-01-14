import React from "react";
import { Kit } from ".."
import { Block } from "../../block";
import { BoardBlockSelector, BoardPointType } from "../../block/partial/board";
import "./style.less";

export class BoardBlockHover extends React.Component<{ kit: Kit }>{
    visible: boolean = false;
    block: Block;
    enter(selector: BoardBlockSelector, event: React.MouseEvent) {
        this.props.kit.boardLine.over = { block: this.block, selector, event };
    }
    leave(selector: BoardBlockSelector, event: React.MouseEvent) {
        this.props.kit.boardLine.over = null;
    }
    renderBlock(block: Block) {
        var connectR = 5;
        var pickers = block.getBlockBoardSelector([BoardPointType.path, BoardPointType.pathConnectPort]);
        return <g key={block.id}>
            {pickers.map((pi, i) => {
                switch (pi.type) {
                    case BoardPointType.path:
                        return <path
                            // onMouseEnter={e => this.enter(pi, e)}
                            style={{ cursor: i == 0 || i == 2 ? "ns-resize" : "ew-resize" }}
                            d={pi.poly.pathString()} key={i}></path>
                    case BoardPointType.pathConnectPort:
                        return <circle
                            onMouseEnter={e => this.enter(pi, e)}
                            className="connect"
                            key={i} cx={pi.point.x}
                            cy={pi.point.y}
                            r={connectR}></circle>
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