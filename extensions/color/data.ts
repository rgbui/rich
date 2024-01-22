import { lst } from "../../i18n/store";


/**
 * 文字颜色
 */
export var FontColorList = () => [
    { color: 'inherit', text: lst('默认') },
    { color: 'rgb(120, 119, 116)', text: lst('灰色') },
    { color: 'rgb(159,107,83)', text: lst('棕色') },
    { color: 'rgb(217,115,13)', text: lst('橙色') },
    { color: 'rgb(203,145,47)', text: lst('黄色') },
    { color: 'rgb(68, 131, 97)', text: lst('绿色') },
    { color: 'rgb(51, 126, 169)', text: lst('蓝色') },
    { color: 'rgb(144, 101, 176)', text: lst('紫色') },
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
        { color: 'rgba(255,255,255,0)', text: lst('默认') },
        { color: 'rgba(237,233,235,0.5)', text: lst('白灰') },
        { color: 'rgba(217,211,215,0.5)', text: lst('暗银') },
        { color: 'rgba(247,214,183,0.5)', text: lst('幼杏') },
        { color: 'rgba(255,193,153,0.5)', text: lst('鲜橘') },
        { color: 'rgba(252,246,189,0.5)', text: lst('淡黄') },
        { color: 'rgba(205,243,220,0.5)', text: lst('浅绿') },
        { color: 'rgba(169,222,249,0.5)', text: lst('天蓝') },
        { color: 'rgba(189,201,255,0.5)', text: lst('雾蓝') },
        { color: 'rgba(239,218,251,0.5)', text: lst('轻紫') },
        { color: 'rgba(234,202,220,0.5)', text: lst('熏粉') },
        { color: 'rgba(253,198,200,0.5)', text: lst('将红') },
    ].map(c => {
        return {
            color: c.color.replace('0.5', '0.8'),
            text: c.text
        }
    })
}
/**
 * 
 * 背景色
 * 
 */
export var OptionBackgroundColorList = () => {

    return [
        { color: 'rgba(247,214,183,1)', text: lst('幼杏') },
        { color: 'rgba(255,193,153,1)', text: lst('鲜橘') },
        { color: 'rgba(252,246,189,1)', text: lst('淡黄') },
        { color: 'rgba(205,243,220,1)', text: lst('浅绿') },
        { color: 'rgba(169,222,249,1)', text: lst('天蓝') },
        { color: 'rgba(189,201,255,1)', text: lst('雾蓝') },
        { color: 'rgba(239,218,251,1)', text: lst('轻紫') },
        { color: 'rgba(234,202,220,1)', text: lst('熏粉') },
        { color: 'rgba(237,233,235,1)', text: lst('白灰') },
        { color: 'rgba(217,211,215,1)', text: lst('暗银') },
        { color: 'rgba(253,198,200,1)', text: lst('将红') },
    ].map(c => {
        return {
            color: c.color.replace('1)', '0.8)'),
            text: c.text
        }
    })
}