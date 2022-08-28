import { Page } from "..";
import { UA } from "../../../util/ua";
import { Block } from "../../block";
import { KeyboardCode, KeyboardPlate } from "../../common/keys";

export function PageKeys(page: Page, keyboardPlate: KeyboardPlate) {
    keyboardPlate.listener(kt => UA.isMacOs && kt.isMeta(KeyboardCode.Z) || !UA.isMacOs && kt.isCtrl(KeyboardCode.Z), (event, kt) => {
        page.onUndo();
    });
    keyboardPlate.listener(kt => UA.isMacOs && kt.isMeta(KeyboardCode.Y) || !UA.isMacOs && kt.isCtrl(KeyboardCode.Y), (event, kt) => {
        page.onRedo();
    });
    keyboardPlate.listener(kt => kt.isCtrl(KeyboardCode.S) || UA.isMacOs && kt.isMeta(KeyboardCode.S),
        (event, kt) => {
            event.preventDefault()
            page.onSave();
        }
    );
    keyboardPlate.listener(kt => UA.isMacOs && kt.is(KeyboardCode.Backspace) || !UA.isMacOs && kt.is(KeyboardCode.Delete),
        (event, kt) => {
            if (page.kit.cursor.currentSelectedBlocks.length > 0) {
                var ds: Block[] = [];
                var cs = page.kit.cursor.currentSelectedBlocks.map(c => c.handleBlock);
                cs.each(c => { if (!ds.some(s => s == c)) ds.push(c) });
                page.onBatchDelete(ds);
            }
        },
        (event, kt) => {

        },
        'delete',
        false
    )
}