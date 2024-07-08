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
        var ts = text.split(/\n/g);
        if (ts.length == 1 && container.nodeType == 3) {
            (container as Text).insertData(pos, ts[0]);
            range.setStart(container, pos + ts[0].length);
            range.setEnd(container, pos + ts[0].length);
            sel.addRange(range);
        }
        else {
            var nt = (container as Text);
            var rest: string;
            var next: Node;
            var pa: Node;
            if (container.nodeType == 3) {
                rest = nt.textContent.slice(pos);
                nt.textContent = nt.textContent.slice(0, pos);
                next = nt.nextSibling;
                pa = nt.parentNode;
            }
            else {
                next = container.childNodes[pos];
                pa = container
            }
            var nn: Node;
            for (let i = 0; i < ts.length; i++) {
                var newT = document.createTextNode(ts[i]);
                if (next) pa.insertBefore(newT, next)
                else pa.appendChild(newT)
                nn = newT;
                if (i !== ts.length - 1) {
                    var br = document.createElement('br');
                    if (next) pa.insertBefore(br, next)
                    else pa.appendChild(br)
                    nn = br;
                }
            }
            if (nn) {
                if (nn instanceof Text) sel.collapse(nn, nn.textContent.length);
                else sel.collapse(nn, Array.from(nn.childNodes).findIndex(x => x == nn));
            }
            if (rest) {
                if (next) pa.insertBefore(document.createTextNode(rest), next)
                else pa.appendChild(document.createTextNode(rest))
            }
        }
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
    html = html.replace(/https?:\/\/[^\s]+/g, (url) => {
        return `<a href="${url}" target="_blank">${url}</a>`
    });
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
    html = html.replace(/<a[^>]+>([^<]+)<\/a>/g, '$1 ');
    return html;
}