
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