
import React from 'react';
import { url, view } from '../factory/observable';
import { TextArea, TextLineChilds, TextSpanArea } from '../view/appear';
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
    get isTextContentBlockEmpty() {
        if (this.childs.length == 0) {
            return this.firstElementAppear.isEmpty
        }
        else return false;
    }
    get visibleStyle(): React.CSSProperties {
        var style = super.visibleStyle;
        if (this.isFreeBlock) {
            style.minWidth = this.fixedWidth || 80
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
        var gm = this.globalWindowMatrix.clone();
        var fp = gm.inverseTransform(Point.from(event));
        var s = gm.getScaling().x;
        var minW = 50 / s;
        var minH = 20 / s;
        var matrix = this.matrix.clone();
        var block = this;
        var style = this.pattern.style;
        var fontSize = style.fontSize || 14;
        MouseDragger({
            event,
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
                    var currentFontSize = Math.max(12, fontSize + (bh - h));
                    block.page.snapshoot.pause();
                    block.pattern.setStyle(BlockCssName.font, { lineHeight: (currentFontSize * 1.2) + 'px', fontSize: currentFontSize });
                    await block.forceUpdate();
                    block.page.kit.picker.view.forceUpdate();
                    if (isEnd) {
                        block.pattern.setStyle(BlockCssName.font, { fontSize });
                        block.page.snapshoot.start();
                        block.onAction(ActionDirective.onResizeBlock, async () => {
                            if (!matrix.equals(block.matrix)) block.updateMatrix(matrix, block.matrix);
                            block.pattern.setStyle(BlockCssName.font, { lineHeight: (currentFontSize * 1.2) + 'px', fontSize: currentFontSize });
                        })
                    }
                }
            }
        });
    }
    async getBoardEditCommand(this: Block): Promise<{ name: string; value?: any; }[]> {
        var cs: { name: string; value?: any; }[] = [];
        cs.push({ name: 'fontSize' });
        cs.push({ name: 'fontWeight' });
        cs.push({ name: 'fontStyle' });
        cs.push({ name: 'textDecoration' });
        cs.push({ name: 'fontColor' });
        cs.push({ name: 'link' });
        cs.push({ name: 'backgroundColor' });
        return cs;
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


