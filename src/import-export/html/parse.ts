
import lodash from "lodash";
import { ListType } from "../../../blocks/present/list/list";
import { BlockCssName } from "../../block/pattern/css";
import { dom } from "../../common/dom";

/**
 * 
 * find img video autio 
 * ignore input , select , textarea
 * 
 * key tags title hr  h1~h6  pre  ol-ul-li table b del
 * https://zhuanlan.zhihu.com/p/81132589
 * 
 * 
 */
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
                fontWeight: bold ? bold : undefined,
                fontStyle: fontStyle ? fontStyle : undefined
            }
            if (style && style.pattern) {
                var pa = lodash.cloneDeep(style?.pattern?.styles[0]?.cssList[0] || {});
                delete pa.abled;
                delete pa.cssName;
                font = lodash.assign(pa, font)
            }
            var isCode = undefined;
            if (name == 'code') isCode = true;
            if (name == 'strong' || name == 'b') font.fontWeight = 'bold';
            if (name == 'i' || name == 'em') font.fontStyle = 'italic';
            if (name == 'del' || name == 's') font.textDecoration = 'line-through';
            if (name == 'u') font.textDecoration = 'underline';
            var pattern: any;
            if (font) {
                pattern = {
                    styles: [{
                        name: 'default',
                        cssList: [
                            {
                                "abled": true,
                                "cssName": BlockCssName.font,
                                ...font
                            }
                        ]
                    }]
                }
            }
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
    var firstRow = table.querySelector('thead')
    if (firstRow?.tagName.toLowerCase() == 'thead') {
        var tr = firstRow.children[0];
        if (tr) {
            var rb = { url: '/table/row', blocks: { childs: [] } }
            /**
             * 这是标题
             */
            for (var i = 0; i < tr.children.length; i++) {
                var th = tr.children[i] as HTMLElement;
                rb.blocks.childs.push({
                    url: '/table/cell',
                    blocks: { childs: parsePanel(th) }
                })
            }
            rowBlocks.push(rb);
        }
    }
    var secondRow = table.querySelector('tbody')
    if (secondRow?.tagName.toLowerCase() == 'tbody') {
        var rows = Array.from(secondRow.children);
        for (let i = 0; i < rows.length; i++) {
            var rb = { url: '/table/row', blocks: { childs: [] } };
            for (let j = 0; j < rows[i].children.length; j++) {
                var td = rows[i].children[j] as HTMLElement;
                rb.blocks.childs.push({
                    url: '/table/cell',
                    blocks: { childs: parsePanel(td) }
                })
            }
            rowBlocks.push(rb);
        }
    }
    return { url: '/table', blocks: { childs: rowBlocks } }
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
        return { url: '/image', initialData: { url: element.getAttribute('src') } }
    }
    else if (name == 'video') {

    }
    else if (name == 'audio') {

    }
}

async function parsefigure(element: HTMLElement) {
    var caption = element.innerText;
    var img = element.querySelector('img');
    if (img) {
        return {
            url: '/image',
            allowCaption: caption ? true : false,
            caption,
            initialData: { url: img.getAttribute('src') }
        }
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

function isLineElement(element: HTMLElement) {
    var name = element?.tagName?.toLowerCase();
    if (['span', 'a', 'label', 'i', 'u', 'del', 'b', 'em', 'font', 'strong'].includes(name)) {
        return true;
    }
    else return false;
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
    else if (name == 'ol' || name == 'ul' || name == 'li') return await parseOl(element)
    else if (name == 'img' || name == 'video' || name == 'audio' || name == 'iframe') return await parseMedia(element)
    else if (name == 'figure') {
        return await parsefigure(element);
    }
    else {
        var rs: any[] = [];
        if (element?.children?.length > 0) {
            var lineElements: HTMLElement[] = [];
            for (let i = 0; i < element.childNodes.length; i++) {
                var ele = element.childNodes[i] as HTMLElement;
                if (isLineElement(ele)) lineElements.push(ele);
                else {
                    if (lineElements.length > 0) {
                        var texts = await parseTextBlock(lineElements);
                        if (texts.length > 0) {
                            rs.push({ url: '/textspan', blocks: { childs: texts } })
                        }
                        lineElements = [];
                    }
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
            }
            if (lineElements.length > 0) {
                var texts = await parseTextBlock(lineElements);
                if (texts.length > 0) {
                    rs.push({ url: '/textspan', blocks: { childs: texts } })
                }
                lineElements = [];
            }
        }
        else {
            var texts = await parseTextBlock(element);
            if (texts.length > 0) {
                return { url: '/textspan', blocks: { childs: texts } }
            }
        }
        return rs;
    }
}

async function parsePanel(panel: HTMLElement) {
    return Array.from(panel.children).map(c => parseBlock(c as HTMLElement));
}

export async function parseDom(dom: HTMLElement | Document) {
    var body = dom.querySelector('body');
    if (body) return await parseDom(body);
    else return parseBlock(dom as HTMLElement);
}


