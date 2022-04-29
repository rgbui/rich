import { Kit } from "..";
import { AppearAnchor } from "../../block/appear";
import { parseDom } from "../../import-export/html/parse";

export async function onPaste(kit:Kit,aa: AppearAnchor, event: ClipboardEvent) {
    var files: File[] = Array.from(event.clipboardData.files);
    var text = event.clipboardData.getData('text/plain');
    var html = event.clipboardData.getData('text/html');
    if (!html && text) return;
    var anchor = kit.explorer.activeAnchor;
    /**
     * 不支持文本样式，说明可以粘贴文本内容
     */
    if (kit.explorer.isOnlyAnchor && !anchor.block.isSupportTextStyle && text) {
        return;
    }
    if (files.length > 0) {
        event.preventDefault();
        //说明复制的是文件
        await kit.page.onPasterFiles(files);
    }
    else if (html) {
        var regexText = text.replace(/[\(\)\\\.\[\]\*\?]/g, ($, $1) => {
            return '\\' + $1
        })
        if (html.match(new RegExp('<[^>]+>' + regexText + '</[^>]+>'))) {
            console.log('ggg');
            return;
        }
        event.preventDefault();
        let parser = new DOMParser();
        var doc = parser.parseFromString(html, "text/html");
        // console.log(doc);
        var blocks = await parseDom(doc);
        // console.log(blocks);
        if (blocks?.length > 0) {
            await this.page.onPasteCreateBlocks(blocks);
        }
    }
}

