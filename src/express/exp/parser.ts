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
    { "operator": "!", "level": 2 },
    { "operator": "!=", "level": 7 },
    { "operator": ">", "level": 6 },
    { "operator": "<", "level": 6 },
    { "operator": ">=", "level": 6 },
    { "operator": "<=", "level": 6 },
    { "operator": "[", "level": 1 },
    { "operator": "(", level: 1 },
    { "operator": ".", "level": 1 }
];
const predictTokenOpertor = (g) => g instanceof Token && (g.name == TokenType.operator || g.name == TokenType.bracket_open && g.value == '[' || g.name == TokenType.bracket_open && g.value == '(');
export class ExpressParser {
    log: (level: 'warn' | 'error' | 'info', msg: string) => void;
    toUnit(tokens: Token[]) {
        this.removeTokens(tokens, x => x.name == TokenType.white || x.name == TokenType.line);
        if (tokens.length > 0) {
            if (tokens.length == 1) {
                var token = tokens[0];
                if (token) {
                    if (token instanceof Exp) return token;
                    else if (token.name == TokenType.quote_open) {
                        var exp = new Exp('string');
                        exp.value = token.childs.map(c => c.value).join('');
                        exp.referToken(...token.childs)
                        return exp;
                    }
                    else if (token.name == TokenType.keyword) {
                        var exp = new Exp('constant');
                        if (token.value == 'true') exp.value = true;
                        else if (token.value == 'false') exp.value = false;
                        else if (token.value == 'null') exp.value = null;
                        exp.referToken(token);
                        return exp;
                    }
                    else if (token.name == TokenType.word) {
                        var exp = new Exp('variable');
                        exp.value = token.value;
                        exp.referToken(token);
                        return exp;
                    }
                    else if (token.name == TokenType.number) {
                        var exp = new Exp('number');
                        exp.value = parseFloat(token.value);
                        exp.referToken(token);
                        return exp;
                    }
                }
            }
            else if (tokens[0].name == TokenType.quote_open) {
                var token = tokens[0];
                var exp = new Exp('string');
                exp.value = token.childs.map(c => c.value).join('');
                exp.referToken(...token.childs)
                return exp;
            }
            else {
                console.log(tokens)
                this.log('error', '无法识别的token')
            }
        }
    }
    /**
     * 含有运算符的转换表达式
     * @param tokens 
     * @returns 
     */
    toOperator(tokens: Token[], rightExp?: Exp) {
        this.removeTokens(tokens, x => x.name == TokenType.white || x.name == TokenType.line);
        var op = tokens.find(predictTokenOpertor);
        var rs = this.splitTokens(tokens, g => g == op);
        var r1 = rs[0];
        var r2 = rs[1];
        var exp = new Exp(op.value as any);
        exp.referToken(op);
        if (op.value == '.') {
            if (r1) {
                var leftExpress = this.calcExpress(r1);
                exp.push(leftExpress);
            }
            if (r2) {
                var v = r2.find(g => g.name == TokenType.word);
                if (v) {
                    exp.key = v.value;
                }
            }
        }
        else if (op.value == '[') {
            if (!r1) {
                //说明是数组，没有被调用
                return this.toArray(op.childs);
            }
            else {
                exp = new Exp('[]');
                exp.referToken(op);
                if (r1) {
                    var leftExpress = this.calcExpress(r1);
                    exp.push(leftExpress);
                }
                r2 = op.childs;
                if (r2) {
                    var leftExpress = this.calcExpress(r2);
                    exp.push(leftExpress);
                }
            }
        }
        else if (op.value == '(') {
            // if (r2?.length > 0) {
            //     this.log('error', '括号()右侧未识别的表达式')
            // }
            //说明是函数
            if (r1.length > 0) {
                exp = new Exp('fun');
                exp.referToken(op);
                var leftExpress = this.calcExpress(r1);
                exp.push(leftExpress);
                var ts = op.childs;
                var tr = this.splitTokens(ts, g => g.name == TokenType.delimiter && g.value == ',');
                for (let i = 0; i < tr.length; i++) {
                    exp.push(this.calcExpress(tr[i]));
                }
                return exp;
            }
            else {
                //说明只是单纯的括号调整优先级
                return this.calcExpress(op.childs);
            }
        }
        else {
            if (op.value == '!') {
                if (rightExp) exp.push(rightExp)
                else if (r2) exp.push(this.toUnit(r2))
            }
            else {
                if (r1) exp.push(this.calcExpress(r1))
                if (rightExp) exp.push(rightExp)
                else if (r2) exp.push(this.calcExpress(r2))
            }
        }
        return exp;
    }
    /**
     * 复杂的运算表达式，会比较运算符优级
     * @param tokens 
     * @returns 
     */
    calcExpress(tokens: Token[]) {
        var self = this;
        this.removeTokens(tokens, x => x.name == TokenType.white || x.name == TokenType.line);
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
            var frontTokens = self.splitSecondTokens(tokens, g => g.name == TokenType.operator && g.value == '?');
            var backTokens = self.splitSecondTokens(frontTokens[1], g => g.name == TokenType.delimiter && g.value == ':');
            var exp = new Exp('?:');
            exp.push(this.calcExpress(frontTokens[0]));
            exp.push(this.calcExpress(backTokens[0]));
            exp.push(this.calcExpress(backTokens[1]));
            return exp;
        }
        else if (tokens.some(predictTokenOpertor)) {
            function covertTs(ts: (Token | Exp)[]) {
                var firstOperator = ts.find(predictTokenOpertor);
                var secondOperator = ts.find(g => predictTokenOpertor(g) && g !== firstOperator);
                if (firstOperator && !secondOperator) {
                    return self.toOperator(ts as Token[]);
                }
                else if (firstOperator && secondOperator) {

                    /**
                     * https://www.cnblogs.com/gavin-yao/p/10595835.html
                     * 
                     */
                    var rs = self.splitTokens(ts as Token[], g => g instanceof Token && (g === firstOperator || g === secondOperator));
                    var r1 = rs[0];
                    var r2 = rs[1];
                    var r3 = rs[2];
                    var op1 = ops.find(g => g.operator == firstOperator.value);
                    var op2 = ops.find(g => g.operator == secondOperator.value);
                    /**
                     * 这里计算优化级，左边的小于右边的
                     * 先将左边的转成exp 然后与其它的在进行下一轮转换
                     */
                    if (op1.level <= op2.level) {
                        var leftExp = self.toOperator([...r1, firstOperator, ...r2] as Token[]);
                        return covertTs([leftExp, secondOperator, ...r3]);
                    }
                    else {
                        return self.toOperator(
                            [...r1, firstOperator] as Token[],
                            covertTs([...r2, secondOperator, ...r3])
                        )
                    }
                }
            }
            return covertTs(tokens);
        }
        else {
            //没检测到运算符的
            return self.toUnit(tokens);
        }
        return null;
    }
    toObject(tokens: Token[]) {
        this.removeTokens(tokens, x => x.name == TokenType.white || x.name == TokenType.line);
        var ts = this.splitTokens(tokens, x => x.name == TokenType.delimiter && x.value == ',');
        var exp = new Exp('{');
        exp.referToken(tokens.first().parent)
        ts.forEach(t => {
            var tn = this.splitTokens(t, g => g.name == TokenType.delimiter && g.value == ':');
            var objItem = new Exp('{,');
            objItem.referToken(...t);
            objItem.value = tn[0][0].value;
            objItem.push(this.calcExpress(tn[1]));
            exp.push(objItem);
        })
        return exp;
    }
    toArray(tokens: Token[]) {
        this.removeTokens(tokens, x => x.name == TokenType.white || x.name == TokenType.line);
        var ts = this.splitTokens(tokens, x => x.name == TokenType.delimiter && x.value == ',');
        var exp = new Exp('[');
        exp.referToken(tokens.first().parent)
        ts.forEach(t => {
            var childExp = this.calcExpress(t);
            exp.push(childExp);
        })
        return exp;
    }
    toStatement(tokens: Token[]) {
        /**
        * 这里需要做个探测
        * 它是数据如[],{ }
        * 还是仅仅只是一个表达式 exp
        * 还是有多条语句
        */
        this.removeTokens(tokens, x => x.name == TokenType.white || x.name == TokenType.line);
        if (tokens[0].value == '[') {
            return this.toArray(tokens[0].childs);
        }
        else if (tokens[0].value == '{') {
            return this.toObject(tokens[0].childs);
        }
        else if (tokens.some(s => s.name == TokenType.delimiter && s.value == ';')) {
            /**
             * 这有多个语句
             */
            var sr = this.splitTokens(tokens, s => s.name == TokenType.delimiter && s.value == ';');
            return sr.map(s => {
                var exp = new Exp('statement');
                var child = this.toStatement(s);
                exp.push(child);
                return exp;
            })
        }
        else if (tokens.some(s => s.name == TokenType.operator && (!["==", "!=", ">=", "<="].includes(s.value) && s.value.indexOf('=') > -1))) {
            /**
             * 赋值语句
             */
            var sr = this.splitTokens(tokens, s => s.name == TokenType.operator && (!["==", "!=", ">=", "<="].includes(s.value) && s.value.indexOf('=') > -1));
        }
        else {
            /***
             * 这里认为是一个表达式
             */
            return this.calcExpress(tokens);
        }
    }
    toRoot(token: Token) {
        if (token.name == TokenType.root) {
            //根token
            var childs = token.childs;
            var e = this.toStatement(childs);
            var exp = new Exp('root');
            exp.push(e);
            return exp;
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
    private splitTokens(tokens: Token[], splitPredict: (token: Token) => boolean) {
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
    private splitSecondTokens(tokens: Token[], splitPredict: (token: Token) => boolean) {
        for (let i = 0; i < tokens.length; i++) {
            if (splitPredict(tokens[i])) {
                return [
                    tokens.slice(0, i),
                    tokens.slice(i + 1)
                ]
            }
        }
    }
    private removeTokens(tokens: Token[], predict: (token: Token) => boolean) {
        for (let i = tokens.length - 1; i >= 0; i--) {
            if (predict(tokens[i]))
                tokens.splice(i, 1);
        }
    }
}


