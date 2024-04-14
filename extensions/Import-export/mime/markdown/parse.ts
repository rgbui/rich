/**
 * 
 * parse markdown to html
 * https://github.com/showdownjs/showdown
 * 
 */
import { util } from "../../../../util/util";
import { parseHtml } from "../html/parse";
// import { showdown} from "showdown";
import { marked } from "marked";
export async function parseMarkdown(file: File) {
    var text = await util.readFileText(file);
    // var converter = new showdown.Converter(),
    // text      = '# hello, markdown!',
    var html = marked.parse(text);
    var blocks = await parseHtml(html);
    return blocks;
}

export async function parseMarkdownContent(md: string) {
    // var converter = new showdown.Converter();
    // var html = converter.makeHtml(md);

    var html = marked.parse(md);
    // console.log(md, html);
    var blocks = await parseHtml(html);
    return blocks;
}
