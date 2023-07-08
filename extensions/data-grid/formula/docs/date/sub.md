## Date.sub

在日期时间中减少时间间隔。最后的参数为“单位”，可选值为“years”（年），“quarters”(季度)，“months”（月），“weeks”（周），“days”（日），“hours”（小时），“minutes”（分钟），“seconds”（秒），“milliseconds”（毫秒）。


如果number为负数，则表示相加
#### 语法

```
Date.sub(number,unit)

@创建日期.sub(number,unit)

```

#### 示例

```
@创建日期.sub(50,'days')==Date.sub(@创建日期,50,'days')
```