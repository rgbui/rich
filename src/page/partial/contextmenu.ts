
import React from "react";
import { Page } from "..";
import { useSelectMenuItem } from "../../../component/view/menu";
import { MenuItemType, MenuItemTypeValue } from "../../../component/view/menu/declare";
import { BlockDirective } from "../../block/enum";
import { Point } from "../../common/vector/point";

export class PageContextmenu {
    async onGetContextMenus(this: Page) {
        if (this.isBoard) return this.onGetBoardContextMenus();
        var items: MenuItemType<BlockDirective | string>[] = [];
        return items;
    }
    async onGetBoardContextMenus(this: Page) {
        var items: MenuItemType<BlockDirective | string>[] = [];
        items.push({ type: MenuItemTypeValue.switch, text: '编辑保护', name: 'edit-prodict' });
        items.push({ type: MenuItemTypeValue.divide });
        items.push({ name: 'add-favourite', text: '星标' });
        items.push({ name: 'copy-link', text: '复制链接' })
        items.push({ type: MenuItemTypeValue.divide });
        items.push({ name: 'show-all', text: '显示所有' });
        items.push({ name: 'show-grid', text: '显示网格' })
        return items;
    }
    async onClickContextMenu(this: Page, item: MenuItemType<BlockDirective | string>, event: MouseEvent) {
        if (this.isBoard) return this.onClickBoardContextMenu(item, event);
        switch (item.name) {

        }
    }
    async onClickBoardContextMenu(this: Page, item: MenuItemType<BlockDirective | string>, event: MouseEvent) {
        switch (item.name) {

        }
    }
    async onContextMenu(this: Page, event: React.MouseEvent | MouseEvent) {
        var re = await useSelectMenuItem(
            { roundPoint: Point.from(event) },
            await this.onGetContextMenus()
        );
        if (re) {
            await this.onClickContextMenu(re.item, re.event);
        }
    }
}