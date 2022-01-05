import { TokenCovertToExpress } from "./exp/convert";
import { ExpType } from "./exp/declare";
import { ExpProcess } from "./exp/process";
import { Tokenizer } from "./token/tokenizer";

/**
 * 
 * @param args 
 * @param express 
 * 
 * 
 */
export function checkExpressType(express: string, args?: { name: string, type: ExpType }[], log?: (level: string, msg: string) => void) {
    if (!Array.isArray(args)) args = [];
    var tokenizer = new Tokenizer();
    var rootToken = tokenizer.parse(express);
    tokenizer.error = function (error) {
        if (typeof log == 'function') {
            log('error', error);
        }
    }
    var tp = new TokenCovertToExpress();
    tp.log = function (level, error) {
        if (typeof log == 'function') {
            log(level, error);
        }
    }
    var exp = tp.covertTokenToExpress(rootToken);
    var expProcess = new ExpProcess(args, log);
    expProcess.bindExp(exp);
    expProcess.check();
    return exp.type;
}

