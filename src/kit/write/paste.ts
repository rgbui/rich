import { Kit } from "..";
import { InputTextPopSelectorType } from "../../../extensions/common/input.pop";
import { useInputUrlSelector } from "../../../extensions/url";
import { AppearAnchor } from "../../block/appear";
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
            var regexText = text.replace(/[\(\)\\\.\[\]\*\?]/g, ($, $1) => {
                return '\\' + $1
            })
            if (html.match(new RegExp('<[^>]+>' + regexText + '</[^>]+>'))) {
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
    await InputForceStore(aa, async () => {
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
    })
}
async function onPasteInsertText(kit: Kit, aa: AppearAnchor, text: string) {
    var content = aa.textContent;
    var sel = window.getSelection();
    var offset = sel.focusOffset;
    var newContent = content.slice(0, offset) + text + content.slice(offset);
    aa.textNode.textContent = newContent;
    sel.collapse(aa.textNode, offset + text.length);
    await InputForceStore(aa, async () => { })
}
async function onPasteUrl(kit: Kit, aa: AppearAnchor, url: string) {
    var content = aa.textContent;
    var sel = window.getSelection();
    var offset = sel.focusOffset;
    var newContent = content.slice(0, offset) + url + content.slice(offset);
    aa.textNode.textContent = newContent;
    sel.collapse(aa.textNode, offset + url.length);
    var rect = Rect.fromEle(sel.getRangeAt(0));
    kit.writer.inputPop = {
        rect,
        type: InputTextPopSelectorType.UrlSelector,
        offset: offset - 1,
        aa,
        selector: (await useInputUrlSelector())
    };
    await kit.writer.inputPop.selector.open(rect, url, (...data) => {
        inputPopCallback(kit.writer, ...data);
    });
    //await InputForceStore(aa, async () => { })
}

