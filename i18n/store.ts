
import lodash from "lodash";
import { channel } from "../net/channel";
import { Langs } from "./declare";
import { S, Sp } from "./view";
import { util } from "../util/util";
import { blockStore } from "../extensions/block/store";
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
        await blockStore.import(true);
    }
    async load() {
        var rc = await channel.query('/cache/get', { key: `__shy_lang_data_${this.lang}` });
        var rs: Record<string, any>;
        if (rc) {
            if (false && rc.version == window.shyConfig.version && window.shyConfig.isPro) {
                rs = rc.langs;
            }
        }
        if (!rs) {
            var lop = langOptions.find(g => g.lang == this.lang);
            var url = (await lop.load()).default as any;
            rs = (await util.getJson(url)).data;
            await channel.act('/cache/set', {
                key: `__shy_lang_data_${this.lang}`,
                value:
                {
                    version: window.shyConfig.version,
                    langs: rs
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
        var d;
        if (typeof window.shyConfig.isUS) {
            var rg = this.dicts.get('us.' + key);
            if (rg) d = rg;
            else d = this.dicts.get(key)
        }
        else d = this.dicts.get(key);

        if (typeof d == 'undefined') {
            if (typeof content == 'string') uns[key] = content || '';
            else uns[key] = key;
            console.log(key, content);
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
                return d[b.slice(1, -1)];
            })
        return c;
    }
    svs: S[] = [];
    sps: Sp[] = [];
}

export var langOptions = [
    { lang: 'Chinese', text: '中文', load: async () => await import('./lang/Chinese.json') },
    { lang: 'English', text: 'English', load: async () => await import('./lang/English.json') },
    { lang: 'Japanese', text: '日本語', load: async () => await import('./lang/Japanese.json') },
    { lang: 'Korean', text: '한국어', load: async () => await import('./lang/Korean.json') },
    { lang: 'German', text: 'Deutsch', load: async () => await import('./lang/German.json') },
    { lang: 'French', text: 'Français', load: async () => await import('./lang/French.json') },
    { lang: 'Russian', text: 'Русский', load: async () => await import('./lang/Russian.json') },
    { lang: 'Italian', text: 'Italiano', load: async () => await import('./lang/Italian.json') },
    { lang: 'Portuguese', text: 'Português', load: async () => await import('./lang/Portuguese.json') },
    { lang: 'Spanish', text: 'Español', load: async () => await import('./lang/Spanish.json') },
    { lang: 'Dutch', text: 'Nederlands', load: async () => await import('./lang/Dutch.json') },
    { lang: 'Arabic', text: 'العربية', load: async () => await import('./lang/Arabic.json') },
    { lang: 'Indonesian', text: 'Bahasa Indonesia', load: async () => await import('./lang/Indonesian.json') }
]

// [
//     { "lang": "English", "translation": "English" },
//    { "lang": "Japanese", "translation": "日本語" },
//    { "lang": "Korean", "translation": "한국어" },
//    { "lang": "German", "translation": "Deutsch" },
//    { "lang": "French", "translation": "Français" },
//    { "lang": "Russian", "translation": "Русский" },
//    { "lang": "Italian", "translation": "Italiano" },
//    { "lang": "Portuguese", "translation": "Português" },
//    { "lang": "Spanish", "translation": "Español" },
//    { "lang": "Dutch", "translation": "Nederlands" },
//    { "lang": "Arabic", "translation": "العربية" },
//    { "lang": "Indonesian", "translation": "Bahasa Indonesia" }
// ]


export var ls = new LangStore();
export function lst(key: string, content?: string | Record<string, any>) {
    return ls.t(key, content);
}
(window as any).pg = () => {
    console.log(uns);
    try {
        console.log(JSON.stringify(uns, undefined, 4))
    }
    catch (ex) {

    }
}