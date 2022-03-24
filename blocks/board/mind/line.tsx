import React from "react";
import { Point, RectUtility, Rect } from "../../../src/common/vector/point";
export class FlowMindLine extends React.Component {
    private leftOrigin: Point;
    private leftPoints: Point[] = [];
    private rightOrigin: Point;
    private rightPoints: Point[] = [];
    private range: Rect;
    updateView(
        leftOrigin: Point,
        leftPoints: Point[],
        rightOrigin: Point,
        rightPoints: Point[]
    ) {
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
        var d = 40;
        return <>
            {this.leftPoints.map((point, index) => {
                return <path key={index} d={`M${this.leftOrigin.join(' ')} C ${this.leftOrigin.move(d, 0).join(' ')}, ${point.move(0 - d, 0).join(' ')}, ${point.join(' ')}`} >
                </path>
            })}
            {this.rightPoints.map((point, index) => {
                return <path key={'right'+index} d={`M${this.rightOrigin.join(' ')} C ${this.rightOrigin.move(d, 0).join(' ')}, ${point.move(0 - d, 0).join(' ')}, ${point.join(' ')}`} >
                </path>
            })}
        </>
    }
    render() {
        if (!this.leftOrigin) return <div style={{ display: 'none' }}></div>
        return <svg
            className="sy-flow-mind-line"
            style={{ top: this.range.top, left: this.range.left, width: this.range.width, height: this.range.height }}
            viewBox={`${this.range.left} ${this.range.top} ${this.range.width} ${this.range.height} `}>{this.renderLines()}</svg>
    }
}