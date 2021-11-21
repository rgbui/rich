import { TextInput } from "..";
import { parseDom } from "./dom";
export class TextInput$Paster {
    async onPaste(this: TextInput, event: ClipboardEvent) {
        var files: File[] = Array.from(event.clipboardData.files);
        var text = event.clipboardData.getData('text/plain');
        var html = event.clipboardData.getData('text/html');
        if (!html && text) return;
        event.preventDefault();
        if (files.length > 0) {
            //说明复制的是文件
            await this.page.onPasterFiles(files);
        }
        else if (html) {
            let parser = new DOMParser();
            var doc = parser.parseFromString(html, "text/html");
            var blocks = await parseDom(doc);
            if (blocks.length > 0) {
                await this.page.onPasteCreateBlocks(blocks);
            }
        }
    }
}