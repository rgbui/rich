import { CollectTableSvg, PageSvg, TopicSvg } from "../../component/svgs";
import { PageLayoutType } from "../../src/page/declare";
import { AtomPermission } from "../../src/page/permission";
import { IconArguments } from "../icon/declare"

export type AtSelectorItem = {
    text: string,
    childs: {
        url: string,
        text: string,
        label?: string,
        args?: Record<string, any>
    }[]
}


export interface LinkPageItem {
    id?: string;
    text?: string;
    icon?: IconArguments,
    sn?: number,
    description?: string,
    pageType?: PageLayoutType,
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
    isCanEdit?:boolean;

    getSubItems?(): Promise<LinkPageItem[]>;
    getItem?(): Partial<LinkPageItem>;
    speak?: 'more' | 'only';
    speakDate?: Date,
    textChannelMode?: 'chat' | 'weibo' | 'ask' | 'tieba'

}

export function getPageIcon(item: LinkPageItem, defaultIcon?: SvgrComponent) {
    if (item?.icon) return item.icon;
    if (!item) return defaultIcon || PageSvg
    if (item.pageType == PageLayoutType.board) {
        return PageSvg
    }
    else if (item.pageType == PageLayoutType.doc || item.pageType == PageLayoutType.blog) {
        return PageSvg
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
    if (item.pageType == PageLayoutType.doc || item.pageType == PageLayoutType.blog) {
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