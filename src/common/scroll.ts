import { dom } from "./dom";
import { Point, Rect } from "./point";

var time;
export function onAutoScroll(options: {
    el: HTMLElement,
    point: Point,
    interval?: number,
    feelDis?: number,
    dis?: number,
    callback?(first: boolean, scrollDisY: number, scrollDisX?: number): void
}) {
    onAutoScrollStop();
    if (typeof options.interval == 'undefined') options.interval = 50;
    var fn = (fir: boolean) => {
        if (fir == true) { return options.callback ? options?.callback(fir, 0) : undefined; }
        onceAutoScroll({
            el: options.el,
            point: options.point,
            feelDis: options.feelDis,
            dis: options.dis,
            callback: (disY, disX) => {
                if (options.callback)
                    options.callback(fir, disY, disX);
            }
        })
    }
    fn(true);
    var i = 0;
    time = setInterval(function () {
        fn(false);
    }, options.interval);
}
export function onAutoScrollStop() {
    if (time) {
        clearInterval(time);
        time = null;
    }
}

export function onceAutoScroll(options: {
    el: HTMLElement,
    point?: Point,
    feelDis?: number,
    feelScrollX?: boolean,
    dis?: number,
    callback?(scrollDisY: number, scrollDisX?: number): void
}) {
    if (typeof options.point == 'undefined')
        options.point = Rect.fromEle(options.el).leftMiddle;
    if (typeof options.dis == 'undefined') options.dis = 30;
    if (typeof options.feelDis == 'undefined') options.feelDis = 150;
    var sx: number = 0;
    var sy: number = 0;
    var dis = options.dis;
    var feelDis = options.feelDis;
    var scrollDiv: HTMLElement = dom(options.el).closest(x => { return dom(x as HTMLElement).style('overflowY') == 'auto' }) as any;
    if (!scrollDiv) { if (options.callback) options.callback(sx); return }
    var sb = Rect.fromEle(scrollDiv);
    var minBottom = sb.top + sb.height - options.point.y;
    if (scrollDiv && minBottom < feelDis) {
        var top = scrollDiv.scrollTop;
        if (minBottom < 0) dis += 0 - minBottom;
        var dr = top + dis > scrollDiv.scrollHeight - scrollDiv.clientHeight ? scrollDiv.scrollHeight - scrollDiv.clientHeight - top : dis
        scrollDiv.scrollTop = top + dr;
        sy += dr;
    }
    var minTop = options.point.y - sb.top;
    if (scrollDiv && minTop < feelDis) {
        var top = scrollDiv.scrollTop;
        if (minTop < 0) dis += 0 - minTop;
        var dr = top - dis > 0 ? dis : top;
        scrollDiv.scrollTop = top - dr;
        sy += 0 - dr;
    }
    if (options.feelScrollX) {
        var minRight = sb.left + sb.width - options.point.x;
        if (scrollDiv && minRight < feelDis) {
            var left = scrollDiv.scrollLeft;
            if (minRight < 0) dis += 0 - minRight;
            var dr = left + dis > scrollDiv.scrollWidth - scrollDiv.clientWidth ? scrollDiv.scrollWidth - scrollDiv.clientWidth - left : dis
            scrollDiv.scrollLeft = left + dr;
            sx += dr;
        }
        var minLeft = options.point.x - sb.left;
        if (scrollDiv && minLeft < feelDis) {
            var left = scrollDiv.scrollLeft;
            if (minLeft < 0) dis += 0 - minLeft;
            var dr = left - dis > 0 ? dis : left;
            scrollDiv.scrollLeft = left - dr;
            sx += 0 - dr;
        }
    }
    if (options.callback) options.callback(sy, sx);
}