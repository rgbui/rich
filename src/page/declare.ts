import { PageSvg, TopicSvg, CollectTableSvg, DocCardsSvg } from "../../component/svgs";
import { IconValueType } from "../../component/view/icon";
import { MenuItem, MenuItemType } from "../../component/view/menu/declare";
import { IconArguments, ResourceArguments } from "../../extensions/icon/declare";
import { lst } from "../../i18n/store";
import { WsConsumeType } from "../../net/ai/cost";
import { RobotInfo } from "../../types/user";
import { AtomPermission } from "./permission";

export enum PageLayoutType {
    /**
     * 文档
     */
    doc = 1,
    docCard = 2,
    //#region db
    db = 20,
    // formView = 21,
    recordView = 22,
    /**
     * 从表里选择一些数据的页面窗体
     */
    // dbPickRecord = 23,
    /**
     * schema view
     */
    dbView = 24,
    //#endregion

    /**
     * 白板
     */
    board = 30,
    /**
     * 文字频道
     */
    textChannel = 40,
}

export enum PageVersion {
    v1 = '0.0.1'
}

export interface LinkPageItem<T = {}> {
    id?: string;
    text?: string;
    icon?: IconArguments,
    sn?: number,
    description?: string,
    pageType?: PageLayoutType,
    elementUrl?: string,
    url?: string,
    locker?: {
        lock: boolean,
        date: number,
        userid: string
    },
    share?: 'net' | 'nas' | 'local';
    createDate?: Date,
    editDate?: Date,
    editor?: string,
    mime?: any,
    /**
      * 互联网是否公开，如果公开的权限是什么
      */
    netPermissions?: AtomPermission[];
    /**
     * 外部邀请的用户权限
     */
    inviteUsersPermissions?: { userid: string, permissions: AtomPermission[] }[];
    /**
     * 空间成员权限，
     * 可以指定角色，也可以指定具体的人
     */
    memberPermissions?: { roleId?: string, userid?: string, permissions: AtomPermission[] }[];
    isAllow?(...ps: AtomPermission[]): boolean;
    /**
     * 是否能编辑
     */
    isCanEdit?: boolean;
    getSubItems?(): Promise<LinkPageItem[]>;
    getItem?(): Partial<LinkPageItem>;
    speak?: 'more' | 'only' | 'unspeak';
    speakDate?: Date,
    cover?: { abled: boolean, url: string, thumb: string, top: number },
    plain?: string,
    thumb?: ResourceArguments,
    deletedDate?: Date,
    checkedHasChilds?: boolean;
    willLoadSubs?: boolean;
    subCount?: number;
    spread?: boolean,
    childs?: (LinkPageItem & T)[]
    browse?: { count: number, users: string[] }
    edit?: { count?: number, users: string[] }
    like?: { count?: number, users?: string[] }
}

export interface LinkWs {
    id: string
    sn: number
    createDate: Date
    creater: string
    owner: string
    url: string
    resolve(url: string | { pageId?: string | number, elementUrl?: string }): string
    isWsUrl(url: string): boolean
    text: string
    icon: IconArguments
    cover: IconArguments
    datasource: 'private-clound' | 'public-clound' | 'private-local'
    accessWorkspace?: 'none' | 'embed';
    /**
     * 0:不公开 
     * 1:公开
    */
    access: number;
    accessProfile: {
        disabledJoin: boolean,
        checkJoinProtocol: boolean,
        joinProtocol: string
    }
    aiConfig: {
        text?: WsConsumeType,
        image?: WsConsumeType,
        embedding?: WsConsumeType,
        disabled?: boolean,

        aiSearch?: boolean,
        esSearch?: boolean,
        seoSearch?: boolean,
    }
    /**
     * 创建文档时的初始配置
     */
    createPageConfig: {
        isFullWidth: boolean,
        smallFont: boolean,
        nav: boolean,
        autoRefPages: boolean,
        autoRefSubPages: boolean
    };
    roles: {
        id: string,
        text: string,
        color: string,
        permissions: AtomPermission[],
        icon?: IconArguments
    }[]
    member: {
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
        workspaceId: string;
        avatar: IconArguments;
        cover: IconArguments;
        totalScore: number;
    };
    isMember: boolean
    publishConfig: {
        abled: boolean,
        allowSearch: boolean,
        defineNavMenu: boolean,
        navMenus: WorkspaceNavMenuItem[],
        defineContent: boolean,
        isFullWidth: boolean,
        smallFont: boolean,
        contentTheme: 'default' | 'none' | 'wiki',
        defineBottom: boolean
    }
    isManager: boolean
    isOwner: boolean
    getWsRobots(): Promise<RobotInfo[]>
    isPubSite: boolean
    isPubSiteDefineBarMenu: boolean
    isPubSiteHideMenu: boolean
    slnSpread: boolean
}

export type WorkspaceNavMenuItem = {
    id: string,
    date?: number,
    userid?: string,
    text: string,
    remark?: string,
    type: 'logo' | 'text' | 'link',
    pic?: ResourceArguments,
    icon?: IconArguments,
    childs?: WorkspaceNavMenuItem[],
    urlType?: 'page' | 'url',
    url?: string,
    pageId?: string,
    pageText?: string,
    spread?: boolean
}

export function getPageIcon(item: LinkPageItem, defaultIcon?: SvgrComponent) {
    if (item?.icon) return item.icon;
    if (!item) return defaultIcon || PageSvg
    if (item.pageType == PageLayoutType.board) {
        return { name: 'bytedance-icon', code: 'chopping-board' } as IconValueType
        return { name: 'bytedance-icon', code: 'enter-the-keyboard' } as IconValueType
    }
    else if (item.pageType == PageLayoutType.doc) {
        return PageSvg
    }
    else if (item.pageType == PageLayoutType.docCard) {
        return DocCardsSvg
    }
    else if (item.pageType == PageLayoutType.textChannel) {
        return { name: 'byte', code: 'pound' } as IconValueType
        return TopicSvg
    }
    else if (item.pageType == PageLayoutType.db) {
        // return { name: 'byte', code: 'table-file' } as IconValueType
        return CollectTableSvg
    }
    return defaultIcon || PageSvg
}

export function getPageText(item: LinkPageItem) {
    if (item?.text) return item.text;
    if (!item) return lst('新页面')
    if (item.pageType == PageLayoutType.doc) {
        return lst('新页面')
    }
    else if (item.pageType == PageLayoutType.docCard) {
        return lst('宣传页')
    }
    else if (item.pageType == PageLayoutType.board) {
        return lst('白板')
    }
    else if (item.pageType == PageLayoutType.textChannel) {
        return lst('频道')
    }
    else if (item.pageType == PageLayoutType.db) {
        return lst('表格')
    }
    return lst('新页面')
}

export type PageThemeStyle = {
    /**
     * 如果是自定义，值为custom
     */
    name?: string,
    bgStyle?: {
        mode: "color" | "image" | "uploadImage" | "none" | "grad";
        color?: string;
        src?: string;
        grad?: {
            bg?: string,
            name?: string,
            x?: number,
            y?: number
        }
    }
    contentStyle?: {
        color: "dark" | "light";
        transparency: "frosted" | "solid" | "noborder" | "faded",
        bgStyle?: PageThemeStyle['bgStyle'],
        round?: number | string,
        border?: string,
        shadow?: string
    }
    coverStyle?: {
        display: 'none' | 'outside' | 'inside' | 'inside-cover' | 'inside-cover-left' | 'inside-cover-right',
        url?: string,
        thumb?: string,
        top?: 50,
        bgStyle?: PageThemeStyle['bgStyle'],
    }
}


export var PageTemplateTypeGroups: { icon: IconValueType, visible?: boolean, spread: boolean, text: string }[] = [
    {
        icon: PageSvg,
        text: '个人',
        spread: true,
        visible: true,
    },
    {
        icon: PageSvg,
        text: '社区',
        spread: true
    },
    {
        icon: PageSvg,
        text: '教育',
        spread: true,
    },
    {
        icon: PageSvg,
        text: '工作',
        spread: true

    },

    {
        icon: PageSvg,
        text: '项目',
        spread: true
    },
    {
        icon: PageSvg,
        text: '百科',
        spread: true,
    }
]

export var PageTemplateTags: MenuItem[] = [
    { text: '个人工作' },
    { text: '业余爱好' },
    { text: '旅行' },
    { text: '键康运动' },
    { text: '食品与营养' },
    { text: '个人财务' },
    { text: '住房' },
    { type: MenuItemType.divide },
    { text: '学习' },
    { text: '俱乐部' },
    { text: '职业建设' },
    { text: '教学' },
    { text: '学校申请' },
    { text: '学术研究' },
    { text: '知识库' },
    { type: MenuItemType.divide },
    { text: '公司网站' },
    { text: '人员与组织' },
    { text: '内部通讯和更新' },
    { text: '路线图和日历' },
    { text: '问题跟踪' },
    { text: '规划与目标' },
    { text: '指南' },
    { type: MenuItemType.divide },
    { text: '论坛' },
    { text: '贴子' },
    { text: '图文' },
    { type: MenuItemType.divide },
    { text: '产品' },
    { text: '营销' },
    { text: '工程' },
    { text: '设计' },
    { text: '启动' },
    { text: '运营' },
    { type: MenuItemType.divide },
    { text: '销售量' },
    { text: '招聘' },
    { text: '人力资源' },
    { text: '供应商' },
    { text: "私人" }
]