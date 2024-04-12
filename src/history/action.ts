import { ActionDirective, OperatorDirective } from "./declare";
import { Block } from "../block";
import { Page } from "../page";
import { channel } from "../../net/channel";
import { util } from "../../util/util";

export class UserOperator {
    directive: OperatorDirective;
    data: Record<string, any>;
    isLocal: boolean;
    obj: Block | Page;
    toString() {
        return `{${OperatorDirective[this.directive]}->${JSON.stringify(this.data)}}`
    }
    get() {
        return {
            directive: this.directive,
            data: util.clone(this.data),
            blockId: this.obj instanceof Block ? this.obj.id : undefined,
            pageId: this.obj instanceof Page ? this.obj.id : undefined
        }
    }
}

export class UserAction {
    id: string;
    userid: string;
    startDate: number;
    endDate: number;
    /**
     * 系统时间，用户调整用户的操作指令
     */
    seq: number;
    directive: ActionDirective | string;
    operators: UserOperator[] = [];
    syncBlocks?: Block[];
    syncBlockIds?: string[];
    syncPage?: boolean;
    immediate?: boolean;
    elementUrl?: string
    constructor() {
        this.id = channel.query('/guid');
    }
    toString() {
        return `[${this.endDate - this.startDate}ms]${this.userid}:${typeof this.directive == 'string' ? this.directive : ActionDirective[this.directive]}${this.operators.map(oper => oper.toString())}`
    }
    get(): Partial<UserAction> {
        return {
            id: this.id,
            userid: this.userid,
            startDate: this.startDate,
            endDate: this.endDate,
            seq: this.seq,
            immediate: this.immediate,
            syncPage: this.syncPage,
            syncBlockIds: Array.isArray(this.syncBlocks) ? this.syncBlocks.map(b => b.id) : undefined,
            directive: this.directive,
            operators: this.operators.findAll(op => op.isLocal !== true).map(op => { return op.get() }) as any
        }
    }
    get isEmpty() {
        return this.operators.length > 0 ? false : true
    }
    /**
     * 
     * @returns 是否是光标操作,如果是光标操作，光标并没有改变页面的数据，只是改变了光标的位置
     */
    isCursorOperator() {
        return [
            'onCollapse',
            'onFocusAppearAnchor',
            'onSetTextSelection',
            'onSelectBlocks',
            'onCatchWindowSelection'
        ].includes(typeof this.directive == 'number' ? UserAction[this.directive] : this.directive)
    }
}

export type ViewOperate = {
    operate?: UserAction,
    seq: number
}