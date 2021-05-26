import { User } from "../types/user";
import { ActionDirective, OperatorDirective } from "./declare";
export declare class UserOperator {
    directive: OperatorDirective;
    data: Record<string, any>;
    toString(): string;
}
export declare class UserAction {
    id: string;
    user: User;
    startDate: number;
    endDate: number;
    /**
     * 系统时间，用户调整用户的操作指令
     */
    systemClock: number;
    directive: ActionDirective | string;
    operators: UserOperator[];
    constructor();
    toString(): string;
}
