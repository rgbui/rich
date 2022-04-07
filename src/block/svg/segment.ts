import { Matrix } from "../../common/matrix";
import { Point } from "../../common/vector/point";
import { Polygon } from "../../common/vector/polygon";

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
    static create(point: Point,
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
    static getSegmentsBound(segs: Segment[]) {
        var ps = segs.toArray(se => {
            if (se)
                return [se.point, ...(se.handleIn ? [se.handleIn] : []), ...(se.handleOut ? [se.handleOut] : [])]
        }).flat();
        return new Polygon(...ps).bound;
    }
}