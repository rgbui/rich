import React, { ReactNode } from "react";
import { dom } from "../../src/common/dom";
import { MouseDragger } from "../../src/common/dragger";
import { Rect } from "../../src/common/vector/point";
export class ListDrag extends React.Component<{
    children?: ReactNode,
    isDragBar: (ele: HTMLElement) => boolean,
    onChange: (to: number, from?: number) => void
}>{
    el: HTMLElement;
    render() {
        var self = this;
        function mousedown(event: React.MouseEvent) {
            var ele = event.target as HTMLElement;
            if (self.props.isDragBar(ele) && self.el) {
                var item = dom(ele).closest(x => x.parentElement == self.el);
                if (item) {
                    var cs = Array.from(self.el.children);
                    var oldAt = cs.findIndex(c => c === item);
                    MouseDragger({
                        event,
                        moveStart(ev) {
                            // ghostView.load(item,{ point: Point.from(ev) });
                            // el.style.display = 'none';
                        },
                        moving(ev, da, isEnd) {
                            var newTarget = ev.target as HTMLElement;
                            var newItem = dom(newTarget).closest(x => x.parentElement === self.el) as HTMLElement;
                            if (newItem) {
                                if (newItem !== item) {
                                    var rect = Rect.fromEle(newItem);
                                    if (ev.clientY > rect.middle) {
                                        item.insertBefore(self.el, newItem);
                                    }
                                    else {
                                        newItem.insertBefore(self.el, item);
                                    }
                                }
                            }
                            if (isEnd) {
                                var at = cs.findIndex(c => c == item);
                                self.props.onChange(at, oldAt);
                            }
                        }
                    })
                }
            }
        }
        return <div className="shy-list-drag" ref={e => this.el = e} onMouseDown={e => mousedown(e)}>
            {this.props.children}
        </div>
    }
}