

import { ExpressParser } from "./exp/parser";
import { ExpType } from "./exp/declare";
import { Exp } from "./exp/exp";
import { Tokenizer } from "./token/tokenizer";
import { DeclareTypes, TypeDeclare, TypeKind } from "./type/declare";

export class Express {
    express: string;
    args: TypeDeclare[];
    constructor(express: string, args: { name: string, type: ExpType, template?: string }[]) {
        this.express = express;
        this.args = args.map(arg => {
            return {
                path: arg.name,
                type: arg.type,
                template: arg.template,
                kind: TypeKind.arg
            }
        })
    }
    get declares() {
        return [
            ...DeclareTypes.declares,
            ...this.args.map(arg => {
                return {
                    kind: TypeKind.arg,
                    ...arg
                }
            })
        ]
    }
    exp: Exp;
    private logs: { type: string, message: string }[] = [];
    log(type: string, error: string) {
        this.logs.push({ type, message: error });
    }
    parse() {
        var self = this;
        this.logs = [];
        var tokenizer = new Tokenizer();
        var rootToken = tokenizer.parse(this.express);
        tokenizer.error = function (error) {
            self.log('error', error);
        }
        var tp = new ExpressParser();
        tp.log = function (level, error) {
            self.log(level, error);
        };
        this.exp = tp.toRoot(rootToken);
        this.exp._express = this;
        return this.exp;
    }
    /**
     * 检测表达式
     */
    check() {
        this.exp.each(e => e.check());
    }
    getLogs() {
        return this.logs;
    }
    recommendType(name: string, caller?: ExpType) {
        var dec = this.declares.find(g => g.path == name && (caller && g.caller == caller && g.kind == TypeKind.class || !caller && [TypeKind.arg, TypeKind.static].includes(g.kind)))
        if (dec) {
            return dec.type;
        }
        else {
            dec = this.declares.find(g => name.startsWith(g.path) && (caller && g.caller == caller && g.kind == TypeKind.class || !caller && [TypeKind.arg, TypeKind.static].includes(g.kind)));
            if (dec) {
                var lastPath = name.slice((dec.path + ".").length);
                return this.recommendType(lastPath, dec.type)
            }
            else return null;
        }
    }
    recommendDeclare(name: string, caller?: ExpType) {
        var dec = this.declares.find(g => g.path == name && (caller && g.caller == caller && g.kind == TypeKind.class || !caller && [TypeKind.arg, TypeKind.static].includes(g.kind)))
        if (dec) {
            return dec;
        }
        else {
            dec = this.declares.find(g => name.startsWith(g.path) && (caller && g.caller == caller && g.kind == TypeKind.class || !caller && [TypeKind.arg, TypeKind.static].includes(g.kind)));
            if (dec) {
                var lastPath = name.slice((dec.path + ".").length);
                return this.recommendDeclare(lastPath, dec.type)
            }
            else return null;
        }
    }
    compileType(name: string, args?: string[], caller?: string) {
        var dec = this.declares.find(g => g.path == name && (caller && g.caller == caller && g.kind == TypeKind.class || !caller && [TypeKind.arg, TypeKind.static].includes(g.kind)))
        if (dec) {
            var temp = dec.template || dec.path;
            var code = temp.replace(/(\$(this|args[\d]))/g, ($, $1) => {
                if ($1 == '$this') return caller || '';
                else {
                    var name = $1.replace('$args', '');
                    var n = parseFloat(name);
                    if (Array.isArray(args) && args[n]) return args[n]
                }
            });
            return {
                code,
                references: dec.references
            }
        }
        else {
            dec = this.declares.find(g => name.startsWith(g.path) && (caller && g.caller == caller && g.kind == TypeKind.class || !caller && [TypeKind.arg, TypeKind.static].includes(g.kind)));
            if (dec) {
                var lastPath = name.slice((dec.path + ".").length);
                var temp = dec.template || dec.path;
                var code = temp.replace(/(\$(this|args[\d]))/g, ($, $1) => {
                    if ($1 == '$this') return caller || '';
                    else {
                        var name = $1.replace('$args', '');
                        var n = parseFloat(name);
                        if (Array.isArray(args) && args[n]) return args[n]
                    }
                });
                var g = this.compileType(lastPath, [], code);
                if (g) return {
                    code: g.code,
                    references: [
                        ...dec.references,
                        ...g.references
                    ]
                }
                else return null;
            }
            else return null;
        }
    }
    references: { name: string, code }[] = [];
    addReference(references: { name: string, code: string }[]) {
        references.forEach(ref => {
            if (!this.references.some(r => r.name == ref.name)) {
                this.references.push(ref);
            }
        })
    }
}