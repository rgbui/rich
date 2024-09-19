import { CanSupportFeature, PayFeatureCheck } from "../../component/pay";
import { MenuItemType } from "../../component/view/menu/declare";
import { lst } from "../../i18n/store";
import { LinkWs } from "../../src/page/declare";
import { util } from "../../util/util";

export enum WsConsumeType {

    apiAccess = 1,//api访问量 暂时不统计
    bookmark = 2,//生成书签 

    esSearch = 3,//es搜索量 



    downloadFile = 5,//下载文件产生的流量  暂时不统计
    uploadFile = 6,//上传文件产生的流量  暂时不统计

    picHandle = 7,//图片处理 暂时不统计
    screenshotFile = 8,//截图产生的文件 暂时不统计


    /**
  * 需要每天计算磁盘的使用量,文档的数量，数据表的数量，数据的总行数
  */
    diskSpace = 20,
    docCount = 21,//文档数量（文档长度大于1000字节，算两个）
    rowCount = 22,//数据行数
    fileCount = 23,//文件数
    dauCount = 24,//日活量
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
   * 智谱AI模型
   * https://open.bigmodel.cn/dev/api#characterglm
  */
    glm_3_turbo = 100,
    glm_4 = 101,
    glm_4v = 102,
    charglm_3 = 103,
    glm_4_air = 104,
    glm_4_flash = 105,
    cogview_3 = 110,
    glm_embedding_2 = 111,
    glm_embedding = 113,

    cogvideox = 114,

    /**
    * deepseek
    */
    deepseek_chat = 120,
    deepseek_coder = 121,
}

export function getConstValue(cost: number, type: WsConsumeType) {
    if (type == WsConsumeType.diskSpace || type == WsConsumeType.downloadFile || type == WsConsumeType.uploadFile) {
        return util.byteToString(cost);
    }
    else if (type == WsConsumeType.rowCount) {
        return cost + '行'
    }
    else if (type == WsConsumeType.dauCount) {
        return '日活' + cost;
    }
    else if (type == WsConsumeType.glm_embedding_2 || type == WsConsumeType.glm_embedding || type == WsConsumeType.baidu_embedding) {
        return cost + "向量tokens"
    }
    else if (type == WsConsumeType.pen_6 || type == WsConsumeType.stability || type == WsConsumeType.badiu_Stable_Diffusion_XL || type == WsConsumeType.cogview_3 || type == WsConsumeType.dall_2 || type == WsConsumeType.dall_3) {
        return cost + '张'
    }
    else {
        return cost
    }
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
        case WsConsumeType.glm_3_turbo:
            return 'glm-3-turbo';
        case WsConsumeType.glm_4:
            return 'glm-4';
        case WsConsumeType.glm_4v:
            return 'glm-4v';
        case WsConsumeType.glm_4_air:
            return 'glm-4-air';
        case WsConsumeType.glm_4_flash:
            return 'glm-4-flash';
        case WsConsumeType.cogview_3:
            return 'cogview-3-plus';
        case WsConsumeType.cogvideox:
            return 'cogvideox';
        case WsConsumeType.charglm_3:
            return 'charglm-3';
        case WsConsumeType.glm_embedding_2:
            return 'embedding-2'
        case WsConsumeType.deepseek_chat:
            return 'deepseek-chat';
        case WsConsumeType.deepseek_coder:
            return 'deepseek-coder';
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


export function getAiModelOptions() {
    return window.shyConfig.isUS ? [
        { text: 'OpenAI', type: MenuItemType.text },
        { text: 'GPT-3.5', value: WsConsumeType.gpt_35_turbo },
        { text: 'GPT-4', value: WsConsumeType.gpt_4 },
        { type: MenuItemType.divide },
        { type: MenuItemType.help, helpInline: true, text: 'Learn about GPT supported by Shy', url: 'https://help.shy.red/page/62#9MZQerw5daPi4YuNpAK39u' }
    ] : [
        { text: 'DeepSeek', value: WsConsumeType.deepseek_chat },
        { text: lst('智谱'), type: MenuItemType.text },
        { text: 'Glm-4-Flash', value: WsConsumeType.glm_4_flash },
        { text: 'Glm-4-Air', value: WsConsumeType.glm_4_air },
        { text: 'Glm-4', value: WsConsumeType.glm_4 },
        { text: lst('百度千帆'), type: MenuItemType.text, label: '文言一心' },
        { text: 'ERNIE-Bot-Turbo', value: WsConsumeType.ERNIE_Bot_turbo },
        { text: 'ERNIE-Bot', value: WsConsumeType.ERNIE_Bot },
        { text: 'ERNIE-Bot-4', value: WsConsumeType.ERNIE_Bot_4 },
        { text: 'OpenAI', type: MenuItemType.text, label: '仅限体验' },
        { text: 'GPT-3.5', value: WsConsumeType.gpt_35_turbo },
        { text: 'GPT-4', value: WsConsumeType.gpt_4 },
        { type: MenuItemType.divide },
        { type: MenuItemType.help, helpInline: true, text: '了解诗云支持的语言大模型', url: 'https://help.shy.live/page/1554#msZje9gVt73jYtWbWMLScn' }
    ]
}

export function getAiImageModelOptions() {
    return window.shyConfig.isUS ? [
        { text: 'DALLE-3', value: WsConsumeType.dall_3 },
        { text: 'Stability', value: WsConsumeType.stability },
        { type: MenuItemType.divide },
        { type: MenuItemType.help, helpInline: true, text: 'Learn about the image generation model supported by Shy', url: 'https://help.shy.red/page/62#ujoyjqu7jFUorT6Y6qJvhZ' }
    ] : [
        { text: '智谱CogView-3-plus', value: WsConsumeType.cogview_3 },
        { text: 'DALLE-3', value: WsConsumeType.dall_3, label: '仅限体验' },
        { type: MenuItemType.divide },
        { type: MenuItemType.help, helpInline: true, text: '了解诗云支持的图像生成模型', url: 'https://help.shy.live/page/1554#b5gBWSCWnLf9QRG7izYAsq' }
    ]
}

export function getAiEmbeddingsOptions() {
    return window.shyConfig.isUS ? [
        { text: 'DALLE-3', value: WsConsumeType.gpt_embedding },
    ] : [
        { text: '智谱 Embedding(向量)', value: WsConsumeType.glm_embedding },
        { text: '文言一心 Embedding(向量', value: WsConsumeType.baidu_embedding },
    ]
}

export function getAiDefaultModel(model?: WsConsumeType, type?: 'text' | 'image' | 'embedding') {
    if (typeof model == 'number') return model;
    if (!type) type = 'text'
    if (window.shyConfig.isUS) {
        switch (type) {
            case 'text':
                return WsConsumeType.gpt_35_turbo
            case 'image':
                return WsConsumeType.dall_3
            case 'embedding':
                return WsConsumeType.gpt_embedding
        }
    }
    else {
        switch (type) {
            case 'text':
                return WsConsumeType.deepseek_chat;
                // return WsConsumeType.glm_4_flash
            case 'image':
                return WsConsumeType.cogview_3
            case 'embedding':
                return WsConsumeType.baidu_embedding
        }
    }
}

export async function checkModelPay(e: WsConsumeType, ws: LinkWs) {
    return await CanSupportFeature(![
        WsConsumeType.gpt_4,
        WsConsumeType.gpt_4_vision,
        WsConsumeType.ERNIE_Bot_4,
        WsConsumeType.glm_4,
        WsConsumeType.glm_4v,

    ].includes(e) ? PayFeatureCheck.cheapAI : PayFeatureCheck.expensiveAI, ws)
}

