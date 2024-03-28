import { IconValueType } from "../../component/view/icon";


export type BlockGroup = {
    text: string,
    childs: BlockSelectorItem[]
}

export type BlockSelectorItem = {
    text?: string,
    pic?: JSX.Element,
    icon?: IconValueType,
    url?: string;
    description?: string,
    label?: string,
    labels?: string[],
    isLine?: boolean,
    operator?: { name: 'create', text: string },
    data?: Record<string, any>
}