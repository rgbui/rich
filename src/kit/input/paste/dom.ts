import { dom } from "../../../common/dom";

async function parseTextBlock(element: HTMLElement) {
    var blocks: Record<string, any>[] = [];
    for (let i = 0; i < element.childNodes.length; i++) {
        var node = element.childNodes[i] as HTMLElement;
        var name = node?.tagName?.toLowerCase();
        if (node instanceof Text) {

        }
        else if (name == 'a' && element.getAttribute('href')) {

        }
        else {
            var dm = dom(node);
            var isItalic = dm.style('fontStyle');
            var isBold = dm.style('fontWeight');
            var bg = dm.style('backgroundColor');
            var textDecoration = dm.style('textDecoration');
        }
    }
    return blocks;
}

async function parseBlock(element: HTMLElement) {
    var tag = element?.tagName?.toLowerCase();
    var display = element.style.display;
    var isBlock = display == 'flex' || display == 'block' ? true : false;
    switch (tag) {
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
        case 'p':
        case 'div':
            break;
        case 'ol':
        case 'ul':
            break;
        case 'br':
            break;
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
            if (pb)
                blocks.push(pb);
        }
        return blocks;
    }
}

