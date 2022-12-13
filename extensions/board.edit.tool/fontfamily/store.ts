import lodash from "lodash";
import { MergeSock } from "../../../component/lib/merge.sock";



export type FontFamilyStyle = {
    name: string,
    url: string,
    text: string
}

export var FontStores: FontFamilyStyle[] = [];
var loadFonts: string[] = [];
async function handle(batchs: {
    id: string;
    args?: any;
}[]) {
    lodash.remove(batchs, g => loadFonts.includes(g.id));
    for (let i = 0; i < batchs.length; i++) {
        var batch = batchs[i];
        var bn = FontStores.find(c => c.name == batch.id)
        var nf = new FontFace(bn.name, `url(${bn.url})`);
        await nf.load();
        loadFonts.push(bn.name);
    }
    return batchs.map(b => {
        return {
            id: b.id,
            data: {}
        }
    })
}
var ms = new MergeSock(handle)
export async function loadFontFamily(name: string) {
    return await ms.get(name);
}