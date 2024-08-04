import React from "react";
import { Matrix } from "../../common/matrix";
import { Segment } from "./segment";
import { Point, Rect, RectUtility } from "../../common/vector/point";
import { util } from "../../../util/util";
import lodash from "lodash";
export class ShyCompoundPath {
    constructor(data?: Record<string, any>) {
        if (data) this.load(data);
    }
    name: string = 'compoundPath';
    paths: ShyPath[] = [];
    applyMatrix(matrix: Matrix) {
        this.paths.each(pa => pa.applyMatrix(matrix));
    }
    load(data) {
        this.paths = data.paths.map(pa => {
            return new ShyPath(pa);
        })
    }
    get() {
        return {
            name: this.name,
            paths: this.paths.map(p => p.get())
        }
    }
    render(index: number) {
        var d = this.paths.map(p => p.getPathStringBySegments(true)).join(" ")
        return <path key={index} d={d} ></path>
    }
    getBound() {
        var bs: Rect[] = [];
        this.paths.forEach(p => {
            var b = p.getBound();
            if (b)
                bs.push(p.getBound());
        })
        if (bs.length == 0) return null;
        return RectUtility.getPointsBound(bs.map(b => b.points).flat());
    }
}

export class ShyPath {
    name: string = 'path';
    segments: Segment[] = [];
    closed: boolean;
    stroke:string;
    fill:string;
    fillOpacity:number;
    strokeWidth: number;
    strokeOpacity: number;
    strokeDasharray: string;
    linearGradient: { offset: number, color: string, opacity?: number }[] = [];
    constructor(data?: Record<string, any>) {
        if (data)
            this.load(data);
    }
    applyMatrix(matrix: Matrix) {
        this.segments.each(s => s.applyMatrix(matrix));
    }
    load(data) {
        for (let n in data) {
            // if (n == 'closed') {
            //     this.closed = data[n];
            // }
            // else
            if (n == 'segments') {
                this.segments = data[n].map(d => new Segment(d))
            }
            // else if (n == 'strokeWidth') {
            //     this.strokeWidth = data[n];
            // }
            else {
                this[n] = data[n];
            }
        }
    }
    get() {
        return {
            name: this.name,
            closed: this.closed,
            segments: this.segments.map(sel => sel.get()),
            strokeWidth: this.strokeWidth,
            strokeOpacity: this.strokeOpacity,
            linearGradient: lodash.cloneDeep(this.linearGradient),
            strokeDasharray: this.strokeDasharray,
            fill:this.fill,
            fillOpacity:this.fillOpacity,
            stroke:this.stroke
        }
    }
    getPathStringBySegments(isZ?: boolean) {
        var vs = this.segments;
        var isClosed = this.closed;
        var ds = [];
        var o = (p) => `${p.x} ${p.y}`;
        var pg = (current: Segment, next: Segment) => {
            if (current.handleOut && next.handleIn) {
                return (`C${o(current.handleOut)},${o(next.handleIn)},${o(next.point)}`);
            }
            else if (current.handleOut && !next.handleIn) {
                return (`Q${o(current.handleOut)},${o(next.point)}`);
            }
            else if (!current.handleOut && next.handleIn) {
                return (`Q${o(next.handleIn)},${o(next.point)}`);
            }
            else if (!current.handleOut && !next.handleIn) {
                return (`L${o(next.point)}`);
            }
        }
        for (var i = 0; i < vs.length - 1; i++) {
            var handleIn = vs[i];
            var handleOut = vs[i + 1];
            if (i == 0) {
                ds.push(`M${o(handleIn.point)}`);
                ds.push(pg(handleIn, handleOut));
            }
            else ds.push(pg(handleIn, handleOut));
        }
        if (isClosed) {
            if (isZ) ds.push('z');
            else ds.push(pg(vs[vs.length - 1], vs[0]));
        }
        return ds.join("");
    }
    render(index: number) {
        var ds = this.getPathStringBySegments();
        console.log('strokeOpacity', this.strokeOpacity);
        if (this.linearGradient && this.linearGradient.length > 1) {
            var id = 'g' + util.shortGuid()
            var stroke = `url(#${id})`;
            return <g key={index}>
                <linearGradient id={id} x1="0%" y1="0%" x2="100%" y2="100%">
                    {this.linearGradient.map((lg, i) => {
                        return <stop offset={lg.offset + '%'} style={{ stopColor: lg.color, stopOpacity: lg.opacity || 1 }} key={i}></stop>
                    })}
                </linearGradient>
                <path stroke={stroke} strokeDasharray={this.strokeDasharray} strokeOpacity={this.strokeOpacity || undefined} strokeWidth={this.strokeWidth || undefined} key={index} d={ds}></path>
            </g>
        }
        return <path strokeDasharray={this.strokeDasharray} strokeOpacity={this.strokeOpacity || undefined} strokeWidth={this.strokeWidth || undefined} key={index} d={ds}></path>
    }
    draw(point: Point) {
        this.segments.push(Segment.create(point));
    }
    getBound() {
        var bound = Segment.getBound(this.segments);
        if (bound && typeof this.strokeWidth == 'number') {
            bound = bound.extend(this.strokeWidth);
        }
        return bound;
    }
}
