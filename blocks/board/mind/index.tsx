
import { BlockView } from "../../../src/block/view";
import React, { CSSProperties } from 'react';
import { prop, url, view } from "../../../src/block/factory/observable";
import { Block } from "../../../src/block";
import { ChildsArea, TextSpanArea } from "../../../src/block/view/appear";
import { Point, PointArrow, Rect, RectUtility } from "../../../src/common/vector/point";
import { FlowMindLine, GetLineSvg } from "./line";
import { BoardPointType, BoardBlockSelector } from "../../../src/block/partial/board";
import { ActionDirective } from "../../../src/history/declare";
import { Matrix } from "../../../src/common/matrix";
import { BlockCssName } from "../../../src/block/pattern/css";
import { BlockRenderRange } from "../../../src/block/enum";
import { BlockChildKey } from "../../../src/block/constant";
import { MouseDragger } from "../../../src/common/dragger";
import { closeBoardEditTool } from "../../../extensions/board.edit.tool";
import { lst } from "../../../i18n/store";
import { VR } from "../../../src/common/render";
import { Polygon } from "../../../src/common/vector/polygon";
import { AppearAnchor } from "../../../src/block/appear";
import { ColorUtil } from "../../../util/color";
import { util } from "../../../util/util";
import './style.less';
import { getTemplateInstance } from "../../../extensions/ai/prompt";
import { getAiDefaultModel } from "../../../net/ai/cost";
import { channel } from "../../../net/channel";
import lodash from 'lodash';
import { onBlockPickLine } from "../../../extensions/ai/util";
import { BoardMindLinghtColorList } from "../../../extensions/color/data";

@url('/flow/mind')
export class FlowMind extends Block {
    async created() {
        if (!(this.pattern.styles && this.pattern.styles[0]?.cssList?.length > 0)) {
            if (this.isMindRoot) {
                await this.pattern.setFontStyle({
                    fontSize: 20,
                    fontWeight: 'bold',
                    color: 'rgb(0,198,145)',
                });
            }
            else {
                this.minBoxStyle.type = 'none';
                await this.pattern.setFontStyle({
                    fontSize: 16,
                });
                await this.pattern.setFillStyle({ color: 'rgb(122,122,122)' });
            }
        }
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
        ]
    }
    @prop()
    align: 'left' | 'center' | 'right' = 'left';
    @prop()
    subMindSpread: boolean = true;
    @prop()
    otherMindSpread: boolean = true;
    @prop()
    isDragSize: boolean = false;
    @prop()
    fixedWidth: number = 60;
    @prop()
    fixedHeight: number = 30;
    @prop()
    lineColor: string;
    @prop()
    lineWidth: number = 3;
    @prop()
    isEditedMindBoxStyle: boolean = false;
    @prop()
    minBoxStyle: {
        width: number,
        type: 'solid' | 'dash' | 'circle' | 'none',
        borderColor: string,
        radius: number
    } = {
            width: 3,
            type: 'solid',
            borderColor: 'rgb(0,198,145)',
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
        var sextendRect = rect.extend(15 / s);
        var extendRect = rect.extend(30 / s);
        var pathRects = RectUtility.getRectLineRects(rect, 2 / s);
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
        pickers.push(...sextendRect.centerPoints.toArray((p, i) => {
            var type = BoardPointType.none;
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
                if (this.mindDirection == 'x' && (i == 0 || i == 2) && !this.isMindRoot) type = BoardPointType.mindAdd;
                else if (this.mindDirection == 'y' && (i == 1 || i == 3) && !this.isMindRoot) type = BoardPointType.mindAdd;
            }
            if (type == BoardPointType.none) return;
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
        pickers.push(...(this.mindDirection == 'none' ? sextendRect : extendRect).centerPoints.toArray((p, i) => {
            var type = BoardPointType.mindAdd;
            if (!this.isMindRoot) {
                if (this.parentKey == 'subChilds') {
                    if (this.mindDirection == 'x' && i == 1) return;
                    else if (this.mindDirection == 'y' && i == 2) return;
                    if (this.subMindSpread == false) return;
                }
                else if (this.parentKey == 'otherChilds') {
                    if (this.mindDirection == 'x' && i == 3) return;
                    else if (this.mindDirection == 'y' && i == 0) return;
                    if (this.otherMindSpread == false) return;
                }
            }
            if (this.mindDirection != 'none') {
                if (this.mindDirection == 'x' && (i == 0 || i == 2)) return;
                else if (this.mindDirection == 'x') {
                    if (i == 1 && this.otherMindSpread == false) return;
                    if (i == 3 && this.subMindSpread == false) return;
                }
                if (this.mindDirection == 'y' && (i == 1 || i == 3)) return;
                else if (this.mindDirection == 'y') {
                    if (i == 0 && this.subMindSpread == false) return;
                    if (i == 2 && this.otherMindSpread == false) return;
                }
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
        pickers.push(...rect.centerPoints.toArray((p, i) => {
            var type = BoardPointType.mindSpread;
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
            var data: Record<string, any> = {};
            if (this.mindDirection != 'none') {
                if (this.mindDirection == 'x' && (i == 0 || i == 2)) return;
                else if (this.mindDirection == 'y' && (i == 1 || i == 3)) return;
                if (this.mindDirection == 'x' && (i == 1 || i == 3)) {
                    if (i == 3 && (this.subChilds.length == 0 || this.subMindSpread == false)) return;
                    else if (i == 3) data.key = 'subMindSpread';
                    if (i == 1 && (this.otherChilds.length == 0 || this.otherMindSpread == false)) return;
                    else if (i == 1) data.key = 'otherMindSpread';
                }
                if (this.mindDirection == 'y' && (i == 0 || i == 2)) {
                    if (i == 0 && (this.subChilds.length == 0 || this.subMindSpread == false)) return;
                    else if (i == 0) data.key = 'subMindSpread';
                    if (i == 2 && (this.otherChilds.length == 0 || this.otherMindSpread == false)) return;
                    else if (i == 2) data.key = 'otherMindSpread';
                }
            }
            else return;
            var arrows: PointArrow[] = [];
            if (i == 0) arrows = [PointArrow.top, PointArrow.center];
            else if (i == 1) arrows = [PointArrow.middle, PointArrow.right];
            else if (i == 2) arrows = [PointArrow.bottom, PointArrow.center]
            else if (i == 3) arrows = [PointArrow.middle, PointArrow.left]
            return {
                type,
                arrows,
                point: gm.transform(p),
                data
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
    get isSingleMind() {
        return this.subChilds.length == 0 && this.otherChilds.length == 0
    }
    async onPickerMousedown(selector: BoardBlockSelector, event: React.MouseEvent) {
        var self = this;
        if (selector.type == BoardPointType.mindAdd) {
            await this.page.onAction(ActionDirective.onMindAddSub, async () => {
                var keys = 'subChilds';
                var pa: FlowMind = this;
                var at: number;
                var data: Record<string, any> = {};
                if (selector.arrows.every(g => [PointArrow.top, PointArrow.center].includes(g))) {
                    if (this.isMindRoot) { await this.updateProps({ direction: 'y' }, BlockRenderRange.self); keys = 'subChilds'; }
                    else {
                        if (this.mindDirection == 'x') {
                            pa = this.parent as FlowMind;
                            at = this.at;
                            keys = this.parentKey;
                            data = await this.cloneData();
                            data.blocks = {};
                            data.content = '';
                        }
                        else if (this.mindDirection == 'y') {
                            keys = 'subChilds';
                        }
                    }
                }
                else if (selector.arrows.every(g => [PointArrow.bottom, PointArrow.center].includes(g))) {
                    if (this.isMindRoot) { await this.updateProps({ direction: 'y' }, BlockRenderRange.self); keys = 'otherChilds'; }
                    else {
                        if (this.mindDirection == 'x') {
                            pa = this.parent as FlowMind;
                            at = this.at + 1;
                            keys = this.parentKey;
                            data = await this.cloneData();
                            data.blocks = {};
                            data.content = '';
                        }
                        else if (this.mindDirection == 'y') {
                            keys = 'otherChilds';
                        }
                    }
                }
                else if (selector.arrows.every(g => [PointArrow.middle, PointArrow.right].includes(g))) {
                    if (this.isMindRoot) { await this.updateProps({ direction: 'x' }, BlockRenderRange.self); keys = 'otherChilds'; }
                    else {
                        if (this.mindDirection == 'x') {
                            keys = 'otherChilds';
                        }
                        else if (this.mindDirection == 'y') {
                            pa = this.parent as FlowMind;
                            at = this.at + 1;
                            keys = this.parentKey;
                            data = await this.cloneData();
                            data.blocks = {};
                            data.content = '';
                        }
                    }
                }
                else if (selector.arrows.every(g => [PointArrow.middle, PointArrow.left].includes(g))) {
                    if (this.isMindRoot) {
                        await this.updateProps({ direction: 'x' }, BlockRenderRange.self);
                        keys = 'subChilds';
                    }
                    else {
                        if (this.mindDirection == 'x') {
                            keys = 'otherChilds';
                            keys = 'subChilds';
                        }
                        else if (this.mindDirection == 'y') {
                            pa = this.parent as FlowMind;
                            at = this.at + 1;
                            keys = this.parentKey;
                            data = await this.cloneData();
                            data.blocks = {};
                            data.content = '';
                        }
                    }
                }
                if ((pa as FlowMind).isMindRoot) {
                    data.lineColor = BoardMindLinghtColorList().randomOf().color
                }
                console.log('data', data);
                var newBlock = await self.page.createBlock('/flow/mind',
                    data,
                    pa,
                    at,
                    keys
                );
                newBlock.mounted(async () => {
                    this.renderAllMinds();
                    await this.mindRoot.forceManualUpdate();
                    await self.page.kit.picker.onPicker([newBlock], { merge: true, disabledOpenTool: true });
                    await util.delay(100);
                    await self.page.kit.anchorCursor.onFocusBlockAnchor(newBlock, { render: true, last: true, merge: true })
                })
            })
        }
        else if (selector.type == BoardPointType.mindSpread) {
            var key = selector.data.key;
            await this.onMindSpread(key);
            this.page.kit.picker.onRePicker();
        }
    }
    async onMindSpread(key: string) {
        await this.page.onAction('onMindSpread', async () => {
            await this.updateProps({ [key]: !this[key] }, BlockRenderRange.self);
        })
        this.renderAllMinds();
    }
    updateRenderLines(isSelfUpdate?: boolean, isAll?: boolean): void {
        super.updateRenderLines(isSelfUpdate);
        if (this.parent instanceof FlowMind && (this.parent.view as any)) {
            (this.parent.view as any).updateFlowLine();
        }
        if ((this.view as any))
            (this.view as any).updateFlowLine();
        if (isAll) {
            this.blocks.subChilds.forEach((c: FlowMind) => c.updateRenderLines(isSelfUpdate, isAll));
            this.blocks.otherChilds.forEach((c: FlowMind) => c.updateRenderLines(isSelfUpdate, isAll));
        }
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
    cacChildsFlowMind(deep?: boolean, isUpdateMatrixView?: boolean) {
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
            if (this.subMindSpread !== false)
                this.blocks.subChilds.each((item: FlowMind, i: number) => {
                    if (deep) item.cacChildsFlowMind(deep, isUpdateMatrixView);
                    var rc = item.cacDirectionRange('left');
                    var fs = item.fixedSize;
                    var matrix = new Matrix();
                    var h = Math.max(rc.h, fs.height);
                    matrix.translate(0 - offset - fs.width, topStart + (h - fs.height) / 2);
                    topStart += h;
                    topStart += gap;
                    item.onlyUpdateMatrix(matrix);
                    if (isUpdateMatrixView && item.el) {
                        item.el.style.transform = item.matrix.getCss().transform;
                    }
                });
            var topStart = 0 - (this.cacDirectionRange('right').h / 2 - rect.height / 2);
            if (this.otherMindSpread !== false)
                this.blocks.otherChilds.each((item: FlowMind, i: number) => {
                    if (deep) item.cacChildsFlowMind(deep, isUpdateMatrixView);
                    var rc = item.cacDirectionRange('right');
                    var fs = item.fixedSize;
                    var matrix = new Matrix();
                    var h = Math.max(rc.h, fs.height);
                    matrix.translate(offset + rect.width, topStart + (h - fs.height) / 2);
                    topStart += h;
                    topStart += gap;
                    item.onlyUpdateMatrix(matrix);
                    if (isUpdateMatrixView && item.el) {
                        item.el.style.transform = item.matrix.getCss().transform;
                    }
                });
        }
        else if (this.mindRoot.direction == 'y') {
            if (this.parent && this.parent instanceof FlowMind && !(this.parent as FlowMind).isMindRoot) {
                var pa = this.parent as FlowMind;
                var pr = pa.cacDirectionRange('left');
                if (pr.h > fs.height) offset += pr.h - fs.height;
            }
            var leftStart = rect.width / 2 - this.cacDirectionRange('top').w / 2;
            if (this.subMindSpread !== false)
                this.blocks.subChilds.each((item: FlowMind, i: number) => {
                    if (deep) item.cacChildsFlowMind(deep, isUpdateMatrixView);
                    var rc = item.cacDirectionRange('top');
                    var fs = item.fixedSize;
                    var matrix = new Matrix();
                    var w = Math.max(rc.w, fs.width);
                    matrix.translate(leftStart + (w - fs.width) / 2, 0 - offset - fs.height);
                    leftStart += w;
                    leftStart += gap;
                    item.onlyUpdateMatrix(matrix);
                    if (isUpdateMatrixView && item.el) {
                        item.el.style.transform = item.matrix.getCss().transform;
                    }
                });
            var leftStart = rect.width / 2 - this.cacDirectionRange('bottom').w / 2;
            if (this.otherMindSpread !== false)
                this.blocks.otherChilds.each((item: FlowMind, i: number) => {
                    if (deep) item.cacChildsFlowMind(deep, isUpdateMatrixView);
                    var rc = item.cacDirectionRange('bottom');
                    var fs = item.fixedSize;
                    var matrix = new Matrix();
                    var w = Math.max(rc.w, fs.width);
                    matrix.translate(leftStart + (w - fs.width) / 2, offset + rect.height);
                    leftStart += w;
                    leftStart += gap;
                    item.onlyUpdateMatrix(matrix);
                    if (isUpdateMatrixView && item.el) {
                        item.el.style.transform = item.matrix.getCss().transform;
                    }
                });
        }
    }
    async getBoardEditCommand(): Promise<{ name: string; value?: any; }[]> {
        var bold = this.pattern.css(BlockCssName.font)?.fontWeight;
        var cs: { name: string; value?: any; }[] = [];
        var svgStyle = this.pattern.getSvgStyle();
        var ft = this.pattern.css(BlockCssName.font);
        if (this.isMindRoot) {
            cs.push({ name: 'mindDirection', value: this.direction });
            cs.push({ name: 'mindLineType', value: this.lineType });
        }
        cs.push({ name: 'mindLineColor', value: this.lineColor });
        cs.push({ name: 'fontFamily', value: this.pattern.css(BlockCssName.font)?.fontFamily });
        cs.push({ name: 'fontSize', value: Math.round(this.pattern.css(BlockCssName.font)?.fontSize || 14) });
        cs.push({ name: 'fontWeight', value: bold == 'bold' || bold == 500 ? true : false });
        cs.push({
            name: 'fontStyle',
            value: ft?.fontStyle === 'italic' || (ft?.fontStyle as any) === true ? true : false
        });
        cs.push({ name: 'textDecoration', value: this.pattern.css(BlockCssName.font)?.textDecoration });
        cs.push({ name: 'fontColor', value: this.pattern.css(BlockCssName.font)?.color });
        cs.push({ name: 'backgroundColor', value: this.pattern.getSvgStyle()?.fill });
        cs.push({ name: 'bgOpacity', value: typeof svgStyle?.fillOpacity == 'number' ? svgStyle.fillOpacity : 1 });

        cs.push({ name: 'borderWidth', value: this.minBoxStyle.width });
        cs.push({ name: 'borderType', value: this.minBoxStyle.type });
        cs.push({ name: 'borderColor', value: this.minBoxStyle.borderColor });
        cs.push({ name: 'borderRadius', value: this.minBoxStyle.radius });
        cs.push({ name: 'align', value: this.align });
        cs.push({ name: "ai" });
        return cs;
    }
    async setBoardEditCommand(name: string, value: any) {
        if (name == 'mindDirection') {
            await this.updateProps({ direction: value }, BlockRenderRange.self);
            this.page.addActionCompletedEvent(async () => {
                this.renderAllMinds();
                this.mindRoot.forceManualUpdate()
            })
        }
        else if (name == 'mindLineType') {
            await this.updateProps({ lineType: value }, BlockRenderRange.self);
            this.page.addActionCompletedEvent(async () => {
                this.mindRoot.forceManualUpdate(undefined, true)
            })
        }
        else if (name == 'mindLineColor') {
            await this.updateProps({ lineColor: value }, BlockRenderRange.self);
            this.page.addActionCompletedEvent(async () => {
                this.mindRoot.forceManualUpdate(undefined, true)
            })
        }
        else if (['backgroundColor', 'bgOpacity',].includes(name)) {
            var key = name;
            if (name == 'backgroundColor') key = 'fill';
            else if (name == 'bgOpacity') key = 'bgOpacity';
            await this.pattern.setSvgStyle({ [key]: value })
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
        else if (name == 'align') {
            await this.updateProps({ 'align': value }, BlockRenderRange.self);
        }
        await super.setBoardEditCommand(name, value)
    }
    async getBoardCopyStyle() {
        var r = await super.getBoardCopyStyle();
        ['mindDirection', 'mindLineType'].forEach(c => {
            delete r.data[c];
        })
        return r;
    }
    async setBoardCopyStyle(this: Block, name: string, value) {
        //console.log('setBoardCopyStyle', name, value);
        await this.setBoardEditCommand(name, value);
    }
    get contentStyle() {
        var style: CSSProperties = {
        };
        var s = this.pattern.style;
        if (s.fill) style.backgroundColor = s.fill;
        if (typeof s.fillOpacity == 'number' && s.fill) {
            var c = ColorUtil.parseColor(s.fill);
            c.a = s.fillOpacity * 100;
            style.backgroundColor = ColorUtil.toRGBA(c);
        }
        Object.assign(style, s);
        style.width = this.fixedWidth;
        style.borderRadius = this.minBoxStyle.radius;
        style.borderWidth = this.minBoxStyle.width;
        style.borderStyle = this.minBoxStyle.type == 'solid' ? 'solid' : 'dashed';
        if (this.minBoxStyle.type == 'none') style.borderStyle = 'none';
        style.borderColor = this.minBoxStyle.borderColor;
        return style;
    }
    get visibleStyle() {
        var style: CSSProperties = {};
        if (this.isFreeBlock) {
            style.position = 'absolute';
            style.zIndex = this.zindex;
            style.top = 0;
            style.left = 0;
            style.transformOrigin = '0% 0%';
            Object.assign(style, this.transformStyle);
        }
        else {
            if (this.isBlock) {
                Object.assign(style, {
                    paddingTop: '0.2rem',
                    paddingBottom: '0.2rem',
                });
            }
            else if (this.isLine) {
                style.display = 'inline-block';
            }
            var s = this.pattern.style;
            delete s.backgroundColor;
            Object.assign(style, s);
        }
        return style;
    }
    renderAllMinds() {
        this.mindRoot.renderMinds();
    }
    renderMinds(isSelfUpdate: boolean = true) {
        this.cacChildsFlowMind(true);
        this.updateRenderLines(isSelfUpdate, true);
    }
    manualRenderMindes() {
        this.cacChildsFlowMind(true, true);
        this.updateRenderLines(false, true);
    }
    boardMoveStart(point: Point): void {
        this.moveTo = null;
    }
    boardMove(from: Point, to: Point) {
        super.boardMove(from, to);
        if (this.isMindRoot) {
            this.renderAllMinds();
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
                if (this.exists(g => g === this)) return false;
                var { width, height } = block.fixedSize;
                var rect = new Rect(0, 0, width, height);
                var nrect = rect.transformToRect(block.globalWindowMatrix);
                var dis = nrect.middleCenter.dis(crect.middleCenter);
                if (dis > 200) return false;
                if (this.subChilds.length > 0 && this.otherChilds.length > 0) {
                    return false;
                }
                if (this.subChilds.length > 0 && this.otherChilds.length == 0) {
                    if (!block.isMindRoot && block.parentKey != 'subChilds') {
                        return false
                    }
                }
                else if (this.subChilds.length == 0 && this.otherChilds.length > 0) {
                    if (!block.isMindRoot && block.parentKey != 'otherChilds') {
                        return false
                    }
                }
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

                if (r.block.mindRoot.mindDirection == 'x' || r.block.mindRoot.mindDirection == 'none') {
                    var isLeft: boolean = crect.left > r.rect.right;
                    var isRight = crect.right < r.rect.left
                    var isTop = crect.top < r.rect.top;
                    var isBottom = crect.bottom > r.rect.bottom;
                    if (r.block.isMindRoot) {
                        isLeft = crect.left > r.rect.center;
                        isRight = crect.right < r.rect.center;
                        if (isLeft && this.subChilds.length == 0) {
                            this.moveTo = {
                                block: r.block,
                                rect: r.rect,
                                at: r.block.blocks['otherChilds'].length,
                                childKey: 'otherChilds',
                                posBlock: r.block
                            };
                        }
                        else if (isRight && this.otherChilds.length == 0) {
                            this.moveTo = {
                                block: r.block,
                                rect: r.rect,
                                at: r.block.blocks['subChilds'].length,
                                childKey: 'subChilds',
                                posBlock: r.block
                            };
                        }
                    }
                    else {
                        if (r.block.parentKey == 'subChilds' && this.otherChilds.length == 0 || r.block.parentKey == 'otherChilds' && this.subChilds.length == 0) {
                            var k = r.block.parentKey;
                            if (isLeft) {
                                this.moveTo = {
                                    block: r.block,
                                    rect: r.rect,
                                    at: r.block.blocks[k].length,
                                    childKey: k,
                                    posBlock: r.block
                                };
                            }
                            else if (isTop) {
                                this.moveTo = {
                                    block: r.block.parent as FlowMind,
                                    rect: r.rect,
                                    at: r.block.at,
                                    childKey: k,
                                    posBlock: r.block
                                };
                            }
                            else if (isBottom) {
                                this.moveTo = {
                                    block: r.block.parent as FlowMind,
                                    rect: r.rect,
                                    at: r.block.at + 1,
                                    childKey: k,
                                    posBlock: r.block
                                };
                            }
                        }
                    }
                }
                else if (r.block.mindRoot.mindDirection == 'y') {
                    var isLeft: boolean = crect.bottom > r.rect.bottom;
                    var isRight = crect.top < r.rect.top
                    var isTop = crect.right < r.rect.right;
                    var isBottom = crect.left > r.rect.left;
                    if (r.block.isMindRoot) {
                        isLeft = crect.bottom > r.rect.middle;
                        isRight = crect.bottom < r.rect.middle;
                        if (isLeft && this.subChilds.length == 0) {
                            this.moveTo = {
                                block: r.block,
                                rect: r.rect,
                                at: r.block.blocks['otherChilds'].length,
                                childKey: 'otherChilds',
                                posBlock: r.block
                            };
                        }
                        else if (isRight && this.otherChilds.length == 0) {
                            this.moveTo = {
                                block: r.block,
                                rect: r.rect,
                                at: r.block.blocks['subChilds'].length,
                                childKey: 'subChilds',
                                posBlock: r.block
                            };
                        }
                    }
                    else {
                        if (r.block.parentKey == 'subChilds' && this.otherChilds.length == 0 || r.block.parentKey == 'otherChilds' && this.subChilds.length == 0) {
                            var k = r.block.parentKey;
                            if (isLeft) {
                                this.moveTo = {
                                    block: r.block,
                                    rect: r.rect,
                                    at: r.block.blocks[k].length,
                                    childKey: k,
                                    posBlock: r.block
                                };
                            }
                            else if (isTop) {
                                this.moveTo = {
                                    block: r.block.parent as FlowMind,
                                    rect: r.rect,
                                    at: r.block.at,
                                    childKey: k,
                                    posBlock: r.block
                                };
                            }
                            else if (isBottom) {
                                this.moveTo = {
                                    block: r.block.parent as FlowMind,
                                    rect: r.rect,
                                    at: r.block.at + 1,
                                    childKey: k,
                                    posBlock: r.block
                                };
                            }
                        }
                    }
                }
            }
            else this.moveTo = null;
        }
        if (this.moveTo) {
            var p = this.moveTo.rect.middleCenter;
            var t = crect.middleCenter;
            if (this.moveTo.block.mindRoot) {
                if (this.moveTo.block.mindRoot.mindDirection == 'x' || this.moveTo.block.mindRoot.mindDirection == 'none') {
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
                VR.renderSvg(`
                <path fill='none' stroke='#ff0000' stroke-width='2' stroke-dasharray="2 2" d=\'${lineD}\'></path>
                <path fill='none' stroke='#ff0000' stroke-width='2' stroke-dasharray="2 2" d=\'${rectPath}\'></path>
                `);
            }
            else {
                VR.unload();
            }
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
        if (this.isMindRoot && !this.moveTo?.block?.mindRoot) {
            await super.boardMoveEnd(from, to);
            this.page.addActionCompletedEvent(async () => {
                this.renderAllMinds();
            })
            return
        }
        var oldMindRoot: FlowMind, currentMindRoot: FlowMind;
        if (this.moveTo?.block?.mindRoot) {
            oldMindRoot = this.mindRoot;
            if (this.moveTo.block.mindRoot.direction == 'none') {
                await this.moveTo.block.mindRoot.updateProps({ direction: "x" })
            }
            await this.moveTo.block.append(this, this.moveTo.at, this.moveTo.childKey);
            currentMindRoot = this.mindRoot;
        }
        this.moveTo = null;
        VR.unload();
        this.moveMatrix = new Matrix();
        if (oldMindRoot) {
            this.page.addActionCompletedEvent(async () => {
                oldMindRoot.renderAllMinds()
                await oldMindRoot.forceManualUpdate();
                if (currentMindRoot !== oldMindRoot) {
                    currentMindRoot.renderAllMinds()
                    await currentMindRoot.forceManualUpdate()
                }
            })
            this.page.addActionAfterEvent(async () => {
                await this.page.kit.picker.onPicker([this], { merge: true });
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
        var isDs = this.isDragSize;
        MouseDragger({
            event,
            moveStart() {
                closeBoardEditTool();
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
                block.isDragSize = true;
                block.updateRenderLines();
                block.forceManualUpdate();
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
                        if (isDs == false)
                            await block.manualUpdateProps({ isDragSize: false }, { isDragSize: true }, BlockRenderRange.self);
                        block.page.addActionCompletedEvent(async () => {
                            if (block.isMindRoot) {
                                block.renderAllMinds();
                                await block.forceManualUpdate();
                            }
                            else {
                                (block.parent as FlowMind).renderMinds();
                                await block.parent.forceManualUpdate();
                            }
                            util.delay(200).then(() => {
                                block.page.kit.picker.onRePicker(true)
                            })
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
    getVisibleContentBound() {
        return this.getVisibleBound()
    }
    async onInputed(): Promise<void> {
        this.page.kit.picker.onRePicker();
    }
    focusAnchor(this: Block, anchor: AppearAnchor) {
        this.page.kit.picker.onRePicker();
    }
    blurAnchor(this: Block, anchor: AppearAnchor) {
        this.page.kit.picker.onRePicker();
    }
    async mindAI(command, content) {

        if (this.isMindRoot && this.direction == 'none') {
            this.updateProps({
                direction: 'x'
            }, BlockRenderRange.self)
        }
        var text = await new Promise((resolve: (r: string) => void, reject) => {
            var prompt = getTemplateInstance(command, { content: content });
            var anwser = '';
            var mindText = '';

            var current: FlowMind = this;
            var currentDeep: string = '';
            var willCreateSubMind: boolean = false;

            var keys = this.parentKey;
            if (this.isMindRoot) {
                keys = BlockChildKey.otherChilds;
                if (this.otherChilds.length == 0 && this.subChilds.length > 0) keys = BlockChildKey.subChilds;
            }
            var isGetRoot = false;
            var sus: { n: number, text: string }[] = [{ n: this.deep, text: currentDeep }];
            var createSubMind = async (ts: { deep: string, text: string }[]) => {
                if (willCreateSubMind) return;
                willCreateSubMind = true;

                try {
                    for (let i = 0; i < ts.length; i++) {
                        var t = ts[i];

                        if (t?.text.startsWith('``') || t?.text == '' || t.deep == '') continue;
                        if (t.deep == '#' || t.deep == '' || isGetRoot == false && t.deep.length == 1 && (t.text == content || `*${content}*` == t.text || `**${content}**` == t.text)) {
                            isGetRoot = true;
                            continue;
                        }
                        var pos: 'next' | 'parent' | 'sub' = 'next';
                        if (t.deep.indexOf('#') > -1) {
                            if (currentDeep.indexOf('#') == -1) {
                                if (!currentDeep) pos = 'sub'
                                else pos = 'parent'
                            }
                            else {
                                if (t.deep.length < currentDeep.length) {
                                    pos = 'parent'
                                }
                                else if (t.deep.length > currentDeep.length) {
                                    pos = 'sub'
                                }
                            }
                        }
                        else {
                            if (currentDeep.indexOf('#') > -1 || !currentDeep) {
                                pos = 'sub'
                            }
                            else {
                                if (t.deep.length < currentDeep.length) {
                                    pos = 'parent'
                                }
                                else if (t.deep.length > currentDeep.length) {
                                    pos = 'sub'
                                }
                            }
                        }
                        var newBlock: Block


                        if (pos == 'next') {
                            newBlock = await this.page.createBlock('/flow/mind', {
                                content: t.text,
                                lineColor: (current.parent as FlowMind)?.isMindRoot ? BoardMindLinghtColorList().randomOf().color : undefined,

                            }, current.parent, current.at + 1, current.parentKey);
                        }
                        else if (pos == 'parent') {
                            var su;
                            for (let i = 1; i < sus.length; i++) {
                                if (sus[i].text.indexOf('#') > -1) {
                                    if (t.deep.indexOf('#') > -1 && t.deep.length == sus[i].text.length) {
                                        su = sus[i];
                                        break;
                                    }
                                }
                                else {
                                    if (t.deep.length == sus[i].text.length) {
                                        su = sus[i];
                                        break;
                                    }
                                }
                            }
                            var pa = current.parent as FlowMind;
                            if (su) {
                                var n = pa.deep - su.n;
                                for (let m = 0; m < n; m++) {
                                    pa = pa.parent as FlowMind;
                                }
                            }
                            newBlock = await this.page.createBlock('/flow/mind', {
                                content: t.text,

                                lineColor: (pa.parent as FlowMind)?.isMindRoot ? BoardMindLinghtColorList().randomOf().color : undefined,

                            }, pa.parent, pa.at + 1, pa.parentKey);
                        }
                        else if (pos == 'sub') {
                            var nd = current.deep + 1;
                            if (!sus.find(g => g.n == nd)) {
                                sus.push({
                                    n: nd,
                                    text: t.deep
                                })
                            }
                            newBlock = await this.page.createBlock('/flow/mind', {
                                content: t.text,
                                lineColor: (current as FlowMind)?.isMindRoot ? BoardMindLinghtColorList().randomOf().color : undefined,
                            }, current, current.blocks[keys].length, keys);
                        }
                        await onBlockPickLine(this.page, newBlock, false);
                        newBlock.mounted(async () => {
                            this.renderAllMinds();
                            await this.forceManualUpdate();
                        })
                        newBlock.parent.forceManualUpdate();
                        current = newBlock as FlowMind;
                        currentDeep = t.deep;
                    }
                }
                catch (ex) {
                    console.error(ex);
                }
                finally {
                    willCreateSubMind = false;
                }
            }

            var getTs = (text) => {
                var ts = text.split(/\n/g).map((t, i) => {
                    t = t.trimEnd();
                    if (!t.trim()) return null;
                    var at = -1;
                    ["+", "-", '*', ".", '•'].forEach(c => {
                        if (t.indexOf(c) > -1 && at == -1) {
                            at = t.indexOf(c) + 1
                        }
                    })
                    if (at == -1) {
                        if (t.indexOf('#') > -1) {
                            var n = t.replace(/^[\s]*#+/g, '');
                            at = t.indexOf(n);
                        }
                    }
                    if (at == -1) return {
                        deep: '',
                        text: t.trim()
                    }
                    return {
                        deep: t.slice(0, at),
                        text: t.slice(at).trim(),
                    }
                })
                lodash.remove(ts, g => g ? false : true);
                return ts;
            }
            channel.post('/text/ai/stream', {
                question: prompt,
                model: getAiDefaultModel(this?.page.ws?.aiConfig?.text),
                async callback(str, done, contoller) {
                    if (typeof str == 'string') {
                        anwser += str;
                        mindText += str;
                    }
                    if (willCreateSubMind == false) {
                        if (anwser.indexOf('\n') > -1) {
                            var text = anwser.slice(0, anwser.lastIndexOf('\n'));
                            anwser = anwser.slice(anwser.lastIndexOf('\n') + 1);
                            createSubMind(getTs(text));
                        }
                    }
                    if (done) {
                        if (anwser) {
                            for (let i = 0; i < 1000; i++) {
                                if (willCreateSubMind == false) {
                                    await createSubMind(getTs(anwser));
                                    break;
                                }
                                await util.delay(3);
                            }
                        }
                        resolve(mindText)
                    }
                }
            });

        })
        this.page.addActionAfterEvent(async () => {
            await util.delay(10);
            this.renderAllMinds();
            await this.forceManualUpdate();
        })

    }
}

@view('/flow/mind')
export class FlowMindView extends BlockView<FlowMind> {
    updateFlowLine() {
        if (this.flowMindLine) {
            var { width, height } = this.block.fixedSize;
            var rect = new Rect(0, 0, width, height);
            var leftOrigin = this.block.mindDirection != 'y' ? rect.leftMiddle : rect.topCenter;
            var leftPoints = this.block.blocks.subChilds.map((sub: FlowMind) => {
                var s = sub.fixedSize;
                var subRect = new Rect(0, 0, s.width, s.height);
                return { mind: sub, point: sub.matrix.appended(sub.moveMatrix).transform(this.block.mindDirection != 'y' ? subRect.rightMiddle : subRect.bottomCenter) };
            });
            if (this.block.subMindSpread === false) leftPoints = [];
            var rightOrigin = this.block.mindDirection != 'y' ? rect.rightMiddle : rect.bottomCenter;
            var rightPoints = this.block.blocks.otherChilds.map((sub: FlowMind) => {
                var s = sub.fixedSize;
                var subRect = new Rect(0, 0, s.width, s.height);
                return { mind: sub, point: sub.matrix.appended(sub.moveMatrix).transform(this.block.mindDirection != 'y' ? subRect.leftMiddle : subRect.topCenter) };
            });
            if (this.block.otherMindSpread === false) rightPoints = [];
            this.flowMindLine.updateView(
                this.block.mindDirection,
                leftOrigin,
                leftPoints,
                rightOrigin,
                rightPoints,
            );
        }
        else {
            console.log(this.block, 'flow empty...')
        }
    }
    renderItem() {
        var text = lst('中心主题');
        if (this.block.deep == 1) text = lst('分支主题');
        else text = lst('子主题')
        var cs = this.block.contentStyle;
        cs.pointerEvents = 'visible';
        if (this.block.isDragSize == false) {
            delete cs.width;
            cs.display = 'inline-flex'
        }
        else { cs.display = 'flex'; }
        if (this.block.align == 'left')
            cs.justifyContent = 'flex-start';
        else if (this.block.align == 'center')
            cs.justifyContent = 'center';
        else if (this.block.align == 'right')
            cs.justifyContent = 'flex-end';
        return <div className={'sy-flow-mind-text ' + (this.block.subMindSpread === false || this.block.otherMindSpread == false ? "relative" : "")}
            style={cs}
            ref={e => this.mindEl = e} >
            <div style={{ margin: '5px 10px' }}>
                <TextSpanArea isBlock placeholderEmptyVisible placeholder={text} block={this.block}></TextSpanArea>
            </div>
            {this.renderSpread()}
        </div>
    }
    renderSpread() {
        var s = 16;
        if (this.block.otherChilds.length == 0 && this.block.subChilds.length == 0) return <></>
        if (this.block.mindRoot.direction == 'x') {
            return <div>
                {this.block.otherChilds.length > 0 && this.block.otherMindSpread == false && <div onMouseDown={e => { e.stopPropagation(); this.block.onMindSpread('otherMindSpread') }} className="pos flex-center sy-flow-mind-spread" style={{ top: '50%', right: -2, transform: 'translate(100%, -50%)' }}><div className="circle cursor flex-center" style={{ width: s, height: s }}>
                    <span style={{ fontSize: 14 }}>{this.block.otherChilds.length}</span>
                </div>
                </div>}
                {this.block.subChilds.length > 0 && this.block.subMindSpread == false && <div onMouseDown={e => { e.stopPropagation(); this.block.onMindSpread('subMindSpread') }} className="pos flex-center  sy-flow-mind-spread" style={{ top: '50%', left: -2, transform: 'translate(-100%, -50%)' }}>
                    <div className="circle cursor flex-center" style={{ width: s, height: s }}>
                        <span style={{ fontSize: 14 }}>{this.block.subChilds.length}</span>
                    </div>
                </div>}
            </div>
        }
        else {
            return <div>
                {this.block.otherChilds.length > 0 && this.block.otherMindSpread == false && <div onMouseDown={e => { e.stopPropagation(); this.block.onMindSpread('otherMindSpread') }} className="pos flex-center sy-flow-mind-spread" style={{ left: '50%', bottom: -2, transform: 'translate(-50%,100%)' }}><div className="circle cursor flex-center" style={{ width: s, height: s }}>
                    <span style={{ fontSize: 14 }}>{this.block.otherChilds.length}</span>
                </div>
                </div>}
                {this.block.subChilds.length > 0 && this.block.subMindSpread == false && <div onMouseDown={e => { e.stopPropagation(); this.block.onMindSpread('subMindSpread') }} className="pos flex-center  sy-flow-mind-spread" style={{ left: '50%', top: -2, transform: 'translate(-50%,-100%)' }}>
                    <div className="circle cursor flex-center" style={{ width: s, height: s }}>
                        <span style={{ fontSize: 14 }}>{this.block.subChilds.length}</span>
                    </div>
                </div>}
            </div>
        }
    }
    mindEl: HTMLElement;
    renderSubChilds() {
        return <div style={{ pointerEvents: 'visible' }}>
            {this.block.subMindSpread && <ChildsArea childs={this.block.blocks.subChilds}></ChildsArea>}
            {this.block.otherMindSpread && <ChildsArea childs={this.block.blocks.otherChilds}></ChildsArea>}
        </div>
    }
    flowMindLine: FlowMindLine;
    renderView() {
        var style = this.block.visibleStyle;
        style.padding = 0;
        if (this.block.isDragSize == false) {
            style.width = 250;
            style.pointerEvents = 'none'
        }
        return <div className='sy-flow-mind' style={style}>
            {this.renderItem()}
            {this.renderSubChilds()}
            <FlowMindLine mind={this.block} ref={e => this.flowMindLine = e}></FlowMindLine>
            {this.renderComment()}
        </div>
    }
}

/**
 * 存在的问题
 * 将子节点拖到父节点右侧没感应（引时父节点没有子节点）
 * 节点的连接线端点，点击松开（不应自动创建线，至少方位不对）
 * 输入时，文本框没有自适应
 * mind的节点线，感觉调整样式风格极为不方便
 * 频道的消息通知有问题
 */