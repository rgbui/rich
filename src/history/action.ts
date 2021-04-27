import { User } from "../types/user";
import { util } from "../util/util";
import { ActionDirective, OperatorDirective } from "./declare";

export class UserOperator {
    directive: OperatorDirective;
    data: Record<string, any>;
    toString() {
        return `{${OperatorDirective[this.directive]}->${JSON.stringify(this.data)}}`
    }
}

export class UserAction {
    id: string;
    user: User;
    startDate: number;
    endDate: number;
    /**
     * 系统时间，用户调整用户的操作指令
     */
    systemClock: number;
    directive: ActionDirective|string;
    operators: UserOperator[] = [];
    constructor() {
        this.id = util.guid();
    }
    toString() {
        return `[${this.endDate - this.startDate}ms]${this.user.name}:${ActionDirective[this.directive]}${this.operators.map(oper => oper.toString())}`
    }
}