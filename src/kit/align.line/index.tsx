import React from "react";
import { Kit } from "..";
import { Point, Rect } from "../../common/vector/point";

export class AlignLine extends React.Component<{ kit: Kit }>{
    renderLines(lines: { moveRect: Rect, moveArrow: string, rect: Rect, arrow: string }[]) {
        var d = 100;
        var ls: { start: Point, end: Point }[] = [];
        lines.forEach(line => {
            if (line.arrow == 'left' || line.arrow == 'right') {
                var start: Point = new Point();
                start.x = line.arrow == 'left' ? line.rect.left : line.rect.right;
                start.y = Math.min(line.rect.top - d, line.moveRect.top - d);
                var end: Point = new Point();
                end.x = line.arrow == 'left' ? line.rect.left : line.rect.right;
                end.y = Math.max(line.rect.bottom + d, line.moveRect.bottom + d);
                ls.push({ start, end });
            }
            else if (line.arrow == 'top' || line.arrow == 'bottom') {
                var start: Point = new Point();
                start.y = line.arrow == 'top' ? line.rect.top : line.rect.bottom;
                start.x = Math.min(line.rect.left - d, line.moveRect.left - d);
                var end: Point = new Point();
                end.y = line.arrow == 'top' ? line.rect.top : line.rect.bottom;
                end.x = Math.max(line.rect.right + d, line.moveRect.right + d);
                ls.push({ start, end });
            }
        })
        for (let i = 0; i < ls.length; i++) {
            var el = this.els[i];
            var line = ls[i];
            if (!el) {
                el = document.createElement('div');
                this.el.appendChild(el);
            }
            if (line.start.x == line.end.x) {
                el.style.display = 'block';
                el.style.top = (Math.min(line.end.y, line.start.y)) + 'px';
                el.style.left = (line.start.x) + 'px';
                el.style.height = (Math.abs(line.end.y - line.start.y)) + 'px';
                el.style.width = (Math.abs(line.start.x - line.end.x)) + 'px'
            }
            else {
                el.style.display = 'block';
                el.style.top = (line.start.y) + 'px';
                el.style.left = (Math.min(line.start.y, line.end.y)) + 'px';
                el.style.height = (Math.abs(line.end.y - line.start.y)) + 'px';
                el.style.width = (Math.abs(line.start.x - line.end.x)) + 'px'
            }
        }
        for (let j = ls.length; j < this.els.length; j++) {
            this.els[j].style.display = 'none';
        }
    }
    els: HTMLDivElement[] = [];
    el: HTMLElement;
    render() {
        return <div className="shy-align-lines" ref={e => this.el = e}>
        </div>
    }
}