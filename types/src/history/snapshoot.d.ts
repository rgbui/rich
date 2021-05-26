import { Page } from "../page";
import { Events } from "../util/events";
import { UserAction } from "./action";
import { ActionDirective, OperatorDirective } from "./declare";
import { HistoryRecord } from "./record";
/***
 * 用户的所有操作快照，
 * 只要操作，则记录，该记录的所有历史则成为一个版本
 */
export declare class HistorySnapshoot extends Events {
    historyRecord: HistoryRecord;
    action: UserAction;
    page: Page;
    constructor(page: Page);
    declare(directive: ActionDirective | string): void;
    private _pause;
    pause(): void;
    start(): void;
    store(): void;
    sync(directive: ActionDirective | string, action: () => Promise<void>): Promise<void>;
}
export interface HistorySnapshoot {
    record(directive: OperatorDirective.updateText, data: {
        blockId: string;
        old: string;
        new: string;
    }): any;
    record(directive: OperatorDirective.delete, data: {
        parentId: string;
        childKey?: string;
        at?: number;
        preBlockId?: string;
        data: Record<string, any>;
    }): any;
    record(directive: OperatorDirective.remove, data: {
        parentId: string;
        childKey?: string;
        at?: number;
        preBlockId?: string;
    }): any;
    record(directive: OperatorDirective.updateProp, data: {
        blockId: string;
        old: any;
        new: any;
    }): any;
    record(directive: OperatorDirective.create, data: {
        parentId: string;
        childKey?: string;
        at?: number;
        preBlockId?: string;
        data: Record<string, any>;
    }): any;
    record(directive: OperatorDirective.append, data: {
        parentId: string;
        childKey?: string;
        blockId: string;
        at?: number;
        preBlockId?: string;
    }): any;
    /**
     * 替换文本内容，表示在[start,end]之间替成成text
     * @param directive
     * @param data
     */
    record(directive: OperatorDirective.updateTextReplace, data: {
        blockId: string;
        start: number;
        end: number;
        text: string;
    }): any;
    /**
     * 删除的内容，区间表示[end,start],删除的内容为text
     * 这里的start一般会比end大，表示从start位置删除文字
     * @param directive
     * @param data
     */
    record(directive: OperatorDirective.updateTextDelete, data: {
        blockId: string;
        start: number;
        end: number;
        text: string;
    }): any;
    record(directive: OperatorDirective.arrayPropInsert, data: {
        blockId: string;
        at: number;
        data: Record<string, any>;
        propKey: string;
    }): any;
    record(directive: OperatorDirective.arrayPropRemove, data: {
        blockId: string;
        at: number;
        data: Record<string, any>;
        propKey: string;
    }): any;
    record(directive: OperatorDirective.arrayPropUpdate, data: {
        blockId: string;
        at: number;
        old: Record<string, any>;
        new: Record<string, any>;
        propKey: string;
    }): any;
    record(directive: OperatorDirective.insertStyle, data: {
        blockId: string;
        at: number;
        data: Record<string, any>;
    }): any;
    record(directive: OperatorDirective.mergeStyle, data: {
        blockId: string;
        styleId: string;
        old: Record<string, any>;
        new: Record<string, any>;
    }): any;
}
