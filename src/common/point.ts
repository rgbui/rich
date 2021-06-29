
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
            if (Math.abs(point.x - this.x) <= distance && Math.abs(point.y - this.y) <= distance) {
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
    get center() {
        return this.left + this.width / 2
    }
    get middle() {
        return this.top + this.height / 2
    }
    get bottom() {
        return this.top + this.height
    }
    get right() {
        return this.left + this.width
    }
    constructor(start?: Point | number, end?: Point | number, width?: number, height?: number) {
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
        else if (typeof start == 'number' && typeof end == 'number' && typeof width == 'number' && typeof height == 'number') {
            this.top = end;
            this.left = start;
            this.width = height;
            this.height = width;

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

export class RectUtility {
    /**
     * 围绕一个小的矩形，弹一个窗，
     * 尽可能的展示自，尽可以的不要挡住这个小的矩形
     * @param options 
     */
    static cacRoundElementPoint(options: {
        roundArea: Rect;
        elementArea: Rect,
        dist?: number,
        offset?: number,
        align?: 'start' | 'center' | 'end',
        direction: 'top' | 'left' | 'bottom' | 'right'
    }) {
        if (typeof options.dist == 'undefined') options.dist = 10;
        if (typeof options.offset == 'undefined') options.offset = 0;
        if (typeof options.align == 'undefined') options.align = 'start';
        var x: number, y: number;
        var roundTop = options.roundArea.top - options.dist - options.elementArea.height;
        var rountBottom = options.roundArea.top + options.roundArea.height + options.dist;
        var roundMiddle = options.roundArea.middle - options.elementArea.height * ((options.roundArea.middle) / window.innerHeight);
        var roundLeft = options.roundArea.left - options.dist - options.elementArea.width;
        var roundRight = options.roundArea.left + options.roundArea.width + options.dist;
        var roundCenter = options.roundArea.center - options.elementArea.width * ((options.roundArea.center) / window.innerWidth);
        switch (options.direction) {
            case 'top':
                y = roundTop;
                if (y < 0) {
                    y = rountBottom;
                    if (y + options.elementArea.height > window.innerHeight) y = roundMiddle;
                }
                x = options.roundArea.left + options.offset;
                if (options.align == 'center') x = options.roundArea.center - options.elementArea.width / 2 + options.offset;
                else if (options.align == 'end') x = options.roundArea.right - options.elementArea.width + options.offset;
                if (x < 0 || x + options.elementArea.width > window.innerWidth) x = roundCenter;
                break;
            case 'bottom':
                y = rountBottom;
                if (y + options.elementArea.height > window.innerHeight) {
                    y = roundTop;
                    if (y < 0) y = roundMiddle;
                }
                x = options.roundArea.left + options.offset;
                if (options.align == 'center') x = options.roundArea.center - options.elementArea.width / 2 + options.offset;
                else if (options.align == 'end') x = options.roundArea.right - options.elementArea.width + options.offset;
                if (x < 0 || x + options.elementArea.width > window.innerWidth) x = roundCenter;
                break;
            case 'left':
                x = roundLeft;
                if (x < 0) {
                    x = roundRight;
                    if (x + options.elementArea.width > window.innerWidth) x = roundCenter;
                }
                y = options.roundArea.top + options.offset;
                if (options.align == 'center') y = options.roundArea.middle - options.elementArea.height / 2 + options.offset;
                else if (options.align == 'end') y = options.roundArea.bottom - options.elementArea.height + options.offset;
                if (y < 0 || y + options.elementArea.height > window.innerHeight) y = roundMiddle;
                break;
            case 'right':
                x = roundRight;
                if (x + options.elementArea.width > window.innerWidth) {
                    x = roundLeft;
                    if (x < 0) x = roundCenter;
                }
                y = options.roundArea.top + options.offset;
                if (options.align == 'center') y = options.roundArea.middle - options.elementArea.height / 2 + options.offset;
                else if (options.align == 'end') y = options.roundArea.bottom - options.elementArea.height + options.offset;
                if (y < 0 || y + options.elementArea.height > window.innerHeight) y = roundMiddle;
                break;
        }
        return new Point(x,y);
    }
    /**
     * 在该点弹一个对话框，该对话框的适合的坐标位置
     * @param point 
     * @param size 
     * @param parentRect 
     * @param d 
     * @returns 
     */
    static getChildRectPositionInRect(point: Point, size: Rect, parentRect?: Rect, dist: number = 0): Point {
        if (dist == undefined) { dist = 0; }
        if (typeof parentRect == 'undefined') {
            parentRect = new Rect(new Point(0, 0), window.innerWidth, window.innerHeight);
        }
        var json: any = {};
        if (point.x + size.width + dist < parentRect.width + parentRect.x) {
            json.x = point.x + dist;
        }
        else {
            json.x = point.x - dist - size.width;
            if (json.x < parentRect.x) {
                json.x = point.x - size.width * ((point.x - parentRect.x) / parentRect.width);
            }
        }
        if (point.y + size.height + dist < parentRect.height + parentRect.y) {
            json.y = point.y + dist;
        }
        else {
            json.y = point.y - dist - size.height;
            if (json.y < parentRect.y) {
                json.y = point.y - size.height * ((point.y - parentRect.y) / parentRect.height);
            }
        }
        return new Point(json);
    }
}