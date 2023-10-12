
import React from "react";
import { ShyPath } from "../../../src/block/svg/path";
import { Segment } from "../../../src/block/svg/segment";
import { Matrix } from "../../../src/common/matrix";
import { Point } from "../../../src/common/vector/point";
import { Line } from "./line";
export function renderLine(line: Line) {
    if (!line.page.viewEl) return <></>
    var strokeWidth = line.realPx(10);
    var segs = line.segments;
    if (segs.length < 2) return <></>
    var s = getStartPoints(line, segs);
    var e = getEndPoints(line, segs);
    if (s?.end && s.np !== true) segs[0].point = s.end;
    if (e?.end && e.np !== true) segs.last().point = e.end;
    var sd = Segment.getSegmentsPathString(segs);

    return <>
        <path className="visible" strokeLinejoin="round" d={sd}></path>
        {s && <>{s.el}{s.te}</>}
        {e && <>{e.el}{e.te}</>}
        <path className="transparent" d={sd} stroke="transparent" strokeWidth={strokeWidth}></path>
    </>
}

function getArrowMatrix(start: Point, arrowPoint: Point, toStart: Point, toArrowPoint: Point) {
    var matrix = new Matrix();
    matrix.translateMove(start, toStart);
    var r = Math.atan2(toArrowPoint.y - toStart.y, toArrowPoint.x - toStart.x) * 180 / Math.PI;
    if (r < 0) r = 360 + r
    else if (r > 0) r = r;
    var ca = Math.atan2(arrowPoint.y - start.y, arrowPoint.x - start.x) * 180 / Math.PI;
    if (ca < 0) ca = 360 + ca
    else if (ca > 0) ca = ca;
    matrix.rotate(ca + r, { x: 0, y: 0 });
    return matrix;

}

function getArrow(color, arrowType, toStart: Point, toArrowPoint: Point, strokeWidth: number) {
    if (typeof arrowType == 'string') arrowType = parseInt(arrowType);
    var data: {
        path: ShyPath,
        el?: JSX.Element,
        te?: JSX.Element,
        fill?: boolean,
        line?: boolean,
        circle?: boolean,
        start: Point,
        end: Point,
        np?: boolean
    } = {
        path: new ShyPath(),
        arrows: [],
    } as any;
    var d = 6 * strokeWidth;
    if (typeof arrowType == 'string') arrowType = parseInt(arrowType);
    if (arrowType == 0) {
        data.path.segments.push(Segment.fromXY(-d - d / 3, (0 - d) / 2))
        data.path.segments.push(Segment.fromXY(0, 0));
        data.path.segments.push(Segment.fromXY(-d - d / 3, d / 2));
        data.path.segments.push(Segment.fromXY(-d * .7, 0));
        data.start = new Point(0, 0);
        data.end = new Point(-d * .7, 0);
        data.fill = true;
        data.path.closed = true;
    }
    else if (arrowType == 1) {
        data.path.segments.push(Segment.fromXY(-d, (0 - d) / 1.732))
        data.path.segments.push(Segment.fromXY(0, 0));
        data.path.segments.push(Segment.fromXY(-d, d / 1.732));
        data.start = new Point(0, 0);
        data.end = new Point(-d, 0);
        data.np = true;
    }
    else if (arrowType == 2) {
        data.path.segments.push(Segment.fromXY(-d, (0 - d) / 1.732))
        data.path.segments.push(Segment.fromXY(0, 0));
        data.path.segments.push(Segment.fromXY(-d, d / 1.732));
        data.start = new Point(0, 0);
        data.end = new Point(-d, 0);
        data.fill = true;
        data.path.closed = true;
    }
    else if (arrowType == 3) {
        data.path.segments.push(Segment.fromXY(-d, (0 - d) / 1.732))
        data.path.segments.push(Segment.fromXY(0, 0));
        data.path.segments.push(Segment.fromXY(-d, d / 1.732));
        data.start = new Point(0, 0);
        data.end = new Point(-d, 0);
        data.path.closed = true;
    }
    else if (arrowType == 4) {
        data.path.segments.push(Segment.fromXY(-d / 2, -d / 2))
        data.path.segments.push(Segment.fromXY(0, 0));
        data.path.segments.push(Segment.fromXY(-d / 2, d / 2));
        data.path.segments.push(Segment.fromXY(-d, 0));
        data.start = new Point(0, 0);
        data.end = new Point(-d * 0.8, 0);
        data.fill = true;
        data.path.closed = true;
    }
    else if (arrowType == 5) {
        data.path.segments.push(Segment.fromXY(-d / 2, -d / 2))
        data.path.segments.push(Segment.fromXY(0, 0));
        data.path.segments.push(Segment.fromXY(-d / 2, d / 2));
        data.path.segments.push(Segment.fromXY(-d, 0));
        data.start = new Point(0, 0);
        data.end = new Point(-d, 0);
        data.path.closed = true;
    }
    else if (arrowType == 6) {
        data.path.segments.push(Segment.fromXY(-d / 2, 0))
        data.start = new Point(0, 0);
        data.end = new Point(-d, 0);
        data.fill = true;
        data.circle = true;
    }
    else if (arrowType == 7) {
        data.path.segments.push(Segment.fromXY(-d / 2, 0))
        data.start = new Point(0, 0);
        data.end = new Point(-d, 0);
        data.circle = true;
    }
    var matrix = getArrowMatrix(data.start, data.end, toStart, toArrowPoint);
    data.start = matrix.transform(data.start);
    data.end = matrix.transform(data.end);
    data.path.applyMatrix(matrix);
    if (data.circle) {
        if (data.fill) {
            data.el = <circle strokeDasharray={'none'} fill={color} stroke={'none'} r={data.start.dis(data.end) / 2}
                cx={data.path.segments[0].point.x} cy={data.path.segments[0].point.y}></circle>
            data.te = <circle className="transparent" strokeDasharray={'none'} fill={color} stroke={'none'} r={data.start.dis(data.end) / 2}
                cx={data.path.segments[0].point.x} cy={data.path.segments[0].point.y}></circle>
        }
        else {
            data.el = <circle strokeDasharray={'none'} fill={'none'} stroke={color} r={data.start.dis(data.end) / 2}
                cx={data.path.segments[0].point.x} cy={data.path.segments[0].point.y}></circle>
            data.te = <circle className="transparent" strokeDasharray={'none'} fill={'none'} stroke={color} r={data.start.dis(data.end) / 2}
                cx={data.path.segments[0].point.x} cy={data.path.segments[0].point.y}></circle>
        }
    }
    else if (data.fill) {
        data.el = <path strokeDasharray={'none'} fill={color} d={data.path.getPathStringBySegments(data.path.closed)} stroke={'none'}></path>
        data.te = <path className="transparent" strokeDasharray={'none'} fill={color} d={data.path.getPathStringBySegments(data.path.closed)} stroke={'none'}></path>
    }
    else {
        data.el = <path strokeDasharray={'none'} fill={'none'} d={data.path.getPathStringBySegments(data.path.closed)} stroke={color}></path>
        data.te = <path className="transparent" strokeDasharray={'none'} fill={'none'} d={data.path.getPathStringBySegments(data.path.closed)} stroke={color}></path>
    }
    return data;
}


function getStartPoints(line: Line, segs: Segment[]) {
    if (line.lineStart == 'none') return;
    var strokeWidth = line.pattern.getSvgStyle()?.strokeWidth || 1;
    var color = line.pattern.getSvgStyle()?.stroke || '#000';
    var s = segs[0];
    var s1 = segs[1];
    var se = s.handleOut || s1.handleIn || s1.point;
    return getArrow(color, line.lineStart, s.point, se, strokeWidth);
}

function getEndPoints(line: Line, segs: Segment[]) {
    if (line.lineEnd == 'none') return;
    var strokeWidth = line.pattern.getSvgStyle()?.strokeWidth || 1;
    var color = line.pattern.getSvgStyle()?.stroke || '#000';
    var s = segs.last();
    var s1 = segs[segs.length - 2]
    var se = s.handleIn || s1.handleOut || s1.point;
    return getArrow(color, line.lineEnd, s.point, se, strokeWidth);
}