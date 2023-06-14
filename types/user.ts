import { IconArguments, ResourceArguments } from "../extensions/icon/declare";

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
    sn: number,
    name: string,
    status: UserStatus,
    online: boolean,
    slogan: string
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
    args: { id: string, name: string, text: string, type: string }[],
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
export var RobotApplyOptions = [
    { text: '无', value: RobotApply.none },
    { text: '频道', value: RobotApply.channel },
    { text: '搜索', value: RobotApply.search },
    { text: '拟草稿', value: RobotApply.aDraft },
    { text: '页面内容总结', value: RobotApply.pageSumit },
    { text: '页面内容续写', value: RobotApply.pageContinue },
    { text: '写作', value: RobotApply.askWrite },
    { text: '选中内容处理', value: RobotApply.selectionAskWrite }
]


export type RobotInfo = UserBasic & {
    remark?: string,
    basePath?: string,
    scene: string;
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
        config?: {

        }
    }[]
}


