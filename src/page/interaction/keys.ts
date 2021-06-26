import { Page } from "..";
import { KeyboardCode, KeyboardPlate } from "../../common/keys";

export function PageKeys(page: Page, keyboardPlate: KeyboardPlate) {
    keyboardPlate.listener((kt) => kt.is(KeyboardCode.Backspace, KeyboardCode.Delete), async kt => {
        if (page.kit.explorer.hasSelectionRange)
            page.kit.explorer.onDeleteSelection();
    });
    keyboardPlate.listener(kt => kt.isCtrl(KeyboardCode.Z), async kt => {
        page.snapshoot.onUndo();
    });
    keyboardPlate.listener(kt => kt.isCtrl(KeyboardCode.Y), async kt => {
        page.snapshoot.onRedo();
    });
}