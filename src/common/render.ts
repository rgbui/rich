
class ViewRender {
    private _el: HTMLElement;
    private get el() {
        if (typeof this._el == 'undefined') {
            this._el = document.body.appendChild(document.createElement('div'));
            this._el.style.position = 'absolute';
            this._el.style.top = '0px';
            this._el.style.left = '0px';
            this._el.style.width = '100vw';
            this._el.style.height = '100vh';
            this._el.style.pointerEvents = 'none';
            this._el.style.zIndex = '1000000';
            this._el.style.display = 'none';
            this._el.style.overflow = 'hidden';
        }
        return this._el;
    }
    renderSvg(svgHtml) {
        this.el.style.display = 'block';
        return this.el.innerHTML = `<svg width="100%" height="100%" version="1.1" xmlns="http://www.w3.org/2000/svg">
        ${svgHtml}
        </svg>`
    }
    unload() {
        this.el.innerHTML = '';
        this.el.style.display = 'none';
    }
}

export var VR = new ViewRender();