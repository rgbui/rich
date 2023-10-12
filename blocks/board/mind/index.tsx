
import { BlockView } from "../../../src/block/view";
import React, { CSSProperties } from 'react';
import { prop, url, view } from "../../../src/block/factory/observable";
import { Block } from "../../../src/block";
import { ChildsArea, TextSpanArea } from "../../../src/block/view/appear";
import { Point, PointArrow, Rect, RectUtility } from "../../../src/common/vector/point";
import { FlowMindLine, GetLineSvg } from "./line";
import { BoardPointType, BoardBlockSelector } from "../../../src/block/partial/board";
import { Polygon } from "../../../src/common/vector/polygon";
import { ActionDirective } from "../../../src/history/declare";
import { Matrix } from "../../../src/common/matrix";
import { BlockCssName } from "../../../src/block/pattern/css";
import { BlockRenderRange } from "../../../src/block/enum";
import { BlockChildKey } from "../../../src/block/constant";
import { MouseDragger } from "../../../src/common/dragger";
import { forceCloseBoardEditTool } from "../../../extensions/board.edit.tool";
import { lst } from "../../../i18n/store";
import './style.less';
import { VR } from "../../../src/common/render";

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
    lineColor: string = '';
    @prop()
    lineWidth: number = 2;
    @prop()
    minBoxStyle: {
        width: number,
        type: 'solid' | 'dash' | 'none',
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
        var gm = this.globalMatrix;
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
                newBlock.mounted(async () => {
                    this.renderAllMinds();
                    this.mindRoot.view.forceUpdate(() => {
                        self.page.kit.picker.onPicker([newBlock], true);
                    })
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
    private cacDirectionRange(arrow: 'top' | 'bottom' | 'left' | 'right') {
        var gap = 30;
        if (arrow == 'left' || arrow == 'right') {
            var h = 0;
            var w = 0;
            this.blocks[arrow == 'left' ? "subChilds" : "otherChilds"].forEach((child, i) => {
                var s = child.fixedSize;
                if (i != 0) h += gap;
                var cs = (child as FlowMind).cacDirectionRange(arrow);
                h += Math.max(cs.h, s.height);
                w = Math.max(w, s.width);
            });
            return { w, h };
        }
        else {
            var h = 0;
            var w = 0;
            this.blocks[arrow == 'top' ? "subChilds" : "otherChilds"].forEach((child, i) => {
                var s = child.fixedSize;
                if (i != 0) w += gap;
                var cs = (child as FlowMind).cacDirectionRange(arrow);
                w += Math.max(cs.w, s.width);
                h = Math.max(h, s.height);
            });
            return { w, h }
        }
    }
    cacChildsFlowMind(deep?: boolean) {
        var fs = this.fixedSize;
        var rect = new Rect(0, 0, fs.width, fs.height);
        var offset = 100;
        var gap = 30;
        if (this.mindRoot.direction == 'x') {
            if (this.parent && this.parent instanceof FlowMind && !(this.parent as FlowMind).isMindRoot) {
                var pa = this.parent as FlowMind;
                var pr = pa.cacDirectionRange('left');
                if (pr.w > fs.width) offset += pr.w - fs.width;
            }
            var topStart = 0 - (this.cacDirectionRange('left').h / 2 - rect.height / 2);
            this.blocks.subChilds.each((item: FlowMind, i: number) => {
                if (deep) item.cacChildsFlowMind(deep);
                var rc = item.cacDirectionRange('left');
                var fs = item.fixedSize;
                var matrix = new Matrix();
                var h = Math.max(rc.h, fs.height);
                matrix.translate(0 - offset - fs.width, topStart + (h - fs.height) / 2);
                topStart += h;
                topStart += gap;
                item.onlyUpdateMatrix(matrix);
            });
            var topStart = 0 - (this.cacDirectionRange('right').h / 2 - rect.height / 2);
            this.blocks.otherChilds.each((item: FlowMind, i: number) => {
                if (deep) item.cacChildsFlowMind(deep);
                var rc = item.cacDirectionRange('right');
                var fs = item.fixedSize;
                var matrix = new Matrix();
                var h = Math.max(rc.h, fs.height);
                matrix.translate(offset + rect.width, topStart + (h - fs.height) / 2);
                topStart += h;
                topStart += gap;
                item.onlyUpdateMatrix(matrix);
            });
        }
        else if (this.mindRoot.direction == 'y') {
            if (this.parent && this.parent instanceof FlowMind && !(this.parent as FlowMind).isMindRoot) {
                var pa = this.parent as FlowMind;
                var pr = pa.cacDirectionRange('left');
                if (pr.h > fs.height) offset += pr.h - fs.height;
            }
            var leftStart = rect.width / 2 - this.cacDirectionRange('top').w / 2;
            this.blocks.subChilds.each((item: FlowMind, i: number) => {
                if (deep) item.cacChildsFlowMind(deep);
                var rc = item.cacDirectionRange('top');
                var fs = item.fixedSize;
                var matrix = new Matrix();
                var w = Math.max(rc.w, fs.width);
                matrix.translate(leftStart + (w - fs.width) / 2, 0 - offset - fs.height);
                leftStart += w;
                leftStart += gap;
                item.onlyUpdateMatrix(matrix);
            });
            var leftStart = rect.width / 2 - this.cacDirectionRange('bottom').w / 2;
            this.blocks.otherChilds.each((item: FlowMind, i: number) => {
                if (deep) item.cacChildsFlowMind(deep);
                var rc = item.cacDirectionRange('bottom');
                var fs = item.fixedSize;
                var matrix = new Matrix();
                var w = Math.max(rc.w, fs.width);
                matrix.translate(leftStart + (w - fs.width) / 2, offset + rect.height);
                leftStart += w;
                leftStart += gap;
                item.onlyUpdateMatrix(matrix);
            });
        }
    }
    updateAllFlowLines() {
        if (this.view) (this.view as any).updateFlowLine();
        else {
            console.log('not view', this);
        }
        this.blocks.subChilds.forEach((c: FlowMind) => c.updateAllFlowLines());
        this.blocks.otherChilds.forEach((c: FlowMind) => c.updateAllFlowLines());
    }
    async getBoardEditCommand(): Promise<{ name: string; value?: any; }[]> {
        var bold = this.pattern.css(BlockCssName.font)?.fontWeight;
        var cs: { name: string; value?: any; }[] = [];
        if (this.isMindRoot) {
            cs.push({ name: 'mindDirection', value: this.direction });
            cs.push({ name: 'mindLineType', value: this.lineType });
        }
        cs.push({ name: 'mindLineColor', value: this.lineColor });
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

        if (name == 'mindDirection') {
            await this.updateProps({ direction: value }, BlockRenderRange.self);
            this.page.addUpdateEvent(async () => {
                this.renderAllMinds();
                this.mindRoot.forceUpdate()
            })
        }
        else if (name == 'mindLineType') {
            await this.updateProps({ lineType: value }, BlockRenderRange.self);
        }
        else if (name == 'mindLineColor') {
            await this.updateProps({ lineColor: value }, BlockRenderRange.self);
        }
        else if (['fillColor', 'fillOpacity',].includes(name)) {
            var key = name;
            if (name == 'fillColor') key = 'fill';
            this.pattern.setSvgStyle({ [key]: value })
        }
        else if (name == 'borderWidth') {
            await this.updateProps({ 'minBoxStyle.width': value }, BlockRenderRange.self);
        }
        else if (name == 'borderType') {
            await this.updateProps({ 'minBoxStyle.type': value }, BlockRenderRange.self);
        }
        else if (name == 'borderColor') {
            await this.updateProps({ 'minBoxStyle.borderColor': value }, BlockRenderRange.self);
        }
        else if (name == 'borderRadius') {
            await this.updateProps({ 'minBoxStyle.radius': value }, BlockRenderRange.self);
        }
        await super.setBoardEditCommand(name, value)
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
        if (this.minBoxStyle.type == 'none') style.borderStyle = 'none';
        style.borderColor = this.minBoxStyle.borderColor;
        style.fontSize = s.fontSize;
        if (typeof s.fontWeight != 'undefined')
            style.fontWeight = s.fontWeight;
        if (typeof s.fontStyle != 'undefined')
            style.fontStyle = s.fontStyle;
        if (typeof s.textDecoration != 'undefined')
            style.textDecoration = s.textDecoration;
        return style;
    }
    renderAllMinds() {
        this.mindRoot.cacChildsFlowMind(true);
        this.mindRoot.updateAllFlowLines();
    }
    renderMinds() {
        this.cacChildsFlowMind(true);
        this.updateAllFlowLines();
    }
    boardMoveStart(point: Point): void {
        this.moveTo = null;
    }
    boardMove(from: Point, to: Point) {
        super.boardMove(from, to);
        if (this.isMindRoot) {
            return
        }
        var crect = new Rect(0, 0, this.fixedWidth, this.fixedHeight);
        crect = crect.transformToRect(this.globalWindowMatrix);
        var rect = new Rect(to.x, to.y, 0, 0);
        rect = rect.extend(this.realPx(100));
        var gm = this.panelGridMap;
        var bs: { dis: number, rect: Rect, x: number, y: number, block: FlowMind }[] = [];
        gm.findBlocksByRect(rect, (block) => {
            if (block instanceof FlowMind && block !== this) {
                var { width, height } = block.fixedSize;
                var rect = new Rect(0, 0, width, height);
                var nrect = rect.transformToRect(block.globalWindowMatrix);
                bs.push({
                    rect: nrect,
                    dis: nrect.middleCenter.dis(crect.middleCenter),
                    x: nrect.middleCenter.x - crect.middleCenter.x,
                    y: nrect.middleCenter.y - crect.middleCenter.y,
                    block: block
                })
                return true
            }
            else return false;
        })
        if (bs.length > 0) {
            var r = bs.findMin(g => g.dis)
            if (r) {
                if (r.block.mindRoot.mindDirection == 'x') {
                    if (crect.left > r.rect.right && r.block.parentKey == 'otherChilds') {
                        this.moveTo = {
                            block: r.block,
                            rect: r.rect,
                            at: r.block.blocks[r.block.parentKey].length,
                            childKey: r.block.parentKey,
                            posBlock: r.block
                        };
                    }
                    else if (crect.right < r.rect.left && r.block.parentKey == 'subChilds') {
                        this.moveTo = {
                            block: r.block, rect: r.rect,
                            at: r.block.blocks[r.block.parentKey].length,
                            childKey: r.block.parentKey,
                            posBlock: r.block
                        };
                    }
                    else if (crect.top < r.rect.top) {
                        var { width, height } = (r.block.parent as FlowMind).fixedSize;
                        var rect = new Rect(0, 0, width, height);
                        var nrect = rect.transformToRect((r.block.parent as FlowMind).globalWindowMatrix);
                        this.moveTo = {
                            rect: nrect,
                            block: r.block.parent as FlowMind,
                            at: r.block.at,
                            childKey: r.block.parentKey as any,
                            posBlock: r.block
                        };
                    }
                    else if (crect.top > r.rect.top) {
                        var { width, height } = (r.block.parent as FlowMind).fixedSize;
                        var rect = new Rect(0, 0, width, height);
                        var nrect = rect.transformToRect((r.block.parent as FlowMind).globalWindowMatrix);
                        this.moveTo = {
                            rect: nrect,
                            block: r.block.parent as FlowMind,
                            at: r.block.at + 1,
                            childKey: r.block.parentKey as any,
                            posBlock: r.block
                        };
                    }
                }
                else {
                    if (crect.top > r.rect.bottom && r.block.parentKey == 'otherChilds') {
                        this.moveTo = {
                            rect: r.rect,
                            block: r.block,
                            at: r.block.blocks[r.block.parentKey].length,
                            childKey: r.block.parentKey,
                            posBlock: r.block
                        };
                    }
                    else if (crect.bottom > r.rect.top && r.block.parentKey == 'subChilds') {
                        this.moveTo = {
                            rect: r.rect,
                            block: r.block,
                            at: r.block.blocks[r.block.parentKey].length,
                            childKey: r.block.parentKey,
                            posBlock: r.block
                        };
                    }
                    else if (crect.left < r.rect.left) {
                        var { width, height } = (r.block.parent as FlowMind).fixedSize;
                        var rect = new Rect(0, 0, width, height);
                        var nrect = rect.transformToRect((r.block.parent as FlowMind).globalWindowMatrix);
                        this.moveTo = {
                            rect: nrect,
                            block: r.block.parent as FlowMind,
                            at: r.block.parent.at,
                            childKey: r.block.parentKey as any,
                            posBlock: r.block
                        };
                    }
                    else if (crect.left > r.rect.left) {
                        var { width, height } = (r.block.parent as FlowMind).fixedSize;
                        var rect = new Rect(0, 0, width, height);
                        var nrect = rect.transformToRect((r.block.parent as FlowMind).globalWindowMatrix);
                        this.moveTo = {
                            rect: nrect,
                            block: r.block.parent as FlowMind,
                            at: r.block.at + 1,
                            childKey: r.block.parentKey as any,
                            posBlock: r.block
                        };
                    }
                }
            }
            else this.moveTo = null;
        }
        if (this.moveTo) {
            var p = this.moveTo.rect.middleCenter;
            var t = crect.middleCenter;
            if (this.moveTo.block.mindRoot.mindDirection == 'x') {
                p = this.moveTo.childKey == 'subChilds' ? this.moveTo.rect.leftMiddle : this.moveTo.rect.rightMiddle;
                t = this.moveTo.childKey == 'subChilds' ? crect.rightMiddle : crect.leftMiddle;
            }
            else if (this.moveTo.block.mindRoot.mindDirection == 'y') {
                p = this.moveTo.childKey == 'subChilds' ? this.moveTo.rect.topCenter : this.moveTo.rect.bottomCenter;
                t = this.moveTo.childKey == 'subChilds' ? crect.bottomCenter : crect.topCenter;
            }
            var lineD = GetLineSvg(this.moveTo.block.mindRoot.lineType,
                this.moveTo.block.mindRoot.mindDirection as any,
                p,
                t,
                0.4);
            var posRect = new Rect(0, 0, this.moveTo.posBlock.fixedSize.width, this.moveTo.posBlock.fixedSize.height);
            posRect = posRect.transformToRect(this.moveTo.posBlock.globalWindowMatrix);
            var rectPath = `M${posRect.left} ${posRect.top} L${posRect.right} ${posRect.top} L${posRect.right} ${posRect.bottom} L${posRect.left} ${posRect.bottom} L${posRect.left} ${posRect.top}`
            console.log('rectPath', rectPath, lineD);
            VR.renderSvg(`
            <path fill='none' stroke='#ff0000' stroke-width='2' stroke-dasharray="2 2" d=\'${lineD}\'></path>
            <path fill='none' stroke='#ff0000' stroke-width='2' stroke-dasharray="2 2" d=\'${rectPath}\'></path>
            `);
        }
        else VR.unload();
    }
    moveTo: {
        block: FlowMind,
        childKey: 'subChilds' | 'otherChilds',
        at: number,
        rect: Rect,
        posBlock: Block,
    } = null;
    async boardMoveEnd(from: Point, to: Point) {
        if (this.isMindRoot) { await super.boardMoveEnd(from, to); return }
        var oldMindRoot: FlowMind, currentMindRoot: FlowMind;
        if (this.moveTo?.block) {
            oldMindRoot = this.mindRoot;
            await this.moveTo.block.append(this, this.moveTo.at, this.moveTo.childKey);
            currentMindRoot = this.mindRoot;
        }
        this.moveTo = null;
        VR.unload();
        this.moveMatrix = new Matrix();
        if (oldMindRoot) {
            this.page.addUpdateEvent(async () => {
                this.page.onAction('onMindMoveNotify', async () => {
                    oldMindRoot.renderAllMinds()
                    await oldMindRoot.forceUpdate();
                    if (currentMindRoot !== oldMindRoot) {
                        currentMindRoot.renderAllMinds()
                        await currentMindRoot.forceUpdate()
                    }
                    this.page.kit.picker.onPicker([this]);
                })
            })
        }
        else {
            this.view.forceUpdate(() => {
                this.updateRenderLines(true)
            })
        }
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
        var block: FlowMind = this;
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
                block.view.forceUpdate();
                block.page.kit.picker.view.forceUpdate();
                if (isEnd) {
                    block.page.onAction(ActionDirective.onResizeBlock, async () => {
                        if (!matrix.equals(block.matrix)) block.onlyUpdateMatrix(matrix);
                        await block.manualUpdateProps(
                            {
                                fixedWidth: w,
                                fixedHeight: h
                            },
                            { fixedWidth: block.fixedWidth, fixedHeight: block.fixedHeight }, BlockRenderRange.self
                        )
                        block.page.addUpdateEvent(async () => {
                            if (block.isMindRoot) { block.renderAllMinds(); block.forceUpdate(); }
                            else { (block.parent as FlowMind).renderMinds(); block.parent.forceUpdate(); }
                            block.page.kit.picker.onPicker([block], true);
                        })
                    })
                }
            }
        });
    }
    get isCanEmptyDelete() {
        return false
    }
    async didMounted() {
        if (this.isMindRoot) {
            this.renderAllMinds()
        }
    }
    getVisibleBound(): Rect {
        var fs = this.fixedSize;
        var rect = new Rect(0, 0, fs.width, fs.height);
        rect = rect.transformToRect(this.globalWindowMatrix);
        return rect;
    }
    async onInputed(): Promise<void> {
        this.page.kit.picker.onRePicker();
    }
}
@view('/flow/mind')
export class FlowMindView extends BlockView<FlowMind>{
    updateFlowLine() {
        if (this.flowMindLine) {
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
        var text = lst('中心主题');
        if (this.block.deep == 1) text = lst('分支主题');
        else text = lst('子主题')
        return <div className='sy-flow-mind-text'
            style={this.block.contentStyle}
            ref={e => this.mindEl = e} >
            <TextSpanArea placeholder={text} block={this.block}></TextSpanArea>
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
    renderView() {
        var style = this.block.visibleStyle;
        style.padding = 0;
        return <div className='sy-flow-mind' style={style}>
            {this.renderItem()}
            {this.renderSubChilds()}
            <FlowMindLine mind={this.block} ref={e => this.flowMindLine = e}></FlowMindLine>
        </div>
    }
}