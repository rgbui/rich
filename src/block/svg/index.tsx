import React, { CSSProperties } from "react";
import { Matrix } from "../../common/matrix";
import { Rect, RectUtility } from "../../common/vector/point";
import { ShyPath, ShyCompoundPath } from "./path";

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

