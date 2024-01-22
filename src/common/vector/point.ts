
import React from "react";
import { PopoverPosition } from "../../../component/popover/position";
import { Matrix } from "../matrix";
import { Polygon } from "./polygon";

export class Point {
    x: number;
    y: number;
    constructor(x?: number | Point | { x: number, y: number }, y?: number) {
        if (arguments.length == 0) {
            this.x = 0;
            this.y = 0;
        }
        else if (x instanceof Point) {
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
    add(dx: number = 0, dy: number = 0) {
        return new Point(this.x + dx, this.y + dy);
    }
    sub(x: number = 0, y: number = 0) {
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
    /**
     * 大于水平或垂直的距离
     * @param point 
     * @param dis 
     * @returns 
     */
    remoteBy(point: Point, dis: number) {
        if (point) {
            if (Math.abs(point.x - this.x) > dis || Math.abs(point.y - this.y) > dis) {
                return true;
            }
        }
        return false;
    }
    static from(event: MouseEvent | React.MouseEvent | DOMRect | Point | { x: number, y: number } | Rect | number, y?: number) {
        if (event instanceof MouseEvent) {
            return new Point({ x: event.clientX, y: event.clientY })
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
        else if (typeof ((event as React.MouseEvent).clientX) != 'undefined') {
            return new Point({ x: (event as React.MouseEvent).clientX, y: (event as React.MouseEvent).clientY })
        }
        else if (typeof event == 'object') return new Point(event as any)
        else return new Point(event, y);
    }
    toRect(width: number = 0, height: number = 0) {
        return new Rect(this, width, height);
    }
    move(x: number, y: number) {
        return new Point(this.x + x, this.y + y);
    }
    moved(x:number,y:number){
        this.x+=x;
        this.y+=y;
    }
    join(joinChar?: string) {
        return this.x + (joinChar || ',') + this.y
    }
    negate() {
        return new Point(0 - this.x, 0 - this.y);
    }
    relative(point: Point) {
        return new Point(this.x - point.x, this.y - point.y);
    }
    base(point: Point) {
        return new Point(this.x + point.x, this.y + point.y);
    }
    diff(point: Point) {
        return [
            this.x - point.x,
            this.y - point.y
        ]
    }
    /**
     * 计算与另一个点的中心坐标
     * @param point 
     * @returns 
     */
    center(point: Point) {
        return new Point(
            this.x / 2 + point.x / 2,
            this.y / 2 + point.y / 2
        );
    }

    rotate(angle: number, center: Point) {
        var matrix = new Matrix();
        matrix.rotate(angle, center);
        var c = matrix.transform(this);
        return new Point(c.x, c.y);
    }
    dis(point: Point) {
        return Math.sqrt(Math.pow(point.x - this.x, 2) + Math.pow(point.y - this.y, 2));
    }
    static distance(point: Point, p2: Point) {
        return Math.sqrt(Math.pow(point.x - p2.x, 2) + Math.pow(point.y - p2.y, 2));
    }
    setX(x: number) {
        this.x = x; return this;
    }
    setY(y: number) {
        this.y = y; return this;
    }

}
export enum PointArrow {
    top = 'top',
    left = 'left',
    right = 'right',
    center = 'center',
    middle = 'middle',
    bottom = 'bottom',
    from = 'from',
    to = 'to',
    point = 'point'
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
    get rightMiddle() {
        return Point.from(this.left + this.width, this.top + this.height / 2)
    }
    get leftMiddle() {
        return Point.from(this.left, this.top + this.height / 2)
    }
    get rightBottom() {
        return Point.from(this.left + this.width, this.top + this.height)
    }
    get center() {
        return this.left + this.width / 2
    }
    get topCenter() {
        return Point.from(this.left + this.width / 2, this.top)
    }
    get bottomCenter() {
        return Point.from(this.left + this.width / 2, this.top + this.height)
    }
    get middleCenter() {
        return Point.from(this.left + this.width / 2, this.top + this.height / 2)
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
        else if (start instanceof Point && typeof end == 'number' && typeof width == 'number') {
            this.top = start.y;
            this.left = start.x;
            this.width = end;
            this.height = width;
        }
        else if (typeof start == 'number' && typeof end == 'number' && typeof width == 'number' && typeof height == 'number') {
            this.left = start;
            this.top = end;
            this.width = width;
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
    static fromEvent(event: MouseEvent | React.MouseEvent | Rect) {
        if (event instanceof Rect) {
            return event;
        }
        var ele = event.target as HTMLElement;
        return this.from(ele.getBoundingClientRect())
    }
    static fromEle(el: HTMLElement | Range) {
        if(el)
        return this.from(el.getBoundingClientRect())
    }
    contain(point: Point) {
        if (point.x >= this.left && point.x <= this.left + this.width) {
            if (point.y >= this.top && point.y <= this.top + this.height) return true;
        }
        return false;
    }
    containX(x: number) {
        if (x >= this.left && x <= this.left + this.width) {
            return true;
        }
        return false;
    }
    containY(y: number) {
        if (y >= this.top && y <= this.top + this.height) return true;
        return false;
    }
    isContainRect(rect: Rect) {
        return rect.points.every(e => this.contain(e));
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
    extend(dis: number) {
        var rect = this.clone();
        rect.top -= dis;
        rect.left -= dis;
        rect.width += dis * 2;
        rect.height += dis * 2;
        return rect;
    }
    extendX(dis: number) {
        var rect = this.clone();
        // rect.top -= dis;
        rect.left -= dis;
        rect.width += dis * 2;
        // rect.height += dis * 2;
        return rect;
    }
    extendY(dis: number) {
        var rect = this.clone();
        rect.top -= dis;
        // rect.left -= dis;
        // rect.width += dis * 2;
        rect.height += dis * 2;
        return rect;
    }
    clone() {
        return new Rect(this.left, this.top, this.width, this.height);
    }
    get points() {
        return [this.leftTop, this.rightTop, this.rightBottom, this.leftBottom]
    }
    get pathString() {
        return this.points.map((p, i) => {
            if (i == 0) return 'M' + p.x + " " + p.y;
            else return 'L' + p.x + " " + p.y;
        }).join(",")
    }
    get centerPoints() {
        return [this.topCenter, this.rightMiddle, this.bottomCenter, this.leftMiddle]
    }
    relative(point: Point) {
        var rect = new Rect();
        rect.top = this.top - point.y;
        rect.left = this.left - point.x;
        rect.width = this.width;
        rect.height = this.height;
        return rect;
    }
    moveTo(point: Point) {
        this.left = point.x;
        this.top = point.y;
    }
    move(dx:number,dy:number){
        this.left+=dx;
        this.top+=dy;
    }
    /**
     * 矩形到点point的距离
     * @param point 
     */
    dis(point: Point) {
        if (this.contain(point)) return 0;
        if (point.y > this.top) {
            if (this.containX(point.x)) return point.dis(new Point(point.x, this.top));
            else if (point.x < this.left) return point.dis(this.leftTop)
            else return point.dis(this.rightTop)
        }
        else if (point.y < this.bottom) {
            if (this.containX(point.x)) return point.dis(new Point(point.x, this.bottom));
            else if (point.x < this.left) return point.dis(this.leftBottom)
            else return point.dis(this.rightBottom)
        }
        else if (point.x < this.left) {
            return point.dis(new Point(this.left, point.y))
        }
        else if (point.x > this.right) {
            return point.dis(new Point(this.right, point.y))
        }
    }
    merge(rect: Rect) {
        return RectUtility.getPointsBound([...this.points, ...rect.points])
    }
    static getRectFromRects(rects: Rect[]) {
        var ps = rects.map(r => [r.leftTop, r.rightBottom]).flat();
        return new Polygon(...ps).bound;
    }
    transformToRect(matrix: Matrix) {
        var t = this.leftTop;
        var e = this.rightBottom;
        return new Rect(matrix.transform(t), matrix.transform(e));
    }
    transformToPoints(matrix: Matrix) {
        return this.points.map(t => matrix.transform(t));
    }
}

export class RectUtility {
    /**
     * 围绕一个小的矩形，弹一个窗，
     * 尽可能的展示自已，尽量不要挡住这个小的矩形
     * @param pos 
     */
    static cacPopoverPosition(pos: PopoverPosition) {
        if (typeof pos.dist == 'undefined') pos.dist = 10;
        if (typeof pos.offset == 'undefined') pos.offset = 0;
        if (typeof pos.align == 'undefined') pos.align = 'start';
        if (typeof pos.direction == 'undefined') pos.direction = 'bottom';
        if (typeof pos.roundArea == 'undefined' && typeof pos.roundPoint != 'undefined')
            pos.roundArea = new Rect(pos.roundPoint.x, pos.roundPoint.y, 0, 0)
        var x: number, y: number;
        var roundTop = pos.roundArea.top - pos.dist - pos.elementArea.height;
        var rountBottom = pos.roundArea.top + pos.roundArea.height + pos.dist;
        var roundMiddle = pos.roundArea.middle - pos.elementArea.height * ((pos.roundArea.middle) / window.innerHeight);
        var roundLeft = pos.roundArea.left - pos.dist - pos.elementArea.width;
        var roundRight = pos.roundArea.left + pos.roundArea.width + pos.dist;
        var roundCenter = pos.roundArea.center - pos.elementArea.width * ((pos.roundArea.center) / window.innerWidth);
        switch (pos.direction) {
            case 'top':
                y = roundTop;
                if (y < 0) {
                    y = rountBottom;
                    if (y + pos.elementArea.height > window.innerHeight) y = roundMiddle;
                }
                x = pos.roundArea.left + pos.offset;
                if (pos.align == 'center') x = pos.roundArea.center - pos.elementArea.width / 2 + pos.offset;
                else if (pos.align == 'end') x = pos.roundArea.right - pos.elementArea.width + pos.offset;
                if (x < 0 || x + pos.elementArea.width > window.innerWidth) x = roundCenter;
                break;
            case 'bottom':
                y = rountBottom;
                if (y + pos.elementArea.height > window.innerHeight) {
                    y = roundTop;
                    if (y < 0) y = roundMiddle;
                }
                x = pos.roundArea.left + pos.offset;
                if (pos.align == 'center') x = pos.roundArea.center - pos.elementArea.width / 2 + pos.offset;
                else if (pos.align == 'end') x = pos.roundArea.right - pos.elementArea.width + pos.offset;
                if (x < 0 || x + pos.elementArea.width > window.innerWidth) x = roundCenter;
                break;
            case 'left':
                x = roundLeft;
                if (x < 0) {
                    x = roundRight;
                    if (x + pos.elementArea.width > window.innerWidth) x = roundCenter;
                }
                y = pos.roundArea.top + pos.offset;
                if (pos.align == 'center') y = pos.roundArea.middle - pos.elementArea.height / 2 + pos.offset;
                else if (pos.align == 'end') y = pos.roundArea.bottom - pos.elementArea.height + pos.offset;
                if (y < 0 || y + pos.elementArea.height > window.innerHeight) y = roundMiddle;
                break;
            case 'right':
                x = roundRight;
                if (x + pos.elementArea.width > window.innerWidth) {
                    x = roundLeft;
                    if (x < 0) x = roundCenter;
                }
                y = pos.roundArea.top + pos.offset;
                if (pos.align == 'center') y = pos.roundArea.middle - pos.elementArea.height / 2 + pos.offset;
                else if (pos.align == 'end') y = pos.roundArea.bottom - pos.elementArea.height + pos.offset;
                if (y < 0 || y + pos.elementArea.height > window.innerHeight) y = roundMiddle;
                break;
        }
        if (pos.relativePoint) {
            return new Point(x - pos.relativePoint.x, y - pos.relativePoint.y);
        }
        else return new Point(x, y);
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
    static getPointsBound(points: Point[]) {
        var minX = points[0].x;
        var minY = points[0].y;
        var maxX = points[0].x;
        var maxY = points[0].y;
        for (let i = 1; i < points.length; i++) {
            minX = Math.min(minX, points[i].x);
            minY = Math.min(minY, points[i].y);
            maxX = Math.max(maxX, points[i].x);
            maxY = Math.max(maxY, points[i].y);
        }
        return new Rect(new Point(minX, minY), new Point(maxX, maxY))
    }

    static getRectLineRects(rect: Rect, d: number) {
        return [
            new Rect(rect.leftTop.sub(d / 2), d + rect.width, d),
            new Rect(rect.rightTop.sub(d / 2), d, d + rect.height),
            new Rect(rect.leftBottom.sub(d / 2), d + rect.width, d),
            new Rect(rect.leftTop.sub(d / 2), d, d + rect.height),
        ]
    }
}

