
# Date 说明文档

## 静态方法
### now    <a id='now'></a>
- **功能说明**: 返回当前时间的日期对象。
- **示例代码**: 
```
const now = Date.now( console.log(now // 输出: 当前时间的日期对象
```

### parse   <a id='parse'></a>
- **功能说明**: 将字符串解析为日期对象。
- **参数释义**: 
  - `dateString`: 日期字符串。
  - `format`: 日期格式。
    格式format如下:
      YYYY：年
      HH:月
      DD:日
      HH:时
      mm:分
      ss:秒
- **示例代码**: 
```
Date.parse("2023-04-10", "YYYY-MM-DD") // 输出: 当前时间的日期对象
```

## 属性
### year   <a id='year'></a>
- **功能说明**: 获取年份。
- **示例代码**: 
```
date.year // 输出: 当前年份
```

### month   <a id='month'></a>
- **功能说明**: 获取月份（0-11）。
- **示例代码**: 
```
date.month // 输出: 当前月份（0-11）
```

### day   <a id='day'></a>
- **功能说明**: 获取日期（1-31）。
- **示例代码**: 
```
date.day // 输出: 当前日期（1-31）
```

### week   <a id='week'></a>
- **功能说明**: 获取周数。
- **示例代码**: 
```
date.week // 输出: 当前周数
```

### hour   <a id='hour'></a>
- **功能说明**: 获取小时（0-23）。
- **示例代码**: 
```
date.hour // 输出: 当前小时（0-23）
```

### minute   <a id='minute'></a>
- **功能说明**: 获取分钟（0-59）。
- **示例代码**: 
```
date.minute // 输出: 当前分钟（0-59）
```

### second   <a id='second'></a>
- **功能说明**: 获取秒数（0-59）。
- **示例代码**: 
```
date.second // 输出: 当前秒数（0-59）
```

### millisecond   <a id='millisecond'></a>
- **功能说明**: 获取毫秒数。
- **示例代码**: 
```
date.millisecond // 输出: 当前毫秒数
```

### isToday   <a id='isToday'></a>
- **功能说明**: 判断日期是否为今天。
- **示例代码**:
```
date.isToday() // 输出: true 或 false
```

### isYesterday   <a id='isYesterday'></a>
- **功能说明**: 判断日期是否为昨天。
- **示例代码**: 
```
date.isYesterday() // 输出: true 或 false
```

### isTomorrow   <a id='isTomorrow'></a>
- **功能说明**: 判断日期是否为明天。
- **示例代码**: 
```
date.isTomorrow() // 输出: true 或 false
```

### isLeapYear   <a id='isLeapYear'></a>
- **功能说明**: 判断年份是否为闰年。
- **示例代码**: 
```
date.isLeapYear() // 输出: true 或 false
```

### timestamp   <a id='timestamp'></a>
- **功能说明**: 获取日期的时间戳。
- **示例代码**: 
```
date.timestamp() // 输出: 当前时间的时间戳
```

## 方法
### format   <a id='format'></a>
- **功能说明**: 格式化日期对象。
- **参数释义**: 
  - `format`: 日期格式。
   格式format如下:
      YYYY：年
      HH:月
      DD:日
      HH:时
      mm:分
      ss:秒
- **示例代码**: 
```
date.format("YYYY-MM-DD") // 输出: 当前日期的格式化字符串,如2024-4-10
```

### add   <a id='add'></a>
- **功能说明**: 添加时间。
- **参数释义**: 
  - `amount`: 时间量。
  - `unit`: 时间单位（例如："years", "months", "days", "hours", "minutes", "seconds"）。
- **示例代码**: 
```
date.add(1, "days") // 输出: 当前日期加一天后的日期对象
```

### sub   <a id='sub'></a>
- **功能说明**: 减去时间。
- **参数释义**: 
  - `amount`: 时间量。
  - `unit`: 时间单位（例如："years", "months", "days", "hours", "minutes", "seconds"）。
- **示例代码**: 
```
date.sub(1, "days") // 输出: 当前日期减一天后的日期对象
```

### diff   <a id='diff'></a>
- **功能说明**: 计算两个日期对象之间的时间差。
- **参数释义**: 
  - `date`: 要比较的日期对象。
  - `unit`: 时间单位（例如："years", "months", "days", "hours", "minutes", "seconds"）。
- **示例代码**:
```
_now.diff(Date.parse('2023-04-10'), "days") // 输出: 当前日期与指定日期之间相差的天数
```

### isBefore   <a id='isBefore'></a>
- **功能说明**: 判断当前日期是否早于指定日期。
- **参数释义**: 
  - `date`: 要比较的日期对象。
  - `unit`: 时间单位（例如："years", "months", "days", "hours", "minutes", "seconds"）。
- **示例代码**: 
```
_now.isBefore(Date.parse('2023-04-10'),"days") // 输出: true 或 false
```

### isAfter   <a id='isAfter'></a>
- **功能说明**: 判断当前日期是否晚于指定日期。
- **参数释义**: 
  - `date`: 要比较的日期对象。
  - `unit`: 时间单位（例如："years", "months", "days", "hours", "minutes", "seconds"）。
- **示例代码**: 
```
_now.isAfter(Date.parse('2023-04-10'),"days")
```

### isSame   <a id='isSame'></a>
- **功能说明**: 判断当前日期是否与指定日期相同。
- **参数释义**: 
  - `date`: 要比较的日期对象。
  - `unit`: 时间单位（例如："years", "months", "days", "hours", "minutes", "seconds"）。
- **示例代码**: 
```
_now.isSame(Date.parse('2023-04-10'),"days") // 输出: true 或 false
```

### start   <a id='start'></a>
- **功能说明**: 获取日期对象的开始时间。
- **参数释义**: 
  - `unit`: 时间单位（例如："years", "months", "days", "hours", "minutes", "seconds"）。
- **示例代码**:
```
_now.start("days") // 输出: 当前日期对象的开始时间
```

### end   <a id='end'></a>
- **功能说明**: 获取日期对象的结束时间。
- **参数释义**: 
  - `unit`: 时间单位（例如："years", "months", "days", "hours", "minutes", "seconds"）。
- **示例代码**: 
```
_now.end("days") // 输出: 当前日期对象的结束时间
```


