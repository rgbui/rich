import { DeclareTypes } from "./declare";

/**
 * 文本
 * 
 */
DeclareTypes.registerType('string', 'length', 'number', 'len($this)');
DeclareTypes.registerType('string', 'slice', { __args: ['int', 'int'], __returnType: 'string' }, '$this[$args1:$args2]');
DeclareTypes.registerType('string', 'startsWith', { __args: ['string'], __returnType: 'bool' }, '$this.startswith($args1)');
DeclareTypes.registerType('string', 'endsWith', { __args: ['string'], __returnType: 'bool' }, '$this.endswith($args1)');
DeclareTypes.registerType('string', 'replace', { __args: ['string', 'string'], __returnType: 'string' }, '$this.replace($args1,$args2)');
DeclareTypes.registerType('string', 'trim', { __args: [], __returnType: 'string' }, '$this.strip()');
DeclareTypes.registerType('string', 'trimStart', { __args: [], __returnType: 'string' }, '$this.lstrip()');
DeclareTypes.registerType('string', 'trimEnd', { __args: [], __returnType: 'string' }, '$this.rstrip()');
DeclareTypes.registerType('string', 'upper', { __args: [], __returnType: 'string' }, '$this.upper()');
DeclareTypes.registerType('string', 'lower', { __args: [], __returnType: 'string' }, '$this.lower()');
DeclareTypes.registerType('string', 'indexOf', { __args: ['string'], __returnType: 'int' }, '$this.index($args1)');
DeclareTypes.registerType('string', 'lastIndexOf', { __args: ['string'], __returnType: 'int' }, '$this.rindex($args1)');
DeclareTypes.registerType('string', 'includes', { __args: ['string'], __returnType: 'bool' }, '($this.index($args1)>-1)');
DeclareTypes.registerType('string', 'padEnd', { __args: ['int', 'string'], __returnType: 'string' }, '$this.ljust($args1,$args2)');
DeclareTypes.registerType('string', 'padStart', { __args: ['int', 'string'], __returnType: 'string' }, '$this.rjust($args1,$args2)');
DeclareTypes.registerType('string', 'split', { __args: ['string'], __returnType: { __unit: 'string' } }, '$this.split($args1)');
DeclareTypes.registerType('string', 'chatAt', { __args: ['int'], __returnType: 'string' }, '$this[$args1]');
DeclareTypes.registerType('string', 'toInt', { __args: ['int'], __returnType: 'int' }, 'toInt($this,$args1)', [{ name: 'toInt', code: 'from common.util import toInt' }]);
DeclareTypes.registerType('string', 'toNumber', { __args: ['number'], __returnType: 'number' }, 'toNumber($this,$args1)', [{ name: 'toNumber', code: 'from common.util import toNumber' }]);
DeclareTypes.registerType('string', 'toDate', { __args: ['string'], __returnType: 'date' }, 'toDate($this,$args1,$args2)', [{ name: 'toDate', code: 'from common.util import toDate' }]);
DeclareTypes.registerType('string', 'toJSON', { __args: [], __returnType: 'object' }, ' json.loads($this)', [{ name: 'json', code: 'import json' }]);

/**
 * 数字
 * 
 */
DeclareTypes.registerType('int', 'toString', { __args: [], __returnType: 'string' }, 'str($this)');
DeclareTypes.registerType('number', 'toString', { __args: [], __returnType: 'string' }, 'str($this)');



/**
 * 数学公式
 * 
 */
DeclareTypes.registerStatic('Math.PI', 'double', `math.pi`, [{ name: 'math', code: 'import math' }]);
DeclareTypes.registerStatic('Math.E', 'double', `math.exp(1)`, [{ name: 'math', code: 'import math' }]);
DeclareTypes.registerStatic('Math.round', { __args: ['number'], __returnType: 'int' }, 'math.round($args1)', [{ name: 'math', code: 'import math' }])
DeclareTypes.registerStatic('Math.ceil', { __args: ['number'], __returnType: 'int' }, 'math.ceil($args1)', [{ name: 'math', code: 'import math' }])
DeclareTypes.registerStatic('Math.floor', { __args: ['number'], __returnType: 'int' }, 'math.floor($args1)', [{ name: 'math', code: 'import math' }])
DeclareTypes.registerStatic('Math.random', { __args: ['int', 'int'], __returnType: 'int' }, 'random.randrange($args1,$args2)', [{ name: 'random', code: 'import random' }])
DeclareTypes.registerStatic('Math.max', { __args: [{ __unit: 'number', __extensible: true }], __returnType: 'int' }, 'max($args1,$args2)', [{ name: 'random', code: 'import random' }])
DeclareTypes.registerStatic('Math.min', { __args: [{ __unit: 'number', __extensible: true }], __returnType: 'int' }, 'min($args1,$args2)', [{ name: 'random', code: 'import random' }])
DeclareTypes.registerStatic('Math.sin', { __args: ['number'], __returnType: 'number' }, 'math.sin($args1)', [{ name: 'math', code: 'import math' }])
DeclareTypes.registerStatic('Math.cos', { __args: ['number'], __returnType: 'number' }, 'math.cos($args1)', [{ name: 'math', code: 'import math' }])
DeclareTypes.registerStatic('Math.tan', { __args: ['number'], __returnType: 'number' }, 'math.tan($args1)', [{ name: 'math', code: 'import math' }])
DeclareTypes.registerStatic('Math.abs', { __args: ['number'], __returnType: 'number' }, 'math.fabs($args1)', [{ name: 'math', code: 'import math' }])
DeclareTypes.registerStatic('Math.sqrt', { __args: ['number'], __returnType: 'number' }, 'math.sqrt($args1)', [{ name: 'math', code: 'import math' }])
DeclareTypes.registerStatic('Math.pow', { __args: ['number', 'number'], __returnType: 'number' }, 'math.pow($args1,$args2)', [{ name: 'math', code: 'import math' }])
DeclareTypes.registerStatic('Math.log', { __args: ['number', 'number'], __returnType: 'number' }, 'math.log($args1,$args2)', [{ name: 'math', code: 'import math' }])

/**
 * 类型相互的处理
 * 
 */
DeclareTypes.registerStatic('isNull', { __args: ['any'], __returnType: 'bool' }, `$args1 is None`)
DeclareTypes.registerStatic('isEmpty', { __args: ['string'], __returnType: 'bool' }, `len($args1)==0`)
DeclareTypes.registerStatic('isType', { __args: ['any', 'string'], __returnType: 'bool' }, `isType($args1,$args2)`, [{ name: 'isType', code: 'from common.util import isType' }])
DeclareTypes.registerStatic('toInt', { __args: ['string', 'int'], __returnType: 'int' }, `toInt($args1,$args2)`, [{ name: 'toInt', code: 'from common.util import toInt' }]);
DeclareTypes.registerStatic('toNumber', { __args: ['string', 'number'], __returnType: 'number' }, `toNumber($args1,$args2)`, [{ name: 'toNumber', code: 'from common.util import toNumber' }]);
DeclareTypes.registerStatic('toDate', { __args: ['string', 'string', 'date'], __returnType: 'date' }, `toDate($this,$args1,$args2)`, [{ name: 'toDate', code: 'from common.util import toDate' }]);

/**
 * 日期的处理
 *
 */
DeclareTypes.registerStatic('Date.now', 'date', 'datetime.now()', [{ name: 'datetime', code: 'from datetime import datetime' }]);
DeclareTypes.registerStatic('Date.parse', { __args: ['string', 'string', 'date'], __returnType: 'date' }, `toDate($this,$args1,$args2)`, [{ name: 'toDate', code: 'from common.util import toDate' }]);
DeclareTypes.registerType('date', 'year', 'int', '$this.year');
DeclareTypes.registerType('date', 'month', 'int', '$this.month');
DeclareTypes.registerType('date', 'day', 'int', '$this.day');
DeclareTypes.registerType('date', 'week', 'int', '$this.weekday()');
DeclareTypes.registerType('date', 'hour', 'int', '$this.hour');
DeclareTypes.registerType('date', 'minute', 'int', '$this.minute');
DeclareTypes.registerType('date', 'second', 'int', '$this.second');
DeclareTypes.registerType('date', 'millisecond', 'int', '$this.microsecond');
DeclareTypes.registerType('date', 'toString', { __args: [], __returnType: 'string' }, '$this.strftime(toDateFormat("YYYY-MM-DD HH:mm:ss"))');
DeclareTypes.registerType('date', 'format', { __args: ['string'], __returnType: 'string' }, '$this.strftime(toDateFormat($args1))', [{ name: 'toDateFormat', code: 'from common.util import toDateFormat' }]);

/***
 * object
 * array
 * 相关的接口与函数
 * 
 */
DeclareTypes.registerType('object', 'toJSONString', { __args: [], __returnType: 'string' }, 'json.dumps($this)', [{ name: 'json', code: 'import json' }]);
DeclareTypes.registerType('array', 'toJSONString', { __args: [], __returnType: 'string' }, 'json.dumps($this)', [{ name: 'json', code: 'import json' }]);
DeclareTypes.registerType('array', 'length', { __args: [], __returnType: 'int' }, 'len($this)');


/**
 * 一些常用值
 */
DeclareTypes.registerStatic('_guid', 'string', `str(uuid.uuid4())`, [{ name: 'uuid', code: `import uuid` }]);
DeclareTypes.registerStatic('_now', 'date', 'datetime.now()', [{ name: 'datetime', code: 'from datetime import datetime' }]);