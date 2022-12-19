import React from "react";
import { ReactNode } from "react";
import { Block } from "../../../src/block";
import { prop, url, view } from "../../../src/block/factory/observable";
import { BoardPointType, BoardBlockSelector } from "../../../src/block/partial/board";
import { BlockCssName } from "../../../src/block/pattern/css";
import { BlockView } from "../../../src/block/view";
import { TextSpanArea } from "../../../src/block/view/appear";
import { Rect, PointArrow } from "../../../src/common/vector/point";
import "./style.less";

@url('/note')
export class Note extends Block {
    @prop()
    color: string = 'rgb(166,204,245)';
    @prop()
    isScale: boolean = true;
    @prop()
    fixedWidth: number = 200;
    @prop()
    fixedHeight: number = 200;
    get fixedSize(): { width: number; height: number; } {
        var size = Math.max(this.fixedHeight, this.fixedWidth);
        return {
            width: size,
            height: size
        }
    }
    getBlockBoardSelector(this: Block, types?: BoardPointType[]): BoardBlockSelector[] {
        var pickers = super.getBlockBoardSelector(...arguments);
        if (types.some(s => s == BoardPointType.pathConnectPort)) {
            var gm = this.globalWindowMatrix;
            var { width, height } = this.fixedSize;
            var rect = new Rect(0, 0, width, height);
            rect = rect.extend(0 - 4);
            pickers.removeAll(x => x.type == BoardPointType.pathConnectPort);
            pickers.push(...rect.centerPoints.map((pr, i) => {
                var arrows: PointArrow[] = [];
                if (i == 0) arrows = [PointArrow.top, PointArrow.center];
                else if (i == 1) arrows = [PointArrow.middle, PointArrow.right];
                else if (i == 2) arrows = [PointArrow.bottom, PointArrow.center]
                else if (i == 3) arrows = [PointArrow.middle, PointArrow.left]
                return {
                    type: BoardPointType.pathConnectPort,
                    arrows,
                    point: gm.transform(pr)
                }
            }))
        }
        return pickers;
    }
    async getBoardEditCommand(): Promise<{ name: string; value?: any; }[]> {
        var bold = this.pattern.css(BlockCssName.font)?.fontWeight;
        var cs: { name: string; value?: any; }[] = [];
        cs.push({ name: 'fontSize', value: Math.round(this.pattern.css(BlockCssName.font)?.fontSize || 14) });
        cs.push({ name: 'fontWeight', value: bold == 'bold' || bold == 500 ? true : false });
        cs.push({ name: 'fontStyle', value: this.pattern.css(BlockCssName.font)?.fontStyle == 'italic' ? true : false });
        cs.push({ name: 'textDecoration', value: this.pattern.css(BlockCssName.font)?.textDecoration });
        cs.push({ name: 'fontColor', value: this.pattern.css(BlockCssName.font)?.color });
        cs.push({ name: 'fontFamily', value: this.pattern.css(BlockCssName.font)?.fontFamily });

        // cs.push({ name: 'link' });
        var stickerSize = 'none';
        if (this.fixedWidth == 400) stickerSize = 'big'
        else if (this.fixedWidth == 200) stickerSize = 'medium'
        else if (this.fixedWidth == 100) stickerSize = 'small'
        cs.push({ name: 'stickerSize', value: stickerSize });
        cs.push({ name: 'backgroundNoTransparentColor', value: this.color });
        return cs;
    }
    async setBoardEditCommand(name: string, value: any) {
        if (name == 'backgroundNoTransparentColor')
            this.updateProps({ color: value })
        else (await super.setBoardEditCommand(name, value) == false)
        {
            if (name == 'stickerSize') {
                if (value == 'big') { this.updateProps({ fixedWidth: 400, fixedHeight: 400 }) }
                else if (value == 'medium') { this.updateProps({ fixedWidth: 200, fixedHeight: 200 }) }
                else if (value == 'small') { this.updateProps({ fixedWidth: 100, fixedHeight: 100 }) }
            }
        }
    }
    get isEnterCreateNewLine(): boolean {
        return false;
    }
    get isCanEmptyDelete() {
        if (this.isFreeBlock) return false;
        else return true;
    }
}
@view('/note')
export class NoteView extends BlockView<Note>{
    renderBg() {
        var bw = this.block.fixedSize.width;
        var size = (8 / 48) * bw + bw - 4;

        return <svg style={{
            width: size,
            height: size,
            top: (bw - size) / 2,
            left: (bw - size) / 2
        }} viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
            <defs>
                <filter x="-18.8%" y="-120%" width="137.5%" height="340%" filterUnits="objectBoundingBox" id="aeqa">
                    <feGaussianBlur stdDeviation="2" in="SourceGraphic"></feGaussianBlur>
                </filter>
                <filter x="-9.4%" y="-60%" width="118.8%" height="220%" filterUnits="objectBoundingBox" id="aeqb">
                    <feGaussianBlur stdDeviation="1" in="SourceGraphic"></feGaussianBlur>
                </filter>
            </defs>
            <g fill="none" fillRule="evenodd">
                <path fill="#353535" opacity=".5" filter="url(#aeqa)" d="M8 39h32v5H8z"></path>
                <path fill="#353535" opacity=".5" filter="url(#aeqb)" d="M8 39h32v5H8z"></path>
                <path fill={this.block.color} d="M4 4h40v40H4z"></path>
            </g>
        </svg>
    }
    render(): ReactNode {
        var dx = this.block.realPx(10);
        return <div className="sy-block-note" style={this.block.visibleStyle}>
            {this.renderBg()}
            <div className="sy-block-note-content" style={{
                padding: dx,
                background: this.block.color,
                width: this.block.fixedSize.width,
                height: this.block.fixedSize.height
            }}>
                <TextSpanArea placeholder={this.block.isFreeBlock ? "键入文本" : undefined} block={this.block}></TextSpanArea>
            </div>
        </div>
    }
}