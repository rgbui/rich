import React from "react";
import { PageWrite } from ".";
import { isBlockedTextTool } from "../../../extensions/text.tool";
import { Block } from "../../block";
import { AppearAnchor } from "../../block/appear";
import { BlockChildKey, BlockUrlConstant } from "../../block/constant";
import { BlockRenderRange } from "../../block/enum";
import { KeyboardCode } from "../../common/keys";
import { onceAutoScroll } from "../../common/scroll";
import { TextEle } from "../../common/text.ele";
import { Rect } from "../../common/vector/point";
import { InputForceStore } from "./store";
import { ListType, ListTypeView } from "../../../blocks/present/list/list";
import lodash from "lodash";
import { util } from "../../../util/util";

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
        if (aa.isSolid) {
            if (aa.isSolidPos(sel.focusNode, 1)) {
                event.preventDefault();
                write.kit.anchorCursor.onFocusAppearAnchor(aa, { render: true, scroll: true, at: 0 })
            }
            else {
                var prevAA = aa.visibleLeft();
                if (prevAA) {
                    /**
                     * 判断是否为同一行
                     */
                    var isRow = aa.block.closest(g => g.isContentBlock) === prevAA.block.closest(g => g.isContentBlock);
                    event.preventDefault();
                    write.kit.anchorCursor.onFocusAppearAnchor(prevAA, {
                        render: true,
                        scroll: true,
                        last: isRow ? -1 : true
                    })
                }
            }
        }
        else {
            if (aa.isStart(sel.focusNode, sel.focusOffset)) {
                var prevAA = aa.visibleLeft();
                if (prevAA) {
                    event.preventDefault();
                    var isRow = aa.block.closest(g => g.isContentBlock) === prevAA.block.closest(g => g.isContentBlock);
                    write.kit.anchorCursor.onFocusAppearAnchor(prevAA, {
                        render: true,
                        scroll: true,
                        last: isRow ? -1 : true
                    })
                }
            }
        }
    }
    else if (event.key == KeyboardCode.ArrowRight) {
        if (aa.isSolid) {
            if (aa.isSolidPos(sel.focusNode, 0)) {
                event.preventDefault();
                write.kit.anchorCursor.onFocusAppearAnchor(aa, { render: true, scroll: true, last: true })
                return;
            }
            else {
                var nextAA = aa.visibleRight();
                if (nextAA) {
                    event.preventDefault();
                    var isRow = aa.block.closest(g => g.isContentBlock) === nextAA.block.closest(g => g.isContentBlock);
                    write.kit.anchorCursor.onFocusAppearAnchor(nextAA, {
                        render: true,
                        scroll: true,
                        at: isRow ? 1 : 0
                    })
                }
            }
        }
        else if (aa.isEnd(sel.focusNode, sel.focusOffset)) {
            var nextAA = aa.visibleRight();
            if (nextAA) {
                event.preventDefault();
                var isRow = aa.block.closest(g => g.isContentBlock) === nextAA.block.closest(g => g.isContentBlock);
                write.kit.anchorCursor.onFocusAppearAnchor(nextAA, {
                    render: true,
                    scroll: true,
                    at: isRow ? 1 : 0
                })
            }
        }
    }
    else if (event.key == KeyboardCode.ArrowDown) {
        var range = util.getSafeSelRange(sel);
        var rect = aa.textContent == '' || aa.isSolid ? Rect.fromEle(aa.el) : Rect.fromEle(range);
        range = util.getSafeSelRange(sel);
        rect = aa.textContent == '' || aa.isSolid ? Rect.fromEle(aa.el) : Rect.fromEle(range);
        var rects = TextEle.getBounds(aa.el);
        var lineHeight = TextEle.getLineHeight(aa.el);
        if (Math.abs(rect.bottom - rects.last().bottom) < lineHeight) {
            /**
             * 说明向下移动
             */
            var nextAA = aa.visibleDown(rect.leftMiddle.x);
            if (nextAA) {
                event.preventDefault();
                write.kit.anchorCursor.onFocusAppearAnchor(nextAA, { render: true, scroll: true, left: rect.left, y: rects.last().bottom + lineHeight / 2 })
            }
        }
    }
    else if (event.key == KeyboardCode.ArrowUp) {
        var range = util.getSafeSelRange(sel);
        var rect = aa.textContent == '' || aa.isSolid ? Rect.fromEle(aa.el) : Rect.fromEle(range);
        range = util.getSafeSelRange(sel);
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
                write.kit.anchorCursor.onFocusAppearAnchor(upAA, { render: true, scroll: true, left: rect.left, last: true, y: rects.first().top + lineHeight / 2 })
            }
        }
    }
}

export async function MoveSelectBlocks(write: PageWrite, blocks: Block[], event: KeyboardEvent, options: {
    shift?: boolean,
    ctrl?: boolean
}) {

    if (options.ctrl) {
        event.preventDefault();
        //上下移动，交换位置
        await write.kit.page.onInterchange(blocks, event.key == KeyboardCode.ArrowUp ? 'up' : 'down')
    }
    else if (options.shift) {
        var first = blocks.first();
        var last = blocks.last();
        if (first !== last) {
            if (first.el && last.el && first.getVisibleBound().top > last.getVisibleBound().top) {
                [first, last] = [last, first]
            }
        }
        //上下移动，扩展选择
        if (event.key == KeyboardCode.ArrowUp) {
            var block = first;
            var pre = block.prevFind(x => x.isContentBlock);
            if (pre) {
                event.preventDefault();
                var br = pre?.closest(x => x.isContentBlock)?.frameBlock;
                if (!br) onceAutoScroll({ el: pre.el, feelDis: 60, dis: 120 })
                var ns = [pre, ...write.kit.anchorCursor.currentSelectHandleBlocks];
                ns = write.kit.page.getAtomBlocks(ns);
                await write.kit.anchorCursor.onSelectBlocks(ns, { render: true, scroll: "top" })
            }
        }
        else {
            var block = last;
            var next = block.nextFind(x => x.isContentBlock);
            if (next) {
                event.preventDefault();
                var br = next?.closest(x => x.isContentBlock)?.frameBlock;
                if (!br) onceAutoScroll({ el: next.el, feelDis: 60, dis: 120 })
                var ns = [...write.kit.anchorCursor.currentSelectHandleBlocks, next];
                ns = write.kit.page.getAtomBlocks(ns);
                await write.kit.anchorCursor.onSelectBlocks(ns, { render: true, scroll: 'bottom' })
            }
        }
    }
    else {
        var first = blocks.first();
        var last = blocks.last();
        if (first !== last) {
            if (first.el && last.el && first.getVisibleBound().top > last.getVisibleBound().top) {
                [first, last] = [last, first]
            }
        }
        event.preventDefault();
        if (event.key == KeyboardCode.ArrowUp) {
            var block = first;
            var pre = block.prevFind(x => x.isContentBlock);
            if (pre) {
                var br = pre?.closest(x => x.isContentBlock)?.frameBlock;
                if (!br) onceAutoScroll({ el: pre.el, feelDis: 60, dis: 120 })
                await write.kit.anchorCursor.onSelectBlocks([pre], { render: true, scroll: "top" })
            }
        }
        else if (event.key == KeyboardCode.ArrowDown) {
            var block = last;
            var next = block.hasSubChilds && block.subChilds.first() ? block.subChilds.first() : block.nextFind(x => x.isContentBlock);
            if (next) {

                var br = next?.closest(x => x.isContentBlock)?.frameBlock;
                if (!br) onceAutoScroll({ el: next.el, feelDis: 60, dis: 120 })
                await write.kit.anchorCursor.onSelectBlocks([next], { render: true, scroll: "bottom" })
            }
        }
    }

}

/**
 * 回车输入换行
 * @param write 
 * @param aa 
 * @param event 
 */
export async function onEnterInput(write: PageWrite, aa: AppearAnchor, event: React.KeyboardEvent, options?: { insertBlocks: any[] }) {
    var sel = window.getSelection();
    var offset = aa.getCursorOffset(sel.focusNode, sel.focusOffset);
    var page = write.kit.page;
    if (event) event.preventDefault();
    await InputForceStore(aa, async () => {
        var block = aa.block;
        var rowBlock = block.closest(x => x.isContentBlock);
        var gs = block.isLine ? block.nexts : [];
        var rest: string, text: string;
        if (aa.isText) {
            rest = aa.textContent.slice(0, offset);
            text = aa.textContent.slice(offset);
            text = text.trimLeft();
        }
        else if (aa.isSolid && offset == 0) {
            gs.push(block);
        }
        var childs = text ? [{ url: BlockUrlConstant.Text, content: text }] : [];
        if (aa.isText) {
            if (rest || !block.isLine) await block.updateAppear(aa, rest, BlockRenderRange.self);
            else await block.delete();
        }
        var newBlock: Block;
        if (rowBlock.hasSubChilds && rowBlock.subChilds.length > 0 && !(rowBlock.url == BlockUrlConstant.List && !(rowBlock as any).isExpand)) {
            var ch = rowBlock.subChilds[0];
            var url = ch.isContinuouslyCreated ? ch.url : BlockUrlConstant.TextSpan;
            var continuouslyProps = ch.continuouslyProps;
            newBlock = await page.createBlock(url, { ...continuouslyProps, blocks: { childs } }, ch.parent, 0, ch.parent.hasSubChilds ? BlockChildKey.subChilds : BlockChildKey.childs)
        }
        else {
            var url = rowBlock.isContinuouslyCreated ? rowBlock.url : BlockUrlConstant.TextSpan;
            var continuouslyProps = rowBlock.continuouslyProps;
            newBlock = await rowBlock.visibleDownCreateBlock(url, { ...continuouslyProps, blocks: { childs } });
        }
        await newBlock.appendArray(gs, undefined, BlockChildKey.childs);
        var rs: Block[];
        if (Array.isArray(options?.insertBlocks) && options.insertBlocks.length > 0) {
            if (newBlock.isContentEmpty) {
                rs = await newBlock.replaceDatas(options.insertBlocks)
            }
            else
                rs = await newBlock.parent.appendArrayBlockData(options.insertBlocks, newBlock.at + 1, newBlock.parentKey);
            if (rowBlock.isContentEmpty) await rowBlock.delete()
        }
        page.addActionAfterEvent(async () => {
            if (rs && rs.length > 0)
                write.kit.anchorCursor.onSelectBlocks(rs, { render: true, merge: true })
            else write.kit.anchorCursor.onFocusBlockAnchor(newBlock, { render: true, merge: true });
        })
    });
}
/**
 * 回车输入换行符
 * 如果是浏览器默认的回车换行符，那么浏览器会产生<br/>，<div>等乱七八糟的东西
 * @param write 
 * @param aa 
 * @param event 
 */
export async function onEnterInsertNewLine(write: PageWrite, aa: AppearAnchor, event: React.KeyboardEvent, cb?: () => void) {
    event.preventDefault();
    var sel = window.getSelection();
    var offset = aa.getCursorOffset(sel.focusNode, sel.focusOffset);
    // console.log(offset, sel.focusOffset);
    var tc = aa.textContent;
    aa.setContent(tc.slice(0, offset) + '\n' + tc.slice(offset));
    // console.log(aa.el);
    var page = write.kit.page;
    await InputForceStore(aa, async () => {
        page.addActionAfterEvent(async () => {
            write.kit.anchorCursor.onFocusAppearAnchor(aa, { merge: true, scroll: true, render: true, at: offset + 1 })
            if (typeof cb == 'function') cb()
        })
    })
}

export async function onKeyTab(write: PageWrite, aa: AppearAnchor, event: React.KeyboardEvent) {
    var sel = window.getSelection();
    var offset = aa.getCursorOffset(sel.focusNode, sel.focusOffset);
    var block = aa.block;
    var prop = aa.prop;
    var page = write.kit.page;
    var rowBlock = block.closest(x => x.isBlock);
    var isBack = page.keyboardPlate.isShift()
    var hs = (b: Block) => {
        if (!b) return false;
        if (b.hasSubChilds) return true;
        else {
            if ([BlockUrlConstant.TextSpan,
            BlockUrlConstant.Callout,
            BlockUrlConstant.Quote
            ].includes(b.url as any)) return true;
        }
        return false;
    }
    if (page.keyboardPlate.isShift()) {
        if (!hs(rowBlock?.parent)) {
            return false;
        }
    }
    else {
        if (!hs(rowBlock.prev)) {

            return false;
        }
    }
    event.preventDefault();
    await InputForceStore(aa, async () => {
        if (isBack) {
            var pa = rowBlock.parent;
            var at = rowBlock.at;
            var rest = pa.subChilds.findAll((item, i) => i > at);
            if (hs(rowBlock)) {
                await rowBlock.appendArray(rest, undefined, 'subChilds');
                await rowBlock.insertAfter(pa);
                if (pa.url == BlockUrlConstant.List && rowBlock.url == BlockUrlConstant.List) {
                    await rowBlock.updateProps({
                        listType: (pa as any).listType,
                        listView: (pa as any).listView
                    }, BlockRenderRange.self);
                }
            }
            else {
                await pa.parent.appendArray([rowBlock, ...rest], pa.at + 1, hs(pa.parent) ? 'subChilds' : 'childs')
            }
        }
        else {
            var prev = rowBlock.prev;
            if (prev) {
                if (prev.url == BlockUrlConstant.List && (prev as any).expand == false) {
                    await prev.updateProps({ expand: true }, BlockRenderRange.self);
                }
                if (prev.url == BlockUrlConstant.List && rowBlock.url == BlockUrlConstant.List) {
                    if ((prev as any).listType == (rowBlock as any).listType) {
                        if ((prev as any).listView == (rowBlock as any).listView) {
                            var rs: ListTypeView[] = [];
                            if ((prev as any).listType == ListType.circle) {
                                rs = [
                                    ListTypeView.none,
                                    ListTypeView.circleEmpty,
                                    ListTypeView.rhombus,//菱形
                                    ListTypeView.solidRhombus,//实心菱形,rhombus = 2,//菱形
                                ];
                            }
                            else if ((prev as any).listType == ListType.number) {
                                rs = [
                                    ListTypeView.none,
                                    ListTypeView.alphabet,//字母
                                    ListTypeView.roman,//罗马hombus = 2,//菱形
                                    ListTypeView.capitalLetter,//大写字母
                                ];
                            }
                            lodash.remove(rs, g => g == (prev as any).listView);
                            if (prev?.parent && prev?.parent.url == BlockUrlConstant.List) {
                                var pr = prev.parent;
                                if ((pr as any).listType == (rowBlock as any).listType) {
                                    lodash.remove(rs, g => g == (pr as any).listView);
                                }
                            }
                            if (prev?.parent?.parent && prev?.parent?.parent.url == BlockUrlConstant.List) {
                                var pr = prev?.parent?.parent;
                                if ((pr as any).listType == (rowBlock as any).listType) {
                                    lodash.remove(rs, g => g == (pr as any).listView);
                                }
                            }
                            if (rs.length > 0)
                                await rowBlock.updateProps({
                                    listView: rs[0]
                                }, BlockRenderRange.self)
                        }
                    }
                }
                await prev.append(rowBlock, undefined, 'subChilds');
            }
        }
        page.addActionAfterEvent(async () => {
            var newAA = block.appearAnchors.find(g => g.prop == prop);
            if (newAA)
                write.kit.anchorCursor.onFocusAppearAnchor(newAA, { merge: true, at: offset });
        })
        page.kit.handle.onCloseBlockHandle();
    });
}