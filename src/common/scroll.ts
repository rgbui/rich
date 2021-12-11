import { dom } from "./dom";
import { Point } from "./point";

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
    if (typeof options.dis == 'undefined') options.dis = 30;
    if (typeof options.feelDis == 'undefined') options.feelDis = 150;
    var fn = (fir: boolean) => {
        if (fir == true) { return options.callback ? options?.callback(fir, 0) : undefined; }
        var sr: number = 0;
        var dis = 30;
        var feelDis = 150;
        var minBottom = Math.abs(options.point.y - window.innerHeight);
        var scrollDiv: HTMLElement = dom(options.el).closest(x => { return dom(x as HTMLElement).style('overflowY') == 'auto' }) as any;
        if (scrollDiv && minBottom < feelDis) {
            var top = scrollDiv.scrollTop;
            var dr = top + dis > scrollDiv.scrollHeight - scrollDiv.clientHeight ? scrollDiv.scrollHeight - scrollDiv.clientHeight - top : dis
            scrollDiv.scrollTop = top + dr;
            sr += dr;
        }
        var minTop = Math.abs(options.point.y - scrollDiv.getBoundingClientRect().top);
        if (scrollDiv && minTop < feelDis) {
            var top = scrollDiv.scrollTop;
            var dr = top - dis > 0 ? dis : top;
            scrollDiv.scrollTop = top - dr;
            sr += 0 - dr;
        }
        if (options.callback) options.callback(fir, sr);
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
