import React from "react";
import { PageWrite } from ".";
import { useAtSelector } from "../../../extensions/at";
import { useBlockSelector } from "../../../extensions/block";
import { InputTextPopSelectorType } from "../../../extensions/common/input.pop";
import { InputDetector } from "../../../extensions/input.detector/detector";
import { DetectorOperator } from "../../../extensions/input.detector/rules";
import { usePageLinkSelector } from "../../../extensions/link/page";
import { AppearAnchor } from "../../block/appear";
import { findBlocksBetweenAppears } from "../../block/appear/visible.seek";
import { BlockUrlConstant } from "../../block/constant";
import { BlockRenderRange } from "../../block/enum";
import { TextEle } from "../../common/text.ele";
import { Rect } from "../../common/vector/point";
import { InputStore } from "./store";

async function inputPopCallback(write: PageWrite, ...args: any) {
    var blockData = args[0];
    var sel = window.getSelection();
    var offset = sel.focusOffset;
    var content = write.inputPop.aa.textContent;
    var textContent = content.slice(0, write.inputPop.offset) + content.slice(offset);
    write.inputPop.aa.textNode.textContent = textContent;
    await write.onInputPopCreateBlock(write.inputPop.offset, blockData);
    write.inputPop = null;
}

/**
 * 输入弹窗
 */
export async function inputPop(write: PageWrite, aa: AppearAnchor, event: React.FormEvent) {
    var ev = event.nativeEvent as InputEvent;
    var sel = window.getSelection();
    var offset = sel.focusOffset;
    if (!write.inputPop) {
        var rect = Rect.fromEle(sel.getRangeAt(0));
        var data = ev.data;
        var textContent = aa.textContent;
        var data2 = textContent.slice(offset - 1, offset + 1);
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
                selector: (await useAtSelector())
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
        // else if(data2=='{{'){

        // }
        // else if(data2=='(('){

        // }
        // else if(data=='#'){

        // }
    }
    if (write.inputPop) {
        var popVisible = await write.inputPop.selector.open(write.inputPop.rect, aa.textContent.slice(write.inputPop.offset, offset), (...data) => {
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
    var offset = sel.focusOffset;
    var current = aa.textContent.slice(0, offset);
    var rest = aa.textContent.slice(offset);
    var mr = InputDetector(current, { rowStart: aa.isRowStart });
    if (mr) {
        var rule = mr.rule;
        console.log(mr);
        switch (rule.operator) {
            case DetectorOperator.firstLetterCreateBlock:
                var newOffset = offset + (mr.value.length - current.length);
                aa.textNode.textContent = mr.value + rest;
                sel.setPosition(aa.textNode, newOffset);
                await InputStore(aa, aa.textNode.textContent, write.endAnchorText, true, async () => {
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
                aa.textNode.textContent = rest;
                sel.setPosition(aa.textNode, 0);
                await InputStore(aa, rest, write.endAnchorText, true, async () => {
                    var row = aa.block.closest(x => !x.isLine);
                    var newBlock = await row.turn(rule.url);
                    write.kit.page.addUpdateEvent(async () => {
                        write.onFocusBlockAnchor(newBlock);
                    })
                });
                break;
            case DetectorOperator.inputCharReplace:
                var newOffset = offset + (mr.value.length - current.length);
                aa.textNode.textContent = mr.value + rest;
                sel.setPosition(aa.textNode, newOffset);
                await InputStore(aa, aa.textNode.textContent, write.endAnchorText);
                break;
            case DetectorOperator.letterReplaceCreateBlock:
                aa.textNode.textContent = mr.value;
                sel.setPosition(aa.textNode, mr.value.length);
                await InputStore(aa, aa.textContent, write.endAnchorText, true, async () => {
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
    var isFirst = sel.focusOffset == 0;
    var isEmpty = aa.textContent == '';
    if (isFirst) {
        await InputStore(aa, aa.textContent, write.endAnchorText, true, async () => {
            var block = aa.block;
            var rowBlock = block.closest(x => !x.isLine);
            var preLineBlock = block.isLine ? block.prev : undefined;
            if (isEmpty)
                await block.delete();
            if (preLineBlock) {
                write.onFocusBlockAnchor(preLineBlock, { last: true })
            }
            else {

                //如果是列表，则先切换成正常块，然后在考虑合并的事情
                if (rowBlock.isBackspaceAutomaticallyTurnText) {
                    var newBlock = await rowBlock.turn(BlockUrlConstant.TextSpan);
                    write.kit.page.addUpdateEvent(async () => {
                        write.onFocusBlockAnchor(newBlock);
                    });
                    return;
                }
                else {
                    var preBlock = rowBlock.prev;
                    if (preBlock) {
                        //这个需要合并块
                        if (rowBlock.isTextBlock && preBlock.isTextBlock) {
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
                            return;
                        }
                    }
                    else {
                        //这里判断块前面没有同级的块，所以这里考虑能否升级
                        if (rowBlock?.parent.isListBlock) {
                            var ppa = rowBlock.parent.parent;
                            var at = rowBlock.parent.at;
                            await ppa.append(rowBlock, at + 1);
                            return;
                        }
                    }
                    /**
                     * 如果块本身是空的，则需要自动删除
                     */
                    if (rowBlock.isCanAutomaticallyDeleted) { await rowBlock.delete(); return; }
                    /**这里以当前块的为起点，查找这个块前面的有编辑点的块，然后光标移过去 */
                    var prevAppearBlock = rowBlock.prevFind(x => x.appearAnchors.some(s => s.isText));
                    if (prevAppearBlock) {
                        write.kit.page.addUpdateEvent(async () => {
                            write.onFocusBlockAnchor(prevAppearBlock, { last: true });
                        });
                        return;
                    }
                    else {
                        //这个可能是当前页的最上面编辑点
                        console.warn('to top page editor')
                    }
                }
            }
        });
        /**
         * 说明当前文本是空的
         */
    }
    return false;
}


export async function inputBackspaceDeleteContent(write: PageWrite, aa: AppearAnchor, event: React.KeyboardEvent) {

    await InputStore(aa, aa.textContent, write.endAnchorText, true, async () => {
        write.onSaveSelection();
        var appears = findBlocksBetweenAppears(write.startAnchor.el, write.endAnchor.el);
        await appears.eachAsync(async appear => {
            if (appear == write.startAnchor || appear == write.endAnchor) {

            }
            else {
                var block = appear.block;
                await block.updateAppear(appear, '', BlockRenderRange.self);
                if (block.isContentEmpty) await block.delete();
            }
        });
        if (write.endAnchor === write.startAnchor && write.endOffset < write.startOffset || TextEle.isBefore(write.endAnchor.el, write.startAnchor.el)) {
            [write.startAnchor, write.endAnchor] = [write.endAnchor, write.startAnchor];
            [write.startOffset, write.endOffset] = [write.endOffset, write.startOffset];
            write.startAnchorText = write.endAnchor.textContent;
        }
        write.startAnchor.textNode.textContent = write.startAnchor.textContent.slice(0, write.startOffset);
        write.endAnchor.textNode.textContent = write.endAnchor.textContent.slice(write.endOffset);
        await write.startAnchor.block.updateAppear(write.startAnchor, write.startAnchor.textContent, BlockRenderRange.self);
        await write.endAnchor.block.updateAppear(write.endAnchor, write.endAnchor.textContent, BlockRenderRange.self);
        write.kit.page.addUpdateEvent(async () => {
            write.onFocusAppearAnchor(write.startAnchor, { last: true });
        })
    });

}


