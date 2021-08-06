import { IconArguments } from "../icon/declare"



export type AtSelectorItem = {
    text: string,
    childs: { url: string, text: string, label?: string, args?: Record<string, any> }[]
}


export type LinkPage = {
    id: string;
    text: string;
    icon?: IconArguments
}