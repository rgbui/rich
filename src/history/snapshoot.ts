import { ExceptionType, Warn } from "../error/exception";
import { Page } from "../page";
import { Events } from "../../util/events";
import { util } from "../../util/util";
import { UserAction, UserOperator } from "./action";
import { ActionDirective, OperatorDirective } from "./declare";
import { HistoryRecord } from "./record";
/**
 * 
 * 用户的所有操作快照，
 * 只要操作，则记录，该记录的所有历史则成为一个版本
 * 
 */
export class HistorySnapshoot extends Events {
    historyRecord: HistoryRecord;
    action: UserAction;
    page: Page;
    constructor(page: Page) {
        super();
        this.page = page;
        this.historyRecord = new HistoryRecord();
        this.historyRecord.on('error', err => this.emit('error', err));
        this.historyRecord.on('undo', action => this.undo(action));
        this.historyRecord.on('redo', action => this.redo(action));
    }
    declare(directive: ActionDirective | string) {
        if (this.action) {
            this.page.onError(new Warn(ExceptionType.notStoreLastAction))
        }
        this.disabledSync = false;
        this._pause = false;
        this.action = new UserAction();
        this.action.user = util.clone(this.page.creater)
        this.action.directive = directive;
        this.action.startDate = new Date().getTime();
    }
    private _pause: boolean = false;
    pause() {
        this._pause = true;
    }
    start() {
        this._pause = false;
    }
    record(directive: OperatorDirective, data: Record<string, any>) {
        if (this._pause == true) return;
        var up = new UserOperator();
        up.directive = directive;
        up.data = data;
        this.action.operators.push(up);
    }
    store() {
        this.action.endDate = Date.now();
        this.emit('history', this.action);
        if (this.historyRecord) {
            if (this.action.directive == ActionDirective.onRedo || this.action.directive == ActionDirective.onUndo) return;
            this.historyRecord.push(this.action);
        };
        delete this.action;
    }
    private disabledSync: boolean = false;
    async sync(directive: ActionDirective | string, action: () => Promise<void>) {
        this.declare(directive);
        try {
            await action();
        }
        catch (ex) {
            this.page.onError(ex);
        }
        if (this.disabledSync != true)
            this.store()
    }
    /**
     * 取消异步操作
     * 注意如果取消了，
     * 需要手动执行store方法，
     * 否则该操作将不记录
     * 每次申明时，该disabledSync则为false
     */
    cancelSync() {
        this.disabledSync = true;
    }
    private ops = new Map<OperatorDirective, { redo: (userOperator: UserOperator) => Promise<void>, undo: (userOperator: UserOperator) => Promise<void> }>();
    registerOperator(directive: OperatorDirective, redo: (userOperator: UserOperator) => Promise<void>, undo: (userOperator: UserOperator) => Promise<void>) {
        this.ops.set(directive, { redo, undo });
    }
    private async redo(action: UserAction) {
        await this.sync(ActionDirective.onRedo, async () => {
            for (let i = 0; i < action.operators.length; i++) {
                let op = action.operators[i];
                var command = this.ops.get(op.directive);
                if (command) {
                    await command.redo(op);
                }
                else this.emit("warn", new Warn(ExceptionType.notRegisterActionDirectiveInHistorySnapshoot))
            }
        });
        this.emit('redo', action)
    }
    private async undo(action: UserAction) {
        await this.sync(ActionDirective.onUndo, async () => {
            for (let i = action.operators.length - 1; i >= 0; i--) {
                let op = action.operators[i];
                var command = this.ops.get(op.directive);
                if (command) {
                    await command.redo(op);
                }
                else this.emit("warn", new Warn(ExceptionType.notRegisterActionDirectiveInHistorySnapshoot))
            }
        });
        this.emit('undo', action)
    }
    async onRedo() {
        this.historyRecord.redo();
    }
    async onUndo() {
        this.historyRecord.undo()
    }
}

export interface HistorySnapshoot {
    on(name: "warn", fn: (err: Error | string) => void);
    on(name: 'error', fn: (err: Error) => void);
    on(name: 'undo', fn: (action: UserAction) => void);
    on(name: 'redo', fn: (action: UserAction) => void);
    on(name: "history", fn: (action: UserAction) => void);
    emit(name: 'warn', err: Error);
    emit(name: 'error', err: Error);
    emit(name: 'undo', action: UserAction);
    emit(name: 'redo', action: UserAction);
    emit(name: "history", action: UserAction);

    record(directive: OperatorDirective.delete, data: { parentId: string, childKey?: string, at?: number, preBlockId?: string, data: Record<string, any> });
    record(directive: OperatorDirective.create, data: { parentId: string, childKey?: string, at?: number, preBlockId?: string, data: Record<string, any> });
    record(directive: OperatorDirective.remove, data: { parentId: string, childKey?: string, blockId: string, at?: number, preBlockId?: string });
    record(directive: OperatorDirective.append, data: { parentId: string, childKey?: string, blockId: string, at?: number, preBlockId?: string });
    record(directive: OperatorDirective.updateProp, data: { blockId: string, old: any, new: any });
    /**
     * 替换文本内容，表示在[start,end]之间替成成text
     * @param directive 
     * @param data 
     */
    record(directive: OperatorDirective.inputStore, data: { blockId: string, start: number, end: number, prop?: string, text: string, replaceText: string });
    /**
     * 删除的内容，区间表示[end,start],删除的内容为text
     * 这里的start一般会比end大，表示从start位置删除文字
     * @param directive 
     * @param data 
     */
    record(directive: OperatorDirective.inputDeleteStore, data: { blockId: string, start: number, end: number, prop?: string, text: string });

    record(directive: OperatorDirective.arrayPropInsert, data: { blockId: string, at: number, data: Record<string, any>, propKey: string });
    record(directive: OperatorDirective.arrayPropRemove, data: { blockId: string, at: number, data: Record<string, any>, propKey: string });
    record(directive: OperatorDirective.arrayPropUpdate, data: { blockId: string, at: number, old: Record<string, any>, new: Record<string, any>, propKey: string });
    record(directive: OperatorDirective.insertStyle, data: { blockId: string, at: number, data: Record<string, any> });
    record(directive: OperatorDirective.mergeStyle, data: { blockId: string, styleId: string, old: Record<string, any>, new: Record<string, any> });
    record(directive: OperatorDirective.schemaRowUpdate, data: { schemaId: string, id: string, old: Record<string, any>, new: Record<string, any> });
    record(directive: OperatorDirective.schemaCreateRow, data: { schemaId: string, data: Record<string, any> });
    record(directive: OperatorDirective.schemaRowRemove, data: { schemaId: string, data: Record<string, any> })
}