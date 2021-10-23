import { Page } from "..";
import { ListTextView } from "../../../blocks/present/list/list.sub.panel";
import { UA } from "../../../util/ua";
import { KeyboardCode, KeyboardPlate } from "../../common/keys";

export function PageKeys(page: Page, keyboardPlate: KeyboardPlate) {
    keyboardPlate.listener(kt => UA.isMacOs && kt.isMeta(KeyboardCode.Z) || !UA.isMacOs && kt.isCtrl(KeyboardCode.Z), (event, kt) => {
        event.preventDefault();
        page.snapshoot.onUndo();
    });
    keyboardPlate.listener(kt => UA.isMacOs && kt.isMeta(KeyboardCode.Y) || !UA.isMacOs && kt.isCtrl(KeyboardCode.Y), (event, kt) => {
        event.preventDefault();
        page.snapshoot.onRedo();
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