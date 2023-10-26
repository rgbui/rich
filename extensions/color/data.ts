import { lst } from "../../i18n/store";


/**
 * 文字颜色
 */
export var FontColorList = () => [
    { color: 'inherit', text: lst('默认') },
    { color: 'rgba(55,53,47,0.6)', text: lst('灰色') },
    { color: 'rgb(100,71,58)', text: lst('棕色') },
    { color: 'rgb(217,115,13)', text: lst('橙色') },
    { color: 'rgb(223,171,1)', text: lst('黄色') },
    { color: 'rgb(15,123,108)', text: lst('绿色') },
    { color: 'rgb(11,110,153)', text: lst('蓝色') },
    { color: 'rgb(105,64,165)', text: lst('紫色') },
    { color: 'rgb(173,26,114)', text: lst('粉色') },
    { color: 'rgb(224,62,62)', text: lst('红色') },
    // { color: { grad: 'linear-gradient(90deg, rgb(40, 188, 190) 0%, rgb(57, 53, 221) 100%)', color: 'rgb(49, 121, 206)' }, text: lst('渐变') },
    // { color: { grad: 'linear-gradient(90deg, rgb(36, 73, 254) 0%, rgb(202, 75, 167) 100%)', color: 'rgb(119, 74, 211)' }, text: lst('渐变') },
    // { color: { grad: 'linear-gradient(90deg, rgb(255, 113, 0) 0%, rgb(243, 0, 173) 100%)', color: 'rgb(249, 57, 87)' }, text: lst('渐变') },
    // { color: { grad: 'linear-gradient(90deg, rgb(243, 170, 0) 0%, rgb(228, 62, 41) 100%)', color: 'rgb(236, 116, 21)' }, text: lst('渐变') },
    // { color: { grad: 'linear-gradient(90deg, rgb(177, 106, 77) 0%, rgb(213, 166, 56) 100%)', color: 'rgb(195, 136, 67)' }, text: lst('渐变') },
] as { color: string | { grad: string, color: string }, text: string }[];
/**
 * 背景色
 */
export var BackgroundColorList = () => [
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
]