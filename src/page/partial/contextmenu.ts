
import { Page } from "..";
import { useSelectMenuItem } from "../../../component/view/menu";
import { MenuItemType } from "../../../component/view/menu/declare";
import { BlockDirective } from "../../block/enum";
import { Rect } from "../../common/vector/point";

export class PageContextmenu {
    async onGetContextMenus(this: Page) {
        var items: MenuItemType<BlockDirective | string>[] = [];
        return items;
    }
    async onClickContextMenu(this: Page, item: MenuItemType<BlockDirective | string>, event: MouseEvent) {
        switch (item.name) {

        }
    }
    async onContextMenu(this: Page, event: MouseEvent) {
        var re = await useSelectMenuItem(
            { roundArea: Rect.fromEvent(event), direction: 'left' },
            await this.onGetContextMenus()
        );
        if (re) {
            await this.onClickContextMenu(re.item, re.event);
        }
    }
}