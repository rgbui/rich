
import { Block } from "..";
import { PortLocation } from "../../../blocks/board/line/line";
import { forceCloseBoardEditTool } from "../../../extensions/board.edit.tool";
import { MouseDragger } from "../../common/dragger";
import { Matrix } from "../../common/matrix";
import { Point, PointArrow, Rect, RectUtility } from "../../common/vector/point";
import { Polygon } from "../../common/vector/polygon";
import { ActionDirective } from "../../history/declare";
import { useBoardTool } from "../../kit/mouse/board";
export enum BoardPointType {
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
     * 旋转
     */
    rotatePort,
    /**
     * 思维导图的添加按钮
     */
    mindAdd,
}
export type BoardBlockSelector = {
    type: BoardPointType;
    arrows: PointArrow[];
    point?: Point;
    poly?: Polygon;
    data?: Record<string, any>
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
        var gm = this.globalWindowMatrix;
        /**
         * 这里基本没有skew，只有scale,rotate,translate
         * scale 水平和垂直相等
         */
        var extendRect = rect.extend(this.realPx(20));
        var pathRects = RectUtility.getRectLineRects(rect, this.realPx(1));
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
                if (i == 0) arrows = [PointArrow.top, PointArrow.center];
                else if (i == 1) arrows = [PointArrow.middle, PointArrow.right];
                else if (i == 2) arrows = [PointArrow.bottom, PointArrow.center]
                else if (i == 3) arrows = [PointArrow.middle, PointArrow.left]
                return {
                    type: BoardPointType.connectPort,
                    arrows,
                    point: gm.transform(p)
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
    onResizeBoardSelector(this: Block,
        arrows: PointArrow[],
        event: React.MouseEvent) {
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
                console.log('xxx');
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
                    ma.translate(0, dy);
                    bh -= dy;
                }
                else if (arrows.includes(PointArrow.bottom)) {
                    bh += dy;
                }
                if (arrows.includes(PointArrow.left)) {
                    ma.translate(dx, 0);
                    bw -= dx;
                }
                else if (arrows.includes(PointArrow.right)) {
                    bw += dx;
                }
                block.matrix = matrix.appended(ma);
                block.fixedHeight = bh;
                block.fixedWidth = bw;
                block.updateRenderLines();
                block.forceUpdate();
                block.page.kit.picker.view.forceUpdate();
                if (isEnd) {
                    block.onAction(ActionDirective.onResizeBlock, async () => {
                        if (!matrix.equals(block.matrix)) block.updateMatrix(matrix, block.matrix);
                        block.manualUpdateProps(
                            { fixedWidth: w, fixedHeight: h },
                            { fixedWidth: block.fixedWidth, fixedHeight: block.fixedHeight }
                        )
                    })
                }
            },
            async moveEnd() {
                await useBoardTool(self.page.kit);
            }
        });
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
    }) {
        await this.page.onAction(ActionDirective.onUpdateProps, async () => {
            this.updateLine(from, to, oldData);
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
            this.pattern.setFontStyle({ fontSize: value });
        }
        else if (name == 'fontWeight') {
            this.pattern.setFontStyle({ fontWeight: value });
        }
        else if (name == 'fontStyle') {
            this.pattern.setFontStyle({ fontStyle: value ? 'italic' : 'normal' });
        }
        else if (name == 'textDecoration') {
            this.pattern.setFontStyle({ textDecoration: value });
        }
        else if (name == 'fontColor') {
            this.pattern.setFontStyle({ color: value });
        }
        else return false;
        return undefined;
    }
    /**
     * 重新渲染线条
     * @param this 
     */
    updateRenderLines(this: Block, isSelfUpdate?: boolean) {
        if (this.isFrame) {
            this.childs.each(b => {
                b.lines.each(line => { line.forceUpdate() })
            })
        }
        else {
            if (this.lines.length > 0) {
                this.lines.each(line => { line.forceUpdate() })
            }
        }
        if (isSelfUpdate) this.forceUpdate()
    }
}


