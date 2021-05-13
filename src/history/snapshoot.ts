import { Page } from "../page";
import { Events } from "../util/events";
import { util } from "../util/util";
import { UserAction, UserOperator } from "./action";
import { ActionDirective, OperatorDirective } from "./declare";
import { HistoryRecord } from "./record";
/***
 * 用户的所有操作快照，
 * 只要操作，则记录，该记录的所有历史则成为一个版本
 */
export class HistorySnapshoot extends Events {
    historyRecord: HistoryRecord;
    action: UserAction;
    page: Page;
    constructor(page: Page) {
        super();
        this.page = page;
        this.historyRecord = new HistoryRecord();
    }
    declare(directive: ActionDirective | string) {
        if (this.action) {
            throw 'the last action is null,but not ,why happend?'
        }
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
}

export interface HistorySnapshoot {
    record(directive: OperatorDirective.updateText, data: { blockId: string, old: string, new: string });
    record(directive: OperatorDirective.delete, data: { parentId: string, childKey?: string, at?: number, preBlockId?: string, data: Record<string, any> });
    record(directive: OperatorDirective.remove, data: { parentId: string, childKey?: string, at?: number, preBlockId?: string });
    record(directive: OperatorDirective.updateProp, data: { blockId: string, old: any, new: any });
    record(directive: OperatorDirective.create, data: { parentId: string, childKey?: string, at?: number, preBlockId?: string, data: Record<string, any> });
    record(directive: OperatorDirective.append, data: { parentId: string, childKey?: string, blockId: string, at?: number, preBlockId?: string });

    /**
     * 替换文本内容，表示在[start,end]之间替成成text
     * @param directive 
     * @param data 
     */
    record(directive: OperatorDirective.updateTextReplace, data: { blockId: string, start: number, end: number, text: string });
    /**
     * 删除的内容，区间表示[end,start],删除的内容为text
     * 这里的start一般会比end大，表示从start位置删除文字
     * @param directive 
     * @param data 
     */
    record(directive: OperatorDirective.updateTextDelete, data: { blockId: string, start: number, end: number, text: string });
    record(directive: OperatorDirective.arrayPropInsert, data: { blockId: string, at: number, data: Record<string, any>, propKey: string });
    record(directive: OperatorDirective.arrayPropRemove, data: { blockId: string, at: number, data: Record<string, any>, propKey: string });
    record(directive: OperatorDirective.arrayPropUpdate, data: { blockId: string, at: number, old: Record<string, any>, new: Record<string, any>, propKey: string });
    record(directive: OperatorDirective.insertStyle, data: { blockId: string, at: number, data: Record<string, any> });
    record(directive: OperatorDirective.mergeStyle, data: { blockId: string, styleId: string, old: Record<string, any>, new: Record<string, any> });
}