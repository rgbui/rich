import { TextInput } from ".";
import { DomParse } from "../../import/dom.parse";
export class TextInput$Paster {
    async onPaste(this: TextInput, event: ClipboardEvent) {
        event.preventDefault();
        var items: { mine: 'file' | 'html' | 'text', content: string | File }[] = [];
        var files: File[] = Array.from(event.clipboardData.files);
        console.log(event.clipboardData.getData('text/html'), 'html');
        console.log(event.clipboardData.getData('text/plain'), 'plain');
        var html = event.clipboardData.getData('text/html');
        if (html) {
            var ma = html.match(/\<[a-zA-Z\d\-]+[\s\S]*?>/);
            if (ma) {
                items.push({ mine: 'html', content: html });
            }
            else items.push({ mine: 'text', content: html });
        }
        else {
            var text = event.clipboardData.getData('text/plain');
            if (text) {
                items.push({ mine: 'text', content: event.clipboardData.getData('text/plain') });
            }
        }
        if (files.length == 0 && !items.exists(g => g.mine == 'html')) {
            //在当前的位置处复制内容
        }
        else if (files.length == 1) {
            //暂时只遇到只有一个文件的，此时复制的文件有两种来源
            //1. 本地文件的复制（从剪贴版上面） 2. 复制网络上面的图片
            if (items.exists(g => g.mine == 'html')) {
                //这里可以提取上传的文件的网址
            }
            else {
                //这个可能是本地的文件名（貌似在mac上，如果复制多张图片，会有多张图片的名称）

            }
        }
        else {
            // 这里是得复制的网页内容，但也有可能是word
        }
        console.log(files, items);
        if (files.length > 0) {

        }
        else {
            DomParse(items[0].content as string)
            // DomBlock(items[0].content as string);
        }
        //let parser = new DOMParser();
        // doc = parser.parseFromString(stringContainingHTMLSource, "text/html")
    }
}