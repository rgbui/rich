import { Page } from "..";
import { UA } from "../../../util/ua";
import { Block } from "../../block";
import { findBlockAppear } from "../../block/appear/visible.seek";
import { KeyboardCode, KeyboardPlate } from "../../common/keys";
import { Rect } from "../../common/vector/point";
import { ActionDirective } from "../../history/declare";
import { MoveSelectBlocks } from "../../kit/write/keydown";

export function PageKeys(
    page: Page,
    keyboardPlate: KeyboardPlate) {
    keyboardPlate.listener(kt => UA.isMacOs && kt.isMeta(KeyboardCode.Z) || !UA.isMacOs && kt.isCtrl(KeyboardCode.Z), (event, kt) => {
        page.onUndo();
    }, undefined, 'undo', true);
    keyboardPlate.listener(kt => UA.isMacOs && kt.isMeta(KeyboardCode.Y) || !UA.isMacOs && kt.isCtrl(KeyboardCode.Y), (event, kt) => {
        page.onRedo();
    }, undefined, 'redo', true);
    keyboardPlate.listener(kt => kt.is(KeyboardCode.ArrowDown), (event, kt) => {
        if (page.kit.anchorCursor.currentSelectHandleBlocks.length > 0) {
            MoveSelectBlocks(page.kit.writer, page.kit.anchorCursor.currentSelectHandleBlocks, event)
        }
        if (page.requireSelectLayout && page.isCanEdit) {
            var list = Array.from(page.view.el.querySelectorAll('.shy-page-view-template-picker-items a'));
            var aindex = list.findIndex(c => c.classList.contains('hover'));
            if (aindex == -1) {
                list[0].classList.add('hover');
            }
            else {
                list[aindex].classList.remove('hover');
                if (aindex < list.length - 1) {
                    list[aindex + 1].classList.add('hover');
                }
                else {
                    list[0].classList.add('hover');
                }
            }
        }
    });
    keyboardPlate.listener(kt => kt.is(KeyboardCode.ArrowUp), (event, kt) => {
        if (page.kit.anchorCursor.currentSelectHandleBlocks.length > 0) {
            MoveSelectBlocks(page.kit.writer, page.kit.anchorCursor.currentSelectHandleBlocks, event)
        }
        if (page.requireSelectLayout && page.isCanEdit) {
            var list = Array.from(page.view.el.querySelectorAll('.shy-page-view-template-picker-items a'));
            var aindex = list.findIndex(c => c.classList.contains('hover'));
            if (aindex == -1) {
                list[0].classList.add('hover');
            }
            else {
                list[aindex].classList.remove('hover');
                if (aindex > 0) {
                    list[aindex - 1].classList.add('hover');
                }
                else {
                    list[list.length - 1].classList.add('hover');
                }
            }
        }
    });
    keyboardPlate.listener(kt => kt.is(KeyboardCode.Enter), (event, kt) => {
        if (page.requireSelectLayout && page.isCanEdit) {

            var list = Array.from(page.view.el.querySelectorAll('.shy-page-view-template-picker-items a'));
            var aindex = list.findIndex(c => c.classList.contains('hover'));
            if (aindex > -1) {
                var link = list[aindex] as HTMLAnchorElement;
                var rect = Rect.fromEle(link);
                // 创建一个mousedown事件对象
                var ev = new MouseEvent("mousedown", {
                    view: window,
                    bubbles: true,
                    cancelable: true,
                    button: 0, // 表示鼠标左键
                    // buttons: 1, // 表示鼠标左键被按下
                    clientX: rect.middleCenter.x, // 鼠标指针相对于客户端区域的X坐标
                    clientY: rect.middleCenter.y, // 鼠标指针相对于客户端区域的Y坐标
                    // 可以根据需要添加其他属性
                });
                // 触发mousedown事件
                link.dispatchEvent(ev);
            }
        }
    });
    keyboardPlate.listener(kt => {
        var r = UA.isMacOs && kt.is(KeyboardCode.Backspace, KeyboardCode.Delete) || !UA.isMacOs && kt.is(KeyboardCode.Delete);
        return r;
    }, (event, kt) => {
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
    keyboardPlate.listener(kt =>
        kt.isMetaOrCtrl(KeyboardCode.B)
        ||
        kt.isMetaOrCtrl(KeyboardCode.I)
        ||
        kt.isMetaOrCtrl(KeyboardCode.U)
        ||
        kt.isMetaOrCtrl(KeyboardCode.S)
        ||
        kt.isMetaOrCtrlAndAlt(KeyboardCode['['])
        ||
        kt.isMetaOrCtrlAndAlt(KeyboardCode[']'])
        ||
        kt.isMetaOrCtrlAndAlt(KeyboardCode.M)
        ||
        kt.isMetaOrCtrl(KeyboardCode.L)
        ||
        kt.isMetaOrCtrl(KeyboardCode.D)
        ,
        async (ev, k) => {
            if (page.kit.picker.blocks.length > 0) {
                var getCommands = async (blocks: Block[]) => {
                    var rs;
                    await blocks.eachAsync(async block => {
                        var cs = await block.getBoardEditCommand();
                        if (typeof rs == 'undefined') {
                            rs = cs;
                        }
                        else {
                            rs.removeAll(r => !cs.some(c => c.name == r.name))
                        }
                    });
                    return (rs || []) as {
                        name: string;
                        value?: any;
                    }[];
                }
                if (ev.key.toLowerCase() == KeyboardCode.B.toLowerCase()
                    ||
                    ev.key.toLowerCase() == KeyboardCode.I.toLowerCase()
                    ||
                    ev.key.toLowerCase() == KeyboardCode.U.toLowerCase()
                    ||
                    ev.key.toLowerCase() == KeyboardCode.S.toLowerCase()
                ) {
                    var cs = await getCommands(page.kit.picker.blocks);
                    var name: string;
                    var value: any;
                    if (cs.some(s => s.name == 'fontWeight')) {
                        if (ev.key.toLowerCase() == KeyboardCode.B.toLowerCase()) {
                            name = 'fontWeight';
                            value = cs.find(g => g.name == name)?.value ? 'normal' : 'bold';
                        }
                        else if (ev.key.toLowerCase() == KeyboardCode.I.toLowerCase()) { name = 'fontStyle'; value = cs.find(g => g.name == name)?.value ? false : true; }
                        else if (ev.key.toLowerCase() == KeyboardCode.U.toLowerCase()) { name = 'textDecoration'; value = 'underline' }
                        else if (ev.key.toLowerCase() == KeyboardCode.S.toLowerCase()) { name = 'textDecoration'; value = 'line-through' }
                        await page.onAction(ActionDirective.onBoardEditProp, async () => {
                            await page.kit.picker.blocks.eachAsync(async (block) => {
                                await block.setBoardEditCommand(name, value);
                            })
                        });
                    }
                }
                else if (ev.key.toLowerCase() == KeyboardCode.L.toLowerCase()) {
                    await page.onAction(ActionDirective.onBoardEditProp, async () => {
                        await page.kit.picker.blocks.eachAsync(async (block) => {
                            await block.unlock(block?.locker?.lock ? false : true);
                        })
                    });
                }
                else if (ev.key.toLowerCase() == KeyboardCode.D.toLowerCase()) {
                    await page.onCopyBlocks(page.kit.picker.blocks);
                }
                else if (ev.key.toLowerCase() == KeyboardCode['['].toLowerCase()) {
                    await page.onAction(ActionDirective.onBoardEditProp, async () => {
                        await page.kit.picker.blocks.eachAsync(async (block) => {
                            await block.posZIndex('top');
                        })
                    });
                }
                else if (ev.key.toLowerCase() == KeyboardCode[']'].toLowerCase()) {
                    await page.onAction(ActionDirective.onBoardEditProp, async () => {
                        await page.kit.picker.blocks.eachAsync(async (block) => {
                            await block.posZIndex('bottom');
                        })
                    });
                }
                else if (ev.key.toLowerCase() == KeyboardCode.M.toLowerCase()) {

                }
            }
        }
    );
}