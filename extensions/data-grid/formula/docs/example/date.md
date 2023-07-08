### {name}

### 获取日期属性
 
1. 获取年
```
Date.year({name})
{name}.year
```
2. 获取月
```
Date.year({name})
{name}.year
```
3. 获取几号
获取当月的第几号
```
Date.date({name})
{name}.date
```

4. 获取时
```
Date.hour({name})
{name}.hour
```
5. 获取分
```
Date.minute({name})
{name}.minute
```
6. 获取秒
```
Date.second({name})
{name}.second
```

7. 获取日
返回日期时间为星期中的第几天，0 - 6 整数，0 表示星期日，以此类推
```
Date.day({name})
{name}.day
```

### 日期加减
1. 日期相加
```
Date.add({name},number,unit)

{name}.add(number,unit)
示例：
{name}.add(7,“days") //{name}增加7天
```
在日期时间中增加时间间隔。最后的参数为“单位”，可选值为“years”（年），“quarters”(季度)，“months”（月），“weeks”（周），“days”（日），“hours”（小时），“minutes”（分钟），“seconds”（秒），“milliseconds”（毫秒）。
如果number为负数，则表示相减

2. 日期相减
```
Date.sub({name},number,unit)

{name}.add(number,unit)
示例：
{name}.sub(7,“days") //{name}减去7天
```
在日期时间中减去时间间隔。最后的参数为“单位”，可选值为“years”（年），“quarters”(季度)，“months”（月），“weeks”（周），“days”（日），“hours”（小时），“minutes”（分钟），“seconds”（秒），“milliseconds”（毫秒）。
如果number为负数，则表示相加

### 日期格式化
### Date.format

对日期时间进行格式化，返回对应格式的字符串
格式format组成如下:
YYYY：年
HH:月
DD:日
HH:时
mm:分
ss:秋

#### 语法

```
Date.format({name},format)

{name}.format(format)

```

#### 示例

```
{name}.format("yyyy-MM-DD HH:mm:ss")==Date.format({name},"yyyy-MM-DD HH:mm:ss")
```


### 函数Date.now
获取当前系统时间


#### 示例

```
Date.now().year //true

```