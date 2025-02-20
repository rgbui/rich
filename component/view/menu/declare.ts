import { CSSProperties } from "react"
import { PopoverPosition } from "../../popover/position"
import { IconValueType } from "../icon"
import { OverlayPlacement } from "../tooltip"
import { MenuItemView } from "./item"

export type MenuItem<T = string> = {
    name?: T,
    warn?: boolean,
    type?: MenuItemType,
    text?: string,
    icon?: IconValueType,
    overlay?: JSX.Element | string,
    placement?: OverlayPlacement,
    renderIcon?: (item: MenuItem<T>, view?: MenuItemView) => JSX.Element,
    render?: (item: MenuItem<T>, view?: MenuItemView) => JSX.Element,
    renderContent?: (item: MenuItem<T>, view?: MenuItemView) => JSX.Element,
    iconSize?: number,
    iconClassName?: string | (string[]),
    label?: string,
    checkLabel?: boolean,
    forceHasChilds?: boolean,
    childs?: MenuItem<T>[],
    childsPos?: PopoverPosition,
    childsStyle?: CSSProperties,
    options?: MenuItem<T>[],
    cacOptions?: (items: MenuItem[], item: MenuItem<T>) => Promise<MenuItem<T>[]>,
    optionIconSize?: number,
    optionIconClassName?: string | (string[]),
    /**
     * 当type为 MenuItemType.select 时有效
     */
    selectDropWidth?: number;
    block?: boolean,
    value?: any,
    iconName?: string,
    checked?: boolean,
    disabled?: boolean,
    /**
     * 备注
     */
    remark?: string,
    param?: any,
    /**
     * 只有在type为 MenuItemType.help 时才有效
     */
    url?: string,
    /**
     * 只有在type为 MenuItemType.help 时才有效
     */
    helpInline?: boolean,
    /**
     * 增加一个tip
     */
    helpText?: string,
    helpUrl?: string,
    helpAlign?: 'left' | 'right',
    visible?: boolean | ((items: MenuItem[], item: MenuItem) => boolean),
    drag?: boolean,
    btns?: {
        overlay?: JSX.Element,
        placement?: OverlayPlacement,
        icon: string | SvgrComponent | JSX.Element,
        name: string
    }[],
    buttonClick?: 'select' | 'click',
    /**
     * 值发生变化，是否主动的更新显示menu item
     */
    updateMenuPanel?: boolean,
    containerHeight?: number,
    data?: any,
    placeholder?: string,
    userid?: string,
    /**
     * 用户的头像size
     */
    size?: number,
    /**
     * 正常触发select时，菜单会关闭，
     * 如果设置为true，则走input传递的方法
     * 菜单不会关闭
     */
    selectInput?: boolean
}

export enum MenuItemType {
    divide = 1,
    text = 2,
    item = 3,
    switch = 4,
    input = 5,
    inputTitleAndIcon = 15,
    button = 6,
    buttonOptions = 16,
    select = 7,
    drag = 8,
    custom = 9,
    container = 10,
    color = 11,
    gap = 12,
    user = 13,
    help = 14
}
