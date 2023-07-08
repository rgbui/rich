## 文本
### String.isEmpty

判断字符串是否为空字符串

#### 语法

```
String.isEmpty({name})

{name}.isEmpty

```

#### 示例

```
{name}.isEmpty==true

String.isEmpty({name})==true
```

### String.contains

判断字符串是否包含另一个字符串，如果包含，则返回真（true）；否则反之

#### 语法

```
String.contains({name},str)

{name}.contains(str)

```

#### 示例

```
创建日期.contains('abc')

String.contains(创建日期,'abc')
```


### String.length

获取字符串的长度

#### 语法

```
String.length({name})

{name}.length

```

#### 示例

```
{name}.length==3

String.length({name})==3
```

### String.replace

字符串替换，将字符串中的子串全部替换成新的子串

#### 语法

```
String.replace(currentStr,oldStr,newStr)

{name}.replace(oldStr,newStr)

```

#### 示例

```
{name}.replace("ab","ccc")

String.replace({name},"ab","ccc")
```


### String.slice

将字符串进行切割，通过指定的开始/结束索引提取并返回子字符串

#### 语法

```
String.slice(str,start,end)

{name}.slice(start,end)

```

#### 示例

```
{name}.slice(1,3)

String.slice({name},1,2)
```


### 函数String.join
对一串文本进行链接


#### 示例

```
String.join(',','a','b','c','d')=='a,b,c,d'//true

```