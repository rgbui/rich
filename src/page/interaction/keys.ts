import { Page } from "..";
import { UA } from "../../../util/ua";
import { findBlockAppear } from "../../block/appear/visible.seek";
import { KeyboardCode, KeyboardPlate } from "../../common/keys";
import { MoveSelectBlocks } from "../../kit/write/keydown";

export function PageKeys(page: Page, keyboardPlate: KeyboardPlate)
{
    keyboardPlate.listener(kt => UA.isMacOs && kt.isMeta(KeyboardCode.Z) || !UA.isMacOs && kt.isCtrl(KeyboardCode.Z), (event, kt) => {
        page.onUndo();
    });
    keyboardPlate.listener(kt => UA.isMacOs && kt.isMeta(KeyboardCode.Y) || !UA.isMacOs && kt.isCtrl(KeyboardCode.Y), (event, kt) => {
        page.onRedo();
    });
    keyboardPlate.listener(kt => kt.is(KeyboardCode.ArrowDown), (event, kt) => {
        if (page.kit.anchorCursor.currentSelectHandleBlocks.length > 0) {
            MoveSelectBlocks(page.kit.writer, page.kit.anchorCursor.currentSelectHandleBlocks, event)
        }
    });
    keyboardPlate.listener(kt => kt.is(KeyboardCode.ArrowUp), (event, kt) => {
        if (page.kit.anchorCursor.currentSelectHandleBlocks.length > 0) {
            MoveSelectBlocks(page.kit.writer, page.kit.anchorCursor.currentSelectHandleBlocks, event)
        }
    });

    keyboardPlate.listener(kt => {
        var r = UA.isMacOs && kt.is(KeyboardCode.Backspace, KeyboardCode.Delete) || !UA.isMacOs && kt.is(KeyboardCode.Delete);
        return r;
    },
        (event, kt) => {
            var b = findBlockAppear(event.target as HTMLElement);
            var cursorNode = window.getSelection().focusNode;
            if (!(b && cursorNode && b.el.contains(cursorNode))) {
                if (page.kit.anchorCursor.currentSelectHandleBlocks.length > 0) {
                    event.preventDefault();
                    page.onBatchDelete(page.kit.anchorCursor.currentSelectHandleBlocks);
                }
                if (page.kit.picker.blocks.length > 0) {
                    event.preventDefault();
                    page.onBatchDelete(page.kit.picker.blocks);
                }
            }
        },
        (event, kt) => {

        },
        'delete',
        false
    );
    keyboardPlate.listener(kt => UA.isMacOs && kt.isMeta(KeyboardCode.C) || !UA.isMacOs && kt.isCtrl(KeyboardCode.C),
        (event, kt) => {
            if (page.kit.anchorCursor.currentSelectHandleBlocks.length > 0) {
                event.preventDefault();
                page.onCopyBlocks(page.kit.anchorCursor.currentSelectHandleBlocks)
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
                page.onCutBlocks(page.kit.anchorCursor.currentSelectHandleBlocks)
            }
        },
        (event, kt) => {

        },
        'copy',
        false
    );
}