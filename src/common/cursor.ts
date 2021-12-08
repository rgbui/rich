

export type CursorName = 'default' | 'pointer' | 'col-resize' | 'column-resize';

class Cursor {
    private _el: HTMLElement;
    private get el() {
        if (typeof this._el == 'undefined') {
            this._el = document.body.appendChild(document.createElement('div'));
            this._el.style.position = 'fixed';
            this._el.style.width = '100vw';
            this._el.style.height = '100vh';
            this._el.style.zIndex = '10000';
            this._el.style.top = '0px';
            this._el.style.left = '0px';
        }
        return this._el;
    }
    private time: any;
    show(cursor: CursorName) {
        if (this.time) {
            clearTimeout(this.time);
            this.time = null;
        }
        this.el.style.display = 'block';
        this.el.style.cursor = cursor;
        this.time = setTimeout(() => {
            this.hide();
        }, 1e4);
    }
    hide() {
        this.el.style.display = 'none';
        if (this.time) {
            clearTimeout(this.time);
            this.time = null;
        }
    }
}

export var MouseCursor = new Cursor();