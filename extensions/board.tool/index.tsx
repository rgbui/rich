import React, { CSSProperties } from "react";
import { ReactNode } from "react";
import { EventsComponent } from "../../component/lib/events.component";
import { Point } from "../../src/common/vector/point";
import { Singleton } from "../../component/lib/Singleton";
import { BoardToolOperator } from "./declare";
import { BlockUrlConstant } from "../../src/block/constant";
import { getNoteSelector } from "../note";
import { getShapeSelector } from "../shapes";
import {
    BoardToolFrameSvg,
    BoardToolMeiSvg,
    BoardToolSharpSvg,
    BoardToolStickerSvg,
    BoardToolTextSvg,
    ConnetLineSvg,
    MindSvg,
    UploadSvg
} from "../../component/svgs";
import { PopoverPosition } from "../popover/position";
import { FixedViewScroll } from "../../src/common/scroll";
import { Icon } from "../../component/view/icon";

class BoardTool extends EventsComponent {
    constructor(props) {
        super(props);
        this.fvs.on('change', (offset: Point) => {
            if (this.visible == true && this.el)
                this.el.style.transform = `translate(${offset.x}px,${offset.y}px)`
        })
    }
    private fvs: FixedViewScroll = new FixedViewScroll();
    el: HTMLElement;
    render(): ReactNode {
        if (this.visible == false) return <></>;
        var style: CSSProperties = {};
        if (this.point) {
            style.top = this.point.y;
            style.left = this.point.x;
        }
        return <div className="r-flex-center  z-1000 fix w-40 padding-t-5  round-4 border bg-white r-size-30 r-gap-l-5 r-gap-t-5 r-gap-b-5 r-item-hover r-round-4 r-cursor" ref={e => this.el = e} style={style}>
            <div className="shy-board-tool-bar"
                onMouseDown={e => this.selector(BoardToolOperator.text, e)}>
                <span><Icon icon={BoardToolTextSvg} /></span>
            </div>
            <div className="shy-board-tool-bar"
                onMouseDown={e => this.selector(BoardToolOperator.note, e)}>
                <span><Icon icon={BoardToolStickerSvg} /></span>
            </div>
            <div className="shy-board-tool-bar"
                onMouseDown={e => this.selector(BoardToolOperator.shape, e)}>
                <span><Icon icon={BoardToolSharpSvg}></Icon></span>
            </div>
            <div className="shy-board-tool-bar"
                onMouseDown={e => this.selector(BoardToolOperator.connect, e)}>
                <span><Icon icon={ConnetLineSvg}></Icon></span>
            </div>
            <div className="shy-board-tool-bar"
                onMouseDown={e => this.selector(BoardToolOperator.pen, e)}>
                <span><Icon icon={BoardToolMeiSvg}></Icon></span>
            </div>
            <div className="shy-board-tool-bar"
                onMouseDown={e => this.selector(BoardToolOperator.frame, e)}>
                <span><Icon icon={BoardToolFrameSvg}></Icon></span>
            </div>
            <div className="shy-board-tool-bar"
                onMouseDown={e => this.selector(BoardToolOperator.upload, e)}>
                <span><Icon icon={UploadSvg}></Icon></span>
            </div>
            <div className="shy-board-tool-bar"
                onMouseDown={e => this.selector(BoardToolOperator.mind, e)}>
                <span><Icon icon={MindSvg}></Icon></span>
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
                            this.currentSelector.data = { svg: data.svg, svgName: data.name };
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
        this.closeCursor();
        var noteSelector = await getNoteSelector();
        noteSelector.close();
    }
    private point: Point;
    visible: boolean = false;
    open(pos: PopoverPosition) {
        this.point = pos.roundPoint;
        if (pos.relativeEleAutoScroll) this.fvs.bind(pos.relativeEleAutoScroll);
        this.visible = true;
        this.forceUpdate()
    }
    onShow(visible: boolean) {
        this.visible = visible;
        this.forceUpdate();
    }
    close(): void {
        this.fvs.unbind();
        this.visible = false;
        this.clearSelector();
        this.forceUpdate();
    }
    private cursorEl: HTMLElement;
    openCursor(el: HTMLElement, cursor: string) {
        this.cursorEl = el;
        el.style.cursor = cursor;
    }
    closeCursor() {
        if (this.cursorEl) {
            this.cursorEl.style.cursor = 'default';
        }
    }
}
interface BoardTool {
    emit(name: 'selector', data: BoardTool['currentSelector']);
    only(name: 'selector', fn: (data: BoardTool['currentSelector']) => void)
}
export async function getBoardTool() {
    return await Singleton(BoardTool);
}
