
import React from "react";
import { PageWrite } from ".";
import { useAtUserSelector } from "../../../extensions/at";
import { useBlockSelector } from "../../../extensions/block";
import { InputTextPopSelectorType } from "../../../extensions/common/input.pop";
import { InputDetector } from "../../../extensions/input.detector/detector";
import { DetectorOperator } from "../../../extensions/input.detector/rules";
import { usePageLinkSelector } from "../../../extensions/link/page";
import { forceCloseTextTool } from "../../../extensions/text.tool";
import { Block } from "../../block";
import { AppearAnchor } from "../../block/appear";
import { findBlocksBetweenAppears } from "../../block/appear/visible.seek";
import { BlockUrlConstant } from "../../block/constant";
import { BlockRenderRange } from "../../block/enum";
import { TextEle } from "../../common/text.ele";
import { Rect } from "../../common/vector/point";
import { InputForceStore, InputStore } from "./store";

export async function inputPopCallback(write: PageWrite, ...args: any) {
    var blockData = args[0];
    var sel = window.getSelection();
    var aa = write.inputPop.aa;
    var offset = aa.getCursorOffset(sel.focusNode, sel.focusOffset);
    var content = aa.textContent;
    var textContent = content.slice(0, write.inputPop.offset) + content.slice(offset);
    aa.setContent(textContent);
    aa.collapse(offset);
    await write.onInputPopCreateBlock(write.inputPop.offset, blockData);
    write.inputPop = null;
}

/**
 * 输入弹窗
 */
export async function inputPop(write: PageWrite, aa: AppearAnchor, event: React.FormEvent) {
    var ev = event.nativeEvent as InputEvent;
    var sel = window.getSelection();
    var offset = aa.getCursorOffset(sel.focusNode, sel.focusOffset);
    if (!write.inputPop && aa.block.url != BlockUrlConstant.Title) {
        var rect = Rect.fromEle(sel.getRangeAt(0));
        var data = ev.data;
        var textContent = aa.textContent;
        var data2 = textContent.slice(offset - 2, offset);
        if (data == '/' || data == '、') {
            write.inputPop = {
                rect,
                type: InputTextPopSelectorType.BlockSelector,
                offset: offset - 1,
                aa,
                selector: (await useBlockSelector())
            };
        }
        else if (data == '@') {
            write.inputPop = {
                rect,
                type: InputTextPopSelectorType.AtSelector,
                offset: offset - 1,
                aa,
                selector: (await useAtUserSelector())
            };
        }
        else if (data2 == '[[' || data2 == '【【') {
            write.inputPop = {
                rect,
                type: InputTextPopSelectorType.LinkeSelector,
                offset: offset - 2,
                aa,
                selector: (await usePageLinkSelector())
            };
        }
        // else if (data2 == ';;' || data2 == '；；') {

        // }
        // else if(data2=='{{'){

        // }
        // else if(data2=='(('){

        // }
        // else if(data=='#'){

        // }
    }
    if (write.inputPop) {
        var popVisible = await write.inputPop.selector.open(
            write.inputPop.rect,
            aa.textContent.slice(write.inputPop.offset, offset),
            (...data) => {
                inputPopCallback(write, ...data);
            });
        if (!popVisible) write.inputPop = null;
        else return true;
    }
    return false;
}

/**
 * 对输入的内容进行检测
 * @returns 
 */
export async function inputDetector(write: PageWrite, aa: AppearAnchor, event: React.FormEvent) {
    var sel = window.getSelection();
    var offset = aa.getCursorOffset(sel.focusNode, sel.focusOffset);
    var current = aa.textContent.slice(0, offset);
    var rest = aa.textContent.slice(offset);
    var mr = InputDetector(current, { rowStart: aa.isRowStart });
    if (mr) {
        var rule = mr.rule;
        switch (rule.operator) {
            case DetectorOperator.firstLetterCreateBlock:
                var newOffset = offset + (mr.value.length - current.length);
                aa.setContent(mr.value + rest);
                aa.collapse(newOffset);
                await InputForceStore(aa, async () => {
                    var row = aa.block.closest(x => !x.isLine);
                    var newBlock = await row.visibleUpCreateBlock(rule.url, { createSource: 'InputBlockSelector' });
                    if (row.isContentEmpty) {
                        await row.delete();
                        row = undefined;
                    }
                    if (row)
                        newBlock.mounted(() => {
                            write.onFocusBlockAnchor(row);
                        });
                });
                break;
            case DetectorOperator.firstLetterTurnBlock:
                aa.setContent(rest);
                aa.collapse(0);
                await InputForceStore(aa, async () => {
                    var row = aa.block.closest(x => !x.isLine);
                    var newBlock = await row.turn(rule.url);
                    write.kit.page.addUpdateEvent(async () => {
                        write.onFocusBlockAnchor(newBlock);
                    })
                });
                break;
            case DetectorOperator.inputCharReplace:
                var newOffset = offset + (mr.value.length - current.length);
                aa.setContent(mr.value + rest);
                aa.collapse(newOffset);
                await InputStore(aa);
                break;
            case DetectorOperator.letterReplaceCreateBlock:
                aa.setContent(mr.value);
                aa.collapse(mr.value.length);
                await InputForceStore(aa, async () => {
                    var block = aa.block;
                    var rowBlock = block.closest(x => !x.isLine);
                    var pattern = await block.pattern.cloneData();
                    if (rowBlock === block) {
                        await rowBlock.appendBlock({ url: BlockUrlConstant.Text, pattern, content: rowBlock.content });
                        await rowBlock.updateProps({ content: '' });
                    }
                    var newBlock = await rowBlock.appendBlock({ url: BlockUrlConstant.Text, content: mr.matchValue });
                    if (rule.style) newBlock.pattern.setStyles(rule.style);
                    if (rest) await rowBlock.appendBlock({ url: BlockUrlConstant.Text, pattern, content: rest });
                    write.kit.page.addUpdateEvent(async () => {
                        write.onFocusBlockAnchor(newBlock, { last: true });
                    })
                });
                break;
        }
        return true;
    }
    return false;
}
export async function inputLineTail(write: PageWrite, aa: AppearAnchor, event: React.FormEvent) {
    return false;
}


/**
 * 将要回车删除
 * 两种情况
 * 1.textContent回车删除
 *   这里主要是如果触发删除，则删除当前行的prev项的最后一位字符
 * 2.首行删除
 * @param write 
 * @param aa 
 * @param event 
 * 
 */
export async function keydownBackspaceTextContent(write: PageWrite, aa: AppearAnchor, event: React.KeyboardEvent) {
    var sel = window.getSelection();
    var isEmpty = aa.textContent == '';
    var offset = aa.getCursorOffset(sel.focusNode, sel.focusOffset);
    if (offset == 0) {
        event.preventDefault();
        /**
         * 标题不能回退删除
         */
        if (isEmpty && aa.block.url == BlockUrlConstant.Title) {
            return;
        }
        await InputForceStore(aa, async () => {
            var block = aa.block;
            var rowBlock = block.closest(x => !x.isLine);
            if (block.isLine && block.prev) {
                /**这里判断block前面有没有line */
                var pv = block.prev;
                if (isEmpty && !aa.isSolid) await block.delete();
                else if (aa.isSolid) await block.delete();
                if (pv.appearAnchors.some(s => s.isSolid)) {

                }
                else pv.updateProps({ content: pv.content.slice(0, pv.content.length - 1) }, BlockRenderRange.self);
                if (pv.isContentEmpty) {
                    var fr = pv.prev;
                    await pv.delete();
                    write.kit.page.addUpdateEvent(async () => {
                        if (fr) write.onFocusBlockAnchor(fr, { last: true });
                        else write.onFocusBlockAnchor(rowBlock);
                    })
                }
                else write.kit.page.addUpdateEvent(async () => {
                    write.onFocusBlockAnchor(pv, { last: true });
                });
                return;
            }
            else {
                if (isEmpty && block.isLine) await block.delete()
                else if (aa.isSolid) {
                    await block.delete();
                    write.kit.page.addUpdateEvent(async () => {
                        write.onFocusBlockAnchor(rowBlock);
                    });
                    return;
                }
                /**
                 * 如果满足转换，
                 * 则自动转换,如果是list块，且有子块，则不自动转换
                 *  */
                if (rowBlock.isBackspaceAutomaticallyTurnText && !(rowBlock.isListBlock && rowBlock.getChilds(rowBlock.childKey).length > 0)) {
                    var newBlock = await rowBlock.turn(BlockUrlConstant.TextSpan);
                    write.kit.page.addUpdateEvent(async () => {
                        write.onFocusBlockAnchor(newBlock);
                    });
                    return;
                }
                //这里判断块前面没有同级的块，所以这里考虑能否升级
                if (rowBlock?.parent?.isListBlock && rowBlock.isListBlock && !rowBlock.prev) {
                    var rp = rowBlock.parent;
                    var rest = rowBlock.parentBlocks.findAll((g, i) => i > rowBlock.at);
                    await rowBlock.appendArray(rest);
                    await rowBlock.insertAfter(rp);
                    write.kit.page.addUpdateEvent(async () => {
                        write.onFocusBlockAnchor(rowBlock);
                    });
                    return;
                }
                if (!rowBlock.isContentEmpty && rowBlock.isTextBlock && !rowBlock.prev && rowBlock.parent.isTextBlock) {
                    //这个父块合并子块的内容
                    await combindSubBlock(write, rowBlock);
                    return;
                }
                if (!rowBlock.isContentEmpty && rowBlock.isTextBlock && rowBlock.prev?.isTextBlock && rowBlock.prev?.url != BlockUrlConstant.Title) {
                    //这个需要合并块
                    await combineTextBlock(write, rowBlock);
                    return;
                }
                /***
                 * 这个回车啥也没干，光标跳动
                 */
                var prevAppearBlock = rowBlock.prevFind(x => x.appearAnchors.length > 0);
                if (prevAppearBlock) {
                    write.kit.page.addUpdateEvent(async () => {
                        write.onFocusBlockAnchor(prevAppearBlock, { last: true });
                    });
                }
                if (rowBlock.isContentEmpty && !rowBlock.isPart) {
                    await rowBlock.delete();
                }
            }
        });
    }

}


/**
 *   有两种情况发生上面的
 *    1. 块的rowBlock 中的子textContent为空了，但textContent前面还有其它子textContent
 *    2. 块的rowBlock中的第一个textContent为空了，那么会有几种情况
 *    a. 自动转化如list块转到textspan块
 *    b. 块的rowBlock会与前面的块进行合并
 *    c. 块的rowBlock前面没有块，合并不了，考虑是否能升一级别，
 *    d. 块的rowBlock块并合不了，且不能升级，那么考虑当前textspan本身是否是空的，如果是空的，则自动删除
 *    e. 找到前面适合的编辑点，然后光标移过去
 */
export async function inputBackSpaceTextContent(write: PageWrite, aa: AppearAnchor, event: React.FormEvent) {
    var sel = window.getSelection();
    var offset = aa.getCursorOffset(sel.focusNode, sel.focusOffset);
    if (offset == 0) {
        await InputForceStore(aa, async () => {
            var block = aa.block;
            var rowBlock = block.closest(x => !x.isLine);
            var prev = block.prev;
            var isLine = block.isLine;
            if (block.isContentEmpty && block.isLine) await block.delete();
            write.kit.page.addUpdateEvent(async () => {
                if (isLine && prev) {
                    write.onFocusBlockAnchor(prev, { last: true })
                }
                else {
                    write.onFocusBlockAnchor(rowBlock)
                }
            });
        });
        return true;
    }
    return false;
}
/**
 * 
 * @param write 
 * @param rowBlock 
 */
async function combindSubBlock(write: PageWrite, rowBlock: Block) {
    var pa = rowBlock.parent;
    var lastPreBlock = pa.childs.last();
    if (pa.childs.length == 0) {
        var content = pa.content;
        pa.updateProps({ content: '' });
        var pattern = await pa.pattern.cloneData();
        lastPreBlock = await pa.appendBlock({ url: BlockUrlConstant.Text, content, pattern }, undefined, 'childs');
    }
    if (rowBlock.childs.length > 0) {
        await pa.appendArray(rowBlock.childs, undefined, 'childs');
    }
    else {
        await pa.appendBlock({
            url: BlockUrlConstant.Text,
            content: rowBlock.content,
            pattern: await rowBlock.pattern.cloneData()
        }, undefined, 'childs');
    }
    if (rowBlock.isListBlock && rowBlock.blocks[rowBlock.childKey].length > 0) {
        await pa.appendArray(rowBlock.blocks[rowBlock.childKey], 0, rowBlock.childKey);
    }
    await rowBlock.delete();
    write.kit.page.addUpdateEvent(async () => {
        write.onFocusBlockAnchor(lastPreBlock, { last: true });
    });
}

/**
 * 合并块
 * @param write 
 * @param rowBlock 
 */
async function combineTextBlock(write: PageWrite, rowBlock: Block) {
    var preBlock = rowBlock.prev;
    var lastPreBlock = preBlock.childs.last();
    if (preBlock.childs.length == 0) {
        var content = preBlock.content;
        preBlock.updateProps({ content: '' });
        var pattern = await preBlock.pattern.cloneData();
        await preBlock.appendBlock({ url: BlockUrlConstant.Text, content, pattern });
        lastPreBlock = preBlock.childs.last();
    }
    /**
     * 这里判断rowBlock里面是否有子的childs,
     * 如果有转移到preBlock中，
     * 如果没有取其content
     */
    if (rowBlock.childs.length > 0) {
        var cs = rowBlock.childs.map(c => c);
        for (let i = 0; i < cs.length; i++) {
            await preBlock.append(cs[i]);
        }
    }
    else {
        await preBlock.appendBlock({ url: BlockUrlConstant.Text, content: rowBlock.content, pattern: await rowBlock.pattern.cloneData() })
    }
    await rowBlock.delete();
    write.kit.page.addUpdateEvent(async () => {
        write.onFocusBlockAnchor(lastPreBlock, { last: true });
    });
}


export async function inputBackspaceDeleteContent(write: PageWrite, aa: AppearAnchor, event: React.KeyboardEvent) {
    event.preventDefault();
    await InputForceStore(aa, async () => {
        write.onSaveSelection();
        var appears = findBlocksBetweenAppears(write.startAnchor.el, write.endAnchor.el);
        await appears.eachAsync(async appear => {
            if (appear == write.startAnchor || appear == write.endAnchor) {
            }
            else {
                var block = appear.block;
                if (appear.isText) {
                    await block.updateAppear(appear, '', BlockRenderRange.self);
                    if (block.isContentEmpty) await block.delete();
                }
                else if (appear.isSolid) {
                    await block.delete();
                }
            }
        });
        if (write.endAnchor === write.startAnchor && write.endOffset < write.startOffset || TextEle.isBefore(write.endAnchor.el, write.startAnchor.el)) {
            [write.startAnchor, write.endAnchor] = [write.endAnchor, write.startAnchor];
            [write.startOffset, write.endOffset] = [write.endOffset, write.startOffset];
        }
        var isStartDelete: boolean = false;
        var preAppear = write.endAnchor.block.prevFind(g => g.appearAnchors.length > 0)?.appearAnchors.last();
        if (write.startAnchor == write.endAnchor) {
            if (write.startAnchor.isText) {
                var tc = write.startAnchor.textContent;
                write.startAnchor.setContent(tc.slice(0, write.startOffset) + tc.slice(write.endOffset))
                await write.startAnchor.block.updateAppear(write.startAnchor, write.startAnchor.textContent, BlockRenderRange.self);
                if (write.startAnchor.block.isContentEmpty) { await write.startAnchor.block.delete(); isStartDelete = true; }
            }
        }
        else {
            if (write.startAnchor.isText) {
                write.startAnchor.setContent(write.startAnchor.textContent.slice(0, write.startOffset));
                await write.startAnchor.block.updateAppear(write.startAnchor, write.startAnchor.textContent, BlockRenderRange.self);
                if (write.startAnchor.block.isContentEmpty) { await write.startAnchor.block.delete(); isStartDelete = true; }
            }
            if (write.endAnchor.isText) {
                write.endAnchor.setContent(write.endAnchor.textContent.slice(write.endOffset));
                await write.endAnchor.block.updateAppear(write.endAnchor, write.endAnchor.textContent, BlockRenderRange.self);
                if (write.endAnchor.block.isContentEmpty) await write.endAnchor.block.delete()
            }
        }
        write.kit.page.addUpdateEvent(async () => {
            forceCloseTextTool()
            if (isStartDelete) write.onFocusAppearAnchor(preAppear, { last: true })
            else write.onFocusAppearAnchor(write.startAnchor, { at: write.startOffset });
        })
    });
}



