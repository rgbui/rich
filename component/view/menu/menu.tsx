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
}> {
    render() {
        var items = this.localItems || this.props.items;
        return <div ref={e => { this.el = e }} className='shy-menu-view' style={{
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
    el: HTMLElement;
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
    focusItem: MenuItemView = null;
    onDownFocusItem() {
        var e = this.el.querySelector('.focus-hover') as HTMLElement;
        if (!e) {
            var op = this.el.querySelector('.shy-menu-box-item-option');
            if (op) e = op.parentElement;
            this.focusItem = e['data-menu-item']
        }
        else {
            e.classList.remove('focus-hover')
            var pa = e.parentElement as HTMLElement;
            var cs = Array.from(pa.children) as HTMLElement[];
            var at = cs.indexOf(e);
            var next: HTMLElement;
            for (let i = at + 1; i < cs.length; i++) {
                var gs = Array.from(cs[i].children);
                if (gs.some(g => g.classList.contains('shy-menu-box-item-option'))) {
                    next = cs[i];
                    break;
                }
            }
            if (next) {
                this.focusItem = next['data-menu-item']
            }
            else {
                this.focusItem = null;
            }
        }
        if (this.focusItem?.el) {
            this.focusItem.el.classList.add('focus-hover')
        }
    }
    onUpFocusItem() {
        var e = this.el.querySelector('.focus-hover') as HTMLElement;
        if (!e) {
            var op = this.el.querySelector('.shy-menu-box-item-option');
            if (op) e = op.parentElement;
            this.focusItem = e['data-menu-item']
        }
        else {
            e.classList.remove('focus-hover')
            var pa = e.parentElement as HTMLElement;
            var cs = Array.from(pa.children) as HTMLElement[];
            var at = cs.indexOf(e);
            var prev: HTMLElement;
            for (let i = at - 1; i >= 0; i--) {
                var gs = Array.from(cs[i].children);
                if (gs.some(g => g.classList.contains('shy-menu-box-item-option'))) {
                    prev = cs[i];
                    break;
                }
            }
            if (prev) {
                this.focusItem = prev['data-menu-item']
            }
            else {
                this.focusItem = null;
            }
        }
        if (this.focusItem) {
            this.focusItem.el.classList.add('focus-hover')
        }
    }
    async onLeftFocusItem() {
        if (this.focusItem) {
            this.focusItem.el.classList.remove('focus-hover')
            var e = this.focusItem.el.parentElement.closest('.shy-menu-box-item') as HTMLElement;
            if (e) {
                var ep = e as HTMLElement;
                this.focusItem = ep['data-menu-item'];
                this.focusItem.mouseleave(this.focusItem.props.item, null);
            }
            else this.focusItem = null;
        }
        if (this.focusItem) {
            this.focusItem.el.classList.add('focus-hover')
        }
    }
    async onRightFocusItem() {
        try {
            if (this.focusItem) {
                if (this.focusItem.hover == false) {
                    await new Promise((resolve) => {
                        this.focusItem.mouseenter(this.focusItem.props.item, null, () => resolve(null));
                    })
                }
                this.focusItem.el.classList.remove('focus-hover');
                var e = this.focusItem.el.querySelector('.shy-menu-box .shy-menu-box-item-option') as HTMLElement;
                if (e) {
                    var ep = e.parentElement as HTMLElement;
                    this.focusItem = ep['data-menu-item'];
                }
                else this.focusItem = null;
            }
            if (this.focusItem) {
                this.focusItem.el.classList.add('focus-hover')
            }
        }
        catch (ex) {
            console.error(ex);
        }
    }
    onSelectFocusItem(clear: boolean = true) {
        if (this.focusItem) {
            this.props.select(this.focusItem.props.item);
            if (clear) {
                this.focusItem.el.classList.remove('focus-hover')
                this.focusItem = null;
            }
            return true;
        }
        return false;
    }
}