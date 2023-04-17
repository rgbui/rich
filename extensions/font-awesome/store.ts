import { FontAwesomeType } from "./declare";
import "../../src/assert/font-awesome/less/solid.less";
import "../../src/assert/font-awesome/less/fontawesome.less";
import { util } from "../../util/util";
class FontAwesomeStore {
    private icons: FontAwesomeType[] = [];
    private isLoad: boolean = false;
    async get() {
        if (this.isLoad == false) await this.import()
        return this.icons;
    }
    async import() {
        //加载数据
        var r = await import('./font-awesome.json');
        var url = r.default as any;
        this.icons =(await util.getJson(url)).data;
        this.isLoad = true;
    }
    async getRandom() {
        var g = await this.get();
        return g.randomOf().icons.randomOf();
    }
}

export var fontAwesomeStore = new FontAwesomeStore();