import { Block } from "../../block";
import { findBlockAppear } from "../../block/appear/visible.seek";
import { elIsBefore } from "../../common/dom";
import { MouseDragger } from "../../common/dragger";
import { ghostView } from "../../common/ghost";
import { onAutoScroll, onAutoScrollStop } from "../../common/scroll";
import { Point } from "../../common/vector/point";

/**
 * 手动拖动行内块
 * 拖的时候，光标指定位置
 * @param block 
 * 
 */
export function DragBlockLine(block: Block, event: React.MouseEvent) {
    var sel = window.getSelection();
    MouseDragger({
        event,
        moveStart(ev, data) {
            onAutoScrollStop();
            ghostView.load(block.el, {
                background: '#fff',
                point: Point.from(ev)
            })
        },
        moving(ev, data, isEnd) {
            var el = ev.target as HTMLElement;
            var appear = findBlockAppear(el);
            if (appear) {
                var pos = getPos(ev);
                if (pos?.textNode) {
                    sel.collapse(pos.textNode, pos.offset)
                }
            }
            ghostView.move(Point.from(ev).move(10, 10));
            onAutoScroll({ el: block.page.root, feelDis: 100, dis: 30, interval: 50, point: Point.from(ev) })
        },
        async moveEnd(ev, isMove, data) {
            onAutoScrollStop();
            try {
                var el = ev.target as HTMLElement;
                var appear = findBlockAppear(el);
                if (appear) {
                    var pos = getPos(ev);
                    if (pos?.textNode) {
                        block.page.onAction('DragBlockLine', async () => {
                            if (appear.isSolid) {
                                var at = appear.block.at;
                                if (!elIsBefore(pos.textNode, appear.solidContentEl)) at += 1;
                                await first.parent.append(block, at, first.parentKey);
                            }
                            else {
                                var cs = await appear.split([pos.offset]);
                                var first = cs[0];
                                var at = first.at;
                                if (!(cs.length == 1 && pos.offset == 0)) at += 1;
                                await first.parent.append(block, at, first.parentKey);
                            }
                            block.page.addUpdateEvent(async () => {
                                block.page.kit.anchorCursor.onFocusBlockAnchor(block, { last: true })
                            })
                        })
                    }
                }
            }
            catch (ex) {

            }
            finally {

                //ghostView.unload();
            }
        }
    })
}

export function getPos(event: MouseEvent) {
    var range: any, textNode: Node, offset: number;

    if ((document.body as any).createTextRange) {           // Internet Explorer
        try {
            range = (document.body as any).createTextRange();
            range.moveToPoint(event.clientX, event.clientY);
            range.select();
            range = (window as any).getTextRangeBoundaryPosition(range, true);

            textNode = range.node;
            offset = range.offset;
        } catch (e) {
            return {};
        }
    }
    else if ((document as any).caretPositionFromPoint) {    // Firefox
        range = (document as any).caretPositionFromPoint(event.clientX, event.clientY);
        textNode = range.offsetNode;
        offset = range.offset;
    } else if ((document as any).caretRangeFromPoint) {     // Chrome
        range = (document as any).caretRangeFromPoint(event.clientX, event.clientY);
        textNode = range.startContainer;
        offset = range.startOffset;
    }
    return {
        range,
        textNode,
        offset
    }
}


function getWordAtPoint(elem, x, y) {
    if (elem.nodeType == elem.TEXT_NODE) {
        var range = elem.ownerDocument.createRange();
        range.selectNodeContents(elem);
        var currentPos = 0;
        var endPos = range.endOffset;
        while (currentPos + 1 < endPos) {
            range.setStart(elem, currentPos);
            range.setEnd(elem, currentPos + 1);
            if (range.getBoundingClientRect().left <= x && range.getBoundingClientRect().right >= x &&
                range.getBoundingClientRect().top <= y && range.getBoundingClientRect().bottom >= y) {
                range.expand("word");
                var ret = range.toString();
                range.detach();
                return (ret);
            }
            currentPos += 1;
        }
    } else {
        for (var i = 0; i < elem.childNodes.length; i++) {
            var range = elem.childNodes[i].ownerDocument.createRange();
            range.selectNodeContents(elem.childNodes[i]);
            if (range.getBoundingClientRect().left <= x && range.getBoundingClientRect().right >= x &&
                range.getBoundingClientRect().top <= y && range.getBoundingClientRect().bottom >= y) {
                range.detach();
                return (getWordAtPoint(elem.childNodes[i], x, y));
            } else {
                range.detach();
            }
        }
    }
    return (null);
} 