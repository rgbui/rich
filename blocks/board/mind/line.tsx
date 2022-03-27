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
        if (this.props.mind.mindRoot.lineType == 'brokenLine') {
            var r = 0.66;
            if (this.direction == 'x') {
                return <>
                    {this.leftPoints.map((point, index) => {
                        var lx = (point.x - this.leftOrigin.x) * r;
                        var px = (this.leftOrigin.x - point.x) * (1 - r);
                        var dString = `M${this.leftOrigin.join(" ")}L${this.leftOrigin.move(lx, 0).join(" ")}L${point.move(px, 0).join(" ")}L${point.join(" ")}`;
                        return <path key={index} d={dString}  ></path>
                    })}
                    {this.rightPoints.map((point, index) => {
                        var lx = (point.x - this.rightOrigin.x) * r;
                        var px = (this.rightOrigin.x - point.x) * (1 - r);
                        var dString = `M${this.rightOrigin.join(" ")}L${this.rightOrigin.move(lx, 0).join(" ")}L${point.move(px, 0).join(" ")}L${point.join(" ")}`;
                        return <path key={'right' + index} d={dString}></path>
                    })}
                </>
            }
            else {
                return <>
                    {this.leftPoints.map((point, index) => {
                        var lx = (point.y - this.leftOrigin.y) * r;
                        var px = (this.leftOrigin.y - point.y) * (1 - r);
                        var dString = `M${this.leftOrigin.join(" ")}L${this.leftOrigin.move(0, lx).join(" ")}L${point.move(0, px).join(" ")}L${point.join(" ")}`;
                        return <path key={index} d={dString} >
                        </path>
                    })}
                    {this.rightPoints.map((point, index) => {
                        var lx = (point.y - this.rightOrigin.y) * r;
                        var px = (this.rightOrigin.y - point.y) * (1 - r);
                        var dString = `M${this.rightOrigin.join(" ")}L${this.rightOrigin.move(0, lx).join(" ")}L${point.move(0, px).join(" ")}L${point.join(" ")}`;
                        return <path key={'right' + index} d={dString} >
                        </path>
                    })}
                </>
            }
        }
        else {
            var d = 40;
            if (this.direction == 'x') {
                return <>
                    {this.leftPoints.map((point, index) => {
                        return <path key={index} d={`M${this.leftOrigin.join(' ')} C ${this.leftOrigin.move(0 - d, 0).join(' ')}, ${point.move(d, 0).join(' ')}, ${point.join(' ')}`} >
                        </path>
                    })}
                    {this.rightPoints.map((point, index) => {
                        return <path key={'right' + index} d={`M${this.rightOrigin.join(' ')} C ${this.rightOrigin.move(d, 0).join(' ')}, ${point.move(0 - d, 0).join(' ')}, ${point.join(' ')}`} >
                        </path>
                    })}
                </>
            }
            else {
                return <>
                    {this.leftPoints.map((point, index) => {
                        return <path key={index} d={`M${this.leftOrigin.join(' ')} C ${this.leftOrigin.move(0, 0 - d).join(' ')}, ${point.move(0, d).join(' ')}, ${point.join(' ')}`} >
                        </path>
                    })}
                    {this.rightPoints.map((point, index) => {
                        return <path key={'right' + index} d={`M${this.rightOrigin.join(' ')} C ${this.rightOrigin.move(0, d).join(' ')}, ${point.move(0, 0 - d).join(' ')}, ${point.join(' ')}`} >
                        </path>
                    })}
                </>
            }
        }
    }
    render() {
        if (!this.leftOrigin) return <></>;
        return <svg
            className="sy-flow-mind-line"
            style={{
                top: this.range.top,
                left: this.range.left,
                width: this.range.width,
                height: this.range.height,
                stroke: this.props.mind.mindRoot.lineColor
            }}
            viewBox={`${this.range.left} ${this.range.top} ${this.range.width} ${this.range.height} `}>{this.renderLines()}</svg>
    }
}