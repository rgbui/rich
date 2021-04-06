export declare class Point {
    x: number;
    y: number;
    constructor(x: number | Point | {
        x: number;
        y: number;
    }, y?: number);
    get(): {
        x: number;
        y: number;
    };
    add(dx: number, dy: number): Point;
    sub(x: number, y: number): Point;
    clone(): Point;
    static from(event: MouseEvent | DOMRect | Point | {
        x: number;
        y: number;
    } | Rect | number, y?: number): Point;
}
export declare class Rect {
    top: number;
    left: number;
    width: number;
    height: number;
    static from(rect: DOMRect): Rect;
    conatin(point: Point): boolean;
}
