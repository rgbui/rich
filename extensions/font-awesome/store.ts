import Axios from "axios";
import { FontAwesomeType } from "./declare";

// import FontAwesome from "./font-awesome.json";

class FontAwesomeStore {
    private icons: FontAwesomeType[] = [];
    private isLoad: boolean = false;
    async get() {
        if (this.isLoad == false) await this.import()
        return this.icons;
    }
    async import()
    {
        //加载数据
        var r = await import('./font-awesome.json');
        this.icons = r.default;
        this.isLoad = true;
    }
}

export var fontAwesomeStore = new FontAwesomeStore();