import React from "react";
import { PopoverPosition } from "../../../extensions/popover/position";
import { Singleton } from "../../lib/Singleton";
import { EventsComponent } from "../../lib/events.component";
import "./style.less";
import { MenuBox } from "./box";
import { MenuItemType, MenuItemTypeValue } from "./declare";
import { popoverLayer } from "../../lib/zindex";
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
        popoverLayer.clear(g => g.obj == this || g.obj instanceof MenuBox)
        this.forceUpdate();
    }
    onSelect(item: MenuItemType<T>, event: MouseEvent) {
        this.close();
        this.emit('select', item, event);
    }
    onUpdate(item: MenuItemType<T>) {
        this.emit('update', item);
    }
    menus: MenuItemType<T>[] = [];
    mb: MenuBox;
    render() {
        return this.visible && <div data-shy-page-unselect="true" className='shy-menu-panel'>
            <div className='shy-menu-mask' style={{ zIndex: popoverLayer.zoom(this) }} onMouseDown={e => this.onClose(e)}></div>
            <MenuBox
                style={{ height: this.options.height, maxHeight: this.options.height, overflow: this.options.overflow }}
                ref={e => this.mb = e}
                update={(item) => this.onUpdate(item as any)}
                select={(item, event) => this.onSelect(item as any, event)} items={this.menus as any} deep={0}></MenuBox>
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
    only(name: 'update', fn: (item: MenuItemType<T>) => void);
    emit(name: 'update', item: MenuItemType<T>);
    only(name: 'close', fn: () => void);
    emit(name: 'close');
}
export async function useSelectMenuItem<T = string>(pos: PopoverPosition, menus: MenuItemType<T>[], options?: {
    height?: number,
    overflow?: 'auto' | 'visible',
    update?: (item: MenuItemType<T>) => void,
    nickName?: string
}) {
    var menuPanel = await Singleton<MenuPanel<T>>(MenuPanel, options?.nickName);
    return new Promise((resolve: (data: { item: MenuItemType<T>, event: MouseEvent }) => void, reject) => {
        menuPanel.open(pos, menus, options);
        menuPanel.only('select', (item, event) => {
            resolve({ item, event });
        });
        menuPanel.only('update', item => {
            if (options?.update) options?.update(item);
        })
        menuPanel.only('error', (error: Error) => {
            reject(error);
        });
        menuPanel.only('close', () => {
            resolve(null);
        });
    })
}