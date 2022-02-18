export type MenuItemType<T = string> = {
    name?: T,
    type?: MenuItemTypeValue,
    text?: string,
    icon?: string | SvgrComponent | JSX.Element,
    iconSize?: number,
    label?: string,
    childs?: MenuItemType<T>[],
    value?: string,
    checked?: boolean,
    disabled?: boolean,
    /**
     * 备注
     */
    remark?: string,
    param?: any,
    url?:string
}
export enum MenuItemTypeValue {
    divide = 1,
    text = 2,
    item = 3,
    switch = 4,
    input=5,
    button=6
}
