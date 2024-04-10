export enum TokenType {
    root = 'root',
    invalid = 'invalid',
    line = 'line',
    bracket_open = 'bracket_open',
    bracket_close = 'bracket_close',
    cite = 'cite',
    quote_open = 'quote_open',
    quote_close = 'quote_close',
    number = 'number',
    white = 'white',
    keyword = 'keyword',
    word = 'word',
    operator = 'operator',
    delimiter = 'delimiter',
    string_text = 'string_text',
    string_escape = 'string_escape'
}

export class Token {
    /***列号*/
    col: number;
    size: number;
    row: number;
    value: string;
    childs: Array<Token> = [];
    parent?: Token;
    name: TokenType;
    constructor(options?: {
        type?: TokenType,
        col?: number,
        row?: number,
        value?: string
    }) {
        if (options) {
            for (let op in options) {
                this[op] = options[op];
            }
        }
    }
    last(ignorePredict?: (token: Token) => boolean) {
        if (typeof ignorePredict != 'function') return this.childs[this.childs.length - 1];
        for (let i = this.childs.length - 1; i >= 0; i--) {
            if (ignorePredict(this.childs[i])) continue;
            else return this.childs[i];
        }
    }
    first(ignorePredict?: (token: Token) => boolean) {
        if (typeof ignorePredict != 'function') return this.childs[0];
        for (let i = 0; i <= this.childs.length; i++) {
            if (ignorePredict(this.childs[i])) continue;
            else return this.childs[i];
        }
    }
}
