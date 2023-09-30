import { IconArguments, ResourceArguments } from "../extensions/icon/declare";
import { lst } from "../i18n/store";

export enum UserStatus {
    offline = 0,
    online = 1,
    busy = 2,
    idle = 3,
    hidden = 4,
}

export type UserBasic = {
    id: string,
    avatar?: ResourceArguments,
    cover?: IconArguments,
    role: 'user' | 'robot',
    sn?: number,
    name: string,
    status?: UserStatus,
    online?: boolean,
    slogan?: string
}


export type RobotTask = {
    workspaceId?: string;
    robotId?: string;
    id?: string,
    name: string,
    description?: string,
    url?: string,
    method?: string,
    handle?: 'stream' | 'sync' | 'async',
    headers?: { id?: string, name: string, value: string }[],
    main?: boolean,
    flag?: 'append' | 'write',
    args: {
        id: string,
        name: string,
        text: string,
        type: string,
        required?: boolean,
        remark?: string,
        default_value?: any
    }[],
    replys?: { id: string, mime: 'text' | 'json' | 'markdown' | 'image' | 'error', code?: string, template?: string, content?: string, data?: Record<string, any>, images?: { url: string, alt?: string }[] }[]
    /**
     * nextActions[0].args[0].value='$args.name|$replys['name']'
     */
    nextActions?: { text: string, task: string, args?: { name: string, value: string }[] }[]
    disabled?: boolean,
    /**
     * args replys
     * ```
     * args.name
     * args.name
     * replys 
     * ```
     */
    template?: string,
}

export enum RobotApply {
    none = 0,
    channel = 1,
    search = 2,
    aDraft = 3,
    pageSumit = 4,
    pageContinue = 5,
    askWrite = 6,
    selectionAskWrite = 7,
}



export function GetRobotApplyOptions() {
    return [
        { text: lst('无'), value: RobotApply.none },
        { text: lst('频道'), value: RobotApply.channel },
        // { text: '搜索', value: RobotApply.search },
        // { text: '拟草稿', value: RobotApply.aDraft },
        // { text: '页面总结', value: RobotApply.pageSumit },
        // { text: '页面续写', value: RobotApply.pageContinue },
        { text: lst('生成内容'), value: RobotApply.askWrite },
        { text: lst('内容润色'), value: RobotApply.selectionAskWrite }
    ]
}

export function GetRobotApplyArgs(apply: RobotApply) {
    switch (apply) {
        case RobotApply.channel:
        case RobotApply.search:
        case RobotApply.askWrite:
            return [{ name: 'prompt', input: true, text: lst('提问'), tip: lst('输入提问') }, { name: 'context', text: lst('上下文') }]
            break;
        // case RobotApply.aDraft:
        //     return [{ name: 'title', input: true, text: '标题', tip: '输入草稿标题' }, { name: 'context', text: '上下文' }]
        //     break;
        // case RobotApply.pageContinue:
        //     return [{ name: 'content', input: true, text: '内容', tip: '输入续写的上文' }, { name: 'context', text: '上下文' }]
        //     break;
        // case RobotApply.pageSumit:
        //     return [{ name: 'content', input: true, text: '内容', tip: '输入正文' }, { name: 'context', text: '上下文' }]
        //     break;
        case RobotApply.selectionAskWrite:
            return [
                { name: 'selection', text: lst('待处理内容'), tip: lst('待处理内容') },
                { name: 'prompt', input: true, text: lst('提问'), tip: lst('输入提问') },
                { name: 'context', text: lst('上下文') }
            ]
            break;
        default:
            return [{ name: 'prompt', input: true, text: lst('提示'), tip: lst('输入提问') }, { name: 'context', text: lst('上下文') }]
    }
}


export type RobotInfo = UserBasic & {
    remark?: string,
    basePath?: string,
    scene: 'wiki' | 'command';
    model?: string;
    imageModel?: string;
    embeddingModel?: string;
    /**
     * 是否禁用知识库上下文 ，
     */
    disabledWiki?: boolean;
    /**
     * 是否争对指令型的机器人开启大模型的调用模式
     * 可以通过自然语来调用
     */
    abledCommandModel?: boolean;

    wikiConfig?: {
        /**
         * 取最多的片段数 
         * 默认5
         */
        fragmentSize?: number,
        /**
         * 当前片段的上下文
         * 默认10
         */
        fragmentContextSize?: number,
        /***
         * 最低相似度，低于该值认为无效
         * 默认0.3
         */
        minLowerRank?: number

    },
    robotId?: string,
    headers?: { name: string, value: string }[],
    tasks?: RobotTask[],
    prompts?: {
        id?: string,
        createDate?: Date,
        apply?: RobotApply,
        type?: 'ask' | 'write' | 'polish',
        text: string,
        icon?: IconArguments,
        abled?: boolean,
        prompt: string,
        temperature?: number,
        config?: {

        }
    }[]
}


