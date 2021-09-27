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
            block.updateProps({ [key]: newValue });
            page.onUpdated(async () => {
                page.kit.explorer.onFocusBlockAtAnchor(block,
                    operator.data.start + operator.data.text.length
                );
            });
        }
    }, async (operator) => {
        var block = page.find(x => x.id == operator.data.blockId);
        if (block) {
            var key = operator.data.prop || 'content';
            var value = block[key];
            var newValue = value.slice(0, operator.data.start) + operator.data.replaceText + value.slice(operator.data.start + operator.data.text.length);
            block.updateProps({ [key]: newValue });
            page.onUpdated(async () => {
                page.kit.explorer.onFocusBlockAtAnchor(block,
                    operator.data.start + operator.data.replaceText.length
                );
            });
        }
    });
    snapshoot.registerOperator(OperatorDirective.inputDeleteStore, async (operator) => {
        var block = page.find(x => x.id == operator.data.blockId);
        if (block) {
            var key = operator.data.prop || 'content';
            var value = block[key];
            var newValue = value.slice(0, operator.data.end) + value.slice(operator.data.start);
            block.updateProps({ [key]: newValue });
            page.onUpdated(async () => {
                page.kit.explorer.onFocusBlockAtAnchor(block,
                    operator.data.end
                );
            });
        }
    }, async (operator) => {
        var block = page.find(x => x.id == operator.data.blockId);
        if (block) {
            var key = operator.data.prop || 'content';
            var value = block[key];
            var newValue = value.slice(0, operator.data.end) + operator.data.text + value.slice(operator.data.end);
            block.updateProps({ [key]: newValue });
            page.onUpdated(async () => {
                page.kit.explorer.onFocusBlockAtAnchor(block,
                    operator.data.end + operator.data.text.length
                );
            });
        }
    });
    snapshoot.registerOperator(OperatorDirective.create, async (operator) => {
        await page.createBlock(operator.data.data.url,
            operator.data.data,
            page.find(x => x.id == operator.data.parentId),
            operator.data.at,
            operator.data.childKey
        )
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
        )
    });
    snapshoot.registerOperator(OperatorDirective.remove, async (operator) => {
        var block = page.find(x => x.id == operator.data.blockId);
        if (block) {
            await block.remove();
        }
    }, async (operator) => {
        var block = page.find(x => x.id == operator.data.blockId);
        var parent = page.find(x => x.id == operator.data.parentId);
        if (parent) {
            await parent.append(block, operator.data.at, operator.data.childKey);
        }
    });
    snapshoot.registerOperator(OperatorDirective.append, async (operator) => {

    }, async (operator) => {

    });
    snapshoot.registerOperator(OperatorDirective.updateProp, async (operator) => {
        var block = page.find(x => x.id == operator.data.blockId);
        if (block) {
            block.updateProps(operator.data.new);
        }
    }, async (operator) => {
        var block = page.find(x => x.id == operator.data.blockId);
        if (block) {
            block.updateProps(operator.data.old);
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