import { Point } from "./point";

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
}