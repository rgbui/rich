
import React, { CSSProperties } from 'react';
import { prop, url, view } from '../factory/observable';
import { TextSpanArea } from '../view/appear';
import { BlockDirective, BlockDisplay, BlockRenderRange } from '../enum';
import { BlockView } from '../view';
import { Block } from '..';
import { TextTurns } from '../turn/text';
import { Point, PointArrow, Rect } from '../../common/vector/point';
import { Matrix } from '../../common/matrix';
import { ActionDirective } from '../../history/declare';
import { FontCss, BlockCssName } from '../pattern/css';
import { CssSelectorType } from '../pattern/type';
import { MouseDragger } from '../../common/dragger';
import { forceCloseBoardEditTool } from '../../../extensions/board.edit.tool';
import { openBoardEditTool } from '../../kit/operator/board/edit';
import { lst } from '../../../i18n/store';
import { BlockUrlConstant } from '../constant';
import { MenuItem, MenuItemType } from '../../../component/view/menu/declare';
import { PageLayoutType } from '../../page/declare';

@url("/textspan")
export class TextSpan extends Block {
    @prop()
    align: 'left' | 'center' = 'left';
    display = BlockDisplay.block;
    @prop()
    fontScale = 1;
    @prop()
    smallFont = false;
    placeholder: string;
    get visibleStyle() {
        if (this.isFreeBlock) {
            var style: CSSProperties = {};
            style.position = 'absolute';
            style.zIndex = this.zindex;
            style.top = 0;
            style.left = 0;
            style.transformOrigin = '0% 0%';
            Object.assign(style, this.transformStyle);
            var s = this.pattern.style;
            delete s.backgroundColor;
            s.fontSize = '14px';
            s.lineHeight = (14 * 1.2) + 'px';
            Object.assign(style, s);
            return style;
        }
        else {
            return super.visibleStyle;
        }
    }
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
            return this.firstElementAppear?.isEmpty ? true : false
        }
        else return false;
    }
    get contentStyle() {
        if (this.isFreeBlock) {
            var style: CSSProperties = {
                width: this.fixedWidth
            };
            var s = this.pattern.style;
            if (s.backgroundColor) style.backgroundColor = s.backgroundColor;
            return style;
        }
        else {
            return super.contentStyle;
        }
    }
    get fixedSize(): { width: number; height: number; } {
        if (this.el) {
            return {
                width: this.el.offsetWidth,
                height: this.el.offsetHeight
            }
        }
        else {
            return {
                width: this.fixedWidth,
                height: this.fixedHeight
            }
        }
    }
    init(this: Block): void {
        super.init();
        if (this.isFreeBlock) {
            this.pattern.declare<FontCss>('default', CssSelectorType.pseudo, {
                cssName: BlockCssName.font,
                fontSize: 14
            });
        }
    }
    get selfMatrix(): Matrix {
        var ng = new Matrix();
        ng.scale(this.fontScale, this.fontScale, { x: 0, y: 0 });
        return ng;
    }
    onResizeBoardSelector(arrows: PointArrow[], event: React.MouseEvent) {
        var w = this.fixedWidth;
        var h = this.el.offsetHeight;
        var old_fs = this.fontScale;
        var gm = this.globalMatrix.clone();
        var fp = gm.inverseTransform(Point.from(event));
        var s = gm.getScaling().x;
        var minW = 20 / s;
        var minH = 20 / s;
        var matrix = this.matrix.clone();
        var block = this;

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
                    if (!ma.equals(new Matrix()))
                        block.matrix = matrix.appended(self.selfMatrix).appended(ma).appended(self.selfMatrix.inverted());
                    block.fixedWidth = bw;
                    await block.forceUpdate();
                    block.updateRenderLines();
                    block.page.kit.picker.view.forceUpdate();
                    if (isEnd) {
                        block.page.onAction(ActionDirective.onResizeBlock, async () => {
                            if (!matrix.equals(block.matrix)) await block.updateMatrix(matrix, block.matrix);
                            await block.manualUpdateProps(
                                { fixedWidth: w },
                                { fixedWidth: block.fixedWidth }
                            )
                        })
                    }
                }
                else {
                    var tp = gm.inverseTransform(Point.from(ev));
                    var [dx, dy] = tp.diff(fp);
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
                    if (!ma.equals(new Matrix()))
                        block.matrix = matrix.appended(self.selfMatrix).appended(ma).appended(self.selfMatrix.inverted());
                    block.fontScale = old_fs * (bh / h);
                    await block.forceUpdate();
                    block.updateRenderLines();
                    block.page.kit.picker.view.forceUpdate();
                    if (isEnd) {
                        block.page.onAction(ActionDirective.onResizeBlock, async () => {
                            if (!matrix.equals(block.matrix)) await block.updateMatrix(matrix, block.matrix);
                            await block.manualUpdateProps({ fontScale: old_fs }, { fontScale: block.fontScale })
                        })
                    }
                }
            },
            async moveEnd() {
                await openBoardEditTool(self.page.kit);
            }
        });
    }
    async getBoardEditCommand(): Promise<{ name: string; value?: any; }[]> {
        var fontStyle = this.pattern.css(BlockCssName.font)
        var bold = fontStyle?.fontWeight || false;
        var cs: { name: string; value?: any; }[] = [];
        cs.push({ name: 'fontFamily', value: fontStyle.fontFamily });
        cs.push({ name: 'fontSize', value: Math.round(this.fontScale * 14) });
        cs.push({ name: 'fontWeight', value: bold == 'bold' || bold == 500 ? true : false });
        cs.push({ name: 'fontStyle', value: fontStyle?.fontStyle == 'italic' ? true : false });
        cs.push({ name: 'textDecoration', value: fontStyle?.textDecoration || 'none' });
        cs.push({ name: 'fontColor', value: fontStyle?.color || '#000' });
        cs.push({ name: 'link' });
        cs.push({ name: 'backgroundColor', value: this.pattern.css(BlockCssName.fill)?.color || 'transparent' });
        return cs;
    }
    async setBoardEditCommand(name: string, value: any) {
        if (name == 'backgroundColor')
            await this.pattern.setFillStyle({ color: value, mode: 'color' });
        else if (name == 'fontColor')
            await this.pattern.setFontStyle({ color: value });
        else if (name == 'fontSize') {
            await this.updateProps({ fontScale: value / 14 })
            // this.pattern.setFontStyle({ fontSize: value, lineHeight: (value * 1.2) + 'px' });
        }
        else if (name == 'fontFamily') {
            await this.pattern.setFontStyle({ fontFamily: value })
        }
        else if (name == 'fontWeight')
            await this.pattern.setFontStyle({ fontWeight: value })
        else if (name == 'textDecoration')
            await this.pattern.setFontStyle({ textDecoration: value });
    }
    async onInputed(): Promise<void> {
        this.page.kit.picker.onRePicker();
    }
    get isEnterCreateNewLine(): boolean {
        if (this.isFreeBlock) return false;
        return true;
    }
    async getPlain(this: Block) {
        if (this.childs.length > 0)
            return await this.getChildsPlain();
        else return this.content;
    }
    async getHtml() {
        if (this.childs.length > 0) return `<p>${await this.getChildsHtml()}</p>`
        else return `<p>${this.content}</p>`
    }
    async getMd(this: Block) {
        if (this.childs.length > 0) return `${await this.getChildsMd(true)}`
        else return `${this.content}`
    }
    get isCanEmptyDelete() {
        if (this.isFreeBlock) return false;
        else return true;
    }
    async onGetContextMenus() {
        var rs = await super.onGetContextMenus();
        var at = rs.findIndex(g => g.name == 'color');
        var ns: MenuItem<string | BlockDirective>[] = [];
        ns.push({
            name: 'smallFont',
            type: MenuItemType.switch,
            checked: this.smallFont ? true : false,
            text: lst('小字号'),
            icon: { name: 'byte', code: 'add-text' }
        });
        ns.push({
            type: MenuItemType.divide
        })
        rs.splice(at, 0, ...ns)
        return rs;
    }
    async onContextMenuInput(this: Block, item: MenuItem<BlockDirective | string>) {
        if (item?.name == 'smallFont') {
            this.onUpdateProps({ smallFont: item.checked }, { range: BlockRenderRange.self });
        }
        else await super.onContextMenuInput(item);
    }
    getVisibleHandleCursorPoint() {
        if (!this.el) return;
        var ele = this.el.querySelector('.shy-appear-texts') as HTMLElement;
        if (!ele) ele = this.el.querySelector('.shy-appear-text') as HTMLElement;
        if (!ele) ele = this.el;
        var rect = Rect.fromEle(ele);
        var offset = this.page.pageLayout.type == PageLayoutType.docCard ? 2 : 0;
        return rect.leftTop.move(0, (this.smallFont ? 8 : 10) + offset);
    }
}

@view("/textspan")
export class TextSpanView extends BlockView<TextSpan>{
    renderView() {
        var style = this.block.contentStyle;
        if (this.block.align == 'center') style.textAlign = 'center';
        else if (this.block.align == 'left') style.textAlign = 'left';
        else style.textAlign = 'right';
        var pa = this.block.parent;
        if (this.block.smallFont) {
            style.fontSize = this.block.page.smallFont ? '12px' : '14px';
        }
        var placeholder = this.block.isFreeBlock || pa?.url == BlockUrlConstant.Cell ? lst("输入文本") : undefined;
        if (this.block.placeholder)
            placeholder = this.block.placeholder;
        var visibleStyle = this.block.visibleStyle;
        return <div className='sy-block-text-span' style={visibleStyle}>
            <div style={style}>
                <TextSpanArea placeholderEmptyVisible={this.block.isFreeBlock ? true : false} placeholder={placeholder} block={this.block}></TextSpanArea>
            </div>
        </div>
    }
}


