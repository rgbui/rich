
import lodash from "lodash";
import { ListType } from "../../../../blocks/present/list/list";
import { BlockCssName } from "../../../block/pattern/css";
import { dom } from "../../../common/dom";
async function parseTextBlock(element: HTMLElement[] | HTMLElement) {
    var blocks: Record<string, any>[] = [];
    function fr(node: HTMLElement, style?: Record<string, any>) {
        var name = node?.tagName?.toLowerCase();
        if (node instanceof Text) {
            var text = node.textContent;
            if (text && text != '\n')
                blocks.push({ url: '/text', content: node.textContent, ...(style || {}) })
        }
        else if (name == 'a' && node.getAttribute('href')) {
            var href = node.getAttribute('href');
            var cs = node.childNodes;
            for (let i = 0; i < cs.length; i++) {
                var ele = cs[i] as HTMLElement;
                fr(ele, lodash.assign(style || {}, { link: { url: href } }));
            }
        }
        else if (node) {
            var dm = dom(node);
            var cs = node.childNodes;
            var textDecoration = dm.style('textDecoration');
            var bold = dm.style('fontWeight');
            var fontStyle = dm.style('fontStyle');
            var font = {
                textDecoration: textDecoration ? textDecoration : undefined,
                bold: bold ? bold : undefined,
                fontStyle: fontStyle ? fontStyle : undefined
            }
            var isCode = undefined;
            if (name == 'code') isCode = true;
            if (name == 'strong') font.bold = 'bold';
            if (name == 'i') font.fontStyle = 'italic';
            var pattern = Object.values(font).some(s => s) ? {
                [BlockCssName.font]: font
            } : undefined;
            for (let i = 0; i < cs.length; i++) {
                var ele = cs[i] as HTMLElement;
                fr(ele, lodash.assign(style || { isCode }, pattern ? { pattern } : {}));
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
            var lt = ListType.circle;
            if (listType == 'decimal') { lt = ListType.number };
            var eleChilds: HTMLElement[] = Array.from(ele.childNodes) as any;
            if (eleChilds.some(s => s?.tagName?.toLowerCase() == 'ol' || s?.tagName?.toLowerCase() == 'ul')) {
                var panel = eleChilds.find(s => s?.tagName?.toLowerCase() == 'ol' || s?.tagName?.toLowerCase() == 'ul');
                eleChilds.remove(g => g === panel);
                var childsBlock = await parseTextBlock(eleChilds as any);
                console.log('childs', childsBlock);
                var otherBlocks = await parseBlock(panel);
                blocks.push({
                    url: '/list',
                    listType: lt,
                    blocks: {
                        subChilds: Array.isArray(otherBlocks) ? otherBlocks : [otherBlocks],
                        childs: childsBlock
                    }
                });
            }
            else {
                var rs = await parseTextBlock(ele);
                if (rs.length > 0) {
                    blocks.push({ url: '/list', blocks: { childs: rs }, listType: lt })
                }
            }
        }
    }
    return blocks;
}
async function parseMedia(element: HTMLElement) {
    var name = element?.tagName.toLowerCase();
    if (name == 'img') {
        return { url: '/image', src: { url: element.getAttribute('src') } }
    }
    else if (name == 'video') {

    }
    else if (name == 'audio') {

    }
}
function getTextBlock(element: HTMLElement) {
    var url = '';
    var name = element?.tagName?.toLowerCase();
    if (name == 'p') url = '/textspan';
    else if (name == 'h1') url = '/head';
    else if (name == 'h2') url = '/head?{level:"h2"}';
    else if (name == 'h3') url = '/head?{level:"h3"}';
    else if (name == 'h4' || name == 'h5' || name == 'h6') url = '/head?{level:"h4"}';
    else if (name == 'blockquote') url = '/quote';
    return url;
}

async function parseBlock(element: HTMLElement) {
    var name = element?.tagName?.toLowerCase();
    var textBlockUrl = getTextBlock(element);
    if (textBlockUrl) {
        var texts = await parseTextBlock(element);
        if (texts.length > 0) return { url: textBlockUrl, blocks: { childs: texts } }
        else return null;
    }
    else if (name == 'table') return await parseTable(element)
    else if (name == 'ol' || name == 'li') return await parseOl(element)
    else if (name == 'img' || name == 'video' || name == 'audio' || name == 'iframe') return await parseMedia(element)
    else if (name == 'div') {
        var rs: any[] = [];
        for (let i = 0; i < element.childNodes.length; i++) {
            var ele = element.childNodes[i] as HTMLElement;
            var name = ele?.tagName?.toLowerCase();
            var pb = await parseBlock(ele);
            if (pb) {
                if (Array.isArray(pb)) {
                    pb.each(p => {
                        if (p) rs.push(p);
                    })
                }
                else rs.push(pb);
            }
        }
        return rs;
    }
    else {
        var texts = await parseTextBlock(element);
        if (texts.length > 0) {
            return { url: '/textspan', blocks: { childs: texts } }
        }
    }
}
export async function parseDom(dom: HTMLElement | Document) {
    var body = dom.querySelector('body');
    if (body) {
        return await parseDom(body);
    }
    else {
        var blocks: Record<string, any>[] = [];
        for (let i = 0; i < dom.childNodes.length; i++) {
            var dm = dom.childNodes[i];
            var pb = await parseBlock(dm as HTMLElement)
            if (pb) {
                if (Array.isArray(pb)) {
                    pb.each(p => {
                        if (p) blocks.push(p);
                    })
                }
                else blocks.push(pb);
            }
        }
        return blocks;
    }
}

