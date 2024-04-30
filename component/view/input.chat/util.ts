import { getTextLink } from "../../../src/kit/write/declare";

export function InsertSelectionText(text: string) {
    var sel = window.getSelection(); //DOM 
    var range = sel.getRangeAt(0); // DOM下 
    if (range.startContainer) { // DOM下 
        sel.removeAllRanges(); // 删除Selection中的所有Range 
        range.deleteContents(); // 清除Range中的内容 
        // 获得Range中的第一个html结点 
        var container = range.startContainer;
        // 获得Range起点的位移 
        var pos = range.startOffset;
        // 建一个空Range 
        range = document.createRange();
        // 插入内容 
        var cons = window.document.createTextNode(text);
        if (container.nodeType == 3) {// 如是一个TextNode 
            (container as Text).insertData(pos, cons.nodeValue);
            // 改变光标位置 
            range.setEnd(container, pos + cons.nodeValue.length);
            range.setStart(container, pos + cons.nodeValue.length);
        } else {// 如果是一个HTML Node 
            var afternode = container.childNodes[pos];
            container.insertBefore(cons, afternode);
            range.setEnd(cons, cons.nodeValue.length);
            range.setStart(cons, cons.nodeValue.length);
        }
        sel.addRange(range);
    }
}


export function getChatHtml(html, isQuote) {
    html = getTextLink(html);
    html = html.replace(/(\*\*[^\*]+\*\*)/g, (_, $1) => {
        return '<b>' + $1.slice(2, -2) + '</b>'
    })
    html = html.replace(/(\*[^\*]+\*)/g, (_, $1) => {
        return '<i>' + $1.slice(1, -1) + '</i>'
    })
    html = html.replace(/(\~\~[^\~]+\~\~)/g, (_, $1) => {
        return '<del>' + $1.slice(2, -2) + '</del>'
    })
    // console.log('before', html);
    html = html.replace(/(\`\`\`[^\`]+\`\`\`)/g, (_, $1) => {
        var pc = $1.trim().slice(3, -3);
        pc = pc.replace(/^(\<br\/?\>)+/g, '');
        pc = pc.replace(/(\<br\/?\>)+$/g, '');
        return '<pre><code>' + pc + '</code></pre>'
    })
    // console.log('after', html);
    html = html.replace(/(\`[^\`]+\`)/g, (_, $1) => {
        return '<code>' + $1.slice(1, -1) + '</code>'
    })
    if (isQuote) {
        html = '<blockquote>' + html + '</blockquote>'
    }
    return html;
}

export function getChatText(html) {
    if (!html) return '';
    html = html.replace(/<br\/?>/g, '\n');
    html = html.replace(/<b>([^<]+)<\/b>/g, '**$1**');
    html = html.replace(/<i>([^<]+)<\/i>/g, '*$1*');
    html = html.replace(/<del>([^<]+)<\/del>/g, '~~$1~~');
    html = html.replace(/<pre><code>([^<]+)<\/code><\/pre>/g, '```$1```');
    html = html.replace(/<code>([^<]+)<\/code>/g, '`$1`');
    html = html.replace(/<blockquote>([^<]+)<\/blockquote>/g, '$1');
    html = html.replace(/<a[^>]+>([^<]+)<\/a>/g, '$1');
    return html;
}