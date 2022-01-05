import { DeclareTypes } from "../type/declare";
import { ExpType, ExpUnitType, typeIsBool, typeIsEqual, typeIsNumber } from "./declare";
import { ExpProcess } from "./process";
export type ExOperatorType = 'root' | 'statement' | '!' | '+' | '-' | '>' | '<' | '>=' | '<=' | '==' | '!=' | '&&' | '||' | "." | '*' | '/' | '%' | '{' | '[' | '(' | 'variable' | 'fun' | 'constant' | 'string' | 'number' | '?:' | '{,' | '[]';
export class Exp {
    operator: ExOperatorType;
    private childs: Exp[] = [];
    value: any;
    key: string;
    constructor(type?: ExOperatorType) {
        if (type) { this.operator = type; }
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
    get type(): ExpType {
        switch (this.operator) {
            case '?:':
                return this.childs[1].type;
                break;
            case '[':
                return this.childs.map(c => {
                    return c.type as any
                }) as any
                break;
            case '[]':
                var pa = this.process.args.find(g => g.name == this.value);
                if (pa) {
                    return pa.type;
                }
                break;
            case 'constant':
                if (typeof this.value == 'boolean') return 'bool';
                else if (typeof this.value == 'number') return 'number';
                else if (this.value == null)
                    break;
            case 'fun':
                var variableType = this.getVariableType();
                if (variableType?.__returnType) return variableType.__returnType;
                else {
                    this.process.log('warn', `无法推断${this.value}的函数类型`)
                    return 'any'
                }
                break;
            case 'number':
                return 'number';
                break;
            case 'root':
                return this.childs[0].type;
                break;
            case 'string':
                return 'string';
                break;
            case 'variable':
                var variableType = this.getVariableType();
                if (variableType) return variableType;
                else {
                    // this.process.log('warn', `无法推断${this.value}的数据类型`)
                    return 'any'
                }
                break;
            case '{':
                var r: ExpType = {};
                this.childs.forEach(c => {
                    r[c.value] = c.childs[0].type;
                })
                return r;
                break;
            case '{,':
                return this.childs[0].type;
                break;
            case '+':
                if (typeIsNumber(this.childs[0].type) && typeIsNumber(this.childs[1].type)) return 'number'
                else if (this.childs[0].type == 'string' && this.childs[1].type == 'string') return 'string';
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
                return 'bool';
                break;
            case '.':
                var type = this.childs[0].type;
                if (type) {
                    var rt = DeclareTypes.recommendType(type as ExpUnitType, this.key);
                    if (rt) {
                        return rt;
                    }
                }
                this.process.log('warn', `无法推断${this.operator}${this.key}的数据类型`)
                break;
        }
        return null;
    }
    private getVariableType() {
        var pa = this.process.args.find(g => g.name == this.value);
        if (pa) {
            return pa.type;
        }
        var ns = this.value.split(/\./g);
        var index = ns.length - 1;
        var beforeKey = ns.slice(0, index).join(".");
        var afterKey = ns.slice(index).join(".");
        var gp: {
            name: string;
            type: ExpType;
        };
        while (true) {
            var sp = this.process.args.find(g => g.name == beforeKey);
            if (sp) {
                gp = sp;
                break;
            }
            else {
                index -= 1;
                beforeKey = ns.slice(0, index).join(".");
                if (!beforeKey) break;
            }
        }
        if (gp) {
            afterKey = ns.slice(index + 1).join(".");
            return DeclareTypes.recommendType(gp.type as ExpUnitType, afterKey);
        }
        else {
            this.process.log('error', `变量名${this.value}没有申明`)
        }
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
    _process: ExpProcess;
    get process() {
        return this.root._process;
    }
    check() {
        switch (this.operator) {
            case '!':
                if (this.childs.length == 1) {
                    if (!typeIsBool(this.childs[0].type)) {
                        this.process.log('warn', `${this.operator}运算符表达式类型不是布尔`)
                    }
                }
                break;
            case '?:':
                if (this.childs.length == 3) {
                    if (!(this.childs[0].type == 'bool' || this.childs[0].type == 'any')) {
                        this.process.log('warn', '三元表达式判断为bool类型')
                    }
                    if (!typeIsEqual(this.childs[1].type, this.childs[2].type)) {
                        this.process.log('warn', '三元表达式返回类型不一致')
                    }
                }
                else this.process.log('warn', '三元表达式语法错误')
                break;
            case '/':
            case '%':
            case '*':
            case '-':
                if (this.childs.length == 2) {
                    if (!typeIsNumber(this.childs[0].type)) {
                        this.process.log('warn', `${this.operator}运算符表达式类型不是数字`)
                    }
                    if (!typeIsNumber(this.childs[1].type)) {
                        this.process.log('warn', `${this.operator}运算符表达式类型不是数字`)
                    }
                }
                else {
                    this.process.log('warn', '二元运算符表达式输入不合法')
                }
                break;
            case '+':
                if (this.childs.length == 2) {
                    var t1 = this.childs[0].type;
                    var t2 = this.childs[1].type;
                    if (typeIsNumber(t1) && typeIsNumber(t2)) {
                        if (!typeIsEqual(t1, t2))
                            this.process.log('info', `${this.operator}运算符两边的表达式数字类型不一致${t1}!=${t2}`)
                    }
                    else if (t1 == 'string' && t2 == 'string') {

                    }
                    else {
                        this.process.log('warn', `${this.operator}运算符两边的表达式不全是文本或数字`)
                    }
                }
                else {
                    this.process.log('warn', '二元运算符表达式输入不合法')
                }
                break;
            case '>':
            case '<':
            case '>=':
            case '<=':
                if (this.childs.length == 2) {
                    if (!typeIsNumber(this.childs[0].type)) {
                        this.process.log('warn', `${this.operator}运算符表达式类型不是数字`)
                    }
                    if (!typeIsNumber(this.childs[1].type)) {
                        this.process.log('warn', `${this.operator}运算符表达式类型不是数字`)
                    }
                }
                else {
                    this.process.log('warn', '二元运算符表达式输入不合法')
                }
                break;
            case '!=':
            case '==':
                if (this.childs.length == 2) {

                }
                else {
                    this.process.log('warn', '二元运算符表达式输入不合法')
                }
                break;
            case '||':
            case '&&':
                if (this.childs.length == 2) {
                    if (typeIsBool(this.childs[0].type) && typeIsEqual(this.childs[0].type, this.childs[1].type)) {
                        this.process.log('warn', `${this.operator}运算符表达式类型不是布尔`)
                    }
                }
                else {
                    this.process.log('warn', `${this.operator}二元运算符表达式输入不合法`)
                }
                break;
            case 'variable':
                break;
            case 'fun':
                break;
            case '.':
                break;
        }
    }
}



