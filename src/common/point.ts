
export class Point {
    x: number;
    y: number;
    constructor(x: number | Point | { x: number, y: number }, y?: number) {
        if (x instanceof Point) {
            var p = x.get();
            this.x = p.x;
            this.y = p.y;
        }
        else if (typeof x == 'object') {
            this.x = x.x;
            this.y = x.y;
        }
        else {
            this.x = x;
            this.y = y;
        }
    }
    get() {
        return { x: this.x, y: this.y };
    }
    add(dx: number, dy: number) {
        return new Point(this.x + dx, this.y + dy);
    }
    clone() {
        return new Point(this);
    }
    static from(event: MouseEvent | Point | { x: number, y: number } | number, y?: number) {
        if (event instanceof MouseEvent) {
            return new Point({ x: event.pageX, y: event.pageY })
        }
        else if (event instanceof Point) {
            return new Point(event);
        }
        else if (typeof event == 'object') return new Point(event)
        else return new Point(event, y);
    }
}

export class Rect {
    top: number;
    left: number;
    width: number;
    height: number;
    static from(rect: DOMRect) {
        var re = new Rect();
        re.top = rect.top;
        re.left = rect.left;
        re.width = rect.width;
        re.height = rect.height;
        return re;
    }
}