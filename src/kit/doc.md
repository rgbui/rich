## 选择器的类型
 * 模拟的光标(anchor)
   1. 如果是文本anchor，该光标内嵌在文本可编辑的区域，
   注意该光标里面还有一个textarea，主要是用来捕获取用户输入
   2. 如果是内容anchor，则该anchor一般是呈现的是矩形选择器，
   该选择器支持调整元素大小、当然可能需要支持旋转等操作
   >从视觉上来讲，文本光标有且只有一个（用于用户在一个地方输入），但内容选择可以有多个(特别是按住ctrl键的时候)
 * 模拟选区
   多个anchor构成的选区，如果跨block，这里可能是选区选择多个block呢，还是依据内容来选区
   这里如果按住shift键则认为依据内容来选区
 * 操作按钮
   移到某个block，会生一个操作按钮，如果是复杂的block，如table，应该是如cell中有一个操作按钮，row有一个操作按钮，
   表格有一个。
 * 输入辅助
   用户输入一个特定的字符，触发一个弹窗操作提示,不断的输入文字有过滤，直到最近一个，则会自动消失
   1. 输入@符 则是呼叫某些操作，如当前的某个人、上下文、全局的一些api模块
   2. 输入/符，则表示呼叫插入的block


## 参考资料
您可以使用 document.caretPositionFromPoint 或 document.caretRangeFromPoint 方法来获取鼠标指针下的文本位置

`document.caretPositionFromPoint` 和 `document.caretRangeFromPoint` 方法的浏览器兼容性有限。

`document.caretPositionFromPoint` 方法目前仅在 Firefox 浏览器中支持。其他主流浏览器，如 Chrome、Safari 和 Edge，都不支持这个方法。

`document.caretRangeFromPoint` 方法在 Chrome、Safari 和 Edge 浏览器中都支持，但在 Firefox 浏览器中不支持。

因此，在使用这些方法时，您需要检查浏览器是否支持它们，并根据需要使用替代方案。

希望这些信息能够帮助您。