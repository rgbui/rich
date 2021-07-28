export type MenuItemType<T = string> = {
    name?: T,
    type?: 'divide' | 'text' | 'item'|"toggle",
    text?: string,
    icon?: string | SvgrComponent | JSX.Element,
    label?: string,
    childs?: MenuItemType[],
    value?: string
}
