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
import { BoardToolOperator } from "./declare";

class BoardTool extends EventsComponent {
    render(): ReactNode {
        if (this.visible == false) return <></>;
        var style: CSSProperties = {};
        if (this.point) {
            style.top = this.point.y;
            style.left = this.point.x;
        }
        return <div className="shy-board-tool" style={style}>
            <div className="shy-board-tool-bar"
                onMouseDown={e => this.selector(BoardToolOperator.arrow, e)}>
                <span><ArrowSvg /></span>
            </div>
            <div className="shy-board-tool-bar"
                onMouseDown={e => this.selector(BoardToolOperator.text, e)}>
                <span><TextSvg /></span>
            </div>
            <div className="shy-board-tool-bar"
                onMouseDown={e => this.selector(BoardToolOperator.note, e)}>
                <span><StickerSvg /></span>
            </div>
            <div className="shy-board-tool-bar"
                onMouseDown={e => this.selector(BoardToolOperator.shape, e)}>
                <span><SharpSvg></SharpSvg></span>
            </div>
            <div className="shy-board-tool-bar"
                onMouseDown={e => this.selector(BoardToolOperator.connect, e)}>
                <span><ConnectSvg /></span>
            </div>
            <div className="shy-board-tool-bar"
                onMouseDown={e => this.selector(BoardToolOperator.pen, e)}>
                <span><MeiSvg></MeiSvg></span>
            </div>
            <div className="shy-board-tool-bar"
                onMouseDown={e => this.selector(BoardToolOperator.frame, e)}>
                <span><FrameSvg></FrameSvg></span>
            </div>
        </div>
    }
    currentSelector: { operator: BoardToolOperator, event: React.MouseEvent }
    get isSelector() {
        if (this.currentSelector) return true;
        else return false;
    }
    selector(operator: BoardToolOperator, event: React.MouseEvent) {
        if (operator == BoardToolOperator.arrow) this.currentSelector = null;
        else this.currentSelector = { operator, event };
        this.emit('selector', this.currentSelector);
    }
    private point: Point;
    visible: boolean = false;
    open(point: Point) {
        this.point = point;
        this.visible = true;
        this.forceUpdate()
    }
}
interface BoardTool {
    emit(name: 'selector', data: BoardTool['currentSelector']);
    only(name: 'selector', fn: (data: BoardTool['currentSelector']) => void)
}

export async function getBoardTool() {
    return await Singleton(BoardTool);
}
