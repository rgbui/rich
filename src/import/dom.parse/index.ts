import { BlockUrlConstant } from "../../block/constant";

import { BlockCssName } from "../../block/pattern/css";
import { CssSelectorType } from "../../block/pattern/type";
import { dom } from "../../common/dom";

export type DomParserOptions = {

}
export async function DomParse(stringContainingHTMLSource: string, options?: DomParserOptions) {
    /**
     * 
     * find img video autio 
     * ignore input,select,textarea
     * 
     * key tags title hr  h1~h6  pre  ol-ul-li table b del
     * https://zhuanlan.zhihu.com/p/81132589
     */
    let parser = new DOMParser();
    let doc = parser.parseFromString(stringContainingHTMLSource, "text/html");
    /**
     * 获取当前字体的
     * @param element 
     */
    function getTextFontPattern(element: ChildNode) {
        var dm = dom(element instanceof Text ? element.parentNode : element);
        var styles = [{
            name: 'default',
            selectors: CssSelectorType.none,
            cssList: [
                {
                    name: BlockCssName.font,
                    fontFamily: dm.style('fontFamily'),
                    //color:dm.style('color'),
                    fontStyle: dm.style('fontStyle'),
                    fontWeight: dm.style('fontWeight'),
                }
            ]
        }];
        return { styles };
    }
    function findTexts(element: ChildNode) {
        var texts: { url: string, content: string, pattern: { styles: any[] }, link?: { href?: string } }[] = [];
        for (let i = 0; i < element.childNodes.length; i++) {
            var ele = element.childNodes[i];
            var name = (ele as HTMLElement).tagName;
            if (name) name = name.toLowerCase();
            if (ele instanceof Text && ele.textContent) {
                texts.push({ url: BlockUrlConstant.Text, content: ele.textContent, pattern: getTextFontPattern(ele) })
            }
            else if (name == 'a') {
                var href = (ele as HTMLLinkElement).getAttribute('href');
                var rs = findTexts(ele);
                rs.each(r => {
                    r.link = { href };
                });
                texts.addRange(rs);
            }
            else if (ele.childNodes.length > 0) {
                texts.addRange(findTexts(ele));
            }
        }
        return texts;
    }
    function parseText(ele: ChildNode) {
        if (ele instanceof Text && ele.textContent) {
            return {
                url: BlockUrlConstant.Text,
                content: ele.textContent,
                pattern: getTextFontPattern(ele)
            }
        }
    }
    function parseOl(element: ChildNode) {

    }
    function parseTable(element: ChildNode) {

    }
    function parseEmpty(element: HTMLElement) {

    }
    function traverseElement(ele: HTMLElement) {
        var name = ele.tagName.toLowerCase();
        switch (name) {
            case 'h1':
            case 'h2':
            case 'h3':
                return { url: '/head', level: name, blocks: { childs: findTexts(ele) } }
            case 'h4':
            case 'h5':
            case 'h6':
                return { url: '/head', level: 'h4', blocks: { childs: findTexts(ele) } }
            case 'ol':
            case 'ul':
                break;
            case 'hr':
                return { url: BlockUrlConstant.Divider };
            case 'table':
                break;
            case 'pre':
                return { url: '/code', blocks: { childs: findTexts(ele) } }
                break;
            case 'img':
                return { url: '/image', src: { name: 'link', url: ele.getAttribute('src') } }
                break;
            case 'autio':
                return { url: '/image', src: { name: 'link', url: ele.getAttribute('src') } }
                break;
            case 'video':
                return { url: '/image', src: { name: 'link', url: ele.getAttribute('src') } }
                break;
            case 'embed':
                break;
            case 'iframe':
                break;
            case 'span':
            case 'label':
            case 'em':
                break;
            case 'i':
                break;
            case 'q':
                return { url: '/quote', blocks: { childs: findTexts(ele) } }
                break;
            default:
                if (ele instanceof HTMLElement) {
                    return traverseChilds(ele);
                }
                break;
        }
    }
    function traverseChilds(ele: HTMLElement) {
        var cs = ele.childNodes;
        var rs = [];
        cs.forEach(c => {

            var g = traverseElement(c as HTMLElement);
            if (g) {
                if (Array.isArray(g)) rs.addRange(rs)
                else rs.push(g);
            }
        })
        return rs;
    }
    if (doc.body) {
        return traverseChilds(document.body);
    }
}