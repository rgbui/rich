import { dom } from "./dom";
import { Point, Rect } from "./point";

var time;
export function onAutoScroll(options: {
    el: HTMLElement,
    point: Point,
    interval?: number,
    feelDis?: number,
    dis?: number,
    callback?(first: boolean, scrollDis: number): void
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
            callback: (dis) => {
                if (options.callback)
                    options.callback(fir, dis);
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
    dis?: number,
    callback?(scrollDis: number): void
}) {
    if (typeof options.point == 'undefined')
        options.point = Rect.fromEle(options.el).leftMiddle;
    if (typeof options.dis == 'undefined') options.dis = 30;
    if (typeof options.feelDis == 'undefined') options.feelDis = 150;
    var sr: number = 0;
    var dis = options.dis;
    var feelDis = options.feelDis;
    var scrollDiv: HTMLElement = dom(options.el).closest(x => { return dom(x as HTMLElement).style('overflowY') == 'auto' }) as any;
    var sb = Rect.fromEle(scrollDiv);
    var minBottom = sb.top + sb.height - options.point.y;
    if (scrollDiv && minBottom < feelDis) {
        var top = scrollDiv.scrollTop;
        if (minBottom < 0) dis += 0 - minBottom;
        var dr = top + dis > scrollDiv.scrollHeight - scrollDiv.clientHeight ? scrollDiv.scrollHeight - scrollDiv.clientHeight - top : dis
        scrollDiv.scrollTop = top + dr;
        sr += dr;
    }
    var minTop = options.point.y - sb.top;
    if (scrollDiv && minTop < feelDis) {
        var top = scrollDiv.scrollTop;
        if (minTop < 0) dis += 0 - minTop;
        var dr = top - dis > 0 ? dis : top;
        scrollDiv.scrollTop = top - dr;
        sr += 0 - dr;
    }
    if (options.callback) options.callback(sr);
}