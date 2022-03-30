import React from "react";
import { Matrix } from "../../common/matrix";
import { Segment } from "./segment";

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
