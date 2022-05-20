import { Page } from "..";
import { BlockRenderRange } from "../../block/enum";
import { Matrix } from "../../common/matrix";
import { OperatorDirective } from "../../history/declare";
import { HistorySnapshoot } from "../../history/snapshoot";
import { PageDirective } from "../directive";
export function PageHistory(page: Page, snapshoot: HistorySnapshoot) {
    snapshoot.on('history', (action) => {
        page.emit(PageDirective.history, action);
        page.emit(PageDirective.change);
    });
    snapshoot.on('error', err => page.onError(err));
    snapshoot.on('warn', (error) => page.onWarn(error));
    snapshoot.registerOperator(OperatorDirective.create, async (operator) => {
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
    snapshoot.registerOperator(OperatorDirective.delete, async (operator) => {
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
    snapshoot.registerOperator(OperatorDirective.append, async (operator) => {
        var block = page.find(x => x.id == operator.data.blockId);
        var parent = page.find(x => x.id == operator.data.to.parentId);
        await parent.append(block, operator.data.to.at, operator.data.to.childKey)
    }, async (operator) => {
        var block = page.find(x => x.id == operator.data.blockId);
        var parent = page.find(x => x.id == operator.data.from.parentId);
        await parent.append(block, operator.data.from.at, operator.data.from.childKey)
    });
    snapshoot.registerOperator(OperatorDirective.keepCursorOffset, async (operator) => {
        var block = page.find(x => x.id == operator.data.blockId);
        if (block) {
            var aa = block.appearAnchors.find(g => g.prop == operator.data.prop);
            if (aa) {
                page.kit.writer.onFocusAppearAnchor(aa, { at: operator.data.new });
            }
            else {
                block.page.addUpdateEvent(async () => {
                    aa = block.appearAnchors.find(g => g.prop == operator.data.prop);
                    if (aa) {
                        page.kit.writer.onFocusAppearAnchor(aa, { at: operator.data.new });
                    }
                })
            }
        }
    }, async (operator) => {
        var block = page.find(x => x.id == operator.data.blockId);
        if (block) {
            var aa = block.appearAnchors.find(g => g.prop == operator.data.prop);
            if (aa) {
                page.kit.writer.onFocusAppearAnchor(aa, { at: operator.data.old });
            }
            else {
                block.page.addUpdateEvent(async () => {
                    aa = block.appearAnchors.find(g => g.prop == operator.data.prop);
                    if (aa) {
                        page.kit.writer.onFocusAppearAnchor(aa, { at: operator.data.old });
                    }
                })
            }
        }
    });
    snapshoot.registerOperator(OperatorDirective.updateProp, async (operator) => {
        var block = page.find(x => x.id == operator.data.blockId);
        if (block) {
            await block.updateProps(operator.data.new, BlockRenderRange.self);
        }
    }, async (operator) => {
        var block = page.find(x => x.id == operator.data.blockId);
        if (block) {
            await block.updateProps(operator.data.old, BlockRenderRange.self);
        }
    });
    snapshoot.registerOperator(OperatorDirective.arrayPropInsert, async (operator) => {
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
    snapshoot.registerOperator(OperatorDirective.arrayPropUpdate, async (operator) => {
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
    snapshoot.registerOperator(OperatorDirective.arrayPropRemove, async (operator) => {
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
    snapshoot.registerOperator(OperatorDirective.updatePropMatrix, async (operator) => {
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

    snapshoot.registerOperator(OperatorDirective.insertStyle, async (operator) => {

    }, async (operator) => {

    });
    snapshoot.registerOperator(OperatorDirective.mergeStyle, async (operator) => {

    }, async (operator) => {

    });
}