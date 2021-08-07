import Axios from "axios";
import { FontAwesomeType } from "./declare";

class FontAwesomeStore {
    private icons: FontAwesomeType[] = [];
    private isLoad: boolean = false;
    async get() {
        if (this.isLoad == false) await this.import()
        return this.icons;
    }
    async import() {
        //加载数据
        var r = await Axios.get('/data/font-awesome.json');
        this.icons = r.data;
        this.isLoad = true;
    }
}

export var fontAwesomeStore = new FontAwesomeStore();