import { CSSProperties } from "react";
import { Point } from "./vector/point";

export class Matrix {
    constructor(a?: number | Matrix, b?: number, c?: number, d?: number, tx?: number, ty?: number) {
        var count = arguments.length,
            ok = true;
        if (count >= 6) {
            this._set.apply(this, arguments);
        } else if (count === 1 || count === 2) {
            var arg = arguments[0];
            if (arg instanceof Matrix) {
                this._set(arg._a, arg._b, arg._c, arg._d, arg._tx, arg._ty,
                );
            }
            else if (Array.isArray(arg)) {
                this._set.apply(this, arg);
            } else {
                ok = false;
            }
        } else if (!count) {
            this.reset();
        } else {
            ok = false;
        }
        if (!ok) {
            throw new Error('Unsupported matrix parameters');
        }
        return this;
    }
    private _a: number;
    private _b: number;
    private _c: number;
    private _d: number;
    private _tx: number;
    private _ty: number;
    private _set(a, b, c, d, tx, ty) {
        this._a = a;
        this._b = b;
        this._c = c;
        this._d = d;
        this._tx = tx;
        this._ty = ty;
        return this;
    }
    clone() {
        return new Matrix(this._a, this._b, this._c, this._d,
            this._tx, this._ty);
    }
    equals(mx) {
        return mx === this || mx && this._a === mx._a && this._b === mx._b
            && this._c === mx._c && this._d === mx._d
            && this._tx === mx._tx && this._ty === mx._ty;
    }

    toString() {
        return '[[' + [(this._a), (this._c),
        (this._tx)].join(', ') + '], ['
            + [(this._b), (this._d),
            (this._ty)].join(', ') + ']]';
    }
    reset() {
        this._a = this._d = 1;
        this._b = this._c = this._tx = this._ty = 0;
        return this;
    }
    translate(x: number | Point | { x: number, y: number }, y?: number) {
        var point = new Point(arguments[0], arguments[1]);
        this._tx += point.x * this._a + point.y * this._c;
        this._ty += point.x * this._b + point.y * this._d;
        return this;
    }
    translateMove(from:Point,to:Point){
        var dx=to.x-from.x;
        var dy=to.y-from.y;
        this.translate(dx,dy);
    }
    scale(hor: number, ver: number, cen: Point | { x: number, y: number }) {
        var scale;
        if (typeof hor == 'number' && typeof ver == 'object') scale = new Point(arguments[0], arguments[0]);
        else scale = new Point(arguments[0], arguments[1]);
        var center;
        if (typeof cen == 'object')
            center = new Point(cen);
        else if (typeof ver == 'object') center = new Point(ver);
        if (center)
            this.translate(center);
        this._a *= scale.x;
        this._b *= scale.x;
        this._c *= scale.y;
        this._d *= scale.y;
        if (center)
            this.translate(center.negate());
        return this;
    }
    rotate(angle: number, cen?: Point | number | { x: number, y: number }, y?: number) {
        angle *= Math.PI / 180;
        var center = new Point(arguments[1], arguments[2]),
            x = center.x,
            y = center.y,
            cos = Math.cos(angle),
            sin = Math.sin(angle),
            tx = x - x * cos + y * sin,
            ty = y - x * sin - y * cos,
            a = this._a,
            b = this._b,
            c = this._c,
            d = this._d;
        this._a = cos * a + sin * c;
        this._b = cos * b + sin * d;
        this._c = -sin * a + cos * c;
        this._d = -sin * b + cos * d;
        this._tx += tx * a + ty * c;
        this._ty += tx * b + ty * d;
        return this;
    }
    shear(hor: number, ver: number, cen: Point | { x: number, y: number }) {
        var shear = new Point(arguments[0], arguments[1]),
            center = new Point(arguments[2])
        if (center)
            this.translate(center);
        var a = this._a,
            b = this._b;
        this._a += shear.y * this._c;
        this._b += shear.y * this._d;
        this._c += shear.x * a;
        this._d += shear.x * b;
        if (center)
            this.translate(center.negate());
        return this;
    }

    skew(hor: number, ver: number, cen: Point | { x: number, y: number }) {
        var skew = typeof ver == 'number' ? new Point(arguments[0], arguments[1]) : new Point(hor, hor),
            center = typeof ver == 'object' ? new Point(ver) : new Point(cen),
            toRadians = Math.PI / 180,
            shear = new Point(Math.tan(skew.x * toRadians),
                Math.tan(skew.y * toRadians));
        return this.shear(shear.x, shear.y, center);
    }

    append(mx) {
        if (mx) {
            var a1 = this._a,
                b1 = this._b,
                c1 = this._c,
                d1 = this._d,
                a2 = mx._a,
                b2 = mx._c,
                c2 = mx._b,
                d2 = mx._d,
                tx2 = mx._tx,
                ty2 = mx._ty;
            this._a = a2 * a1 + c2 * c1;
            this._c = b2 * a1 + d2 * c1;
            this._b = a2 * b1 + c2 * d1;
            this._d = b2 * b1 + d2 * d1;
            this._tx += tx2 * a1 + ty2 * c1;
            this._ty += tx2 * b1 + ty2 * d1;
        }
        return this;
    }
    prepend(mx: Matrix) {
        if (mx) {
            var a1 = this._a,
                b1 = this._b,
                c1 = this._c,
                d1 = this._d,
                tx1 = this._tx,
                ty1 = this._ty,
                a2 = mx._a,
                b2 = mx._c,
                c2 = mx._b,
                d2 = mx._d,
                tx2 = mx._tx,
                ty2 = mx._ty;
            this._a = a2 * a1 + b2 * b1;
            this._c = a2 * c1 + b2 * d1;
            this._b = c2 * a1 + d2 * b1;
            this._d = c2 * c1 + d2 * d1;
            this._tx = a2 * tx1 + b2 * ty1 + tx2;
            this._ty = c2 * tx1 + d2 * ty1 + ty2;
        }
        return this;
    }
    appended(mx: Matrix) {
        return this.clone().append(mx);
    }
    prepended(mx: Matrix) {
        return this.clone().prepend(mx);
    }
    invert() {
        var a = this._a,
            b = this._b,
            c = this._c,
            d = this._d,
            tx = this._tx,
            ty = this._ty,
            det = a * d - b * c,
            res = null;
        if (det && !isNaN(det) && isFinite(tx) && isFinite(ty)) {
            this._a = d / det;
            this._b = -b / det;
            this._c = -c / det;
            this._d = a / det;
            this._tx = (c * ty - d * tx) / det;
            this._ty = (b * tx - a * ty) / det;
            res = this;
        }
        return res;
    }
    inverted() {
        return this.clone().invert();
    }
    private _shiftless() {
        return new Matrix(this._a, this._b, this._c, this._d, 0, 0);
    }
    private _orNullIfIdentity() {
        return this.isIdentity() ? null : this;
    }
    isIdentity() {
        return this._a === 1 && this._b === 0 && this._c === 0 && this._d === 1
            && this._tx === 0 && this._ty === 0;
    }
    isInvertible() {
        var det = this._a * this._d - this._c * this._b;
        return det && !isNaN(det) && isFinite(this._tx) && isFinite(this._ty);
    }

    isSingular() {
        return !this.isInvertible();
    }

    transform(point: Point | number | { x: number, y: number } | (Point | { x: number, y: number })[], y?: number) {
        if (Array.isArray(point)) {
            return point.map(x => {
                return this.transform(x);
            })
        }
        var po = new Point(arguments[0], arguments[1]);
        var x = po.x,
            y = po.y;
        return new Point(x * this._a + y * this._c + this._tx,
            x * this._b + y * this._d + this._ty);
    }
    inverseTransform(point: Point | number | { x: number, y: number }, y?: number) {
        var po = new Point(arguments[0], arguments[1]);
        var a = this._a,
            b = this._b,
            c = this._c,
            d = this._d,
            tx = this._tx,
            ty = this._ty,
            det = a * d - b * c
            ;
        if (det && !isNaN(det) && isFinite(tx) && isFinite(ty)) {
            var x = po.x - this._tx,
                y = po.y - this._ty;
            return new Point((x * d - y * c) / det,
                (y * a - x * b) / det);
        }
    }
    decompose() {
        var a = this._a,
            b = this._b,
            c = this._c,
            d = this._d,
            det = a * d - b * c,
            sqrt = Math.sqrt,
            atan2 = Math.atan2,
            degrees = 180 / Math.PI,
            rotate,
            scale,
            skew;
        if (a !== 0 || b !== 0) {
            var r = sqrt(a * a + b * b);
            rotate = Math.acos(a / r) * (b > 0 ? 1 : -1);
            scale = [r, det / r];
            skew = [atan2(a * c + b * d, r * r), 0];
        } else if (c !== 0 || d !== 0) {
            var s = sqrt(c * c + d * d);
            rotate = Math.asin(c / s) * (d > 0 ? 1 : -1);
            scale = [det / s, s];
            skew = [0, atan2(a * c + b * d, s * s)];
        } else {
            rotate = 0;
            skew = scale = [0, 0];
        }
        return {
            translation: this.getTranslation(),
            rotation: rotate * degrees,
            scaling: new Point(scale[0], scale[1]),
            skewing: new Point(skew[0] * degrees, skew[1] * degrees)
        };
    }
    getValues() {
        return [this._a, this._b, this._c, this._d, this._tx, this._ty];
    }
    getTranslation() {
        return new Point(this._tx, this._ty);
    }
    getScaling() {
        return this.decompose().scaling;
    }
    getRotation() {
        return this.decompose().rotation;
    }
    applyToContext(ctx: CanvasRenderingContext2D) {
        if (!this.isIdentity()) {
            ctx.transform(this._a, this._b, this._c, this._d,
                this._tx, this._ty);
        }
    }
    getCss() {
        var style: CSSProperties = {};
        style.transform = 'matrix(' + this.getValues().join(',') + ')';
        return style;
    }
    /**
     * 将当前的matrix分解成基本的动运matrix  
     * 当前的matrix== translate.appended(rotation).appended(scale).appended(skew)
     * @returns 
     */
    resolveMatrixs() {
        var cp = this.decompose();
        var t = new Matrix();
        t.translate(cp.translation.x, cp.translation.y);
        var r = new Matrix();
        if (cp.rotation) {
            r.rotate(cp.rotation, { x: 0, y: 0 });
        }
        var s = new Matrix();
        if (cp.scaling) {
            s.scale(cp.scaling.x, cp.scaling.y, { x: 0, y: 0 });
        }
        var k = new Matrix();
        if (cp.skewing) {
            k.skew(cp.skewing.x, cp.skewing.y, { x: 0, y: 0 });
        }
        /**
         * 当前的matrix== translate.appended(rotation).appended(scale).appended(skew)
         */
        return {
            translate: t,
            rotation: r,
            scale: s,
            skew: k
        }

    }
}