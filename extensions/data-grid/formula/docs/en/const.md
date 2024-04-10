# 常量
内置的常量用于快速的公式计算


## <a id='const_true'></a>true
布尔值 真  
用于逻辑运算
### 示例
```
true || false // true
true && false // false

```

## <a id='const_false'></a>false
布尔值 假 
用于逻辑运算
### 示例
```
true || false // true
true && false // false
```


## <a id='const_pi'></a>_pi
圆周率  
_pi是对Math.PI的简写
### 示例
```
_pi*r*2
_pi == 3.141592653589793
```


## <a id='const_now'></a>_now

当前系统时间

### 示例
```
_now.year //当前时间的年份
_now.week //当前时间处于当年的第几周
_now.day //周几（0-7）
```


## <a id='const_e'></a>_e
自然对数

### 示例
```
_e == 2.718281828459045

```


## <a id='const_version'></a>_version
诗云的版本

### 示例
```
_version=='0.8.110-pro'

```


## <a id='const_username'></a>_username

当前登录的帐号名

### 示例
```
_username=='shy'?true:false

```


## <a id='const_userid'></a>_userid
当前登录的帐号ID
 

### 示例
```
_userid==_guid?true:false// 返回false

```


## <a id='const_workspace'></a>_workspace
当前所在的空间名称

### 示例
```
_workspace=="当前空间名"?true:false

```

## <a id='const_random'></a>_random
返回0到100(不包括100)的随机数

### 示例
```
_random>=0&&_random<100?true:false //

```


## <a id='const_workspace_id'></a>_workspace_id
当前所在的空间ID

### 示例
```
_workspace_id==_guid?true:false

```


## <a id='const_guid'></a>_guid
Guid全局唯一标识符
每次调用的guid码值是不一样的
### 示例
```
_guid.length

```




















