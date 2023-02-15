import lodash from "lodash";
import { Express } from "..";
import { Token } from "../token/token";
import { argsIsFunType, ExpArrayType, ExpType, typeIsBool, typeIsEqual, typeIsNumber, typesIsEqual } from "./declare";

/**
 * 
 * "{"  表示object数据 {childs:Exp[]}
 * "{," 表示object数据里面的key-value项 {value:object.key,childs:[object.value]}
 * "["  表示数组 {childs:Exp[]}
 * "[]" 表示数据调用引用{childs:[array.caller,array.index]}
 * "("  表示小括号
 * 
 * "statement" 表示语句 {childs:StatementExp[]}
 * "root":{childs:Exp[]}
 *  '!' | '+' | '-' | '>' | '<' |
    '>=' | '<=' | '==' | '!=' | '&&' | '||' | "." |
    '*' | '/' | '%':{childs:Exp[]}
 *  
 * 'variable':{value:}
 * 'fun':{childs:[fun.caller,...argsExp]}  其中fun.caller要么是一个表达式的exp（例如Math.Round)，要么就是一个variable
 * 'constant':{value:true|false|null}
 * 'string':{value:}
 * 'number':{value:}
 * ?:{childs:[condition,turnExp,falseExp]}
 * ".":{key:prop,childs:[caller]}
 * 
 */
export type ExOperatorType = 'root' | 'statement' |
    '!' | '+' | '-' | '>' | '<' |
    '>=' | '<=' | '==' | '!=' | '&&' | '||' | "." |
    '*' | '/' | '%' | '{' |
    '[' | '(' |
    'variable' | 'fun' | 'constant'
    | 'string' | 'number' |
    '?:' | '{,'
    | '[]' | 'and' | 'or';

export class Exp {
    operator: ExOperatorType;
    private childs: Exp[] = [];
    value: any;
    key: string;
    constructor(type?: ExOperatorType) {
        if (type) {
            this.operator = type;
        }
    }
    get last() {
        return this.childs[this.childs.length - 1];
    }
    push(child: Exp | Exp[]) {
        if (!child) return;
        var cs = Array.isArray(child) ? child : [child];
        for (let i = 0; i < cs.length; i++) {
            var c = cs[i];
            c.parent = this;
            this.childs.push(c);
        }
    }
    parent: Exp;
    each(predict: (exp: Exp) => void, ignoreSelf: boolean = true) {
        if (ignoreSelf) predict(this);
        this.childs.forEach(c => { c.each(predict, true); })
    }
    eachOne(predict: (exp: Exp) => void, ignoreSelf: boolean = true) {
        if (ignoreSelf) predict(this);
        this.childs.forEach(c => { predict(c) })
    }
    private getAttributeIndexs() {
        var tillExp: Exp;
        var keys: string[] = this.operator == 'variable' || this.operator == '.' ? [this.operator == 'variable' ? this.value : this.key] : [];
        var op = this.childs[0];
        while (true) {
            if (op) {
                if (op.operator == '.') {
                    keys.push(op.key)
                    op = op.childs[0]
                }
                else {
                    if (op.operator == 'variable') {
                        keys.push(op.value)
                    }
                    else {
                        tillExp = op;
                    }
                    break;
                }
            }
            else break;
        }
        keys.reverse()
        return {
            exp: tillExp,
            keys
        }
    }
    inferType(): ExpType {
        switch (this.operator) {
            case '?:':
                return this.childs[1].inferType();
                break;
            case '[':
                var cs: ExpType[] = [];
                cs = this.childs.map(c => {
                    return c.inferType() as any
                }) as any;
                if (typesIsEqual(cs)) {
                    return { __unit: cs[0] };
                }
                else {
                    this.express.log('warn', `数组里面的数据类型不一致`);
                    return { __unit: 'any' };
                }
                break;
            case 'constant':
                if (typeof this.value == 'boolean') return 'bool';
                else if (typeof this.value == 'number') return 'number';
                else if (this.value == null) return 'any';
                break;
            case 'number':
                return 'number';
                break;
            case 'root':
                return this.childs[0].inferType();
                break;
            case 'string':
                return 'string';
                break;
            case '[]':
                return (this.childs[0].inferType() as ExpArrayType).__unit;
                break;
            case 'fun':
                var child = this.childs[0];
                var args = this.childs.slice(1);
                if (child.operator == '.' || child.operator == 'variable') {
                    var tk = this.getAttributeIndexs();
                    var rtype = this.express.recommendType(tk.keys.join("."), tk.exp ? tk.exp.inferType() : undefined);
                    if (rtype && rtype.__returnType) return rtype.__returnType;
                    else return 'any'
                }
                break;
            case '.':
                var tk = this.getAttributeIndexs();
                var rtype = this.express.recommendType(tk.keys.join("."), tk.exp ? tk.exp.inferType() : undefined);
                if (rtype) return rtype;
                else return 'any'
                break;
            case 'variable':
                var rtype = this.express.recommendType(this.value);
                if (rtype) return rtype;
                else return 'any'
                break;
            case '{':
                var r: ExpType = {};
                this.childs.forEach(c => {
                    r[c.value] = c.childs[0].inferType();
                })
                return r;
                break;
            case '{,':
                return this.childs[0].inferType();
                break;
            case '+':
                if (typeIsNumber(this.childs[0].inferType()) && typeIsNumber(this.childs[1].inferType())) return 'number'
                else if (this.childs[0].inferType() == 'string' && this.childs[1].inferType() == 'string') return 'string';
                break;
            case '-':
            case '*':
            case '%':
            case '/':
                return 'number'
                break;
            case '>':
            case '<':
            case '>=':
            case '<=':
            case '!=':
            case '==':
            case '||':
            case '&&':
            case 'and':
            case 'or':
                return 'bool';
                break;
        }
        return null;
    }
    get root() {
        var pa: Exp = this;
        while (true) {
            if (pa.parent) {
                pa = pa.parent;
            }
            else return pa;
        }
        return pa;
    }
    _express: Express;
    get express() {
        return this.root._express;
    }
    check() {
        switch (this.operator) {
            case '!':
                if (this.childs.length == 1) {
                    if (!typeIsBool(this.childs[0].inferType(), true)) {
                        this.express.log('error', `${this.operator}运算符表达式类型不是布尔`)
                    }
                }
                else {
                    this.express.log('error', `${this.operator}表达式输入不合法`);
                }
                this.childs.each(child => {
                    child.check();
                });
                break;
            case '?:':
                if (this.childs.length == 3) {
                    if (!typeIsBool(this.childs[0].inferType(), true)) {
                        this.express.log('error', '三元表达式判断为bool类型')
                    }
                    if (!typeIsEqual(this.childs[1].inferType(), this.childs[2].inferType())) {
                        this.express.log('error', '三元表达式返回类型不一致')
                    }
                }
                else this.express.log('error', `三元表达式${this.operator}表达式输入不合法`);
                this.childs.each(child => {
                    child.check();
                })
                break;
            case '[':
                var cs: ExpType[] = [];
                cs = this.childs.map(c => {
                    return c.inferType() as any
                }) as any;
                if (typesIsEqual(cs)) {

                }
                else {
                    this.express.log('warn', `数组里面的数据类型不一致`);
                }
                this.childs.forEach(c => {
                    c.check();
                })
                break;
            case '[]':
                var type = this.childs[0].inferType() as ExpArrayType;
                if (!typeIsNumber(type)) {
                    this.express.log('error', `数组索引值不为整数`);
                }
                this.childs[0].check()
                break;
            case '/':
            case '%':
            case '*':
            case '-':
                if (this.childs.length == 2) {
                    if (!typeIsNumber(this.childs[0].inferType(), true)) {
                        this.express.log('warn', `${this.operator}运算符表达式类型不是数字`)
                    }
                    if (!typeIsNumber(this.childs[1].inferType(), true)) {
                        this.express.log('warn', `${this.operator}运算符表达式类型不是数字`)
                    }
                }
                else {
                    this.express.log('warn', `运算符${this.operator}表达式输入不合法`)
                }
                this.childs.each(child => {
                    child.check();
                })
                break;
            case '+':
                if (this.childs.length == 2) {
                    var t1 = this.childs[0].inferType();
                    var t2 = this.childs[1].inferType();
                    if (typeIsNumber(t1, true) && typeIsNumber(t2, true)) {
                        // if (!typeIsEqual(t1, t2, true))
                        //     this.express.log('info', `${this.operator}运算符两边的表达式数字类型不一致${t1}!=${t2}`)
                    }
                    else if (t1 == 'string' && t2 == 'string') {

                    }
                    else {
                        this.express.log('error', `${this.operator}运算符两边的值不全是文本或数字`)
                    }
                }
                else {
                    this.express.log('error', `运算符${this.operator}表达式输入不合法`)
                }
                this.childs.each(child => {
                    child.check();
                })
                break;
            case '>':
            case '<':
            case '>=':
            case '<=':
                if (this.childs.length == 2) {
                    if (!typeIsNumber(this.childs[0].inferType(), true)) {
                        this.express.log('error', `${this.operator}运算符表达式左边类型不是数字`)
                    }
                    if (!typeIsNumber(this.childs[1].inferType(), true)) {
                        this.express.log('error', `${this.operator}运算符表达式右边类型不是数字`)
                    }
                }
                else {
                    this.express.log('error', `运算符${this.operator}表达式输入不合法`)
                }
                this.childs.each(child => {
                    child.check();
                })
                break;
            case '!=':
            case '==':
                if (this.childs.length == 2) {
                    if (!typeIsEqual(this.childs[0].inferType(), this.childs[1].inferType(), true)) {
                        this.express.log('error', `运算符${this.operator}两边的值类型不一致`)
                    }
                }
                else {
                    this.express.log('error', `运算符${this.operator}表达式输入不合法`)
                }
                this.childs.each(child => {
                    child.check();
                })
                break;
            case '||':
            case '&&':
            case 'and':
            case 'or':
                if (this.childs.length == 2) {
                    if (!typeIsBool(this.childs[0].inferType()) || !typeIsBool(this.childs[0].inferType())) {
                        this.express.log('error', `${this.operator}运算符表达式类型不是布尔`)
                    }
                }
                else {
                    this.express.log('error', `运算符${this.operator}表达式输入不合法`)
                }
                this.childs.each(child => {
                    child.check();
                })
                break;
            case 'variable':
                var tk = this.getAttributeIndexs();
                var rt = this.express.recommendDeclare(tk.keys.join("."), tk.exp ? tk.exp.inferType() : undefined);
                if (!rt) {
                    this.express.log('error', '找不到申明的变量' + tk.keys.join('.'))
                }
                if (tk.exp) tk.exp.check();
                break;
            case 'fun':
                var child = this.childs[0];
                var args = this.childs.slice(1);
                if (child.operator == '.' || child.operator == 'variable') {
                    var tk = this.getAttributeIndexs();
                    var rt = this.express.recommendDeclare(tk.keys.join("."), tk.exp ? tk.exp.inferType() : undefined);
                    if (rt) {
                        var types = args.map(arg => arg.inferType());
                        if (!argsIsFunType(rt.type, types)) {
                            this.express.log('warn', `方法参数类型不一致`)
                        }
                    }
                    else {
                        this.express.log('error', '找不到申明的方法' + tk.keys.join('.'))
                    }
                }
                args.forEach(arg => {
                    arg.check()
                })
                break;
            case '.':
                var tk = this.getAttributeIndexs();
                var rt = this.express.recommendDeclare(tk.keys.join("."), tk.exp ? tk.exp.inferType() : undefined);
                if (!rt) {
                    this.express.log('error', '找不到申明的属性' + tk.keys.join('.'))
                }
                // if (tk.exp) tk.exp.check();
                break;
        }
    }
    /**
     *将表达式重新生成对应的语言代码
     */
    compile() {
        switch (this.operator) {
            case '?:':
                return `(${this.childs[0].compile()}) ? (${this.childs[1].compile()}) : (${this.childs[2].compile()})`
                break;
            case '[':
                return '[' + this.childs.map(c => c.compile()).join(",") + "]";
                break;
            case 'constant':
                if (typeof this.value == 'boolean') {
                    if (this.value) return 'true'
                    else return 'false'
                }
                else if (typeof this.value == 'number') return this.value.toString()
                else if (this.value == null) return 'null';
                break;
            case 'number':
                return this.value;
                break;
            case 'root':
                return this.childs[0].compile();
                break;
            case 'string':
                return `"${this.value.replace(/"/g, "\\\"")}"`;
                break;
            case '[]':
                return `${this.childs[0].compile()}[${this.childs[1].compile()}]`
                break;
            case 'fun':
                // var child = this.childs[0];
                var args = this.childs.slice(1);
                var tk = this.getAttributeIndexs();
                var g = this.express.compileType(
                    tk.keys.join('.'),
                    args.map(arg => arg.compile()),
                    tk.exp ? tk.exp.compile() : undefined,
                    tk.exp ? tk.exp.inferType() : undefined
                )
                if (g?.code) {
                    this.express.addReference(g.references)
                    return g.code;
                } else {
                    this.express.log('error', `方法编译时出错`)
                    return ' compile "." happend error ';
                }
                break;
            case '.':
                var tk = this.getAttributeIndexs();
                var g = this.express.compileType(
                    tk.keys.join('.'),
                    [],
                    tk.exp ? tk.exp.compile() : undefined,
                    tk.exp ? tk.exp.inferType() : undefined
                )
                if (g?.code) {
                    this.express.addReference(g.references)
                    return g.code;
                } else {
                    this.express.log('error', `属性编译时出错`)
                    return 'compile "." happend error ';
                }
                break;
            case 'variable':
                var tk = this.getAttributeIndexs();
                var g = this.express.compileType(
                    tk.keys.join('.'),
                    [],
                    tk.exp ? tk.exp.compile() : undefined
                )
                if (g?.code) {
                    this.express.addReference(g.references)
                    return g.code;
                } else {
                    this.express.log('error', `变量编译时出错`)
                    return `compile "variable" happend error`
                }
                break;
            case '{':
                return `{${this.childs.map(c => c.compile()).join(",")}}`
                break;
            case '{,':
                return `{${this.childs.map(c => `${c.key}:${c.childs[0].compile()}`).join(",")}}`
            case '+':
            case '-':
            case '*':
            case '%':
            case '/':
                return `(${this.childs[0].compile()}${this.operator}${this.childs[1].compile()})`
            case '>':
            case '<':
            case '>=':
            case '<=':
            case '!=':
            case '==':
            case '||':
            case '&&':
            case 'and':
            case 'or':
                var c = this.operator;
                if (c == 'and') c = '&&'
                else if (c == 'or') c = '||'
                return `(${this.childs[0].compile()}${c}${this.childs[1].compile()})`
            default:
                console.log('not found operator', this.operator);
        }
        return null;
    }
    referTokens: Token[] = [];
    referToken(...tokens: Token[]) {
        this.referTokens.push(...tokens);
    }
    get() {
        var json: Record<string, any> = {};
        json.key = this.key;
        json.operator = this.operator;
        json.value = lodash.cloneDeep(this.value);
        json.childs = this.childs.map(c => c.get())
        return json;
    }
    load(data: Record<string, any>) {
        for (let n in data) {
            if (n == 'childs') continue;
            else this[n] = lodash.cloneDeep(data[n]);
        }
        if (Array.isArray(data.childs))
            data.childs.forEach(child => {
                var exp = new Exp();
                exp.parent = this;
                exp.load(child);
                this.childs.push(exp);
            })
    }
}



