

export type BlockGroup = {
    text: string,
    childs: BlockSelectorItem[]
}

export type BlockSelectorItem = {
    text?: string,
    pic?: JSX.Element,
    icon?: SvgrComponent,
    url?: string;
    description?: string,
    label?: string,
    labels?: string[],
    isLine?: boolean,
    operator?: 'openDataGridTemplate',
    link?:{name:'create',text:string}
}