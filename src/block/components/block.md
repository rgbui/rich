## 基本的布局block
* view视图
* viewArea 区域模块,viewArea可以嵌套
* row 行
* col 列  
注意事项
1. view,viewArea,col都可以拥有row，其它元素不在拥有row
2. 一个row由多个block,col组成
## 内容型的block
主要是呈现内容的
* todo {checkbox,textspan} 两个部分组成
* image {img}
* textspan {text|textcontent} 要么是直接的文本，要么是由一细列很碎的行内元素组成
* table 
   + tableRow
   + cell {col.row.textspan} 里面可以有多行
* tablestore
   + head.th 有排序、过滤器、固定列
   + tableStoreRow
   + tableStoreCell 该cell基本是文本类型（但文本的格式输入是有限制的，也可以是基它复杂的类型）
      {col.row.*} 一般是单格（该类型所对应的组件，当然这个组件也可以是富文本组件）
      该单元格可能会有空行，还有选择控件，序号，操作
   数据表格是有展现方式的，所展现的方式如下：
   1. 表格
   2. 统计图
   3. 树形
   4. 菜单
   5. tab
* list 
  + textspan
  + childs{col.row.textspan}
* 菜单menu 和list一样，只不过小图标是靠右，子节点是浮空弹起
* tab，图片预览
   主要是对数据产生一项指针,
   指示区域，
   内容区域

* input {label,input,error}
  输入框默认有label，input,错误信息区域，input上面有清除文字的小图标，如果是密码，则是eye