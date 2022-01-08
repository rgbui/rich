import { Page } from "..";
import { MenuItemType } from "../../../component/view/menu/declare";
import { BlockDirective } from "../../block/enum";
export class PageContextmenu {
    async onGetContextMenus(this: Page) {
        var items: MenuItemType<BlockDirective>[] = [];
        return items;
    }
    async onClickContextMenu(this: Page, item: MenuItemType<BlockDirective>, event: MouseEvent) {
        switch (item.name) {

        }
    }
}