import { PageSvg, TopicSvg, CollectTableSvg, DocCardsSvg } from "../../component/svgs";
import { IconValueType } from "../../component/view/icon";
import { IconArguments, ResourceArguments } from "../../extensions/icon/declare";
import { AtomPermission } from "./permission";

export enum PageLayoutType {
    /**
     * 文档
     */
    doc = 1,
    docCard = 2,
    //#region db
    db = 20,
    formView = 21,
    recordView = 22,
    /**
     * 从表里选择一些数据的页面窗体
     */
    dbPickRecord = 23,
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

export enum PageLayout {
    page = 1,//类似notion的网页版  题头图
    content = 2, //类似网页内容 设置背景色

    content13 = 3,//类似网页内容 1:3  可以设置背景色 ，内容可适明，可不透明
    content31 = 4,//类似网页内容 3:1
    content121 = 5,//类似网页内容 1:2:1
    content111 = 6,//类似网页内容 1:1:1

    contentTable = 10, //内容表格，如excel展示那样
}



export interface LinkPageItem {
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
    speak?: 'more' | 'only';
    speakDate?: Date,
    textChannelMode?: 'chat' | 'weibo' | 'ask' | 'tieba'

    cover?: { abled: boolean, url: string, thumb: string, top: number },
    plain?: string,
    thumb?: ResourceArguments,

}

export interface LinkWs {
    id: string
    sn: number
    createDate: Date
    creater: string
    owner: string
    url: string
    resolve(url: string | { pageId?: string | number, elementUrl?: string }): string
    text: string
    icon: IconArguments
    cover: IconArguments
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
        defineNavMenu: boolean,
        navMenus: WorkspaceNavMenuItem[],
        defineContent: boolean,
        contentTheme: 'default' | 'none' | 'wiki',
        defineBottom: boolean
    }
}

export type WorkspaceNavMenuItem = {
    id: string,
    date?: number,
    userid?: string,
    text: string,
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
        return PageSvg
    }
    else if (item.pageType == PageLayoutType.doc) {
        return PageSvg
    }
    else if (item.pageType == PageLayoutType.docCard) {
        return DocCardsSvg
    }
    else if (item.pageType == PageLayoutType.textChannel) {
        return TopicSvg
    }
    else if (item.pageType == PageLayoutType.db) {
        return CollectTableSvg
    }
    return defaultIcon || PageSvg
}


export function getPageText(item: LinkPageItem) {
    if (item?.text) return item.text;
    if (!item) return '';
    if (item.pageType == PageLayoutType.doc) {
        return '新页面'
    }
    else if (item.pageType == PageLayoutType.board) {
        return '白板'
    }
    else if (item.pageType == PageLayoutType.textChannel) {
        return '频道'
    }
    else if (item.pageType == PageLayoutType.db) {
        return '表格'
    }
    return '新页面'
}
export var PageTemplateTypeGroups: { icon: IconValueType, visible?: boolean, spread: boolean, text: string, childs: { text: string, visible?: boolean }[] }[] = [
    {
        icon: PageSvg,
        text: '个人',
        spread: true,
        visible: true,
        childs: [
            { text: '个人工作' },
            { text: '业余爱好' },
            { text: '旅行' },
            { text: '键康运动' },
            { text: '食品与营养' },
            { text: '个人财务' },
            { text: '职业建设' },
            { text: '住房' }
        ]
    },
    {
        icon: PageSvg,
        text: '教育',
        spread: true,
        childs: [
            { text: '学习' },
            { text: '俱乐部' },
            { text: '职业建设' },
            { text: '教学' },
            { text: '学校申请' },
            { text: '学术研究' }
        ]
    },
    {
        icon: PageSvg,
        text: '工作',
        spread: true,
        childs: [
            { text: '产品' },
            { text: '营销' },
            { text: '工程' },
            { text: '设计' },
            { text: '启动' },
            { text: '运营' },
            { text: '销售量' },
            { text: '招聘' },
            { text: '人力资源' },
            { text: '供应商' },
            { text: "私人" }
        ]
    },
    {
        icon: PageSvg,
        text: '社区',
        spread: true,
        childs: [
            { text: '论坛' },
            { text: '贴子' },
            { text: '图文' }
        ]
    },
    {
        icon: PageSvg,
        text: '项目',
        spread: true,
        childs: [
            { text: '路线图和日历' },
            { text: '问题跟踪' },
            { text: '规划与目标' },
            { text: '指南' }
        ]
    },
    {
        icon: PageSvg,
        text: '百科',
        spread: true,
        childs: [
            { text: '知识库' },
            { text: '公司网站' },
            { text: '人员与组织' },
            { text: '内部通讯和更新' }
        ]
    }
]