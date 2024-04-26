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
    var br = aa.block.closest(x => !x.isLine)?.frameBlock;
    if (event.key == KeyboardCode.ArrowLeft) {
        if (!br)
            onceAutoScroll({ el: aa.el, feelDis: 60, dis: 120 })
        if (aa.isSolid && aa.isSolidPos(sel.focusNode, 1)) {
            event.preventDefault();
            write.kit.anchorCursor.onFocusAppearAnchor(aa, { render: true, at: 0 })
            return;
        }
        if (aa.isStart(sel.focusNode, sel.focusOffset)) {
            //这里找到当前aa前面的AppearAnchor，然后光标移到尾部，这里需要判断相邻的两个元素之间是否紧挨着
            var prevAA = aa.visibleLeft();
            if (prevAA) {
                event.preventDefault();
                write.kit.anchorCursor.onFocusAppearAnchor(prevAA, { render: true, last: prevAA.isBeforeNear(aa) ? -1 : true })
            }
            else {
                //这说明光标处于当前文档的头部
            }
            return;
        }
    }
    else if (event.key == KeyboardCode.ArrowRight) {
        if (!br)
            onceAutoScroll({ el: aa.el, feelDis: 60, dis: 120 })
        if (aa.isSolid && aa.isSolidPos(sel.focusNode, 0)) {
            event.preventDefault();
            write.kit.anchorCursor.onFocusAppearAnchor(aa, { render: true, last: true })
            return;
        }
        if (aa.isEnd(sel.focusNode, sel.focusOffset)) {
            var downAA = aa.visibleRight();
            if (downAA) {
                event.preventDefault();
                write.kit.anchorCursor.onFocusAppearAnchor(downAA, { render: true, at: downAA.isAfterNear(aa) ? 1 : 0 })
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
                if (!br) onceAutoScroll({ el: downAA.el, feelDis: 60, dis: 120 })
                write.kit.anchorCursor.onFocusAppearAnchor(downAA, { render: true, left: rect.left, y: rects.last().bottom + lineHeight / 2 })
            }
        }
    }
    else if (event.key == KeyboardCode.ArrowUp) {
        var range = sel.getRangeAt(0);
        var rect = aa.textContent == '' || aa.isSolid ? Rect.fromEle(aa.el) : Rect.fromEle(range);
        if (!br) onceAutoScroll({ el: aa.el, point: rect.leftMiddle, feelDis: 60, dis: 120 });
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
                if (!br) onceAutoScroll({ el: upAA.el, feelDis: 60, dis: 120 })
                write.kit.anchorCursor.onFocusAppearAnchor(upAA, { render: true, left: rect.left, last: true, y: rects.first().top + lineHeight / 2 })
            }
        }
    }
}

export function MoveSelectBlocks(write: PageWrite, blocks: Block[], event: KeyboardEvent) {
    if (event.key == KeyboardCode.ArrowUp) {
        var block = blocks.last();
        var pre = block.prevFind(x => !x.isLine && !x.isLayout && !x.isCell);
        if (pre) {
            event.preventDefault();
            var br = pre?.closest(x => !x.isLine)?.frameBlock;
            if (!br) onceAutoScroll({ el: pre.el, feelDis: 60, dis: 120 })
            write.kit.anchorCursor.onSelectBlocks([pre], { render: true })
        }
    }
    else if (event.key == KeyboardCode.ArrowDown) {
        var block = blocks.first();
        var next = block.nextFind(x => !x.isLine && !x.isLayout && !x.isCell);
        if (next) {
            event.preventDefault();
            var br = next?.closest(x => !x.isLine)?.frameBlock;
            if (!br) onceAutoScroll({ el: next.el, feelDis: 60, dis: 120 })
            write.kit.anchorCursor.onSelectBlocks([next], { render: true })
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
            if (rest || !block.isLine) block.updateAppear(aa, rest, BlockRenderRange.self);
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
        page.addUpdateEvent(async () => {
            write.kit.anchorCursor.onFocusBlockAnchor(newBlock, { render: true, merge: true });
        })
    });
}

export async function onKeyTab(write: PageWrite, aa: AppearAnchor, event: React.KeyboardEvent) {
    var sel = window.getSelection();
    var offset = aa.getCursorOffset(sel.focusNode, sel.focusOffset);
    var block = aa.block;
    var prop = aa.prop;
    var page = write.kit.page;
    var rowBlock = block.closest(x => x.isBlock);
    var isBack = page.keyboardPlate.isShift()
    if (page.keyboardPlate.isShift()) {
        if (!rowBlock?.parent.hasSubChilds) return false;
    }
    else {
        if (!rowBlock.prev?.hasSubChilds) return false;
    }
    event.preventDefault();
    await InputForceStore(aa, async () => {
        if (isBack) {
            var pa = rowBlock.parent;
            var at = rowBlock.at;
            var rest = pa.subChilds.findAll((item, i) => i > at);
            if (rowBlock.hasSubChilds) {
                await rowBlock.appendArray(rest, undefined, 'subChilds');
                await rowBlock.insertAfter(pa);
                if (pa.url == BlockUrlConstant.List && rowBlock.url == BlockUrlConstant.List) {
                    await rowBlock.updateProps({
                        listType: (pa as any).listType,
                        listView: (pa as any).listView
                    });
                }
            }
            else {
                pa.parent.appendArray([rowBlock, ...rest], pa.at + 1, pa.parent.hasSubChilds ? 'subChilds' : 'childs')
            }
        }
        else {
            var prev = rowBlock.prev;
            if (prev) {
                if (prev.url == BlockUrlConstant.List && (prev as any).expand == false) {
                    await prev.updateProps({ expand: true });
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
                                })
                        }
                    }
                }
                await prev.append(rowBlock, undefined, 'subChilds');
            }
        }
        page.addUpdateEvent(async () => {
            var newAA = block.appearAnchors.find(g => g.prop == prop);
            if (newAA)
                write.kit.anchorCursor.onFocusAppearAnchor(newAA, { merge: true, at: offset });
        })
        page.kit.handle.onCloseBlockHandle();
    });
}