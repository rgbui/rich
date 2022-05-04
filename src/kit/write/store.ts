
import { AppearAnchor } from "../../block/appear";
var inputStoreTime;
var inputStore;
export async function InputStore(appear: AppearAnchor, oldValue: string, force: boolean = false, action?: () => Promise<void>) {
    var value = appear.textContent;
    /**
     * 如果值没变，且无操作，那么这里将不做任何的事件保存
     */
    if(value===oldValue&&!action)return;
    if (inputStoreTime) {
        clearTimeout(inputStoreTime);
        inputStoreTime = undefined
    }
    inputStore = async function () {
        try {
            inputStore = undefined;
            appear.block.page.kit.writer.endAnchorText = value;
            await appear.block.onInputText(appear, oldValue, value, action);
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

export async function ForceInputStore() {
    if (inputStoreTime) { clearTimeout(inputStoreTime); inputStoreTime = undefined }
    if (inputStore) { var fn = inputStore; inputStore = undefined; await fn(); }
}