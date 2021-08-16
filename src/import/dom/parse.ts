import { parseUtil } from "./util";

function parseTexts(elPanel: ChildNode) {

}
function parseText(el: ChildNode) {
    return { url: '/text', content: el.textContent }
}
function parseLine(el: ChildNode) {
    var name = parseUtil.asName(el);
    var ele = el as HTMLElement;
    switch (name) {
        case 'span':
        case 'label':
            break;
        case 'i':
        case 'em':
            break;
        case 'b':
        case 'strong':
            break;
        case 'del':
            break;
        case 'a':
            break;
    }
    return undefined;
}
function parseSolid(el: ChildNode) {
    var name = parseUtil.asName(el);
    var ele = el as HTMLElement;
    switch (name) {
        case 'img':
            return { url: '/image', initialData: { link: ele.getAttribute('src') } }
        case 'audio':
            return { url: '/audio', initialData: { link: ele.getAttribute('src') } }
        case 'video':
            return { url: '/video', initialData: { link: ele.getAttribute('src') } }
    }
}
function parseBlock(el: ChildNode) {
    var name = parseUtil.asName(el);
    switch (name) {
        case 'pre':
            break;
        case 'q':
        case 'blockquote':

            break;
        case 'table':
            break;
        case 'ol':
        case 'ul':

            break;
        case 'hr':
            break;
        case 'h1':
            break;
        case 'h2':
            break;
        case 'h3':
            break;
        case 'h4':
        case 'h5':
        case 'h6':

            break;
    }
}
function parseUnknow(el: ChildNode) {
    return undefined;
}

function traverseElement(el: ChildNode) {
    if (parseUtil.isIgnore(el)) {
        return []
    }
    else if (parseUtil.isPanel(el)) {
        return traversePanel(el);
    }
    else if (parseUtil.isSolid(el)) {
        var rs = parseSolid(el);
        if (Array.isArray(rs)) return rs;
        else if (rs) return [rs];
    }
    else if (parseUtil.isLine(el)) {
        var rl = parseLine(el);
        if (Array.isArray(rs)) return rs;
        else if (rs) return [rs];
    }
    else if (parseUtil.isText(el)) {
        var rss = parseText(el);
        if (Array.isArray(rss)) return rss;
        else return [rss];
    }
    else if (parseUtil.isBlock(el)) {
        var rb = parseBlock(el);
        if (Array.isArray(rs)) return rs;
        else if (rs) return [rs];
    }
    else {
        var ru = parseUnknow(el);
        if (Array.isArray(rs)) return rs;
        else if (rs) return [rs];
    }
}
function traversePanel(elPanel: ChildNode) {
    var rs = [];
    for (let i = 0; i < elPanel.childNodes.length; i++) {
        var child = elPanel.childNodes[i];
        var g = traverseElement(child);
        if (Array.isArray(g)) {
            rs.push(...g)
        }
        else if (g) rs.push(g);
    }
    return rs;
}
export function domParse(el: HTMLElement) {

}