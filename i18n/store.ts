
import { channel } from "../net/channel";
const LANG_VERSION = '1.0.0';
const LANG_LOCAL_KEY = '__shy_lang';

export class LangStore {
    private dicts: Map<string, string> = new Map();
    lang: string;
    isLoaded: boolean = false;
    async import(lang?: string) {
        if (this.isLoaded) return;
        var r = await channel.query('/cache/get', { key: LANG_LOCAL_KEY });
        if (typeof r == 'string') lang = r;
        if (typeof lang != 'string') {
            lang = window.shyConfig.lang;
        }
        this.lang = lang;
        await this.load();
        this.isLoaded = true;
    }
    async change(lang: string) {
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
            switch (this.lang) {
                case 'en':
                    var r = await import('./lang/en.json');
                    rs = r.default;
                    break;
                case 'zh':
                    var r = await import('./lang/zh.json');
                    rs = r.default;
                    break;
                case 'jp':
                    var r = await import('./lang/en.json');
                    rs = r.default;
                    break;
            }
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
    }
    t(key: string) {
        var d = this.dicts.get(key);
        if (typeof d != 'undefined') return d;
        else return key;
    }
    get isCn() {
        return this.lang == 'zh';
    }
}
export var ls = new LangStore();