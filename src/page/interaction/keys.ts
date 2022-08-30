import { Page } from "..";
import { WriteClipboardHtml } from "../../../component/copy";
import { UA } from "../../../util/ua";
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
            if (page.kit.anchorCursor.currentSelectHandleBlocks.length > 0) {
                event.preventDefault();
                page.onBatchDelete(page.kit.anchorCursor.currentSelectHandleBlocks);
            }
        },
        (event, kt) => {

        },
        'delete',
        false
    );
    keyboardPlate.listener(kt => UA.isMacOs && kt.isMeta(KeyboardCode.C) || !UA.isMacOs && kt.isCtrl(KeyboardCode.C),
        (event, kt) => {
            console.log('ggg');
            if (page.kit.anchorCursor.currentSelectHandleBlocks.length > 0) {
                console.log('gggxx');
                event.preventDefault();
                WriteClipboardHtml(`<div data-content-source='https://shy.live'><p>kankan</p></div>`)
            }
        },
        (event, kt) => {

        },
        'copy',
        false
    );
    keyboardPlate.listener(kt => UA.isMacOs && kt.isMeta(KeyboardCode.X) || !UA.isMacOs && kt.isCtrl(KeyboardCode.X),
        (event, kt) => {
            if (page.kit.anchorCursor.currentSelectHandleBlocks.length > 0) {
                event.preventDefault();
                WriteClipboardHtml(`<div data-content-source='https://shy.live'><p>kankan</p></div>`)
                // page.onBatchDelete(page.kit.anchorCursor.currentSelectHandleBlocks);
            }
        },
        (event, kt) => {

        },
        'copy',
        false
    );
}