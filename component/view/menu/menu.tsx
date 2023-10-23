import React, { CSSProperties } from "react";
import { MenuItem } from "./declare";
import { MenuItemView } from "./item";
import { Rect } from "../../../src/common/vector/point";

export class MenuView extends React.Component<{
    items: MenuItem[],
    style?: CSSProperties,
    input?: (item: MenuItem) => void,
    select?: (item: MenuItem, event?: MouseEvent) => void,
    click?: (item: MenuItem, event?: React.MouseEvent, name?: string) => void,

    /**
     * 使用 fixed 进行布局的元素，在一般情况下会相对于屏幕视窗来进行定位。
     * 但是如果父元素的 transform, perspective 或 filter 属性不为 none 时，position为fixed 的元素就会相对于父元素来进行定位。
     * 如果menuView处于transform不为none时，就会出现这种情况
     */
    cacRelative?: (rect: Rect) => Rect
}>{
    render() {
        var items = this.localItems || this.props.items;
        return <div className='shy-menu-view' style={{
            ...(this.props.style || {}),
        }}>{items.map((item, index) => {
            return <MenuItemView
                key={index}
                parent={this}
                item={item}
                deep={0}
                select={this.props.select}
                input={this.props.input}
                click={this.props.click}
            ></MenuItemView>
        })}
        </div>
    }
    free: boolean = false;
    onFree() {
        this.free = true;
    }
    onUnfree() {
        this.free = false;
    }
    localItems: MenuItem[];
    forceUpdateItems(items: MenuItem[]) {
        this.localItems = items;
        this.forceUpdate()
    }
}