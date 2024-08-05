import lodash from "lodash";
import { MergeSock } from "../../../component/lib/merge.sock";
import { lst } from "../../../i18n/store";

export type FontFamilyStyle = {
    name: string,
    url?: string,
    text: string,
    loading?: boolean,
    loaded?: boolean,
    imgUrl?: string
}


var FontCaches: FontFamilyStyle[];


export var GetFontStores: () => FontFamilyStyle[] = () => {
    if (typeof FontCaches == 'undefined') {
        FontCaches = [

            { name: 'inherit', text: lst('默认') },
            { url: 'https://resources.shy.live/fonts/SourceHanSansSC-Normal-2.otf', name: 'SourceHanSansSC', text: '思源黑体', imgUrl: 'https://resources.shy.live/fonts/SourceHanSansSC-Normal-2.png' },
            { url: 'https://resources.shy.live/fonts/SiYuanSongTiRegular/SourceHanSerifCN-Regular-1.otf', name: 'SourceHanSerifCN-Regular', text: '思源宋体', imgUrl: 'https://resources.shy.live/fonts/SourceHanSerifCN-Regular-1.png' },
            { url: 'https://resources.shy.live/fonts/SmileySans-Oblique-2.ttf', name: 'SmileySans-Oblique', text: '得意黑', imgUrl: 'https://resources.shy.live/fonts/SmileySans-Oblique-2.jpg' },
            { url: 'https://resources.shy.live/fonts/HarmonyOS_Sans_Regular.ttf', name: 'HarmonyOS_Sans_Regular', text: '鸿蒙OS', imgUrl: 'https://resources.shy.live/fonts/HarmonyOS_Sans_Regular.png' },
            { url: 'https://resources.shy.live/fonts/Kosugi-Regular-2.ttf', name: 'Kosugi-Regular-2', text: '小杉黑体', imgUrl: 'https://resources.shy.live/fonts/Kosugi-Regular-2.jpg' },
            { url: 'https://resources.shy.live/fonts/SourceHanSansCN-VF-2.otf', name: 'SourceHanSansCN-VF-2', text: '思源黑体 CN VF', imgUrl: 'https://resources.shy.live/fonts/SourceHanSansCN-VF-2.jpg' },
            { url: 'https://resources.shy.live/fonts/PangMenZhengDaoXiXianTi-2.ttf', name: 'PangMenZhengDaoXiXianTi', text: '庞门正道细线体', imgUrl: 'https://resources.shy.live/fonts/PangMenZhengDaoXiXianTi-2.jpg' },
            { url: "https://resources.shy.live/fonts/ZiTiChuanQiNanAnTi-MianFeiShangYong-2.ttf", name: "ZiTiChuanQiNanAnTi-MianFeiShangYong-2", text: "字体传奇南岸体", imgUrl: "https://resources.shy.live/fonts/ZiTiChuanQiNanAnTi-MianFeiShangYong-2.png" },
            { url: 'https://resources.shy.live/fonts/huangkaihuaLawyerfont-2.ttf', name: 'huangkaihuaLawyerfont-2', text: '黄凯桦律师手写体', imgUrl: 'https://resources.shy.live/fonts/huangkaihuaLawyerfont-2.jpg' },
            { url: 'https://resources.shy.live/fonts/XiaoKeNaiLaoTiShangYongMianFei@QingKeZiTi-2.ttf', name: 'XiaoKeNaiLaoTiShangYongMianFei', text: '小可奶酪体', imgUrl: 'https://resources.shy.live/fonts/XiaoKeNaiLaoTiShangYongMianFei.jpg' },
            { url: 'https://resources.shy.live/fonts/1636096520510638.ttf', name: 'f1636096520510638', text: '江西拙楷', imgUrl: 'https://resources.shy.live/fonts/1636096520510638.png' },
            { url: 'https://resources.shy.live/fonts/Muyao-Softbrush-2.ttf', name: 'Muyao-Softbrush-2', text: '沐瑶软笔手写体', imgUrl: 'https://resources.shy.live/fonts/Muyao-Softbrush-2.png' },
            { url: 'https://resources.shy.live/fonts/JustFontFenYuanZiTi-2.ttf', name: 'JustFontFenYuanZiTi-2', text: 'jf open 粉圓 1.0', imgUrl: 'https://resources.shy.live/fonts/JustFontFenYuanZiTi-2.png' },
            { url: 'https://resources.shy.live/fonts/ZhanKuKuaiLeTi2016XiuDingBan-2.ttf', name: 'ZhanKuKuaiLeTi2016XiuDingBan-2', text: '站酷快乐体', imgUrl: 'https://resources.shy.live/fonts/ZhanKuKuaiLeTi2016XiuDingBan-1.jpg' },
            { url: 'https://resources.shy.live/fonts/RiBenHuaYuanMingChaoTi-2.ttf', name: 'RiBenHuaYuanMingChaoTi-2', text: '日本花园明朝体', imgUrl: 'https://resources.shy.live/fonts/RiBenHuaYuanMingChaoTi-2.png' },
            { url: 'https://resources.shy.live/fonts/YanShiChunFengKai/YanShiChunFengKai-2.ttf', name: 'YanShiChunFengKai-2', text: '演示春风楷', imgUrl: 'https://resources.shy.live/fonts/YanShiChunFengKai-2.jpg' },
            { url: 'https://resources.shy.live/fonts/WenCangShuFang/WenCangShuFang-2.ttf', name: 'WenCangShuFang-2', text: '问藏书房', imgUrl: 'https://resources.shy.live/fonts/WenCangShuFang-2.jpg' },
            { url: 'https://resources.shy.live/fonts/YangRenDongZhuShiTi-Light-2.ttf', name: 'YangRenDongZhuShiTi-Light-2', text: '杨任东竹石体 Light', imgUrl: 'https://resources.shy.live/fonts/YangRenDongZhuShiTi-Light-2.png' },
            { url: 'https://resources.shy.live/fonts/ZhanKuXiaoLOGOTi-2.otf', name: 'ZhanKuXiaoLOGOTi-2', text: '站酷小薇LOGO体', imgUrl: 'https://resources.shy.live/fonts/ZhanKuXiaoLOGOTi-2.jpg' },
            { url: 'https://resources.shy.live/fonts/CangErShuYuanTiW02-2.ttf', name: 'CangErShuYuanTiW02-2', text: '仓耳舒圆体W02', imgUrl: 'https://resources.shy.live/fonts/CangErShuYuanTiW02-2.png' },
            { url: 'https://resources.shy.live/fonts/MelonSeedBody.ttf', name: 'MelonSeedBody', text: '山字瓜子体', imgUrl: 'https://resources.shy.live/fonts/MelonSeedBody.png' },
            { url: 'https://resources.shy.live/fonts/YuFanXiLiu.otf', name: 'YuFanXiLiu', text: '余繁细柳体', imgUrl: 'https://resources.shy.live/fonts/YuFanXiLiu.png' },
            { url: 'https://resources.shy.live/fonts/Pacifico-Regular.ttf', name: "Pacifico-Regular", text: "Pacifico", imgUrl: 'https://resources.shy.live/fonts/Pacifico-Regular.png' },
            { url: 'https://resources.shy.live/fonts/Rock-Salt.ttf', name: 'Rock-Salt', text: 'Rock Salt', imgUrl: 'https://resources.shy.live/fonts/Rock-Salt.png' },

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