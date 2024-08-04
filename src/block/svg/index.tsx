import React, { CSSProperties, SVGAttributes } from "react";
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
        if (data)
            for (let n in data) {
                if (n == 'viewBox' && data[n]) {
                    this.viewBox = new Rect(data[n][0], data[n][1], data[n][2], data[n][3])
                }
                else if (n == 'childs' && Array.isArray(data[n])) {
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
    render(options?: {  strokeWidth?: number, style?: CSSProperties, attrs?: SVGAttributes<SVGSVGElement> }) {
        if (this.childs.length == 0) return <svg></svg>
        var vb = this.viewBox;
        if (!vb) {
            vb = this.getBound();
            if (vb && options?.strokeWidth) {
                vb = vb.extend(options.strokeWidth);
            }

            if (!options) {
                options = {}
            }
            if (!options?.style) {
                options.style = {}
            }
            if (vb && typeof options.style.width == 'undefined') {
                options.style.width = vb.width;
                options.style.height = vb.height;
            }
        }
        if (!vb) return <svg></svg>
        return <svg {...(options?.attrs || {})} viewBox={`${vb.x} ${vb.y} ${vb.width} ${vb.height}`} style={options?.style || {}}>
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
    getBound() {
        var bs: Rect[] = [];
        this.childs.forEach(p => {
            var b = p.getBound();
            if (b)
                bs.push(p.getBound());
        })
        if (bs.length == 0) return null;
        return RectUtility.getPointsBound(bs.map(b => b.points).flat());
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

