import React from "react";
import { PopoverPosition } from "../../../extensions/popover/position";
import { Singleton } from "../../lib/Singleton";
import { EventsComponent } from "../../lib/events.component";
import "./style.less";
import { MenuBox } from "./box";
import { MenuItemType, MenuItemTypeValue } from "./declare";
import { LayerWield, popoverLayer } from "../../lib/zindex";
class MenuPanel<T> extends EventsComponent {
    open(pos: PopoverPosition, menus: MenuItemType<T>[], options?: { height?: number, overflow?: 'auto' | 'visible' }) {
        this.menus = menus;
        this.visible = true;
        this.options = {};
        if (options) {
            Object.assign(this.options, options);
        }
        this.forceUpdate(() => {
            if (this.mb) this.mb.open(pos);
        })
    }
    visible: boolean = false;
    private options: { height?: number, overflow?: 'auto' | 'visible' } = {};
    onClose(e: React.MouseEvent) {
        if (e) e.stopPropagation();
        this.close();
        this.emit('close');
    }
    close() {
        this.visible = false;
        popoverLayer.clear(LayerWield.menuBox, LayerWield.menuMask)
        this.forceUpdate();
    }
    onSelect(item: MenuItemType<T>, event: MouseEvent) {
        if (item.type == MenuItemTypeValue.item || typeof item.type == 'undefined') {
            this.close();
        }
        this.emit('select', item, event);
    }
    menus: MenuItemType<T>[] = [];
    mb: MenuBox;
    render() {
        return this.visible && <div className='shy-menu-panel'>
            <div className='shy-menu-mask' style={{ zIndex: popoverLayer.zoom(LayerWield.menuMask) }} onMouseDown={e => this.onClose(e)}></div>
            <MenuBox style={{ height: this.options.height, maxHeight: this.options.height, overflow: this.options.overflow }} ref={e => this.mb = e} select={(item, event) => this.onSelect(item as any, event)} items={this.menus as any} deep={0}></MenuBox>
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
export async function useSelectMenuItem<T = string>(pos: PopoverPosition, menus: MenuItemType<T>[], options?: { height?: number, overflow?: 'auto' | 'visible' }) {
    var menuPanel = await Singleton<MenuPanel<T>>(MenuPanel);
    return new Promise((resolve: (data: { item: MenuItemType<T>, event: MouseEvent }) => void, reject) => {
        menuPanel.open(pos, menus, options);
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