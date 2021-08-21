## block 光标
### 概述说明
  * 光标主要是用来编辑文本
  * 点在图片上的光标为solidCursor，点在文本上的则为textCursor
  * textCursor主要是用来键入文字、回退删除文字
  * solidCursor主要是用来选中solid元素，然后对solid元素进行一定的操作
  > 是否提供solidCursor呢，光标是否仅仅是文字才产生的
    一些文字表情算文字吗，这个之间的界限是模糊的
    ？？？ 思考一下
### 点击确认光标的位置
   * 通过鼠标点击，只有点在处于TextArea,SolidArea组件范围才是光标可以点击的
   * 强制计算光标的（通常光标移动，从一个block移到另一个block)
     block上面有多处文本编辑区域及solid区域，需要从视觉上确放光标应处于在什么位置
### 光标是如何移动的
  * 光标的移动分为块内部移动
     + textArea,solidArea之间的移动
     + textArea,solidArea 和子block之间的移动（需要当前block自定义支持）
  * block兄弟相领之间的移动
     + 主要是从子元素数组上进行决定移动，当然可以考虑提供自定义的方式
     + 子元素也是分组的，分组上的移动取决于 blockKeys
  * block父子之间的移动
     + 子元素是有可能嵌套在父block的，移动主要是取决于视觉上的方位，一般是默认是从父block到子block,子block到父block
     + 子无素有可能处于不显示状态(如处于折叠中)

