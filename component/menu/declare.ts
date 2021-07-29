export type MenuItemType<T = string> = {
    name?: T,
    type?: MenuItemTypeValue,
    text?: string,
    icon?: string | SvgrComponent | JSX.Element,
    label?: string,
    childs?: MenuItemType[],
    value?: string,
    checked?: boolean,
    disabled?: boolean,
    /**
     * 备注
     */
    remark?: string
}
export enum MenuItemTypeValue {
    divide = 1,
    text = 2,
    item = 3,
    switch = 4
}
