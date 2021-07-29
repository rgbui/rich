import React, { CSSProperties } from "react";
import { Singleton } from "../../extensions/Singleton";
import { SyExtensionsComponent } from "../../extensions/sy.component";
import { PopoverPosition, Rect } from "../../src/common/point";
import { MenuBox } from "./box";
import { MenuItemType, MenuItemTypeValue } from "./declare";

class MenuPanel<T> extends SyExtensionsComponent {
    open(pos: PopoverPosition, menus: MenuItemType<T>[]) {
        this.menus = menus;
        this.visible = true;
        this.forceUpdate(() => {
            if (this.mb)
                this.mb.open(pos);
        })
    }
    visible: boolean = false;
    onClose() {
        this.close();
        this.emit('close');
    }
    close() {
        this.visible = false;
        this.forceUpdate();
    }
    onSelect(item: MenuItemType<T>, event: MouseEvent) {
        if (item.type == MenuItemTypeValue.item) {
            this.close();
        }
        this.emit('select', item, event);
    }
    menus: MenuItemType<T>[] = [];
    mb: MenuBox;
    render() {
        return this.visible && <div className='shy-menu-panel'>
            <div className='shy-menu-mask' onMouseDown={e => this.onClose()}></div>
            <MenuBox ref={e => this.mb = e} select={(item, event) => this.onSelect(item as any, event)} items={this.menus as any} deep={0}></MenuBox>
        </div>
    }
}
interface MenuPanel<T> {
    on(name: 'error', fn: (error: Error) => void);
    only(name: 'error', fn: (error: Error) => void);
    emit(name: 'error', error: Error);
    on(name: 'select', fn: (item: MenuItemType<T>, event: MouseEvent) => void);
    only(name: 'select', fn: (item: MenuItemType<T>, event: MouseEvent) => void);
    emit(name: 'select', item: MenuItemType<T>, event: MouseEvent);
    only(name: 'close', fn: () => void);
    emit(name: 'close');
}
export async function useSelectMenuItem<T = string>(pos: PopoverPosition, menus: MenuItemType<T>[]) {
    var menuPanel = await Singleton<MenuPanel<T>>(MenuPanel);
    return new Promise((resolve: (data: { item: MenuItemType<T>, event: MouseEvent }) => void, reject) => {
        menuPanel.open(pos, menus);
        menuPanel.only('select', (item, event) => {
            resolve({ item, event });
        });
        menuPanel.only('error', (error: Error) => {
            reject(error);
        });
        menuPanel.only('close', () => {
            resolve(null);
        });
    })
}