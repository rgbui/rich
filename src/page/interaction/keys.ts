import { Page } from "..";
import { UA } from "../../../util/ua";
import { KeyboardCode, KeyboardPlate } from "../../common/keys";

export function PageKeys(page: Page, keyboardPlate: KeyboardPlate) {
    keyboardPlate.listener(kt => UA.isMacOs && kt.isMeta(KeyboardCode.Z) || !UA.isMacOs && kt.isCtrl(KeyboardCode.Z), (event, kt) => {
        event.preventDefault();
        page.onUndo();
    }, (event, kt) => {
        event.preventDefault();
    });
    keyboardPlate.listener(kt => UA.isMacOs && kt.isMeta(KeyboardCode.Y) || !UA.isMacOs && kt.isCtrl(KeyboardCode.Y), (event, kt) => {
        event.preventDefault();
        page.onRedo();
    }, (event, kt) => {
        event.preventDefault();
    });
    keyboardPlate.listener(kt => kt.isCtrl(KeyboardCode.S),
        (event, kt) => {
            event.preventDefault();
            page.onSave();
        }, (event, kt) => {
            event.preventDefault();
        }
    );
}