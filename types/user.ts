import { IconArguments, ResourceArguments } from "../extensions/icon/declare";
import { WsConsumeType } from "../net/ai/cost";

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
    // replys?: { id: string, mime: 'text' | 'json' | 'markdown' | 'image' | 'error', code?: string, template?: string, content?: string, data?: Record<string, any>, images?: { url: string, alt?: string }[] }[]
    // /**
    //  * nextActions[0].args[0].value='$args.name|$replys['name']'
    //  */
    // nextActions?: { text: string, task: string, args?: { name: string, value: string }[] }[]
    disabled?: boolean,
    /**
     * args replys
     * ```
     * args.name
     * args.name
     * replys 
     * ```
     */
    // template?: string,
}



export type RobotInfo = UserBasic & {
    basePath?: string,
    model?: WsConsumeType;
    instructions?: string;
    imageModel?: WsConsumeType;
    embeddingModel?: WsConsumeType;
    /**
     * 是否禁用知识库上下文 ，
     */
    disabledWiki?: boolean;

    disabledImage?: boolean;

    /**
     * 是否开启空间检索功能
     * 
     */
    disabledWorkspaceSearch?: boolean;

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

    share?: 'private' | 'public',
}

export type WorkspaceMember = {
    id: string;
    createDate: number;
    creater: string;
    userid: string;
    /**
     * 当前空间内用户的呢称
     */
    name: string;
    /**
     * 当前用户的角色
     */
    roleIds: string[];
    roles?: WorkspaceRole[];
    workspaceId: string;
    avatar: IconArguments;
    cover: IconArguments;
    totalScore: number;
}

export type WorkspaceRole = {
    id: string,
    text: string,
    color: string,
    permissions: number[],
    icon?: IconArguments
}


