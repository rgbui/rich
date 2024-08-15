import React, { CSSProperties } from "react";
import { Kit } from ".."
import { Block } from "../../block";
import { BoardBlockSelector, BoardPointType } from "../../block/partial/board";
import "./style.less";
import { Rect } from "../../common/vector/point";

export class BoardBlockHover extends React.Component<{ kit: Kit }> {
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
                            onMouseLeave={e => this.leave(pi, e)}
                            className="connect"
                            key={i} cx={pi.point.x}
                            cy={pi.point.y}
                            r={connectR}></circle>
                }
            })}
        </g>
    }
    render(): React.ReactNode {
        var style: CSSProperties = {
            zIndex: 10000,
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            width: '100vw',
            height: '100vh'
        }
        var viewBox
        var b = this.block;
        if (b?.page && !b.page.isBoard) {
            var bb = this.props.kit.boardSelector.boardBlock;
            if(!bb)bb=b.closest(x=>x.isBoardBlock && !x.isFrame);
            if (bb) {
                var fb = bb.getVisibleContentBound();
                delete style.bottom;
                delete style.right;
                var rc = Rect.fromEle(b.page.contentEl);
                style.width = fb.width + 'px';
                style.height = fb.height + 'px';
                style.top = fb.top - rc.top + 'px';
                style.left = fb.left - rc.left + 'px';
                viewBox = `${fb.left - rc.left} ${fb.top - rc.top} ${fb.width} ${fb.height}`;
            }
        }
        return <div className='shy-kit-board-hover'>
            {this.block && <svg className="shy-kit-board-hover-svg" viewBox={viewBox ?? undefined} style={style}>
                {this.renderBlock(this.block)}
            </svg>}
        </div>
    }
}