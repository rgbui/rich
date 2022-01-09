import React from "react";
import { Point, RectUtility, Rect } from "../../../src/common/vector/point";
export class FlowMindLine extends React.Component {
    private origin: Point;
    private points: Point[] = [];
    private range: Rect;
    updateView(origin: Point, points: Point[]) {
        this.origin = origin;
        this.points = points;
        this.range = RectUtility.getPointsBound([this.origin, ...points]).extend(30);
        this.forceUpdate();
    }
    renderLines() {
        return <g>{this.points.map((point, index) => {
            return <path key={index} d={`M${this.origin.join(' ')} C ${this.origin.move(40, 0).join(' ')}, ${point.move(-40, 0).join(' ')}, ${point.join(' ')}`} >
            </path>
        })}</g>
    }
    render() {
        if (!this.origin) return <div style={{ display: 'none' }}></div>
        return <svg viewBox={`${this.range.left}px ${this.range.left}px ${this.range.left}px ${this.range.left}px `}>{this.renderLines()}</svg>
    }
}