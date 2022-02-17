import { Block } from "../../../src/block"


export enum ExcuteScope {
    none=0,
    page = 1,
    dataRow = 2,
    pageForm = 3
}

export type ActionScope = {
    type: ExcuteScope
}
export type ActionFlowArgType = {
    name: string,
}
export type ActionFlowType = {
    id?: string,
    url: string,
    text: string,
    args: ActionFlowArgType[];
    render?(actionFlow: ActionFlowType): JSX.Element
}

export async function ExcuteAction(options:{block:Block,scope:Record<string,any>,actionScope:ActionScope,actions:ActionFlowType[]})
{
    
}