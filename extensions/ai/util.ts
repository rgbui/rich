import { List, ListType } from "../../blocks/present/list/list";
import { Block } from "../../src/block";
import { BlockUrlConstant } from "../../src/block/constant";
import { DropDirection } from "../../src/kit/handle/direction";
import { Page } from "../../src/page";

/**
 * 按code代码分割
 * @param ts 
 * @returns 
 */
export function mergeCode(ts: string[]) {
    var rs: string[] = [];
    var code = '';
    var isCode: boolean = false;
    for (let j = 0; j < ts.length; j++) {
        var tc = ts[j];
        if (tc.match(/^```/)) {
            if (isCode) {
                isCode = false;
                code += '\n```'
                rs.push(code)
                code = '';
            }
            else {
                isCode = true;
                code = tc + "\n";
            }
        }
        else {
            if (isCode) code += ts[j] + (j == ts.length - 1 ? "" : '\n');
            else rs.push(ts[j])
        }
    }
    if (isCode && code) { rs.push(code); code = ''; }
    return rs;
}

export async function onMergeListBlocks(page: Page, bs: Block[]) {
    var rs: { block: Block, childs: Block[] }[] = [];
    var current: { block: Block, childs: Block[] } = null;
    for (let i = 0; i < bs.length; i++) {
        var g = bs[i];
        if (g.url == BlockUrlConstant.List && (g as List).listType == ListType.number) {
            if (current) rs.push(current)
            current = { block: g, childs: [] };
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