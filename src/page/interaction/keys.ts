
import { Page } from "..";
import { TableGridItem } from "../../../blocks/data-grid/view/item";
import { closeSelectMenutItem } from "../../../component/view/menu";
import { useAIWriteAssistant } from "../../../extensions/ai";
import { UA } from "../../../util/ua";
import { Block } from "../../block";
import { findBlockAppear } from "../../block/appear/visible.seek";
import { BlockUrlConstant } from "../../block/constant";
import { Group } from "../../block/element/group";
import { KeyboardCode, KeyboardPlate } from "../../common/keys";
import { Rect } from "../../common/vector/point";
import { ActionDirective } from "../../history/declare";
import { MoveSelectBlocks } from "../../kit/write/keydown";

export function PageKeys(
    page: Page,
    keyboardPlate: KeyboardPlate
) {
    keyboardPlate.listener(kt => kt.isMetaOrCtrl(KeyboardCode.Z), (event, kt) => {
        page.onUndo();
    }, undefined, 'undo', true);

    keyboardPlate.listener(kt => kt.isMetaOrCtrl(KeyboardCode.Y), (event, kt) => {
        page.onRedo();
    }, undefined, 'redo', true);

    keyboardPlate.listener(kt => kt.is(KeyboardCode.ArrowDown), (event, kt) => {
        if (page.kit.anchorCursor.currentSelectHandleBlocks.length > 0) {
            MoveSelectBlocks(page.kit.writer, page.kit.anchorCursor.currentSelectHandleBlocks, event, {
                ctrl: kt.isMetaOrCtrlAndShift(),
                shift: kt.isShift()
            })
        }
        else if (page.requireSelectLayout && page.isCanEdit) {
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
        else if (page.kit.picker.blocks.length > 0) {
            var b = findBlockAppear(event.target as HTMLElement);
            var cursorNode = window.getSelection().focusNode;
            if (!(b && cursorNode && b.el.contains(cursorNode))) {
                page.onAction('onBoardArrowMove', async () => {
                    await page.kit.picker.blocks.eachAsync(async (block) => {
                        var ma = block.matrix;
                        var s = block.globalMatrix.getScaling().x;
                        var na = ma.clone();
                        var r = keyboardPlate.isShift() ? 10 : 4;
                        na.translate(0, r / s);
                        await block.updateMatrix(ma, na);
                    });
                    page.kit.picker.onRePicker(true);
                })
            }
        }
    });

    keyboardPlate.listener(kt => kt.is(KeyboardCode.ArrowUp), (event, kt) => {
        if (page.kit.anchorCursor.currentSelectHandleBlocks.length > 0) {
            MoveSelectBlocks(page.kit.writer, page.kit.anchorCursor.currentSelectHandleBlocks, event, {
                ctrl: kt.isMetaOrCtrlAndShift(),
                shift: kt.isShift()
            })
        }
        else if (page.requireSelectLayout && page.isCanEdit) {
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
        else if (page.kit.picker.blocks.length > 0) {
            var b = findBlockAppear(event.target as HTMLElement);
            var cursorNode = window.getSelection().focusNode;
            if (!(b && cursorNode && b.el.contains(cursorNode))) {
                page.onAction('onBoardArrowMove', async () => {

                    await page.kit.picker.blocks.eachAsync(async (block) => {
                        var ma = block.matrix;
                        var s = block.globalMatrix.getScaling().x;
                        var na = ma.clone();
                        var r = keyboardPlate.isShift() ? 10 : 4;
                        na.translate(0, 0 - r / s);
                        await block.updateMatrix(ma, na);
                    });
                    page.kit.picker.onRePicker(true);
                })
            }
        }
    });

    keyboardPlate.listener(kt => kt.is(KeyboardCode.ArrowLeft), (event, kt) => {
        if (page.kit.picker.blocks.length > 0) {
            var b = findBlockAppear(event.target as HTMLElement);
            var cursorNode = window.getSelection().focusNode;
            if (!(b && cursorNode && b.el.contains(cursorNode))) {
                page.onAction('onBoardArrowMove', async () => {

                    await page.kit.picker.blocks.eachAsync(async (block) => {
                        var ma = block.matrix;
                        var s = block.globalMatrix.getScaling().x;
                        var na = ma.clone();
                        var r = keyboardPlate.isShift() ? 10 : 4;
                        na.translate(0 - r / s, 0);
                        await block.updateMatrix(ma, na);
                    });
                    page.kit.picker.onRePicker(true);
                })
            }
        }
    });

    keyboardPlate.listener(kt => kt.is(KeyboardCode.ArrowRight), (event, kt) => {
        if (page.kit.picker.blocks.length > 0) {
            var b = findBlockAppear(event.target as HTMLElement);
            var cursorNode = window.getSelection().focusNode;
            if (!(b && cursorNode && b.el.contains(cursorNode))) {
                page.onAction('onBoardArrowMove', async () => {

                    await page.kit.picker.blocks.eachAsync(async (block) => {
                        var ma = block.matrix;
                        var s = block.globalMatrix.getScaling().x;
                        var na = ma.clone();
                        var r = keyboardPlate.isShift() ? 10 : 4;
                        na.translate(r / s, 0);
                        await block.updateMatrix(ma, na);
                    });
                    page.kit.picker.onRePicker(true);
                })
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
        else if (kt.isMetaOrCtrl()) {
            if (page.kit.anchorCursor.currentSelectHandleBlocks.length > 0) {
                page.onBlocksSolidInput(page.kit.anchorCursor.currentSelectHandleBlocks)
            }
        }
    });
    
    keyboardPlate.listener(kt => kt.isMetaOrCtrl(KeyboardCode.V), async (event, kt) => {

    });
    keyboardPlate.listener(kt => {
        var r = UA.isMacOs && kt.is(KeyboardCode.Backspace, KeyboardCode.Delete) || !UA.isMacOs && kt.is(KeyboardCode.Delete);
        return r;
    }, (event, kt) => {


        var b = findBlockAppear(event.target as HTMLElement);
        var cursorNode = window.getSelection().focusNode;
        /**
         * 这里判断光标不在编辑区，
         * 但是有选中的block，
         * 说明是在编辑区外面按下删除键
         * 这时候需要删除选中的block
         * 有两种选中的情况，一个是在文档中批量选中，
         * 另一个是在白板中批量选中
         */
        if (!(b && cursorNode && b.el.contains(cursorNode))) {
            if (page.kit.anchorCursor.currentSelectHandleBlocks.length > 0) {
                event.preventDefault();
                if (page.kit.boardSelector?.boardBlock) {
                    if (page.kit.anchorCursor.currentSelectHandleBlocks.some(b => b.id == page.kit.boardSelector.boardBlock.id)) {
                        page.kit.boardSelector.close();
                    }
                }
                var cs = page.kit.anchorCursor.currentSelectHandleBlocks;
                if (cs.some(s => s instanceof TableGridItem)) {
                    var gs = cs.filter(g => g instanceof TableGridItem);
                    for (let g of gs) {
                        (g as TableGridItem).dataGrid.onRemoveRow((g as TableGridItem).dataId)
                    }
                }
                else
                    page.onBatchDelete(page.kit.anchorCursor.currentSelectHandleBlocks);
            }
            if (page.kit.picker.blocks.length > 0) {
                if (!page.kit.picker.blocks.some(s => s.url == BlockUrlConstant.Code)) {
                    event.preventDefault();
                    page.onBatchDelete(page.kit.picker.blocks);
                }
                else {
                    if (cursorNode && (cursorNode as HTMLElement).tagName?.toLowerCase() == 'textarea') {
                        //说明是在code中编辑区域
                    }
                    else {
                        event.preventDefault();
                        page.onBatchDelete(page.kit.picker.blocks);
                    }
                }
            }
            closeSelectMenutItem()
        }
    });
    keyboardPlate.listener(kt => kt.isMetaOrCtrl(KeyboardCode.C),
        (event, kt) => {
            if (page.kit.anchorCursor.currentSelectHandleBlocks.length > 0) {
                event.preventDefault();
                page.onCopyClipboarBlocks(page.kit.anchorCursor.currentSelectHandleBlocks)
            }
        },
        (event, kt) => {

        },
        'copy',
        false
    );
    keyboardPlate.listener(kt => kt.isMetaOrCtrl(KeyboardCode.X),
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
        kt.isMetaOrCtrlAndShift(KeyboardCode.S)
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
                    if (page.kit.picker.hasCursor()) return;
                    var cs = await getCommands(page.kit.picker.blocks);
                    var name: string;
                    var value: any;
                    if (cs.some(s => s.name == 'fontWeight')) {
                        if (ev.key.toLowerCase() == KeyboardCode.B.toLowerCase()) {
                            name = 'fontWeight';
                            value = cs.find(g => g.name == name)?.value ? 'normal' : 'bold';
                        }
                        else if (ev.key.toLowerCase() == KeyboardCode.I.toLowerCase()) {
                            name = 'fontStyle';
                            value = cs.find(g => g.name == name)?.value ? false : true;
                        }
                        else if (ev.key.toLowerCase() == KeyboardCode.U.toLowerCase()) {
                            name = 'textDecoration';
                            value = cs.find(g => g.name == name)?.value == 'underline' ? "none" : 'underline'
                        }
                        else if (ev.key.toLowerCase() == KeyboardCode.S.toLowerCase()) {
                            name = 'textDecoration';
                            value = cs.find(g => g.name == name)?.value == 'line-through' ? "none" : "line-through"
                        }
                        await page.onAction(ActionDirective.onBoardEditProp, async () => {
                            await page.kit.picker.blocks.eachAsync(async (block) => {
                                await block.setBoardEditCommand(name, value);
                            })
                        });
                        page.kit.picker.onRePicker(true);
                    }
                }
                else if (ev.key.toLowerCase() == KeyboardCode.L.toLowerCase()) {
                    await page.onAction(ActionDirective.onBoardEditProp, async () => {
                        await page.kit.picker.blocks.eachAsync(async (block) => {


                            await block.unlock(block?.locker?.lock ? false : true);
                        })
                    });
                    page.kit.picker.onRePicker(true);
                }
                else if (ev.key.toLowerCase() == KeyboardCode.D.toLowerCase()) {
                    await page.onCopyBlocks(page.kit.picker.blocks);
                }
                // else if (ev.key.toLowerCase() == KeyboardCode['['].toLowerCase()) {
                //     await page.onAction(ActionDirective.onBoardEditProp, async () => {
                //         await page.kit.picker.blocks.eachAsync(async (block) => {
                //             await block.posZIndex('top');
                //         })
                //     });
                // }
                // else if (ev.key.toLowerCase() == KeyboardCode[']'].toLowerCase()) {
                //     await page.onAction(ActionDirective.onBoardEditProp, async () => {
                //         await page.kit.picker.blocks.eachAsync(async (block) => {
                //             await block.posZIndex('bottom');
                //         })
                //     });
                // }
                else if (ev.key.toLowerCase() == KeyboardCode.M.toLowerCase()) {
                    if (page.kit.picker.blocks.length == 1) {
                        page.kit.picker.blocks[0].onInputComment()
                    }
                }
            }
            else if (page.kit.anchorCursor.currentSelectHandleBlocks.length > 0) {

            }
        }
    );
    keyboardPlate.listener(kt => kt.isMetaOrCtrl(KeyboardCode.J),
        async (ev, kt) => {
            if (ev.key.toLowerCase() == KeyboardCode.J.toLowerCase()) {
                if (page.kit.anchorCursor.currentSelectHandleBlocks.length > 0) {
                    useAIWriteAssistant({ blocks: page.kit.anchorCursor.currentSelectHandleBlocks.map(b => b) })
                }
            }
        }
    );
    keyboardPlate.listener(kt => kt.isShift(KeyboardCode.Tab) || kt.is(KeyboardCode.Tab),
        async (ev, kt) => {
            if (page.kit.anchorCursor.currentSelectHandleBlocks.length > 0) {
                ev.preventDefault();
                if (kt.isShift()) {
                    page.onTab(page.kit.anchorCursor.currentSelectHandleBlocks, true);
                }
                else {
                    page.onTab(page.kit.anchorCursor.currentSelectHandleBlocks, false);
                }
            }
        }
    );
    keyboardPlate.listener(kt => kt.isMetaOrCtrlAndOptionOrShift(KeyboardCode.K0) ||
        kt.isMetaOrCtrlAndOptionOrShift(KeyboardCode.K1) ||
        kt.isMetaOrCtrlAndOptionOrShift(KeyboardCode.K2) ||
        kt.isMetaOrCtrlAndOptionOrShift(KeyboardCode.K3) ||
        kt.isMetaOrCtrlAndOptionOrShift(KeyboardCode.K4) ||
        kt.isMetaOrCtrlAndOptionOrShift(KeyboardCode.K5) ||
        kt.isMetaOrCtrlAndOptionOrShift(KeyboardCode.K6) ||
        kt.isMetaOrCtrlAndOptionOrShift(KeyboardCode.K7) ||
        kt.isMetaOrCtrlAndOptionOrShift(KeyboardCode.K8) ||
        kt.isMetaOrCtrlAndOptionOrShift(KeyboardCode.K9),
        (ev, kt) => {
            var ek = KeyboardPlate.getKeyString(ev).toLowerCase();
            if (page.kit.anchorCursor.currentSelectHandleBlocks.length > 0) {
                var url;
                if (ek == KeyboardCode.K0) url = BlockUrlConstant.TextSpan;
                else if (ek == KeyboardCode.K1) url = BlockUrlConstant.Head;
                else if (ek == KeyboardCode.K2) url = '/head?{level:"h2"}';
                else if (ek == KeyboardCode.K3) url = '/head?{level:"h3"}';
                else if (ek == KeyboardCode.K4) url = '/head?{level:"h4"}';
                else if (ek == KeyboardCode.K5) url = '/todo';
                else if (ek == KeyboardCode.K6) url = '/list?{listType:0}';
                else if (ek == KeyboardCode.K7) url = '/list?{listType:1}';
                else if (ek == KeyboardCode.K8) url = '/list?{listType:2}';
                else if (ek == KeyboardCode.K9) url = BlockUrlConstant.Link;
                if (url) {
                    ev.preventDefault();
                    page.onBatchTurn(page.kit.anchorCursor.currentSelectHandleBlocks, url).then(rs => {
                        page.kit.anchorCursor.onSelectBlocks(rs, { render: true, merge: true });
                    })
                }
            }
        }
    );
    keyboardPlate.listener(kt => kt.isMetaOrCtrl(KeyboardCode.D), async (ev, kt) => {
        if (page.kit.anchorCursor.currentSelectHandleBlocks.length > 0) {
            page.onCopyBlocks(page.kit.anchorCursor.currentSelectHandleBlocks)
        }
    });
    keyboardPlate.listener(kt => kt.only(KeyboardCode.Space), async (ev, kt) => {
        if (page.kit.anchorCursor.currentSelectHandleBlocks.length > 0) {
            var pic = page.kit.anchorCursor.currentSelectHandleBlocks.find(g => g.url == BlockUrlConstant.Image);
            if (pic) {
                ev.preventDefault();
                page.onBlocksSolidInput([pic])
            }
        }
    });
    keyboardPlate.listener(kt => kt.isMetaOrCtrlAndAlt(KeyboardCode.T), async (ev, kt) => {
        if (page.kit.anchorCursor.currentSelectHandleBlocks.length > 0) {

            await page.onBlocksToggle(page.kit.anchorCursor.currentSelectHandleBlocks);

        }
    });

    keyboardPlate.listener(kt => kt.isMetaOrCtrl(KeyboardCode.G), async (ev, kt) => {
        if (page.kit.picker.blocks.length > 1) {
            ev.preventDefault();
            page.onMergeBlocks(page.kit.picker.blocks)
        }
        else if (page.kit.picker.blocks.length == 1 && page.kit.picker.blocks[0].url == BlockUrlConstant.Group) {
            ev.preventDefault();
            page.onAction('onBoardUnmerge', async () => {
                (page.kit.picker.blocks[0] as Group).unmerge()
            })
        }
    });

    keyboardPlate.listener(kt => kt.isMetaOrCtrlAndShift(KeyboardCode.G), async (ev, kt) => {
        if (page.kit.picker.blocks.length == 1 && page.kit.picker.blocks[0].url == BlockUrlConstant.Group) {
            ev.preventDefault();
            page.onAction('onBoardUnmerge', async () => {
                (page.kit.picker.blocks[0] as Group).unmerge()
            })
        }
    });

    keyboardPlate.listener(kt => kt.isAlt(KeyboardCode['[']), async (ev, kt) => {
        if (page.kit.picker.blocks.length > 0) {
            ev.preventDefault();
            page.onAction('onBoardArrowMove', async () => {
                await page.kit.picker.blocks.eachAsync(async b => {
                    await b.posZIndex('bottom');
                })
            });
        }
    });
    keyboardPlate.listener(kt => kt.isAlt(KeyboardCode[']']), async (ev, kt) => {
        if (page.kit.picker.blocks.length > 0) {
            ev.preventDefault();
            page.onAction('onBoardArrowMove', async () => {
                await page.kit.picker.blocks.eachAsync(async b => {
                    await b.posZIndex('top');
                })
            });
        }
    });

    keyboardPlate.listener(kt => kt.isAltAndShift(KeyboardCode['[']), async (ev, kt) => {
        if (page.kit.picker.blocks.length > 0) {
            ev.preventDefault();
            page.onAction('onBoardArrowMove', async () => {
                await page.kit.picker.blocks.eachAsync(async b => {
                    await b.inOrDeIndex('down')
                })
            });
        }
    });

    keyboardPlate.listener(kt => kt.isAltAndShift(KeyboardCode[']']), async (ev, kt) => {
        if (page.kit.picker.blocks.length > 0) {
            ev.preventDefault();
            page.onAction('onBoardArrowMove', async () => {
                await page.kit.picker.blocks.eachAsync(async b => {
                    await b.inOrDeIndex('up')
                })
            });
        }
    });
}