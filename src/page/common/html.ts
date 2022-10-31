import lodash from "lodash";
var TagMaps: { tag: string, url: string }[] = [];

function mv(value) {
    var str = value.toString();
    return str.replace(/"/g, "\\\"");
}

function mp(key, value: any) {
    if (typeof value == 'string') return `${key}="${mv(value)}"`
    else if (typeof value == 'boolean') return `${key}:bool="${value ? 'true' : 'false'}"`
    else if (typeof value == 'number') return `${key}:number="${value.toString()}"`
    else if (lodash.isNull(value)) return `${key}:null="${value}"`
    else if (value instanceof Date) return `${key}:date="${value.getTime().toString()}"`
    else return `${key}:object="${mv(JSON.stringify(value))}"`
}

function getDeep(deep: number) {
    var str = '';
    for (let i = 0; i < deep; i++) {
        str += '\t'
    }
    return str;
}

export function jsonToHtml(json: Record<string, any>, deep: number = 0) {
    var xml: {
        tag: string,
        props: { key: string, value: any }[],
        childs?: any[], blocks?: Record<string, any[]>
    } = {} as any;
    var tm = TagMaps.find(g => g.url == json.url);
    if (tm) xml.tag = tm.tag;
    else xml.tag = 'div';
    for (let n in json) {
        if (n == 'url' && tm) continue;
        else if (n == 'blocks') {
            xml.blocks = {};
            for (let m in json.blocks) {
                xml.blocks[m] = json.blocks[m].map(c => jsonToHtml(c, deep + 1))
            }
        }
        else if (n == 'childs') {
            xml.childs = json[n].map(c => jsonToHtml(c, deep + 1))
        }
        else xml.props.push({ key: n, value: json[n] })
    }
    var childsStr = '';
    if (Array.isArray(xml.childs)) {
        childsStr = xml.childs.join("\n");
    } else if (xml.blocks) {
        var ps: string[] = [];
        for (let x in xml.blocks) {
            ps.push(`${getDeep(deep)}<${x}>
${xml.blocks[x].join("\n")}
${getDeep(deep)}</${x}>`)
        }
        childsStr = `<blocks>${ps.join('\n')}</blocks>`;
    }
    return `${getDeep(deep)}<${xml.tag} ${xml.props.map(pr => mp(pr.key, pr.value)).join(" ")}>
${childsStr}
${getDeep(deep)}</${xml.tag}>`
}

function ev(value) {
    var str = value.toString();
    return str.replace(/\\"/g, "\"");
}

function pp(key: string, value: any) {
    var type = 'string';
    if (key.indexOf(':') > -1) {
        var ks = key.split(':');
        key = ks[0];
        type = ks[1];
    }
    if (type == 'bool') {
        if (value == 'true') value = true;
        else if (value == 'false') value = false;
    }
    else if (type == 'number') value = parseFloat(value)
    else if (type == 'null') value = null
    else if (type == 'date') value = new Date(parseFloat(value))
    else if (type == 'object') value = JSON.parse(ev(value))
    else if (type == 'string') value = ev(value)
    return { key, value }
}

export function domToJson(dom: HTMLElement) {
    var json: Record<string, any> = {};
    var tag = dom.tagName.toLowerCase();
    var mc = TagMaps.find(g => g.tag == tag);
    if (mc) json.url = mc.url;
    else json.url = dom.getAttribute('url');
    var attrs = dom.attributes;
    for (let i = 0; i < attrs.length; i++) {
        var attr = attrs[i];
        var key = attr.name;
        var value = attr.value;
        var nc = pp(key, value);
        json[nc.key] = nc.value;
    }

    var cs = Array.from(dom.children);
    if (cs.length == 1 && cs[0].tagName.toLowerCase() == 'blocks') {
        var ns = Array.from(cs[0].children);
        for (let j = 0; j < ns.length; j++) {
            var no = ns[0];
            json.blocks[no.tagName.toLowerCase()] = Array.from(no.children).map(c => domToJson(c as HTMLElement))
        }
    }
    else {
        json.childs = cs.map(c => domToJson(c as HTMLElement))
    }
    return json;
}