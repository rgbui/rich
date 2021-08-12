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
    function getTextFontPattern(el: ChildNode) {
        // var dm = dom(element instanceof Text ? element.parentNode : element);
        // var styles = [{
        //     name: 'default',
        //     selectors: CssSelectorType.none,
        //     cssList: [
        //         {
        //             name: BlockCssName.font,
        //             fontFamily: dm.style('fontFamily'),
        //             //color:dm.style('color'),
        //             fontStyle: dm.style('fontStyle'),
        //             fontWeight: dm.style('fontWeight'),
        //         }
        //     ]
        // }];
        return { styles: [] };
    }
    function isSolid(el: ChildNode) {
        var tag = (el as HTMLElement).tagName;
        var name = tag ? tag.toLowerCase() : undefined;
        if (name) {
            var names = ['img', 'video', 'audio', 'svg', 'iframe'];
            if (names.includes(name)) return true;
        }
        return false;
    }
    function isLine(el: ChildNode) {
        var tag = (el as HTMLElement).tagName;
        var name = tag ? tag.toLowerCase() : undefined;
        if (name) {
            var names = ['b', 'span', 'i', 'label', 'em', 'strong', 'del'];
            if (names.includes(name)) return true;
        }
        return false;
    }
    function isBlock(el: ChildNode) {
        var tag = (el as HTMLElement).tagName;
        var name = tag ? tag.toLowerCase() : undefined;
        if (name) {
            var names = ['pre', 'blockquote', 'table', 'ol', 'ul', 'hr', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6'];
            if (names.includes(name)) return true;
        }
        return false;
    }
    function isIgnore(el: ChildNode) {
        var tag = (el as HTMLElement).tagName;
        var name = tag ? tag.toLowerCase() : undefined;
        if (name) {
            var names = ['input', 'select', 'textarea'];
            if (names.includes(name)) return true;
        }
        return false;
    }
    function isPanel(el: ChildNode) {
        var tag = (el as HTMLElement).tagName;
        var name = tag ? tag.toLowerCase() : undefined;
        if (name) {
            var names = ['div', 'p', 'header', 'footer', 'section', 'article', 'aside', 'article'];
            if (names.includes(name)) return true;
        }
        return false;
    }
    function isText(el: ChildNode) {
        if (el instanceof Text) {
            return true;
        }
        return false;
    }
    function asName(el: ChildNode) {
        var na = (el as HTMLElement).tagName;
        if (na) return na.toLowerCase();
        return '';
    }

    function parseTexts(elPanel: ChildNode) {

    }
    function parseText(el: ChildNode) {
        return { url: '/text', content: el.textContent, pattern: getTextFontPattern(el) }
    }
    function parseLine(el: ChildNode) {
        return undefined;
    }
    function parseSolid(el: ChildNode) {

        return undefined;
    }
    function parseBlock(el: ChildNode) {
        return undefined;
    }
    function parseUnknow(el: ChildNode) {
        return undefined;
    }

    function traverseElement(el: ChildNode) {
        if (isIgnore(el)) {
            return []
        }
        else if (isPanel(el)) {
            return traversePanel(el);
        }
        else if (isSolid(el)) {
            var rs = parseSolid(el);
            if (Array.isArray(rs)) return rs;
            else if (rs) return [rs];
        }
        else if (isLine(el)) {
            var rs = parseLine(el);
            if (Array.isArray(rs)) return rs;
            else if (rs) return [rs];
        }
        else if (isText(el)) {
            var rss = parseText(el);
            if (Array.isArray(rss)) return rss;
            else return [rss];
        }
        else if (isBlock(el)) {
            var rs = parseBlock(el);
            if (Array.isArray(rs)) return rs;
            else if (rs) return [rs];
        }
        else {
            var rs = parseUnknow(el);
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
}