import { PageSvg, TopicSvg } from "../../component/svgs";
import { PageLayoutType } from "../../src/page/declare";
import { AtomPermission, PagePermission } from "../../src/page/permission";
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
    locker?: { userid: string, lockDate: number },
    share?: 'net' | 'nas' | 'local';
    permission?: PagePermission;
    getPermissons?(): AtomPermission[];
    getSubItems?(): Promise<LinkPageItem[]>;
    getItem?():Partial<LinkPageItem>;
    speak?: 'more' | 'only';
    speakDate?: Date,
    textChannelMode?: 'chat' | 'weibo' | 'ask' | 'tieba'
}

export function getPageIcon(item: LinkPageItem) {
    if (item?.icon) return item.icon;
    if (!item) return PageSvg
    if (item.pageType == PageLayoutType.board) {
        return PageSvg
    }
    else if (item.pageType == PageLayoutType.doc || item.pageType == PageLayoutType.blog) {
        return PageSvg
    }
    else if (item.pageType == PageLayoutType.textChannel) {
        return TopicSvg
    }
    return PageSvg
}