import { Point } from "../../common/vector/point";
import { Segment } from "./segment";


export class Curve {
    constructor(seg: Segment, seg2: Segment) {
        this.segment1 = seg;
        this.segment2 = seg2;
    }
    segment1: Segment;
    segment2: Segment;
    getPathString() {
        var o = (p) => `${p.x} ${p.y}`;
        if (this.segment1.handleOut && this.segment2.handleIn) {
            return (`C${o(this.segment1.handleOut)},${o(this.segment2.handleIn)},${o(this.segment2.point)}`);
        }
        else if (this.segment1.handleOut && !this.segment2.handleIn) {
            return (`Q${o(this.segment1.handleOut)},${o(this.segment2.point)}`);
        }
        else if (!this.segment1.handleOut && this.segment2.handleIn) {
            return (`Q${o(this.segment2.handleIn)},${o(this.segment2.point)}`);
        }
        else if (!this.segment1.handleOut && !this.segment2.handleIn) {
            return (`L${o(this.segment2.point)}`);
        }
    }
}

export class CurveUtil {
    static cacCurvePoint(curve: {
        start: Point,
        end: Point,
        control1: Point,
        control2?: Point
    }, t: number) {
        if (!curve.control1 && curve.control2) {
            curve.control1 = curve.control2;
            delete curve.control2;
        }
        if (curve.control2) {
            return new Point(
                Math.pow(1 - t, 3) * curve.start.x + 3 * t * Math.pow(1 - t, 2) * curve.control1.x + 3 * (1 - t) * Math.pow(t, 2) * curve.control2.x + Math.pow(t, 3) * curve.end.x,
                Math.pow(1 - t, 3) * curve.start.y + 3 * t * Math.pow(1 - t, 2) * curve.control1.y + 3 * (1 - t) * Math.pow(t, 2) * curve.control2.y + Math.pow(t, 3) * curve.end.y,
            )
        }
        else if (curve.control1) {
            return new Point(
                Math.pow(1 - t, 2) * curve.start.x + 2 * t * (1 - t) * curve.control1.x + Math.pow(t, 2) * curve.end.x,
                Math.pow(1 - t, 2) * curve.start.y + 2 * t * (1 - t) * curve.control1.y + Math.pow(t, 2) * curve.end.y,
            )
        }
        else {
            return new Point(
                curve.start.x * (1 - t) + curve.end.x * t,
                curve.start.y * (1 - t) + curve.end.y * t,
            )
        }
    }
}