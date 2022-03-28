import React, { CSSProperties } from "react";
import { Matrix } from "../../common/matrix";
import { Point, Rect, RectUtility } from "../../common/vector/point";
export class ShySvg {
    viewBox: Rect;
    childs: (ShyGroup | ShyPath | ShyCompoundPath)[] = [];
    constructor(data?: Record<string, any>) {
        if (data) this.load(data);
    }
    applyMatrix(matrix: Matrix) {
        var points = this.viewBox.points;
        points = points.map(p => matrix.transform(p));
        this.viewBox = RectUtility.getPointsBound(points);
        this.childs.each(c => c.applyMatrix(matrix));
    }
    load(data) {
        for (let n in data) {
            if (n == 'viewBox') {
                this.viewBox = new Rect(data[n][0], data[n][1], data[n][2], data[n][3])
            }
            else if (n == 'childs') {
                this.childs = data[n].map(d => {
                    if (d.name == 'compoundPath') return new ShyCompoundPath(d)
                    else if (d.name == 'path') return new ShyPath(d)
                    return new ShyGroup(d);
                })
            }
        }
    }
    get() {
        return {
            viewBox: this.viewBox ? [this.viewBox.x, this.viewBox.y, this.viewBox.width, this.viewBox.height] : undefined,
            childs: this.childs.map(c => c.get())
        }
    }
    clone() {
        var d = this.get();
        var svg = new ShySvg();
        svg.load(d);
        return svg;
    }
    render(style?: CSSProperties) {
        return <svg viewBox={`${this.viewBox.x} ${this.viewBox.y} ${this.viewBox.width} ${this.viewBox.height}`} style={style || {}}>
            {this.childs.map((c, i) => c.render(i))}
        </svg>
    }
    scaleTo(width: number, height: number) {
        var matrix = new Matrix();
        var s = width / this.viewBox.width;
        var h = height / this.viewBox.height;
        matrix.scale(s, h, this.viewBox.leftTop);
        this.applyMatrix(matrix);
    }
    extend(d: number) {
        this.viewBox = this.viewBox.extend(d);
    }
}

export class ShyGroup {
    name: string = 'group';
    constructor(data?: Record<string, any>) {
        if (data)
            this.load(data);
    }
    paths: (ShyPath | ShyCompoundPath)[] = [];
    applyMatrix(matrix: Matrix) {
        this.paths.each(pa => pa.applyMatrix(matrix));
    }
    load(data) {
        this.paths = data.paths.map(pa => {
            if (pa.name == 'compoundPath') return new ShyCompoundPath(pa)
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
        return <g key={index}>{this.paths.map((pa, index) => pa.render(index))}</g>
    }
}

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
}

export class ShyPath {
    name: string = 'path';
    segments: Segment[] = [];
    closed: boolean;
    constructor(data?: Record<string, any>) {
        if (data)
            this.load(data);
    }
    applyMatrix(matrix: Matrix) {
        this.segments.each(s => s.applyMatrix(matrix));
    }
    load(data) {
        for (let n in data) {
            if (n == 'closed') {
                this.closed = data[n];
            }
            else if (n == 'segments') {
                this.segments = data[n].map(d => new Segment(d))
            }
        }
    }
    get() {
        return {
            name: this.name,
            closed: this.closed,
            segments: this.segments.map(sel => sel.get())
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
        return <path key={index} d={this.getPathStringBySegments()}></path>
    }
}
export class Segment {
    constructor(data?: Record<string, any>) {
        if (data) this.load(data)
    }
    point: Point;
    handleIn?: Point;
    handleOut?: Point;
    applyMatrix(matrix: Matrix) {
        this.point = matrix.transform(this.point);
        if (this.handleIn) this.handleIn = matrix.transform(this.handleIn);
        if (this.handleOut) this.handleOut = matrix.transform(this.handleOut);
    }
    load(data) {
        for (let n in data) {
            if (n == 'point') this.point = new Point(data[n][0], data[n][1])
            else if (n == 'handleIn' && data[n]) this.handleIn = new Point(data[n][0], data[n][1]);
            else if (n == 'handleOut' && data[n]) this.handleOut = new Point(data[n][0], data[n][1])
        }
    }
    get() {
        return {
            point: [this.point.x, this.point.y],
            handleIn: this.handleIn ? [this.handleIn.x, this.handleIn.y] : undefined,
            handleOut: this.handleOut ? [this.handleOut.x, this.handleOut.y] : undefined
        }
    }
}