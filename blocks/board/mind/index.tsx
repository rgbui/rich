
import { BlockView } from "../../../src/block/view";
import React, { CSSProperties } from 'react';
import { prop, url, view } from "../../../src/block/factory/observable";
import { Block } from "../../../src/block";
import { ChildsArea, TextSpanArea } from "../../../src/block/view/appear";
import { Point, PointArrow, Rect, RectUtility } from "../../../src/common/vector/point";
import { FlowMindLine } from "./line";
import './style.less';
import { BoardPointType, BoardBlockSelector } from "../../../src/block/partial/board";
import { Polygon } from "../../../src/common/vector/polygon";
import { ActionDirective } from "../../../src/history/declare";
import { Matrix } from "../../../src/common/matrix";
import { BlockCssName } from "../../../src/block/pattern/css";
import { BlockRenderRange } from "../../../src/block/enum";
import { BlockChildKey } from "../../../src/block/constant";
import { MouseDragger } from "../../../src/common/dragger";
import { forceCloseBoardEditTool } from "../../../extensions/board.edit.tool";
import { openBoardEditTool } from "../../../src/kit/operator/board/edit";
import { lst } from "../../../i18n/store";

@url('/flow/mind')
export class FlowMind extends Block {
    async created(this: Block): Promise<void> {
        this.pattern.setFillStyle({ color: 'rgb(80,194,139)' });
    }
    @prop()
    direction: 'none' | 'x' | 'y' = 'none';
    @prop()
    lineType: 'brokenLine' | 'cure' = 'cure';
    get mindDirection() {
        return this.mindRoot.direction;
    }
    get mindRoot() {
        return this.closest(x => (x as FlowMind).isMindRoot) as FlowMind;
    }
    blocks: { childs: Block[], subChilds: Block[], otherChilds: Block[] } = { childs: [], subChilds: [], otherChilds: [] };
    get isMindRoot() {
        if (this.parent instanceof FlowMind) return false;
        else return true
    }
    get allBlockKeys() {
        return [
            BlockChildKey.childs,
            BlockChildKey.subChilds,
            BlockChildKey.otherChilds
        ];
    }
    @prop()
    fixedWidth: number = 60;
    @prop()
    fixedHeight: number = 30;
    @prop()
    lineColor: string = 'rgb(138,138,138)';
    @prop()
    minBoxStyle: {
        width: number,
        type: 'solid' | 'dash',
        borderColor: string,
        radius: number
    } = {
            width: 1,
            type: 'solid',
            borderColor: 'rgb(80,194,139)',
            radius: 16
        }
    get fixedSize(): { width: number; height: number; } {
        if (this.mindEl) {
            return {
                width: this.mindEl.offsetWidth,
                height: this.mindEl.offsetHeight
            }
        }
        else {
            return {
                width: this.fixedWidth,
                height: this.fixedHeight
            }
        }
    }
    getBlockBoardSelector(types?: BoardPointType[]): BoardBlockSelector[] {
        var pickers: BoardBlockSelector[] = [];
        var gm = this.globalWindowMatrix;
        var { width, height } = this.fixedSize;
        var rect = new Rect(0, 0, width, height);
        var s = gm.getScaling().x;
        var extendRect = rect.extend(20 / s);
        var pathRects = RectUtility.getRectLineRects(rect, 1 / s);
        pickers.push(...pathRects.map((pr, i) => {
            var arrows: PointArrow[] = [];
            if (i == 0) arrows = [PointArrow.top, PointArrow.center];
            else if (i == 1) arrows = [PointArrow.middle, PointArrow.right];
            else if (i == 2) arrows = [PointArrow.bottom, PointArrow.center]
            else if (i == 3) arrows = [PointArrow.middle, PointArrow.left]
            return {
                type: BoardPointType.path,
                arrows,
                poly: new Polygon(...pr.points.map(p => gm.transform(p)))
            }
        }))
        if (Array.isArray(types) && types.includes(BoardPointType.resizePort)) pickers.push(...rect.points.toArray((p, i) => {
            var arrows: PointArrow[] = [];
            if (i == 0) return undefined;
            else if (i == 1) arrows = [PointArrow.top, PointArrow.right];
            else if (i == 2) arrows = [PointArrow.bottom, PointArrow.right]
            else if (i == 3) return undefined;
            return {
                type: BoardPointType.resizePort,
                arrows,
                point: gm.transform(p)
            }
        }))
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
        pickers.push(...extendRect.centerPoints.toArray((p, i) => {
            var type = BoardPointType.mindAdd;
            if (!this.isMindRoot) {
                if (this.parentKey == 'subChilds') {
                    if (this.mindDirection == 'x' && i == 1) return;
                    else if (this.mindDirection == 'y' && i == 2) return;
                }
                else if (this.parentKey == 'otherChilds') {
                    if (this.mindDirection == 'x' && i == 3) return;
                    else if (this.mindDirection == 'y' && i == 0) return;
                }
            }
            if (this.mindDirection != 'none') {
                if (this.mindDirection == 'x' && (i == 0 || i == 2)) type = BoardPointType.connectPort;
                else if (this.mindDirection == 'y' && (i == 1 || i == 3)) type = BoardPointType.connectPort;
            }
            var arrows: PointArrow[] = [];
            if (i == 0) arrows = [PointArrow.top, PointArrow.center];
            else if (i == 1) arrows = [PointArrow.middle, PointArrow.right];
            else if (i == 2) arrows = [PointArrow.bottom, PointArrow.center]
            else if (i == 3) arrows = [PointArrow.middle, PointArrow.left]
            return {
                type,
                arrows,
                point: gm.transform(p)
            }
        }))
        return pickers;
    }
    get mindEl() {
        if ((this.view as any))
            return (this.view as any).mindEl;
    }
    get deep() {
        if (this.isMindRoot) return 0;
        else return (this.parent as FlowMind).deep + 1;
    }
    async onPickerMousedown(selector: BoardBlockSelector, event: React.MouseEvent) {
        var self = this;
        if (selector.type == BoardPointType.mindAdd) {
            this.page.onAction(ActionDirective.onMindAddSub, async () => {
                var keys = 'subChilds';
                if (selector.arrows.every(g => [PointArrow.top, PointArrow.center].includes(g))) {
                    if (this.isMindRoot) await this.updateProps({ direction: 'y' });
                    keys = 'subChilds';
                }
                else if (selector.arrows.every(g => [PointArrow.bottom, PointArrow.center].includes(g))) {
                    if (this.isMindRoot) await this.updateProps({ direction: 'y' });
                    keys = 'otherChilds';
                }
                else if (selector.arrows.every(g => [PointArrow.middle, PointArrow.right].includes(g))) {
                    if (this.isMindRoot) await this.updateProps({ direction: 'x' });
                    keys = 'otherChilds';
                }
                else if (selector.arrows.every(g => [PointArrow.middle, PointArrow.left].includes(g))) {
                    if (this.isMindRoot) await this.updateProps({ direction: 'x' });
                    keys = 'subChilds';
                }
                var newBlock = await self.page.createBlock('/flow/mind',
                    {},
                    this,
                    undefined,
                    keys
                );
                await this.mindRoot.cacChildsFlowMind(true);
                newBlock.mounted(async () => {
                    this.mindRoot.updateAllFlowLines();
                    self.page.kit.picker.onPicker([newBlock]);
                })
            })
        }
    }
    updateRenderLines(isSelfUpdate?: boolean): void {
        super.updateRenderLines(isSelfUpdate);
        if (this.parent instanceof FlowMind) {
            (this.parent.view as any).updateFlowLine();
        }
        (this.view as any).updateFlowLine();
    }
    get relativeFixedRect() {
        var s = this.fixedSize;
        var point = new Point(0, 0);
        point = this.matrix.appended(this.moveMatrix).transform(point);
        var subRect = new Rect(point.x, point.y, s.width, s.height);
        return subRect;
    }
    cacDirectionRange(arrow: 'top' | 'bottom' | 'left' | 'right') {
        var gap = 30;
        if (arrow == 'left' || arrow == 'right') {
            var h = 0;
            this.blocks[arrow == 'left' ? "subChilds" : "otherChilds"].forEach((child, i) => {
                var s = child.fixedSize;
                if (i != 0) h += gap;
                var cs = (child as FlowMind).cacDirectionRange(arrow);
                h += Math.max(cs, s.height);
            });
            return h;
        }
        else {
            var h = 0;
            this.blocks[arrow == 'top' ? "subChilds" : "otherChilds"].forEach((child, i) => {
                var s = child.fixedSize;
                if (i != 0) h += gap;
                var cs = (child as FlowMind).cacDirectionRange(arrow);
                h += Math.max(cs, s.width);
            });
            return h;
        }
    }
    async cacChildsFlowMind(deep?: boolean) {
        var fs = this.fixedSize
        var rect = new Rect(0, 0, fs.width, fs.height);
        var offset = 100;
        var gap = 30;
        if (this.mindRoot.direction == 'x') {
            var leftStart = 0 - (this.cacDirectionRange('left') / 2 - rect.height / 2);
            await this.blocks.subChilds.eachAsync(async (item: FlowMind, i: number) => {
                if (deep) await item.cacChildsFlowMind(deep);
                var rc = item.cacDirectionRange('left');
                var fs = item.fixedSize;
                var matrix = new Matrix();
                var h = Math.max(rc, fs.height);
                matrix.translate(0 - offset - fs.width, leftStart + (h - fs.height) / 2);
                leftStart += h;
                leftStart += gap;
                await item.updateMatrix(item.matrix, matrix);
            });
            var leftStart = 0 - (this.cacDirectionRange('right') / 2 - rect.height / 2);
            await this.blocks.otherChilds.eachAsync(async (item: FlowMind, i: number) => {
                if (deep) await item.cacChildsFlowMind(deep);
                var rc = item.cacDirectionRange('right');
                var fs = item.fixedSize;
                var matrix = new Matrix();
                var h = Math.max(rc, fs.height);
                matrix.translate(offset + rect.width, leftStart + (h - fs.height) / 2);
                leftStart += h;
                leftStart += gap;
                await item.updateMatrix(item.matrix, matrix);
            });
        }
        else if (this.mindRoot.direction == 'y') {
            var leftStart = rect.width / 2 - this.cacDirectionRange('top') / 2;
            await this.blocks.subChilds.eachAsync(async (item: FlowMind, i: number) => {
                if (deep) await item.cacChildsFlowMind(deep);
                var rc = item.cacDirectionRange('top');
                var fs = item.fixedSize;
                var matrix = new Matrix();
                var w = Math.max(rc, fs.width);
                matrix.translate(leftStart + (w - fs.width) / 2, 0 - offset - fs.height);
                leftStart += w;
                leftStart += gap;
                await item.updateMatrix(item.matrix, matrix);
            });
            var leftStart = rect.width / 2 - this.cacDirectionRange('bottom') / 2;
            await this.blocks.otherChilds.eachAsync(async (item: FlowMind, i: number) => {
                if (deep) await item.cacChildsFlowMind(deep);
                var rc = item.cacDirectionRange('bottom');
                var fs = item.fixedSize;
                var matrix = new Matrix();
                var w = Math.max(rc, fs.width);
                matrix.translate(leftStart + (w - fs.width) / 2, offset + rect.height);
                leftStart += w;
                leftStart += gap;
                await item.updateMatrix(item.matrix, matrix);
            });
        }
    }
    updateAllFlowLines() {
        if (this.view) (this.view as any).updateFlowLine();
        this.blocks.subChilds.forEach((c: FlowMind) => c.updateAllFlowLines());
        this.blocks.otherChilds.forEach((c: FlowMind) => c.updateAllFlowLines());
    }
    async getBoardEditCommand(): Promise<{ name: string; value?: any; }[]> {
        var bold = this.pattern.css(BlockCssName.font)?.fontWeight;
        var cs: { name: string; value?: any; }[] = [];
        if (this.isMindRoot) {
            cs.push({ name: 'mindDirection', value: this.direction });
            cs.push({ name: 'mindLineType', value: this.lineType });
            cs.push({ name: 'mindLineColor', value: this.lineColor });
        }
        cs.push({ name: 'fontSize', value: Math.round(this.pattern.css(BlockCssName.font)?.fontSize || 14) });
        cs.push({ name: 'fontWeight', value: bold == 'bold' || bold == 500 ? true : false });
        cs.push({ name: 'fontStyle', value: this.pattern.css(BlockCssName.font)?.fontStyle == 'italic' ? true : false });
        cs.push({ name: 'textDecoration', value: this.pattern.css(BlockCssName.font)?.textDecoration });
        cs.push({ name: 'fontColor', value: this.pattern.css(BlockCssName.font)?.color });
        cs.push({ name: 'fillColor', value: this.pattern.getSvgStyle()?.fill || '#000' });
        cs.push({ name: 'fillOpacity', value: this.pattern.getSvgStyle()?.fillOpacity || 1 });

        cs.push({ name: 'borderWidth', value: this.minBoxStyle.width });
        cs.push({ name: 'borderType', value: this.minBoxStyle.type });
        cs.push({ name: 'borderColor', value: this.minBoxStyle.borderColor });
        cs.push({ name: 'borderRadius', value: this.minBoxStyle.radius });


        return cs;
    }
    async setBoardEditCommand(name: string, value: any) {
        if (this.isMindRoot) {
            if (name == 'mindDirection') {
                this.updateProps({ direction: value });
                await this.cacChildsFlowMind(true);
                this.updateAllFlowLines();
            }
            else if (name == 'mindLineType') {
                this.updateProps({ lineType: value }, BlockRenderRange.self);
            }
            else if (name == 'mindLineColor') {
                this.updateProps({ lineColor: value }, BlockRenderRange.self);
            }
            else (await super.setBoardEditCommand(name, value) == false)
            {

            }
        }
        if (['fillColor', 'fillOpacity',].includes(name)) {
            var key = name;
            if (name == 'fillColor') key = 'fill';
            this.pattern.setSvgStyle({ [key]: value })
        }
        if (name == 'borderWidth') {
            this.updateProps({ 'minBoxStyle.width': value });
        }
        else if (name == 'borderType') {
            this.updateProps({ 'minBoxStyle.type': value });
        }
        else if (name == 'borderColor') {
            this.updateProps({ 'minBoxStyle.borderColor': value });
        }
        else if (name == 'borderRadius') {
            this.updateProps({ 'minBoxStyle.radius': value });
        }
    }
    get contentStyle() {
        var style: CSSProperties = {
        };
        var s = this.pattern.style;
        if (s.fill) style.backgroundColor = s.fill;
        style.width = this.fixedWidth;
        style.borderRadius = this.minBoxStyle.radius;
        style.borderWidth = this.minBoxStyle.width;
        style.borderStyle = this.minBoxStyle.type == 'solid' ? 'solid' : 'dashed';
        style.borderColor = this.minBoxStyle.borderColor;
        return style;
    }
    async renderAllMinds() {
        await this.mindRoot.cacChildsFlowMind(true);
        this.mindRoot.updateAllFlowLines();
    }
    boardMove(from: Point, to: Point) {
        if (this.isMindRoot) { super.boardMove(from, to); return }
        super.boardMove(from, to);
        /**
         * feel parent mind
         */
        this.mindRoot.eachSubMind((b) => {

        }, true)
    }
    async boardMoveEnd(from: Point, to: Point) {
        if (this.isMindRoot) { await super.boardMoveEnd(from, to); return }
        this.moveMatrix = new Matrix();
    }
    eachSubMind(predict: (block: FlowMind) => boolean | void, includeSelf?: boolean) {
        var isBreak: boolean;
        if (includeSelf && predict(this) == true) { isBreak = true; }
        if (!isBreak)
            for (let i = 0; i < this.blocks.subChilds.length; i++) {
                var b = this.blocks.subChilds[i];
                if (predict(b as FlowMind) == true) {
                    isBreak = true;
                    break;
                }
                var r = (b as FlowMind).eachSubMind(predict);
                if (r) {
                    isBreak = true;
                    break;
                }
            }
        if (!isBreak)
            for (let j = 0; j < this.blocks.otherChilds.length; j++) {
                var b = this.blocks.otherChilds[j];
                if (predict(b as FlowMind) == true) {
                    isBreak = true;
                    break;
                }
                var r = (b as FlowMind).eachSubMind(predict);
                if (r) {
                    isBreak = true;
                    break;
                }
            }
        return isBreak;
    }
    onResizeBoardSelector(arrows: PointArrow[], event: React.MouseEvent) {
        var block = this;
        var matrix = block.matrix.clone();
        var gm = block.globalWindowMatrix.clone();
        var { width: w, height: h } = block.fixedSize;
        var fp = gm.inverseTransform(Point.from(event));
        var s = gm.getScaling().x;
        var minW = 50 / s;
        var minH = 20 / s;
        var self = this;
        MouseDragger({
            event,
            moveStart() {
                forceCloseBoardEditTool();
            },
            moving(ev, data, isEnd) {
                var tp = gm.inverseTransform(Point.from(ev));
                var ma = new Matrix();
                var [dx, dy] = tp.diff(fp);
                var bw = w;
                var bh = h;
                if (arrows.includes(PointArrow.top)) {
                    if (bh - dy < minH) dy = bh - minH;
                }
                else if (arrows.includes(PointArrow.bottom)) {
                    if (bh + dy < minH) dy = minH - bh;
                }
                if (arrows.includes(PointArrow.left)) {
                    if (bw - dx < minW) dx = bw - minW;
                }
                else if (arrows.includes(PointArrow.right)) {
                    if (bw + dx < minW) dx = minW - bw;
                }
                if (arrows.includes(PointArrow.top)) {
                    // ma.translate(0, dy);
                    // bh -= dy;
                }
                else if (arrows.includes(PointArrow.bottom)) {
                    // bh += dy;
                }
                if (arrows.includes(PointArrow.left)) {
                    ma.translate(dx, 0);
                    bw -= dx;
                }
                else if (arrows.includes(PointArrow.right)) {
                    bw += dx;
                }
                block.matrix = matrix.appended(ma);
                // block.fixedHeight = bh;
                block.fixedWidth = bw;
                block.updateRenderLines();
                self.updateAllFlowLines()
                block.forceUpdate();
                block.page.kit.picker.view.forceUpdate();
                if (isEnd) {
                    block.page.onAction(ActionDirective.onResizeBlock, async () => {
                        if (!matrix.equals(block.matrix)) block.updateMatrix(matrix, block.matrix);
                        block.manualUpdateProps(
                            { fixedWidth: w, fixedHeight: h },
                            { fixedWidth: block.fixedWidth, fixedHeight: block.fixedHeight }
                        )
                    })
                }
            },
            async moveEnd() {
                await openBoardEditTool(self.page.kit);
            }
        });
    }
    get isCanEmptyDelete() {
        return false
    }
}
@view('/flow/mind')
export class FlowMindView extends BlockView<FlowMind>{
    didMount() {
        this.updateFlowLine();
    }
    updateFlowLine() {
        if (this.flowMindLine && (this.block.blocks.subChilds.length > 0 || this.block.blocks.otherChilds.length > 0)) {
            var { width, height } = this.block.fixedSize;
            var rect = new Rect(0, 0, width, height);
            var leftOrigin = this.block.mindDirection != 'y' ? rect.leftMiddle : rect.topCenter;
            var leftPoints = this.block.blocks.subChilds.map((sub: FlowMind) => {
                var s = sub.fixedSize;
                var subRect = new Rect(0, 0, s.width, s.height);
                return sub.matrix.appended(sub.moveMatrix).transform(this.block.mindDirection != 'y' ? subRect.rightMiddle : subRect.bottomCenter);
            });
            var rightOrigin = this.block.mindDirection != 'y' ? rect.rightMiddle : rect.bottomCenter;
            var rightPoints = this.block.blocks.otherChilds.map((sub: FlowMind) => {
                var s = sub.fixedSize;
                var subRect = new Rect(0, 0, s.width, s.height);
                return sub.matrix.appended(sub.moveMatrix).transform(this.block.mindDirection != 'y' ? subRect.leftMiddle : subRect.topCenter);
            });
            this.flowMindLine.updateView(
                this.block.mindDirection,
                leftOrigin,
                leftPoints,
                rightOrigin,
                rightPoints,
            );
        }
    }
    renderItem() {
        return <div className='sy-flow-mind-text'
            style={this.block.contentStyle}
            ref={e => this.mindEl = e} >
            <TextSpanArea placeholder={lst('输入') } block={this.block}></TextSpanArea>
        </div>
    }
    mindEl: HTMLElement;
    renderSubChilds() {
        return <>
            <ChildsArea childs={this.block.blocks.subChilds}></ChildsArea>
            <ChildsArea childs={this.block.blocks.otherChilds}></ChildsArea>
        </>
    }
    flowMindLine: FlowMindLine;
    render() {
        var style = this.block.visibleStyle;
        style.padding = 0;
        return <div className='sy-flow-mind' style={style}>
            {this.renderItem()}
            {this.renderSubChilds()}
            <FlowMindLine mind={this.block} ref={e => this.flowMindLine = e}></FlowMindLine>
        </div>
    }
}