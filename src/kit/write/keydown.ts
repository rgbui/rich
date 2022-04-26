import { PageWrite } from ".";
import { AppearAnchor } from "../../block/appear";
import { AppearVisibleCursorPoint } from "../../block/appear/visible.seek";
import { KeyboardCode } from "../../common/keys";
import { onceAutoScroll } from "../../common/scroll";
import { TextEle } from "../../common/text.ele";



/***
 * 这里主要是判断当前的keydown事件是否还需要触发，继续执行输入
 */
export function predictKeydown(write: PageWrite, aa: AppearAnchor, event: React.KeyboardEvent) {
    return true;
}


/**
 * 
 * 水平移动光标：需要判断当前光标是否处于AppearAnchor的最前边或最后边,
 * 注意AppearAnchor里面不一定会是纯文本
 * 如果移到相邻的两个AppearAnchor时，需要考虑是否从视觉上是紧挨着（和在两个相邻的文字之间编辑是一样的）
 * 
 * 垂直移动：如果在当前的AppearAnchor内还行，如果跨AppearAnchor就非常的不靠谱
 * 这里需要从视觉的角度去计算光标该移到何处
 * 1. 怎样判断往上或往下移，仍然处于当前的AppearAnchor内，这里计算当前光标所在的位置（有一定的误差，但上下移动，可以没那么准确）
 * 2. 如果不在同一个AppearAnchor内，那么需要计算合适的上下位置
 * 
 * 对于board块，则需要考虑缩小的问题，如果board块缩小或放大了，怎么上下移动（貌似卡片块会有影响，但卡片内部的matrix是稳定的）
 * 
 */

export function MoveCursor(write: PageWrite, aa: AppearAnchor, event: React.KeyboardEvent) {
    var sel = window.getSelection();
    if (event.key == KeyboardCode.ArrowLeft) {
        onceAutoScroll({ el: aa.el, feelDis: 60, dis: 120 })
        if (aa.isStart(sel.focusNode, sel.focusOffset)) {
            //这里找到当前aa前面的AppearAnchor，然后光标移到尾部，这里需要判断相邻的两个元素之间是否紧挨着
            var prevAA = aa.visibleTextPrev();
            if (prevAA) {
                event.preventDefault();
                write.onFocusAppearAnchor(prevAA, { last: true })
            }
            else {
                //这说明光标处于当前文档的头部
            }
            return;
        }
    }
    else if (event.key == KeyboardCode.ArrowRight) {
        onceAutoScroll({ el: aa.el, feelDis: 60, dis: 120 })
        if (aa.isEnd(sel.focusNode, sel.focusOffset)) {
            var nextAA = aa.visibleTextNext();
            if (nextAA) {
                event.preventDefault();
                write.onFocusAppearAnchor(nextAA)
            } else {
                //说明光标处于文档的尾部
            }
            return;
        }
    }
    else if (event.key == KeyboardCode.ArrowDown) {
        var rect = AppearVisibleCursorPoint(aa);
        onceAutoScroll({ el: aa.el, point: rect.leftMiddle, feelDis: 60, dis: 120 })
        var rects = TextEle.getBounds(aa.el);
        var lineHeight = TextEle.getLineHeight(aa.el);
        if (Math.abs(rect.bottom - rects.last().bottom) < lineHeight) {
            /**
             * 说明向下移动
             */
            var nextAA = aa.visibleDown();
            if (nextAA) {
                event.preventDefault();
                write.onFocusAppearAnchor(nextAA, { left: rect.left })
            }
        }
    }
    else if (event.key == KeyboardCode.ArrowUp) {
        var rect = AppearVisibleCursorPoint(aa);
        onceAutoScroll({ el: aa.el, point: rect.leftMiddle, feelDis: 60, dis: 120 });
        var rects = TextEle.getBounds(aa.el);
        var lineHeight = TextEle.getLineHeight(aa.el);
        if (Math.abs(rect.top - rects.first().top) < lineHeight) {
            /**
             * 说明向下移动
             */
            var upAA = aa.visibleUp();
            if (upAA) {
                event.preventDefault();
                write.onFocusAppearAnchor(upAA, { left: rect.left, last: true })
            }
        }
    }
}