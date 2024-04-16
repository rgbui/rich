import React from "react";
import { EventsComponent } from "../../../component/lib/events.component";
import { Icon } from "../../../component/view/icon";
import { S } from "../../../i18n/view";
import { Page } from "../../../src/page";
import { OpenFileDialoug } from "../../../component/file";
import { parseMarkdown } from "../mime/markdown/parse";
import { util } from "../../../util/util";
import { parseHtml } from "../mime/html/parse";
import { parseWord } from "../mime/word/parse";
import { ShyAlert } from "../../../component/lib/alert";
import { lst } from "../../../i18n/store";
import { HelpText } from "../../../component/view/text";

export default class ImportFile extends EventsComponent {
    render() {
        return <div className="bg-white shadow w-350 round padding-10">
            <div className="gap-b-20 flex">
                <span className="flex-auto bold f-16"><S>导入</S></span>
                <div className="flex-fixed ">
                    <HelpText url={window.shyConfig?.isUS ? "https://help.shy.red/page/70#aGKh7nRzM5swwdx5p3oGaa" : "https://help.shy.live/page/1998#2M94eeDY63oS9SsE3BPTVn"}><S>了解数据导入</S></HelpText>
                </div>
            </div>
            <div className="r-round r-flex r-padding-w-10 r-cursor r-item-hover r-padding-h-5 text-1 r-gap-10">
                <div onMouseDown={e => { this.onImport('markdown') }} className=" border shadow-s">
                    <Icon icon={{ name: 'bytedance-icon', code: 'file-txt' }}></Icon><span className="gap-l-5"><S>TXT或Markdown文件</S></span>
                </div>
                <div onMouseDown={e => { this.onImport('html') }} className=" border shadow-s">
                    <Icon icon={{ name: 'bytedance-icon', code: 'source-code' }}></Icon><span className="gap-l-5">HTML</span>
                </div>
                <div onMouseDown={e => { this.onImport('word') }} className=" border shadow-s">
                    <Icon icon={{ name: 'bytedance-icon', code: 'word' }}></Icon><span className="gap-l-5">Word</span>
                </div>
            </div>
            <div className="remark gap-h-10 gap-w-10">
                <S text="仅支持某些文件导入">仅支持.txt,.docx,.md,.html文件导入</S>
            </div>
        </div>
    }
    async onImport(type: 'markdown' | 'html' | 'word') {
        var file = await OpenFileDialoug({ exts: ['.md', ".txt", '.html', '.docx'] });
        if (file) {
            var ext = file.name.split('.').pop();
            ext = '.' + ext.toLowerCase();
            if (ext == '.docx') type = 'word';
            else if (ext == '.html') type = 'html';
            else if (ext == '.md') type = 'markdown';
            else if (ext == '.txt') type = 'markdown';
            else {
                ShyAlert(lst('仅支持某些文件导入'))
                return;
            }
            var blocks: any[] = [];
            if (type == 'markdown') blocks = await parseMarkdown(file);
            else if (type == 'html') {
                var text = await util.readFileText(file);
                blocks = await parseHtml(text);
            }
            else if (type == 'word') {
                blocks = await parseWord(file);
            }
            this.emit('save', { text: file.name.slice(0, file.name.lastIndexOf('.')), blocks });
        }
    }
    onOpen(options?: { page: Page }) {

    }
}

