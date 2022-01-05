import { Exp } from "./exp";
import { Token, TokenType } from "../token/token";
var ops = [
    { "operator": "+", "level": 4 },
    { "operator": "-", "level": 4 },
    { "operator": "*", "level": 3 },
    { "operator": "/", "level": 3 },
    { "operator": "%", "level": 3 },
    //{ "operator": "?", "level": 0 },
    //{ "operator": "=", "level": 0 },
    { "operator": "==", "level": 7 },
    { "operator": "&&", "level": 11 },
    { "operator": "||", "level": 12 },
    { "operator": "!", "level": 2, arity: 1 },
    { "operator": "!=", "level": 7 },
    { "operator": ">", "level": 6 },
    { "operator": "<", "level": 6 },
    { "operator": ">=", "level": 6 },
    { "operator": "<=", "level": 6 },
    { "operator": ".", "level": 2 }
]
export class TokenCovertToExpress {
    log: (level: 'warn' | 'error' | 'info', msg: string) => void;
    unitCovertToExp(tokens: Token[]) {
        removeTokens(tokens, x => x.name == TokenType.white || x.name == TokenType.line);
        if (tokens.some(s => s.name == TokenType.bracket_open && s.value == '[')) {
            var sr = tokens.find(s => s.name == TokenType.bracket_open && s.value == '[');
            var front = splitTokens(tokens, g => g === sr);
            if (front[0].length > 0) {
                var va = front[0].find(g => g.name == TokenType.word);
                if (va) {
                    var exp = new Exp('[]');
                    exp.value = va.value;
                    exp.push(this.covertToExpress(sr.childs));
                    return exp;
                }
            }
            return this.covertArrayExpress(sr.childs);
        }
        else if (tokens.some(s => s.name == TokenType.bracket_open && s.value == '(')) {
            var sr = tokens.find(s => s.name == TokenType.bracket_open && s.value == '(');
            var front = splitTokens(tokens, g => g === sr);
            if (front && front[0].length > 0) {
                var va = front[0].find(g => g.name == TokenType.word);
                if (va) {
                    var exp = new Exp('fun');
                    exp.value = va.value;
                    var ts = sr.childs;
                    var tr = splitTokens(ts, g => g.name == TokenType.delimiter && g.value == ',');
                    for (let i = 0; i < tr.length; i++) {
                        exp.push(this.covertToExpress(tr[i]));
                    }
                    return exp;
                }
            }
            return this.covertToExpress(sr.childs);
        }
        else {
            if (tokens.length > 0) {
                if (tokens.length > 1) {
                    if (typeof this.log == 'function') this.log('warn', '语法错误，连续的运算符，没有表达式')
                }
                var token = tokens[0];
                if (token) {
                    if (token instanceof Exp) return token;
                    else if (token.name == TokenType.quote_open) {
                        var exp = new Exp('string');
                        exp.value = token.childs.map(c => c.value).join('');
                        return exp;
                    }
                    else if (token.name == TokenType.keyword) {
                        var exp = new Exp('constant');
                        if (token.value == 'true') exp.value = true;
                        else if (token.value == 'false') exp.value = false;
                        else if (token.value == 'null') exp.value = null;
                        return exp;
                    }
                    else if (token.name == TokenType.word) {
                        var exp = new Exp('variable');
                        exp.value = token.value;
                        return exp;
                    }
                    else if (token.name == TokenType.number) {
                        var exp = new Exp('number');
                        exp.value = parseFloat(token.value);
                        return exp;
                    }
                }
                else {
                    return tokens;
                }
            }
        }
    }
    /**
     * 含有运算符的转转表达式
     * @param tokens 
     * @returns 
     */
    operatorCovertToExp(tokens: Token[]) {
        removeTokens(tokens, x => x.name == TokenType.white || x.name == TokenType.line);
        var op = tokens.find(g => g.name == TokenType.operator);
        var rs = splitTokens(tokens, g => g == op);
        var r1 = rs[0];
        var r2 = rs[1];
        var exp = new Exp(op.value as any);
        if (op.value == '.') {
            if (r1) {
                var leftExpress = this.covertToExpress(r1);
                exp.push(leftExpress);
            }
            if (r2) {
                var v = r2.find(g => g.name == TokenType.word);
                if (v) {
                    exp.key = v.value;
                }
            }
        }
        else {
            if (op.value != '!') {
                if (r1) {
                    var leftExpress = this.covertToExpress(r1);
                    exp.push(leftExpress);
                }
            }
            if (r2) {
                var leftExpress = this.covertToExpress(r2);
                exp.push(leftExpress);
            }
        }
        return exp;
    }
    /**
     * 复杂的运算表达式，会比较运算符优级
     * @param tokens 
     * @returns 
     */
    covertToExpress(tokens: Token[]) {
        var self = this;
        removeTokens(tokens, x => x.name == TokenType.white || x.name == TokenType.line);
        /**
         * 找到两个运算符，
         * 进行优先级比较,优先级低的先合成exp,优先级高的后合成exp
         * 如果是单目运算符，直接转换成exp
         * 如果是二级运算符，需要比较运算符优先级
         * 如果是三级运算符，则需要优先提取三级运算符(三级运算符优先级最高)
         * 
         */
        if (tokens.some(s => s.name == TokenType.operator && s.value == '?')) {
            /**
             * 分三节 exp?exp:exp;
             */
            var frontTokens = splitSecondTokens(tokens, g => g.name == TokenType.operator && g.value == '?');
            var backTokens = splitSecondTokens(frontTokens[1], g => g.name == TokenType.delimiter && g.value == ':');
            var exp = new Exp('?:');
            exp.push(this.covertToExpress(frontTokens[0]));
            exp.push(this.covertToExpress(backTokens[0]));
            exp.push(this.covertToExpress(backTokens[1]));
            return exp;
        }
        else if (tokens.some(s => s.name == TokenType.operator)) {
            function covertTs(ts: (Token | Exp)[]) {
                var firstOperator = ts.find(g => g instanceof Token && g.name == TokenType.operator);
                var secondOperator = ts.find(g => g instanceof Token && g.name == TokenType.operator && g !== firstOperator);
                if (firstOperator && !secondOperator) {
                    return self.operatorCovertToExp(ts as Token[]);
                }
                else if (firstOperator && secondOperator) {
                    /**
                     * https://www.cnblogs.com/gavin-yao/p/10595835.html
                     * 
                     */
                    var rs = splitTokens(ts as Token[], g => g instanceof Token && (g === firstOperator || g === secondOperator));
                    var r1 = rs[0];
                    var r2 = rs[1];
                    var r3 = rs[2];
                    var op1 = ops.find(g => g.operator == firstOperator.value);
                    var op2 = ops.find(g => g.operator == secondOperator.value);
                    if (op1.level <= op2.level) {
                        var leftExp = self.operatorCovertToExp([...r1, firstOperator, ...r2] as Token[]);
                        return covertTs([leftExp, secondOperator, ...r3]);
                    }
                    else {
                        var exp = new Exp(firstOperator.value as any);
                        var rightExp = covertTs([...r2, secondOperator, ...r3]);
                        exp.push(self.unitCovertToExp(r1));
                        exp.push(rightExp);
                        return exp;
                    }
                }
            }
            return covertTs(tokens);
        }
        else {
            //没检测到运算符的
            return self.unitCovertToExp(tokens);
        }
        return null;
    }
    covertObjectExpress(tokens: Token[]) {
        removeTokens(tokens, x => x.name == TokenType.white || x.name == TokenType.line);
        var ts = splitTokens(tokens, x => x.name == TokenType.delimiter && x.value == ',');
        var exp = new Exp('{');
        ts.forEach(t => {
            var tn = splitTokens(t, g => g.name == TokenType.delimiter && g.value == ':');
            var objItem = new Exp('{,');
            objItem.value = tn[0][0].value;
            objItem.push(this.covertToExpress(tn[1]));
            exp.push(objItem);
        })
        return exp;
    }
    covertArrayExpress(tokens: Token[]) {
        removeTokens(tokens, x => x.name == TokenType.white || x.name == TokenType.line);
        var ts = splitTokens(tokens, x => x.name == TokenType.delimiter && x.value == ',');
        var exp = new Exp('[');
        ts.forEach(t => {
            var childExp = this.covertToExpress(t);
            exp.push(childExp);
        })
        return exp;
    }
    covertStatementToExpress(tokens: Token[]) {
        /**
        * 这里需要做个探测
        * 它是数据呢如[],{ }
        * 还是仅仅只是一个表达式 exp
        * 还是有多条语句
        */
        removeTokens(tokens, x => x.name == TokenType.white || x.name == TokenType.line);
        if (tokens[0].value == '[') {
            return this.covertArrayExpress(tokens[0].childs);
        }
        else if (tokens[0].value == '{') {
            return this.covertObjectExpress(tokens[0].childs);
        }
        else if (tokens.some(s => s.name == TokenType.delimiter && s.value == ';')) {
            /**
             * 这有多个语句
             */
            var sr = splitTokens(tokens, s => s.name == TokenType.delimiter && s.value == ';');
            return sr.map(s => {
                var exp = new Exp('statement');
                var child = this.covertStatementToExpress(s);
                exp.push(child);
                return exp;
            })
        }
        else if (tokens.some(s => s.name == TokenType.operator && (s.value != '==' && s.value.indexOf('=') > -1))) {
            /**
             * 赋值语句
             */
            var sr = splitTokens(tokens, s => s.name == TokenType.operator && (s.value != '==' && s.value.indexOf('=') > -1));
        }
        else {
            /***
             * 这里认为是一个表达式
             */
            return this.covertToExpress(tokens);
        }
    }
    covertTokenToExpress(token: Token) {
        if (token.name == TokenType.root) {
            //根token
            var childs = token.childs;
            var e = this.covertStatementToExpress(childs);
            var exp = new Exp('root');
            exp.push(e);
            return exp;
        }
    }
}


/**
 * 拆分多批
 * 注意 假如有两个拆分点，那么一定返回三组，三组分别代表第一个拆分点的左边、右边、第二个拆分点的右边
 * 
 * @param tokens 
 * @param splitPredict 
 * @returns 
 */
function splitTokens(tokens: Token[], splitPredict: (token: Token) => boolean) {
    var rs: Token[][] = [];
    if (tokens.length > 0) {
        var ns: Token[] = [];
        for (let i = 0; i < tokens.length; i++) {
            if (splitPredict(tokens[i])) {
                rs.push(ns);
                ns = [];
            }
            else ns.push(tokens[i])
        }
        rs.push(ns);
    }
    return rs;
}
/**
 * 拆分两批
 * @param tokens 
 * @param splitPredict 
 */
function splitSecondTokens(tokens: Token[], splitPredict: (token: Token) => boolean) {
    for (let i = 0; i < tokens.length; i++) {
        if (splitPredict(tokens[i])) {
            return [
                tokens.slice(0, i),
                tokens.slice(i + 1)
            ]
        }
    }
}
function removeTokens(tokens: Token[], predict: (token: Token) => boolean) {
    for (let i = tokens.length - 1; i >= 0; i--) {
        if (predict(tokens[i]))
            tokens.splice(i, 1);
    }
}
