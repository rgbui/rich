import { Matrix } from "../../common/matrix";
import { Point, Rect, RectUtility } from "../../common/vector/point";
import { Bezier } from "bezier-js";

export class Segment {
    constructor(data?: Record<string, any>) {
        if (data) this.load(data)
    }
    point: Point;
    handleIn?: Point;
    handleOut?: Point;
    applyMatrix(matrix: Matrix) {
        this.point = matrix.transform(this.point);
        if (this.handleIn) this.handleIn = matrix.transform(this.handleIn);
        if (this.handleOut) this.handleOut = matrix.transform(this.handleOut);
    }
    load(data) {
        for (let n in data) {
            if (typeof data[n] == 'undefined') continue;
            if (n == 'point') this.point = new Point(data[n][0], data[n][1])
            else if (n == 'handleIn' && data[n]) this.handleIn = new Point(data[n][0], data[n][1]);
            else if (n == 'handleOut' && data[n]) this.handleOut = new Point(data[n][0], data[n][1])
        }
    }
    get() {
        return {
            point: [this.point.x, this.point.y],
            handleIn: this.handleIn ? [this.handleIn.x, this.handleIn.y] : undefined,
            handleOut: this.handleOut ? [this.handleOut.x, this.handleOut.y] : undefined
        }
    }
    clone() {
        return Segment.create(this.point, this.handleIn, this.handleOut);
    }
    static create(
        point: Point,
        handleIn?: Point,
        handleOut?: Point) {
        return new Segment({
            point: [point.x, point.y],
            handleIn: handleIn ? [handleIn.x, handleIn.y] : undefined,
            handleOut: handleOut ? [handleOut.x, handleOut.y] : undefined
        })
    }
    static getSegmentsPathString(segs: Segment[], closeType?: 1 | 2) {
        var ds = [];
        var o = (p: Point) => p ? `${p.x.toFixed(3)} ${p.y.toFixed(3)}` : '';
        var vs = segs;
        var pg = (current: Segment, next: Segment) => {
            if (current?.handleOut && next?.handleIn) {
                return (`C${o(current?.handleOut)},${o(next?.handleIn)},${o(next?.point)}`);
            }
            else if (current?.handleOut && next && !next.handleIn) {
                return (`Q${o(current?.handleOut)},${o(next?.point)}`);
            }
            else if (!current.handleOut && next?.handleIn) {
                return (`Q${o(next?.handleIn)},${o(next?.point)}`);
            }
            else if (!current.handleOut && !next.handleIn) {
                return (`L${o(next?.point)}`);
            }
        }
        try {
            for (let i = 0; i < segs.length - 1; i++) {
                var handleIn = vs[i];
                var handleOut = vs[i + 1];
                if (i == 0) {
                    ds.push(`M${o(handleIn.point)}`);
                    ds.push(pg(handleIn, handleOut));
                }
                else ds.push(pg(handleIn, handleOut));
            }
            if (closeType) {
                if (closeType == 1) ds.push('z');
                else if (closeType == 2) ds.push(pg(vs[vs.length - 1], vs[0]));
            }
            return ds.join("");
        }
        catch (ex) {
            console.error(ex);
            return '';
        }
    }
    static pointIsInSegment(point: Point, segs: Segment[], strokeWidth: number) {

        for (let i = 0; i < segs.length - 1; i++) {
            var current = segs[i];
            var next = segs[i + 1];
            if (current?.handleOut && next?.handleIn) {
                const b = new Bezier(current.point, current.handleOut, next.handleIn, next.point);
                /**
                 * https://pomax.github.io/bezierjs/
                 * 这里计算点在曲线上的投影点
                 * 然后计算投影点到点的距离
                 * 小于线宽则认为点在曲线上
                 */
                var cb = b.project(point);
                if (point.dis(new Point(cb.x, cb.y)) < strokeWidth) return true;
            }
            else if (current?.handleOut && next && !next.handleIn) {
                const b = new Bezier(current.point, current.handleOut, next.point);
                var cb = b.project(point);
                if (point.dis(new Point(cb.x, cb.y)) < strokeWidth) return true;
            }
            else if (!current.handleOut && next?.handleIn) {
                const b = new Bezier(current.point, next.handleIn, next.point);
                var cb = b.project(point);
                if (point.dis(new Point(cb.x, cb.y)) < strokeWidth) return true;
            }
            else if (!current.handleOut && !next.handleIn) {
                /**
                 * 这里直接将控制点取两点的中心点
                 * 这样相当于直线
                 */
                const b = new Bezier(current.point, { x: current.point.x / 2 + next.point.x / 2, y: current.point.y / 2 + next.point.y / 2 }, next.point);
                var cb = b.project(point);
                if (point.dis(new Point(cb.x, cb.y)) < strokeWidth) return true;
            }
        }
        return false;
    }
    static getBound(segs: Segment[]) {
        if (segs.length == 0) return null;
        var rects: Rect[] = [];
        for (let i = 0; i < segs.length - 1; i++) {
            var current = segs[i];
            var next = segs[i + 1];
            if (current?.handleOut && next?.handleIn) {
                const b = new Bezier(current.point, current.handleOut, next.handleIn, next.point);
                /**
                 * https://pomax.github.io/bezierjs/
                 * 这里计算点在曲线上的投影点
                 * 然后计算投影点到点的距离
                 * 小于线宽则认为点在曲线上
                 */
                // var cb = b.project(point);
                // if (point.dis(new Point(cb.x, cb.y)) < strokeWidth) return true;
                var bbox = b.bbox();
                rects.push(new Rect(bbox.x.min, bbox.y.min, bbox.x.size, bbox.y.size));
            }
            else if (current?.handleOut && next && !next.handleIn) {
                const b = new Bezier(current.point, current.handleOut, next.point);
                var bbox = b.bbox();
                rects.push(new Rect(bbox.x.min, bbox.y.min, bbox.x.size, bbox.y.size));
            }
            else if (!current.handleOut && next?.handleIn) {
                const b = new Bezier(current.point, next.handleIn, next.point);
                var bbox = b.bbox();
                rects.push(new Rect(bbox.x.min, bbox.y.min, bbox.x.size, bbox.y.size));
            }
            else if (!current.handleOut && !next.handleIn) {
                rects.push(new Rect(current.point, next.point));
            }
        }
        if (rects.length == 0) return null;
        return RectUtility.getPointsBound(rects.map(r => r.points).flat());
    }
    static fromPoints(points: Point[]) {
        return points.map(p => {
            return new Segment({ point: [p.x, p.y] })
        })
    }
    static fromPoint(point: Point) {
        return new Segment({ point: [point.x, point.y] })
    }
    static fromXY(x: number, y: number) {
        return new Segment({ point: [x, y] })
    }

}