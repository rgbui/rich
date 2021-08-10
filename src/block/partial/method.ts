import { Block } from "..";
import { MenuItemType, MenuItemTypeValue } from "../../../component/menu/declare";
import { BlockDirective } from "../enum";
import duplicate from "../../assert/svg/duplicate.svg";
import loop from "../../assert/svg/loop.svg";
import blockcolor from "../../assert/svg/blockcolor.svg";
import link from "../../assert/svg/link.svg";
import squareplus from "../../assert/svg/squareplus.svg";
import moveTo from '../../assert/svg/moveTo.svg';
import comment from "../../assert/svg/comment.svg";
import trash from "../../assert/svg/trash.svg";
import { blockStore } from "../../../extensions/block/store";
import { langProvider } from "../../../i18n/provider";
import { LangID } from "../../../i18n/declare";
export class Block$Method {
    async onGetTurnMenus(this: Block) {
        var its = blockStore.findFitTurnBlocks(this);
        return its.map(it => {
            return {
                name: BlockDirective.trun,
                text: it.text,
                icon: it.pic,
                iconSize: 22
            }
        })
    }
    async onGetContextMenus(this: Block) {
        var items: MenuItemType<BlockDirective>[] = [];
        items.push({
            name: BlockDirective.delete,
            icon: trash,
            text: langProvider.getText(LangID.menuDelete),
            label: "delete"
        });
        items.push({
            name: BlockDirective.copy,
            text: langProvider.getText(LangID.menuCopy),
            label: "ctrl+D",
            icon: duplicate
        });
        items.push({
            text: langProvider.getText(LangID.menuTurn),
            icon: loop,
            childs: await this.onGetTurnMenus()
        });
        items.push({
            name: BlockDirective.trunIntoPage,
            text: langProvider.getText(LangID.menuTurnInPage),
            icon: squareplus
        });
        items.push({
            name: BlockDirective.moveTo,
            text: langProvider.getText(LangID.menuMoveTo),
            icon: moveTo
        });
        items.push({
            name: BlockDirective.link,
            text: langProvider.getText(LangID.menuCopyLink),
            icon: link
        });
        items.push({
            type: MenuItemTypeValue.divide
        });
        items.push({
            name: BlockDirective.comment,
            text: langProvider.getText(LangID.menuComment),
            icon: comment
        });
        items.push({
            type: MenuItemTypeValue.divide
        });
        items.push({
            name: BlockDirective.color,
            text: langProvider.getText(LangID.menuColor),
            icon: blockcolor
        });
        return items;
    }
    async onClickContextMenu(this: Block, item: MenuItemType<BlockDirective>, event: MouseEvent) {
        switch (item.name) {
            case BlockDirective.delete:
                this.page.onBatchDelete([this]);
                break;
            case BlockDirective.copy:
                /**
                 * 将元素复制到服务器，
                 * 然后可以跨平台粘贴
                 */
                break;
            case BlockDirective.link:
                break;
            case BlockDirective.trun:
                this.page.onBatchTurn([this], item.value);
                break;
            case BlockDirective.trunIntoPage:
                break;
        }
    }
}