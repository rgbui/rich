import lodash from "lodash";
import { MergeSock } from "../../../component/lib/merge.sock";
import { lst } from "../../../i18n/store";

export type FontFamilyStyle = {
    name: string,
    url?: string,
    text: string,
    loading?: boolean,
    loaded?: boolean
}


var FontCaches: FontFamilyStyle[];


export var GetFontStores: () => FontFamilyStyle[] = () => {
    if (typeof FontCaches == 'undefined') {
        FontCaches = [

            { name: 'inherit', text: lst('默认') },
            { url: 'https://resources.shy.live/fonts/SourceHanSansSC-Normal-2.otf', name: 'SourceHanSansSC', text: '思源黑体' },
            { url: 'https://resources.shy.live/fonts/SiYuanSongTiRegular/SourceHanSerifCN-Regular-1.otf', name: 'SourceHanSerifCN-Regular', text: '思源宋体' },
            { url: 'https://resources.shy.live/fonts/SmileySans-Oblique-2.ttf', name: 'SmileySans-Oblique', text: '得意黑' },
            { url: 'https://resources.shy.live/fonts/XiaoKeNaiLaoTiShangYongMianFei@QingKeZiTi-2.ttf', name: 'XiaoKeNaiLaoTiShangYongMianFei', text: '小可奶酪体' },
            { url: 'https://resources.shy.live/fonts/PangMenZhengDaoXiXianTi-2.ttf', name: 'PangMenZhengDaoXiXianTi', text: '庞门正道细线体' },
            // { url: 'https://resources.shy.live/fonts/FeiHuaSongTi-2', name: 'FeiHuaSongTi-2', text: '飞花宋体' },
            { url: 'https://resources.shy.live/fonts/SourceHanSansCN-VF-2.otf', name: 'SourceHanSansCN-VF-2', text: '思源黑体 CN VF' },
            { url: 'https://resources.shy.live/fonts/JustFontFenYuanZiTi-2.ttf', name: 'JustFontFenYuanZiTi-2', text: 'jf open 粉圓 1.0' },
            { url: 'https://resources.shy.live/fonts/YangRenDongZhuShiTi-Light-2.ttf', name: 'YangRenDongZhuShiTi-Light-2', text: '杨任东竹石体 Light' },
            { url: 'https://resources.shy.live/fonts/ZhanKuKuaiLeTi2016XiuDingBan-2.ttf', name: 'ZhanKuKuaiLeTi2016XiuDingBan-2', text: '站酷快乐体' },
            // { url: 'https://resources.shy.live/fonts/ZhanKuWenYiTi-2', name: 'ZhanKuWenYiTi-2', text: '站酷文艺体' },
            { url: 'https://resources.shy.live/fonts/ZhanKuXiaoLOGOTi-2.otf', name: 'ZhanKuXiaoLOGOTi-2', text: '站酷小薇LOGO体' },
            { url: 'https://resources.shy.live/fonts/RiBenHuaYuanMingChaoTi-2.ttf', name: 'RiBenHuaYuanMingChaoTi-2', text: '日本花园明朝体' },
            { url: 'https://resources.shy.live/fonts/Kosugi-Regular-2.ttf', name: 'Kosugi-Regular-2', text: '小杉黑体' },
            { url: 'https://resources.shy.live/fonts/CangErShuYuanTiW02-2.ttf', name: 'CangErShuYuanTiW02-2', text: '仓耳舒圆体W02' },

        ];
    }
    return FontCaches;
}



var loadFonts: string[] = [];
async function handle(batchs: {
    id: string;
    args?: any;
}[]) {
    lodash.remove(batchs, g => loadFonts.includes(g.id));
    for (let i = 0; i < batchs.length; i++) {
        var batch = batchs[i];
        var bn = GetFontStores().find(c => c.name == batch.id)
        var nf = new FontFace(bn.name, `url(${bn.url})`);
        bn.loading = true;
        try {
            await nf.load();
            bn.loaded = true;
        }
        catch (ex) {

        }
        finally {
            bn.loading = false;
        }
        loadFonts.push(bn.name);
    }
    if (batchs.length > 0) {
        let code = batchs.reduce((accumulator, currentValue) => {
            var f = GetFontStores().find(c => c.name == currentValue.id);
            return accumulator + `@font-face { font-family: ${f.name};src: url('${f.url}'); }`;
        }, "");
        var style = document.createElement("style") as any;
        style.type = "text/css";
        style.rel = "stylesheet";
        style.appendChild(document.createTextNode(code));
        var head = document.getElementsByTagName("head")[0];
        head.appendChild(style);
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