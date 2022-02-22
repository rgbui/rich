import React from "react";
import { MouseDragger } from "../../src/common/dragger";
import { ghostView } from "../../src/common/ghost";
import { Point, Rect } from "../../src/common/vector/point";
export class ListDrag extends React.Component<{
    list: any[],
    renderItem(item: any): JSX.Element,
    isDragBar: (ele: HTMLElement) => boolean,
    move(start: any, toItem: any, pos: 'top' | 'bottom')
}>{
    private hoverItem: { el: HTMLElement, item: any };
    render() {
        var self = this;
        function mousedown(event: React.MouseEvent, item: any) {
            var el = (event.target as HTMLElement).closest('.shy-list-drag-item') as HTMLElement;
            if (self.props.isDragBar(event.target as HTMLElement)) {
                MouseDragger({
                    event,
                    moveStart(ev) {
                        ghostView.load(el,{ point: Point.from(ev) });
                        el.style.display = 'none';
                    },
                    moving(ev, da, isEnd) {
                        ghostView.move(Point.from(ev));
                        if (self.hoverItem) {
                            var bound = Rect.fromEle(self.hoverItem.el);
                            if (bound.conatin(Point.from(ev))) {
                                if (ev.y > bound.middleCenter.y) {
                                    self.hoverItem.el.classList.add('drag-over-top')
                                }
                                else {
                                    self.hoverItem.el.classList.add('drag-over-bottom')
                                }
                            }
                        }
                        if (isEnd) {
                            ghostView.unload();
                            if (self.hoverItem) {
                                var pos: 'top' | 'bottom' = 'top';
                                if (self.hoverItem.el.classList.contains('drag-over-top')) {
                                    pos = 'top';
                                }
                                else {
                                    pos = 'bottom';
                                }
                                self.hoverItem.el.classList.remove('drag-over-top', 'drag-over-bottom');
                                self.props.move(item, self.hoverItem.item, pos);
                            }
                            el.style.display = 'block';
                        }
                    }
                })
            }
        }
        return <div className="shy-list-drag">
            {this.props.list.map((item, i) => <div
                className="shy-list-drag-item"
                onMouseEnter={e => this.hoverItem = { el: (e.target as HTMLElement).closest('.shy-list-drag-item'), item: item }}
                onMouseLeave={e => { var el = (e.target as HTMLElement).closest('.shy-list-drag-item'); el.classList.remove('drag-over-top', 'drag-over-bottom'); this.hoverItem = null }}
                onMouseDown={e => mousedown(item, i)}
                key={i}>{this.props.renderItem(item)}</div>)}
        </div>
    }
}