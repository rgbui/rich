import { PopoverPosition } from "../../../extensions/popover/position"
import { OverlayPlacement } from "../tooltip"
import { MenuItemView } from "./item"

export type MenuItem<T = string> = {
    name?: T,
    type?: MenuItemType,
    text?: string,
    icon?: string | SvgrComponent | JSX.Element,
    overlay?: JSX.Element|string,
    placement?: OverlayPlacement,
    renderIcon?: (item: MenuItem<T>, view?: MenuItemView) => JSX.Element,
    render?: (item: MenuItem<T>, view?: MenuItemView) => JSX.Element,
    iconSize?: number,
    label?: string,
    checkLabel?: boolean,
    forceHasChilds?:boolean,
    childs?: MenuItem<T>[],
    childsPos?:PopoverPosition,
    options?: MenuItem<T>[],
    value?: any,
    checked?: boolean,
    disabled?: boolean,
    /**
     * 备注
     */
    remark?: string,
    param?: any,
    url?: string,
    visible?: boolean|((items:MenuItem[],item:MenuItem)=>boolean),
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
    updateMenuPanel?:boolean,
    containerHeight?:number,
    data?:any
}
export enum MenuItemType {
    divide = 1,
    text = 2,
    item = 3,
    switch = 4,
    input = 5,
    button = 6,
    select = 7,
    drag = 8,
    custom = 9,
    container = 10,
    color=11
}
