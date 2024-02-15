import React from "react";
import { FlowMind } from ".";
import { Point, RectUtility, Rect } from "../../../src/common/vector/point";

export class FlowMindLine extends React.Component<{ mind: FlowMind }>{
    private leftOrigin: Point;
    private leftPoints: Point[] = [];
    private rightOrigin: Point;
    private rightPoints: Point[] = [];
    private range: Rect;
    direction: 'x' | 'y' | 'none';
    updateView(
        direction: 'x' | 'y' | 'none',
        leftOrigin: Point,
        leftPoints: Point[],
        rightOrigin: Point,
        rightPoints: Point[]
    ) {
        this.direction = direction;
        this.leftOrigin = leftOrigin;
        this.leftPoints = leftPoints;
        this.rightOrigin = rightOrigin;
        this.rightPoints = rightPoints;
        this.range = RectUtility.getPointsBound([
            this.leftOrigin,
            ...this.leftPoints,
            this.rightOrigin,
            ...this.rightPoints,
        ]).extend(20);
        this.forceUpdate();
    }
    renderLines() {
        return <>
            {this.leftPoints.map((point, index) => {
                var dString = GetLineSvg(this.props.mind.mindRoot.lineType, this.direction as any, this.leftOrigin, point, 0.4, {
                    isEnd: index == this.leftPoints.length - 1,
                    isStart: index == 0
                })
                return <path key={index} d={dString}  ></path>
            })}
            {this.rightPoints.map((point, index) => {
                var dString = GetLineSvg(this.props.mind.mindRoot.lineType, this.direction as any, this.rightOrigin, point, 0.4, {
                    isEnd: index == this.rightPoints.length - 1,
                    isStart: index == 0
                })
                return <path key={'right' + index} d={dString}  ></path>
            })}
        </>
    }
    render() {
        if (!this.leftOrigin) return <></>;
        if (this.props.mind.subMindSpread == false) return <></>;
        var g: FlowMind = this.props.mind.closest(g => (g as FlowMind).lineColor ? true : false) as FlowMind;
        if (!g) g = this.props.mind.mindRoot;
        return <svg
            className="sy-flow-mind-line"
            style={{
                top: this.range.top,
                left: this.range.left,
                width: this.range.width,
                height: this.range.height,
                stroke: g.lineColor || 'black'
            }}
            viewBox={`${this.range.left} ${this.range.top} ${this.range.width} ${this.range.height} `}>{this.renderLines()}</svg>
    }
}

export function GetLineSvg(type: 'brokenLine' | 'cure',
    direction: 'x' | 'y',
    from: Point,
    to: Point,
    r: number, options?: { isEnd?: boolean, isStart?: boolean }) {
    if (type == 'brokenLine') {
        var dx = r > 1 ? (to.x > from.x ? r : (0 - r)) : (to.x - from.x) * r;
        var dy = r > 1 ? (to.y > from.y ? r : (0 - r)) : (to.y - from.y) * r;
        if (options?.isEnd && !options?.isStart || !options?.isEnd && options?.isStart) {
            var rc = 30;
            if (direction == 'x') {
                var p1 = from.move(dx, 0)
                var p2 = new Point(from.move(dx, 0).x, to.y)
                var p3 = to.clone();
                var sd = getCure(p1, p2, p3, rc);
                var cpath = `C${sd.c.join(',')} ${sd.c.join(',')} ${sd.e.join(',')}`
                return `M${from.join(",")}L${from.move(dx, 0).join(",")}L${sd.s.join(",")}${cpath}L${to.join(",")}`;
            }
            else {
                var p1 = from.move(0, dy)
                var p2 = new Point(to.x, from.move(0, dy).y)
                var p3 = to.clone();
                var sd = getCure(p1, p2, p3, rc);
                var cpath = `C${sd.c.join(',')} ${sd.c.join(',')} ${sd.e.join(',')}`
                return `M${from.join(",")}L${from.move(0, dy).join(",")}L${sd.s.join(",")}${cpath}L${to.join(",")}`;
            }
        }
        else {
            if (direction == 'x') return `M${from.join(",")}L${from.move(dx, 0).join(",")}L${new Point(from.move(dx, 0).x, to.y).join(",")}L${to.join(",")}`;
            else return `M${from.join(",")}L${from.move(0, dy).join(",")}L${new Point(to.x, from.move(0, dy).y).join(",")}L${to.join(",")}`;
        }
    }
    else if (type == 'cure') {
        var dx = r > 1 ? (to.x > from.x ? r : (0 - r)) : (to.x - from.x) * r;
        var dy = r > 1 ? (to.y > from.y ? r : (0 - r)) : (to.y - from.y) * r;
        if (direction == 'x') return `M${from.join(',')}C${from.move(dx, 0).join(',')} ${to.move(0 - dx, 0).join(',')} ${to.join(',')}`
        else return `M${from.join(',')} C ${from.move(0, dy).join(',')} ${to.move(0, 0 - dy).join(',')} ${to.join(',')}`
    }
}

export function getCure(p1: Point, p2: Point, p3: Point, r: number) {
    var s: Point = p2.clone();
    var e: Point = p2.clone();
    var ps = Math.abs(p1.x - p2.x) + Math.abs(p1.y - p2.y);
    var pe = Math.abs(p3.x - p2.x) + Math.abs(p3.y - p2.y);
    r = Math.min(ps * 0.2, pe * 0.2, r);
    r = Math.max(ps * 0.1, pe * 0.1, r);
    if (p1.x == p2.x) {
        s.y = p1.y < p2.y ? s.y - r : s.y + r;
    }
    else {
        s.x = p1.x < p2.x ? s.x - r : s.x + r;
    }
    if (p3.x == p2.x) {
        e.y = p3.y < p2.y ? e.y - r : e.y + r;
    }
    else {
        e.x = p3.x < p2.x ? e.x - r : e.x + r;
    }
    return {
        s,
        e,
        c: p2.clone()
    }
}