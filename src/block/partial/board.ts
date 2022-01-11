
import { Block } from "..";
import { Point, PointArrow, Rect, RectUtility } from "../../common/vector/point";
import { Polygon } from "../../common/vector/polygon";
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