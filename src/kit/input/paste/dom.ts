
import { dom } from "../../../common/dom";
async function parseTextBlock(element: HTMLElement[] | HTMLElement) {
    var blocks: Record<string, any>[] = [];
    function fr(node: HTMLElement, style?: Record<string, any>) {
        var name = node?.tagName?.toLowerCase();
        if (node instanceof Text) {
            if (node.textContent)
                blocks.push({ url: '/text', value: node.textContent })
        }
        else if (name == 'a' && node.getAttribute('href')) {
            var href = node.getAttribute('href');
            var cs = node.childNodes;
            for (let i = 0; i < cs.length; i++) {
                var ele = cs[i] as HTMLElement;
                fr(ele, {});
            }
        }
        else {
            var dm = dom(node);
            var isItalic = dm.style('fontStyle');
            var isBold = dm.style('fontWeight');
            var bg = dm.style('backgroundColor');
            var textDecoration = dm.style('textDecoration');
            var cs = node.childNodes;
            for (let i = 0; i < cs.length; i++) {
                var ele = cs[i] as HTMLElement;
                fr(ele, {});
            }
        }
    }
    if (Array.isArray(element)) {
        for (let j = 0; j < element.length; j++) {
            fr(element[j])
        }
    }
    else {
        fr(element);
    }
    return blocks;
}
async function parseTable(element: HTMLElement) {
    var table = element as HTMLTableElement;
    var rowBlocks: any[] = [];
    var firstRow = table.children[0];
    if (firstRow?.tagName.toLowerCase() == 'thead') {
        var th = firstRow.children[0];
        if (th) {
            /**
             * 这是标题
             */
        }
    }
    return { url: '/table', childs: rowBlocks }
}
async function parseOl(element: HTMLElement) {
    var cs = element.childNodes;
    var blocks: Record<string, any>[] = [];
    for (let i = 0; i < cs.length; i++) {
        var ele = cs[i] as HTMLElement;
        var name = ele?.tagName?.toLowerCase();
        if (name == 'li') {
            var listType = ele.style.listStyle;
            var eleChilds: HTMLElement[] = Array.from(ele.childNodes) as any;
            if (eleChilds.some(s => s?.tagName?.toLowerCase() == 'ol' || s?.tagName?.toLowerCase() == 'ul')) {
                var panel = eleChilds.find(s => s?.tagName?.toLowerCase() == 'ol' || s?.tagName?.toLowerCase() == 'ul');
                var otherEles = eleChilds.remove(g => g === panel);
                var otherBlocks = await parseTextBlock(otherEles as any);
                blocks.push({ url: '' });
            }
            else {
                var rs = await parseTextBlock(ele);
                if (rs.length > 0) {
                    blocks.push({ url: '', childs: rs })
                }
            }
        }
    }
    return blocks;
}
async function parseMedia(element: HTMLElement) {
    var name = element?.tagName.toLowerCase();
    if (name == 'img') {

    }
    else if (name == 'video') {

    }
    else if (name == 'audio') {

    }
}

function getTextBlock(element: HTMLElement) {
    var url = '';
    if (element.style) {
        var name = element?.tagName?.toLowerCase();
        var display = element.style.display;
        var isBlock = display == 'flex' || display == 'block' ? true : false;
        if (/h[\d]/.test(name) || name == 'p') isBlock = true;
        return isBlock;
    }
}

async function parseBlock(element: HTMLElement) {
    var name = element?.tagName?.toLowerCase();
    var textBlockUrl = getTextBlock(element);
    if (textBlockUrl) {
        var texts = await parseTextBlock(element);
        if (texts.length > 0) return { url: textBlockUrl, childs: texts }
        else return null;
    }
    else if (name == 'table') return parseTable(element)
    else if (name == 'ol' || name == 'li') return parseOl(element)
    else if (name == 'img' || name == 'video' || name == 'audio' || name == 'iframe') return parseMedia(element)
    else if (name == 'div') {
        var rs: any[] = [];
        for (let i = 0; i < element.childNodes.length; i++) {
            var ele = element.childNodes[i] as HTMLElement;
            var pb = parseBlock(ele);
            if (pb) {
                if (Array.isArray(pb)) rs.addRange(pb)
                else rs.push(pb);
            }
        }
        return rs;
    }
}
export async function parseDom(dom: HTMLElement | Document) {
    var body = dom.querySelector('body');
    if (body) {
        return parseDom(body);
    }
    else {
        var blocks: Record<string, any>[] = [];
        for (let i = 0; i < dom.childNodes.length; i++) {
            var dm = dom.childNodes[i];
            var pb = parseBlock(dm as HTMLElement)
            if (pb) {
                if (Array.isArray(pb) && pb.length > 0) blocks.addRange(pb)
                else blocks.push(pb);
            }
        }
        return blocks;
    }
}

