import { WriteClipboardHtml } from "../../../component/copy";
import { util } from "../../../util/util";
import { Block } from "../../block";
var GlobalBlocks: Map<string, any> = new Map();
var lastId: string;
export async function storeCopyBlocks(blocks: Block[]) {
    var bs = await blocks.asyncMap(async b => b.cloneData());
    if (lastId) GlobalBlocks.delete(lastId);
    var id = util.guid();
    GlobalBlocks.set(id, bs);
    lastId = id;
    var html = `<div data-name='shy.live' content='${id}'>${(await blocks.asyncMap(async b => await b.getHtml())).join('')}</div>`;
    await WriteClipboardHtml(html);
}
export function readCopyBlocks(id: string) {
    return GlobalBlocks.get(id);
}