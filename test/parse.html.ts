import { parseHtml } from "../extensions/Import-export/mime/html/parse"


var text=`<p>在HTML中，<code>&lt;div&gt;</code> 元素默认是不支持换行的。如果你想要在可编辑的 <code>div</code> 中实现输入回车产生换行的效果，你需要使用JavaScript来捕获键盘事件，并在按下回车键时插入一个 <code>&lt;br&gt;</code> 元素或者使用CSS样式来处理换行。
    以下是一个使用JavaScript来处理回车键的例子：</p>
    <pre><code class="language-html">&lt;!DOCTYPE html&gt;
    &lt;html lang=&quot;en&quot;&gt;
    &lt;head&gt;
    &lt;meta charset=&quot;UTF-8&quot;&gt;
    &lt;title&gt;Editable Div with Enter Key Handling&lt;/title&gt;
    &lt;style&gt;
      .editable-div {
        min-height: 100px;
        border: 1px solid #ccc;
        padding: 10px;
        white-space: pre-wrap; /* 保持空格和换行 */
      }
    &lt;/style&gt;
    &lt;/head&gt;
    &lt;body&gt;
    &lt;div contenteditable=&quot;true&quot; class=&quot;editable-div&quot; id=&quot;editableDiv&quot;&gt;&lt;/div&gt;
    &lt;script&gt;
      var editableDiv = document.getElementById(&#39;editableDiv&#39;);
      editableDiv.addEventListener(&#39;keydown&#39;, function(e) {
        // 检测是否按下了回车键
        if (e.key === &#39;Enter&#39;) {
          // 阻止默认行为（默认行为是插入一个回车字符）
          e.preventDefault();
          // 创建一个 &lt;br&gt; 元素
          var br = document.createElement(&#39;br&#39;);
          // 插入光标位置
          var range = document.createRange();
          var sel = window.getSelection();
          range.setStart(sel.anchorNode, sel.anchorOffset);
          range.insertNode(br);
          // 移动光标到 &lt;br&gt; 元素之后
          range.setStartAfter(br);
          range.setEndAfter(br);
          sel.removeAllRanges();
          sel.addRange(range);
        }
      });
    &lt;/script&gt;
    &lt;/body&gt;
    &lt;/html&gt;
    </code></pre>
    <p>在这个例子中，当用户在可编辑的 <code>div</code> 中按下回车键时，JavaScript会阻止默认行为，并在光标位置插入一个 <code>&lt;br&gt;</code> 元素，从而实现换行效果。
    注意：使用 <code>white-space: pre-wrap;</code> 是为了确保在编辑时，空格和换行符能够被正确显示。
    如果你不希望在可编辑的 <code>div</code> 中插入 <code>&lt;br&gt;</code> 元素，而是希望它像文本编辑器那样处理换行，你可以设置CSS样式 <code>white-space: pre-wrap;</code>，但这不会阻止回车键插入回车字符。上述JavaScript代码是为了实现回车键插入 <code>&lt;br&gt;</code> 的效果。</p>`

export function testParseHtmlTs(){
    var codes=parseHtml(text);
    console.log(JSON.stringify(codes,null,2))
}