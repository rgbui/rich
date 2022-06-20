import { Kit } from "..";
import { InputTextPopSelectorType } from "../../../extensions/common/input.pop";
import { useInputUrlSelector } from "../../../extensions/url";
import { AppearAnchor } from "../../block/appear";
import { BlockUrlConstant } from "../../block/constant";
import { Rect } from "../../common/vector/point";
import { parseDom } from "../../import-export/html/parse";
import { inputPopCallback } from "./input";
import { InputForceStore } from "./store";
const URL_RGEX = /(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?/ig;
export async function onPaste(kit: Kit, aa: AppearAnchor, event: ClipboardEvent) {
    var files: File[] = Array.from(event.clipboardData.files);
    var text = event.clipboardData.getData('text/plain');
    var html = event.clipboardData.getData('text/html');
    if (!html && text) {
        event.preventDefault();
        if (URL_RGEX.test(text)) {
            await onPasteUrl(kit, aa, text);
        }
        else await onPasteInsertText(kit, aa, text);
        return;
    }
    if (files.length > 0) {
        event.preventDefault();
        //说明复制的是文件
        await onPasterFiles(kit, aa, files);
    }
    else if (html) {
        try {
            event.preventDefault();
            if (aa.block.url == BlockUrlConstant.Code) {
                await onPasteInsertText(kit, aa, text);
                return;
            }
            var regexText = text.replace(/[\(\)\\\.\[\]\*\?]/g, ($, $1) => {
                return '\\' + $
            })
            if (html.match(new RegExp('([\s]*<[^>]+>[\s]*)?<[^>]+>' + regexText + '</[^>]+>'))) {
                /**
                 * 这里表示当前的文本就仅仅在外面包一层html，没有多个块
                 * 列如:
                 * text: 你好
                 * html: <p>你好</p>
                 */
                if (URL_RGEX.test(text)) {
                    await onPasteUrl(kit, aa, text);
                }
                else {
                    await onPasteInsertText(kit, aa, text);
                }
                return;
            }
            let parser = new DOMParser();
            var doc = parser.parseFromString(html, "text/html");
            var blocks = await parseDom(doc);
            if (blocks?.length > 0) {
                await onPasteCreateBlocks(kit, aa, blocks);
            }
        }
        catch (ex) {
            console.error(ex);
        }
    }
}
async function onPasterFiles(kit: Kit, aa: AppearAnchor, files: File[]) {
    await InputForceStore(aa, async () => {
        var rowBlock = aa.block.closest(x => !x.isLine);
        var firstBlock = rowBlock;
        for (let i = 0; i < files.length; i++) {
            var file = files[i];
            if (file.type == 'image/png') {
                //图片
                rowBlock = await rowBlock.visibleDownCreateBlock('/image', { initialData: { file } });
            }
            else {
                rowBlock = await rowBlock.visibleDownCreateBlock('/file', { initialData: { file } });
            }
        }
        if (firstBlock.isContentEmpty) {
            await firstBlock.delete();
        }
        kit.page.addUpdateEvent(async () => {

        })
    })
}
async function onPasteCreateBlocks(kit: Kit, aa: AppearAnchor, blocks: any[]) {
    if (blocks.length == 0) return;
    var sel = window.getSelection();
    await InputForceStore(aa, async () => {
        /**
         * 这说明只有一行，那么在当前的位置插入它
         */
        if (blocks.length == 1 && blocks[0].url == BlockUrlConstant.TextSpan) {
            var content = aa.textContent;
            var offset = sel.focusOffset;
            var rowBlock = aa.block.closest(x => !x.isLine);
            var beforeText = content.slice(0, offset);
            var lastText = content.slice(offset);
            if (rowBlock.childs.length == 0) {
                await rowBlock.updateProps({ content: '' });
                if (beforeText) await rowBlock.appendBlock({ url: BlockUrlConstant.Text, content: beforeText });
                var bs = blocks[0].blocks.childs;
                var rs = await rowBlock.appendArrayBlockData(bs, undefined, 'childs');
                if (lastText) await rowBlock.appendBlock({ url: BlockUrlConstant.Text, content: lastText });
                kit.page.addUpdateEvent(async () => {
                    kit.writer.onFocusBlockAnchor(rs.last(), { last: true });
                })
            }
            else {
                await aa.block.updateProps({ content: beforeText });
                var bs = blocks[0].blocks.childs;
                var rs = await aa.block.parent.appendArrayBlockData(bs, aa.block.at, 'childs');
                if (lastText) await aa.block.parent.appendBlock({
                    url: BlockUrlConstant.Text,
                    pattern: await aa.block.pattern.cloneData(),
                    content: lastText
                });
                if (aa.block.isContentEmpty) await aa.block.delete();
                kit.page.addUpdateEvent(async () => {
                    kit.writer.onFocusBlockAnchor(rs.last(), { last: true });
                })
            }
        }
        else {
            var rowBlock = aa.block.closest(x => !x.isLine);
            var firstBlock = rowBlock;
            if (firstBlock.isContentEmpty) {
                blocks[0].url = firstBlock.url;
            }
            for (let i = 0; i < blocks.length; i++) {
                var bd = blocks[i];
                rowBlock = await rowBlock.visibleDownCreateBlock(bd.url, bd);
            }
            if (firstBlock.isContentEmpty) {
                await firstBlock.delete();
            }
            kit.page.addUpdateEvent(async () => {
                kit.writer.onFocusBlockAnchor(rowBlock, { last: true });
            })
        }
    })
}
async function onPasteInsertText(kit: Kit, aa: AppearAnchor, text: string) {
    var content = aa.textContent;
    var sel = window.getSelection();
    var offset = aa.getCursorOffset(sel.focusNode, sel.focusOffset);
    aa.setContent(content.slice(0, offset) + text + content.slice(offset))
    aa.collapse(offset + text.length);
    await InputForceStore(aa, async () => { })
}
async function onPasteUrl(kit: Kit, aa: AppearAnchor, url: string) {
    var content = aa.textContent;
    var sel = window.getSelection();
    var offset = aa.getCursorOffset(sel.focusNode, sel.focusOffset);
    aa.setContent(content.slice(0, offset) + url + content.slice(offset));
    aa.collapse(offset + url.length);
    var rect = Rect.fromEle(sel.getRangeAt(0));
    kit.writer.inputPop = {
        rect,
        type: InputTextPopSelectorType.UrlSelector,
        offset: offset - url.length,
        aa,
        selector: (await useInputUrlSelector())
    };
    await kit.writer.inputPop.selector.open(rect, url, (...data) => {
        inputPopCallback(kit.writer, ...data);
    });
    //await InputForceStore(aa, async () => { })
}

