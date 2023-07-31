
import lodash from "lodash";
import { channel } from "../net/channel";
import { Langs } from "./declare";
import { S, Sp } from "./view";
const LANG_VERSION = '1.0.0';
const LANG_LOCAL_KEY = '__shy_lang';

var uns: Record<string, any> = {};
export class LangStore {
    private dicts: Map<string, string> = new Map();
    lang: Langs;
    isLoaded: boolean = false;
    async import(lang?: Langs) {
        if (this.isLoaded) return;
        var r = await channel.query('/cache/get', { key: LANG_LOCAL_KEY });
        if (typeof r == 'string') lang = r as Langs;
        if (typeof lang != 'string') {
            lang = window.shyConfig.lang;
        }
        this.lang = lang;
        await this.load();
        this.isLoaded = true;
    }
    async change(lang: Langs) {
        await channel.act('/cache/set', { key: LANG_LOCAL_KEY, value: lang })
        this.lang = lang;
        await this.load();
    }
    async load() {
        var rc = await channel.query('/cache/get', { key: `__shy_lang_data_${this.lang}` });
        var rs: Record<string, any>;
        if (rc) {
            if (rc.version == LANG_VERSION) {
                rs = rc.langs;
            }
        }
        if (!rs) {
            var lop = langOptions.find(g => g.lang == this.lang);
            rs = (await lop.load()).default;
            await channel.act('/cache/set', {
                key: `__shy_lang_data_${this.lang}`,
                value:
                {
                    version: LANG_VERSION,
                    value: rs
                }
            })
        }
        var rict = new Map();
        for (let key in rs) rict.set(key, rs[key]);
        this.dicts = rict;
        for (let s of this.svs) s.forceUpdate()
        for (let sp of this.sps) sp.forceUpdate()
    }
    t(key: string, content?: string | Record<string, any>) {
        var d = this.dicts.get(key);
        if (typeof d == 'undefined') {
            if (typeof content == 'string')
                uns[key] = content || '';
        }
        if (typeof d != 'undefined') {
            if (lodash.isObject(content) && !lodash.isNull(content)) return this.format(d, content)
            return d;
        }
        else {
            if (typeof content == 'string') return content;
            return key;
        }
    }
    get isCn() {
        return this.lang == 'Chinese';
    }
    is(lang: Langs) {
        return this.lang == lang;
    }
    format(c: string, d: Record<string, any>) {
        if (c)
            c = c.replace(/(\{\w+\})/g, (a, b) => {
                return d.data[b.slice(1, -1)];
            })
        return c;
    }
    svs: S[] = [];
    sps: Sp[] = [];
}

export var langOptions = [
    { lang: 'Chinese', text: '中文', load: async () => await import('./lang/Chinese.json') },
    { lang: 'English', text: '英文', load: async () => await import('./lang/English.json') },
    { lang: 'Japanese', text: '日语', load: async () => await import('./lang/Japanese.json') },
    { lang: 'Korean', text: '韩文', load: async () => await import('./lang/Korean.json') },
    { lang: 'German', text: '德语', load: async () => await import('./lang/German.json') },
    { lang: 'French', text: '法语', load: async () => await import('./lang/French.json') },
    { lang: 'Russian', text: '俄语', load: async () => await import('./lang/Russian.json') },
    { lang: 'Italian', text: '意大利', load: async () => await import('./lang/Italian.json') },
    { lang: 'Portuguese', text: '葡萄牙', load: async () => await import('./lang/Portuguese.json') },
    { lang: 'Spanish', text: '西班牙', load: async () => await import('./lang/Spanish.json') },
    { lang: 'Dutch', text: '荷兰', load: async () => await import('./lang/Dutch.json') },
    { lang: 'Arabic', text: '阿拉伯', load: async () => await import('./lang/Arabic.json') },
    { lang: 'Indonesian', text: '印度尼西亚', load: async () => await import('./lang/Indonesian.json') }
]

export var ls = new LangStore();
export function lst(key: string, content?: string | Record<string, any>) {
    return ls.t(key, content);
}
(window as any).printLangs = () => {
    console.log(JSON.stringify(uns, undefined, 4))
}