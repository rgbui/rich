import { ExceptionType, Warn } from "../error/exception";
import { Page } from "../page";
import { Events } from "../../util/events";
import { UserAction, UserOperator } from "./action";
import { ActionDirective, OperatorDirective } from "./declare";
import { HistoryRecord } from "./record";
import { Block } from "../block";
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
    }
    declare(directive: ActionDirective | string) {
        if (this.action) {
            this.page.onError(new Warn(ExceptionType.notStoreLastAction))
        }
        this.disabledSync = false;
        this._pause = false;
        delete this.isSyncBlock;
        this.action = new UserAction();
        this.action.userid = this.page?.user.id;
        this.action.directive = directive;
        this.action.startDate = new Date().getTime();
    }
    isSyncBlock: boolean;
    /**
     * 
     * @param isSyncBlock 如果false表示禁用syncBlock记录
     */
    setSyncBlock(isSyncBlock: boolean) {
        this.isSyncBlock = isSyncBlock;
    }
    private _pause: boolean = false;
    pause() {
        this._pause = true;
    }
    start() {
        this._pause = false;
    }
    record(directive: OperatorDirective, data: Record<string, any>, obj: Block | Page) {
        if (this._pause == true) return;
        var up = new UserOperator();
        up.directive = directive;
        up.obj = obj;
        up.data = data;
        if (typeof this.isSyncBlock != 'undefined') {
            up.isSyncBlock = this.isSyncBlock;
        }
        this.action.operators.push(up);
    }
    store() {
        if (!this.action.isEmpty) {
            this.action.endDate = Date.now();
            this.emit('history', this.action);
            if (this.historyRecord) {
                if (!(this.action.directive == ActionDirective.onRedo || this.action.directive == ActionDirective.onUndo))
                    this.historyRecord.push(this.action);
            };
            console.log(this.action.toString());
        }
        delete this.action;
    }
    private disabledSync: boolean = false;
    async sync(directive: ActionDirective | string, action: () => Promise<void>) {
        this.declare(directive);
        try {
            await action();
        }
        catch (ex) {
            console.error(ex);
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
    async redo() {
        await this.historyRecord.redo(async (action) => {
            for (let i = 0; i < action.operators.length; i++) {
                let op = action.operators[i];
                var command = this.ops.get(op.directive);
                if (command) {
                    await command.redo(op);
                }
                else this.emit("warn", new Warn(ExceptionType.notRegisterActionDirectiveInHistorySnapshoot))
            }
            this.emit('redo', action)
        })
    }
    async undo() {
        await this.historyRecord.undo(async (action) => {
            for (let i = action.operators.length - 1; i >= 0; i--) {
                let op = action.operators[i];
                var command = this.ops.get(op.directive);
                if (command) {
                    await command.undo(op);
                }
                else this.emit("warn", new Warn(ExceptionType.notRegisterActionDirectiveInHistorySnapshoot))
            }
            this.emit('undo', action)
        })
    }
    async redoUserAction(action: UserAction) {
        for (let i = 0; i < action.operators.length; i++) {
            let op = action.operators[i];
            var command = this.ops.get(op.directive);
            if (command) {
                await command.redo(op);
            }
            else this.emit("warn", new Warn(ExceptionType.notRegisterActionDirectiveInHistorySnapshoot))
        }
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

    record(directive: OperatorDirective.delete, data: { parentId: string, childKey?: string, at?: number, data: Record<string, any> }, obj: Block | Page);
    record(directive: OperatorDirective.create, data: { parentId: string, childKey?: string, at?: number, data: Record<string, any> }, obj: Block | Page);
    record(directive: OperatorDirective.append, data: { to: { parentId: string, childKey?: string, at?: number }, from: { parentId: string, childKey?: string, at?: number }, blockId: string }, obj: Block | Page);
    record(directive: OperatorDirective.updateProp, data: { blockId: string, old: any, new: any }, obj: Block | Page);
    record(directive: OperatorDirective.updatePropMatrix, data: { blockId: string, old: number[], new: number[] }, obj: Block | Page);
    /**
     * 替换文本内容，表示在[start,end]之间替成成text
     * @param directive 
     * @param data 
     */
    record(directive: OperatorDirective.inputStore, data: { blockId: string, start: number, end: number, prop?: string, text: string, replaceText: string }, obj: Block | Page);
    /**
     * 删除的内容，区间表示[end,start],删除的内容为text
     * 这里的start一般会比end大，表示从start位置删除文字
     * @param directive 
     * @param data 
     */
    record(directive: OperatorDirective.inputDeleteStore, data: { blockId: string, start: number, end: number, prop?: string, text: string }, obj: Block | Page);

    record(directive: OperatorDirective.arrayPropInsert, data: { blockId: string, at: number, data: Record<string, any>, propKey: string }, obj: Block | Page);
    record(directive: OperatorDirective.arrayPropRemove, data: { blockId: string, at: number, data: Record<string, any>, propKey: string }, obj: Block | Page);
    record(directive: OperatorDirective.arrayPropUpdate, data: { blockId: string, at: number, old: Record<string, any>, new: Record<string, any>, propKey: string }, obj: Block | Page);
    record(directive: OperatorDirective.insertStyle, data: { blockId: string, at: number, data: Record<string, any> }, obj: Block | Page);
    record(directive: OperatorDirective.mergeStyle, data: { blockId: string, styleId: string, old: Record<string, any>, new: Record<string, any> }, obj: Block | Page);
    record(directive: OperatorDirective.schemaRowUpdate, data: { schemaId: string, id: string, old: Record<string, any>, new: Record<string, any> }, obj: Block | Page);
    record(directive: OperatorDirective.schemaCreateRow, data: { schemaId: string, data: Record<string, any> }, obj: Block | Page);
    record(directive: OperatorDirective.schemaRowRemove, data: { schemaId: string, data: Record<string, any> }, obj: Block | Page)
}