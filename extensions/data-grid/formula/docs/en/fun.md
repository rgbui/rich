
# 函数列表
## if(condition:bool,trueValue:any,falseValue:any):any  <a id='if'></a>
### 说明
条件判断函数，根据给定的条件返回相应的值。
### 示例
```javascript
if(condition,'12','123')
// 条件为真时返回12
// 条件为假时返回123

```
## ifs  <a id='ifs'></a>
### 说明
多重条件判断函数，根据多个条件返回相应的值。
### 示例
```javascript
ifs(
  condition1,value1,
  condition2, value2,
  defaultValue
  // ...
)
```



## toInt(str:string,defaultValue?:int):int <a id='to_int'></a>
### 说明
将给定值转换为整数类型。
### 示例
```javascript
toInt('123.4')//123
```


## toNumber(str:string,defaultValue?:number):number <a id='to_number'></a>
### 说明
将给定值转换为数字类型。
### 示例
```javascript
toNumber('123.3')//123.3
```


## toDate(str:string,format:string,defaultValue?:date):date <a id='to_date'></a>

### 说明
将给定值转换为日期类型。

### 示例
```javascript
toDate('2012/3/4',"yyyy/MM/dd')
```
## toBool <a id='to_bool'></a>

### 说明
将给定值转换为布尔类型。
### 示例
```javascript
toBool('是')//true
```

## isNull <a id='is_null'></a>
### 说明
判断给定值是否为null。
### 示例
```javascript
isNull(null)//true
```

## isEmpty <a id='is_empty'></a>
### 说明
判断给定值是否为空。
### 示例
```javascript
isEmpty('')//true
isEmpty([])//true
isEmpty({})//true
isEmpty(0)//true

```

## join <a id='join'></a>
### 说明
将数组或类数组对象的元素连接成字符串。  
参数首位为separator
### 示例
```javascript
join('-',2012,3,4)//2012-3-4
```

## test <a id='test'></a>
### 说明
正则表达式匹配测试函数。
### 示例
```javascript
test('1352416933x','^[\d]+x$')
```

## match <a id='match'></a>
### 说明
正则表达式匹配函数，返回匹配结果数组。
### 示例
```javascript
match('hellow word','he')// ['he']
```

## fileBytes <a id='file_bytes'></a>
### 说明
获取文件字节数。
### 示例
```javascript
fileBytes(12)//12kb
```

## diffShowTime <a id='diff_show_time'></a>
### 说明
计算两个时间差并以可读格式显示。
### 示例
```javascript
diffShowTime(startTime, endTime)
```

## showTime <a id='show_time'></a>
### 说明
以可读格式显示时间。
### 示例
```javascript
showTime(time)
```

## toPrice  <a id='to_price'></a>
### 说明
将给定值转换为价格格式。
### 示例
```javascript
toPrice(value)
```

## Date.now   <a id='date_now'></a>
### 说明
返回当前时间的毫秒数。
### 示例
```javascript
Date.now()
```

## Date.parse   <a id='date_parse'></a>
### 说明
解析日期字符串并返回毫秒数。
### 示例
```javascript
Date.parse(dateString)
```

## Math.E    <a id='math_e'></a>
### 说明
欧拉常数，自然对数的底数。
### 示例
```javascript
Math.E
```

## Math.PI    <a id='math_pi'></a>
### 说明
圆周率，一个数学常数。
### 示例
```javascript
Math.PI
```

## Math.pow    <a id='math_pow'></a>
### 说明
返回基数的指数次幂。
### 示例
```javascript
Math.pow(base, exponent)
```


## Math.exp    <a id='math_exp'></a>
### 说明
返回e的指数次幂。
### 示例
```javascript
Math.exp(value)
```


## Math.abs    <a id='math_abs'></a>
### 说明
返回给定数值的绝对值。
### 示例
```javascript
Math.abs(value)
```


## Math.ceil    <a id='math_ceil'></a>
### 说明
返回大于或等于给定数值的最小整数。
### 示例
```javascript
Math.ceil(value)
```

## Math.floor    <a id='math_floor'></a>
### 说明
返回小于或等于给定数值的最大整数。
### 示例
```javascript
Math.floor(value)
```


## Math.round    <a id='math_round'></a>
### 说明
返回给定数值的四舍五入的整数。
### 示例
```javascript
Math.round(value)
```





## Math.max     <a id='math_max'></a>
### 说明
返回给定数值中的最大值。
### 示例
```javascript
Math.max(value1, value2, ...)
```


## Math.min     <a id='math_min'></a>
### 说明
返回给定数值中的最小值。
### 示例
```javascript
Math.min(value1, value2, ...)
```


## Math.random     <a id='math_random'></a>
### 说明
返回一个min到max之间的随机数。
### 示例
```javascript
Math.random(0,100)//返回0-100的随机数
```

