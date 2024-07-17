import { marked } from "marked";
import { Kit } from "..";
import { TextCode } from "../../../blocks/media/code/code";
import { getImageSize } from "../../../component/file";
import { InputTextPopSelectorType } from "../../../extensions/common/input.pop";
import { useInputUrlSelector } from "../../../extensions/link/url";
import { channel } from "../../../net/channel";
import { Block } from "../../block";
import { AppearAnchor } from "../../block/appear";
import { BlockUrlConstant } from "../../block/constant";
import { Matrix } from "../../common/matrix";
import { Point, Rect } from "../../common/vector/point";
import { ActionDirective } from "../../history/declare";
import { parseHtml } from "../../../extensions/Import-export/mime/html/parse";
import { readCopyBlocks } from "../../page/common/copy";
import { PageLayoutType } from "../../page/declare";
import { isUrl } from "./declare";
import { inputBackspaceDeleteContent } from "./input";
import { InputForceStore } from "./store";
import { util } from "../../../util/util";
import { onEnterInput } from "./keydown";
import { BlockRenderRange } from "../../block/enum";

export async function onPastePage(kit: Kit, event: ClipboardEvent) {
    if (kit.page.pageLayout?.type == PageLayoutType.board) {
        var files: File[] = Array.from(event.clipboardData.files);
        var text = event.clipboardData.getData('text/plain');
        kit.operator.onClearPage();
        event.preventDefault();
        var fra: Block = kit.page.getPageFrame();
        var cfra = kit.page.getBlockByMouseOrPoint(kit.operator.moveEvent);
        if (cfra?.isFreeBlock) {
            var c = cfra.frameBlock;
            if (c) {
                if (c.url == BlockUrlConstant.Frame) fra = c;
            }
        }
        await onPasterToBoard({ kit, fra, text, files });
    }
    else if ([PageLayoutType.doc, PageLayoutType.ppt].includes(kit.page.pageLayout.type)) {
        if (kit.anchorCursor.currentSelectHandleBlocks.length > 0) {
            var text = event.clipboardData.getData('text/plain');
            var files: File[] = Array.from(event.clipboardData.files);
            var html = event.clipboardData.getData('text/html');
            var bs: any[] = [];
            if (!html && text || text && html && html.endsWith(text)) {
                bs.push({ url: BlockUrlConstant.TextSpan, content: text })
            }
            else if (files.length > 0) {
                for (let i = 0; i < files.length; i++) {
                    var file = files[i];
                    if (file.type.startsWith('image/')) {
                        bs.push({
                            url: '/image',
                            initialData: { file }
                        })
                    }
                    else if (file.type.startsWith('video/')) {
                        bs.push({
                            url: '/video',
                            initialData: { file }
                        })
                    }
                    else if (file.type.startsWith('audio/')) {
                        bs.push({
                            url: '/audio',
                            initialData: { file }
                        })
                    }
                    else {
                        bs.push({
                            url: '/file',
                            initialData: { file }
                        })
                    }
                }
            }
            else {
                var ma;
                if (ma = html.match(new RegExp(`data\\-name\="shy\\.live"[\\s]+content\\="([^"]+)"`))) {
                    var id = ma[1];
                    if (id) {
                        var rs = readCopyBlocks(id);
                        /**
                         * 这里的bs有可能是从诗云的一个浏览器复制到另一个浏览器，
                         * 本质上里面的内容没有缓存
                         */
                        if (Array.isArray(rs) && rs.length > 0) {
                            event.preventDefault();
                            bs = rs;
                        }
                    }
                }
                console.log('like html...');
                event.preventDefault();
                var mr: RegExp;
                try {
                    mr = new RegExp('([\\s]*<[^>]+>[\\s]*)?<[^>]+>' + util.escapeRegex(text) + '</[^>]+>')
                }
                catch (ex) {
                    mr = null;
                }
                if (mr && html.indexOf(text) > -1 && html.match(mr)) {
                    console.log('html---text');
                    /**
                     * 这里表示当前的文本就仅仅在外面包一层html，没有多个块
                     * 列如:
                     * text: 你好
                     * html: <p>你好</p>
                     */
                    bs.push({ url: BlockUrlConstant.TextSpan, content: text })
                }
                else {
                    var blocks = parseHtml(html);
                    bs = blocks;
                }
            }
            kit.page.onReplace(kit.anchorCursor.currentSelectHandleBlocks, bs);
        }
        else {
            if (kit.operator.moveEvent) {
                var fra = kit.page.getBlockByMouseOrPoint(kit.operator.moveEvent);
                if (fra) {
                    if (fra.isFreeBlock) {
                        var c = fra.frameBlock;
                        if (c) {
                            fra = c;
                        }
                    }
                    var text = event.clipboardData.getData('text/plain');
                    var files: File[] = Array.from(event.clipboardData.files);
                    if (fra.url == BlockUrlConstant.CardBox || fra.url == BlockUrlConstant.Frame || fra.url == BlockUrlConstant.Board) {
                        event.preventDefault();
                        await onPasterToBoard({ kit, fra, text, files });
                    }
                }
            }
        }
    }
    else if ([PageLayoutType.textChannel].includes(kit.page.pageLayout.type)) {

    }
    else {

    }
}

export async function onPasteAppear(kit: Kit, aa: AppearAnchor, event: ClipboardEvent) {
    event.stopPropagation();
    var text = event.clipboardData.getData('text/plain');
    if (aa.plain == true) {
        event.preventDefault();
        await onPasteInsertPlainText(kit, aa, text);
    }
    else {
        text = text.trim();
        var block = aa.block.closest(x => x.isContentBlock);
        if (block.isFreeBlock) {
            event.preventDefault();
            var isEmpty = block.isContentEmpty;
            await onPasteInsertPlainText(kit, aa, text, async () => {
                if (isEmpty) {
                    await block.updateProps({ fixedWidth: 200 }, BlockRenderRange.self);
                }
            });
        }
        else {
            var files: File[] = Array.from(event.clipboardData.files);
            var html = event.clipboardData.getData('text/html');
            kit.operator.onClearPage();
            if (window.shyConfig?.isDev) {
                console.log('paste', text, html, files)
            }
            if (!html && text || text && html && html.endsWith(text)) {
                console.log('paste text');
                event.preventDefault();
                if (isUrl(text)) {
                    await onPasteUrl(kit, aa, text);
                }
                else {
                    if (!html && text.indexOf('\n') > -1) {
                        try {
                            html = marked.parse(text);
                            if (html == text) {
                                await onPasteInsertText(kit, aa, text);
                                return;
                            }
                        }
                        catch (ex) {
                            aa.block.page.onError(ex);
                            console.error(ex);
                            await onPasteInsertText(kit, aa, text);
                            return;
                        }
                    }
                    else {
                        await onPasteInsertText(kit, aa, text);
                        return;
                    }
                }
            }
            if (files.length > 0) {
                event.preventDefault();
                //说明复制的是文件
                await onPasterFiles(kit, aa, files);
            }
            else if (html) {
                var ma;
                if (ma = html.match(new RegExp(`data\\-name\="shy\\.live"[\\s]+content\\="([^"]+)"`))) {
                    var id = ma[1];
                    if (id) {
                        var bs = readCopyBlocks(id);
                        /**
                         * 这里的bs有可能是从诗云的一个浏览器复制到另一个浏览器，
                         * 本质上里面的内容没有缓存
                         */
                        if (Array.isArray(bs) && bs.length > 0) {
                            event.preventDefault();
                            await onPasteCreateBlocks(kit, aa, bs);
                            return;
                        }
                    }
                }
                try {
                    console.log('like html...');
                    event.preventDefault();
                    if (aa.block.url == BlockUrlConstant.Code) {
                        await onPasteInsertText(kit, aa, text);
                        return;
                    }
                    if (!aa.block.isSupportTextStyle) {
                        console.log(' not support text style')
                        await onPasteInsertPlainText(kit, aa, text);
                        return;
                    }
                    var mr: RegExp;
                    try {
                        mr = new RegExp('([\\s]*<[^>]+>[\\s]*)?<[^>]+>' + util.escapeRegex(text) + '</[^>]+>')
                    }
                    catch (ex) {
                        mr = null;
                    }
                    if (mr && html.indexOf(text) > -1 && html.match(mr)) {
                        console.log('html---text');
                        /**
                         * 这里表示当前的文本就仅仅在外面包一层html，没有多个块
                         * 列如:
                         * text: 你好
                         * html: <p>你好</p>
                         */
                        if (isUrl(text)) {
                            await onPasteUrl(kit, aa, text);
                        }
                        else {
                            await onPasteInsertText(kit, aa, text);
                        }
                        return;
                    }
                    var blocks = parseHtml(html);
                    if (window.shyConfig?.isDev) {
                        console.log('paster html....', html, blocks)
                    }
                    if (blocks?.length > 0) {
                        if (blocks.length == 1 && blocks[0].url == BlockUrlConstant.TextSpan) {
                            var cs = blocks[0].blocks.childs
                            if (cs.length == 1 && cs[0].url == BlockUrlConstant.Text) {
                                var content = cs[0].content;
                                if (isUrl(content)) await onPasteUrl(kit, aa, text)
                                else await onPasteInsertText(kit, aa, text);
                                return;
                            }
                        }
                        await onPasteCreateBlocks(kit, aa, blocks);
                    }
                }
                catch (ex) {
                    console.error(ex);
                    await onPasteInsertText(kit, aa, text);
                }
            }
        }
    }
}
async function onPasterFiles(kit: Kit, aa: AppearAnchor, files: File[]) {
    var bs: any[] = [];
    for (let i = 0; i < files.length; i++) {
        var file = files[i];
        if (file.type.startsWith('image/')) {
            bs.push({
                url: '/image',
                initialData: { file }
            })
        }
        else if (file.type.startsWith('video/')) {
            bs.push({
                url: '/video',
                initialData: { file }
            })
        }
        else if (file.type.startsWith('audio/')) {
            bs.push({
                url: '/audio',
                initialData: { file }
            })
        }
        else {
            bs.push({
                url: '/file',
                initialData: { file }
            })
        }
    }
    if (bs.length > 0)
        await onPasteCreateBlocks(kit, aa, bs);
}
async function onPasteCreateBlocks(kit: Kit, aa: AppearAnchor, blocks: any[]) {
    if (blocks.length == 0) return;
    var sel = window.getSelection();
    if (sel.collapse) {
        await onEnterInput(kit.writer, aa, null, { insertBlocks: blocks });
    }
    else if (kit.anchorCursor.currentSelectedBlocks.length > 0) {
        await kit.page.onBatchDelete(kit.anchorCursor.currentSelectedBlocks, async () => {
            var cs = kit.anchorCursor.currentSelectedBlocks.first();
            await cs.parent.appendArrayBlockData(blocks, cs.at, cs.parentKey);
        });
    }
    else {
        await inputBackspaceDeleteContent(kit.writer, aa, null, { insertBlocks: blocks })
    }
    // await InputForceStore(aa, async () => {
    //     /**
    //      * 这说明只有一行，那么在当前的位置插入它
    //      */
    //     if (blocks.length == 1 && blocks[0].url == BlockUrlConstant.TextSpan) {
    //         var content = aa.textContent;
    //         var offset = sel.focusOffset;
    //         var rowBlock = aa.block.closest(x => x.isContentBlock);
    //         var beforeText = content.slice(0, offset);
    //         var lastText = content.slice(offset);
    //         if (rowBlock.childs.length == 0) {
    //             await rowBlock.updateProps({ content: '' }, BlockRenderRange.self);
    //             if (beforeText) await rowBlock.appendBlock({ url: BlockUrlConstant.Text, content: beforeText });
    //             var bs = blocks[0].blocks.childs;
    //             var rs = await rowBlock.appendArrayBlockData(bs, undefined, BlockChildKey.childs);
    //             if (lastText) await rowBlock.appendBlock({ url: BlockUrlConstant.Text, content: lastText });
    //             kit.page.addActionAfterEvent(async () => {
    //                 kit.anchorCursor.onFocusBlockAnchor(rs.last(), { last: true, render: true, merge: true });
    //             })
    //         }
    //         else {
    //             await aa.block.updateProps({ content: beforeText }, BlockRenderRange.self);
    //             var bs = blocks[0].blocks.childs;
    //             var rs = await aa.block.parent.appendArrayBlockData(bs, aa.block.at, BlockChildKey.childs);
    //             if (lastText) await aa.block.parent.appendBlock({
    //                 url: BlockUrlConstant.Text,
    //                 pattern: await aa.block.pattern.cloneData(),
    //                 content: lastText
    //             });
    //             if (aa.block.isContentEmpty) await aa.block.delete();
    //             kit.page.addActionAfterEvent(async () => {
    //                 kit.anchorCursor.onFocusBlockAnchor(rs.last(), { last: true, render: true, merge: true });
    //             })
    //         }
    //     }
    //     else {
    //         var rowBlock = aa.block.closest(x => x.isContentBlock);
    //         var firstBlock = rowBlock;
    //         if (firstBlock.isContentEmpty) {
    //             blocks[0].url = firstBlock.url;
    //         }
    //         var rs: Block[] = [];
    //         for (let i = 0; i < blocks.length; i++) {
    //             var bd = blocks[i];
    //             rowBlock = await rowBlock.visibleDownCreateBlock(bd.url, bd);
    //             rs.push(rowBlock);
    //         }
    //         if (firstBlock.isContentEmpty) {
    //             await firstBlock.delete();
    //         }
    //         kit.page.addActionAfterEvent(async () => {
    //             kit.anchorCursor.onSelectBlocks(rs, { render: true, merge: true });
    //             // kit.anchorCursor.onFocusBlockAnchor(rowBlock, { last: true, render: true, merge: true });
    //         })
    //     }
    // })
}
async function onPasteInsertText(kit: Kit, aa: AppearAnchor, text: string) {
    if (aa.isSolid) {
        kit.writer.onSolidInputCreateTextBlock(aa, undefined, text);
    }
    else if ((aa.isText && aa.block.isLine && !(aa.block.isTextContent && aa.block.asTextContent.isBlankPlain) && !aa.block.next)) {
        kit.writer.onRowLastLineBlockCreateTextBlock(aa, undefined, text);
        return;
    }
    else {
        var content = aa.textContent;
        var sel = window.getSelection();
        if (sel.isCollapsed) {
            var offset = aa.getCursorOffset(sel.focusNode, sel.focusOffset);
            aa.setContent(content.slice(0, offset) + text + content.slice(offset))
            aa.collapse(offset + text.length);
            await InputForceStore(aa, async () => {
                kit.page.addActionCompletedEvent(async () => {
                    if (aa.block.url == BlockUrlConstant.Code) {
                        (aa.block as TextCode).renderCode()
                    }
                })
            })
        }
        else {
            await inputBackspaceDeleteContent(kit.writer, aa, null, { insertContent: text })
        }
    }
}
async function onPasteInsertPlainText(kit: Kit, aa: AppearAnchor, text: string, cb?: () => Promise<void>) {
    var content = aa.textContent;
    var sel = window.getSelection();
    if (aa.block.url == BlockUrlConstant.Title) {
        var t = text.indexOf('\n');
        if (t > -1) {
            text = text.slice(0, t);
        }
        if (text.length > 80) {
            text = text.slice(0, 80);
        }
    }
    if (sel.isCollapsed) {
        var offset = aa.getCursorOffset(sel.focusNode, sel.focusOffset);
        aa.setContent(content.slice(0, offset) + text + content.slice(offset))
        aa.collapse(offset + text.length);
        await InputForceStore(aa, async () => {
            if (cb) await cb();
        })
    }
    else {
        var s = aa.getCursorOffset(sel.focusNode, sel.focusOffset);
        var e = aa.getCursorOffset(sel.anchorNode, sel.anchorOffset);
        if (s > e) [e, s] = [s, e];
        aa.setContent(content.slice(0, s) + text + content.slice(e));
        aa.collapse(s + text.length);
        await InputForceStore(aa, async () => {
            if (cb) await cb();
        })
    }
}
async function onPasteUrl(kit: Kit, aa: AppearAnchor, url: string) {
    if (aa.isSolid) {
        await kit.page.onAction(ActionDirective.onSolidBlockInputTextContent, async () => {
            // var text = aa.solidContentEl.innerText;
            aa.solidContentEl.innerHTML = '';
            var c = url;
            var newBlock = await aa.block.parent.appendBlock({
                url: BlockUrlConstant.Text,
                content: c
            },
                aa.block.at + 1,
                aa.block.parentKey
            );
            kit.page.addActionAfterEvent(async () => {
                kit.anchorCursor.onFocusBlockAnchor(newBlock, { last: true, render: true, merge: true });
                var sel = window.getSelection();
                var rect = Rect.fromEle(util.getSafeSelRange(sel));
                kit.writer.inputPop = {
                    rect,
                    type: InputTextPopSelectorType.UrlSelector,
                    offset: 0,
                    aa: newBlock.appearAnchors.first(),
                    selector: (await useInputUrlSelector())
                };
                await kit.writer.inputPop.selector.open(rect, url, (...data) => {
                    kit.writer.onInputPopCreateBlock(...data);
                }, kit.page);
            });
        });
    }
    else {
        var content = aa.textContent;
        var sel = window.getSelection();
        var offset = aa.getCursorOffset(sel.focusNode, sel.focusOffset);
        aa.setContent(content.slice(0, offset) + url + content.slice(offset));
        aa.collapse(offset + url.length);
        var rect = Rect.fromEle(util.getSafeSelRange(sel));
        kit.writer.inputPop = {
            rect,
            type: InputTextPopSelectorType.UrlSelector,
            offset: offset,
            aa,
            selector: (await useInputUrlSelector())
        };
        await kit.writer.inputPop.selector.open(rect, url, (...data) => {
            kit.writer.onInputPopCreateBlock(...data);
        }, kit.page);
    }
}

async function onPasterToBoard(options: { kit: Kit, fra: Block, text?: string, files?: File[] }) {
    var { kit, fra, text, files } = options;
    var gm = fra.globalWindowMatrix;
    var re = gm.inverseTransform(Point.from(kit.operator.moveEvent));
    if (text) {
        await kit.page.onAction('onClipboardText', async () => {
            var mat = new Matrix();
            mat.translate(re.x, re.y);
            var data: Record<string, any> = {};
            data.content = text;
            data.matrix = mat.getValues();
            data.fixedWidth = 200;
            var newBlock = await kit.page.createBlock(BlockUrlConstant.TextSpan, data, fra);
            newBlock.mounted(async () => {
                await kit.picker.onPicker([newBlock], { merge: true });
                await kit.anchorCursor.onFocusBlockAnchor(newBlock, { render: true, last: true, merge: true });
            })
        })
    }
    else if (files.length > 0) {
        for (let i = 0; i < files.length; i++) {
            var file = files[i];
            if (file.type.startsWith('image/')) {
                //图片
                var r = await channel.post('/ws/upload/file', {
                    file,
                    uploadProgress: (event) => {
                        // console.log(event, 'ev');
                        if (event.lengthComputable) {
                            // this.progress = `${util.byteToString(event.total)}${(100 * event.loaded / event.total).toFixed(2)}%`;
                            // this.forceUpdate();
                        }
                    }
                })
                if (r.ok) {
                    if (r.data?.file?.url) {
                        var size = await getImageSize(r.data.file.url);
                        var url = BlockUrlConstant.BoardImage;
                        var width = Math.min(size.width, 300);
                        var height = (width / size.width) * size.height;
                        var data = {
                            originSize: size,
                            fixedWidth: width,
                            fixedHeight: height,
                            src: { name: 'upload', ...r.data.file }
                        } as any
                        await kit.page.onAction('onClipboardImage', async () => {
                            var mat = new Matrix();
                            mat.translate(re.x, re.y);
                            data.matrix = mat.getValues();
                            var newBlock = await kit.page.createBlock(url, data, fra);
                            kit.boardSelector.clearSelector();
                            newBlock.mounted(async () => {
                                await kit.picker.onPicker([newBlock], { merge: true });
                                // await kit.anchorCursor.onFocusBlockAnchor(newBlock, { render: true, merge: true });
                            })
                        });
                        // this.props.change(r.data?.file as any);
                    }
                }
            }
        }
    }
}

