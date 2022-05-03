
import React from 'react';
import { url, view } from '../factory/observable';
import { TextSpanArea } from '../view/appear';
import { BlockDisplay } from '../enum';
import { BlockView } from '../view';
import { Block } from '..';
import { TextTurns } from '../turn/text';
import { Point, PointArrow } from '../../common/vector/point';
import { Matrix } from '../../common/matrix';
import { ActionDirective } from '../../history/declare';
import { FontCss, BlockCssName } from '../pattern/css';
import { CssSelectorType } from '../pattern/type';
import { MouseDragger } from '../../common/dragger';
import { forceCloseBoardEditTool } from '../../../extensions/board.edit.tool';

import { dom } from '../../common/dom';
import { useBoardTool } from '../../kit/operator/board';

@url("/textspan")
export class TextSpan extends Block {
    display = BlockDisplay.block;
    get appearAnchors() {
        if (this.childs.length > 0) return []
        else return this.__appearAnchors;
    }
    async onGetTurnUrls() {
        return TextTurns.urls
    }
    async getWillTurnData(url: string) {
        return await TextTurns.turn(this, url);
    }
    get isContentEmpty() {
        if (this.childs.length == 0) {
            return this.firstElementAppear.isEmpty
        }
        else return false;
    }
    get visibleStyle(): React.CSSProperties {
        var style = super.visibleStyle;
        if (this.isFreeBlock) {
            style.width = this.fixedWidth || 20
        }
        return style;
    }
    get fixedSize(): { width: number; height: number; } {
        if (this.el) {
            return {
                width: this.el.offsetWidth,
                height: this.el.offsetHeight
            }
        }
        else {
            var style = this.pattern.style;
            var fontSize = style.fontSize || 14;
            return {
                width: this.fixedWidth,
                height: fontSize * 1.2
            }
        }
    }
    init(this: Block): void {
        if (this.isFreeBlock) {
            this.pattern.declare<FontCss>('default', CssSelectorType.pseudo, {
                cssName: BlockCssName.font,
                fontSize: 14
            });
        }
    }
    onResizeBoardSelector(this: Block, arrows: PointArrow[], event: React.MouseEvent) {
        var { width: w, height: h } = this.fixedSize;
        var lineHeight = parseFloat(dom(this.el).style('lineHeight'));
        var rh = h / lineHeight;
        var lineCount = Math.floor(rh);
        if (rh - lineCount > 0.2) lineCount += 1;
        var gm = this.globalWindowMatrix.clone();
        var fp = gm.inverseTransform(Point.from(event));
        var s = gm.getScaling().x;
        var minW = 20 / s;
        var minH = 20 / s;
        var matrix = this.matrix.clone();
        var block = this;
        var style = this.pattern.style;
        var fontSize = style.fontSize || 14;
        var self = this;
        MouseDragger({
            event,
            moveStart() {
                forceCloseBoardEditTool();
            },
            async moving(ev, data, isEnd) {
                if ((arrows.includes(PointArrow.right) || arrows.includes(PointArrow.left)) && arrows.includes(PointArrow.middle)) {
                    var tp = gm.inverseTransform(Point.from(ev));
                    var [dx, dy] = tp.diff(fp);
                    var bw = w;
                    var bh = h;
                    var ma = new Matrix();
                    if (arrows.includes(PointArrow.left)) {
                        if (bw - dx < minW) dx = bw - minW;
                    }
                    else if (arrows.includes(PointArrow.right)) {
                        if (bw + dx < minW) dx = minW - bw;
                    }
                    if (arrows.includes(PointArrow.left)) {
                        ma.translate(dx, 0);
                        bw -= dx;
                    }
                    else if (arrows.includes(PointArrow.right)) {
                        bw += dx;
                    }
                    block.matrix = matrix.appended(ma);
                    block.fixedWidth = bw;
                    await block.forceUpdate();
                    block.updateRenderLines();
                    block.page.kit.picker.view.forceUpdate();
                    if (isEnd) {
                        block.onAction(ActionDirective.onResizeBlock, async () => {
                            if (!matrix.equals(block.matrix)) block.updateMatrix(matrix, block.matrix);
                            block.manualUpdateProps(
                                { fixedWidth: w },
                                { fixedWidth: block.fixedWidth }
                            )
                        })
                    }
                }
                else {
                    var tp = gm.inverseTransform(Point.from(ev));
                    var [dx, dy] = tp.diff(fp);
                    var bw = w;
                    var bh = h;
                    var ma = new Matrix();
                    if (arrows.includes(PointArrow.top)) {
                        if (bh - dy < minH) dy = bh - minH;
                    }
                    else if (arrows.includes(PointArrow.bottom)) {
                        if (bh + dy < minH) dy = minH - bh;
                    }
                    if (arrows.includes(PointArrow.top)) {
                        ma.translate(0, dy);
                        bh -= dy;
                    }
                    else if (arrows.includes(PointArrow.bottom)) {
                        bh += dy;
                    }
                    block.matrix = matrix.appended(ma);
                    var currentLineHeight = Math.max(12 * 1.2, Math.round((lineHeight + (bh - h) / lineCount)));
                    block.page.snapshoot.pause();
                    block.pattern.setStyle(BlockCssName.font, {
                        lineHeight: currentLineHeight + 'px',
                        fontSize: currentLineHeight / 1.2
                    });
                    await block.forceUpdate();
                    block.updateRenderLines();
                    block.page.kit.picker.view.forceUpdate();
                    if (isEnd) {
                        block.pattern.setStyle(BlockCssName.font, { fontSize });
                        block.page.snapshoot.start();
                        block.onAction(ActionDirective.onResizeBlock, async () => {
                            if (!matrix.equals(block.matrix)) block.updateMatrix(matrix, block.matrix);
                            block.pattern.setStyle(BlockCssName.font, {
                                lineHeight: currentLineHeight + 'px',
                                fontSize: currentLineHeight / 1.2
                            });
                        })
                    }
                }
            },
            async moveEnd() {
                await useBoardTool(self.page.kit);
            }
        });
    }
    async getBoardEditCommand(this: Block): Promise<{ name: string; value?: any; }[]> {
        var fontStyle = this.pattern.css(BlockCssName.font)
        var bold = fontStyle?.fontWeight || false;
        var cs: { name: string; value?: any; }[] = [];
        cs.push({ name: 'fontSize', value: Math.round(fontStyle?.fontSize || 14) });
        cs.push({ name: 'fontWeight', value: bold == 'bold' || bold == 500 ? true : false });
        cs.push({ name: 'fontStyle', value: fontStyle?.fontStyle == 'italic' ? true : false });
        cs.push({ name: 'textDecoration', value: fontStyle?.textDecoration || 'none' });
        cs.push({ name: 'fontColor', value: fontStyle?.color || '#000' });
        cs.push({ name: 'link' });
        cs.push({ name: 'backgroundColor', value: this.pattern.css(BlockCssName.fill)?.color || 'transparent' });
        return cs;
    }
    async setBoardEditCommand(this: Block, name: string, value: any) {
        if (name == 'backgroundColor')
            this.pattern.setFillStyle({ color: value, mode: 'color' });
        else if (name == 'fontColor')
            this.pattern.setFontStyle({ color: value });
        else if (name == 'fontSize') {
            this.pattern.setFontStyle({ fontSize: value, lineHeight: (value * 1.2) + 'px' });
        }
        else if (name == 'fontWeight')
            this.pattern.setFontStyle({ fontWeight: value })
        else if (name == 'textDecoration')
            this.pattern.setFontStyle({ textDecoration: value });
    }
    async onInputed(): Promise<void> {
        this.page.kit.picker.onRePicker();
    }
    get isEnterInputNewLine(): boolean {
        if (this.isFreeBlock) return false;
        return true;
    }
}
@view("/textspan")
export class TextSpanView extends BlockView<TextSpan>{
    render() {
        return <div className='sy-block-text-span' style={this.block.visibleStyle}>
            <TextSpanArea block={this.block}></TextSpanArea>
        </div>
    }
}


