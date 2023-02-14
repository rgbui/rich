## Date.add

在日期时间中增加时间间隔。最后的参数为“单位”，可选值为“years”（年），“quarters”(季度)，“months”（月），“weeks”（周），“days”（日），“hours”（小时），“minutes”（分钟），“seconds”（秒），“milliseconds”（毫秒）。


如果number为负数，则表示相减
#### 语法

```
Date.add(number,unit)

@创建日期.add(number,unit)

```

#### 示例

```
@创建日期.add(50,'days')==Date.add(@创建日期,50,'days')
```