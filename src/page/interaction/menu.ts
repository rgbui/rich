import { Page } from "..";
import { BlockMenu } from "../../extensions/menu/menu";

export function PageBlockMenu(page: Page, menu: BlockMenu) {
    menu.on('error', err => page.onError(err));
    menu.on('select', (item, event) => {

    })
}