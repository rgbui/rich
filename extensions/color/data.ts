
import { lst } from "../../i18n/store";
import { channel } from "../../net/channel";
export type ColorType = { color: string, text?: string };

/**
 * 文字颜色
 */
export var FontColorList = () => [
    { color: 'inherit', text: lst('默认') },
    { color: 'rgb(120,119,116)', text: lst('灰色') },
    { color: 'rgb(159,107,83)', text: lst('棕色') },
    { color: 'rgb(217,115,13)', text: lst('橙色') },
    { color: 'rgb(203,145,47)', text: lst('黄色') },
    { color: 'rgb(68,131,97)', text: lst('绿色') },
    { color: 'rgb(51,126,169)', text: lst('蓝色') },
    { color: 'rgb(144,101,176)', text: lst('紫色') },
    { color: 'rgb(193,76,138)', text: lst('粉色') },
    { color: 'rgb(212,76,71)', text: lst('红色') },
    // { color: { grad: 'linear-gradient(90deg, rgb(40, 188, 190) 0%, rgb(57, 53, 221) 100%)', color: 'rgb(49, 121, 206)' }, text: lst('渐变') },
    // { color: { grad: 'linear-gradient(90deg, rgb(36, 73, 254) 0%, rgb(202, 75, 167) 100%)', color: 'rgb(119, 74, 211)' }, text: lst('渐变') },
    // { color: { grad: 'linear-gradient(90deg, rgb(255, 113, 0) 0%, rgb(243, 0, 173) 100%)', color: 'rgb(249, 57, 87)' }, text: lst('渐变') },
    // { color: { grad: 'linear-gradient(90deg, rgb(243, 170, 0) 0%, rgb(228, 62, 41) 100%)', color: 'rgb(236, 116, 21)' }, text: lst('渐变') },
    // { color: { grad: 'linear-gradient(90deg, rgb(177, 106, 77) 0%, rgb(213, 166, 56) 100%)', color: 'rgb(195, 136, 67)' }, text: lst('渐变') },
] as { color: string | { grad: string, color: string }, text: string }[];
/**
 * 背景色
 */
export var BackgroundColorList = () => {
    // return OptionBackgroundColorList();
    return [
        { color: 'rgb(255,255,255)', text: lst('默认') },
        { color: 'rgb(241,241,239)', text: lst('灰色') },
        { color: 'rgb(244,238,238)', text: lst('棕色') },
        { color: 'rgb(251,236,221)', text: lst('橙色') },
        { color: 'rgb(251,243,219)', text: lst('黄色') },
        { color: 'rgb(237,243,236)', text: lst('绿色') },
        { color: 'rgb(231,243,248)', text: lst('蓝色') },
        { color: 'rgba(244,240,247,0.8)', text: lst('紫色') },
        { color: 'rgba(249,238,243,0.8)', text: lst('粉色') },
        { color: 'rgb(253,235,236)', text: lst('红色') },
        // { color: 'rgba(217,211,215,0.5)', text: lst('暗银') },
        // { color: 'rgba(247,214,183,0.5)', text: lst('幼杏') },
        // { color: 'rgba(255,193,153,0.5)', text: lst('鲜橘') },
        // { color: 'rgba(252,246,189,0.5)', text: lst('淡黄') },
        // { color: 'rgba(205,243,220,0.5)', text: lst('浅绿') },
        // { color: 'rgba(169,222,249,0.5)', text: lst('天蓝') },
        // { color: 'rgba(189,201,255,0.5)', text: lst('雾蓝') },
        // { color: 'rgba(239,218,251,0.5)', text: lst('轻紫') },
        // { color: 'rgba(234,202,220,0.5)', text: lst('熏粉') },
        // { color: 'rgba(253,198,200,0.5)', text: lst('将红') },
    ]
    // .map(c => {
    //     return {
    //         color: c.color.replace('0.5', '1'),
    //         text: c.text
    //     }
    // })
}
/**
 * 
 * 背景色
 * 
 */
export var OptionBackgroundColorList = () => {
    var cs = [
        // { fill: 'rgba(227,226,224,0.5)', color: 'rgb(50,48,44)', text: lst('浅灰') },
        // { fill: 'rgb(227,226,224)', color: 'rgb(50,48,44)', text: lst('灰色') },
        // { fill: 'rgb(238,224,218)', color: 'rgb(68,42,30)', text: lst('棕色') },
        // { fill: 'rgb(250,222,201)', color: 'rgb(73,41,14)', text: lst('橙色') },
        // { fill: 'rgb(253,236,200)', color: 'rgb(64,44,27)', text: lst('黄色') },
        // { fill: 'rgb(219,237,219)', color: 'rgb(28,56,41)', text: lst('绿色') },
        // { fill: 'rgb(211,229,239)', color: 'rgb(24,51,71)', text: lst('蓝色') },
        // { fill: 'rgb(232,222,238)', color: 'rgb(65,36,84)', text: lst('紫色') },
        // { fill: 'rgb(245,224,233)', color: 'rgb(76,35,55)', text: lst('粉色') },
        // { fill: 'rgb(255,226,221)', color: 'rgb(93,23,21)', text: lst('红色') },


        // { fill: 'rgb(143, 149, 158)', color: '#fff', text: lst('深灰') },
        // { fill: 'rgb(183, 145, 250)', color: '#fff', text: lst('深紫') },
        // { fill: 'rgb(235, 120, 184)', color: '#fff', text: lst('酒红') },
        // { fill: 'rgb(122, 162, 255)', color: '#fff', text: lst('深蓝') },
        // { fill: 'rgb(37, 176, 231)', color: '#fff', text: lst('蓝绿') },
        // { fill: 'rgb(45, 190, 171)', color: '#fff', text: lst('青色') },
        // { fill: 'rgb(53, 189, 75)', color: '#fff', text: lst('绿色') },
        // { fill: 'rgb(145, 173, 0)', color: '#fff', text: lst('橙黄') },
        // { fill: 'rgb(255, 129, 26)', color: '#fff', text: lst('深橙') },
        // { fill: 'rgb(255, 117, 112)', color: '#fff', text: lst('深红') },



        // { color: 'rgba(255,255,255,0)', text: lst('默认') },
        { fill: 'rgba(237,233,235,1)',color:'var(--text-color)', text: lst('白灰') },
        { fill: 'rgba(217,211,215,1)',color:'var(--text-color)', text: lst('暗银') },
        { fill: 'rgba(247,214,183,1)',color:'var(--text-color)', text: lst('幼杏') },
        { fill: 'rgba(255,193,153,1)',color:'var(--text-color)', text: lst('鲜橘') },
        { fill: 'rgba(252,246,189,1)',color:'var(--text-color)', text: lst('淡黄') },
        { fill: 'rgba(205,243,220,1)',color:'var(--text-color)', text: lst('浅绿') },
        { fill: 'rgba(169,222,249,1)',color:'var(--text-color)', text: lst('天蓝') },
        { fill: 'rgba(189,201,255,1)',color:'var(--text-color)', text: lst('雾蓝') },
        { fill: 'rgba(239,218,251,1)',color:'var(--text-color)', text: lst('轻紫') },
        { fill: 'rgba(234,202,220,1)',color:'var(--text-color)', text: lst('熏粉') },
        { fill: 'rgba(253,198,200,1)',color:'var(--text-color)', text: lst('将红') },
    ]
    // .map(c => {
    //     return {
    //         color: c.color.replace('0.5', '1'),
    //         text: c.text
    //     }
    // })
    // lodash.remove(cs, c => c.color == 'rgba(255,255,255,0)');
    return cs;
}
export var OptionColorRandom = () => {
    var r = OptionBackgroundColorList().randomOf();
    return {
        fill: r.fill,
        textColor: r.color
    }
}

export var BoardBackgroundColorList = () => {
    return [
        { "color": "rgb(0,0,0)" },
        { "color": "rgb(50,50,50)" },
        { "color": "rgb(87,87,87)" },
        { "color": "rgb(138,138,138)" },
        { "color": "rgb(179,179,179)" },
        { "color": "rgb(214,214,214)" },
        { "color": "rgb(232,232,232)" },
        { "color": "rgb(245,245,245)" },
        { "color": "rgb(255,255,255)" },
        { "color": "rgb(255,229,234)" },
        { "color": "rgb(254,235,221)" },
        { "color": "rgb(255,240,181)" },
        { "color": "rgb(251,247,192)" },
        { "color": "rgb(221,251,223)" },
        { "color": "rgb(220,250,240)" },
        { "color": "rgb(218,243,254)" },
        { "color": "rgb(224,235,255)" },
        { "color": "rgb(230,230,255)" },
        { "color": "rgb(251,223,244)" },
        { "color": "rgb(255,116,135)" },
        { "color": "rgb(255,123,100)" },
        { "color": "rgb(255,179,90)" },
        { "color": "rgb(255,214,53)" },
        { "color": "rgb(25,222,166)" },
        { "color": "rgb(0,219,218)" },
        { "color": "rgb(131,198,255)" },
        { "color": "rgb(135,176,251)" },
        { "color": "rgb(162,155,249)" },
        { "color": "rgb(250,153,231)" }
    ] as ColorType[]
}


export var BoardTextFontColorList = () => {
    return [
        { "color": "rgb(0,0,0)" },
        { "color": "rgb(50,50,50)" },
        { "color": "rgb(87,87,87)" },
        { "color": "rgb(122,122,122)" },
        { "color": "rgb(166,166,166)" },
        { "color": "rgb(199,199,199)" },
        { "color": "rgb(224,224,224)" },
        { "color": "rgb(235,235,235)" },
        { "color": "rgb(245,245,245)" },
        { "color": "rgb(255,255,255)" },
        { "color": "rgb(255,69,104)" },
        { "color": "rgb(249,71,55)" },
        { "color": "rgb(246,154,24)" },
        { "color": "rgb(248,193,1)" },
        { "color": "rgb(0,198,145)" },
        { "color": "rgb(0,195,194)" },
        { "color": "rgb(67,171,255)" },
        { "color": "rgb(61,127,255)" },
        { "color": "rgb(120,86,255)" },
        { "color": "rgb(238,73,214)" }
    ] as ColorType[]

}
export var BoardBorderColorList = () => {
    return [
        { "color": "rgb(0,0,0)" },
        { "color": "rgb(50,50,50)" },
        { "color": "rgb(87,87,87)" },
        { "color": "rgb(122,122,122)" },
        { "color": "rgb(166,166,166)" },
        { "color": "rgb(199,199,199)" },
        { "color": "rgb(224,224,224)" },
        { "color": "rgb(235,235,235)" },
        { "color": "rgb(245,245,245)" },
        { "color": "rgb(255,255,255)" },
        { "color": "rgb(250,192,198)" },
        { "color": "rgb(254,197,184)" },
        { "color": "rgb(255,205,153)" },
        { "color": "rgb(255,214,53)" },
        { "color": "rgb(85,243,188)" },
        { "color": "rgb(74,238,237)" },
        { "color": "rgb(173,220,255)" },
        { "color": "rgb(196,217,253)" },
        { "color": "rgb(214,213,253)" },
        { "color": "rgb(248,196,237)" },
        { "color": "rgb(255,69,104)" },
        { "color": "rgb(249,71,55)" },
        { "color": "rgb(229,128,19)" },
        { "color": "rgb(231,160,0)" },
        { "color": "rgb(0,171,125)" },
        { "color": "rgb(0,168,167)" },
        { "color": "rgb(0,150,242)" },
        { "color": "rgb(61,127,255)" },
        { "color": "rgb(138,120,254)" },
        { "color": "rgb(238,73,214)" }
    ] as ColorType[]

}






const Key = 'last.text.cache.font.color';
export var SetTextCacheFontColor = async (name: string, color: any) => {
    await channel.act('/cache/set', {
        key: Key,
        value: { name, color }
    })
}
export var GetTextCacheFontColor = async () => {
    var r = await channel.query('/cache/get', { key: Key });
    if (r) return {
        name: r.name,
        color: r.color as any
    }
}


