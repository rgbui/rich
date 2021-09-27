import { Page } from "..";
import { KeyboardCode, KeyboardPlate } from "../../common/keys";

export function PageKeys(page: Page, keyboardPlate: KeyboardPlate) {
    keyboardPlate.listener(kt => kt.isCtrl(KeyboardCode.Z), async (event, kt) => {
        event.preventDefault();
        page.snapshoot.onUndo();
    });
    keyboardPlate.listener(kt => kt.isCtrl(KeyboardCode.Y), async (event, kt) => {
        event.preventDefault();
        page.snapshoot.onRedo();
    });
}