import React from "react";
import { PageWrite } from ".";
import { isBlockedTextTool } from "../../../extensions/text.tool";
import { Block } from "../../block";
import { AppearAnchor } from "../../block/appear";
import { BlockUrlConstant } from "../../block/constant";
import { BlockRenderRange } from "../../block/enum";
import { KeyboardCode } from "../../common/keys";
import { onceAutoScroll } from "../../common/scroll";
import { TextEle } from "../../common/text.ele";
import { Rect } from "../../common/vector/point";
import { InputForceStore } from "./store";

/***
 * 这里主要是判断当前的keydown事件是否还需要触发，继续执行输入
 */
export function predictKeydown(write: PageWrite, aa: AppearAnchor, event: React.KeyboardEvent) {
    if (write.inputPop) {
        var r = write.inputPop.selector.onKeydown(event.nativeEvent);
        if (r == true) return false;
        /**
         * 这里不光阻止，还触发了事件
         */
        else if (typeof r != 'boolean' && r?.blockData) {
            write.onInputPopCreateBlock(r?.blockData);
            return false;
        }
    }
    if (isBlockedTextTool()) return false;
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
            var prevAA = aa.visibleLeft();
            if (prevAA) {
                event.preventDefault();
                write.onFocusAppearAnchor(prevAA, { last: prevAA.isBeforeNear(aa) ? -1 : true })
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
            var downAA = aa.visibleRight();
            if (downAA) {
                event.preventDefault();
                write.onFocusAppearAnchor(downAA, { at: downAA.isAfterNear(aa) ? 1 : 0 })
            } else {
                //说明光标处于文档的尾部
            }
            return;
        }
    }
    else if (event.key == KeyboardCode.ArrowDown) {
        var range = sel.getRangeAt(0);
        var rect = aa.textContent == '' || aa.isSolid ? Rect.fromEle(aa.el) : Rect.fromEle(range);
        onceAutoScroll({ el: aa.el, point: rect.leftMiddle, feelDis: 60, dis: 120 })
        range = sel.getRangeAt(0);
        rect = aa.textContent == '' || aa.isSolid ? Rect.fromEle(aa.el) : Rect.fromEle(range);
        var rects = TextEle.getBounds(aa.el);
        var lineHeight = TextEle.getLineHeight(aa.el);
        if (Math.abs(rect.bottom - rects.last().bottom) < lineHeight) {
            /**
             * 说明向下移动
             */
            var downAA = aa.visibleDown(rect.leftMiddle.x);
            if (downAA) {
                event.preventDefault();
                onceAutoScroll({ el: downAA.el, feelDis: 60, dis: 120 })
                write.onFocusAppearAnchor(downAA, { left: rect.left, y: rects.last().bottom + lineHeight / 2 })
            }
        }
    }
    else if (event.key == KeyboardCode.ArrowUp) {
        var range = sel.getRangeAt(0);
        var rect = aa.textContent == '' || aa.isSolid ? Rect.fromEle(aa.el) : Rect.fromEle(range);
        onceAutoScroll({ el: aa.el, point: rect.leftMiddle, feelDis: 60, dis: 120 });
        range = sel.getRangeAt(0);
        rect = aa.textContent == '' || aa.isSolid ? Rect.fromEle(aa.el) : Rect.fromEle(range);
        var rects = TextEle.getBounds(aa.el);
        var lineHeight = TextEle.getLineHeight(aa.el);
        if (Math.abs(rect.top - rects.first().top) < lineHeight) {
            /**
             * 说明向上移动
             */
            var upAA = aa.visibleUp(rect.leftMiddle.x);
            if (upAA) {
                event.preventDefault();
                onceAutoScroll({ el: upAA.el, feelDis: 60, dis: 120 })
                write.onFocusAppearAnchor(upAA, { left: rect.left, last: true, y: rects.first().top + lineHeight / 2 })
            }
        }
    }
}

export async function onEnterInput(write: PageWrite, aa: AppearAnchor, event: React.KeyboardEvent) {
    var sel = window.getSelection();
    var offset = aa.getCursorOffset(sel.focusNode, sel.focusOffset);
    var page = write.kit.page;
    event.preventDefault();
    await InputForceStore(aa, async () => {
        var block = aa.block;
        var rowBlock = block.closest(x => !x.isLine);
        var gs = block.isLine ? block.nexts : [];
        var rest, text;
        if (aa.isText) {
            rest = aa.textContent.slice(0, offset);
            text = aa.textContent.slice(offset);
        }
        var childs = text ? [{ url: BlockUrlConstant.Text, content: text }] : [];
        if (aa.isText) {
            if (rest || !block.isLine) block.updateAppear(aa, rest, BlockRenderRange.self);
            else await block.delete();
        }
        var newBlock: Block;
        if (rowBlock.isListBlock && rowBlock.asListBlock.isExpand && rowBlock.getChilds(rowBlock.childKey).length > 0) {
            var fb = rowBlock.getChilds(rowBlock.childKey).first();
            var url = fb.isContinuouslyCreated ? fb.url : BlockUrlConstant.TextSpan;
            var continuouslyProps = fb.continuouslyProps;
            newBlock = await page.createBlock(url, { ...continuouslyProps, blocks: { childs } }, fb.parent, 0, fb.parent.childKey)
        }
        else {
            var url = rowBlock.isContinuouslyCreated ? rowBlock.url : BlockUrlConstant.TextSpan;
            var continuouslyProps = rowBlock.continuouslyProps;
            newBlock = await rowBlock.visibleDownCreateBlock(url, { ...continuouslyProps, blocks: { childs } });
        }
        if (gs.length > 0) {
            for (let i = 0; i < gs.length; i++) {
                await newBlock.append(gs[i]);
            }
        }
        page.addUpdateEvent(async () => {
            write.onFocusBlockAnchor(newBlock);
        })
    });
}
export async function onKeyTab(write: PageWrite, aa: AppearAnchor, event: React.KeyboardEvent) {
    event.preventDefault();
    var sel = window.getSelection();
    var offset = aa.getCursorOffset(sel.focusNode, sel.focusOffset);
    var bl = aa.block;
    var prop = aa.prop;
    var page = write.kit.page;
    var list = bl.closest(x => x.url == BlockUrlConstant.List);
    var isBack = page.keyboardPlate.isShift()
    if (isBack) {
        if (!list.parent?.isListBlock) return false
    }
    else {
        var prev = list.prev;
        if (!list.prev?.isListBlock) return false;
    }
    await InputForceStore(aa, async () => {
        if (isBack) {
            var pa = list.parent;
            var at = list.at;
            var rest = pa.blocks[pa.childKey].findAll((item, i) => i > at);
            await list.appendArray(rest, undefined, list.childKey);
            await list.insertAfter(pa);
        }
        else {
            var prev = list.prev;
            if (prev.isListBlock && prev.asListBlock.expand == false) {
                prev.updateProps({ expand: true });
            }
            await prev.append(list, undefined, prev.childKey);
        }
        page.addUpdateEvent(async () => {
            var newAA = bl.appearAnchors.find(g => g.prop == prop);
            if (newAA)
                write.onFocusAppearAnchor(newAA, { at: offset });
        })
        page.kit.handle.onCloseBlockHandle();
    });
}