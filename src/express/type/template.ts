import { DeclareTypes } from "./declare";

/**
 * 文本
 * 
 */
DeclareTypes.registerType('string', 'length', 'number', '$this.length');
DeclareTypes.registerType('string', 'isEmpty', 'bool', '$this===\'\'');
DeclareTypes.registerType('string', 'slice', { __args: ['int', 'int'], __returnType: 'string' }, '$this.slice($args1:$args2)');
DeclareTypes.registerType('string', 'startsWith', { __args: ['string'], __returnType: 'bool' }, '$this.startswith($args1)');
DeclareTypes.registerType('string', 'endsWith', { __args: ['string'], __returnType: 'bool' }, '$this.endswith($args1)');
DeclareTypes.registerType('string', 'replace', { __args: ['string', 'string'], __returnType: 'string' }, 'replaceAll($this,$args1,$args2)');
DeclareTypes.registerType('string', 'trim', { __args: [], __returnType: 'string' }, '$this.trim()');
DeclareTypes.registerType('string', 'trimStart', { __args: [], __returnType: 'string' }, '$this.trimStart()');
DeclareTypes.registerType('string', 'trimEnd', { __args: [], __returnType: 'string' }, '$this.trimEnd()');
DeclareTypes.registerType('string', 'upper', { __args: [], __returnType: 'string' }, '$this.toUpperCase()');
DeclareTypes.registerType('string', 'lower', { __args: [], __returnType: 'string' }, '$this.toLowerCase()');
DeclareTypes.registerType('string', 'indexOf', { __args: ['string'], __returnType: 'int' }, '$this.index($args1)');
DeclareTypes.registerType('string', 'lastIndexOf', { __args: ['string'], __returnType: 'int' }, '$this.lastIndexOf($args1)');
DeclareTypes.registerType('string', 'contains', { __args: ['string'], __returnType: 'bool' }, '($this.index($args1)>-1)');
DeclareTypes.registerType('string', 'padStart', { __args: ['int', 'string'], __returnType: 'string' }, '$this.padStart($args1,$args2)');
DeclareTypes.registerType('string', 'padEnd', { __args: ['int', 'string'], __returnType: 'string' }, '$this.padEnd($args1,$args2)');
DeclareTypes.registerType('string', 'split', { __args: ['string'], __returnType: { __unit: 'string' } }, '$this.split($args1)');
DeclareTypes.registerType('string', 'chatAt', { __args: ['int'], __returnType: 'string' }, '$this[$args1]');
DeclareTypes.registerType('string', 'toInt', { __args: ['int'], __returnType: 'int' }, 'toInt($this,$args1)');
DeclareTypes.registerType('string', 'toNumber', { __args: ['number'], __returnType: 'number' }, 'toNumber($this,$args1)');
DeclareTypes.registerType('string', 'toDate', { __args: ['string'], __returnType: 'date' }, 'toDate($this,$args1,$args2)');
//DeclareTypes.registerType('string', 'toJSON', { __args: [], __returnType: 'object' }, ' json.loads($this)', [{ name: 'json', code: 'import json' }]);
DeclareTypes.registerStatic('String.join', { __args: ['string', { __unit: 'string', __extensible: true }], __returnType: 'date' }, '$params.join($args1)');
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
DeclareTypes.registerStatic('Math.PI', 'double', `Math.PI`, [{ name: 'math', code: 'import math' }]);
DeclareTypes.registerStatic('Math.E', 'double', `Math.E`, [{ name: 'math', code: 'import math' }]);
DeclareTypes.registerStatic('Math.round', { __args: ['number'], __returnType: 'int' }, 'Math.round($args1)')
DeclareTypes.registerStatic('Math.ceil', { __args: ['number'], __returnType: 'int' }, 'Math.ceil($args1)')
DeclareTypes.registerStatic('Math.floor', { __args: ['number'], __returnType: 'int' }, 'Math.floor($args1)')
DeclareTypes.registerStatic('Math.random', { __args: ['int', 'int'], __returnType: 'int' }, 'Math.ceil(Math.random() * ($args1-$args2+1) + $args2-1)')
DeclareTypes.registerStatic('Math.max', { __args: [{ __unit: 'number', __extensible: true }], __returnType: 'int' }, 'Math.max(...$params)')
DeclareTypes.registerStatic('Math.min', { __args: [{ __unit: 'number', __extensible: true }], __returnType: 'int' }, 'Math.min(...$params)')
DeclareTypes.registerStatic('Math.sin', { __args: ['number'], __returnType: 'number' }, 'Math.sin($args1)')
DeclareTypes.registerStatic('Math.cos', { __args: ['number'], __returnType: 'number' }, 'Math.cos($args1)')
DeclareTypes.registerStatic('Math.tan', { __args: ['number'], __returnType: 'number' }, 'Math.tan($args1)')
DeclareTypes.registerStatic('Math.abs', { __args: ['number'], __returnType: 'number' }, 'Math.abs($args1)')
DeclareTypes.registerStatic('Math.sqrt', { __args: ['number'], __returnType: 'number' }, 'Math.sqrt($args1)')
DeclareTypes.registerStatic('Math.pow', { __args: ['number', 'number'], __returnType: 'number' }, 'Math.pow($args1,$args2)')
DeclareTypes.registerStatic('Math.log', { __args: ['number', 'number'], __returnType: 'number' }, 'Math.log($args1,$args2)')

/**
 * 类型相互的处理
 * 
 */
DeclareTypes.registerStatic('isNull', { __args: ['any'], __returnType: 'bool' }, `$args1 ===null`)
DeclareTypes.registerStatic('String.isEmpty', { __args: ['string'], __returnType: 'bool' }, `$args1===""`)
//DeclareTypes.registerStatic('isType', { __args: ['any', 'string'], __returnType: 'bool' }, `isType($args1,$args2)`, [{ name: 'isType', code: 'from common.util import isType' }])
DeclareTypes.registerStatic('toInt', { __args: ['string', 'int'], __returnType: 'int' }, `toInt($args1,$args2)`);
DeclareTypes.registerStatic('toNumber', { __args: ['string', 'number'], __returnType: 'number' }, `toNumber($args1,$args2)`);
DeclareTypes.registerStatic('toDate', { __args: ['string', 'string', 'date'], __returnType: 'date' }, `toDate($this,$args1,$args2)`);

/**
 * 日期的处理
 *
 */
DeclareTypes.registerStatic('Date.now', 'date', 'new Date()');
DeclareTypes.registerStatic('Date.parse', { __args: ['string', 'string', 'date'], __returnType: 'date' }, `toDate($this,$args1,$args2)`);

DeclareTypes.registerType('date', 'year', 'int', '$this.getFullYear()');
DeclareTypes.registerStatic('Date.year', { __args: ['date'], __returnType: 'int' }, `$args1.getFullYear()`);

DeclareTypes.registerType('date', 'month', 'int', '($this.getMonth()+1)');
DeclareTypes.registerStatic('Date.month', { __args: ['date'], __returnType: 'int' }, `($args1.getMonth()+1)`);

DeclareTypes.registerType('date', 'day', 'int', '$this.getDate()');
DeclareTypes.registerStatic('Date.day', { __args: ['date'], __returnType: 'int' }, `$args1.getDate()`);

DeclareTypes.registerType('date', 'week', 'int', '$this.getDay()');
DeclareTypes.registerStatic('Date.week', { __args: ['date'], __returnType: 'int' }, `$args1.getDay()`);

DeclareTypes.registerType('date', 'hour', 'int', '$this.getHours()');
DeclareTypes.registerStatic('Date.hour', { __args: ['date'], __returnType: 'int' }, `$args1.getHours()`);

DeclareTypes.registerType('date', 'minute', 'int', '$this.getMinutes()');
DeclareTypes.registerStatic('Date.minute', { __args: ['date'], __returnType: 'int' }, `$args1.getMinutes()`);

DeclareTypes.registerType('date', 'second', 'int', '$this.getSeconds()');
DeclareTypes.registerStatic('Date.second', { __args: ['date'], __returnType: 'int' }, `$args1.getSeconds()`);

DeclareTypes.registerType('date', 'millisecond', 'int', '$this.getMilliseconds()');
DeclareTypes.registerStatic('Date.millisecond', { __args: ['date'], __returnType: 'int' }, `$args1.getMilliseconds()`);

DeclareTypes.registerType('date', 'toString', { __args: [], __returnType: 'string' }, 'toDateFormat($this,"YYYY-MM-DD HH:mm:ss")');
DeclareTypes.registerStatic('Date.toString', { __args: ['date'], __returnType: 'string' }, `toDateFormat($args1,"YYYY-MM-DD HH:mm:ss")`);

DeclareTypes.registerType('date', 'timestamp', { __args: [], __returnType: 'int' }, '$this.getTime()');
DeclareTypes.registerStatic('Date.timestamp', { __args: ['date'], __returnType: 'int' }, `$args1.getTime()`);

DeclareTypes.registerType('date', 'format', { __args: ['string'], __returnType: 'string' }, 'toDateFormat($this,$args1)');
DeclareTypes.registerStatic('Date.format', { __args: ['date','string'], __returnType: 'string' }, `toDateFormat($args1,$args2)`);

DeclareTypes.registerType('date', 'add', { __args: ['int', 'string'], __returnType: 'date' }, 'dateAdd($this,$args1,$args2)');
DeclareTypes.registerStatic('Date.add', { __args: ['date','int', 'string'], __returnType: 'date' }, `dateAdd($args1,$args2,$args3)`);

DeclareTypes.registerType('date', 'sub', { __args: ['int', 'string'], __returnType: 'date' }, 'dateAdd($this,0-$args1,$args2)');
DeclareTypes.registerStatic('Date.sub', { __args: ['date','int', 'string'], __returnType: 'date' }, `dateAdd($args1,0-$args2,$args3)`);

// var r = new Date();
// r.getMilliseconds()

/***
 * object
 * array
 * 相关的接口与函数
 *
 */
//DeclareTypes.registerType('object', 'toJSONString', { __args: [], __returnType: 'string' }, 'json.dumps($this)', [{ name: 'json', code: 'import json' }]);
//DeclareTypes.registerType('array', 'toJSONString', { __args: [], __returnType: 'string' }, 'json.dumps($this)', [{ name: 'json', code: 'import json' }]);
//DeclareTypes.registerType('array', 'length', { __args: [], __returnType: 'int' }, 'len($this)');


/**
 * 一些常用值
 */
//DeclareTypes.registerStatic('_guid', 'string', `str(uuid.uuid4())`, [{ name: 'uuid', code: `import uuid` }]);
//DeclareTypes.registerStatic('_now', 'date', 'datetime.now()', [{ name: 'datetime', code: 'from datetime import datetime' }]);