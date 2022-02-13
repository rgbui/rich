import { ActionDirective, OperatorDirective } from "./declare";
import { Block } from "../block";
import { Page } from "../page";
import { channel } from "../../net/channel";
import { util } from "../../util/util";

export class UserOperator {
    directive: OperatorDirective;
    data: Record<string, any>;
    obj: Block | Page;
    isSyncBlock: boolean;
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
    constructor() {
        this.id = channel.query('/guid');
    }
    toString() {
        return `[${this.endDate - this.startDate}ms]${this.userid}:${typeof this.directive == 'string' ? this.directive : ActionDirective[this.directive]}${this.operators.map(oper => oper.toString())}`
    }
    syncBlock() {
        var syncBlocks: Block[] = [];
        this.operators.forEach(op => {
            if (op.isSyncBlock == false) return;
            if (op.obj instanceof Block) {
                var b = op.obj.syncBlock;
                if (b) syncBlocks.push(b);
            }
        });
        return syncBlocks;
    }
    get() {
        return {
            id: this.id,
            userid: this.userid,
            startDate: this.startDate,
            endDate: this.endDate,
            seq: this.seq,
            directive: this.directive,
            operators: this.operators.map(op => { return op.get() })
        }
    }
}