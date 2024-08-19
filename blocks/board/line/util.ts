import { Block } from "../../../src/block";
import { BoardBlockSelector } from "../../../src/block/partial/board";
import { Segment } from "../../../src/block/svg/segment";
import { LineSegment } from "../../../src/common/vector/line";
import { Point, Rect, PointArrow } from "../../../src/common/vector/point";
import { Line } from "./line";


export function cacBrokeSimpleLinePoints(line: Line, from: {
    point: Point;
    pi?: BoardBlockSelector;
    block?: Block;
} | {
    point: Point;
    pi?: undefined;
    block?: undefined;
}, to: {
    point: Point;
    pi?: BoardBlockSelector;
    block?: Block;
} | {
    point: Point;
    pi?: undefined;
    block?: undefined;
}, options?: { direction?: "x" | "y" }) {
    var segs: Segment[] = [];
    var fromRect: Rect;
    var toRect: Rect
    if (from.block) {
        fromRect = new Rect(0, 0, from.block.fixedSize.width, from.block.fixedSize.height)
        fromRect = fromRect.transformToRect(from.block.globalMatrix)
        fromRect = fromRect.transformInverseToRect(line.globalMatrix)
    }
    if (to.block) {
        toRect = new Rect(0, 0, to.block.fixedSize.width, to.block.fixedSize.height)
        toRect = toRect.transformToRect(to.block.globalMatrix)
        toRect = toRect.transformInverseToRect(line.globalMatrix)
    }

    var minGap = line.realPx(30);
    var extendDis = line.realPx(100);
    var ls = LineSegment.create(from.point);
    if (!from.block && !to.block) {
        if (Math.abs(from.point.x - to.point.x) > Math.abs(from.point.y - to.point.y)) {
            ls.x(from.point.x / 2 + to.point.x / 2);
            ls.y(to.point.y);
            ls.x(to.point.x);
        }
        else {
            ls.y(from.point.y / 2 + to.point.y / 2);
            ls.x(to.point.x);
            ls.y(to.point.y);
        }
    }
    else if (from.block && !to.block) {
        if (from.pi?.arrows.includes(PointArrow.top)) {
            if (from.point.y - minGap > to.point.y) {
                ls.y(from.point.y / 2 + to.point.y / 2);
                ls.x(to.point.x);
                ls.y(to.point.y);
            }
            else if (to.point.y > fromRect.bottom && fromRect.containX(to.point.x) || fromRect.contain(to.point)) {
                ls.y(from.point.y - extendDis);
                if (to.point.x > fromRect.center) {
                    ls.x(fromRect.right + extendDis);
                }
                else {
                    ls.x(fromRect.left - extendDis);
                }
                ls.y(to.point.y);
                ls.x(to.point.x);
            }
            else {
                ls.y(from.point.y - extendDis);
                ls.x(to.point.x);
                ls.y(to.point.y);
            }
        }
        else if (from.pi?.arrows.includes(PointArrow.bottom)) {
            if (from.point.y + minGap < to.point.y) {
                ls.y(from.point.y / 2 + to.point.y / 2);
                ls.x(to.point.x);
                ls.y(to.point.y);
            }
            else if (to.point.y < fromRect.top && fromRect.containX(to.point.x) || fromRect.contain(to.point)) {
                ls.y(from.point.y + extendDis);
                if (to.point.x > fromRect.center) {
                    ls.x(fromRect.right + extendDis);
                }
                else {
                    ls.x(fromRect.left - extendDis);
                }
                ls.y(to.point.y);
                ls.x(to.point.x);
            }
            else {
                ls.y(from.point.y + extendDis);
                ls.x(to.point.x);
                ls.y(to.point.y);
            }

        }
        else if (from.pi?.arrows.includes(PointArrow.left)) {

            if (from.point.x - minGap > to.point.x) {
                ls.x(from.point.x / 2 + to.point.x / 2);
                ls.y(to.point.y);
                ls.x(to.point.x);
            }
            else if (to.point.x > fromRect.right && fromRect.containY(to.point.y) || fromRect.contain(to.point)) {
                ls.x(from.point.x - extendDis);
                if (to.point.y > fromRect.middle) {
                    ls.y(fromRect.bottom + extendDis);
                }
                else {
                    ls.y(fromRect.top - extendDis);
                }
                ls.x(to.point.x);
                ls.y(to.point.y);
            }
            else {
                ls.x(from.point.x - extendDis);
                ls.y(to.point.y);
                ls.x(to.point.x);
            }
        }
        else if (from.pi?.arrows.includes(PointArrow.right)) {

            if (from.point.x + minGap < to.point.x) {
                ls.x(from.point.x / 2 + to.point.x / 2);
                ls.y(to.point.y);
                ls.x(to.point.x);
            }
            else if (to.point.x < fromRect.left && fromRect.containY(to.point.y) || fromRect.contain(to.point)) {
                ls.x(from.point.x + extendDis);
                if (to.point.y > fromRect.middle) {
                    ls.y(fromRect.bottom + extendDis);
                }
                else {
                    ls.y(fromRect.top - extendDis);
                }
                ls.x(to.point.x);
                ls.y(to.point.y);
            }
            else {
                ls.x(from.point.x + extendDis);
                ls.y(to.point.y);
                ls.x(to.point.x);
            }
        }
    }
    else if (from.block && to.block) {
        var has = (f: PointArrow, t: PointArrow) => {
            return from.pi.arrows.includes(f) && to.pi.arrows.includes(t);
        }
        if (has(PointArrow.top, PointArrow.top)) {
            if (from.point.y < toRect.bottom && toRect.containX(from.point.x, minGap)) {

                ls.y(from.point.y - extendDis);
                if (fromRect.bottom < toRect.top) {
                    if (from.point.x > toRect.center) ls.x(Math.max(toRect.right, fromRect.right) + extendDis);
                    else ls.x(Math.min(toRect.left, fromRect.left) - extendDis);
                    ls.y(toRect.top / 2 + fromRect.bottom / 2)
                    ls.x(to.point.x);
                    ls.y(to.point.y);
                }
                else {
                    ls.x(to.point.x);
                    ls.y(to.point.y);
                }
            }
            else if (to.point.y > fromRect.bottom && fromRect.containX(to.point.x, minGap)) {
                ls.y(from.point.y - extendDis);
                if (from.point.x > toRect.center) ls.x(fromRect.right + extendDis);
                else ls.x(fromRect.left - extendDis);
                ls.y(to.point.y / 2 + fromRect.bottom / 2);
                ls.x(to.point.x);
            }
            else {
                ls.y(Math.min(from.point.y - extendDis, to.point.y - extendDis));
                ls.x(to.point.x)
                ls.y(to.point.y);
            }
        }
        else if (has(PointArrow.top, PointArrow.left)) {
            if (fromRect.isForwardSide('right', to.point)) {
                ls.y(from.point.y - extendDis);
                ls.x(fromRect.right / 2 + to.point.x / 2);
                ls.y(to.point.y);
                ls.x(to.point.x);
            }
            else if (fromRect.isSide('top', to.point)) {
                if (to.point.x > from.point.x) {
                    ls.y(to.point.y);
                    ls.x(to.point.x);

                }
                else {
                    if (from.point.x > toRect.right) {
                        ls.y(toRect.top - extendDis);
                        ls.x(Math.min(toRect.left, fromRect.left) - extendDis);
                        ls.y(to.point.y);
                        ls.x(to.point.x);
                    }
                    else {
                        if (from.point.y < toRect.bottom) {
                            ls.y(from.point.y / 2 + toRect.bottom / 2);
                            ls.x(toRect.left - extendDis);
                            ls.y(to.point.y);
                            ls.x(to.point.x);
                        }
                        else {
                            ls.y(toRect.bottom - extendDis);
                            ls.x(toRect.left - extendDis);
                            ls.y(to.point.y);
                            ls.x(to.point.x);
                        }
                    }
                }
            }
            else {
                ls.y(from.point.y - extendDis);
                ls.x(Math.min(fromRect.left, toRect.left) - extendDis);
                ls.y(to.point.y);
                ls.x(to.point.x);
            }
        }
        else if (has(PointArrow.top, PointArrow.right)) {
            if (fromRect.isForwardSide('left', to.point)) {
                ls.y(from.point.y - extendDis);
                ls.x(fromRect.left / 2 + to.point.x / 2);
                ls.y(to.point.y);
                ls.x(to.point.x);
            }
            else if (fromRect.isSide('top', to.point)) {
                if (to.point.x < from.point.x) {
                    ls.y(to.point.y);
                    ls.x(to.point.x);
                }
                else {
                    if (from.point.x < toRect.left) {
                        ls.y(toRect.top - extendDis);
                        ls.x(Math.max(toRect.right, fromRect.right) + extendDis);
                        ls.y(to.point.y);
                        ls.x(to.point.x);
                    }
                    else {
                        if (from.point.y < toRect.bottom) {
                            ls.y(from.point.y / 2 + toRect.bottom / 2);
                            ls.x(toRect.right + extendDis);
                            ls.y(to.point.y);
                            ls.x(to.point.x);
                        }
                        else {
                            ls.y(toRect.bottom - extendDis);
                            ls.x(toRect.right + extendDis);
                            ls.y(to.point.y);
                            ls.x(to.point.x);
                        }
                    }
                }
            }
            else {
                ls.y(from.point.y - extendDis);
                ls.x(Math.max(fromRect.right, toRect.right) + extendDis);
                ls.y(to.point.y);
                ls.x(to.point.x);
            }
        }
        else if (has(PointArrow.top, PointArrow.bottom)) {
            if (fromRect.isSide('top', to.point)) {
                if (from.point.x == to.point.x) {
                    ls.y(to.point.y);
                }
                else {
                    ls.y(to.point.y / 2 + from.point.y / 2);
                    ls.x(to.point.x);
                    ls.y(to.point.y);
                }
            }
            else if (fromRect.isSide('left', to.point)) {
                if (fromRect.left > toRect.left) {
                    ls.y(from.point.y - extendDis);
                    ls.x(fromRect.left / 2 + toRect.right / 2)
                    ls.y(to.point.y + extendDis);
                    ls.x(to.point.x);
                    ls.y(to.point.y);
                }
                else {
                    ls.y(from.point.y - extendDis);
                    ls.x(toRect.left - extendDis);
                    ls.y(to.point.y + extendDis);
                    ls.x(to.point.x);
                    ls.y(to.point.y);
                }
            }
            else if (fromRect.isSide("right", to.point)) {
                if (fromRect.right < toRect.right) {
                    ls.y(from.point.y - extendDis);
                    ls.x(fromRect.right / 2 + toRect.left / 2)
                    ls.y(to.point.y + extendDis);
                    ls.x(to.point.x);
                    ls.y(to.point.y);
                }
                else {
                    ls.y(from.point.y - extendDis);
                    ls.x(toRect.right + extendDis);
                    ls.y(to.point.y + extendDis);
                    ls.x(to.point.x);
                    ls.y(to.point.y);
                }

            }
            else {
                if (to.point.x < from.point.x) {
                    ls.y(from.point.y - extendDis);
                    ls.x(Math.min(fromRect.left, toRect.left) - extendDis);
                    ls.y(to.point.y + extendDis);
                    ls.x(to.point.x);
                    ls.y(to.point.y);
                }
                else {
                    ls.y(from.point.y - extendDis);
                    ls.x(Math.max(fromRect.right, toRect.right) + extendDis);
                    ls.y(to.point.y + extendDis);
                    ls.x(to.point.x);
                    ls.y(to.point.y);
                }
            }
        }
        else if (has(PointArrow.bottom, PointArrow.left)) {
            if (fromRect.isForwardSide('right', to.point)) {
                ls.y(from.point.y + extendDis);
                ls.x(fromRect.right / 2 + to.point.x / 2);
                ls.y(to.point.y);
                ls.x(to.point.x);
            }
            else if (fromRect.isSide('bottom', to.point)) {
                if (to.point.x > from.point.x) {
                    ls.y(to.point.y);
                    ls.x(to.point.x);
                }
                else {
                    if (from.point.x > toRect.right) {
                        ls.y(toRect.bottom + extendDis);
                        ls.x(Math.min(toRect.left, fromRect.left) - extendDis);
                        ls.y(to.point.y);
                        ls.x(to.point.x);
                    }
                    else {
                        if (from.point.y > toRect.top) {
                            ls.y(from.point.y / 2 + toRect.top / 2);
                            ls.x(toRect.left - extendDis);
                            ls.y(to.point.y);
                            ls.x(to.point.x);
                        }
                        else {
                            ls.y(toRect.top + extendDis);
                            ls.x(toRect.left - extendDis);
                            ls.y(to.point.y);
                            ls.x(to.point.x);
                        }
                    }
                }
            }
            else {
                ls.y(from.point.y + extendDis);
                ls.x(Math.min(fromRect.left, toRect.left) - extendDis);
                ls.y(to.point.y);
                ls.x(to.point.x);
            }
        }
        else if (has(PointArrow.bottom, PointArrow.right)) {

            if (fromRect.isForwardSide('left', to.point)) {
                ls.y(from.point.y + extendDis);
                ls.x(fromRect.left / 2 + to.point.x / 2);
                ls.y(to.point.y);
                ls.x(to.point.x);
            }
            else if (fromRect.isSide('bottom', to.point)) {
                if (to.point.x < from.point.x) {
                    ls.y(to.point.y);
                    ls.x(to.point.x);
                }
                else {
                    if (from.point.x < toRect.left) {
                        ls.y(toRect.bottom + extendDis);
                        ls.x(Math.max(toRect.right, fromRect.right) + extendDis);
                        ls.y(to.point.y);
                        ls.x(to.point.x);
                    }
                    else {
                        if (from.point.y > toRect.top) {
                            ls.y(from.point.y / 2 + toRect.top / 2);
                            ls.x(toRect.right + extendDis);
                            ls.y(to.point.y);
                            ls.x(to.point.x);
                        }
                        else {
                            ls.y(toRect.top + extendDis);
                            ls.x(toRect.right + extendDis);
                            ls.y(to.point.y);
                            ls.x(to.point.x);
                        }
                    }
                }
            }
            else {
                ls.y(from.point.y + extendDis);
                ls.x(Math.max(fromRect.right, toRect.right) + extendDis);
                ls.y(to.point.y);
                ls.x(to.point.x);
            }
        }
        else if (has(PointArrow.bottom, PointArrow.bottom)) {

            if (from.point.y < toRect.top && toRect.containX(to.point.x, minGap)) {
                ls.y(from.point.y / 2 + toRect.top / 2);
                if (from.point.x > toRect.center) ls.x(toRect.right + extendDis);
                else ls.x(toRect.left - extendDis);
                ls.y(to.point.y + extendDis);
                ls.x(to.point.x);
                ls.y(to.point.y);
            }
            else if (to.point.y > fromRect.bottom && fromRect.containX(to.point.x, minGap)) {
                ls.y(from.point.y + extendDis);
                if (from.point.x > toRect.center) ls.x(Math.max(fromRect.right, toRect.right) + extendDis);
                else ls.x(Math.max(fromRect.left, toRect.left) - extendDis);
                ls.y(to.point.y / 2 + fromRect.top / 2);
                ls.x(to.point.x);
                ls.y(to.point.y);
            }
            else {
                ls.y(Math.max(from.point.y + extendDis, to.point.y + extendDis));
                ls.x(to.point.x);
                ls.y(to.point.y);
            }

        }
        else if (has(PointArrow.left, PointArrow.left)) {
            if (toRect.isForwardSide('right', from.point)) {
                if (fromRect.left > toRect.right) ls.x(fromRect.left / 2 + toRect.right / 2);
                else ls.x(fromRect.left / 2 + to.point.x / 2);
                if (from.point.y > toRect.middle) ls.y(Math.max(toRect.bottom, fromRect.bottom) + extendDis);
                else ls.y(Math.min(fromRect.top, toRect.top) - extendDis);
                ls.x(to.point.x - extendDis);
                ls.y(to.point.y);
                ls.x(to.point.x);
            }
            else if (toRect.isForwardSide('left', from.point)) {
                ls.x(from.point.x - extendDis);
                if (from.point.y > toRect.middle) ls.y(Math.max(toRect.bottom, fromRect.bottom) + extendDis);
                else ls.y(Math.min(fromRect.top, toRect.top) - extendDis);
                if (fromRect.left > toRect.right) ls.x(fromRect.left / 2 + toRect.right / 2);
                else ls.x(fromRect.left / 2 + to.point.x / 2);
                ls.y(to.point.y);
                ls.x(to.point.x);
            }
            else {
                ls.x(Math.min(from.point.x - extendDis, to.point.x - extendDis));
                ls.y(to.point.y)
                ls.x(to.point.x);
            }
        }
        else if (has(PointArrow.left, PointArrow.right)) {
            if (fromRect.isSide('left', to.point)) {

                if (from.point.y == to.point.y) {
                    ls.x(to.point.x);
                }
                else {
                    ls.x(to.point.x / 2 + from.point.x / 2);
                    ls.y(to.point.y);
                    ls.x(to.point.x);
                }
            }
            else if (fromRect.isSide('top', to.point)) {
                if (fromRect.top > toRect.top) {
                    ls.x(from.point.x - extendDis);
                    ls.y(fromRect.top / 2 + toRect.bottom / 2)
                    ls.x(to.point.x + extendDis);
                    ls.y(to.point.y);
                    ls.x(to.point.x);
                }
                else {
                    ls.x(from.point.x - extendDis);
                    ls.y(toRect.top - extendDis);
                    ls.x(to.point.x + extendDis);
                    ls.y(to.point.y);
                    ls.x(to.point.x);
                }
            }
            else if (fromRect.isSide("bottom", to.point)) {

                if (fromRect.bottom < toRect.bottom) {
                    ls.x(from.point.x - extendDis);
                    ls.y(fromRect.bottom / 2 + toRect.top / 2)
                    ls.x(to.point.x + extendDis);
                    ls.y(to.point.y);
                    ls.x(to.point.x);
                }
                else {
                    ls.x(from.point.x - extendDis);
                    ls.y(toRect.bottom + extendDis);
                    ls.x(to.point.x + extendDis);
                    ls.y(to.point.y);
                    ls.x(to.point.x);
                }
            }
            else {
                if (to.point.y < from.point.y) {
                    ls.x(from.point.x - extendDis);
                    ls.y(Math.min(fromRect.top, toRect.top) - extendDis);
                    ls.x(to.point.x + extendDis);
                    ls.y(to.point.y);
                    ls.x(to.point.x);
                }
                else {
                    ls.x(from.point.x - extendDis);
                    ls.y(Math.max(fromRect.bottom, toRect.bottom) + extendDis);
                    ls.x(to.point.x + extendDis);
                    ls.y(to.point.y);
                    ls.x(to.point.x);
                }
            }

        }
        else if (has(PointArrow.right, PointArrow.right)) {

            if (from.point.x > toRect.right && toRect.containY(from.point.y, minGap)) {
                ls.x(from.point.x + extendDis);

                if (from.point.y > toRect.middle) ls.y(Math.max(fromRect.bottom, toRect.bottom) + extendDis);
                else ls.y(Math.min(fromRect.top, toRect.top) - extendDis);
                if (toRect.right < fromRect.left) ls.x(toRect.right / 2 + fromRect.left / 2);
                else ls.x(toRect.right / 2 + fromRect.right / 2);
                ls.y(to.point.y);
                ls.x(to.point.x);

            }
            else if (to.point.x > fromRect.right && fromRect.containY(to.point.y, minGap)) {
                if (from.point.x < toRect.left) {
                    ls.x(from.point.x / 2 + toRect.left / 2);
                }
                else {
                    ls.x(from.point.x / 2 + toRect.right / 2)
                }
                // ls.x(from.point.x + extendDis);
                if (to.point.y > fromRect.middle) ls.y(Math.max(fromRect.bottom, toRect.bottom) + extendDis);
                else ls.y(Math.min(fromRect.top, toRect.top) - extendDis);
                ls.x(to.point.x + extendDis);
                ls.y(to.point.y);
                ls.x(to.point.x);
            }
            else {
                ls.x(Math.max(from.point.x + extendDis, to.point.x + extendDis));
                ls.y(to.point.y)
                ls.x(to.point.x);
            }
        }
        else {
            var list = cacBrokeLinePoints(line, to, from)
            list.reverse();
            segs.push(...list);
            return segs;
        }
    }
    else {
        var list = cacBrokeLinePoints(line, to, from)
        list.reverse();
        segs.push(...list);
        return segs;
    }
    segs.push(...ls.toSegments());
    return segs;
}

export function cacBrokeLinePoints(line: Line, from: {
    point: Point;
    pi?: BoardBlockSelector;
    block?: Block;
} | {
    point: Point;
    pi?: undefined;
    block?: undefined;
}, to: {
    point: Point;
    pi?: BoardBlockSelector;
    block?: Block;
} | {
    point: Point;
    pi?: undefined;
    block?: undefined;
}, options?: { direction?: "x" | "y" }) {

    var segs: Segment[] = [];
    var fromRect: Rect;
    var toRect: Rect
    if (from.block) {
        fromRect = new Rect(0, 0, from.block.fixedSize.width, from.block.fixedSize.height)
        fromRect = fromRect.transformToRect(from.block.globalMatrix)
        fromRect = fromRect.transformInverseToRect(line.globalMatrix)
    }
    if (to.block) {
        toRect = new Rect(0, 0, to.block.fixedSize.width, to.block.fixedSize.height)
        toRect = toRect.transformToRect(to.block.globalMatrix)
        toRect = toRect.transformInverseToRect(line.globalMatrix)
    }

    var minGap = line.realPx(30);
    var extendDis = line.realPx(100);
    var ls = LineSegment.create(from.point);
    if (!from.block && !to.block) {
        if (options?.direction == 'x') {
            ls.x(from.point.x / 2 + to.point.x / 2);
            ls.y(to.point.y);
            ls.x(to.point.x);
        }
        else {
            ls.y(from.point.y / 2 + to.point.y / 2);
            ls.x(to.point.x);
            ls.y(to.point.y);
        }
    }
    else if (from.block && !to.block) {
        if (from.pi?.arrows.includes(PointArrow.top)) {
            if (from.point.y - minGap > to.point.y) {
                ls.x(to.point.x);
                ls.y(to.point.y);
            }
            else if (to.point.y > fromRect.bottom && fromRect.containX(to.point.x) || fromRect.contain(to.point)) {
                ls.y(from.point.y - extendDis);
                if (to.point.x > fromRect.center) {
                    ls.x(fromRect.right + extendDis);
                }
                else {
                    ls.x(fromRect.left - extendDis);
                }
                ls.y(to.point.y);
                ls.x(to.point.x);
            }
            else {
                ls.y(from.point.y - extendDis);
                ls.x(to.point.x);
                ls.y(to.point.y);
            }
        }
        else if (from.pi?.arrows.includes(PointArrow.bottom)) {
            if (from.point.y + minGap < to.point.y) {
                ls.x(to.point.x);
                ls.y(to.point.y);
            }
            else if (to.point.y < fromRect.top && fromRect.containX(to.point.x) || fromRect.contain(to.point)) {
                ls.y(from.point.y + extendDis);
                if (to.point.x > fromRect.center) {
                    ls.x(fromRect.right + extendDis);
                }
                else {
                    ls.x(fromRect.left - extendDis);
                }
                ls.y(to.point.y);
                ls.x(to.point.x);
            }
            else {
                ls.y(from.point.y + extendDis);
                ls.x(to.point.x);
                ls.y(to.point.y);
            }

        }
        else if (from.pi?.arrows.includes(PointArrow.left)) {

            if (from.point.x - minGap > to.point.x) {
                ls.y(from.point.y);
                ls.x(to.point.x);
                ls.y(to.point.y);
            }
            else if (to.point.x > fromRect.right && fromRect.containY(to.point.y) || fromRect.contain(to.point)) {
                ls.x(from.point.x - extendDis);
                if (to.point.y > fromRect.middle) {
                    ls.y(fromRect.bottom + extendDis);
                }
                else {
                    ls.y(fromRect.top - extendDis);
                }
                ls.x(to.point.x);
                ls.y(to.point.y);
            }
            else {
                ls.x(from.point.x - extendDis);
                ls.y(to.point.y);
                ls.x(to.point.x);
            }
        }
        else if (from.pi?.arrows.includes(PointArrow.right)) {

            if (from.point.x + minGap < to.point.x) {
                ls.y(from.point.y);
                ls.x(to.point.x);
                ls.y(to.point.y);
            }
            else if (to.point.x < fromRect.left && fromRect.containY(to.point.y) || fromRect.contain(to.point)) {
                ls.x(from.point.x + extendDis);
                if (to.point.y > fromRect.middle) {
                    ls.y(fromRect.bottom + extendDis);
                }
                else {
                    ls.y(fromRect.top - extendDis);
                }
                ls.x(to.point.x);
                ls.y(to.point.y);
            }
            else {
                ls.x(from.point.x + extendDis);
                ls.y(to.point.y);
                ls.x(to.point.x);
            }
        }
    }
    else if (from.block && to.block) {
        var has = (f: PointArrow, t: PointArrow) => {
            return from.pi.arrows.includes(f) && to.pi.arrows.includes(t);
        }
        if (has(PointArrow.top, PointArrow.top)) {
            if (from.point.y < toRect.bottom && toRect.containX(from.point.x, minGap)) {

                ls.y(from.point.y - extendDis);
                if (fromRect.bottom < toRect.top) {
                    if (from.point.x > toRect.center) ls.x(Math.max(toRect.right, fromRect.right) + extendDis);
                    else ls.x(Math.min(toRect.left, fromRect.left) - extendDis);
                    ls.y(toRect.top / 2 + fromRect.bottom / 2)
                    ls.x(to.point.x);
                    ls.y(to.point.y);
                }
                else {
                    ls.x(to.point.x);
                    ls.y(to.point.y);
                }
            }
            else if (to.point.y > fromRect.bottom && fromRect.containX(to.point.x, minGap)) {
                ls.y(from.point.y - extendDis);
                if (from.point.x > toRect.center) ls.x(fromRect.right + extendDis);
                else ls.x(fromRect.left - extendDis);
                ls.y(to.point.y / 2 + fromRect.bottom / 2);
                ls.x(to.point.x);
            }
            else {
                ls.y(Math.min(from.point.y - extendDis, to.point.y - extendDis));
                ls.x(to.point.x)
                ls.y(to.point.y);
            }
        }
        else if (has(PointArrow.top, PointArrow.left)) {
            if (fromRect.isForwardSide('right', to.point)) {
                ls.y(from.point.y - extendDis);
                ls.x(fromRect.right / 2 + to.point.x / 2);
                ls.y(to.point.y);
                ls.x(to.point.x);
            }
            else if (fromRect.isSide('top', to.point)) {
                if (to.point.x > from.point.x) {
                    ls.y(to.point.y);
                    ls.x(to.point.x);

                }
                else {
                    if (from.point.x > toRect.right) {
                        ls.y(toRect.top - extendDis);
                        ls.x(Math.min(toRect.left, fromRect.left) - extendDis);
                        ls.y(to.point.y);
                        ls.x(to.point.x);
                    }
                    else {
                        if (from.point.y < toRect.bottom) {
                            ls.y(from.point.y / 2 + toRect.bottom / 2);
                            ls.x(toRect.left - extendDis);
                            ls.y(to.point.y);
                            ls.x(to.point.x);
                        }
                        else {
                            ls.y(toRect.bottom - extendDis);
                            ls.x(toRect.left - extendDis);
                            ls.y(to.point.y);
                            ls.x(to.point.x);
                        }
                    }
                }
            }
            else {
                ls.y(from.point.y - extendDis);
                ls.x(Math.min(fromRect.left, toRect.left) - extendDis);
                ls.y(to.point.y);
                ls.x(to.point.x);
            }
        }
        else if (has(PointArrow.top, PointArrow.right)) {
            if (fromRect.isForwardSide('left', to.point)) {
                ls.y(from.point.y - extendDis);
                ls.x(fromRect.left / 2 + to.point.x / 2);
                ls.y(to.point.y);
                ls.x(to.point.x);
            }
            else if (fromRect.isSide('top', to.point)) {
                if (to.point.x < from.point.x) {
                    ls.y(to.point.y);
                    ls.x(to.point.x);
                }
                else {
                    if (from.point.x < toRect.left) {
                        ls.y(toRect.top - extendDis);
                        ls.x(Math.max(toRect.right, fromRect.right) + extendDis);
                        ls.y(to.point.y);
                        ls.x(to.point.x);
                    }
                    else {
                        if (from.point.y < toRect.bottom) {
                            ls.y(from.point.y / 2 + toRect.bottom / 2);
                            ls.x(toRect.right + extendDis);
                            ls.y(to.point.y);
                            ls.x(to.point.x);
                        }
                        else {
                            ls.y(toRect.bottom - extendDis);
                            ls.x(toRect.right + extendDis);
                            ls.y(to.point.y);
                            ls.x(to.point.x);
                        }
                    }
                }
            }
            else {
                ls.y(from.point.y - extendDis);
                ls.x(Math.max(fromRect.right, toRect.right) + extendDis);
                ls.y(to.point.y);
                ls.x(to.point.x);
            }
        }
        else if (has(PointArrow.top, PointArrow.bottom)) {
            if (fromRect.isSide('top', to.point)) {
                if (from.point.x == to.point.x) {
                    ls.y(to.point.y);
                }
                else {
                    ls.y(to.point.y / 2 + from.point.y / 2);
                    ls.x(to.point.x);
                    ls.y(to.point.y);
                }
            }
            else if (fromRect.isSide('left', to.point)) {
                if (fromRect.left > toRect.left) {
                    ls.y(from.point.y - extendDis);
                    ls.x(fromRect.left / 2 + toRect.right / 2)
                    ls.y(to.point.y + extendDis);
                    ls.x(to.point.x);
                    ls.y(to.point.y);
                }
                else {
                    ls.y(from.point.y - extendDis);
                    ls.x(toRect.left - extendDis);
                    ls.y(to.point.y + extendDis);
                    ls.x(to.point.x);
                    ls.y(to.point.y);
                }
            }
            else if (fromRect.isSide("right", to.point)) {
                if (fromRect.right < toRect.right) {
                    ls.y(from.point.y - extendDis);
                    ls.x(fromRect.right / 2 + toRect.left / 2)
                    ls.y(to.point.y + extendDis);
                    ls.x(to.point.x);
                    ls.y(to.point.y);
                }
                else {
                    ls.y(from.point.y - extendDis);
                    ls.x(toRect.right + extendDis);
                    ls.y(to.point.y + extendDis);
                    ls.x(to.point.x);
                    ls.y(to.point.y);
                }

            }
            else {
                if (to.point.x < from.point.x) {
                    ls.y(from.point.y - extendDis);
                    ls.x(Math.min(fromRect.left, toRect.left) - extendDis);
                    ls.y(to.point.y + extendDis);
                    ls.x(to.point.x);
                    ls.y(to.point.y);
                }
                else {
                    ls.y(from.point.y - extendDis);
                    ls.x(Math.max(fromRect.right, toRect.right) + extendDis);
                    ls.y(to.point.y + extendDis);
                    ls.x(to.point.x);
                    ls.y(to.point.y);
                }
            }
        }
        else if (has(PointArrow.bottom, PointArrow.left)) {
            if (fromRect.isForwardSide('right', to.point)) {
                ls.y(from.point.y + extendDis);
                ls.x(fromRect.right / 2 + to.point.x / 2);
                ls.y(to.point.y);
                ls.x(to.point.x);
            }
            else if (fromRect.isSide('bottom', to.point)) {
                if (to.point.x > from.point.x) {
                    ls.y(to.point.y);
                    ls.x(to.point.x);
                }
                else {
                    if (from.point.x > toRect.right) {
                        ls.y(toRect.bottom + extendDis);
                        ls.x(Math.min(toRect.left, fromRect.left) - extendDis);
                        ls.y(to.point.y);
                        ls.x(to.point.x);
                    }
                    else {
                        if (from.point.y > toRect.top) {
                            ls.y(from.point.y / 2 + toRect.top / 2);
                            ls.x(toRect.left - extendDis);
                            ls.y(to.point.y);
                            ls.x(to.point.x);
                        }
                        else {
                            ls.y(toRect.top + extendDis);
                            ls.x(toRect.left - extendDis);
                            ls.y(to.point.y);
                            ls.x(to.point.x);
                        }
                    }
                }
            }
            else {
                ls.y(from.point.y + extendDis);
                ls.x(Math.min(fromRect.left, toRect.left) - extendDis);
                ls.y(to.point.y);
                ls.x(to.point.x);
            }
        }
        else if (has(PointArrow.bottom, PointArrow.right)) {

            if (fromRect.isForwardSide('left', to.point)) {
                ls.y(from.point.y + extendDis);
                ls.x(fromRect.left / 2 + to.point.x / 2);
                ls.y(to.point.y);
                ls.x(to.point.x);
            }
            else if (fromRect.isSide('bottom', to.point)) {
                if (to.point.x < from.point.x) {
                    ls.y(to.point.y);
                    ls.x(to.point.x);
                }
                else {
                    if (from.point.x < toRect.left) {
                        ls.y(toRect.bottom + extendDis);
                        ls.x(Math.max(toRect.right, fromRect.right) + extendDis);
                        ls.y(to.point.y);
                        ls.x(to.point.x);
                    }
                    else {
                        if (from.point.y > toRect.top) {
                            ls.y(from.point.y / 2 + toRect.top / 2);
                            ls.x(toRect.right + extendDis);
                            ls.y(to.point.y);
                            ls.x(to.point.x);
                        }
                        else {
                            ls.y(toRect.top + extendDis);
                            ls.x(toRect.right + extendDis);
                            ls.y(to.point.y);
                            ls.x(to.point.x);
                        }
                    }
                }
            }
            else {
                ls.y(from.point.y + extendDis);
                ls.x(Math.max(fromRect.right, toRect.right) + extendDis);
                ls.y(to.point.y);
                ls.x(to.point.x);
            }
        }
        else if (has(PointArrow.bottom, PointArrow.bottom)) {

            if (from.point.y < toRect.top && toRect.containX(to.point.x, minGap)) {
                ls.y(from.point.y / 2 + toRect.top / 2);
                if (from.point.x > toRect.center) ls.x(toRect.right + extendDis);
                else ls.x(toRect.left - extendDis);
                ls.y(to.point.y + extendDis);
                ls.x(to.point.x);
                ls.y(to.point.y);
            }
            else if (to.point.y > fromRect.bottom && fromRect.containX(to.point.x, minGap)) {
                ls.y(from.point.y + extendDis);
                if (from.point.x > toRect.center) ls.x(Math.max(fromRect.right, toRect.right) + extendDis);
                else ls.x(Math.max(fromRect.left, toRect.left) - extendDis);
                ls.y(to.point.y / 2 + fromRect.top / 2);
                ls.x(to.point.x);
                ls.y(to.point.y);
            }
            else {
                ls.y(Math.max(from.point.y + extendDis, to.point.y + extendDis));
                ls.x(to.point.x);
                ls.y(to.point.y);
            }

        }
        else if (has(PointArrow.left, PointArrow.left)) {
            if (toRect.isForwardSide('right', from.point)) {
                if (fromRect.left > toRect.right) ls.x(fromRect.left / 2 + toRect.right / 2);
                else ls.x(fromRect.left / 2 + to.point.x / 2);
                if (from.point.y > toRect.middle) ls.y(Math.max(toRect.bottom, fromRect.bottom) + extendDis);
                else ls.y(Math.min(fromRect.top, toRect.top) - extendDis);
                ls.x(to.point.x - extendDis);
                ls.y(to.point.y);
                ls.x(to.point.x);
            }
            else if (toRect.isForwardSide('left', from.point)) {
                ls.x(from.point.x - extendDis);
                if (from.point.y > toRect.middle) ls.y(Math.max(toRect.bottom, fromRect.bottom) + extendDis);
                else ls.y(Math.min(fromRect.top, toRect.top) - extendDis);
                if (fromRect.left > toRect.right) ls.x(fromRect.left / 2 + toRect.right / 2);
                else ls.x(fromRect.left / 2 + to.point.x / 2);
                ls.y(to.point.y);
                ls.x(to.point.x);
            }
            else {
                ls.x(Math.min(from.point.x - extendDis, to.point.x - extendDis));
                ls.y(to.point.y)
                ls.x(to.point.x);
            }
        }
        else if (has(PointArrow.left, PointArrow.right)) {
            if (fromRect.isSide('left', to.point)) {

                if (from.point.y == to.point.y) {
                    ls.x(to.point.x);
                }
                else {
                    ls.x(to.point.x / 2 + from.point.x / 2);
                    ls.y(to.point.y);
                    ls.x(to.point.x);
                }
            }
            else if (fromRect.isSide('top', to.point)) {
                if (fromRect.top > toRect.top) {
                    ls.x(from.point.x - extendDis);
                    ls.y(fromRect.top / 2 + toRect.bottom / 2)
                    ls.x(to.point.x + extendDis);
                    ls.y(to.point.y);
                    ls.x(to.point.x);
                }
                else {
                    ls.x(from.point.x - extendDis);
                    ls.y(toRect.top - extendDis);
                    ls.x(to.point.x + extendDis);
                    ls.y(to.point.y);
                    ls.x(to.point.x);
                }
            }
            else if (fromRect.isSide("bottom", to.point)) {

                if (fromRect.bottom < toRect.bottom) {
                    ls.x(from.point.x - extendDis);
                    ls.y(fromRect.bottom / 2 + toRect.top / 2)
                    ls.x(to.point.x + extendDis);
                    ls.y(to.point.y);
                    ls.x(to.point.x);
                }
                else {
                    ls.x(from.point.x - extendDis);
                    ls.y(toRect.bottom + extendDis);
                    ls.x(to.point.x + extendDis);
                    ls.y(to.point.y);
                    ls.x(to.point.x);
                }
            }
            else {
                if (to.point.y < from.point.y) {
                    ls.x(from.point.x - extendDis);
                    ls.y(Math.min(fromRect.top, toRect.top) - extendDis);
                    ls.x(to.point.x + extendDis);
                    ls.y(to.point.y);
                    ls.x(to.point.x);
                }
                else {
                    ls.x(from.point.x - extendDis);
                    ls.y(Math.max(fromRect.bottom, toRect.bottom) + extendDis);
                    ls.x(to.point.x + extendDis);
                    ls.y(to.point.y);
                    ls.x(to.point.x);
                }
            }

        }
        else if (has(PointArrow.right, PointArrow.right)) {

            if (from.point.x > toRect.right && toRect.containY(from.point.y, minGap)) {
                ls.x(from.point.x + extendDis);

                if (from.point.y > toRect.middle) ls.y(Math.max(fromRect.bottom, toRect.bottom) + extendDis);
                else ls.y(Math.min(fromRect.top, toRect.top) - extendDis);
                if (toRect.right < fromRect.left) ls.x(toRect.right / 2 + fromRect.left / 2);
                else ls.x(toRect.right / 2 + fromRect.right / 2);
                ls.y(to.point.y);
                ls.x(to.point.x);

            }
            else if (to.point.x > fromRect.right && fromRect.containY(to.point.y, minGap)) {
                if (from.point.x < toRect.left) {
                    ls.x(from.point.x / 2 + toRect.left / 2);
                }
                else {
                    ls.x(from.point.x / 2 + toRect.right / 2)
                }
                // ls.x(from.point.x + extendDis);
                if (to.point.y > fromRect.middle) ls.y(Math.max(fromRect.bottom, toRect.bottom) + extendDis);
                else ls.y(Math.min(fromRect.top, toRect.top) - extendDis);
                ls.x(to.point.x + extendDis);
                ls.y(to.point.y);
                ls.x(to.point.x);
            }
            else {
                ls.x(Math.max(from.point.x + extendDis, to.point.x + extendDis));
                ls.y(to.point.y)
                ls.x(to.point.x);
            }
        }
        else {
            var list = cacBrokeLinePoints(line, to, from)
            list.reverse();
            segs.push(...list);
            return segs;
        }
    }
    else {
        var list = cacBrokeLinePoints(line, to, from)
        list.reverse();
        segs.push(...list);
        return segs;
    }
    segs.push(...ls.toSegments());
    return segs;
}