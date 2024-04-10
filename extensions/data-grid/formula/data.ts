import { FieldType } from "../../../blocks/data-grid/schema/type";
import { lst } from "../../../i18n/store";


export var constLangs = [
    
    { text: 'true', url: '/const.md', hash: 'const_true' },
    { text: 'false', url: '/const.md', hash: 'const_false' },
    { text: '_now', url: '/const.md', hash: 'const_now' },
    { text: '_version', url: '/const.md', hash: 'const_version' },
    { text: '_guid', url: '/const.md', hash: 'const_guid' },
    { text: '_pi', url: '/const.md', hash: 'const_pi' },
    { text: '_e', url: '/const.md', hash: 'const_e' },
    { text: '_random', url: '/const.md', hash: 'const_random' },
    { text: '_userid', url: '/const.md', hash: 'const_userid' },
    { text: '_username', url: '/const.md', hash: 'const_username' },
    { text: '_roles', url: '/const.md', hash: 'const_roles' },
    { text: '_workspace', url: '/const.md', hash: 'const_workspace' },
    { text: '_workspace_id', url: '/const.md', hash: 'const_workspace_id' }
]

export var logcLangs = [
    { text: '+', url: '/logic.md', hash: 'logic_plus' },
    { text: '-', url: '/logic.md', hash: 'logic_sub' },
    { text: '*', url: '/logic.md', hash: 'logic_mul' },
    { text: '/', url: '/logic.md', hash: 'logic_div' },
    { text: '%', url: '/logic.md', hash: 'logic_mod' },
    { text: '>', url: '/logic.md', hash: 'logic_gt' },
    { text: '>=', url: '/logic.md', hash: 'logic_gte' },
    { text: '<', url: '/logic.md', hash: 'logic_lt' },
    { text: '<=', url: '/logic.md', hash: 'logic_lte' },
    { text: '==', url: '/logic.md', hash: 'logic_equal' },
    { text: '?', url: '/logic.md', hash: 'logic_if' },
    { text: '&&', url: '/logic.md', hash: 'logic_and' },
    { text: '||', url: '/logic.md', hash: 'logic_or' },
    { text: '!', url: '/logic.md', hash: 'logic_not' },
    { text: '!=', url: '/logic.md', hash: 'logic_not_equal' },
    { text: 'and', url: '/logic.md', hash: 'logic_and' },
    { text: 'or', url: '/logic.md', hash: 'logic_or' },
]


export var funLangs = [

    { text: 'if', url: '/fun.md', hash: 'if' },
    { text: 'ifs', url: '/fun.md', hash: 'ifs' },
    { text: 'toNumber', url: '/fun.md', hash: 'to_number' },
    { text: 'toInt', url: '/fun.md', hash: 'to_int' },
    { text: 'toDate', url: '/fun.md', hash: 'to_date' },
    { text: 'toBool', url: '/fun.md', hash: 'to_bool' },
    { text: 'isNull', url: '/fun.md', hash: 'is_null' },
    { text: 'isEmpty', url: '/fun.md', hash: 'is_empty' },
    { text: 'join', url: '/fun.md', hash: 'join' },
    { text: 'test', url: '/fun.md', hash: 'test' },
    { text: 'match', url: '/fun.md', hash: 'match' },
    { text: 'fileBytes', url: '/fun.md', hash: 'file_bytes' },
    { text: 'diffShowTime', url: '/fun.md', hash: 'diff_show_time' },

    { text: 'showTime', url: '/fun.md', hash: 'show_time' },
    { text: 'toPrice', url: '/fun.md', hash: 'to_price' },



    { text: 'Date.now', url: '/fun.md', hash: 'date_now' },
    { text: 'Date.parse', url: '/fun.md', hash: 'date_parse' },

    { text: 'Math.E', url: '/fun.md', hash: 'math_e' },
    { text: 'Math.PI', url: '/fun.md', hash: 'math_pi' },
    { text: 'Math.pow', url: '/fun/pow.md', hash: 'math_pow' },
    { text: 'Math.exp', url: '/fun/pow.md', hash: 'math_exp' },
    { text: 'Math.abs', url: '/fun/abs.md', hash: 'math_abs' },
    { text: 'Math.ceil', url: '/fun/abs.md', hash: 'math_ceil' },
    { text: 'Math.floor', url: '/fun/abs.md', hash: 'math_floor' },
    { text: 'Math.round', url: '/fun/abs.md', hash: 'math_round' },
    { text: 'Math.cbrt', url: '/fun/abs.md', hash: 'math_cbrt' },
    { text: 'Math.max', url: '/fun/abs.md', hash: 'math_max' },
    { text: 'Math.min', url: '/fun/abs.md', hash: 'math_min' },
    { text: 'Math.random', url: '/fun/random.md', hash: 'math_random' },


]



export var GetFormulaLangs = () => [
    {
        text: lst('文本'),
        spread: false,
        type: FieldType.text,
        childs: [
            {
                "name": "length",
                "type": "prop",
                "url": "/string.md",
                "hash": "length"
            },
            {
                "name": "isEmpty",
                "type": "prop",
                "url": "/string.md",
                "hash": "isEmpty"
            },
            {
                "name": "slice",
                "type": "method",
                "url": "/string.md",
                "hash": "slice",
                "args": ["int", "int"],
                "returnType": "string"
            },
            {
                "name": "startsWith",
                "type": "method",
                "url": "/string.md",
                "hash": "startsWith",
                "args": ["string"],
                "returnType": "bool"
            },
            {
                "name": "endsWith",
                "type": "method",
                "url": "/string.md",
                "hash": "endsWith",
                "args": ["string"],
                "returnType": "bool"
            },
            {
                "name": "replace",
                "type": "method",
                "url": "/string.md",
                "hash": "replace",
                "args": ["string", "string"],
                "returnType": "string"
            },
            {
                "name": "trim",
                "type": "method",
                "url": "/string.md",
                "hash": "trim",
                "args": [],
                "returnType": "string"
            },
            {
                "name": "trimStart",
                "type": "method",
                "url": "/string.md",
                "hash": "trimStart",
                "args": [],
                "returnType": "string"
            },
            {
                "name": "trimEnd",
                "type": "method",
                "url": "/string.md",
                "hash": "trimEnd",
                "args": [],
                "returnType": "string"
            },
            {
                "name": "upper",
                "type": "method",
                "url": "/string.md",
                "hash": "upper",
                "args": [],
                "returnType": "string"
            },
            {
                "name": "lower",
                "type": "method",
                "url": "/string.md",
                "hash": "lower",
                "args": [],
                "returnType": "string"
            },
            {
                "name": "indexOf",
                "type": "method",
                "url": "/string.md",
                "hash": "indexOf",
                "args": ["string"],
                "returnType": "int"
            },
            {
                "name": "lastIndexOf",
                "type": "method",
                "url": "/string.md",
                "hash": "lastIndexOf",
                "args": ["string"],
                "returnType": "int"
            },
            {
                "name": "contains",
                "type": "method",
                "url": "/string.md",
                "hash": "contains",
                "args": ["string"],
                "returnType": "bool"
            },
            {
                "name": "repeat",
                "type": "method",
                "url": "/string.md",
                "hash": "repeat",
                "args": ["int"],
                "returnType": "string"
            },
            {
                "name": "padStart",
                "type": "method",
                "url": "/string.md",
                "hash": "padStart",
                "args": ["int", "string"],
                "returnType": "string"
            },
            {
                "name": "padEnd",
                "type": "method",
                "url": "/string.md",
                "hash": "padEnd",
                "args": ["int", "string"],
                "returnType": "string"
            },
            {
                "name": "split",
                "type": "method",
                "url": "/string.md",
                "hash": "split",
                "args": ["string"],
                "returnType": { "unit": "string" }
            },
            {
                "name": "chatAt",
                "type": "method",
                "url": "/string.md",
                "hash": "chatAt",
                "args": ["int"],
                "returnType": "string"
            },
            {
                "name": "toInt",
                "type": "method",
                "url": "/string.md",
                "hash": "toInt",
                "args": ["int"],
                "returnType": "int"
            },
            {
                "name": "toNumber",
                "type": "method",
                "url": "/string.md",
                "hash": "toNumber",
                "args": ["number"],
            },
            {
                name: "toDate",
                type: "method",
                url: "/string.md",
                hash: "toDate",
                args: ["string"],
            }

        ]
    },
    {
        text: lst('日期'),
        spread: false,
        type: FieldType.date,
        childs: [
            {
                "name": "now",
                "type": "static",
                "url": "/date.md",
                "hash": "now",
                "returnType": "date",
                "example": "new Date()"
            },
            {
                "name": "parse",
                "type": "static",
                "url": "/date.md",
                "hash": "parse",
                "args": ["string", "string", "date"],
                "returnType": "date",
                "example": "sys.toDate($this, $args1, $args2)"
            },
            {
                "name": "year",
                "type": "prop",
                "url": "/date.md",
                "hash": "year",
                "returnType": "int",
                "example": "$this.getFullYear()"
            },
            {
                "name": "month",
                "type": "prop",
                "url": "/date.md",
                "hash": "month",
                "returnType": "int",
                "example": "$(this.getMonth() + 1)"
            },
            {
                "name": "day",
                "type": "prop",
                "url": "/date.md",
                "hash": "day",
                "returnType": "int",
                "example": "$this.getDay()"
            },
            {
                "name": "date",
                "type": "prop",
                "url": "/date.md",
                "hash": "date",
                "returnType": "int",
                "example": "$this.getDate()"
            },
            {
                "name": "week",
                "type": "prop",
                "url": "/date.md",
                "hash": "week",
                "returnType": "int",
                "example": "getWeek($this)"
            },
            {
                "name": "hour",
                "type": "prop",
                "url": "/date.md",
                "hash": "hour",
                "returnType": "int",
                "example": "$this.getHours()"
            },
            {
                "name": "minute",
                "type": "prop",
                "url": "/date.md",
                "hash": "minute",
                "returnType": "int",
                "example": "$this.getMinutes()"
            },
            {
                "name": "second",
                "type": "prop",
                "url": "/date.md",
                "hash": "second",
                "returnType": "int",
                "example": "$this.getSeconds()"
            },
            {
                "name": "millisecond",
                "type": "prop",
                "url": "/date.md",
                "hash": "millisecond",
                "returnType": "int",
                "example": "$this.getMilliseconds()"
            },
            {
                "name": "isToday",
                "type": "prop",
                "url": "/date.md",
                "hash": "isToday",
                "returnType": "bool",
                "example": "sys.isToday($this)"
            },
            {
                "name": "isYesterday",
                "type": "prop",
                "url": "/date.md",
                "hash": "isYesterday",
                "returnType": "bool",
                "example": "sys.isYesterday($this)"
            },
            {
                "name": "isTomorrow",
                "type": "prop",
                "url": "/date.md",
                "hash": "isTomorrow",
                "returnType": "bool",
                "example": "sys.isTomorrow($this)"
            },
            {
                "name": "isLeapYear",
                "type": "prop",
                "url": "/date.md",
                "hash": "isLeapYear",
                "returnType": "bool",
                "example": "sys.isLeapYear($this)"
            },
            {
                "name": "timestamp",
                "type": "prop",
                "url": "/date.md",
                "hash": "timestamp",
                "returnType": "int",
                "example": "$this.getTime()"
            },
            {
                "name": "format",
                "type": "method",
                "url": "/date.md",
                "hash": "format",
                "args": ["string"],
                "returnType": "string",
                "example": "sys.toDate($this, $args1)"
            },
            {
                "name": "add",
                "type": "method",
                "url": "/date.md",
                "hash": "add",
                "args": ["int", "string"],
                "returnType": "date",
                "example": "sys.dateAdd($this, $args1, $args2)"
            },
            {
                "name": "sub",
                "type": "method",
                "url": "/date.md",
                "hash": "sub",
                "args": ["int", "string"],
                "returnType": "date",
                "example": "sys.dateAdd($this, 0 - $args1, $args2)"
            },
            {
                "name": "diff",
                "type": "method",
                "url": "/date.md",
                "hash": "diff",
                "args": ["date", "string"],
                "returnType": "int",
                "example": "sys.dateDiff($this, $args1, $args2)"
            },
            {
                "name": "isBefore",
                "type": "method",
                "url": "/date.md",
                "hash": "isBefore",
                "args": ["date", "string"],
                "returnType": "bool",
                "example": "sys.dateDiff($this, $args1, $args2) < 0"
            },
            {
                "name": "isAfter",
                "type": "method",
                "url": "/date.md",
                "hash": "isAfter",
                "args": ["date", "string"],
                "returnType": "bool",
                "example": "sys.dateDiff($this, $args1, $args2) > 0"
            },
            {
                "name": "isSame",
                "type": "method",
                "url": "/date.md",
                "hash": "isSame",
                "args": ["date", "string"],
                "returnType": "bool",
                "example": "sys.dateDiff($this, $args1, $args2) == 0"
            },
            {
                "name": "start",
                "type": "method",
                "url": "/date.md",
                "hash": "start",
                "args": ["string"],
                "returnType": "date",
                "example": "sys.dateStart($this, $args1)"
            },
            {
                "name": "end",
                "type": "method",
                "url": "/date.md",
                "hash": "end",
                "args": ["string"],
                "returnType": "date",
                "example": "sys.dateEnd($this, $args1)"
            }
        ]
    },
    {
        text: lst('数组'),
        spread: false,
        type: FieldType.options,
        childs: [
            {
                "name": "length",
                "type": "prop",
                "url": "/array.md",
                "hash": "length",
                "returnType": "int",
                "example": "$this.length"
            },
            {
                "name": "at",
                "type": "method",
                "url": "/array.md",
                "hash": "at",
                "args": ["int"],
                "returnType": "any",
                "example": "$this[$args1]"
            },
            {
                "name": "first",
                "type": "method",
                "url": "/array.md",
                "hash": "first",
                "args": ["int"],
                "returnType": "any",
                "example": "$this[0]"
            },
            {
                "name": "last",
                "type": "method",
                "url": "/array.md",
                "hash": "last",
                "args": ["int"],
                "returnType": "any",
                "example": "$this[$this.length-1]"
            },
            {
                "name": "filter",
                "type": "method",
                "url": "/array.md",
                "hash": "filter",
                "args": ["bool"],
                "returnType": "array",
                "example": "$this.filter(current=>($args1))"
            },
            {
                "name": "find",
                "type": "method",
                "url": "/array.md",
                "hash": "find",
                "args": ["bool"],
                "returnType": "any",
                "example": "$this.find(current=>($args1))"
            },
            {
                "name": "findIndex",
                "type": "method",
                "url": "/array.md",
                "hash": "findIndex",
                "args": ["bool"],
                "returnType": "int",
                "example": "$this.findIndex(current=>($args1))"
            },
            {
                "name": "some",
                "type": "method",
                "url": "/array.md",
                "hash": "some",
                "args": ["int"],
                "returnType": "bool",
                "example": "$this.some(current=>($args1))"
            },
            {
                "name": "every",
                "type": "method",
                "url": "/array.md",
                "hash": "every",
                "args": ["int"],
                "returnType": "bool",
                "example": "$this.every(current=>($args1))"
            },
            {
                "name": "map",
                "type": "method",
                "url": "/array.md",
                "hash": "map",
                "args": ["any"],
                "returnType": "array",
                "example": "$this.map(current=>($args1))"
            },
            {
                "name": "flat",
                "type": "method",
                "url": "/array.md",
                "hash": "flat",
                "args": [],
                "returnType": "array",
                "example": "$this.flat(current=>($args1))"
            },
            {
                "name": "sort",
                "type": "method",
                "url": "/array.md",
                "hash": "sort",
                "args": [],
                "returnType": "array",
                "example": "$this.sort()"
            },
            {
                "name": "reverse",
                "type": "method",
                "url": "/array.md",
                "hash": "reverse",
                "args": [],
                "returnType": "array",
                "example": "$this.reverse()"
            },
            {
                "name": "slice",
                "type": "method",
                "url": "/array.md",
                "hash": "slice",
                "args": ["int", "int"],
                "returnType": "array"
            },
            {
                "name": "concat",
                "type": "method",
                "url": "/array.md",
                "hash": "concat",
                "args": ["array"],
                "returnType": "array",
                "example": "$this.concat(...$params)"
            },
            {
                "name": "includes",
                "type": "method",
                "url": "/array.md",
                "hash": "includes",
                "args": ["any"],
                "returnType": "bool",
                "example": "$this.includes($args1)"
            },
            {
                "name": "unique",
                "type": "method",
                "url": "/array.md",
                "hash": "unique",
                "args": [],
                "returnType": "array",
                "example": "Array.from(new Set($this))"
            },
            {
                "name": "join",
                "type": "method",
                "url": "/array.md",
                "hash": "join",
                "args": ["string"],
                "returnType": "string",
                "example": "$this.join($args1)"
            },
            {
                "name": "sum",
                "type": "method",
                "url": "/array.md",
                "hash": "sum",
                "args": ["number"],
                "returnType": "number",
                "example": "$this.map($args1).reduce((a,b)=>a+b,0)"
            },
            {
                "name": "avg",
                "type": "method",
                "url": "/array.md",
                "hash": "avg",
                "args": ["number"],
                "returnType": "number",
                "example": "$this.map($args1).reduce((a,b)=>a+b,0)/$this.length"
            },
            {
                "name": "max",
                "type": "method",
                "url": "/array.md",
                "hash": "max",
                "args": ["number"],
                "returnType": "number",
                "example": "Math.max(...$this.map($args1))"
            },
            {
                "name": "min",
                "type": "method",
                "url": "/array.md",
                "hash": "min",
                "args": ["number"],
                "returnType": "number",
                "example": "Math.min(...$this.map($args1))"
            }
        ]
    },
    {
        text: lst('文件'),
        spread: false, 
        type: FieldType.file,
        childs: [
            {
                text: 'name',
                url: '/file.md',
                hash:"name"
            },
            {
                text: 'size',
                url: '/file.md',
                hash:"size"
            },
            {
                text: 'url',
                url: '/file.md',
                hash:"url"
            },
            {
                text: 'ext',
                url: '/file.md',
                hash:"ext"
            },
            {
                text: 'mime',
                url: '/file.md',
                hash:"mime"
            },
            {
                text: 'createDate',
                url: '/file.md',
                hash:"createDate"
            },
            {
                text: 'creater',
                url: '/file.md',
                hash:"creater"
            }
        ]
    },
    {
        text: lst('用户与互动'),
        spread: false,
        type: FieldType.user,
        childs: [
            {
                text: 'id',
                url: '/user.md',
                hash:'id'
            },
            {
                text: 'name',
                url: '/user.md',
                hash:'name'
            },
            {
                text: 'avatar',
                url: '/user.md',
                hash:'avatar'
            },
            {
                text: 'roles',
                url: '/user.md',
                hash:'roles'
            },
            {
                text: 'count',
                url: '/user.md',
                hash:'count'
            },
            {
                text: 'users',
                url: '/user.md',
                hash:'users'
            }
        ]
    }
]