
import "../../src/assert/font-awesome/less/solid.less";
import "../../src/assert/font-awesome/less/fontawesome.less";
import { util } from "../../util/util";
import { ByteDanceType } from "./declare";
import { QueueHandle } from "../../component/lib/queue";
import { ByteIcons } from "./byte-dance.icons";

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
    // onActionQueue: QueueHandle;
    // importingSvg: boolean = false;
    // async importSvgs() {
    //     if (this.byteIcons instanceof Map) return this.byteIcons;
    //     if (typeof this.onActionQueue == 'undefined') this.onActionQueue = new QueueHandle();
    //     await this.onActionQueue.create(async () => {
    //         if (this.importingSvg == true) return;
    //         if (typeof this.byteIcons == 'undefined') {
    //             this.importingSvg = true;
    //             var g = await import('./byte-dance.icons');
    //             this.byteIcons = g.ByteIcons;
    //             this.importingSvg = false;
    //         }
    //     })
    //     return this.byteIcons;
    // }
    async getRandom() {
        var g = await this.get();
        return g.randomOf();
    }
    byteIcons: Map<string, (props: {
        id: string;
        width: number;
        height: number;
        colors: string[];
        strokeWidth: number;
        strokeLinecap: string;
        strokeLinejoin: string;
    }) => string>
    renderSvg(name: string, color) {
        return ByteIcons.get(name)({
            id: name as any,
            width: 24,
            height: 24,
            strokeWidth: 3,
            strokeLinejoin: 'round',
            strokeLinecap: 'round',
            colors: [color, 'none', color, color, color, color, color, color]
        })
    }
}

export var byteDanceStore = new ByteDanceIconStore();