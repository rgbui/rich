import { Page } from "..";
import { OperatorDirective } from "../../history/declare";
import { HistorySnapshoot } from "../../history/snapshoot";
export function PageHistory(page: Page, snapshoot: HistorySnapshoot) {
    snapshoot.on('history', (action) => {
        page.emit('history', action);
        page.emit('change');
    });
    snapshoot.on('error', err => page.onError(err));
    snapshoot.on('warn', (error) => page.onWarn(error));
    snapshoot.registerOperator(OperatorDirective.updateText, async (operator) => { }, async (operator) => { });
    snapshoot.registerOperator(OperatorDirective.updateTextReplace, async (operator) => { }, async (operator) => { });
    snapshoot.registerOperator(OperatorDirective.updateTextDelete, async (operator) => { }, async (operator) => { });
    snapshoot.registerOperator(OperatorDirective.create, async (operator) => { }, async (operator) => { });
    snapshoot.registerOperator(OperatorDirective.delete, async (operator) => { }, async (operator) => { });
    snapshoot.registerOperator(OperatorDirective.remove, async (operator) => { }, async (operator) => { });
    snapshoot.registerOperator(OperatorDirective.updateProp, async (operator) => { }, async (operator) => { });
    snapshoot.registerOperator(OperatorDirective.arrayPropInsert, async (operator) => { }, async (operator) => { });
    snapshoot.registerOperator(OperatorDirective.arrayPropUpdate, async (operator) => { }, async (operator) => { });
    snapshoot.registerOperator(OperatorDirective.arrayPropRemove, async (operator) => { }, async (operator) => { });
    snapshoot.registerOperator(OperatorDirective.insertStyle, async (operator) => { }, async (operator) => { });
    snapshoot.registerOperator(OperatorDirective.mergeStyle, async (operator) => { }, async (operator) => { });
}