
import React from "react";
import { PageWrite } from ".";
import { CopyText } from "../../../component/copy";
import { useAtUserSelector } from "../../../extensions/at";
import { useBlockSelector } from "../../../extensions/block";
import { InputTextPopSelectorType } from "../../../extensions/common/input.pop";
import { useEmojiSelector } from "../../../extensions/emoji/selector";
import { InputDetector } from "../../../extensions/input.detector/detector";
import { DetectorOperator } from "../../../extensions/input.detector/rules";
import { usePageLinkSelector } from "../../../extensions/link/page";
import { forceCloseTextTool } from "../../../extensions/text.tool";
import { Block } from "../../block";
import { AppearAnchor } from "../../block/appear";
import { BlockChildKey, BlockUrlConstant, ParseBlockUrl } from "../../block/constant";
import { BlockRenderRange } from "../../block/enum";
import { KeyboardCode } from "../../common/keys";
import { Rect } from "../../common/vector/point";
import { InputForceStore, InputStore } from "./store";
import { useTagSelector } from "../../../extensions/tag";

import { util } from "../../../util/util";
import lodash from "lodash";

/**
 * 输入弹窗
 */
export async function inputPop(write: PageWrite, aa: AppearAnchor, event: React.FormEvent) {
    if (aa.isSolid) return false;
    if (aa.isPlainText) return false;
    var ev = event.nativeEvent as InputEvent;
    var sel = window.getSelection();
    var offset = aa.getCursorOffset(sel.focusNode, sel.focusOffset);
    if (!write.inputPop) {
        var rect = Rect.fromEle(util.getSafeSelRange(sel));
        var data = ev.data;
        var textContent = aa.textContent;
        var data2 = textContent.slice(offset - 2, offset);
        if (data == '/' || data == '、' && (write.kit.page.keyboardPlate.is(KeyboardCode['/']) || write.kit.page.keyboardPlate.is(KeyboardCode.Slash))) {
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
        else if (data2 == '::' || data2 == '：：' || data2 == ';;') {
            write.inputPop = {
                rect,
                type: InputTextPopSelectorType.EmojiSelector,
                offset: offset - 2,
                aa,
                selector: (await useEmojiSelector())
            };
        }
        // else if(data2=='{{'){

        // }
        // else if(data2=='(('){

        // }
        else if (/^#[^#\s]/.test(data2)) {
            write.inputPop = {
                rect,
                type: InputTextPopSelectorType.TagSelector,
                offset: offset - 2,
                aa,
                selector: (await useTagSelector())
            };
        }
    }
    if (write.inputPop) {
        var popVisible = await write.inputPop.selector.open(
            write.inputPop.rect,
            aa.textContent.slice(write.inputPop.offset, offset),
            (...data) => {
                write.onInputPopCreateBlock(...data);
            }, write.kit.page);
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
    if (aa.isSolid) return false;
    if (aa.isPlainText) return false;

    var sel = window.getSelection();
    var offset = aa.getCursorOffset(sel.focusNode, sel.focusOffset);
    var current = aa.textContent.slice(0, offset);
    var rest = aa.textContent.slice(offset);
    var mr = InputDetector(current, { rowStart: aa.isRowStart, rowEnd: aa.isRowEnd && (rest ? false : true) });
    if (mr) {
        var rule = mr.rule;
        switch (rule.operator) {
            case DetectorOperator.lastLetterCreateBlock:
                var nv = current.slice(0, 0 - mr.value.length);
                aa.setContent(nv);
                aa.collapse(nv.length);
                await InputForceStore(aa, async () => {
                    var row = aa.block.closest(x => x.isContentBlock);
                    var newBlock: Block;
                    if (row.isContentEmpty) {
                        await row.visibleUpCreateBlock(rule.url, {
                            createSource: 'InputBlockSelector'
                        });
                        write.kit.page.addActionAfterEvent(async () => {
                            write.kit.anchorCursor.onFocusBlockAnchor(row, {
                                render: true,
                                merge: true
                            });
                        })
                    }
                    else {
                        var nbs = await row.parent.appendArrayBlockData([{ url: rule.url, createSource: 'InputBlockSelector' }, { url: BlockUrlConstant.TextSpan }], row.at + 1, row.parentKey)
                        newBlock = nbs.last();
                        newBlock.mounted(() => {
                            write.kit.anchorCursor.onFocusBlockAnchor(newBlock, { render: true, merge: true })
                        });
                    }
                });
                break;
            case DetectorOperator.firstLetterCreateBlock:
                var newOffset = offset + (mr.value.length - current.length);
                aa.setContent(rest);
                aa.collapse(offset);
                await InputForceStore(aa, async () => {
                    var row = aa.block.closest(x => x.isContentBlock);
                    var newBlock: Block;
                    newBlock = await row.visibleUpCreateBlock(rule.url, { createSource: 'InputBlockSelector' });
                    if (row.isContentEmpty) write.kit.page.addActionAfterEvent(async () => {
                        await write.kit.anchorCursor.onFocusBlockAnchor(row, {
                            render: true,
                            merge: true
                        })
                    })
                    else newBlock.mounted(() => {
                        var b = row.nextFind(g => g.appearAnchors.some(s => s.isText));
                        if (b) write.kit.anchorCursor.onFocusBlockAnchor(b, { render: true, merge: true })
                    })
                });
                break;
            case DetectorOperator.firstLetterTurnBlock:
                aa.setContent(rest);
                aa.collapse(0);
                await InputForceStore(aa, async () => {
                    var row = aa.block.closest(x => x.isContentBlock);
                    var newBlock: Block;
                    var props: Record<string, any> = {};
                    if (rule.url == '/list?{listType:1}') {
                        var n = parseInt(current.replace(/[^0-9]/g, ''));
                        if (typeof n == 'number' && n > 1) {
                            newBlock = await row.turn(rule.url, { startNumber: n });
                        }
                    }
                    else {
                        var d = ParseBlockUrl(rule.url);
                        if (d) {
                            rule.url = d.url;
                            props = d.data || {};
                        }
                    }
                    if (!newBlock)
                        newBlock = await row.turn(rule.url, props);
                    write.kit.page.addActionAfterEvent(async () => {
                        if (newBlock.url == BlockUrlConstant.Code) {
                            (newBlock as any).onFocusCursor()
                        }
                        else
                            write.kit.anchorCursor.onFocusBlockAnchor(newBlock, { render: true, merge: true });
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
                    var rowBlock = block.closest(x => x.isContentBlock);
                    var pattern = await block.pattern.cloneData();
                    if (rowBlock === block) {
                        if (rowBlock.content) await rowBlock.appendBlock({ url: BlockUrlConstant.Text, pattern, content: rowBlock.content });
                        await rowBlock.updateProps({ content: '' }, BlockRenderRange.self);
                    }
                    var newBlock = await rowBlock.appendBlock({ url: rule.url || BlockUrlConstant.Text, content: mr.matchValue });
                    if (rule.style) await newBlock.pattern.setStyles(rule.style);
                    if (rule.props) await newBlock.updateProps(rule.props, BlockRenderRange.self);
                    if (rest) await rowBlock.appendBlock({ url: BlockUrlConstant.Text, pattern, content: rest });
                    write.kit.page.addActionAfterEvent(async () => {
                        write.kit.anchorCursor.onFocusBlockAnchor(newBlock, { last: true, render: true, merge: true });
                    })
                });
                break;
        }
        return true;
    }
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
    if (aa.block.isPart) isEmpty = false;
    if (aa.isSolid) isEmpty = false;
    var offset = aa.getCursorOffset(sel.focusNode, sel.focusOffset);
    if (offset == 0 && aa.textContent == '\n') return;
    if (offset == 0 || aa.isSolid && offset == 1) {
        event.preventDefault();
        /**
         * 标题不能回退删除
         */
        if (isEmpty && !aa.block.isCanEmptyDelete) {
            return;
        }
        if (aa.block.isFreeBlock) {
            return;
        }
        await InputForceStore(aa, async () => {
            var block = aa.block;
            var rowBlock = block.closest(x => x.isContentBlock);
            if (block.isLine && block.prev) {
                /**这里判断block前面有没有line */
                var pv = block.prev;
                if (aa.isSolid && offset == 1) {
                    await block.delete()
                }
                else {
                    if (block.isContentEmpty) {
                        await block.delete();
                    }
                    if (pv.appearAnchors.some(s => s.isText)) {
                        await pv.updateProps({ content: pv.content.slice(0, pv.content.length - 1) }, BlockRenderRange.self);
                        if (pv.isContentEmpty) {
                            var fr = pv.prev;
                            await pv.delete();
                            pv = fr;
                        }
                    }
                    else {
                        var fr = pv.prev;
                        await pv.delete();
                        pv = fr;
                    }
                }
                write.kit.page.addActionAfterEvent(async () => {
                    if (pv) await write.kit.anchorCursor.onFocusBlockAnchor(pv, { last: true, render: true, merge: true });
                    else await write.kit.anchorCursor.onFocusBlockAnchor(rowBlock, { render: true, merge: true });
                });
            }
            else {
                if (aa.isSolid && offset == 1) {
                    await block.delete();
                    write.kit.page.addActionAfterEvent(async () => {
                        write.kit.anchorCursor.onFocusBlockAnchor(rowBlock, { render: true, last: false });
                    });
                    return
                }
                else {
                    if (block.isLine && block.isContentEmpty) await block.delete()
                    if (rowBlock.isFreeBlock) {
                        //不做任何处理
                        return;
                    }
                    /**
                    * 如果满足转换，
                    * 则自动转换,如果是list块，且有子块，则不自动转换
                    * */
                    else if (rowBlock.isBackspaceAutomaticallyTurnText) {
                        var newBlock = await rowBlock.turn(BlockUrlConstant.TextSpan);
                        write.kit.page.addActionAfterEvent(async () => {
                            write.kit.anchorCursor.onFocusBlockAnchor(newBlock, { render: true, merge: true });
                        });
                        return;
                    }
                    //这里判断块前面没有同级的块，所以这里考虑能否升级
                    else if (rowBlock?.parent?.hasSubChilds && (!rowBlock.next || !rowBlock.prev)) {
                        var rp = rowBlock.parent;
                        await rowBlock.insertAfter(rp);
                        if (rowBlock.allBlockKeys.includes(BlockChildKey.subChilds) && !rowBlock.prev) {
                            var gs = rowBlock.parent.subChilds.map(g => g);
                            lodash.remove(gs, c => c == rowBlock);
                            if (gs.length > 0)
                                await rowBlock.appendArray(gs, 0, 'subChilds')
                        }
                        write.kit.page.addActionAfterEvent(async () => {
                            write.kit.anchorCursor.onFocusBlockAnchor(rowBlock, { render: true, merge: true });
                        });
                        return;
                    }
                    else if (rowBlock.isTextBlock && rowBlock.prev?.url == BlockUrlConstant.Title) {
                        var title = rowBlock.prev;
                        var subs = rowBlock.subChilds.map(s => s);
                        if (subs.length > 0) {
                            await rowBlock.parent.appendArray(subs, rowBlock.at + 1, rowBlock.parentKey);
                        }
                        var content = rowBlock.childs.length > 0 ? rowBlock.childs.map(c => (c.content || '')).join('') : rowBlock.content;
                        if (content) {
                            var pageTitle = rowBlock.page.getPageDataInfo()?.text || '';
                            await rowBlock.page.onUpdatePageTitle(pageTitle + content);
                        }
                        await rowBlock.delete();
                        write.kit.page.addActionAfterEvent(async () => {
                            write.kit.anchorCursor.onFocusBlockAnchor(title, { last: true, render: true, merge: true });
                        });
                    }
                    else if (rowBlock.isTextBlock && rowBlock?.prev?.isTextBlock && rowBlock?.prev?.url != BlockUrlConstant.Title) {
                        //这个需要合并块
                        var lastPreBlock = await combineRowBlocks(write, rowBlock);
                        write.kit.page.addActionAfterEvent(async () => {
                            write.kit.anchorCursor.onFocusBlockAnchor(lastPreBlock, { last: true, render: true, merge: true });
                        });
                        return
                    }
                    else {
                        /***
                         * 这个回车啥也没干，光标跳动
                        */
                        var prevAppearBlock = rowBlock.prevFind(x => x.appearAnchors.length > 0);
                        if (prevAppearBlock) {
                            write.kit.page.addActionAfterEvent(async () => {
                                write.kit.anchorCursor.onFocusBlockAnchor(prevAppearBlock, { last: true, render: true, merge: true });
                            });
                            if (rowBlock.isContentEmpty) {
                                await rowBlock.delete();
                            }
                        }
                    }
                }
                // if (isEmpty && block.isLine) await block.delete()
                // if (!rowBlock.isFreeBlock) {

                //     //这里判断块前面没有同级的块，所以这里考虑能否升级
                //     if (rowBlock?.parent?.hasSubChilds && !rowBlock.next) {
                //         var rp = rowBlock.parent;
                //         await rowBlock.insertAfter(rp);
                //         write.kit.page.addActionAfterEvent(async () => {
                //             write.kit.anchorCursor.onFocusBlockAnchor(rowBlock, { render: true, merge: true });
                //         });
                //         return;
                //     }
                //     if (rowBlock.isTextBlock && rowBlock?.prev?.isTextBlock && rowBlock?.prev?.url != BlockUrlConstant.Title) {
                //         //这个需要合并块
                //         var lastPreBlock = await combineTextBlock(write, rowBlock);
                //         write.kit.page.addActionAfterEvent(async () => {
                //             write.kit.anchorCursor.onFocusBlockAnchor(lastPreBlock, { last: true, render: true, merge: true });
                //         });
                //         return
                //     }
                //     if (rowBlock.isTextBlock && !rowBlock?.prev && !(rowBlock.parent?.isPanel || rowBlock.parent?.isCell || rowBlock.parent?.isLayout)) {
                //         //这个父块合并子块的文本内容
                //         return await combindSubBlock(write, rowBlock);
                //     }
                // }
                // /***
                //  * 这个回车啥也没干，光标跳动
                //  */
                // var prevAppearBlock = rowBlock.prevFind(x => x.appearAnchors.length > 0);
                // if (prevAppearBlock) {
                //     write.kit.page.addActionAfterEvent(async () => {
                //         write.kit.anchorCursor.onFocusBlockAnchor(prevAppearBlock, { last: true, render: true, merge: true });
                //     });
                //     if (rowBlock.isContentEmpty) {
                //         await rowBlock.delete();
                //     }
                // }
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
            var rowBlock = block.closest(x => x.isContentBlock);
            var prev = block.prev;
            var isLine = block.isLine;
            if (block.isContentEmpty && block.isLine && !aa.hasGap) await block.delete();
            write.kit.page.addActionAfterEvent(async () => {
                if (isLine && prev) {
                    write.kit.anchorCursor.onFocusBlockAnchor(prev, { last: true, render: true, merge: true })
                }
                else {
                    write.kit.anchorCursor.onFocusBlockAnchor(rowBlock, { render: true, merge: true })
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
// async function combindSubBlock(write: PageWrite, rowBlock: Block) {
//     var pa = rowBlock.parent;
//     var lastPreBlock = pa.childs.last();
//     if (pa.childs.length == 0) {
//         var content = pa.content;
//         await pa.updateProps({ content: '' }, BlockRenderRange.self);
//         var pattern = await pa.pattern.cloneData();
//         lastPreBlock = await pa.appendBlock({ url: BlockUrlConstant.Text, content, pattern }, undefined, BlockChildKey.childs);
//     }
//     if (rowBlock.childs.length > 0) {
//         await pa.appendArray(rowBlock.childs, undefined, BlockChildKey.childs);
//     }
//     else {
//         await pa.appendBlock({
//             url: BlockUrlConstant.Text,
//             content: rowBlock.content,
//             pattern: await rowBlock.pattern.cloneData()
//         }, undefined, BlockChildKey.childs);
//     }
//     if (rowBlock.hasSubChilds && rowBlock.subChilds.length > 0) {
//         await pa.appendArray(rowBlock.subChilds, 0, pa.hasSubChilds ? BlockChildKey.subChilds : BlockChildKey.childs);
//     }
//     if (!rowBlock.isPart)
//         await rowBlock.delete();
//     write.kit.page.addActionAfterEvent(async () => {
//         write.kit.anchorCursor.onFocusBlockAnchor(lastPreBlock, { last: true, render: true, merge: true });
//     });
// }

/**
 * 合并两行rowBlocks
 * @param write 
 * @param rowBlock 
 */
async function combineRowBlocks(write: PageWrite, rowBlock: Block, preBlock?: Block) {
    if (typeof preBlock == 'undefined')
        preBlock = rowBlock.prev;
    if (preBlock.hasSubChilds && preBlock.subChilds.length > 0) {
        var g = preBlock.findReverse(c => c.isVisible && c.isContentBlock);
        if (g) {
            preBlock = g;
        }
    }
    var lastPreBlock = preBlock.childs.last()
    if (preBlock.childs.length == 0 && preBlock.content) {
        var content = preBlock.content;
        await preBlock.updateProps({ content: '' }, BlockRenderRange.self);
        var pattern = await preBlock.pattern.cloneData();
        await preBlock.appendBlock({ url: BlockUrlConstant.Text, content, pattern });
        lastPreBlock = preBlock.childs.last()
    }
    /**
     * 这里判断rowBlock里面是否有子的childs,
     * 如果有转移到preBlock中，
     * 如果没有取其content
     */
    if (rowBlock.childs.length > 0) {
        var cs = rowBlock.childs.map(c => c);
        for (let i = 0; i < cs.length; i++) {
            if (cs[i].isTextBlock && cs[i].content != '')
                await preBlock.append(cs[i]);
            else if (cs[i].isLineSolid)
                await preBlock.append(cs[i])
        }
    }
    else {
        if (rowBlock.content)
            await preBlock.appendBlock({ url: BlockUrlConstant.Text, content: rowBlock.content, pattern: await rowBlock.pattern.cloneData() })
    }
    if (rowBlock.subChilds.length > 0) {
        if (preBlock.hasSubChilds) {
            await preBlock.appendArray(rowBlock.subChilds, undefined, BlockChildKey.subChilds)
        }
        else {
            await preBlock.parent.appendArray(rowBlock.subChilds, preBlock.at + 1, preBlock.parent.hasSubChilds ? BlockChildKey.subChilds : BlockChildKey.childs)
        }
    }
    if (!rowBlock.isPart)
        await rowBlock.delete();

    if (!lastPreBlock) {
        lastPreBlock = preBlock.childs.first();
    }
    if (!lastPreBlock) lastPreBlock = preBlock;
    return lastPreBlock;
}

/**
 * 删除选区，
 * @param write 
 * @param aa 
 * @param event 
 * @param insertContent  删除选区并插入内容
 */
export async function inputBackspaceDeleteContent(write: PageWrite,
    aa: AppearAnchor,
    event: React.KeyboardEvent,
    options?: {
        cut?: boolean,
        insertContent?: string,
        insertBlocks?: any[]
    }) {
    if (event) event.preventDefault();
    await InputForceStore(aa, async () => {
        var sel = window.getSelection();
        var deleteText = util.getSafeSelRange(sel)?.cloneContents()?.textContent;
        write.kit.anchorCursor.catchWindowSelection();
        write.kit.anchorCursor.adjustAnchorSorts()
        var appears = write.kit.anchorCursor.getAppears()
        var rowBlocks: Block[] = [];
        await appears.eachAsync(async appear => {
            var block = appear.block;
            var rb = block.closest(x => x.isBlock);
            if (!rowBlocks.some(s => s === rb)) rowBlocks.push(rb);
            if (appear == write.kit.anchorCursor.startAnchor || appear == write.kit.anchorCursor.endAnchor) {

            }
            else {
                if (appear.isText) {
                    await block.updateAppear(appear, '', BlockRenderRange.self);
                    if (block.isContentEmpty && block.url != BlockUrlConstant.Title) await block.delete();
                }
                else if (appear.isSolid) {
                    await block.delete();
                }
            }
        });
        var sb = write.kit.anchorCursor.startAnchor.block;
        var eb = write.kit.anchorCursor.endAnchor.block;
        var isStartDelete: boolean = false;
        var insertSelection: { from: number, to: number, anchor: AppearAnchor } = {
            from: null, to: null, anchor: null
        }
        var focusB;
        var preAppear = write.kit.anchorCursor.endAnchor.block.prevFind(g => g.isVisible && g.appearAnchors.length > 0)?.appearAnchors.last();
        if (!preAppear) preAppear = write.kit.anchorCursor.endAnchor.block.nextFind(g => g.isVisible && g.appearAnchors.length > 0)?.appearAnchors.last();
        if (write.kit.anchorCursor.startAnchor == write.kit.anchorCursor.endAnchor) {
            if (write.kit.anchorCursor.startAnchor.isText) {
                var tc = write.kit.anchorCursor.startAnchor.textContent;
                write.kit.anchorCursor.startAnchor.setContent(tc.slice(0, write.kit.anchorCursor.startOffset) + (options?.insertContent || '') + tc.slice(write.kit.anchorCursor.endOffset))
                if (options?.insertContent) {
                    insertSelection.from = write.kit.anchorCursor.startOffset;
                    insertSelection.to = write.kit.anchorCursor.startOffset + options.insertContent.length;
                    insertSelection.anchor = write.kit.anchorCursor.startAnchor;
                }
                await write.kit.anchorCursor.startAnchor.block.updateAppear(write.kit.anchorCursor.startAnchor, write.kit.anchorCursor.startAnchor.textContent, BlockRenderRange.self);
                if (sb.isContentEmpty && sb.url != BlockUrlConstant.Title && !sb.isFreeBlock) {
                    await sb.delete();
                    isStartDelete = true;
                }
            }
        }
        else {
            var startBlock = sb.closest(x => x.isBlock);
            var endBlock = eb.closest(c => c.isBlock);
            if (write.kit.anchorCursor.startAnchor.isText) {
                write.kit.anchorCursor.startAnchor.setContent(write.kit.anchorCursor.startAnchor.textContent.slice(0, write.kit.anchorCursor.startOffset));
                await sb.updateAppear(write.kit.anchorCursor.startAnchor, write.kit.anchorCursor.startAnchor.textContent, BlockRenderRange.self);
                if (sb.isContentEmpty && sb.url != BlockUrlConstant.Title && !sb.isFreeBlock) {
                    var isLine = sb.isLine;
                    if (startBlock == sb) { startBlock = undefined }
                    await sb.delete();
                    if (isLine) {
                        if (startBlock.isContentEmpty) { await startBlock.delete(); startBlock = undefined; }
                    }
                    isStartDelete = true;
                }
            }
            if (write.kit.anchorCursor.endAnchor.isText) {
                write.kit.anchorCursor.endAnchor.setContent((options?.insertContent || '') + write.kit.anchorCursor.endAnchor.textContent.slice(write.kit.anchorCursor.endOffset));
                if (options?.insertContent) {
                    insertSelection.from = 0;
                    insertSelection.to = options.insertContent.length;
                    insertSelection.anchor = write.kit.anchorCursor.endAnchor;
                }
                await eb.updateAppear(write.kit.anchorCursor.endAnchor, write.kit.anchorCursor.endAnchor.textContent, BlockRenderRange.self);
                if (eb.isContentEmpty && eb.url != BlockUrlConstant.Title && !eb.isFreeBlock) {
                    var isLine = eb.isLine;
                    if (endBlock == eb) { endBlock = undefined }
                    await eb.delete()
                    if (isLine) {
                        if (endBlock.isContentEmpty) { await endBlock.delete(); endBlock = undefined }
                    }
                }
            }
            if (startBlock && endBlock && startBlock !== endBlock) {
                focusB = await combineRowBlocks(write, endBlock, startBlock)
            }
        }
        await rowBlocks.eachAsync(async (b) => {
            if (b.isContentEmpty && b.url != BlockUrlConstant.Title && !b.isFreeBlock) await b.delete()
        })
        if (options?.cut) {
            if (deleteText)
                CopyText(deleteText);
        }
        write.kit.page.addActionAfterEvent(async () => {
            forceCloseTextTool()
            if (insertSelection.from != null) {
                write.kit.anchorCursor.onSetTextSelection({
                    startAnchor: insertSelection.anchor,
                    startOffset: insertSelection.from,
                    endAnchor: insertSelection.anchor,
                    endOffset: insertSelection.to
                }, { merge: true, render: true });
            }
            else {
                if (focusB) write.kit.anchorCursor.onFocusBlockAnchor(focusB, { last: true, render: true, merge: true });
                else if (isStartDelete) write.kit.anchorCursor.onFocusAppearAnchor(preAppear, { merge: true, last: true })
                else write.kit.anchorCursor.onFocusAppearAnchor(write.kit.anchorCursor.startAnchor, { merge: true, at: write.kit.anchorCursor.startOffset + (options?.insertContent || '').length });
            }
        })
    });
}


export async function onSpaceInputUrl(write: PageWrite, aa: AppearAnchor, event: React.KeyboardEvent,) {
    if (aa?.isText) {
        var rowBlock = aa.block.closest(x => x.isContentBlock);
        if (rowBlock.url == BlockUrlConstant.Title) return;
        if (!rowBlock.isSupportTextStyle) return;
        var content = aa.textContent;
        var sel = window.getSelection();
        var offset = aa.getCursorOffset(sel.focusNode, sel.focusOffset);
        var pre = content.slice(0, offset);
        var next = content.slice(offset);
        var urlRegex = /https?:\/\/([\d\-a-zA-Z\.]+)(:[\d]+)?([\?\/a-zA-Z\d&\=\-\.]+)? ?/g;
        if (urlRegex.test(pre)) {
            var ma = pre.match(urlRegex);
            var url = ma[0];
            pre = pre.slice(0, 0 - url.length);
            event.preventDefault();
            await InputForceStore(aa, async () => {
                if (aa.block.isLine) {
                    await aa.block.updateProps({ content: pre }, BlockRenderRange.self);
                    var newBlock = await write.kit.page.createBlock(BlockUrlConstant.Text, { content: url, link: { url } }, aa.block.parent, aa.block.at + 1, aa.block.parentKey);
                    if (next) {
                        var nb = await aa.block.cloneData();
                        nb.content = next;
                        aa.block.parent.appendArrayBlockData([nb], aa.block.at + 2, aa.block.parentKey);
                    }
                    if (aa.block.isContentEmpty) await aa.block.delete();
                    aa.block.page.addActionAfterEvent(async () => {
                        write.kit.anchorCursor.onFocusBlockAnchor(newBlock, { merge: true, last: true, render: true })
                    });
                }
                else {
                    await aa.block.updateProps({ content: '' }, BlockRenderRange.self);
                    var bs: any[] = [];
                    if (pre) bs.push({ url: BlockUrlConstant.Text, content: pre });
                    bs.push({ url: BlockUrlConstant.Text, content: url, link: { url } });
                    if (next) bs.push({ url: BlockUrlConstant.Text, content: next });
                    var newBs = await aa.block.appendArrayBlockData(bs, 0, 'childs');
                    var newBlock = newBs.first();
                    if (pre) newBlock = newBs[1];
                    aa.block.page.addActionAfterEvent(async () => {
                        write.kit.anchorCursor.onFocusBlockAnchor(newBlock, { merge: true, last: true, render: true })
                    })
                }
            });
        }
    }
}

