import { List, ListType } from "../../blocks/present/list/list";
import { Block } from "../../src/block";
import { BlockUrlConstant } from "../../src/block/constant";
import { BlockRenderRange } from "../../src/block/enum";
import { BlockCssName } from "../../src/block/pattern/css";
import { DropDirection } from "../../src/kit/handle/direction";
import { Page } from "../../src/page";

/**
 * 按code代码分割
 * @param ts 
 * @returns 
 */
// export function mergeCode(ts: string[]) {
//     var rs: string[] = [];
//     var code = '';
//     var isCode: boolean = false;
//     for (let j = 0; j < ts.length; j++) {
//         var tc = ts[j];
//         if (tc.match(/^```/)) {
//             if (isCode) {
//                 isCode = false;
//                 code += '\n```'
//                 rs.push(code)
//                 code = '';
//             }
//             else {
//                 isCode = true;
//                 code = tc + "\n";
//             }
//         }
//         else {
//             if (isCode) code += ts[j] + (j == ts.length - 1 ? "" : '\n');
//             else rs.push(ts[j])
//         }
//     }
//     if (isCode && code) { rs.push(code); code = ''; }
//     return rs;
// }

export async function onMergeListBlocks(page: Page, bs: Block[]) {
    var rs: { block: Block, childs: Block[] }[] = [];
    var current: { block: Block, childs: Block[] } = null;
    for (let i = 0; i < bs.length; i++) {
        var g = bs[i];
        if (g.url == BlockUrlConstant.List && (g as List).listType == ListType.number) {
            if (current) rs.push(current)
            current = { block: g, childs: [] };
        }
        else if ([BlockUrlConstant.Head, BlockUrlConstant.Divider, BlockUrlConstant.Table].includes(g.url as any)) {
            if (current) current = null;
        }
        else if (current) {
            current.childs.push(g);
        }
    }
    await page.onAction('mergeListBlocks', async () => {
        for (let i = rs.length - 1; i >= 0; i--) {
            var r = rs[i];
            var list = r.block as List;
            var childs = r.childs;
            await list.drop(childs, DropDirection.sub)
        }
    })
}


export async function onBlockPickLine(page: Page, block: Block, isAction?: boolean) {
    if (block.childs.length > 0) return
    if (block['__pick_line'] == true) return;
    block['__pick_line'] = true;
    if ([BlockUrlConstant.TextSpan, BlockUrlConstant.List, BlockUrlConstant.Head].includes(block.url as any)) {
        var cs = block.content;
        var ts: { name: 'bold' | 'italic' | 'line-through' | 'code' | 'text' | 'url', content: string }[] = [];
        for (let i = 0; i < cs.length; i++) {
            var c = cs[i];
            if (c == '*' && cs.slice(i, i + 2) == '**') {
                var r = cs.slice(i).match(/\*\*([^*]+)\*\*/);
                if (r) {
                    ts.push({ name: 'bold', content: r[1] });
                    i += r[0].length - 1;
                    continue;
                }
            }
            else if (c == '*') {
                var r = cs.slice(i).match(/\*([^*]+)\*/);
                if (r) {
                    ts.push({ name: 'italic', content: r[1] });
                    i += r[0].length - 1;
                    continue;
                }
            }
            else if (c == '~') {
                var r = cs.slice(i).match(/~([^~]+)~/);
                if (r) {
                    ts.push({ name: 'line-through', content: r[1] });
                    i += r[0].length - 1;
                    continue;
                }
            }
            else if (c == '`') {
                var r = cs.slice(i).match(/`([^`]+)`/);
                if (r) {
                    ts.push({ name: 'code', content: r[1] });
                    i += r[0].length - 1;
                    continue;
                }
            }
            else if (c == 'h' && cs.slice(i).match(/https?[^ ]+/)) {
                var r = cs.slice(i).match(/https?[^ ]+/);
                if (r) {
                    ts.push({ name: 'url', content: r[0] });
                    i += r[0].length - 1;
                    continue;
                }
            }
            var lt = ts.last();
            if (!lt || lt?.name != 'text') ts.push({ name: 'text', content: c });
            else ts.last().content += c;
        }
        if (ts.length > 0 && ts.some(s => s.name != 'text')) {
            var dos = async () => {
                await block.updateProps({ content: '' },BlockRenderRange.self);
                for (let t of ts) {
                    var font = {
                        textDecoration: t.name == 'line-through' ? 'line-through' : undefined,
                        fontWeight: t.name == 'bold' ? "bold" : undefined,
                        fontStyle: t.name == 'italic' ? 'italic' : undefined
                    }
                    for (let n in font) { if (typeof font[n] == 'undefined') delete font[n] }
                    var pattern: any = undefined;
                    var isCode: boolean = t.name == 'code'
                    if (font && Object.keys(font).length > 0) {
                        pattern = {
                            styles: [{
                                name: 'default',
                                cssList: [
                                    {
                                        "abled": true,
                                        "cssName": BlockCssName.font,
                                        ...font
                                    }
                                ]
                            }]
                        }
                    }
                    await page.createBlock('/text',
                        {
                            content: t.content,
                            pattern,
                            code: isCode ? true : undefined,
                            link: t.name == 'url' ? { url: t.content } : undefined,
                        },
                        block
                    );
                }
            }
            if (isAction) {
                await page.onAction('blockPickLine', async () => {
                    await dos();
                })
            }
            else {
                await dos();
            }
        }
    }
}


export function SplitAiWriteTexts(text: string) {
    var ts: string[] = [];
    var te: string = '';
    for (let i = 0; i < text.length; i++) {
        var t = text[i];
        if ((t == '\n' || t == '\r')) {
            var r = text.slice(i).match(/^[\r\n]+/);
            ts.push(te);
            te = '';
            i += (r[0].length - 1);
            continue;
        }
        else if (t == '`' && text.slice(i).match(/^```([\n\r]*)?/)) {
            var r = text.slice(i).match(/^```[^`]+```([\n\r]*)?/);
            if (r) {
                ts.push(te);
                te = '';
                ts.push(r[0].trim());
                i += r[0].length - 1;
                continue;
            }
            else {
                ts.push(te);
                te = '';
                ts.push(text.slice(i));
                return ts;
            }
        }
        else {
            te = (te || '') + t;
        }
    }
    ts.push(te);
    te = '';
    return ts;
}
