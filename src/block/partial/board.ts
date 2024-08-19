
import { Block } from "..";
import { Line, PortLocation } from "../../../blocks/board/line/line";
import { closeBoardEditTool } from "../../../extensions/board.edit.tool";
import { MouseDragger } from "../../common/dragger";
import { Matrix } from "../../common/matrix";
import { Point, PointArrow, Rect, RectUtility } from "../../common/vector/point";
import { Polygon } from "../../common/vector/polygon";
import { ActionDirective } from "../../history/declare";
import { openBoardEditTool } from "../../kit/operator/board/edit";
import { CacBlockAlignLines } from "../../kit/picker/common";
import { BlockUrlConstant } from "../constant";
import { Group } from "../element/group";
import { BlockRenderRange } from "../enum";
import lodash from 'lodash';

export enum BoardPointType {
    none,
    /**
     * 路径
     */
    path,
    /**
     * 当鼠标移上去，块上面显示的可以连接的块点
     */
    pathConnectPort,
    /**
     * 调整块的大小
     */
    resizePort,
    /**
     * 创建线来连结
     */
    connectPort,
    /***
     * 线的端点（可以移动的）
     */
    lineMovePort,
    /**
     * 线的分割点
     */
    lineSplitPort,
    /**
     * 折线的控制点
     */
    brokenLinePort,
    /**
     * 折线的分割点
     */
    brokenLineSplitPort,
    linePort,
    /**
     * 旋转
     */
    rotatePort,
    /**
     * 思维导图的添加按钮
     */
    mindAdd,
    /**
     * 思维导图的展开按钮
     */
    mindSpread
}

export type BoardBlockSelector = {
    type: BoardPointType;
    arrows: PointArrow[];
    point?: Point;
    arrowPoint?: Point;
    poly?: Polygon;
    stroke?: string;
    strokeOpacity?: number;
    fillOpacity?: number;
    data?: Record<string, any>,
    rect?: Rect;
}

export class Block$Board {
    getBlockBoardSelector(this: Block, types: BoardPointType[] = [
        BoardPointType.path,
        BoardPointType.resizePort,
        BoardPointType.connectPort
    ]): BoardBlockSelector[] {
        var pickers: BoardBlockSelector[] = [];
        var { width, height } = this.fixedSize;
        var rect = new Rect(0, 0, width, height);
        var gm = this.globalMatrix;
        gm = this.globalMatrix;
        var feelDist = this.realPx(Math.min(100, width / 2));
        feelDist = Math.min(100, width / 2);
        /**
         * 这里基本没有skew，只有scale,rotate,translate
         * scale 水平和垂直相等
         */
        var extendRect = rect.extend(this.realPx(15));
        var pathRects = RectUtility.getRectLineRects(rect, this.realPx(2));
        var brect = rect.transformToRect(gm);
        if (types.includes(BoardPointType.path))
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
        if (types.includes(BoardPointType.pathConnectPort))
            pickers.push(...rect.centerPoints.map((pr, i) => {
                var arrows: PointArrow[] = [];
                var arrowPoint: Point;
                if (i == 0) { arrows = [PointArrow.top, PointArrow.center]; arrowPoint = pr.move(0, 0 - feelDist); }
                else if (i == 1) { arrows = [PointArrow.middle, PointArrow.right]; arrowPoint = pr.move(feelDist, 0); }
                else if (i == 2) { arrows = [PointArrow.bottom, PointArrow.center]; arrowPoint = pr.move(0, feelDist); }
                else if (i == 3) { arrows = [PointArrow.middle, PointArrow.left]; arrowPoint = pr.move(0 - feelDist, 0); }
                return {
                    type: BoardPointType.pathConnectPort,
                    arrows,
                    point: gm.transform(pr),
                    arrowPoint: gm.transform(arrowPoint),
                    rect: brect
                }
            }))
        if (types.includes(BoardPointType.resizePort)) pickers.push(...rect.points.map((p, i) => {
            var arrows: PointArrow[] = [];
            if (i == 0) arrows = [PointArrow.top, PointArrow.left];
            else if (i == 1) arrows = [PointArrow.top, PointArrow.right];
            else if (i == 2) arrows = [PointArrow.bottom, PointArrow.right]
            else if (i == 3) arrows = [PointArrow.bottom, PointArrow.left]
            return {
                type: BoardPointType.resizePort,
                arrows,
                point: gm.transform(p)
            }
        }))
        if (!this.isFrame && types.includes(BoardPointType.connectPort)) {
            pickers.push(...extendRect.centerPoints.map((p, i) => {
                var arrows: PointArrow[] = [];
                if (i == 0) {
                    arrows = [PointArrow.top, PointArrow.center];
                }
                else if (i == 1) {
                    arrows = [PointArrow.middle, PointArrow.right];
                }
                else if (i == 2) {
                    arrows = [PointArrow.bottom, PointArrow.center];
                }
                else if (i == 3) {
                    arrows = [PointArrow.middle, PointArrow.left];
                }
                return {
                    type: BoardPointType.connectPort,
                    arrows,
                    point: gm.transform(p),
                }
            }))
        }
        pickers.push({
            arrows: [],
            type: BoardPointType.rotatePort,
            point: gm.transform(extendRect.leftBottom),
            data: { center: extendRect.middleCenter, size: { width, height } }
        })
        return pickers;
    }
    /**
     * 对选择器进行缩放，这里主要是处理长，高的缩放
     * @param this 
     * @param arrows 
     * @param event 
     */
    onResizeBoardSelector(this: Block,
        arrows: PointArrow[],
        event: React.MouseEvent) {
        var block = this;
        var matrix = block.matrix.clone();
        var gm = block.globalMatrix.clone();
        var gmm = block?.panelGridMap || block.page.gridMap
        gmm.start();
        var { width: w, height: h } = block.fixedSize;
        var downPoint = Point.from(event);
        var fp = gm.inverseTransform(downPoint);
        var s = gm.getScaling().x;
        var minW = 10 / s;
        var minH = 10 / s;
        var self = this;
        var picker = block.page.kit.picker;
        picker.view.showSize = false;
        picker.alighLines = [];
        picker.moveRect = block.getVisibleContentBound();
        var gs: {
            ox: number;
            oy: number;
            lines: {
                arrow: 'x' | 'y';
                start: Point;
                end: Point;
            }[];
        }
        MouseDragger({
            event,
            moveStart() {
                closeBoardEditTool();
            },
            moving(ev, data, isEnd) {
                var to = Point.from(ev);
                gs = CacBlockAlignLines(block, gmm, downPoint, to, picker.moveRect, arrows);
                if (typeof gs?.ox == 'number' || typeof gs?.oy == 'number') {
                    if (gs.ox) to.x = gs.ox + to.x;
                    if (gs.oy) to.y = gs.oy + to.y;
                }
                var tp = gm.inverseTransform(to);
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
                    bh -= dy;
                    ma.translate(0, dy);
                }
                else if (arrows.includes(PointArrow.bottom)) {
                    bh += dy;
                }
                if (arrows.includes(PointArrow.left)) {
                    bw -= dx;
                    ma.translate(dx, 0);
                }
                else if (arrows.includes(PointArrow.right)) {
                    bw += dx;
                }
                if (block.page.keyboardPlate.isShift()) {
                    if (!arrows.some(s => [PointArrow.left, PointArrow.top].includes(s)))
                        bw = bh = Math.max(bw, bh);
                }
                block.matrix = matrix.appended(ma);
                block.fixedHeight = bh;
                block.fixedWidth = bw;

                block.updateRenderLines();
                block.forceManualUpdate();
                if (block.isFrame) {
                    var cs = block.childs;
                    for (let i = 0; i < cs.length; i++) {
                        var b = cs[i];
                        var oc = matrix.clone().append(b.currentMatrix).transform(new Point(0, 0));
                        var nc = block.matrix.clone().append(b.currentMatrix).inverseTransform(oc);
                        var mb = new Matrix();
                        mb.translate(nc.x, nc.y);
                        b.moveMatrix = mb;
                        b.forceManualUpdate();
                    }
                }
                picker.alighLines = gs?.lines || [];
                if (isEnd) picker.alighLines = [];
                picker.alighLines.forEach(ag => {
                    ag.start = block.page.windowMatrix.inverseTransform(ag.start);
                    ag.end = block.page.windowMatrix.inverseTransform(ag.end);
                })
                picker.view.showSize = isEnd ? false : true;
                picker.view.forceUpdate();
                if (isEnd) {
                    block.page.onAction(ActionDirective.onResizeBlock, async () => {
                        if (!matrix.equals(block.matrix)) await block.updateMatrix(matrix, block.matrix);
                        await block.manualUpdateProps(
                            { fixedWidth: w, fixedHeight: h },
                            { fixedWidth: block.fixedWidth, fixedHeight: block.fixedHeight }
                        )
                        if (block.isFrame) {
                            var cs = block.childs;
                            for (let i = 0; i < cs.length; i++) {
                                var b = cs[i];
                                b.moveMatrix = new Matrix();
                                var oc = matrix.clone().append(b.currentMatrix).transform(new Point(0, 0));
                                var nc = block.matrix.clone().append(b.currentMatrix).inverseTransform(oc);
                                var mb = new Matrix();
                                mb.translate(nc.x, nc.y);
                                var nm = b.currentMatrix.clone().append(mb);
                                nm.append(b.selfMatrix.inverted());
                                await b.updateMatrix(b.matrix, nm);
                            }
                        }
                        var groups = block.groups;
                        if (groups?.length > 0) {
                            await groups.eachAsync(async g => {
                                await (g as Group).updateGroupRange();
                            })
                        }
                    })
                }
            },
            async moveEnd() {
                await openBoardEditTool(self.page.kit);
            }
        });
    }
    /**
     * 对选择器进行缩放， 这里主要是通过matrix进行缩放
     * 元素本身的大小不变，只是通过matrix进行缩放
     * @param this 
     * @param arrows 
     * @param event 
     */
    onResizeScaleBoardSelector(this: Block, arrows: PointArrow[], event: React.MouseEvent) {
        var self = this;
        var block = this;
        var { width, height } = this.fixedSize;
        var rect = new Rect(0, 0, width, height);
        var gm = this.globalMatrix;
        var wgm = this.globalWindowMatrix;
        var gmm = block?.panelGridMap || block.page.gridMap
        gmm.start();
        var point = gm.inverseTransform(Point.from(event));
        var ma = this.matrix.clone();
        arrows = lodash.cloneDeep(arrows);
        lodash.remove(arrows, s => s == PointArrow.center || s == PointArrow.middle);
        var picker = this.page.kit.picker;
        picker.view.showSize = false;
        picker.alighLines = [];
        picker.moveRect = this.getVisibleContentBound();
        var block = this;
        var gs: {
            ox: number;
            oy: number;
            lines: {
                arrow: 'x' | 'y';
                start: Point;
                end: Point;
            }[];
        }
        function cacOffset(from: Point, to: Point) {
            var ec = gm.inverseTransform(to);
            var dx = ec.x - from.x;
            var dy = ec.y - from.y;
            if (arrows.some(s => s == PointArrow.left)) dx = -dx;
            if (arrows.some(s => s == PointArrow.top)) dy = -dy;
            var newWidth = width + dx;
            var newHeight = height + dy;
            var scaleX = newWidth / width;
            var scaleY = newHeight / height;
            var scale = (scaleX + scaleY) / 2;
            var newMa = new Matrix();
            if (lodash.isEqual(arrows, [PointArrow.top, PointArrow.left]) || lodash.isEqual(arrows, [PointArrow.top]) || lodash.isEqual(arrows, [PointArrow.left])) {
                newMa.scale(scale, scale, { x: rect.width, y: rect.height });
            }
            else if (lodash.isEqual(arrows, [PointArrow.bottom, PointArrow.right]) || lodash.isEqual(arrows, [PointArrow.bottom]) || lodash.isEqual(arrows, [PointArrow.right])) {
                newMa.scale(scale, scale, { x: 0, y: 0 });
            }
            else if (lodash.isEqual(arrows, [PointArrow.top, PointArrow.right]) || lodash.isEqual(arrows, [PointArrow.top]) || lodash.isEqual(arrows, [PointArrow.right])) {
                newMa.scale(scale, scale, { x: 0, y: rect.height });
            }
            else if (lodash.isEqual(arrows, [PointArrow.bottom, PointArrow.left]) || lodash.isEqual(arrows, [PointArrow.bottom]) || lodash.isEqual(arrows, [PointArrow.left])) {
                newMa.scale(scale, scale, { x: rect.width, y: 0 });
            }
            return newMa;
        }
        MouseDragger({
            event,
            moveStart() {
                closeBoardEditTool();
            },
            async moving(ev, data, isEnd, isMove) {
                var to = Point.from(ev);
                var newMa = cacOffset(point, to);
                var newGm = wgm.clone().append(newMa);
                var newRect = rect.clone().transformToRect(newGm);
                gs = CacBlockAlignLines(block, gmm, point, to, newRect, []);
                if (typeof gs?.ox == 'number' || typeof gs?.oy == 'number') {
                    if (gs.ox) to.x = gs.ox + to.x;
                    if (gs.oy) to.y = gs.oy + to.y;
                }
                newMa = cacOffset(point, to);
                self.matrix = ma.appended(newMa);
                self.updateRenderLines();
                self.forceManualUpdate();
                picker.alighLines = gs?.lines || [];
                if (isEnd) picker.alighLines = [];
                picker.alighLines.forEach(ag => {
                    ag.start = block.page.windowMatrix.inverseTransform(ag.start);
                    ag.end = block.page.windowMatrix.inverseTransform(ag.end);
                })
                self.page.kit.picker.view.showSize = isEnd ? false : true;
                self.page.kit.picker.view.forceUpdate()
                if (isEnd) {
                    self.page.onAction('onManualUpdateProps', async () => {
                        await self.manualUpdateProps({ matrix: ma }, { matrix: self.matrix }, BlockRenderRange.self)
                        var groups = self.groups;
                        if (groups?.length > 0) {
                            await groups.eachAsync(async g => {
                                await (g as Group).updateGroupRange();
                            })
                        }
                    })
                    openBoardEditTool(self.page.kit);
                }
            }
        })
    }
    async onPickerMousedown(this: Block, selector: BoardBlockSelector, event: React.MouseEvent) {
        console.log(selector, event);
    }
    conectLine(this: Block, line: Block) {
        if (!Array.isArray(this._lines)) this._lines = [];
        if (!this.refLines.includes(line.id))
            this.refLines.push(line.id);
        if (!this._lines.some(s => s.id === line.id))
            this._lines.push(line)
    }
    disconnectLine(this: Block, line: Block) {
        if (!Array.isArray(this._lines)) this._lines = [];
        this.refLines.removeAll(g => g == line.id);
        this._lines.removeAll(g => g.id == line.id);
    }
    async onUpdateLine(this: Block, from: any, to: any, oldData?: {
        from: PortLocation;
        to: PortLocation;
    }, callback?: () => Promise<void>) {
        await this.page.onAction(ActionDirective.onUpdateProps, async () => {
            this.updateLine(from, to, oldData);
            if (callback) await callback();
        })
    }
    async updateLine(this: Block, from: any, to: any, oldData?: {
        from: PortLocation;
        to: PortLocation;
    }) {

    }
    async getBoardEditCommand(this: Block): Promise<{ name: string, value?: any }[]> {
        var cs = [];
        return []
    }
    async setBoardEditCommand(this: Block, name: string, value: any): Promise<boolean | void> {
        if (name == 'fontSize') {
            await this.pattern.setFontStyle({ fontSize: value });
        }
        else if (name == 'fontWeight') {
            await this.pattern.setFontStyle({ fontWeight: value });
        } else if (name == 'fontFamily') {
            await this.pattern.setFontStyle({ fontFamily: value })
        }
        else if (name == 'fontStyle') {
            await this.pattern.setFontStyle({ fontStyle: value == true || value == 'italic' ? 'italic' : 'normal' });
        }
        else if (name == 'textDecoration') {
            await this.pattern.setFontStyle({ textDecoration: value });
        }
        else if (name == 'fontColor') {
            await this.pattern.setFontStyle({ color: value });
        }
        // else if (name == 'fillColor') {

        // }
        // else if (name == 'fillOpacity') {

        // }
        else return false;
        return true
    }
    /**
     * 重新渲染线条
     * @param this 
     */
    updateRenderLines(this: Block, isSelfUpdate?: boolean) {
        if (this.isFrame) {
            this.childs.each(b => {
                b.updateRenderLines();
            })
        }
        else if (this.url == BlockUrlConstant.Group) {
            this.childs.each(b => {
                b.updateRenderLines();
            })
        }
        else {
            if (this.lines.length > 0) {
                this.lines.each(line => { line.forceManualUpdate() })
            }
        }
        if (isSelfUpdate) this.forceManualUpdate()
    }
    isBoardCanMove(this: Block) {
        if (this.isLock) return false;
        return true;
    }
    boardMoveStart(this: Block, point: Point) {

    }
    boardMove(this: Block, from: Point, to: Point) {
        var matrix = new Matrix();
        matrix.translateMove(this.globalMatrix.inverseTransform(from), this.globalMatrix.inverseTransform(to))
        this.setBoardMoveMatrix(matrix);
    }
    setBoardMoveMatrix(this: Block, matrix: Matrix) {
        this.moveMatrix = matrix;
        this.updateRenderLines(true);
    }
    async boardMoveEnd(this: Block, from: Point, to: Point) {
        var moveMatrix = new Matrix();
        moveMatrix.translateMove(this.globalMatrix.inverseTransform(from), this.globalMatrix.inverseTransform(to))
        var newMatrix = this.currentMatrix.clone();
        newMatrix.append(moveMatrix);
        newMatrix.append(this.selfMatrix.inverted());
        await this.updateMatrix(this.matrix, newMatrix);
        this.moveMatrix = new Matrix();
        if (!this.isFrame) {
            var rs = this.findFramesByIntersect();
            if (rs.length > 0 && !rs.some(s => s === this.parent)) {
                var fra = rs[0];
                if (this.parent.isFrame) {
                    var matrix = this.parent.matrix.clone().append(this.matrix);
                    var nm: Matrix = fra.matrix.inverted().append(matrix);
                    await this.updateMatrix(this.matrix, nm);
                    await fra.append(this);
                }
                else {
                    await fra.append(this);
                    var nm: Matrix = fra.matrix.inverted().append(this.matrix);
                    await this.updateMatrix(this.matrix, nm);
                }
            }
            else if (rs.length == 0 && this.parent?.isFrame) {
                var fra = this.parent;
                await fra.parent.append(this);
                var lines = this.lines.findAll(c => {
                    if (fra.childs.includes(c)) {
                        var cg = c as Line;
                        if (cg.from?.blockId && cg.to?.blockId) {
                            var fb = this.page.find(x => x.id == cg.from.blockId);
                            var tb = this.page.find(x => x.id == cg.to.blockId);
                            if (fb && tb && fb.parent !== fra && tb.parent !== fra) {
                                return true;
                            }
                        }
                    }
                    return false;
                });
                await lines.eachAsync(async l => {
                    await fra.parent.append(l);
                })
                var nm = fra.matrix.clone().append(this.matrix);
                await this.updateMatrix(this.matrix, nm);
            }
        }
        var groups = this.groups;
        if (groups?.length > 0) {
            await groups.eachAsync(async g => {
                await (g as Group).updateGroupRange();
            })
        }
    }
}


