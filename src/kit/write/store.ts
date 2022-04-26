
import { Block } from "../../block";
import { AppearAnchor } from "../../block/appear";
var inputStoreTime;
var inputStore;
export async function InputStore(appear: AppearAnchor, value: string, oldValue: string, force: boolean = false, action?: () => Promise<void>) {
    if (inputStoreTime) { clearTimeout(inputStoreTime); inputStoreTime = undefined }
    inputStore = async function () {
        inputStore = undefined;
        try {
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
    },7e2);
}