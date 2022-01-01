import React, { CSSProperties } from "react";
import { ReactNode } from "react";
import { EventsComponent } from "../../component/lib/events.component";
import TextSvg from "../../src/assert/svg/board.tool.text.svg";
import StickerSvg from "../../src/assert/svg/board.tool.sticker.svg";
import ConnectSvg from "../../src/assert/svg/connet.line.svg";
import PenSvg from "../../src/assert/svg/pen.svg";
import MeiSvg from "../../src/assert/svg/board.tool.mei.svg";
import SharpSvg from "../../src/assert/svg/board.tool.sharp.svg";
import FrameSvg from "../../src/assert/svg/board.tool.frame.svg";
import ArrowSvg from "../../src/assert/svg/board.tool.arrow.svg";
import { Point } from "../../src/common/point";
import { Singleton } from "../../component/lib/Singleton";
import "./style.less";

class BoardTool extends EventsComponent {
    render(): ReactNode {
        if (this.visible == false) return <></>;
        var style: CSSProperties = {};
        if (this.point) {
            style.top = this.point.y;
            style.left = this.point.x;
        }
        return <div className="shy-board-tool" style={style}>
            <div className="shy-board-tool-bar">
                <span><ArrowSvg /></span>
            </div>
            <div className="shy-board-tool-bar">
                <span><TextSvg /></span>
            </div>
            <div className="shy-board-tool-bar">
                <span><StickerSvg /></span>
            </div>
            <div className="shy-board-tool-bar">
                <span><SharpSvg></SharpSvg></span>
            </div>
            <div className="shy-board-tool-bar">
                <span><ConnectSvg /></span>
            </div>
            <div className="shy-board-tool-bar">
                <span><MeiSvg></MeiSvg></span>
            </div>
            <div className="shy-board-tool-bar">
                <span><FrameSvg></FrameSvg></span>
            </div>
        </div>
    }
    private point: Point;
    visible: boolean = false;
    open(point: Point) {
        this.point = point;
        this.visible = true;
        this.forceUpdate()
    }
}

export async function getBoardTool() {
    return await Singleton(BoardTool);
}
