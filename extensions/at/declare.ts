import { PageLayoutType } from "../../src/page/declare";
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
    pageType?: PageLayoutType
}