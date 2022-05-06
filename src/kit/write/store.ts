
import { AppearAnchor } from "../../block/appear";
var inputStoreTime;
var inputStore;
/***
 * 马上保存
 */
export async function InputForceStore(appear: AppearAnchor, action?: () => Promise<void>) {
    await InputStore(appear, true, action);
}
/**
 * 延迟保存，大概在700ms，如果比较短，则会一直不保存
 * @param appear 
 * @param force 
 * @param action 
 * @returns 
 */
export async function InputStore(appear: AppearAnchor, force: boolean = false, action?: () => Promise<void>) {
    var value = appear.textContent;
    var oldValue = appear.block.page.kit.writer.endAnchorText;
    var offset = (window.getSelection()).focusOffset;
    var oldOffset = appear.block.page.kit.writer.endOffset;
    /**
     * 如果值没变，且无操作，那么这里将不做任何的事件保存
     */
    if (value === oldValue && !action) return;
    if (inputStoreTime) {
        clearTimeout(inputStoreTime);
        inputStoreTime = undefined
    }
    // console.log('current', value, offset);
    inputStore = async function () {
        try {
            inputStore = undefined;
            appear.block.page.kit.writer.endAnchorText = value;
            appear.block.page.kit.writer.endOffset = offset;
            // console.log('will', value, offset, oldOffset, oldValue);
            await appear.block.onInputText({
                appear,
                oldValue,
                newValue: value,
                oldOffset: oldOffset,
                newOffset: offset,
                action
            });
        }
        catch (ex) {
            console.error(ex);
        }
        finally {
        }
    }
    if (force == true) await inputStore()
    else inputStoreTime = setTimeout(async () => {
        if (inputStore) await inputStore()
    }, 7e2);
}

/**
 * 主动保存
 */
export async function AutoInputStore() {
    if (inputStoreTime) { clearTimeout(inputStoreTime); inputStoreTime = undefined }
    if (inputStore) { var fn = inputStore; inputStore = undefined; await fn(); }
}