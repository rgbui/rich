import { Token } from "../token/token";


/**
 * @link https://microsoft.github.io/monaco-editor/monarch.html
 * 
 */
export type LangSyntaxRule = {
    include?: string,
    name?: string,
    match?: string | RegExp | (string[]),
    next?: string,
    nextTurn?: string,
    push?: boolean,
    pop?: boolean,
    /**
     * 通过方法来进一步判断是否区配
     * currentToken还没有加入到contextToken中
     */
    checkMatch?: (contextToken: Token, rest: string) => boolean,
    /**
     * 通过自定义方法，重新计算新的rule
    * currentToken还没有加入到contextToken中
    */
    action?: (contextToken: Token, currentToken: Token) => Record<string, any> | void
}
export type LangSyntaxRoot = {
    root: LangSyntaxRule[]
}
export type LangSyntax = Record<string, string | (string[]) | RegExp | LangSyntaxRoot['root']> | LangSyntaxRoot;
export function getLangSyntaxRegex(syntax: LangSyntax, r: RegExp | string) {
    if (r instanceof RegExp) {
        var rs = r.toString();
        var rm = rs.match(/(@[a-zA-Z\d\_]+)/);
        if (rm && rm[0]) {
            rs = rs.substring(1, rs.length - 1);
            rs = rs.replace(/(@[a-zA-Z\d\_]+)/g, ($, $1) => {
                if (syntax[$1.substring(1)] instanceof RegExp) {
                    var gs = syntax[$1.substring(1)].toString();
                    gs = gs.substring(1, gs.length - 1);
                    return `(${gs})`;
                }
                else return $1;
            });
            return new RegExp(rs);
        }
    }
    else if (typeof r == 'string' && r.startsWith('@')) {
        if (typeof syntax[r.substring(1)] != 'undefined') {
            return syntax[r.substring(1)];
        }
    }
    return r;
}
export function convertLangSyntax(syntax: LangSyntax) {
    for (var key in syntax) {
        if (syntax[key] instanceof RegExp) syntax[key] = getLangSyntaxRegex(syntax, syntax[key]);
    }
    Object.keys(syntax).forEach(key => {
        if (Array.isArray(syntax[key])) {
            syntax[key].forEach(z => {
                if (Array.isArray(z.match)) {
                    for (var i = 0; i < z.match.length; i++) {
                        if (z.match[i])
                            z.match[i] = getLangSyntaxRegex(syntax, z.match[i]);
                    }
                }
                else if (typeof z != 'string' && z.match) {
                    try {
                        z.match = getLangSyntaxRegex(syntax, z.match);
                    }
                    catch (ex) {
                        console.error(ex);
                        console.log(syntax, z.match);
                    }
                }
            })
        }
    })
}
