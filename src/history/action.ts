import { User } from "../types/user";
import { util } from "../util/util";
import { ActionDirective, OperatorDirective } from "./declare";

export interface UserOperator {
    directive: OperatorDirective;
    data:Record<string,any>
}

export class UserAction {
    id: string;
    user: User;
    startDate: number;
    endDate:number;
    /**
     * 系统时间，用户调整用户的操作指令
     */
    systemClock: number;
    directive: ActionDirective;
    operators: UserOperator[] = [];
    constructor() {
        this.id = util.guid();
    }
}