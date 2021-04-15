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
    declare(directive: ActionDirective) {
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
    record(directive: OperatorDirective.updateContent, data: { blockId: string, old: string, new: string });
}