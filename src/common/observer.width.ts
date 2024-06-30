

var mapObs: Map<HTMLElement, { width?: number, observer: ResizeObserver }> = new Map();
/**
 * 这里主要是监听元素的宽度变化
 * 其它的变化暂时先不管
 */
export class ObserverWidth {
    static width(el: HTMLElement, callback: () => void) {
        var resizeObserver = new ResizeObserver(entries => {
            var ef: ResizeObserverEntry
            if (ef = entries.find(s => s.target == el)) {
                var rb = mapObs.get(el);
                if (rb.width == ef.contentRect.width) return;
                rb.width = ef.contentRect.width;
                callback()
            }
        });
        resizeObserver.observe(el);
        mapObs.set(el, { observer: resizeObserver });
    }
    static cancel(el: HTMLElement) {
        var resizeObserver = mapObs.get(el);
        if (resizeObserver) {
            resizeObserver.observer.disconnect();
            mapObs.delete(el);
        }
    }
}