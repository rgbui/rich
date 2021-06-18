import { Page } from "..";
import { Block } from "../../block";
import { BlockMenu } from "../../extensions/menu/menu";
import { BlockMenuAction } from "../../extensions/menu/out.declare";

export function PageBlockMenu(page: Page, menu: BlockMenu) {
    menu.on('error', err => page.onError(err));
    menu.on('select', (blocks: Block[], item, event) => {
        switch (item.name) {
            case BlockMenuAction.delete:
                this.onBatchDelete(blocks);
                break;
            case BlockMenuAction.copy:
                /**
                 * 将元素复制到服务器，
                 * 然后可以跨平台粘贴
                 */
                break;
            case BlockMenuAction.link:
                break;
            case BlockMenuAction.trun:
                this.onBatchTurn(blocks, item.value);
                break;
            case BlockMenuAction.trunIntoPage:
                break;
        }
    })
}