import { Point, Rect } from "./point";

export class Polygon {
    points: Point[] = [];
    constructor(...points: Point[]) {
        this.points = points;
    }
    pathString(isClosed: boolean = true) {
        return this.points.map((p, i) => {
            if (i == 0) {
                return `M${p.x} ${p.y}`
            }
            else return `L${p.x} ${p.y}`
        }).join(",") + (isClosed ? "Z" : "")
    }
    get bound() {
        var x, y, MaxX, MaxY;
        for (let i = 0; i < this.points.length; i++) {
            var po = this.points[i];
            if (typeof x == 'undefined') {
                x = po.x;
                y = po.y;
                MaxX = po.x;
                MaxY = po.y;
            }
            else {
                x = Math.min(x, po.x);
                y = Math.min(y, po.y);
                MaxX = Math.max(MaxX, po.x);
                MaxY = Math.max(MaxY, po.y);
            }
        }
        return new Rect(new Point(x, y), new Point(MaxX, MaxY));
    }
}