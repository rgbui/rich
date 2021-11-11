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
            for (let i = 0; i < files.length; i++) {
                var file = files[i];
                if (file.type == 'image/png') {
                    // var newBlock = await this.onBlockSelectorInsert({ url: '/image', initialData: { file: file } }, undefined);
                }
            }
        }
        else if (html) {
            let parser = new DOMParser();
            var doc = parser.parseFromString(html, "text/html");
            var blocks = await parseDom(doc);
            if (blocks.length > 0) {
                console.log(blocks,html);
                var anchor = this.explorer.activeAnchor;
                await this.page.onPasteCreateBlocks(anchor, blocks);
            }
        }
    }
}