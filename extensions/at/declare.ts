import { PageLayoutType } from "../../src/page/declare";
import { PagePermission } from "../../src/page/permission";
import { IconArguments } from "../icon/declare"



export type AtSelectorItem = {
    text: string,
    childs: { url: string, text: string, label?: string, args?: Record<string, any> }[]
}


export type LinkPageItem = {
    id?: string;
    text?: string;
    icon?: IconArguments,
    sn?: number,
    description?: string,
    pageType?: PageLayoutType,
    url?: string,
    locker?: { userid: string, lockDate: number },
    share?: 'net' | 'nas' | 'local' ;
    permission?: PagePermission;
}