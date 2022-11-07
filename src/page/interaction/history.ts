import lodash from "lodash";
import { Page } from "..";
import { DataGridView } from "../../../blocks/data-grid/view/base";
import { BlockRenderRange } from "../../block/enum";
import { Matrix } from "../../common/matrix";
import { OperatorDirective } from "../../history/declare";
import { AppearCursorPos, HistorySnapshoot, SnapshootBlockPos, SnapshootBlockPropPos, SnapshootBlockStylePos, SnapshootDataGridViewPos } from "../../history/snapshoot";
import { PageDirective } from "../directive";

export function PageHistory(page: Page, snapshoot: HistorySnapshoot) {
    snapshoot.on('history', (action) => {
        page.emit(PageDirective.history, action);
        page.emit(PageDirective.change);
    });
    snapshoot.on('error', err => page.onError(err));
    snapshoot.on('warn', (error) => page.onWarn(error));
    snapshoot.registerOperator(OperatorDirective.create, async (operator, source) => {
        await page.createBlock(operator.data.data.url,
            operator.data.data,
            page.find(x => x.id == operator.data.parentId),
            operator.data.at,
            operator.data.childKey
        );
    }, async (operator) => {
        var block = page.find(x => x.id == operator.data.data.id);
        if (block) {
            await block.delete()
        }
    });
    snapshoot.registerOperator(OperatorDirective.delete, async (operator, source) => {
        var block = page.find(x => x.id == operator.data.data.id);
        if (block) {
            await block.delete()
        }
    }, async (operator) => {
        await page.createBlock(operator.data.data.url,
            operator.data.data,
            page.find(x => x.id == operator.data.parentId),
            operator.data.at,
            operator.data.childKey
        );
    });
    snapshoot.registerOperator(OperatorDirective.append, async (operator, source) => {
        var block = page.find(x => x.id == operator.data.blockId);
        var parent = page.find(x => x.id == operator.data.to.parentId);
        await parent.append(block, operator.data.to.at, operator.data.to.childKey)
    }, async (operator) => {
        var block = page.find(x => x.id == operator.data.blockId);
        var parent = page.find(x => x.id == operator.data.from.parentId);
        await parent.append(block, operator.data.from.at, operator.data.from.childKey)
    });
    snapshoot.registerOperator(OperatorDirective.keepCursorOffset, async (operator, source) => {
        var block = page.find(x => x.id == operator.data.blockId);
        if (block) {
            block.syncUpdate(BlockRenderRange.self);
            block.page.addUpdateEvent(async () => {
                var aa = block.appearAnchors.find(g => g.prop == operator.data.prop);
                if (aa) {
                    page.kit.anchorCursor.onFocusAppearAnchor(aa, { at: operator.data.new });
                }
            })
        }
    }, async (operator) => {
        var block = page.find(x => x.id == operator.data.blockId);
        if (block) {
            block.syncUpdate(BlockRenderRange.self);
            block.page.addUpdateEvent(async () => {
                var aa = block.appearAnchors.find(g => g.prop == operator.data.prop);
                if (aa) {
                    page.kit.anchorCursor.onFocusAppearAnchor(aa, { at: operator.data.old });
                }
            })
        }
    });
    snapshoot.registerOperator(OperatorDirective.changeCursorPos, async (operator, source) => {
        var oc: {
            old_value: { start: AppearCursorPos, end: AppearCursorPos, blocks: SnapshootBlockPos[] },
            new_value: { start: AppearCursorPos, end: AppearCursorPos, blocks: SnapshootBlockPos[] }
        } = operator.data as any;
        if (source == 'notify' || source == 'notifyView' || source == 'load') return;
        if (oc.new_value.blocks?.length > 0) {
            var bs = page.findAll(g => oc.new_value.blocks.some(s => s.blockId == g.id));
            page.kit.anchorCursor.selectBlocks(bs);
            page.addUpdateEvent(async () => {
                page.kit.anchorCursor.renderAnchorCursorSelection()
            })
        }
        else {
            if (!(oc.new_value.start && oc.new_value.end)) return;
            var startBlock = page.find(x => x.id == oc.new_value.start.blockId);
            if (startBlock) {
                var startAppear = startBlock.appearAnchors.find(g => g.prop == oc.new_value.start.prop);
                var endBlock = oc.new_value.end.blockId == startBlock?.id ? startBlock : page.find(x => x.id == oc.new_value.end.blockId);
                var endAppear = endBlock.appearAnchors.find(g => g.prop == oc.new_value.end.prop);
                page.kit.anchorCursor.setTextSelection({
                    startAnchor: startAppear,
                    startOffset: oc.new_value.start.offset,
                    endAnchor: endAppear,
                    endOffset: oc.new_value.end.offset
                });
                page.addUpdateEvent(async () => {
                    page.kit.anchorCursor.renderAnchorCursorSelection()
                })
            }
            else {
                console.error('not found cursor pos block')
            }
        }
    }, async (operator) => {
        var oc: {
            old_value: { start: AppearCursorPos, end: AppearCursorPos, blocks: SnapshootBlockPos[] },
            new_value: { start: AppearCursorPos, end: AppearCursorPos, blocks: SnapshootBlockPos[] }
        } = operator.data as any;
        if (oc.old_value.blocks?.length > 0) {
            var bs = page.findAll(g => oc.old_value.blocks.some(s => s.blockId == g.id));
            page.kit.anchorCursor.selectBlocks(bs);
            page.addUpdateEvent(async () => {
                page.kit.anchorCursor.renderAnchorCursorSelection()
            })
        }
        else {
            if (!(oc.old_value.start && oc.old_value.end)) return;
            var startBlock = page.find(x => x.id == oc.old_value.start.blockId);
            if (startBlock) {
                var startAppear = startBlock.appearAnchors.find(g => g.prop == oc.old_value.start.prop);
                var endBlock = oc.old_value.end.blockId == startBlock?.id ? startBlock : page.find(x => x.id == oc.old_value.end.blockId);
                var endAppear = endBlock.appearAnchors.find(g => g.prop == oc.old_value.end.prop);
                page.kit.anchorCursor.setTextSelection({
                    startAnchor: startAppear,
                    startOffset: oc.old_value.start.offset,
                    endAnchor: endAppear,
                    endOffset: oc.old_value.end.offset
                });
                page.addUpdateEvent(async () => {
                    page.kit.anchorCursor.renderAnchorCursorSelection()
                })
            } else {
                console.error('not found cursor pos block')
            }
        }
    });
    snapshoot.registerOperator(OperatorDirective.updateProp, async (operator, source) => {
        var block = page.find(x => x.id == operator.data.blockId);
        if (block) {
            block.manualUpdateProps(operator.data.old, operator.data.new, BlockRenderRange.self);
        }
    }, async (operator) => {
        var block = page.find(x => x.id == operator.data.blockId);
        if (block) {
            block.manualUpdateProps(operator.data.new, operator.data.old, BlockRenderRange.self);
        }
    });
    snapshoot.registerOperator(OperatorDirective.arrayPropInsert, async (operator, source) => {
        var block = page.find(x => x.id == operator.data.blockId);
        if (block) {
            block.updateArrayInsert(operator.data.propKey, operator.data.at, operator.data.data);
        }
    }, async (operator) => {
        var block = page.find(x => x.id == operator.data.blockId);
        if (block) {
            block.updateArrayRemove(operator.data.propKey, operator.data.at);
        }
    });
    snapshoot.registerOperator(OperatorDirective.arrayPropUpdate, async (operator, source) => {
        var block = page.find(x => x.id == operator.data.blockId);
        if (block) {
            block.updateArrayUpdate(operator.data.propKey, operator.data.at, operator.data.new);
        }
    }, async (operator) => {
        var block = page.find(x => x.id == operator.data.blockId);
        if (block) {
            block.updateArrayUpdate(operator.data.propKey, operator.data.at, operator.data.old);
        }
    });
    snapshoot.registerOperator(OperatorDirective.arrayPropRemove, async (operator, source) => {
        var block = page.find(x => x.id == operator.data.blockId);
        if (block) {
            block.updateArrayRemove(operator.data.propKey, operator.data.at);
        }
    }, async (operator) => {
        var block = page.find(x => x.id == operator.data.blockId);
        if (block) {
            block.updateArrayInsert(operator.data.propKey, operator.data.at, operator.data.data);
        }
    });
    snapshoot.registerOperator(OperatorDirective.updatePropMatrix, async (operator, source) => {
        var block = page.find(x => x.id == operator.data.blockId);
        if (block) {
            await block.updateMatrix(
                new Matrix(...(operator.data.new as number[])),
                new Matrix(...(operator.data.old as number[]))
            );
        }
    }, async (operator) => {
        var block = page.find(x => x.id == operator.data.blockId);
        if (block) {
            await block.updateMatrix(
                new Matrix(...(operator.data.old as number[])),
                new Matrix(...(operator.data.new as number[])),
            );
        }
    });
    snapshoot.registerOperator(OperatorDirective.insertStyle, async (operator, source) => {

    }, async (operator) => {

    });
    snapshoot.registerOperator(OperatorDirective.mergeStyle, async (operator, source) => {

    }, async (operator) => {

    });
    snapshoot.registerOperator(OperatorDirective.pageTurnLayout, async (operator, source) => {
        page.pageLayout.type = operator.data.new;
        page.requireSelectLayout = false;
    }, async (operator) => {
        page.pageLayout.type = operator.data.old;
        page.requireSelectLayout = true;
    });
    snapshoot.registerOperator(OperatorDirective.pageUpdateProp, async (operator, source) => {
        page.updateProps(operator.data.new);
    }, async (operator) => {
        page.updateProps(operator.data.old);
    });
    /***
     * 新的指令
     * 原来的仍然需要使用
     */
    snapshoot.registerOperator(OperatorDirective.$create, async (operator, source) => {
        var dr = operator.data;
        await page.createBlock(dr.data.url,
            dr.data,
            page.find(x => x.id == dr.pos.parentId),
            dr.pos.at,
            dr.pos.childKey
        );
    }, async (operator) => {
        var dr = operator.data;
        var block = page.find(x => x.id == dr.data.id);
        if (block) {
            await block.delete()
        }
    });
    snapshoot.registerOperator(OperatorDirective.$delete, async (operator, source) => {
        var dr = operator.data;
        var block = page.find(x => x.id == dr.data.id);
        if (block) {
            await block.delete()
        }
    }, async (operator) => {
        var dr = operator.data;
        await page.createBlock(dr.data.url,
            dr.data,
            page.find(x => x.id == dr.pos.parentId),
            dr.pos.at,
            dr.pos.childKey
        );
    });
    snapshoot.registerOperator(OperatorDirective.$move, async (operator, source) => {
        var dr = operator.data;
        var block = page.find(x => x.id == dr.from.blockId);
        var parent = page.find(x => x.id == dr.to.parentId);
        await parent.append(block, dr.to.at, dr.to.childKey)
    }, async (operator) => {
        var dr = operator.data;
        var block = page.find(x => x.id == dr.to.blockId);
        var parent = page.find(x => x.id == dr.from.parentId);
        await parent.append(block, dr.from.at, dr.from.childKey)
    });
    snapshoot.registerOperator(OperatorDirective.$update, async (operator, source) => {
        var dr: { pos: SnapshootBlockPropPos, old_value: any, new_value: any, render: BlockRenderRange } = operator.data as any;
        var block = page.find(x => x.id == dr.pos.blockId);
        if (block) {
            block.manualUpdateProps(dr.old_value, dr.new_value, typeof dr.render != 'undefined' ? dr.render : BlockRenderRange.self);
        }
    }, async (operator) => {
        var dr: { pos: SnapshootBlockPropPos, old_value: any, new_value: any, render: BlockRenderRange } = operator.data as any;
        var block = page.find(x => x.id == dr.pos.blockId);
        if (block) {
            block.manualUpdateProps(dr.new_value, dr.old_value, typeof dr.render != 'undefined' ? dr.render : BlockRenderRange.self);
        }
    });
    snapshoot.registerOperator(OperatorDirective.$change_cursor_offset, async (operator, source, action) => {
        var oc: {
            old_value: { start: AppearCursorPos, end: AppearCursorPos, blocks: SnapshootBlockPos[] },
            new_value: { start: AppearCursorPos, end: AppearCursorPos, blocks: SnapshootBlockPos[] }
        } = operator.data as any;
        if (source == 'notifyView') {
            if (oc.new_value.blocks?.length > 0) {
                var bs = page.findAll(g => oc.new_value.blocks.some(s => s.blockId == g.id));
                page.addUpdateEvent(async () => {
                    page.kit.collaboration.renderBlocks(action.userid, bs);
                })
            }
            else {
                if (!(oc.new_value.start && oc.new_value.end)) return;
                var startBlock = page.find(x => x.id == oc.new_value.start.blockId);
                if (startBlock) {
                    var startAppear = startBlock.appearAnchors.find(g => g.prop == oc.new_value.start.prop);
                    var endBlock = oc.new_value.end.blockId == startBlock?.id ? startBlock : page.find(x => x.id == oc.new_value.end.blockId);
                    var endAppear = endBlock.appearAnchors.find(g => g.prop == oc.new_value.end.prop);
                    var selection = ({
                        startAnchor: startAppear,
                        startOffset: oc.new_value.start.offset,
                        endAnchor: endAppear,
                        endOffset: oc.new_value.end.offset
                    });
                    page.addUpdateEvent(async () => {
                        page.kit.collaboration.renderSelection(action.userid, selection);
                    })
                }
                else {
                    console.error('not found cursor pos block')
                }
            }
        }
        if (source == 'notify' || source == 'notifyView' || source == 'load') return;
        if (oc.new_value.blocks?.length > 0) {
            var bs = page.findAll(g => oc.new_value.blocks.some(s => s.blockId == g.id));
            page.kit.anchorCursor.selectBlocks(bs);
            page.addUpdateEvent(async () => {
                page.kit.anchorCursor.renderAnchorCursorSelection()
            })
        }
        else {
            if (!(oc.new_value.start && oc.new_value.end)) return;
            var startBlock = page.find(x => x.id == oc.new_value.start.blockId);
            if (startBlock) {
                var startAppear = startBlock.appearAnchors.find(g => g.prop == oc.new_value.start.prop);
                var endBlock = oc.new_value.end.blockId == startBlock?.id ? startBlock : page.find(x => x.id == oc.new_value.end.blockId);
                var endAppear = endBlock.appearAnchors.find(g => g.prop == oc.new_value.end.prop);
                page.kit.anchorCursor.setTextSelection({
                    startAnchor: startAppear,
                    startOffset: oc.new_value.start.offset,
                    endAnchor: endAppear,
                    endOffset: oc.new_value.end.offset
                });
                page.addUpdateEvent(async () => {
                    page.kit.anchorCursor.renderAnchorCursorSelection()
                })
            }
            else {
                console.error('not found cursor pos block')
            }
        }
    }, async (operator) => {
        var oc: {
            old_value: { start: AppearCursorPos, end: AppearCursorPos, blocks: SnapshootBlockPos[] },
            new_value: { start: AppearCursorPos, end: AppearCursorPos, blocks: SnapshootBlockPos[] }
        } = operator.data as any;
        if (oc.old_value.blocks?.length > 0) {
            var bs = page.findAll(g => oc.old_value.blocks.some(s => s.blockId == g.id));
            page.kit.anchorCursor.selectBlocks(bs);
            page.addUpdateEvent(async () => {
                page.kit.anchorCursor.renderAnchorCursorSelection()
            })
        }
        else {
            if (!(oc.old_value.start && oc.old_value.end)) return;
            var startBlock = page.find(x => x.id == oc.old_value.start.blockId);
            if (startBlock) {
                var startAppear = startBlock.appearAnchors.find(g => g.prop == oc.old_value.start.prop);
                var endBlock = oc.old_value.end.blockId == startBlock?.id ? startBlock : page.find(x => x.id == oc.old_value.end.blockId);
                var endAppear = endBlock.appearAnchors.find(g => g.prop == oc.old_value.end.prop);
                page.kit.anchorCursor.setTextSelection({
                    startAnchor: startAppear,
                    startOffset: oc.old_value.start.offset,
                    endAnchor: endAppear,
                    endOffset: oc.old_value.end.offset
                });
                page.addUpdateEvent(async () => {
                    page.kit.anchorCursor.renderAnchorCursorSelection()
                })
            } else {
                console.error('not found cursor pos block')
            }
        }
    });
    snapshoot.registerOperator(OperatorDirective.$insert_style, async (operator, source) => {
        var oc: {
            pos: SnapshootBlockStylePos,
            data: Record<string, any>
        } = operator.data as any;
        var block = page.find(g => g.id == oc.pos.blockId);
        if (block) {
            block.pattern.createStyle(oc.data);
        }
    }, async (operator) => {
        var oc: {
            pos: SnapshootBlockStylePos,
            data: Record<string, any>
        } = operator.data as any;
        var block = page.find(g => g.id == oc.pos.blockId);
        if (block) {
            block.pattern.deleteStyle(oc.data.id);
        }
    });
    snapshoot.registerOperator(OperatorDirective.$delete_style, async (operator, source) => {
        var oc: {
            pos: SnapshootBlockStylePos,
            data: Record<string, any>
        } = operator.data as any;
        var block = page.find(g => g.id == oc.pos.blockId);
        if (block) {
            block.pattern.deleteStyle(oc.data.id);
        }
    }, async (operator) => {
        var oc: {
            pos: SnapshootBlockStylePos,
            data: Record<string, any>
        } = operator.data as any;
        var block = page.find(g => g.id == oc.pos.blockId);
        if (block) {
            block.pattern.createStyle(oc.data);
        }
    });
    snapshoot.registerOperator(OperatorDirective.$merge_style, async (operator, source) => {
        var oc: {
            pos: SnapshootBlockStylePos,
            old_value: any,
            new_value: any
        } = operator.data as any;
        var block = page.find(g => g.id == oc.pos.blockId);
        if (block) {
            block.pattern.updateStyle(oc.pos.styleId, oc.new_value);
        }
    }, async (operator) => {
        var oc: {
            pos: SnapshootBlockStylePos,
            old_value: any,
            new_value: any
        } = operator.data as any;
        var block = page.find(g => g.id == oc.pos.blockId);
        if (block) {
            block.pattern.updateStyle(oc.pos.styleId, oc.old_value);
        }
    });
    snapshoot.registerOperator(OperatorDirective.$array_update, async (operator, source) => {
        var dr = operator.data;
        var block = page.find(x => x.id == dr.pos.blockId);
        if (block) {
            var arr = lodash.get(block, dr.pos.prop);
            var ar = arr.find(g => g.id == dr.pos.arrayId);
            await block.arrayUpdate({ prop: dr.pos.prop, data: ar, update: dr.new_value })
        }
    }, async (operator) => {
        var dr = operator.data;
        var block = page.find(x => x.id == dr.pos.blockId);
        if (block) {
            var arr = lodash.get(block, dr.pos.prop);
            var ar = arr.find(g => g.id == dr.pos.arrayId);
            await block.arrayUpdate({ prop: dr.pos.prop, data: ar, update: dr.old_value })
        }
    });
    snapshoot.registerOperator(OperatorDirective.$array_delete, async (operator, source) => {
        var dr = operator.data;
        var block = page.find(x => x.id == dr.pos.blockId);
        if (block) {
            await block.arrayRemove({ prop: dr.pos.prop, at: dr.pos.arrayAt })
        }
    }, async (operator) => {
        var dr = operator.data;
        var block = page.find(x => x.id == dr.pos.blockId);
        if (block) {
            await block.arrayPush({ prop: dr.pos.prop, data: block.createPropObject(dr.pos.prop, dr.data), at: dr.pos.arrayAt })
        }
    });
    snapshoot.registerOperator(OperatorDirective.$array_move, async (operator, source) => {
        var dr = operator.data;
        var block = page.find(x => x.id == dr.pos.blockId);
        if (block) {
            await block.arrayMove({ prop: dr.pos.prop, from: dr.from, to: dr.to })
        }
    }, async (operator) => {
        var dr = operator.data;
        var block = page.find(x => x.id == dr.pos.blockId);
        if (block) {
            await block.arrayMove({ prop: dr.pos.prop, from: dr.to, to: dr.from })
        }
    });
    snapshoot.registerOperator(OperatorDirective.$array_create, async (operator, source) => {
        var dr = operator.data;
        var block = page.find(x => x.id == dr.pos.blockId);
        if (block) {
            await block.arrayPush({ prop: dr.pos.prop, data: block.createPropObject(dr.pos.prop, dr.data), at: dr.pos.arrayAt })
        }
    }, async (operator) => {
        var dr = operator.data;
        var block = page.find(x => x.id == dr.pos.blockId);
        if (block) {
            await block.arrayRemove({ prop: dr.pos.prop, at: dr.pos.arrayAt })
        }
    });
    snapshoot.registerOperator(OperatorDirective.$turn, async (operator) => {
        var dr = operator.data;
        var block = page.find(x => x.id == dr.pos.blockId);
        if (block) {
            await block.turn(dr.from)
        }
    }, async (operator) => {
        var dr = operator.data;
        var block = page.find(x => x.id == dr.pos.blockId);
        if (block) {
            await block.turn(dr.to)
        }
    });
    snapshoot.registerOperator(OperatorDirective.$data_grid_trun_view, async (operator) => {
        var dr = operator.data;
        var block: DataGridView = page.find(x => x.id == dr.pos.blockId) as any;
        if (block) {
            await block.dataGridTrunView(dr.from)
        }
    }, async (operator) => {
        var dr = operator.data;
        var block: DataGridView = page.find(x => x.id == dr.pos.blockId) as any;
        if (block) {
            await block.dataGridTrunView(dr.to)
        }
    });
    snapshoot.registerOperator(OperatorDirective.$data_grid_trun_view_new, async (operator) => {
        var dr = operator.data as { from: SnapshootDataGridViewPos };
        var block: DataGridView = page.find(x => x.id == dr.from.blockId) as any;
        if (block) {
            await block.otherDataGridTrunView(dr.from.viewId, dr.from.type, dr.from.schemaId, dr.from.viewUrl)
        }
    }, async (operator) => {
        var dr = operator.data as { to: SnapshootDataGridViewPos };;
        var block: DataGridView = page.find(x => x.id == dr.to.blockId) as any;
        if (block) {
            await block.otherDataGridTrunView(dr.to.viewId, dr.to.type, dr.to.schemaId, dr.to.viewUrl)
        }
    });
    snapshoot.registerOperator(OperatorDirective.$data_grid_change_view_url, async (operator) => {
        var dr = operator.data;
        var block: DataGridView = page.find(x => x.id == dr.pos.blockId) as any;
        if (block) {
            await block.dataGridChangeView(dr.from)
        }
    }, async (operator) => {
        var dr = operator.data;
        var block: DataGridView = page.find(x => x.id == dr.pos.blockId) as any;
        if (block) {
            await block.dataGridChangeView(dr.to)
        }
    });
}