import { Page } from "../page";
import { Events } from "../../util/events";
import { UserAction, UserOperator } from "./action";
import { ActionDirective, OperatorDirective } from "./declare";
import { HistoryRecord } from "./record";
import { Block } from "../block";
import { TableSchema } from "../../blocks/data-grid/schema/meta";
import { BlockAppear } from "../block/appear";
import { BlockRenderRange } from "../block/enum";
import lodash from "lodash";
import { PageLayoutType } from "../page/declare";
import { lst } from "../../i18n/store";

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
        this._merge = false;
        this._pause = false;
        this.action = new UserAction();
        this.action.userid = this.page?.user.id;
        this.action.directive = directive;
        this.action.startDate = new Date().getTime();
    }
    /**
     * 合并，两次的action合并掉
     */
    private _merge: boolean = false;
    merge() {
        this._merge = true;
    }
    unmerge() {
        this._merge = false;
    }
    private _pause: boolean = false;
    pause() {
        this._pause = true;
    }
    start() {
        this._pause = false;
    }
    get canRecord() {
        return this.action;
    }
    /**
     * 如果isLocal为ture，表示是用户在本地的操作
     * 该操作将不在传到服务器
     * @param directive 
     * @param data 
     * @param obj 
     * @param isLocal 
     * @returns 
     */
    record(directive: OperatorDirective, data: Record<string, any>, obj: Block | Page, isLocal?: boolean) {
        if (this._pause == true) return;
        var up = new UserOperator();
        up.directive = directive;
        up.obj = obj;
        up.data = data;
        up.isLocal = isLocal;
        this.action.operators.push(up);
    }
    store(options?: {
        block?: Block,
        blocks?: Block[],
        immediate?: boolean,
        disabledSyncBlock?: boolean,
        disabledStore?: boolean,
        merge?: boolean,
        disabledJoinHistory?: boolean,
        disableSyncServer?: boolean
    }) {
        try {
            if (!this.action?.isEmpty) {
                this.action.endDate = Date.now();
                /**
                 * 这是加载页面后，页面的自动处理动作
                 */
                if (this.action.directive == ActionDirective.AutomaticHandle) {
                    return;
                }
                /**
                 * onLoadUserActions 一般是从别的地方触发的，那么相应的history就不应该在触发了
                 */
                if (options?.disableSyncServer !== true && this.action.directive !== ActionDirective.onLoadUserActions) {
                    this.emit('history', this.action);
                }
                if (this.historyRecord) {
                    if (options?.disabledJoinHistory !== true && !([
                        ActionDirective.onRedo,
                        ActionDirective.onPageTurnLayout,
                        ActionDirective.onLoadUserActions,
                        ActionDirective.onUndo
                    ].includes(this.action.directive as any))) {
                        if (this._merge == true || options?.merge == true) {
                            /**
                             * 合并上次的action
                             */
                            var action = this.historyRecord.action;
                            if (action) {
                                this.action.operators.forEach(op => {
                                    action.operators.push(op);
                                });
                            } else this.historyRecord.push(this.action);
                            this._merge = false;
                        }
                        else this.historyRecord.push(this.action);
                    }
                };
                window.shyLog(this.action.toString());
            }
        }
        catch (ex) {
            console.error(ex);
        }
    }
    async sync(directive: ActionDirective | string, action: (monitorChangeBlocks: (cbs: Block[]) => void) => Promise<void>, options?: {
        block?: Block,
        blocks?: Block[],
        immediate?: boolean,
        disabledSyncBlock?: boolean,
        disabledStore?: boolean,
        merge?: boolean,
        disabledJoinHistory?: boolean,
        disableSyncServer?: boolean
    }) {
        this.declare(directive);
        try {
            if (options?.immediate) this.action.immediate = true;
            await action((bs) => {
                var rs = options?.disabledSyncBlock ? [] : bs.map(b => b.closest(x => x.syncBlockId ? true : false) || null);
                var bs: Block[] = [];
                rs.forEach(r => {
                    if (r && bs.some(x => x.id == r.id)) return;
                    if (r) bs.push(r);
                })
                this.action.syncBlocks = bs;
                if (rs.some(s => s === null)) {
                    this.action.syncPage = true;
                }
                lodash.remove(this.action.syncBlocks, g => g === null);
            });
            if (!(Array.isArray(this.action.syncBlocks) && this.action.syncBlocks.length > 0)) {
                if (typeof this.action.syncPage == 'undefined') this.action.syncPage = true;
            }
        }
        catch (ex) {
            console.error(ex);
            this.page.onError(ex);
        }
        if (options?.disabledStore == true) return;
        this.store(options)
    }
    private ops = new Map<OperatorDirective, { redo: (userOperator: UserOperator, source: 'redo' | 'load' | 'loadSyncBlock' | 'notify' | 'notifyView', action: UserAction) => Promise<void>, undo: (userOperator: UserOperator) => Promise<void> }>();
    /**
     * 
     * 如果source不等于redo，说明是页面自动加载的
     * 如果source等于redo，说明是撤消回滚的
     * 如果不为redo时，有部分对数据的操作将不在执行
     * 
     * @param directive 
     * @param redo 
     * @param undo 
     */
    registerOperator(directive: OperatorDirective, redo: (userOperator: UserOperator, source: 'redo' | 'load' | 'loadSyncBlock' | 'notify' | 'notifyView', action: UserAction) => Promise<void>, undo: (userOperator: UserOperator) => Promise<void>) {
        this.ops.set(directive, { redo, undo });
    }
    async redo() {
        await this.historyRecord.redo(async (action) => {
            if (this.action.directive == ActionDirective.onRedo) {
                this.action.directive = 'onRedo.' + (typeof action.directive == 'number' ? ActionDirective[action.directive] : action.directive);
            }
            if (Array.isArray(action?.operators)) {
                for (let i = 0; i < action.operators.length; i++) {
                    let op = action.operators[i];
                    var command = this.ops.get(op.directive);
                    if (command) {
                        await command.redo(op, 'redo', action);
                    }
                    else this.emit("warn", new Error(lst('没在注册动作指令在历史记快照中')))
                }
                this.emit('redo', action)
            }
        })
    }
    async undo() {
        await this.historyRecord.undo(async (action) => {
            if (this.action.directive == ActionDirective.onUndo) {
                this.action.directive = 'onUndo.' + (typeof action.directive == 'number' ? ActionDirective[action.directive] : action.directive);
            }
            if (Array.isArray(action?.operators)) {
                for (let i = action.operators.length - 1; i >= 0; i--) {
                    let op = action.operators[i];
                    var command = this.ops.get(op.directive);
                    if (command) {
                        await command.undo(op);
                    }
                    else this.emit("warn", new Error(lst('没在注册动作指令在历史记快照中')))
                }
                this.emit('undo', action)
            }
        })
    }
    async redoUserAction(action: UserAction, source: 'load' | 'loadSyncBlock' | 'notify' | 'notifyView') {
        if (Array.isArray(action?.operators)) {
            for (let i = 0; i < action.operators.length; i++) {
                let op = action.operators[i];
                var command = this.ops.get(op.directive);
                if (command) await command.redo(op, source, action);
                else this.emit("warn", new Error(lst('没在注册动作指令在历史记快照中')))
            }
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

    record(directive: OperatorDirective.pageTurnLayout, data: { old: PageLayoutType, new: PlaybackDirection, old_page_data: Record<string, any>, new_page_data: Record<string, any> }, obj: HistorySnapshootObject);
    record(directive: OperatorDirective.pageUpdateProp, data: { old: Record<string, any>, new: Record<string, any> }, obj: HistorySnapshootObject);
    record(directive: OperatorDirective.delete, data: { parentId: string, childKey?: string, at?: number, data: Record<string, any> }, obj: HistorySnapshootObject);
    record(directive: OperatorDirective.create, data: { parentId: string, childKey?: string, at?: number, data: Record<string, any> }, obj: HistorySnapshootObject);
    record(directive: OperatorDirective.append, data: { to: { parentId: string, childKey?: string, at?: number }, from: { parentId: string, childKey?: string, at?: number }, blockId: string }, obj: HistorySnapshootObject);
    record(directive: OperatorDirective.updateProp, data: { blockId: string, old: any, new: any }, obj: HistorySnapshootObject);
    record(directive: OperatorDirective.updatePropMatrix, data: { blockId: string, old: number[], new: number[] }, obj: HistorySnapshootObject);
    record(directive: OperatorDirective.arrayPropInsert, data: { blockId: string, at: number, data: Record<string, any>, propKey: string }, obj: HistorySnapshootObject);
    record(directive: OperatorDirective.arrayPropRemove, data: { blockId: string, at: number, data: Record<string, any>, propKey: string }, obj: HistorySnapshootObject);
    record(directive: OperatorDirective.arrayPropUpdate, data: { blockId: string, at: number, old: Record<string, any>, new: Record<string, any>, propKey: string }, HistorySnapshootObject);
    record(directive: OperatorDirective.insertStyle, data: { blockId: string, at: number, data: Record<string, any> }, obj: HistorySnapshootObject);
    record(directive: OperatorDirective.mergeStyle, data: { blockId: string, styleId: string, old: Record<string, any>, new: Record<string, any> }, obj: HistorySnapshootObject);

    record(directive: OperatorDirective.schemaRowUpdate, data: { schemaId: string, id: string, old: Record<string, any>, new: Record<string, any> }, obj: HistorySnapshootObject);
    record(directive: OperatorDirective.schemaCreateRow, data: { schemaId: string, data: Record<string, any> }, obj: HistorySnapshootObject);
    record(directive: OperatorDirective.schemaRowRemove, data: { schemaId: string, data: Record<string, any> }, obj: HistorySnapshootObject);
    record(directive: OperatorDirective.keepCursorOffset, data: { blockId: string, prop: string, old: number, new: number }, obj: HistorySnapshootObject);
    record(directive: OperatorDirective.changeCursorPos, data: { old_value: { start: AppearCursorPos, end: AppearCursorPos, blocks: SnapshootBlockPos[] }, new_value: { start: AppearCursorPos, end: AppearCursorPos, blocks: SnapshootBlockPos[] } }, obj: HistorySnapshootObject)


    record(directive: OperatorDirective.$create, data: { pos: SnapshootBlockPos, data: Record<string, any> }, obj: HistorySnapshootObject);
    record(directive: OperatorDirective.$delete, data: { pos: SnapshootBlockPos, data: Record<string, any> }, obj: HistorySnapshootObject);
    record(directive: OperatorDirective.$move, data: { from: SnapshootBlockPos, to: SnapshootBlockPos }, obj: HistorySnapshootObject);
    record(directive: OperatorDirective.$turn, data: { pos: SnapshootBlockPos, from: string, to: string }, obj: HistorySnapshootObject);
    record(directive: OperatorDirective.$update, data: { pos: SnapshootBlockPropPos, old_value: any, new_value: any, render: BlockRenderRange }, obj: HistorySnapshootObject);
    record(directive: OperatorDirective.$change_cursor_offset, data: { old_value: { start: AppearCursorPos, end: AppearCursorPos, blocks: SnapshootBlockPos[] }, new_value: { start: AppearCursorPos, end: AppearCursorPos, blocks: SnapshootBlockPos[] } }, obj: HistorySnapshootObject)
    record(directive: OperatorDirective.$pick_blocks, data: { old_value: { blocks: SnapshootBlockPos[] }, new_value: { blocks: SnapshootBlockPos[] } }, obj: HistorySnapshootObject)

    record(directive: OperatorDirective.$map_splice, data: { pos: SnapshootBlockPropPos, delete_map?: any, insert_map?: any }, obj: HistorySnapshootObject);
    record(directive: OperatorDirective.$text_splice, data: { pos: SnapshootBlockPropPos, start: number, end?: number, delete_text?: string, insert_text: string }, obj: HistorySnapshootObject);
    record(directive: OperatorDirective.$array_create, data: { pos: SnapshootBlockPropPos, data: any }, obj: HistorySnapshootObject);
    record(directive: OperatorDirective.$array_delete, data: { pos: SnapshootBlockPropPos, data: any }, obj: HistorySnapshootObject);
    record(directive: OperatorDirective.$array_update, data: { pos: SnapshootBlockPropPos, old_value: any, new_value: any }, obj: HistorySnapshootObject);
    record(directive: OperatorDirective.$array_move, data: { pos: SnapshootBlockPropPos, from: number, to: number }, obj: HistorySnapshootObject);
    record(directive: OperatorDirective.$insert_style, data: { pos: SnapshootBlockStylePos, data: Record<string, any> }, obj: HistorySnapshootObject);
    record(directive: OperatorDirective.$delete_style, data: { pos: SnapshootBlockStylePos, data: Record<string, any> }, obj: HistorySnapshootObject);
    record(directive: OperatorDirective.$merge_style, data: { pos: SnapshootBlockStylePos, old_value: any, new_value: any }, obj: HistorySnapshootObject);


    record(directive: OperatorDirective.$data_grid_trun_view, data: { pos: SnapshootBlockPos, from: string, to: string }, obj: HistorySnapshootObject);
    record(directive: OperatorDirective.$data_grid_trun_view_new, data: { from: SnapshootDataGridViewPos, to: SnapshootDataGridViewPos }, obj: HistorySnapshootObject);
    record(directive: OperatorDirective.$data_grid_change_view_url, data: { pos: SnapshootBlockPos, from: string, to: string }, obj: HistorySnapshootObject);

}

export type HistorySnapshootObject = Block | Page | TableSchema;
export type SnapshootBlockPos = {
    blockId?: string,
    pageId?: string,
    parents?: string[],
    parentId?: string,
    childKey?: string,
    at?: number,
    prevBlockId?: string,
    nextBlockId?: string,
    elementUrl?: string
}

export type SnapshootBlockPropPos = {
    /**
     * 支持json xpath 简单路径,参考lodash对xpath的支持
     */
    prop: string,

    arrayId?: string,
    arrayAt?: number,
    arrayPrevId?: string,
    arrayNextId?: string

} & SnapshootBlockPos

export type SnapshootBlockStylePos = {
    styleId: string
} & SnapshootBlockPos

export type AppearCursorPos = {
    blockId: string,
    prop: string,
    appear: BlockAppear,
    offset: number
}


export type SnapshootDataGridViewPos = {
    schemaId: string,
    viewId: string,
    viewUrl?: string,
    type?: 'view' | 'form'
} & SnapshootBlockPos