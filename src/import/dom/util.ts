

export var parseUtil = {
    isSolid(el: ChildNode) {
        var tag = (el as HTMLElement).tagName;
        var name = tag ? tag.toLowerCase() : undefined;
        if (name) {
            var names = ['img', 'video', 'audio', 'svg', 'iframe'];
            if (names.includes(name)) return true;
        }
        return false;
    }, isLine(el: ChildNode) {
        var tag = (el as HTMLElement).tagName;
        var name = tag ? tag.toLowerCase() : undefined;
        if (name) {
            var names = ['b', 'span', 'i', 'label', 'em', 'strong', 'del'];
            if (names.includes(name)) return true;
        }
        return false;
    }, isBlock(el: ChildNode) {
        var tag = (el as HTMLElement).tagName;
        var name = tag ? tag.toLowerCase() : undefined;
        if (name) {
            var names = ['pre','q', 'blockquote', 'table', 'ol', 'ul', 'hr', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6'];
            if (names.includes(name)) return true;
        }
        return false;
    }, isIgnore(el: ChildNode) {
        var tag = (el as HTMLElement).tagName;
        var name = tag ? tag.toLowerCase() : undefined;
        if (name) {
            var names = ['input', 'select', 'textarea'];
            if (names.includes(name)) return true;
        }
        return false;
    }, isPanel(el: ChildNode) {
        var tag = (el as HTMLElement).tagName;
        var name = tag ? tag.toLowerCase() : undefined;
        if (name) {
            var names = ['div', 'p', 'header', 'footer', 'section', 'article', 'aside', 'article'];
            if (names.includes(name)) return true;
        }
        return false;
    }, isText(el: ChildNode) {
        if (el instanceof Text) {
            return true;
        }
        return false;
    }, asName(el: ChildNode) {
        var na = (el as HTMLElement).tagName;
        if (na) return na.toLowerCase();
        return '';
    }
}