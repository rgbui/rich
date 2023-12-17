import { CanSupportFeature, PayFeatureCheck } from "../../component/pay";
import { MenuItemType } from "../../component/view/menu/declare";
import { lst } from "../../i18n/store";
import { LinkWs } from "../../src/page/declare";
import { util } from "../../util/util";

export enum WsConsumeType {

    apiAccess = 1,//api访问量
    bookmark = 2,//生成书签

    esSearch = 3,//es搜索量



    downloadFile = 5,//下载文件产生的流量
    uploadFile = 6,//上传文件产生的流量

    picHandle = 7,//图片处理
    screenshotFile = 8,//截图产生的文件

    greenContent = 30,//绿色内容 审核
    greenImage = 31,//绿色图片 审核
    greenVideo = 32,//绿色视频 审核
    greenFile = 33,//绿色文件 审核

    /**
     * 空间里面AI模型消耗
     * https://openai.com/pricing
     */
    gpt_35_turbo = 40,
    gpt_35_turbo_16K = 45,//16k的上下文
    gpt_35_turbo_1106 = 46,//JSON mode, reproducible outputs, parallel function calling, and more
    gpt_embedding = 41,//gpt嵌入式token
    gpt_4 = 42,
    gpt_4_32k = 43,
    gpt_4_vision = 44,
    gpt_4_1106 = 47,
    dall_2 = 50,
    dall_3 = 51,
    stability = 52,

    tts_1 = 60,
    tts_2_hd = 62,
    whisper_1 = 63,


    /**
     * 百度AI模型
     */
    baidu_embedding = 80,//嵌入式token
    ERNIE_Bot_turbo = 81,//ERNIE_Bot_turbo
    ERNIE_Bot = 82,//ERNIE_Bot
    ERNIE_Bot_8k = 83,//ERNIE_Bot
    ERNIE_Bot_4 = 84,//ERNIE_Bot
    badiu_Stable_Diffusion_XL = 90,//badiu_Stable_Diffusion_XL
    pen_6 = 91,//6pen

    /**
     * 需要每天计算磁盘的使用量,文档的数量，数据表的数量，数据的总行数
     */
    diskSpace = 20,
    docCount = 21,//文档数量（文档长度大于1000字节，算两个）
    rowCount = 22,//数据行数

}

export function getConstValue(type: WsConsumeType, cost) {
    if (type == WsConsumeType.diskSpace || type == WsConsumeType.downloadFile || type == WsConsumeType.uploadFile) {
        return util.byteToString(cost);
    }
    return cost;
}

export function getWsConsumeType(type: WsConsumeType) {
    switch (type) {
        case WsConsumeType.apiAccess:
            return lst('API访问量')
        case WsConsumeType.bookmark:
            return lst('生成书签')
        case WsConsumeType.esSearch:
            return lst('ES搜索量')
        case WsConsumeType.downloadFile:
            return lst('下行流量')
        case WsConsumeType.uploadFile:
            return lst('上行流量')
        case WsConsumeType.picHandle:
            return lst('图片处理')
        case WsConsumeType.screenshotFile:
            return lst('截图')
        case WsConsumeType.greenContent:
            return lst('内容安检')
        case WsConsumeType.greenImage:
            return lst('内容安检')
        case WsConsumeType.greenVideo:
            return lst('内容安检')
        case WsConsumeType.greenFile:
            return lst('内容安检')
        case WsConsumeType.gpt_35_turbo:
            return ('GPT-3.5')
        case WsConsumeType.gpt_35_turbo_16K:
            return ('GPT-3.5-16K')
        case WsConsumeType.gpt_35_turbo_1106:
            return ('GPT-3.5-1106')
        case WsConsumeType.gpt_embedding:
            return ('GPT-Embedding')
        case WsConsumeType.gpt_4:
            return ('GPT-4')
        case WsConsumeType.gpt_4_32k:
            return ('GPT-4-32K')
        case WsConsumeType.gpt_4_vision:
            return ('GPT-4-Vision')
        case WsConsumeType.gpt_4_1106:
            return ('GPT-4-1106')
        case WsConsumeType.dall_2:
            return ('DALL-2')
        case WsConsumeType.dall_3:
            return ('DALL-3')
        case WsConsumeType.stability:
            return ('Stability')
        case WsConsumeType.tts_1:
            return ('TTS-1')
        case WsConsumeType.tts_2_hd:
            return ('TTS-2-HD')
        case WsConsumeType.whisper_1:
            return ('Whisper-1')
        case WsConsumeType.baidu_embedding:
            return lst('百度-Embedding')
        case WsConsumeType.ERNIE_Bot_turbo:
            return ('ERNIE-Bot-turbo')
        case WsConsumeType.ERNIE_Bot:
            return ('ERNIE-Bot')
        case WsConsumeType.ERNIE_Bot_8k:
            return ('ERNIE-Bot-8K')
        case WsConsumeType.ERNIE_Bot_4:
            return ('ERNIE-Bot-4')
        case WsConsumeType.badiu_Stable_Diffusion_XL:
            return lst('百度-Stable-Diffusion-XL')
        case WsConsumeType.pen_6:
            return ('6pen')
        case WsConsumeType.diskSpace:
            return lst('空间')
        case WsConsumeType.docCount:
            return lst('文档数量')
        case WsConsumeType.rowCount:
            return lst('数据行数')
        default:
            return lst('未知')

    }
}


export function getModelOptions() {
    return window.shyConfig.isUS ? [
        { text: 'OpenAI', type: MenuItemType.text },
        { text: 'GPT-3.5', value: WsConsumeType.gpt_35_turbo },
        { text: 'GPT-4', value: WsConsumeType.gpt_4 },
        { text: 'GPT-4V', value: WsConsumeType.gpt_4_vision },
    ] : [
        { text: lst('百度千帆'), type: MenuItemType.text, label: '文言一心' },
        { text: 'ERNIE-Bot-turbo', value: WsConsumeType.ERNIE_Bot_turbo },
        { text: 'ERNIE-Bot', value: WsConsumeType.ERNIE_Bot },
        { text: 'ERNIE-Bot-4', value: WsConsumeType.ERNIE_Bot_4 },
        { text: 'OpenAI', type: MenuItemType.text, label: '仅限体验' },
        { text: 'GPT-3.5', value: WsConsumeType.gpt_35_turbo, label: '仅限体验' },
        { text: 'GPT-4', value: WsConsumeType.gpt_4, label: '仅限体验' },
        { text: 'GPT-4V', value: WsConsumeType.gpt_4_vision, label: '仅限体验' }
    ]
}

export async function checkModelPay(e: WsConsumeType, ws: LinkWs) {
    return await CanSupportFeature(![
        WsConsumeType.gpt_4,
        WsConsumeType.gpt_4_vision,
        WsConsumeType.ERNIE_Bot_4
    ].includes(e) ? PayFeatureCheck.cheapAI : PayFeatureCheck.expensiveAI, ws)
}

