import { Block } from "../../block";
import { AppearAnchor } from "../../block/appear";
var inputStoreTime;
var inputStore;
export async function InputStore(block: Block, appear: AppearAnchor, value: string, at: number, force: boolean = false, action?: () => Promise<void>) {
    if (inputStoreTime) { clearTimeout(inputStoreTime); inputStoreTime = undefined }
    inputStore = async function () {
        await block.onInputStore(appear, value, at, value ? at + value.length : at, action)
    }
    if (force == true) await await inputStore()
    else inputStoreTime = setTimeout(async () => {
        if (inputStore) await inputStore()
    }, 7e2);
}
var inputDeleteStoreTime;
var inputDeleteStore;
var lastDeleteText: string = '';
export async function InputDeleteStore(block: Block, appear: AppearAnchor, from: number, text: string, force: boolean = false, action?: () => Promise<void>) {
    if (inputDeleteStoreTime) { clearTimeout(inputDeleteStoreTime); inputDeleteStoreTime = undefined }
    inputDeleteStore = async function () {
        var size = lastDeleteText ? lastDeleteText.length : 0;
        lastDeleteText = text;
        await block.onInputDeleteStore(appear, text.slice(0, text.length - size), from - size, from - text.length, action)
    }
    if (force == true) await await inputDeleteStore()
    else inputDeleteStoreTime = setTimeout(async () => {
        if (inputDeleteStore) await inputDeleteStore()
    }, 7e2);
}
/**
 * 立即执行存储,
 * 正常输入的时候可能会在700ms后触发，但有时候需要提前触发保存（确保是一定能保存住的）
 */
export async function ForceStore() {
    if (inputStoreTime) { clearTimeout(inputStoreTime); inputStoreTime = undefined }
    if (inputStore) { await inputStore(); inputStore = undefined; }
    if (inputDeleteStoreTime) { clearTimeout(inputDeleteStoreTime); inputDeleteStoreTime = undefined }
    if (inputDeleteStore) { await inputDeleteStore(); inputDeleteStore = undefined; }
}
export async function ForceInputStore() {
    if (inputStoreTime) { clearTimeout(inputStoreTime); inputStoreTime = undefined }
    if (inputStore) { await inputStore(); inputStore = undefined; }
}
export function ClearInputStore() {
    if (inputStoreTime) { clearTimeout(inputStoreTime); inputStoreTime = undefined }
    if (inputStore) inputStore = undefined;
    if (inputDeleteStoreTime) { clearTimeout(inputDeleteStoreTime); inputDeleteStoreTime = undefined }
    if (inputDeleteStore) inputDeleteStore = undefined;
    lastDeleteText = '';
}
