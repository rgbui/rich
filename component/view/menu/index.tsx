import React from "react";
import { PopoverPosition } from "../../popover/position";
import { Singleton, SingletonGet } from "../../lib/Singleton";
import { EventsComponent } from "../../lib/events.component";
import { MenuBox } from "./box";
import { MenuItem, MenuItemType } from "./declare";
import { popoverLayer } from "../../lib/zindex";
import { S } from "../../../i18n/view";
import "./style.less";

export class MenuPanel<T> extends EventsComponent {
    mask: boolean = true;
    open(pos: PopoverPosition,
        menus: MenuItem<T>[],
        options?: {
            height?: number,
            width?: number,
            overflow?: 'auto' | 'visible',
            mask?: boolean,
            ele?: HTMLElement
        }) {
        if (menus[0] && menus[0].type == MenuItemType.divide) {
            menus.shift();
        }
        if (menus[menus.length - 1] && menus[menus.length - 1].type == MenuItemType.divide) {
            menus.pop();
        }
        this.menus = menus;
        this.visible = true;
        this.options = {};
        if (options) {
            Object.assign(this.options, options);
            if (typeof options.mask == 'boolean') this.mask = options.mask;
            else this.mask = true;
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
        if (e) {
            e.stopPropagation();
            e.preventDefault();
        }
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
        this.emit('input', item, this);
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
            {this.mask && <div className='shy-menu-mask' style={{ zIndex: popoverLayer.zoom(this) }} onMouseDown={e => this.onClose(e)}></div>}
            {this.menus.length == 0 && <div className="flex-center remark f-14 gap-h-5"><S>没有可选项</S></div>}
            <MenuBox parent={this}
                style={{ width: this.options.width, maxHeight: this.options.height, overflow: this.options.overflow }}
                ref={e => this.mb = e}
                input={(item) => this.onInput(item as any)}
                click={(item, ev, name) => this.onClick(item as any, ev, name)}
                select={(item, event) => this.onSelect(item as any, event)}
                items={this.menus as any}
                deep={0}></MenuBox>
        </div>
    }
    componentDidMount(): void {
        document.addEventListener('mousedown', this.otherClose);
    }
    componentWillUnmount(): void {
        document.removeEventListener('mousedown', this.otherClose);
    }
    otherClose = (e: MouseEvent) => {
        if (this.mask !== true) {
            var ele = e.target as HTMLElement;
            var sp = ele.closest('.shy-menu-panel');
            if (sp) return;
            this.close();
            this.emit('close');
        }
    }
}
export interface MenuPanel<T> {
    on(name: 'error', fn: (error: Error) => void);
    only(name: 'error', fn: (error: Error) => void);
    emit(name: 'error', error: Error);
    on(name: 'select', fn: (item: MenuItem<T>, event: MouseEvent) => void);
    only(name: 'select', fn: (item: MenuItem<T>, event: MouseEvent) => void);
    emit(name: 'select', item: MenuItem<T>, event: MouseEvent);
    only(name: 'input', fn: (item: MenuItem<T>, mv: MenuPanel<T>) => void);
    emit(name: 'input', item: MenuItem<T>, mv: MenuPanel<T>);
    only(name: 'click', fn: (item: MenuItem<T>, event: React.MouseEvent, name: string, mv: MenuPanel<T>) => void);
    emit(name: 'click', item: MenuItem<T>, event: React.MouseEvent, na: string, mv: MenuPanel<T>);
    only(name: 'close', fn: () => void);
    emit(name: 'close');
}
export async function useSelectMenuItem<T = string>(pos: PopoverPosition, menus: MenuItem<T>[], options?: {
    height?: number,
    width?: number,
    overflow?: 'auto' | 'visible',
    mask?: boolean,
    input?: (item: MenuItem<T>, mp: MenuPanel<T>) => void,
    click?: (item: MenuItem<T>, event: React.MouseEvent, clickName: string, mp: MenuPanel<T>) => void,
    nickName?: 'second' | 'three' | 'selectBox',
    range?: HTMLElement
}) {
    var menuPanel = await Singleton<MenuPanel<T>>(MenuPanel, options?.nickName);
    menuPanel.open(pos, menus, options);
    menuPanel.only('input', (item, p) => {
        if (options?.input) options?.input(item, p);
    });
    menuPanel.only('click', (item, e, name, mp) => {
        if (options.click) options.click(item, e, name, mp)
    })
    return new Promise((resolve: (data: { item: MenuItem<T>, event: MouseEvent }) => void, reject) => {
        menuPanel.only('select', (item, event) => {
            if (item) resolve({ item, event });
            else resolve(null);
        });
        menuPanel.only('error', (error: Error) => {
            reject(error);
        });
        menuPanel.only('close', () => {
            resolve(null);
        });
    })
}

/**
 * 主动关闭菜单
 * 当按捷键时，需要主动关闭菜单
 * @param nickName 
 */
export async function closeSelectMenutItem<T = string>(nickName?: 'second' | 'three' | 'selectBox') {
    var menuPanel = SingletonGet<MenuPanel<T>>(MenuPanel, nickName);
    if (menuPanel) {
        if (menuPanel.visible == true) {
            menuPanel.close();
        }
    }
}