import { PageSvg, TopicSvg } from "../../component/svgs";
import { PageLayoutType } from "../../src/page/declare";
import { PagePermission } from "../../src/page/permission";
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
    getSubItems?(): Promise<LinkPageItem[]>
}

export function getPageIcon(item: LinkPageItem) {
    if (item?.icon) return item.icon;
    if (!item) return PageSvg
    if (item.pageType == PageLayoutType.board) {
        return PageSvg
    }
    else if (item.pageType == PageLayoutType.doc) {
        return PageSvg
    }
    else if (item.pageType == PageLayoutType.textChannel) {
        return TopicSvg
    }
    return PageSvg
}