import lodash from "lodash";
import { Page } from "../../../src/page";
import { DeclareTypes } from "./express/type/declare";
import dayjs from "dayjs";
import { util } from "../../../util/util";
import { channel } from "../../../net/channel";

/**
 * 文本
 * 
 */
DeclareTypes.registerType('string', 'length', 'number', '$this.length');
DeclareTypes.registerType('string', 'isEmpty', 'bool', '$this===\'\'');
DeclareTypes.registerType('string', 'slice', { __args: ['int', 'int'], __returnType: 'string' }, '$this.slice($args1,$args2)');
DeclareTypes.registerType('string', 'startsWith', { __args: ['string'], __returnType: 'bool' }, '$this.startswith($args1)');
DeclareTypes.registerType('string', 'endsWith', { __args: ['string'], __returnType: 'bool' }, '$this.endswith($args1)');
DeclareTypes.registerType('string', 'replace', { __args: ['string', 'string'], __returnType: 'string' }, 'sys.replaceAll($this,$args1,$args2)');
DeclareTypes.registerType('string', 'trim', { __args: [], __returnType: 'string' }, '$this.trim()');
DeclareTypes.registerType('string', 'trimStart', { __args: [], __returnType: 'string' }, '$this.trimStart()');
DeclareTypes.registerType('string', 'trimEnd', { __args: [], __returnType: 'string' }, '$this.trimEnd()');
DeclareTypes.registerType('string', 'upper', { __args: [], __returnType: 'string' }, '$this.toUpperCase()');
DeclareTypes.registerType('string', 'lower', { __args: [], __returnType: 'string' }, '$this.toLowerCase()');
DeclareTypes.registerType('string', 'indexOf', { __args: ['string'], __returnType: 'int' }, '$this.indexOf($args1)');
DeclareTypes.registerType('string', 'lastIndexOf', { __args: ['string'], __returnType: 'int' }, '$this.lastIndexOf($args1)');
DeclareTypes.registerType('string', 'contains', { __args: ['string'], __returnType: 'bool' }, '($this.indexOf($args1)>-1)');
DeclareTypes.registerType('string', 'repeat', { __args: ['int'], __returnType: 'string' }, '$this.repeat($args1)');
DeclareTypes.registerType('string', 'padStart', { __args: ['int', 'string'], __returnType: 'string' }, '$this.padStart($args1,$args2)');
DeclareTypes.registerType('string', 'padEnd', { __args: ['int', 'string'], __returnType: 'string' }, '$this.padEnd($args1,$args2)');
DeclareTypes.registerType('string', 'split', { __args: ['string'], __returnType: { __unit: 'string' } }, '$this.split($args1)');
DeclareTypes.registerType('string', 'chatAt', { __args: ['int'], __returnType: 'string' }, '$this[$args1]');
DeclareTypes.registerType('string', 'toInt', { __args: ['int'], __returnType: 'int' }, 'sys.toInt($this,$args1)');
DeclareTypes.registerType('string', 'toNumber', { __args: ['number'], __returnType: 'number' }, 'sys.toNumber($this,$args1)');
DeclareTypes.registerType('string', 'toDate', { __args: ['string', 'date'], __returnType: 'date' }, 'sys.toDate($this,$args1,$args2)');


/**
 * 数字
 * 
 */
DeclareTypes.registerType('int', 'toString', { __args: [], __returnType: 'string' }, '$this.toString()');
DeclareTypes.registerType('number', 'toString', { __args: [], __returnType: 'string' }, '$this.toString()');



/**
 * 数学公式
 * 
 */
DeclareTypes.registerStatic('Math.PI', 'number', `Math.PI`);
DeclareTypes.registerStatic('Math.E', 'number', `Math.E`);
DeclareTypes.registerStatic('Math.round', { __args: ['number'], __returnType: 'int' }, 'Math.round($args1)')
DeclareTypes.registerStatic('Math.ceil', { __args: ['number'], __returnType: 'int' }, 'Math.ceil($args1)')
DeclareTypes.registerStatic('Math.floor', { __args: ['number'], __returnType: 'int' }, 'Math.floor($args1)')
DeclareTypes.registerStatic('Math.random', { __args: ['int', 'int'], __returnType: 'int' }, 'Math.ceil(Math.random() * ($args1-$args2+1) + $args2-1)')
DeclareTypes.registerStatic('Math.max', { __args: [{ __unit: 'number', __extensible: true }], __returnType: 'int' }, 'Math.max(...$params)')
DeclareTypes.registerStatic('Math.min', { __args: [{ __unit: 'number', __extensible: true }], __returnType: 'int' }, 'Math.min(...$params)')
DeclareTypes.registerStatic('Math.avg', { __args: [{ __unit: 'number', __extensible: true }], __returnType: 'int' }, '($params.reduce((a,b)=>a+b,0)/$params.length)')
DeclareTypes.registerStatic('Math.sum', { __args: [{ __unit: 'number', __extensible: true }], __returnType: 'int' }, '$params.reduce((a,b)=>a+b,0)')
DeclareTypes.registerStatic('Math.sin', { __args: ['number'], __returnType: 'number' }, 'Math.sin($args1)')
DeclareTypes.registerStatic('Math.cos', { __args: ['number'], __returnType: 'number' }, 'Math.cos($args1)')
DeclareTypes.registerStatic('Math.tan', { __args: ['number'], __returnType: 'number' }, 'Math.tan($args1)')
DeclareTypes.registerStatic('Math.abs', { __args: ['number'], __returnType: 'number' }, 'Math.abs($args1)')
DeclareTypes.registerStatic('Math.sqrt', { __args: ['number'], __returnType: 'number' }, 'Math.sqrt($args1)')
DeclareTypes.registerStatic('Math.pow', { __args: ['number', 'number'], __returnType: 'number' }, 'Math.pow($args1,$args2)')
DeclareTypes.registerStatic('Math.log', { __args: ['number'], __returnType: 'number' }, 'Math.log($args1)')
DeclareTypes.registerStatic('Math.exp', { __args: ['number'], __returnType: 'number' }, 'Math.exp($args1)')

/**
 * 类型相互的处理
 * 
 */
DeclareTypes.registerStatic('isNull', { __args: ['any'], __returnType: 'bool' }, `$args1 ===null`)
DeclareTypes.registerStatic('isEmpty', { __args: ['any'], __returnType: 'bool' }, `$args1===""||$args1===null||$args1===undefined||$args1?.length===0`)
DeclareTypes.registerStatic('toInt', { __args: ['string', 'int'], __returnType: 'int' }, `toInt($args1,$args2)`);
DeclareTypes.registerStatic('toNumber', { __args: ['string', 'number'], __returnType: 'number' }, `sys.toNumber($args1,$args2)`);
DeclareTypes.registerStatic('toDate', { __args: ['string', 'string'], __returnType: 'date' }, `sys.toDate($args1,$args2)`);
DeclareTypes.registerStatic('toBool', { __args: ['any'], __returnType: 'bool' }, `sys.toBool($args1)`);
DeclareTypes.registerStatic('join', { __args: ['string', { __unit: 'string', __extensible: true }], __returnType: 'date' }, '$params.join($args1)');
DeclareTypes.registerStatic('test', { __args: ['string', 'string'], __returnType: 'bool' }, 'new RegExp($args2).test($args1)')
DeclareTypes.registerStatic('match', { __args: ['string', 'string'], __returnType: 'array' }, '$args1.match(new RegExp($args2))')
DeclareTypes.registerStatic('fileBytes', { __args: ['number'], __returnType: 'string' }, 'await sys.getFileBytes($args1)')
DeclareTypes.registerStatic('diffShowTime', { __args: ['date', 'date'], __returnType: 'string' }, 'await sys.diffShowTime($args1,$args2||new Date())')
DeclareTypes.registerStatic('showTime', { __args: ['date', 'date'], __returnType: 'string' }, 'await sys.showTime($args1,$args2||new Date())')
DeclareTypes.registerStatic('toPrice', { __args: ['number', 'string'], __returnType: 'string' }, 'sys.toPrice($args1,$args2)')
DeclareTypes.registerStatic('if', { __args: ['bool', 'any', 'any'], __returnType: 'any' }, '($args1?$args2:$args3)')
DeclareTypes.registerStatic('ifs', { __args: ['bool', 'any', 'bool', 'any', 'bool', 'any', 'bool', 'any', 'any'], __returnType: 'any' }, 'sys.ifs($args)')
/**
 * 日期的处理
 *
 */
DeclareTypes.registerStatic('Date.now', 'date', 'new Date()');
DeclareTypes.registerStatic('Date.parse', { __args: ['string', 'string', 'date'], __returnType: 'date' }, `sys.toDate($this,$args1,$args2)`);
DeclareTypes.registerType('date', 'year', 'int', '$this.getFullYear()');
DeclareTypes.registerType('date', 'month', 'int', '($this.getMonth()+1)');
DeclareTypes.registerType('date', 'day', 'int', '$this.getDay()');
DeclareTypes.registerType('date', 'date', 'int', '$this.getDate()');
DeclareTypes.registerType('date', 'week', 'int', 'getWeek($this)');
DeclareTypes.registerType('date', 'hour', 'int', '$this.getHours()');
DeclareTypes.registerType('date', 'minute', 'int', '$this.getMinutes()');
DeclareTypes.registerType('date', 'second', 'int', '$this.getSeconds()');
DeclareTypes.registerType('date', 'millisecond', 'int', '$this.getMilliseconds()');
DeclareTypes.registerType('date', 'isToday', 'bool', 'sys.isToday($this)');
DeclareTypes.registerType('date', 'isYesterday', 'bool', 'sys.isYesterday($this)');
DeclareTypes.registerType('date', 'isTomorrow', 'bool', 'sys.isTomorrow($this)');
DeclareTypes.registerType('date', 'isLeapYear', 'bool', 'sys.isLeapYear($this)');
DeclareTypes.registerType('date', 'timestamp', { __args: [], __returnType: 'int' }, '$this.getTime()');
DeclareTypes.registerType('date', 'format', { __args: ['string'], __returnType: 'string' }, 'sys.toDate($this,$args1)');
DeclareTypes.registerType('date', 'add', { __args: ['int', 'string'], __returnType: 'date' }, 'sys.dateAdd($this,$args1,$args2)');
DeclareTypes.registerType('date', 'sub', { __args: ['int', 'string'], __returnType: 'date' }, 'sys.dateAdd($this,0-$args1,$args2)');
DeclareTypes.registerType('date', 'diff', { __args: ['date', 'string'], __returnType: 'int' }, 'sys.dateDiff($this,$args1,$args2)');
DeclareTypes.registerType('date', 'isBefore', { __args: ['date', 'string'], __returnType: 'bool' }, 'sys.dateDiff($this,$args1,$args2)<0');
DeclareTypes.registerType('date', 'isAfter', { __args: ['date', 'string'], __returnType: 'bool' }, 'sys.dateDiff($this,$args1,$args2)>0');
DeclareTypes.registerType('date', 'isSame', { __args: ['date', 'string'], __returnType: 'bool' }, 'sys.dateDiff($this,$args1,$args2)==0');
DeclareTypes.registerType('date', 'start', { __args: ['string'], __returnType: 'date' }, 'sys.dateStart($this,$args1)');
DeclareTypes.registerType('date', 'end', { __args: ['string'], __returnType: 'date' }, 'sys.dateEnd($this,$args1)');


DeclareTypes.registerType('file', 'name', 'string', '$this.filename')
DeclareTypes.registerType('file', 'size', 'int', '$this.size')
DeclareTypes.registerType('file', 'url', 'string', '$this.url')
DeclareTypes.registerType('file', 'ext', 'string', '$this.ext')
DeclareTypes.registerType('file', 'mime', 'string', '$this.ext')
DeclareTypes.registerType('file', 'createDate', 'string', '$this.ext')
DeclareTypes.registerType('file', 'creater', 'user', 'await sys.getUser($this.creater)')




DeclareTypes.registerType('user', 'id', 'string', '$this')
DeclareTypes.registerType('user', 'name', 'string', 'await sys.getUser($this,"name")')
DeclareTypes.registerType('user', 'avatar', 'file', 'await sys.getUser($this,"avatar")')
DeclareTypes.registerType('user', 'roles', { __unit: 'string' }, 'await sys.getUser($this,"roles")')


DeclareTypes.registerType('interact', 'count', 'number', ' sys.getInteract($this,"count")')
DeclareTypes.registerType('interact', 'users', { __unit: 'user' }, ' sys.getInteract($this,"users")')


// var r = new Date();
// r.getMilliseconds()

/***
 * object
 * array
 * 相关的接口与函数
 *
 */
//DeclareTypes.registerType('object', 'toJSONString', { __args: [], __returnType: 'string' }, 'json.dumps($this)', [{ name: 'json', code: 'import json' }]);
// DeclareTypes.registerType('array', 'toJSONString', { __args: [], __returnType: 'string' }, 'json.dumps($this)', [{ name: 'json', code: 'import json' }]);
DeclareTypes.registerType('array', 'length', 'int', '$this.length');
DeclareTypes.registerType('array', 'at', { __args: ['int'], __returnType: 'any' }, '$this[$args1]');
DeclareTypes.registerType('array', 'first', { __args: ['int'], __returnType: 'any' }, '$this[0]');
DeclareTypes.registerType('array', 'last', { __args: ['int'], __returnType: 'any' }, '$this[$this.length-1]');
DeclareTypes.registerType('array', 'filter', { __args: ['bool'], __returnType: 'array' }, '$this.filter(current=>($args1))');
DeclareTypes.registerType('array', 'find', { __args: ['bool'], __returnType: 'any' }, '$this.find(current=>($args1))');
DeclareTypes.registerType('array', 'findIndex', { __args: ['bool'], __returnType: 'int' }, '$this.findIndex(current=>($args1))');
DeclareTypes.registerType('array', 'some', { __args: ['int'], __returnType: 'bool' }, '$this.some(current=>($args1))');
DeclareTypes.registerType('array', 'every', { __args: ['int'], __returnType: 'bool' }, '$this.every(current=>($args1))');
DeclareTypes.registerType('array', 'map', { __args: ['any'], __returnType: 'array' }, '$this.map(current=>($args1))');
DeclareTypes.registerType('array', 'flat', { __args: [], __returnType: 'array' }, '$this.flat(current=>($args1))');
DeclareTypes.registerType('array', 'sort', { __args: [], __returnType: 'array' }, '$this.sort()');
DeclareTypes.registerType('array', 'reverse', { __args: [], __returnType: 'array' }, '$this.reverse()');
DeclareTypes.registerType('array', 'slice', { __args: ['int', 'int'], __returnType: 'array' }, '$this.slice($args1,$args2)');
DeclareTypes.registerType('array', 'concat', { __args: [{ __unit: 'array', __extensible: true }], __returnType: 'array' }, '$this.concat(...$params)')
DeclareTypes.registerType('array', 'includes', { __args: ['any'], __returnType: 'bool' }, '$this.includes($args1)')
DeclareTypes.registerType('array', 'unique', { __args: [], __returnType: 'array' }, 'Array.from(new Set($this))')
DeclareTypes.registerType('array', 'join', { __args: ['string'], __returnType: 'string' }, '$this.join($args1)')
DeclareTypes.registerType('array', 'sum', { __args: ['number'], __returnType: 'number' }, '$this.map($args1).reduce((a,b)=>a+b,0)')
DeclareTypes.registerType('array', 'avg', { __args: ['number'], __returnType: 'number' }, '$this.map($args1).reduce((a,b)=>a+b,0)/$this.length')
DeclareTypes.registerType('array', 'max', { __args: ['number'], __returnType: 'number' }, 'Math.max(...$this.map($args1))')
DeclareTypes.registerType('array', 'min', { __args: ['number'], __returnType: 'number' }, 'Math.min(...$this.map($args1))')

/**
 * 一些常用值
 */
DeclareTypes.registerStatic('_guid', 'string', `sys.getGuid()`, []);
DeclareTypes.registerStatic('_now', 'date', 'new Date()', []);
DeclareTypes.registerStatic('_version', 'string', 'sys.getVersion()');
// DeclareTypes.registerStatic('_year', 'int', 'new Date().getFullYear()', []);
DeclareTypes.registerStatic('_pi', 'number', 'Math.PI', []);
DeclareTypes.registerStatic('_e', 'number', 'Math.E', []);
DeclareTypes.registerStatic('_random', 'number', 'Math.floor(Math.random() * 100)', []);
DeclareTypes.registerStatic('_username', 'string', 'await sys.getCurrentUser("name")')
DeclareTypes.registerStatic('_userid', 'string', 'await sys.getCurrentUser("id")')
DeclareTypes.registerStatic('_roles', 'string', 'await sys.getCurrentUser("roles")')
DeclareTypes.registerStatic('_workspace', 'string', 'await sys.getCurrentWorkspace("text")')
DeclareTypes.registerStatic('_workspace_id', 'string', 'await sys.getCurrentWorkspace("id")')


export function getRegisterFuns(page: Page) {
    return {
        replaceAll(str: string, oldStr: string, newStr: string) {
            if (typeof (str as any).replaceAll === 'function') return (str as any).replaceAll(oldStr, newStr);
            var reg = new RegExp(oldStr, 'g');
            return str.replace(reg, newStr)
        },
        toInt(str: string, def: number) {
            var n = parseFloat(str);
            if (!isNaN(n)) {
                return Math.floor(n);
            }
            else {
                if (typeof def == 'number') return def;
                else return null;
            }
        },
        toNumber(str: string, def: number) {
            var n = parseFloat(str);
            if (!isNaN(n)) { return n }
            if (typeof def == 'number')
                return def;
            else return null;
        },
        toDate(str: string, format: string, def: Date) {
            var d = dayjs(str, format);
            if (d.isValid) return d.toDate();
            if (def instanceof Date) return def;
            return null;
        },
        toBool(str) {
            if (str == 'false' || str == '0' || lodash.isNull(str) || lodash.isUndefined(str) || lodash.isEqual(str, []) || str == '否' || str == '不' || str == '' || str == 'no') return false;
            return true;
        },
        test(str: string, reg: string) {
            return new RegExp(reg).test(str);
        },
        join(sep: string, ...args: any[]) {
            return args.join(sep);
        },
        match(str: string, reg: string) {
            var r = str.match(new RegExp(reg));
            if (!r) return []
            else return Array.from(r);
        },
        fileBytes(size: number) {
            return util.byteToString(size);
        },
        diffShowTime(d: Date, n: Date) {
            return util.timeToString((n || new Date).getTime() - d.getTime())
        },
        showTime(d: Date, n: Date) {
            return util.showTime(d, n);
        },
        toPrice(number: number, unit?: string) {
            // 将数字转换为字符串，并固定小数点后两位
            const fixedNumber = number.toFixed(2);
            // 分割整数和小数部分
            const [integer, decimal] = fixedNumber.split('.');
            // 对整数部分进行千位分隔
            const formattedInteger = integer.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
            if (typeof unit == 'undefined') unit = window.shyConfig?.isUS ? "$" : '￥';
            return `${unit}${formattedInteger}.${decimal}`;
        },
        getWeek(date: Date) {
            const dayjsDate = dayjs(date);
            const week = dayjsDate.week();
            return week;
        },
        isToday(date: Date) {
            // 使用dayjs解析或创建日期
            const dayjsDate = dayjs(date);

            // 获取今天的日期
            const today = dayjs();

            // 比较给定日期和今天的日期
            return dayjsDate.isSame(today, 'day');
        },
        isYesterday(date: Date) {
            // 使用dayjs解析或创建日期
            const dayjsDate = dayjs(date).subtract(1, 'day');

            // 获取今天的日期
            const today = dayjs();

            // 比较给定日期和今天的日期
            return dayjsDate.isSame(today, 'day');
        },
        isTomorrow(date: Date) {
            // 使用dayjs解析或创建日期
            const dayjsDate = dayjs(date).add(1, 'day');

            // 获取今天的日期
            const today = dayjs();

            // 比较给定日期和今天的日期
            return dayjsDate.isSame(today, 'day');
        },
        isLeapYear(date: Date) {
            if (!date) date = new Date();
            var year = date.getFullYear();
            // 如果年份能被4整除但不能被100整除，或者能被400整除，则是闰年
            return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
        },
        dateAdd(date: Date, num: number, unit?: string) {
            var d = dayjs(date);
            d = d.add(num, unit as any);
            return d.toDate();
        },
        dateDiff(date: Date, nDate: Date, unit?: string) {
            var od = dayjs(date);
            var nd = dayjs(nDate);
            return od.diff(nd, unit as any);
        },
        dateStart(date: Date, unit?: string) {
            var d = dayjs(date);
            return d.startOf(unit as any).toDate();
        },
        dateEnd(date: Date, unit?: string) {
            var d = dayjs(date);
            return d.endOf(unit as any).toDate();
        },
        async getUser(u, name: string) {
            var r = Array.isArray(u) ? u[0] : u;
            if (typeof r == 'string') {
                if (name == 'id') return r;
                else {
                    if (name == 'roles') {

                    }
                    else {
                        var user = await channel.get('/user/basic', { userid: r });
                        if (name) return user[name];
                    }
                }
            }
        },
        getInteract(d, name: string) {
            if (name == 'count') return d.count || 0;
            else if (name == 'user') {
                return d.users || []
            }
        },
        getGuid() {
            return util.guid()
        },
        getVersion() {
            return window.shyConfig?.version
        },
        async getCurrentUser(prop: string) {
            if (page?.user) return page.user[prop];
        },
        async getCurrentWorkspace(prop: string) {
            if (page.ws) {
                return page.ws[prop]
            }
        },
        ifs(...args: any[]) {
            for (var i = 0; i < args.length; i += 2) {
                if (args[i]) return args[i + 1];
            }
            if (args.length % 2 == 1) 
                return args[args.length - 1];
            
        }
    }
}
