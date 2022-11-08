import { FieldType } from "../../../blocks/data-grid/schema/type";


export var constLangs = [
    { text: 'e', url: '/const/e.md' },
    { text: 'pi', url: '/const/pi.md' },
    { text: 'true', url: '/const/true.md' },
    { text: 'false', url: '/const/false.md' }
]


export var logcLangs = [
    { text: 'if', url: '/logic/if.md' },
    { text: '&&', url: '/logic/and.md' },
    { text: '||', url: '/logic/or.md' },
    { text: '!', url: '/logic/not.md' },
    { text: '+', url: '/logic/plus.md' },
    { text: '-', url: '/logic/sub.md' },
    { text: '*', url: '/logic/mul.md' },
    { text: '/', url: '/logic/div.md' },
    { text: '%', url: '/logic/mod.md' },
    { text: '>', url: '/logic/gt.md' },
    { text: '>=', url: '/logic/gte.md' },
    { text: '<', url: '/logic/lt.md' },
    { text: '<=', url: '/logic/lte.md' },
    { text: '=', url: '/logic/equal.md' },
    { text: '!=', url: '/logic/notEqual.md' },
]


export var funLangs = [
    { text: 'if' },
]



export var formulaLangs = [
    {
        text: '文本',
        types: [FieldType.text, FieldType.title],
        spread: false,
        childs: [
            {
                text: '长度',
                url: '/string/len.md'
            }
        ]
    }
]