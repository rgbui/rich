
import { Block } from "..";
import { Matrix } from "../../common/matrix";
import { Point, PointArrow, Rect, RectUtility } from "../../common/vector/point";
import { Polygon } from "../../common/vector/polygon";
import { ActionDirective } from "../../history/declare";
export enum BoardPointType {
    path,
    pathConnectPort,
    resizePort,
    connectPort,
    movePort,
}
export type BoardBlockSelector = {
    type: BoardPointType;
    arrows: PointArrow[];
    point?: Point;
    poly?: Polygon;
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
        // var gs = gm.resolveMatrixs();
        /**
         * 这里基本没有skew，只有scale,rotate,translate
         * scale 水平和垂直相等
         */
        var s = gm.getScaling().x;
        var extendRect = rect.extend(20 / s);
        var pathRects = RectUtility.getRectLineRects(rect, 1 / s);
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
        if (types.includes(BoardPointType.resizePort))
            pickers.push(...rect.points.map((p, i) => {
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
        MouseDragger({
            event,
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
            }
        });
    }
    conectLine(this: Block, line: Block) {
        if (!Array.isArray(this._lines)) this._lines = [];
        if (!this.refLines.includes(line.id)) {
            this.refLines.push(line.id);
            this._lines.push(line)
        }
    }
    disconnectLine(this: Block, line: Block) {
        if (!Array.isArray(this._lines)) this._lines = [];
        this.refLines.remove(g => g == line.id);
        this._lines.remove(g => g.id == line.id);
    }
}

function MouseDragger(arg0: { event: import("react").MouseEvent<Element, MouseEvent>; moving(ev: any, data: any, isEnd: any): void; }) {
    throw new Error("Function not implemented.");
}
