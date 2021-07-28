import React, { CSSProperties } from "react";
import { Singleton } from "../../extensions/Singleton";
import { Point, Rect } from "../../src/common/point";
import { MenuBox } from "./box";
import { MenuItemType } from "./declare";

class MenuPanel extends React.Component {
    open(rect: Rect, menus: MenuItemType[]) {
        this.menus = menus;
    }
    menus: MenuItemType[] = [];
    render() {
        return <div className='sy-menu-panel'><div className='sy-menu-cover'></div>
            <MenuBox items={this.menus} deep={0}></MenuBox>
        </div>
    }
}

interface MenuPanel {
    on(name: 'error', fn: (error: Error) => void);
    only(name: 'error', fn: (error: Error) => void);
    emit(name: 'error', error: Error);
    on(name: 'select', fn: (item: MenuItemType, event: MouseEvent) => void);
    only(name: 'select', fn: (item: MenuItemType, event: MouseEvent) => void);
    emit(name: 'select', item: MenuItemType, event: MouseEvent);
}
export async function selectMenuItem(rect: Rect, menus: MenuItemType[]) {
    var menuPanel = await Singleton<MenuPanel>(MenuPanel);
    return new Promise((resolve, reject) => {
        menuPanel.open(rect, menus);
        menuPanel.only('select', (item, event) => {
            resolve({ item, event });
        });
        menuPanel.only('error', (error: Error) => {
            reject(error);
        });
    })
}