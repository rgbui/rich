export type BlockMenuItem = {
    name?: BlockMenuAction,
    type?: 'devide' | 'text' | 'option',
    text?: string,
    icon?: string | SvgrComponent | JSX.Element,
    label?: string,
    childs?: BlockMenuItem[],
    value?: string
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