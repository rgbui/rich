
import { util } from "../../util/util";
import { ByteDanceType } from "./declare";
class ByteDanceIconStore {
    icons: ByteDanceType[] = [];
    private isLoad: boolean = false;
    public category: { name: string, text: string }[] = [];
    async get() {
        if (this.isLoad == false) await this.import()
        return this.icons;
    }
    async import() {
        //加载数据
        var r = await import('./byte-dance-icons.json');
        var url = r.default as any;
        this.icons = (await util.getJson(url)).data;
        this.icons.forEach(item => {
            if (this.category.findIndex(x => x.name == item.category) < 0) {
                this.category.push({ name: item.category, text: item.categoryCN });
            }
        })
        this.isLoad = true;
    }
    async getRandom() {
        var g = await this.get();
        return g.randomOf();
    }
}

export var byteDanceStore = new ByteDanceIconStore();