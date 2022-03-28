import React, { CSSProperties } from "react";
import { ReactNode } from "react";
import { EventsComponent } from "../../component/lib/events.component";
import TextSvg from "../../src/assert/svg/board.tool.text.svg";
import StickerSvg from "../../src/assert/svg/board.tool.sticker.svg";
import ConnectSvg from "../../src/assert/svg/connet.line.svg";
import MeiSvg from "../../src/assert/svg/board.tool.mei.svg";
import SharpSvg from "../../src/assert/svg/board.tool.sharp.svg";
import FrameSvg from "../../src/assert/svg/board.tool.frame.svg";
import { Point, Rect } from "../../src/common/vector/point";
import { Singleton } from "../../component/lib/Singleton";
import "./style.less";
import { BoardToolOperator } from "./declare";
import { BlockUrlConstant } from "../../src/block/constant";
import { getNoteSelector } from "../note";
import { getShapeSelector } from "../shapes";
import { MindSvg, UploadSvg } from "../../component/svgs";
import _ from "lodash";


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
            <div className="shy-board-tool-bar"
                onMouseDown={e => this.selector(BoardToolOperator.upload, e)}>
                <span><UploadSvg></UploadSvg></span>
            </div>
            <div className="shy-board-tool-bar"
                onMouseDown={e => this.selector(BoardToolOperator.mind, e)}>
                <span><MindSvg></MindSvg></span>
            </div>
        </div>
    }
    currentSelector: { url: string, data?: Record<string, any>, event: React.MouseEvent }
    get isSelector() {
        if (this.currentSelector) return true;
        else return false;
    }
    async selector(operator: BoardToolOperator, event: React.MouseEvent) {
        if (operator == BoardToolOperator.arrow) this.currentSelector = null;
        else {
            var sel: Record<string, any> = { event };
            switch (operator) {
                case BoardToolOperator.text:
                    sel.url = BlockUrlConstant.TextSpan;
                    break;
                case BoardToolOperator.shape:
                    sel.url = '/shape';
                    var shapeSelector = await getShapeSelector();
                    shapeSelector.only('selector', async (data) => {
                        if (this.currentSelector && this.currentSelector.url == '/shape') {
                            this.currentSelector.data = { svgContent: data.shape, svg: data.svg };
                        }
                        shapeSelector.close();
                    });
                    shapeSelector.open(this.point.move(40 + 10 + 20, 0));
                    break;
                case BoardToolOperator.note:
                    sel.url = '/note';
                    var noteSelector = await getNoteSelector();
                    noteSelector.only('selector', (data) => {
                        if (this.currentSelector && this.currentSelector.url == '/note') {
                            this.currentSelector.data = { color: data.color };
                        }
                        noteSelector.close();
                    });
                    noteSelector.open(this.point.move(40 + 10 + 20, 0));
                    break;
                case BoardToolOperator.connect:
                    sel.url = '/line';
                    break;
                case BoardToolOperator.frame:
                    sel.url = BlockUrlConstant.Frame;
                    break;
                case BoardToolOperator.pen:
                    sel.url = '/pen';
                    break;
                case BoardToolOperator.upload:
                    /**
                     * 这里上传文件
                     */
                    break;
                case BoardToolOperator.mind:
                    sel.url = '/flow/mind';
                    break;
            }
            this.currentSelector = sel as any;
        }
        this.emit('selector', this.currentSelector);
    }
    async clearSelector() {
        delete this.currentSelector;
        var noteSelector = await getNoteSelector();
        noteSelector.close();
    }
    private point: Point;
    visible: boolean = false;
    open(point: Point) {
        this.point = point;
        this.visible = true;
        this.forceUpdate()
    }
    onShow(visible: boolean) {
        this.visible = visible;
        this.forceUpdate();
    }
    close(): void {
        this.visible = false;
        this.clearSelector();
        this.forceUpdate();
    }
}
interface BoardTool {
    emit(name: 'selector', data: BoardTool['currentSelector']);
    only(name: 'selector', fn: (data: BoardTool['currentSelector']) => void)
}

export async function getBoardTool() {
    return await Singleton(BoardTool);
}
