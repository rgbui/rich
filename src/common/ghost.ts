import { Point, Rect } from "./vector/point";

class GhostView {
    private _el: HTMLElement;
    private get el() {
        if (typeof this._el == 'undefined') {
            this._el = document.body.appendChild(document.createElement('div'));
            this._el.style.position = 'absolute';
            this._el.style.top = '0px';
            this._el.style.left = '0px';
            this._el.style.opacity = '0.6';
            this._el.style.pointerEvents = 'none';
            this._el.style.zIndex = '1000000';
        }
        return this._el;
    }
    bodyOverFlow: string;
    load(el: HTMLElement | HTMLElement[] | string, options: {
        point: Point,
        opacity?: number,
        background?: string,
        size?: { width: number, height: number }
    }) {
        if (typeof options.opacity == 'undefined') {
            options.opacity = .6;
        }
        this.el.style.display = 'block';
        this.el.style.top = options.point.y + 'px';
        this.el.style.left = options.point.x + 'px';
        this.el.style.opacity = options.opacity.toString();
        if (typeof el == 'string') {
            this.el.innerHTML = el;
        }
        else {
            var els = Array.isArray(el) ? el : [el];
            for (let i = 0; i < els.length; i++) {
                var e = els[i];
                var cloneEl = e.cloneNode(true) as HTMLElement;
                if (options.background) cloneEl.style.background = options.background;
                this.el.appendChild(cloneEl);
                if (options.size) {
                    cloneEl.style.width = options.size.width + 'px';
                    cloneEl.style.height = options.size.height + 'px';
                }
                else {
                    var bound = Rect.fromEle(e);
                    cloneEl.style.width = bound.width + 'px';
                    cloneEl.style.height = bound.height + 'px';
                }
            }
        }
        this.bodyOverFlow = getComputedStyle(document.body).overflow;
    }
    move(point: { x: number, y: number }) {
        this.el.style.top = point.y + 'px';
        this.el.style.left = point.x + 'px';
        document.body.style.overflow = 'hidden';
    }
    unload() {
        this.el.innerHTML = '';
        this.el.style.opacity = '0.6';
        this.el.style.display = 'none';
        document.body.style.overflow = this.bodyOverFlow;
    }
    containEl(e: HTMLElement) {
        if (typeof this._el == 'undefined') var el = this.el;
        if (this._el === e) return true;
        if (this._el.contains(e)) return true;
        return false;
    }
}
export var ghostView = new GhostView();