
# 文本说明

### length <a id='id'></a>
- **功能说明**: 获取字符串的长度。
- **示例代码**: 
```
"Hello World".length // 输出: 11
```


### isEmpty <a id='isEmpty'></a>
- **功能说明**: 检查字符串是否为空。
- **示例代码**: 
```
"".isEmpty // 输出: true
```



### slice <a id='slice'></a>
- **功能说明**: 提取字符串的某个部分，并返回一个新的字符串。
- **参数释义**: 
  - `start`: 开始位置（包括该位置）。
  - `end`: 结束位置（不包括该位置）。
- **示例代码**: 
```
"Hello World".slice(0, 5) // 输出: Hello
```



### startsWith <a id='startsWith'></a>
- **功能说明**: 检查字符串是否以指定的子字符串开始。
- **参数释义**: `prefix`: 要检查的子字符串。
- **示例代码**: 
```
"Hello World".startsWith("Hello")  // 输出: true
```


### endsWith <a id='endsWith'></a>
- **功能说明**: 检查字符串是否以指定的子字符串结束。
- **参数释义**: `suffix`: 要检查的子字符串。
- **示例代码**: 
```
"Hello World".endsWith("World")  // 输出: true
```


### replace <a id='replace'></a>
- **功能说明**: 在字符串中用一些字符替换另一些字符，或者替换一个与正则表达式匹配的子串。
- **参数释义**: 
  - `searchFor`: 要被替换的子字符串或正则表达式。
  - `replaceWith`: 用于替换的字符串。
- **示例代码**: 
```
"Hello World".replace("World", " Everyone")  // 输出: Hello Everyone
```


### trim <a id='trim'></a>
- **功能说明**: 从字符串的两端删除空白字符。
- **示例代码**: 
```
" Hello World ".trim()  // 输出: Hello World
```


### trimStart <a id='trimStart'></a>
- **功能说明**: 从字符串的开头删除空白字符。
- **示例代码**: 
```
" Hello World ".trimStart()  // 输出: Hello World 
```


### trimEnd <a id='trimEnd'></a>
- **功能说明**: 从字符串的末尾删除空白字符。
- **示例代码**:
```
" Hello World ".trimEnd()  // 输出: Hello World
```


### upper <a id='upper'></a>
- **功能说明**: 将字符串转换为大写。
- **示例代码**: 
```
"Hello World".upper()  // 输出: HELLO WORLD
```


### lower <a id='lower'></a>
- **功能说明**: 将字符串转换为小写。
- **示例代码**:
```
"Hello World".lower()  // 输出: hello world
```



### indexOf <a id='indexOf'></a>
- **功能说明**: 返回指定值在字符串中首次出现的位置，如果没有找到就返回-1。
- **参数释义**: `searchValue`: 要查找的字符串。
- **示例代码**: 
```
"Hello World".indexOf("World")  // 输出: 6
```


### lastIndexOf <a id='lastIndexOf'></a>
- **功能说明**: 返回指定值在字符串中最后出现的位置，如果没有找到就返回-1。
- **参数释义**: `searchValue`: 要查找的字符串。
- **示例代码**: 
```
"Hello World World".lastIndexOf("World")  // 输出: 12
```


### contains <a id='contains'></a>
- **功能说明**: 检查字符串是否包含指定的子字符串。
- **参数释义**: `searchString`: 要查找的字符串。
- **示例代码**: 
```
"Hello World".contains("World") // 输出: true
```


### repeat <a id='repeat'></a>
- **功能说明**: 返回指定次数重复的字符串。
- **参数释义**: `count`: 重复的次数。
- **示例代码**: 
```
"Hello".repeat(2)// 输出: HelloHello
```


### padStart <a id='padStart'></a>
- **功能说明**: 在字符串的开头填充指定的字符串，直到达到指定的长度。
- **参数释义**: 
  - `targetLength`: 目标长度。
  - `padString`: 用于填充的字符串。
- **示例代码**: 
```
"Hello".padStart(10, "0") // 输出: 00000Hello
```


### padEnd <a id='padEnd'></a>
- **功能说明**: 在字符串的末尾填充指定的字符串，直到达到指定的长度。
- **参数释义**: 
  - `targetLength`: 目标长度。
  - `padString`: 用于填充的字符串。
- **示例代码**: 
```
"Hello".padEnd(10, "0")  // 输出: Hello00000
```



### split <a id='split'></a>
- **功能说明**: 将字符串分割成子字符串数组，返回分割后的数组。
- **参数释义**: `separator`: 分隔符，用于分割字符串。
- **示例代码**: 
```
"Hello World".split(" ")  // 输出: ["Hello", "World"]
```


### chatAt  <a id='chatAt'></a>
- **功能说明**: 返回指定位置的字符。
- **参数释义**: `index`: 要返回的字符的索引。
- **示例代码**: 
```
"Hello World".charAt(7)  // 输出: W
```


### toInt <a id='toInt'></a>
- **功能说明**: 将字符串转换为整数。
- **参数释义**: `radix`: 表示要解析的数字的基数。
- **示例代码**: 
```
"42".toInt(10)  // 输出: 42
```


### toNumber <a id='toNumber'></a>
- **功能说明**: 将字符串转换为数字。
- **参数释义**: `base`: 表示要解析的数字的基数。
- **示例代码**: 
```
"42".toNumber(10)  // 输出: 42
```


### toDate <a id='toDate'></a>
- **功能说明**: 将字符串转换为日期对象。
- **参数释义**: `format`: 日期格式，用于解析字符串。
- **示例代码**: 
```
"2023-04-10".toDate("YYYY-MM-DD")  // 输出: Mon Apr 10 2023 00:00:00 GMT+0000 (Coordinated Universal Time)
```


