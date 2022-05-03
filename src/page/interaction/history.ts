import { Page } from "..";
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
    snapshoot.registerOperator(OperatorDirective.inputStore, async (operator) => {
        var block = page.find(x => x.id == operator.data.blockId);
        if (block) {
            var key = operator.data.prop || 'content';
            var value = block[key];
            var newValue = value.slice(0, operator.data.start) + operator.data.text + value.slice(operator.data.end);
            await block.updateProps({ [key]: newValue });
            var appear = block.getAppear(key);
            //if (appear) appear.updateElementHtml();
            page.addUpdateEvent(async () => {
                // page.kit.explorer.onFocusBlockAtAnchor(block,
                //     operator.data.start + operator.data.text.length
                // );
            });
        }
    }, async (operator) => {
        var block = page.find(x => x.id == operator.data.blockId);
        if (block) {
            var key = operator.data.prop || 'content';
            var value = block[key];
            var newValue = value.slice(0, operator.data.start) + operator.data.replaceText + value.slice(operator.data.start + operator.data.text.length);
            await block.updateProps({ [key]: newValue });
            var appear = block.getAppear(key);
            //if (appear) appear.updateElementHtml();
            page.addUpdateEvent(async () => {
                // page.kit.explorer.onFocusBlockAtAnchor(block,
                //     operator.data.start + operator.data.replaceText.length
                // );
            });
        }
    });
    snapshoot.registerOperator(OperatorDirective.inputDeleteStore, async (operator) => {
        var block = page.find(x => x.id == operator.data.blockId);
        if (block) {
            var key = operator.data.prop || 'content';
            var value = block[key];
            var newValue = value.slice(0, operator.data.end) + value.slice(operator.data.start);
            await block.updateProps({ [key]: newValue });
            page.addUpdateEvent(async () => {
                // page.kit.explorer.onFocusBlockAtAnchor(block,
                //     operator.data.end
                // );
            });
        }
    }, async (operator) => {
        var block = page.find(x => x.id == operator.data.blockId);
        if (block) {
            var key = operator.data.prop || 'content';
            var value = block[key];
            var newValue = value.slice(0, operator.data.end) + operator.data.text + value.slice(operator.data.end);
            await block.updateProps({ [key]: newValue });
            page.addUpdateEvent(async () => {
                // page.kit.explorer.onFocusBlockAtAnchor(block,
                //     operator.data.end + operator.data.text.length
                // );
            });
        }
    });
    snapshoot.registerOperator(OperatorDirective.create, async (operator) => {
        var block = await page.createBlock(operator.data.data.url,
            operator.data.data,
            page.find(x => x.id == operator.data.parentId),
            operator.data.at,
            operator.data.childKey
        );
        page.addUpdateEvent(async () => {
            // if (block.appearAnchors.length > 0)
            //     page.kit.explorer.onFocusAnchor(block.visibleBackAnchor);
        });
    }, async (operator) => {
        var block = page.find(x => x.id == operator.data.data.id);
        if (block) {
            //if (page.kit.explorer.selectedBlocks.exists(block)) page.kit.explorer.onClearAnchorAndSelection()
            await block.delete()
        }
    });
    snapshoot.registerOperator(OperatorDirective.delete, async (operator) => {
        var block = page.find(x => x.id == operator.data.data.id);
        if (block) {
            page.addUpdateEvent(async () => {
                // page.kit.explorer.onFocusBlockAtAnchor(block,
                //     operator.data.end + operator.data.text.length
                // );
            });
            await block.delete()
        }
    }, async (operator) => {
        var block = await page.createBlock(operator.data.data.url,
            operator.data.data,
            page.find(x => x.id == operator.data.parentId),
            operator.data.at,
            operator.data.childKey
        );
        page.addUpdateEvent(async () => {
            // if (block.appearAnchors.length > 0)
            //     page.kit.explorer.onFocusAnchor(block.visibleBackAnchor);
        });
    });
    snapshoot.registerOperator(OperatorDirective.append,
        async (operator) => {
            var block = page.find(x => x.id == operator.data.blockId);
            var parent = page.find(x => x.id == operator.data.to.parentId);
            await parent.append(block, operator.data.to.at, operator.data.to.childKey)
        },
        async (operator) => {
            var block = page.find(x => x.id == operator.data.blockId);
            var parent = page.find(x => x.id == operator.data.from.parentId);
            await parent.append(block, operator.data.from.at, operator.data.from.childKey)
        });
    snapshoot.registerOperator(OperatorDirective.updateProp, async (operator) => {
        var block = page.find(x => x.id == operator.data.blockId);
        if (block) {
            await  block.updateProps(operator.data.new);
        }
    }, async (operator) => {
        var block = page.find(x => x.id == operator.data.blockId);
        if (block) {
            await  block.updateProps(operator.data.old);
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
    snapshoot.registerOperator(OperatorDirective.insertStyle, async (operator) => {

    }, async (operator) => {

    });
    snapshoot.registerOperator(OperatorDirective.mergeStyle, async (operator) => {

    }, async (operator) => {

    });
}