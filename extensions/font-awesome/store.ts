import axios from "axios";
import { FontAwesomeType } from "./declare";
import "../../src/assert/font-awesome/less/solid.less";
import "../../src/assert/font-awesome/less/fontawesome.less";
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
        this.icons =(await axios.get(url)).data;
        this.isLoad = true;
    }
}

export var fontAwesomeStore = new FontAwesomeStore();