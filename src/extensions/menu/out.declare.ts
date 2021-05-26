export type BlockMenuItem = {
    name?: BlockMenuAction,
    type?: 'devide' | 'text' | 'option',
    text?: string,
    icon?: string | SvgrComponent,
    label?: string,
    childs?: BlockMenuItem[]
}

export enum BlockMenuAction {
    delete,
    copy,
    trun,
    trunIntoPage,
    moveTo,
    link,
    comment,
    color
}