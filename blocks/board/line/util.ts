import { Block } from "../../../src/block";
import { BoardBlockSelector } from "../../../src/block/partial/board";
import { Segment } from "../../../src/block/svg/segment";
import { LineSegment } from "../../../src/common/vector/line";
import { Point, Rect, PointArrow } from "../../../src/common/vector/point";
import { Line } from "./line";


export function cachBrokeLinePoints(line: Line, fp: {
    point: Point;
    pi: BoardBlockSelector;
    block: Block;
} | {
    point: Point;
    pi?: undefined;
    block?: undefined;
}, tp: {
    point: Point;
    pi: BoardBlockSelector;
    block: Block;
} | {
    point: Point;
    pi?: undefined;
    block?: undefined;
}) {
    var segs: Segment[] = [];
    var fr: Rect;
    var tr: Rect
    if (fp.block) {
        fr = new Rect(0, 0, fp.block.fixedSize.width, fp.block.fixedSize.height)
        fr = fr.transformToRect(fp.block.globalMatrix)
        fr = fr.transformInverseToRect(line.globalMatrix)
    }
    if (tp.block) {
        tr = new Rect(0, 0, tp.block.fixedSize.width, tp.block.fixedSize.height)
        tr = tr.transformToRect(tp.block.globalMatrix)
        tr = tr.transformInverseToRect(line.globalMatrix)
    }

    if (!fp.block) {
        if (!tp.block) {
            segs.push(Segment.create(fp.point));
            segs.push(Segment.create(new Point((fp.point.x + tp.point.x) / 2, fp.point.y)));
            segs.push(Segment.create(new Point((fp.point.x + tp.point.x) / 2, tp.point.y)));
            segs.push(Segment.create(tp.point));
        }
        else {
            if (tp.pi?.arrows.includes(PointArrow.top)) {
                if (fp.point.y < tp.point.y - 30) {
                    segs.push(Segment.create(fp.point));
                    segs.push(Segment.create(new Point(tp.point.x, fp.point.y)));
                    segs.push(Segment.create(tp.point));
                }
                else {
                    segs.push(Segment.create(fp.point));

                    segs.push(Segment.create(new Point(fp.point.x, tp.point.y - 100)));
                    segs.push(Segment.create(new Point(tp.point.x, tp.point.y - 100)));
                    segs.push(Segment.create(tp.point));
                }
            }
            else if (tp.pi?.arrows.includes(PointArrow.bottom)) {
                if (fp.point.y > tp.point.y + 30) {
                    segs.push(Segment.create(fp.point));
                    segs.push(Segment.create(new Point(tp.point.x, fp.point.y)));
                    segs.push(Segment.create(tp.point));
                }
                else {
                    segs.push(Segment.create(fp.point));
                    segs.push(Segment.create(new Point(fp.point.x, tp.point.y + 100)));
                    segs.push(Segment.create(new Point(tp.point.x, tp.point.y + 100)));
                    segs.push(Segment.create(tp.point));
                }
            }
            else if (tp.pi?.arrows.includes(PointArrow.left)) {
                if (fp.point.x < tp.point.x - 30) {
                    segs.push(Segment.create(fp.point));
                    segs.push(Segment.create(new Point(fp.point.x, tp.point.y)));
                    segs.push(Segment.create(tp.point));
                }
                else {
                    segs.push(Segment.create(fp.point));
                    segs.push(Segment.create(new Point(tp.point.x - 100, fp.point.y)));
                    segs.push(Segment.create(new Point(tp.point.x - 100, tp.point.y)));
                    segs.push(Segment.create(tp.point));
                }
            }
            else if (tp.pi?.arrows.includes(PointArrow.right)) {
                if (fp.point.x > tp.point.x + 30) {
                    segs.push(Segment.create(fp.point));
                    segs.push(Segment.create(new Point(fp.point.x, tp.point.y)));
                    segs.push(Segment.create(tp.point));
                }
                else {
                    segs.push(Segment.create(fp.point));
                    segs.push(Segment.create(new Point(tp.point.x + 100, fp.point.y)));
                    segs.push(Segment.create(new Point(tp.point.x + 100, tp.point.y)));
                    segs.push(Segment.create(tp.point));
                }
            }
        }
    }
    else {
        if (!tp.block) {
            var list = cachBrokeLinePoints(line, tp, fp)
            list.reverse();
            segs.push(...list);
        }
        else if (tp.block) {
            if (fp.pi.arrows.includes(PointArrow.top)) {
                if (tp.pi.arrows.includes(PointArrow.top)) {
                    segs.push(Segment.create(fp.point));
                    segs.push(Segment.create(new Point(fp.point.x, Math.min(tp.point.y, fp.point.y) - 100)));
                    segs.push(Segment.create(new Point(tp.point.x, Math.min(tp.point.y, fp.point.y) - 100)));
                    segs.push(Segment.create(tp.point));
                }
                else if (tp.pi.arrows.includes(PointArrow.bottom)) {
                    segs.push(Segment.create(fp.point));
                    segs.push(Segment.create(new Point(fp.point.x, fp.point.y - 100)));
                    segs.push(Segment.create(new Point(fp.point.x / 2 + tp.point.x / 2, fp.point.y - 100)));
                    segs.push(Segment.create(new Point(fp.point.x / 2 + tp.point.x / 2, tp.point.y - 100)));
                    segs.push(Segment.create(new Point(tp.point.x, tp.point.y - 100)));
                    segs.push(Segment.create(tp.point));
                }
                else if (tp.pi.arrows.includes(PointArrow.left)) {
                    if (fp.point.x > tp.point.x) {
                        var ls = LineSegment.create(fp.point);
                        ls.y(Math.min(tp.point.y - tr.height / 2, fp.point.y) - 100);
                        ls.x(tp.point.x - 100);
                        ls.y(tp.point.y);
                        ls.x(tp.point.x);
                        segs.push(...ls.toSegments());
                    }
                    else {
                        if (fp.point.y - 30 > tp.point.y) {
                            var ls = LineSegment.create(fp.point);
                            ls.y(tp.point.y);
                            ls.x(tp.point.x);
                            segs.push(...ls.toSegments());
                        }
                        else {
                            var ls = LineSegment.create(fp.point);
                            ls.y(fp.point.y - 100);
                            ls.x(fp.point.x / 2 + tp.point.x / 2);
                            ls.y(tp.point.y);
                            ls.x(tp.point.x);
                            segs.push(...ls.toSegments());
                        }
                    }
                }
                else if (tp.pi.arrows.includes(PointArrow.right)) {
                    if (fp.point.x < tp.point.x) {
                        var ls = LineSegment.create(fp.point);
                        ls.y(Math.min(tp.point.y - tr.height / 2, fp.point.y) - 100);
                        ls.x(tp.point.x + 100);
                        ls.y(tp.point.y);
                        ls.x(tp.point.x);
                        segs.push(...ls.toSegments());
                    }
                    else {
                        if (fp.point.y - 30 > tp.point.y) {
                            var ls = LineSegment.create(fp.point);
                            ls.y(tp.point.y);
                            ls.x(tp.point.x);
                            segs.push(...ls.toSegments());
                        }
                        else {
                            var ls = LineSegment.create(fp.point);
                            ls.y(fp.point.y - 100);
                            ls.x(fp.point.x / 2 + tp.point.x / 2);
                            ls.y(tp.point.y);
                            ls.x(tp.point.x);
                            segs.push(...ls.toSegments());
                        }
                    }
                }
            }
            else if (fp.pi.arrows.includes(PointArrow.bottom)) {
                if (tp.pi.arrows.includes(PointArrow.top)) {
                    var list = cachBrokeLinePoints(line, tp, fp)
                    list.reverse();
                    segs.push(...list);
                }
                else if (tp.pi.arrows.includes(PointArrow.bottom)) {
                    var ls = LineSegment.create(fp.point);
                    ls.y(Math.max(tp.point.y, fp.point.y) + 100);
                    ls.x(tp.point.x);
                    ls.y(tp.point.y);
                    segs.push(...ls.toSegments());
                }
                else if (tp.pi.arrows.includes(PointArrow.left)) {
                    if (fp.point.x > tp.point.x) {
                        var ls = LineSegment.create(fp.point);
                        ls.y(Math.max(tp.point.y + tr.height / 2, fp.point.y) + 100);
                        ls.x(tp.point.x - 100);
                        ls.y(tp.point.y);
                        ls.x(tp.point.x);
                        segs.push(...ls.toSegments());
                    }
                    else {
                        if (fp.point.y - 30 > tp.point.y) {
                            var ls = LineSegment.create(fp.point);
                            ls.y(tp.point.y);
                            ls.x(tp.point.x);
                            segs.push(...ls.toSegments());
                        }
                        else {
                            var ls = LineSegment.create(fp.point);
                            ls.y(fp.point.y + 100);
                            ls.x(fp.point.x / 2 + tp.point.x / 2);
                            ls.y(tp.point.y);
                            ls.x(tp.point.x);
                            segs.push(...ls.toSegments());
                        }
                    }
                }
                else if (tp.pi.arrows.includes(PointArrow.right)) {
                    if (fp.point.x < tp.point.x) {
                        var ls = LineSegment.create(fp.point);
                        ls.y(Math.max(tp.point.y + tr.height / 2, fp.point.y) + 100);
                        ls.x(tp.point.x + 100);
                        ls.y(tp.point.y);
                        ls.x(tp.point.x);
                        segs.push(...ls.toSegments());
                    }
                    else {
                        if (fp.point.y - 30 > tp.point.y) {
                            var ls = LineSegment.create(fp.point);
                            ls.y(tp.point.y);
                            ls.x(tp.point.x);
                            segs.push(...ls.toSegments());
                        }
                        else {
                            var ls = LineSegment.create(fp.point);
                            ls.y(fp.point.y + 100);
                            ls.x(fp.point.x / 2 + tp.point.x / 2);
                            ls.y(tp.point.y);
                            ls.x(tp.point.x);
                            segs.push(...ls.toSegments());
                        }
                    }
                }
            }
            else if (fp.pi.arrows.includes(PointArrow.left)) {
                if (tp.pi.arrows.includes(PointArrow.left)) {
                    var ls = LineSegment.create(fp.point);
                    ls.x(Math.min(tp.point.x, fp.point.x) - 100);
                    ls.y(tp.point.y);
                    ls.x(tp.point.x)
                    segs.push(...ls.toSegments());
                }
                else if (tp.pi.arrows.includes(PointArrow.right)) {
                    var ls = LineSegment.create(fp.point);
                    ls.x(fp.point.x / 2 + tp.point.x / 2);
                    ls.y(tp.point.y);
                    ls.x(tp.point.x);
                    segs.push(...ls.toSegments());
                }
                else {
                    var list = cachBrokeLinePoints(line, tp, fp)
                    list.reverse();
                    segs.push(...list);
                }
            }
            else if (fp.pi.arrows.includes(PointArrow.right)) {
                if (tp.pi.arrows.includes(PointArrow.right)) {
                    var ls = LineSegment.create(fp.point);
                    ls.x(Math.max(tp.point.x, fp.point.x) + 100);
                    ls.y(tp.point.y);
                    ls.x(tp.point.x)
                    segs.push(...ls.toSegments());
                }
                else {
                    var list = cachBrokeLinePoints(line, tp, fp)
                    list.reverse();
                    segs.push(...list);
                }
            }
        }
    }
    return segs;
}