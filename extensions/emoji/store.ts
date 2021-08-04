import Axios from "axios";
export type EmojiType = {
    char: string,
    name: string,
    category: string,
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
        var data = await Axios.get('/data/emoji.json');
        this.emojis = data.data.map(g => {
            return {
                char: g.char,
                name: g.name,
                category: g.group,
                keywords: g.keywords,
            }
        });
        this.isLoad = true;
    }
}
export var emojiStore = new EmojiStore();