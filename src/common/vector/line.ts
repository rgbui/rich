
import { Segment } from "../../block/svg/segment";
import { Point } from "./point";
export class Line {
    x1: number;
    x2: number;
    y1: number;
    y2: number;
    constructor(x: number | Point, y: number | Point, x1?: number, y2?: number) {
        if (x instanceof Point && y instanceof Point) {
            this.x1 = x.x;
            this.y1 = x.y;
            this.x2 = y.x;
            this.y2 = y.y;
        }
        else if (arguments.length == 4 && typeof x == 'number' && typeof y == 'number') {
            this.x1 = x;
            this.y1 = y;
            this.x2 = x1;
            this.y2 = y2;
        }
    }
    center() {
        return new Point((this.x1 + this.x2) / 2, (this.y1 + this.y2) / 2)
    }
}


export class LineSegment {
    points: Point[] = [];
    currentPoint: Point;
    private constructor(point: Point) {
        this.currentPoint = point;
        this.points.push(point);
    }
    x(d: number) {
        var np = this.currentPoint.clone().setX(d);
        this.currentPoint = np;
        this.points.push(np);
        return this;
    }
    y(d: number) {
        var np = this.currentPoint.clone().setY(d)
        this.currentPoint = np;
        this.points.push(np);
        return this;
    }
    xy(x: number, y: number) {
        var np = this.currentPoint.clone().setX(x);
        np = np.setY(y);
        this.currentPoint = np;
        this.points.push(np);
        return this;
    }
    to(x: number, y: number) {

        this.points.push(new Point(x, y));
        this.currentPoint = this.points.last()
        return this;
    }
    toSegments() {
        return this.points.map(p => {
            return Segment.create(p)
        })
    }

    static create(point: Point) {
        return new LineSegment(point.clone());
    }
}