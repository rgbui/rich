
import { util } from "../../util/util";

export type EmojiType = {
    id: string,
    name: string,
    text?: string,
    childs: EmojiCode[]
}
export type EmojiCode = {
    code: string,
    name: string,
    keywords: string[]
}
class EmojiStore {
    private emojis: EmojiType[] = [];
    private isLoad: boolean = false;
    async get() {
        if (this.isLoad == false) await this.import()
        return this.emojis;
    }
    async import() {
        //加载数据
        var r = await import('./emoji.json');
        var url = r.default as any;
        // var data = await axios.get(url);
        var data=await util.getJson(url);
        this.emojis = data.data;
        this.isLoad = true;
    }
    async getRandom() {
        var g = await this.get();
        return g.randomOf().childs.randomOf();
    }
}
export var emojiStore = new EmojiStore();