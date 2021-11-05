import { Point } from "./point";

class GhostView {
    private _el: HTMLElement;
    private get el() {
        if (typeof this._el == 'undefined') {
            this._el = document.body.appendChild(document.createElement('div'));
            this._el.style.position = 'absolute';
            this._el.style.width = '0px';
            this._el.style.height = '0px';
            this._el.style.zIndex = '10000';
            this._el.style.top = '0px';
            this._el.style.left = '0px';
            this._el.style.opacity = '0.6';
            this._el.style.pointerEvents = 'none';
        }
        return this._el;
    }
    load(el: HTMLElement, options: { point: Point, opacity: number, size: { width: number, height: number } }) {
        var cloneEl = el.cloneNode(true);
        this.el.style.top = options.point.y + 'px';
        this.el.style.left = options.point.x + 'px';
        this.el.style.opacity = options.opacity.toString();
        this.el.style.width = options.size.width + 'px';
        this.el.style.height = options.size.height + 'px';
    }
    move(point: { x: number, y: number }) {
        this.el.style.top = point.y + 'px';
        this.el.style.left = point.x + 'px';
    }
    unload() {
        this.el.innerHTML = '';
        this.el.style.opacity = '0.6';
        this.el.style.display = 'none';
        this.el.style.width = '0px';
        this.el.style.height = '0px';
    }
}
export var ghostView = new GhostView();