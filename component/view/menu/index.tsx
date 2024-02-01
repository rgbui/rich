import React from "react";
import { PopoverPosition } from "../../popover/position";
import { Singleton } from "../../lib/Singleton";
import { EventsComponent } from "../../lib/events.component";
import { MenuBox } from "./box";
import { MenuItem } from "./declare";
import { popoverLayer } from "../../lib/zindex";
import "./style.less";

export class MenuPanel<T> extends EventsComponent {
    open(pos: PopoverPosition,
        menus: MenuItem<T>[],
        options?: {
            height?: number,
            width?: number,
            overflow?: 'auto' | 'visible'
        }) {
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
    updateItems(menus: MenuItem<T>[]) {
        this.menus = menus;
        this.forceUpdate();
    }
    visible: boolean = false;
    private options: { height?: number, width?: number, overflow?: 'auto' | 'visible' } = {};
    onClose(e: React.MouseEvent) {
        if (e) { e.stopPropagation(); e.preventDefault(); }
        setTimeout(() => {
            this.close();
            this.emit('close');
        }, 100);
    }
    close() {
        this.visible = false;
        popoverLayer.clear(g => g.obj == this || g.obj instanceof MenuBox)
        this.forceUpdate();
    }
    onSelect(item: MenuItem<T>, event: MouseEvent) {
        this.close();
        this.emit('select', item, event);
    }
    onInput(item: MenuItem<T>) {
        this.emit('input', item);
    }
    onClick(item: MenuItem<T>, event: React.MouseEvent, name: string) {
        this.emit('click', item, event, name, this);
    }
    free: boolean = false;
    onFree() {
        this.free = true;
    }
    onUnfree() {
        this.free = false;
    }
    menus: MenuItem<T>[] = [];
    mb: MenuBox;
    render() {
        return this.visible && <div className='shy-menu-panel' onContextMenu={e => { e.preventDefault() }}>
            <div className='shy-menu-mask' style={{ zIndex: popoverLayer.zoom(this) }} onMouseDown={e => this.onClose(e)}></div>
            <MenuBox parent={this}
                style={{ height: this.options.height, width: this.options.width, maxHeight: this.options.height, overflow: this.options.overflow }}
                ref={e => this.mb = e}
                input={(item) => this.onInput(item as any)}
                click={(item, ev, name) => this.onClick(item as any, ev, name)}
                select={(item, event) => this.onSelect(item as any, event)} items={this.menus as any} deep={0}></MenuBox>
        </div>
    }
}
export interface MenuPanel<T> {
    on(name: 'error', fn: (error: Error) => void);
    only(name: 'error', fn: (error: Error) => void);
    emit(name: 'error', error: Error);
    on(name: 'select', fn: (item: MenuItem<T>, event: MouseEvent) => void);
    only(name: 'select', fn: (item: MenuItem<T>, event: MouseEvent) => void);
    emit(name: 'select', item: MenuItem<T>, event: MouseEvent);
    only(name: 'input', fn: (item: MenuItem<T>) => void);
    emit(name: 'input', item: MenuItem<T>);
    only(name: 'click', fn: (item: MenuItem<T>, event: React.MouseEvent, name: string, mv: MenuPanel<T>) => void);
    emit(name: 'click', item: MenuItem<T>, event: React.MouseEvent, na: string, mv: MenuPanel<T>);
    only(name: 'close', fn: () => void);
    emit(name: 'close');
}
export async function useSelectMenuItem<T = string>(pos: PopoverPosition, menus: MenuItem<T>[], options?: {
    height?: number,
    width?: number,
    overflow?: 'auto' | 'visible',
    input?: (item: MenuItem<T>) => void,
    click?: (item: MenuItem<T>, event: React.MouseEvent, clickName: string, mp: MenuPanel<T>) => void,
    nickName?: 'second' | 'three' | 'selectBox'
}) {
    var menuPanel = await Singleton<MenuPanel<T>>(MenuPanel, options?.nickName);
    return new Promise((resolve: (data: { item: MenuItem<T>, event: MouseEvent }) => void, reject) => {
        menuPanel.open(pos, menus, options);
        menuPanel.only('select', (item, event) => {
            resolve({ item, event });
        });
        menuPanel.only('input', item => {
            if (options?.input) options?.input(item);
        });
        menuPanel.only('click', (item, e, name, mp) => {
            if (options.click) options.click(item, e, name, mp)
        })
        menuPanel.only('error', (error: Error) => {
            reject(error);
        });
        menuPanel.only('close', () => {
            resolve(null);
        });
    })
}