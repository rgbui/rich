/**
 * 
 * parse markdown to html
 * https://github.com/showdownjs/showdown
 * 
 */
import { util } from "../../../util/util";
import { parseHtml } from "../html/parse";
import { marked } from "marked";
export async function parseMarkdown(file: File) {
    var text = await util.readFileText(file);
    // var converter = new showdown.Converter(),
    // text      = '# hello, markdown!',
    // html      = converter.makeHtml(text);
    var html = '';
    var blocks = await parseHtml(html);
}

export async function parseMarkdownContent(md: string) {
    var html = marked.parse(md);
    var blocks = await parseHtml(html);
    return blocks;
}
