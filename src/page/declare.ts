import { PageSvg, TopicSvg, CollectTableSvg, DocCardsSvg } from "../../component/svgs";
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
    } else if (item.pageType == PageLayoutType.textChannel) {
        return '频道'
    } else if (item.pageType == PageLayoutType.db) {
        return '表格'
    }
    return '新页面'
}