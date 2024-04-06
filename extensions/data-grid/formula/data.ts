import { FieldType } from "../../../blocks/data-grid/schema/type";
import { lst } from "../../../i18n/store";


export var constLangs = [
    { text: 'Math.E', url: '/const/e.md' },
    { text: 'Math.PI', url: '/const/pi.md' },
    { text: 'true', url: '/const/true.md' },
    { text: 'false', url: '/const/false.md' }
]

export var logcLangs = [
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
    { text: '?', url: '/logic/if.md' },
    { text: '&&', url: '/logic/and.md' },
    { text: '||', url: '/logic/or.md' },
    { text: '!', url: '/logic/not.md' },
    { text: '!=', url: '/logic/notEqual.md' },
]


export var funLangs = [
    { text: 'toNumber', url: '/fun/toNumber.md' },
    { text: 'String.join', url: '/fun/join.md' },
    { text: 'Math.abs', url: '/fun/abs.md' },


    { text: 'Math.pow', url: '/fun/pow.md' },
    { text: 'Math.exp', url: '/fun/exp.md' },

    { text: 'Math.ceil', url: '/fun/ceil.md' },
    { text: 'Math.floor', url: '/fun/floor.md' },
    { text: 'Math.round', url: '/fun/round.md' },

    { text: 'Math.sqrt', url: '/fun/sqrt.md' },
    { text: 'Math.cbrt', url: '/fun/cbrt.md' },

    { text: 'Math.max', url: '/fun/max.md' },
    { text: 'Math.min', url: '/fun/min.md' },
    { text: 'Math.random', url: '/fun/random.md' },
    { text: 'Date.now', url: '/fun/now.md' },

]



export var GetFormulaLangs =()=> [
    {
        text: lst('文本'),
        types: [FieldType.text, FieldType.title],
        spread: false,
        childs: [
            {
                text: 'length',
                url: '/string/len.md'
            },
            {
                text: 'slice',
                url: '/string/slice.md'
            },
            {
                text: 'contains',
                url: '/string/contains.md'
            },
            {
                text: 'replace',
                url: '/string/replace.md'
            },
            {
                text: 'isEmpty',
                url: '/string/isEmpty.md'
            }
        ]
    },
    {
        text:lst('日期') ,
        types: [FieldType.date, FieldType.createDate, FieldType.modifyDate],
        spread: false,
        childs: [
            {
                text: 'timestamp',
                url: '/date/timestamp.md'
            },
            {
                text: 'format',
                url: '/date/format.md'
            },
            {
                text: 'add',
                url: '/date/add.md'
            },
            {
                text: 'sub',
                url: '/date/sub.md'
            },
            {
                text: 'year',
                url: '/date/year.md'
            },
            {
                text: 'month',
                url: '/date/month.md'
            },
            {
                text: 'date',
                url: '/date/date.md'
            },
            {
                text: 'hour',
                url: '/date/hour.md'
            },
            {
                text: 'minute',
                url: '/date/minute.md'
            },
            {
                text: 'second',
                url: '/date/second.md'
            },
        ]
    }
]