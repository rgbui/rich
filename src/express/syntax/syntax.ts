
import { TokenType } from "../token/token";
import { convertLangSyntax, LangSyntax } from "./regex";
export var VeTokenSyntax: LangSyntax = {
    keyword: /true|false|null/,
    operator: ['+', '.', '-', '*', '/', '%', '?', '=', '==', '&&', '||', '!', '!=', '>', "<", '>=', '<=','and','or'],
    escapes: /\\\\([abfnrtv\\"']|x[0-9A-Fa-f]{1,4}|u[0-9A-Fa-f]{4}|U[0-9A-Fa-f]{8})/,
    white: /[ \t\f\v]/,
    unit: /[a-zA-Z_\$@]/,
    word: /@unit[a-zA-Z_\$\d@]*/,
    // namespace: /@word@white*\.@white*@word/,
    number: /(\-)?\d+(\.\d+)?([eE][\-+]?\d+)?/,
    root: [
        { match: /@white+/, name: 'white' },
        { match: /[\{\(\[]/, name: 'bracket_open', push: true },
        { match: /[\)\]\}]/, name: 'bracket_close', pop: true },
        { match: /@keyword(?![a-zA-Z_\$\u4E00-\u9FA5\d])/, name: 'keyword' },
        { match: /@word/, name: 'word' },
        {
            match: '@operator',
            name: 'operator',
            checkMatch(token, rest) {
                if (rest.startsWith('-')) {
                    /**这里推断一下是负号还是减号，如果是减号，那么减号前面是一个值 */
                    var lastToken = token.last(x => x.name == TokenType.white || x.name == TokenType.line);
                    if (lastToken?.name == TokenType.operator) {
                        return false
                    }
                }
                return true;
            }
        },
        { match: /@number/, name: 'number' },
        { match: '"', name: 'quote_open', next: '@string_double_block', push: true },
        { match: '\'', name: 'quote_open', next: '@string_single_block', push: true },
        { match: /[;\,:]/, name: 'delimiter' },
    ],
    string_double_block: [
        { match: /[^"\\]+/, name: 'string_text' },
        { match: /@escapes/, name: 'string_escape' },
        { match: '"', name: 'quote_close', pop: true, next: '@root' }
    ],
    string_single_block: [
        { match: /[^'\\]+/, name: 'string_text' },
        { match: /@escapes/, name: 'string_escape' },
        { match: '\'', name: 'quote_close', pop: true, next: '@root' }
    ]
}
convertLangSyntax(VeTokenSyntax);
