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

var GlobalData: Map<string, any> = new Map();
var GlobalDataTime: Map<string, any> = new Map();
export function memoryCopyData(key: string, data: any) {
    GlobalData.set(key, data);
    var d = GlobalDataTime.get(key);
    if (d) {
        clearTimeout(d);
    }
    GlobalDataTime.set(key, setTimeout(() => {
        GlobalData.delete(key);
        GlobalDataTime.delete(key);
    }, 5 * 1000 * 60));
}
export function memoryReadData(key: string) {
    var d = GlobalDataTime.get(key);
    if (d) {
        clearTimeout(d);
        GlobalDataTime.set(key, setTimeout(() => {
            GlobalData.delete(key);
            GlobalDataTime.delete(key);
        }, 5 * 1000 * 60));
    }
    return GlobalData.get(key);
}
