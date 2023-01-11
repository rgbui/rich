/**
 * 
 * parse markdown to html
 * https://github.com/showdownjs/showdown
 * 
 */
import { util } from "../../../util/util";
import { parseHtml } from "../html/parse";

export async function parseMarkdown(file: File) {
    var text = await util.readFileText(file);
    // var converter = new showdown.Converter(),
    // text      = '# hello, markdown!',
    // html      = converter.makeHtml(text);
   var html='';
    var blocks=await  parseHtml(html);
}
