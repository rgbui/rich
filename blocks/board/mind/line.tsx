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
                var dString = GetLineSvg(this.props.mind.mindRoot.lineType, this.direction as any, this.leftOrigin, point, 0.4)
                return <path strokeWidth={this.props.mind.lineWidth} key={index} d={dString}  ></path>
            })}
            {this.rightPoints.map((point, index) => {
                var dString = GetLineSvg(this.props.mind.mindRoot.lineType, this.direction as any, this.rightOrigin, point, 0.4)
                return <path strokeWidth={this.props.mind.lineWidth} key={'right' + index} d={dString}  ></path>
            })}
        </>
    }
    render() {
        if (!this.leftOrigin) return <></>;
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
    r: number) {
    if (type == 'brokenLine') {
        var dx = r > 1 ? (to.x > from.x ? r : (0 - r)) : (to.x - from.x) * r;
        var dy = r > 1 ? (to.y > from.y ? r : (0 - r)) : (to.y - from.y) * r;
        if (direction == 'x') return `M${from.join(" ")}L${from.move(dx, 0).join(" ")}L${to.move(0 - dx, 0).join(" ")}L${to.join(" ")}`;
        else return `M${from.join(" ")}L${from.move(0, dy).join(" ")}L${to.move(0, 0 - dy).join(" ")}L${to.join(" ")}`;
    }
    else if (type == 'cure') {
        var dx = r > 1 ? (to.x > from.x ? r : (0 - r)) : (to.x - from.x) * r;
        var dy = r > 1 ? (to.y > from.y ? r : (0 - r)) : (to.y - from.y) * r;
        if (direction == 'x') return `M${from.join(' ')} C ${from.move(dx, 0).join(' ')}, ${to.move(0 - dx, 0).join(' ')}, ${to.join(' ')}`
        else return `M${from.join(' ')} C ${from.move(0, dy).join(' ')}, ${to.move(0, 0 - dy).join(' ')}, ${to.join(' ')}`
    }
}