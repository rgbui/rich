
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
    sub(x: number, y: number) {
        return this.add(0 - x, 0 - y);
    }
    clone() {
        return new Point(this);
    }
    equal(point: Point) {
        return point && this.x == point.x && this.y == point.y;
    }
    /**
     * 
     * @param point 
     * @param distance  指小于水平及垂直方面的距离
     */
    nearBy(point: Point, distance: number) {
        if (point) {
            if (Math.abs(point.x - this.x) <= distance && Math.abs(point.y - this.y) <=distance) {
                return true;
            }
        }
        return false;
    }
    remoteBy(point: Point, dis: number) {
        if (point) {
            if (Math.abs(point.x - this.x) > dis || Math.abs(point.y - this.y) > dis) {
                return true;
            }
        }
        return false;
    }
    static from(event: MouseEvent | DOMRect | Point | { x: number, y: number } | Rect | number, y?: number) {
        if (event instanceof MouseEvent) {
            return new Point({ x: event.x, y: event.y })
        }
        else if (event instanceof Point) {
            return new Point(event);
        }
        else if (event instanceof Rect) {
            return new Point(event.left, event.top);
        }
        else if (event instanceof DOMRect) {
            return new Point(event.left, event.top);
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
    get x() {
        return this.left;
    }
    get y() {
        return this.top
    }
    get x1() {
        return this.left;
    }
    get x2() {
        return this.left + this.width
    }
    get y1() {
        return this.top;
    }
    get y2() {
        return this.top + this.height;
    }
    get leftTop() {
        return Point.from(this.left, this.top);
    }
    get leftBottom() {
        return Point.from(this.left, this.top + this.height)
    }
    get rightTop() {
        return Point.from(this.left + this.width, this.top)
    }
    get rightBottom() {
        return Point.from(this.left + this.width, this.top + this.height)
    }
    constructor(start?: Point, end?: Point | number, height?: number) {
        if (start instanceof Point && end instanceof Point) {
            this.top = Math.min(end.y, start.y);
            this.left = Math.min(start.x, end.x);
            this.width = Math.abs(end.x - start.x);
            this.height = Math.abs(end.y - start.y);
        }
        else if (start instanceof Point && typeof end == 'number' && typeof height == 'number') {
            this.top = start.y;
            this.left = start.x;
            this.width = end;
            this.height = height;
        }
    }
    static from(rect: DOMRect) {
        var re = new Rect();
        re.top = rect.top;
        re.left = rect.left;
        re.width = rect.width;
        re.height = rect.height;
        return re;
    }
    conatin(point: Point) {
        if (point.x >= this.left && point.x <= this.left + this.width) {
            if (point.y > this.top && point.y < this.top + this.height) return true;
        }
        return false;
    }
    /**
     * 判断是否与矩形r2相交
     * @param r2 
     * @returns 
     */
    isCross(r2: Rect) {
        var r1 = this;
        if (Math.abs((r1.x1 + r1.x2) / 2 - (r2.x1 + r2.x2) / 2) < ((r1.x2 + r2.x2 - r1.x1 - r2.x1) / 2) && Math.abs((r1.y1 + r1.y2) / 2 - (r2.y1 + r2.y2) / 2) < ((r1.y2 + r2.y2 - r1.y1 - r2.y1) / 2))
            return true;
        return false;
    }
}