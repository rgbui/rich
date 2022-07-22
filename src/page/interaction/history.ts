import lodash from "lodash";
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
                    page.kit.writer.onFocusAppearAnchor(aa, { at: operator.data.new });
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
                    page.kit.writer.onFocusAppearAnchor(aa, { at: operator.data.old });
                }
            })
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
        var block = page.find(x => x.id == dr.from.pos.blockId);
        var parent = page.find(x => x.id == dr.to.pos.parentId);
        await parent.append(block, dr.to.pos.at, dr.to.pos.childKey)
    }, async (operator) => {
        var dr = operator.data;
        var block = page.find(x => x.id == dr.to.pos.blockId);
        var parent = page.find(x => x.id == dr.from.pos.parentId);
        await parent.append(block, dr.from.pos.at, dr.from.pos.childKey)
    });
    // snapshoot.registerOperator(OperatorDirective.keepCursorOffset, async (operator, source) => {
    //     var block = page.find(x => x.id == operator.data.blockId);
    //     if (block) {
    //         block.syncUpdate(BlockRenderRange.self);
    //         block.page.addUpdateEvent(async () => {
    //             var aa = block.appearAnchors.find(g => g.prop == operator.data.prop);
    //             if (aa) {
    //                 page.kit.writer.onFocusAppearAnchor(aa, { at: operator.data.new });
    //             }
    //         })
    //     }
    // }, async (operator) => {
    //     var block = page.find(x => x.id == operator.data.blockId);
    //     if (block) {
    //         block.syncUpdate(BlockRenderRange.self);
    //         block.page.addUpdateEvent(async () => {
    //             var aa = block.appearAnchors.find(g => g.prop == operator.data.prop);
    //             if (aa) {
    //                 page.kit.writer.onFocusAppearAnchor(aa, { at: operator.data.old });
    //             }
    //         })
    //     }
    // });
    snapshoot.registerOperator(OperatorDirective.$update, async (operator, source) => {
        var dr = operator.data;
        var block = page.find(x => x.id == dr.pos.blockId);
        if (block) {
            block.manualUpdateProps(operator.data.old_value, operator.data.new_value, BlockRenderRange.self);
        }
    }, async (operator) => {
        var dr = operator.data;
        var block = page.find(x => x.id == dr.pos.blockId);
        if (block) {
            block.manualUpdateProps(operator.data.new_value, operator.data.old_value, BlockRenderRange.self);
        }
    });
    snapshoot.registerOperator(OperatorDirective.$array_update, async (operator, source) => {
        var dr = operator.data;
        var block = page.find(x => x.id == dr.pos.blockId);
        if (block) {
            var arr = lodash.get(block, dr.pos.prop);
            var ar = arr.find(g => g.id == dr.pos.arrayId);
            block.arrayUpdate({ prop: dr.pos.prop, data: ar, update: dr.new_value })
        }
    }, async (operator) => {
        var dr = operator.data;
        var block = page.find(x => x.id == dr.pos.blockId);
        if (block) {
            var arr = lodash.get(block, dr.pos.prop);
            var ar = arr.find(g => g.id == dr.pos.arrayId);
            block.arrayUpdate({ prop: dr.pos.prop, data: ar, update: dr.old_value })
        }
    });
    snapshoot.registerOperator(OperatorDirective.$array_delete, async (operator, source) => {
        var dr = operator.data;
        var block = page.find(x => x.id == dr.pos.blockId);
        if (block) {
            block.arrayRemove({ prop: dr.pos.prop, at: dr.pos.arrayAt })
        }
    }, async (operator) => {
        var dr = operator.data;
        var block = page.find(x => x.id == dr.pos.blockId);
        if (block) {
            block.arrayPush({ prop: dr.pos.prop, data: block.createPropObject(dr.pos.prop, dr.data), at: dr.pos.arrayAt })
        }
    });
    snapshoot.registerOperator(OperatorDirective.$array_create, async (operator, source) => {
        var dr = operator.data;
        var block = page.find(x => x.id == dr.pos.blockId);
        if (block) {
            block.arrayPush({ prop: dr.pos.prop, data: block.createPropObject(dr.pos.prop, dr.data), at: dr.pos.arrayAt })
        }
    }, async (operator) => {
        var dr = operator.data;
        var block = page.find(x => x.id == dr.pos.blockId);
        if (block) {
            block.arrayRemove({ prop: dr.pos.prop, at: dr.pos.arrayAt })
        }
    });




}