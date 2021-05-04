
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
            if (Math.abs(point.x - this.x) < distance && Math.abs(point.y - this.y) < distance) {
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

}