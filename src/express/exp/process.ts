

import { ExpType } from "./declare";
import { Exp } from "./exp";
export class ExpProcess {
    _callbackLog: (level: 'info' | 'warn' | 'error', msg: string) => void;
    constructor(args: { name: string, type: ExpType }[], callbackLog: (level: 'info' | 'warn' | 'error', msg: string) => void) {
        this.args = args;
        this._callbackLog = callbackLog;
    }
    bindExp(exp: Exp) {
        this.exp = exp;
        this.exp._process = this;
    }
    exp: Exp;
    args: { name: string, type: ExpType }[] = [];
    log(level: 'info' | 'warn' | 'error', msg: string) {
        if (typeof this._callbackLog == 'function')
            this._callbackLog(level, msg);
    }
    check() {
        var self = this;
        function checkPredict(exp: Exp) {
            exp.check();
        }
        this.exp.each(checkPredict);
    }
}