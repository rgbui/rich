import React, { ReactNode } from "react";
import { dom } from "../../../src/common/dom";
import { MouseDragger } from "../../../src/common/dragger";
import { ghostView } from "../../../src/common/ghost";
import { Point, Rect } from "../../../src/common/vector/point";
export class DragList extends React.Component<{
    children?: ReactNode,
    isDragBar?: (ele: HTMLElement) => boolean,
    onChange?: (to: number, from?: number) => void,
    className?: string | string[]
}>{
    el: HTMLElement;
    render() {
        var self = this;
        function mousedown(event: React.MouseEvent) {
            var ele = event.target as HTMLElement;
            if (self.props.isDragBar && self.props.isDragBar(ele) && self.el) {
                var item = dom(ele).closest(x => x.parentElement == self.el) as HTMLElement;
                if (item) {
                    var cs = Array.from(self.el.children);
                    var oldAt = cs.findIndex(c => c === item);
                    MouseDragger({
                        event,
                        moveStart(ev) {
                            ghostView.load(item, { point: Point.from(ev) });
                            item.style.visibility = 'hidden';
                        },
                        moving(ev, da, isEnd) {
                            var newTarget = ev.target as HTMLElement;
                            var newItem = dom(newTarget).closest(x => x.parentElement === self.el) as HTMLElement;
                            if (newItem) {
                                if (newItem !== item) {
                                    var rect = Rect.fromEle(newItem);
                                    if (ev.clientY > rect.middle) {
                                        self.el.insertBefore(item, newItem);
                                    }
                                    else {
                                        self.el.insertBefore(newItem, item);
                                    }
                                }
                            }
                            if (isEnd) {
                                ghostView.unload();
                                cs = Array.from(self.el.children);
                                var at = cs.findIndex(c => c === item);
                                if (self.props.onChange)
                                    self.props.onChange(at, oldAt);
                                item.style.visibility = 'visible';
                            }
                            else ghostView.move(Point.from(ev))
                        }
                    })
                }
            }
        }
        var classList: string[] = ['shy-list-drag'];
        if (this.props.className) {
            if (Array.isArray(this.props.className)) classList.push(...this.props.className)
            else classList.push(this.props.className)
        }
        return <div className={classList.join(' ')} ref={e => this.el = e} onMouseDown={e => mousedown(e)}>
            {this.props.children}
        </div>
    }
}