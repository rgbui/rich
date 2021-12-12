import { Block } from "..";
import { MenuItemType, MenuItemTypeValue } from "../../../component/view/menu/declare";
import { BlockDirective, BlockRenderRange } from "../enum";
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
import { ActionDirective, OperatorDirective } from "../../history/declare";
import { AppearAnchor } from "../appear";
import lodash from "lodash"
import { BlockUrlConstant } from "../constant";
export class Block$Event {
    /**
     * 需要继承指定可以切换的块
     * @returns 
     */
    async onGetTurnUrls() {
        return [];
    }
    async onGetTurnMenus(this: Block) {
        var urls = await this.onGetTurnUrls();
        var its = blockStore.findFitTurnBlocks(urls);
        return its.map(it => {
            return {
                name: BlockDirective.trun,
                text: it.text,
                icon: it.pic,
                url: it.url,
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
            disabled: true,
            icon: duplicate
        });
        var menus = await this.onGetTurnMenus();
        items.push({
            text: langProvider.getText(LangID.menuTurn),
            icon: loop,
            disabled: menus.length > 0 ? false : true,
            childs: menus
        });
        items.push({
            name: BlockDirective.trunIntoPage,
            text: langProvider.getText(LangID.menuTurnInPage),
            icon: squareplus,
            disabled: true
        });
        items.push({
            name: BlockDirective.moveTo,
            text: langProvider.getText(LangID.menuMoveTo),
            icon: moveTo,
            disabled: true
        });
        items.push({
            name: BlockDirective.link,
            text: langProvider.getText(LangID.menuCopyLink),
            icon: link,
            disabled: true
        });
        items.push({
            type: MenuItemTypeValue.divide
        });
        items.push({
            name: BlockDirective.comment,
            text: langProvider.getText(LangID.menuComment),
            icon: comment,
            disabled: true
        });
        items.push({
            type: MenuItemTypeValue.divide
        });
        items.push({
            name: BlockDirective.color,
            text: langProvider.getText(LangID.menuColor),
            icon: blockcolor,
            disabled: true
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
                this.page.onBatchTurn([this], (item as any).url);
                break;
            case BlockDirective.trunIntoPage:
                break;
        }
    }
    async onInputStore(this: Block, appear: AppearAnchor, value: string, at: number, end: number, action?: () => Promise<void>) {
        await this.page.onAction(ActionDirective.onInputText, async () => {
            var replaceText = lodash.get(this, appear.prop).slice(at, end);
            lodash.set(this, appear.prop, appear.textContent);
            this.page.snapshoot.record(OperatorDirective.inputStore, {
                blockId: this.id,
                start: at,
                end: end,
                text: value,
                prop: appear.prop,
                replaceText
            });
            if (typeof action == 'function') await action();
            this.changeAppear(appear);
        })
    }
   
    async onInputDeleteStore(this: Block, appear: AppearAnchor, value: string, start: number, end: number, action?: () => Promise<void>) {
        await this.page.onAction(ActionDirective.onDeleteText, async () => {
            var block = this;
            var pa = this.page;
            lodash.set(this, appear.prop, appear.textContent);
            pa.snapshoot.record(OperatorDirective.inputDeleteStore, {
                blockId: block.id,
                start,
                end,
                text: value,
                prop: appear.prop
            });
            if (typeof action == 'function') await action();
            this.changeAppear(appear);
        })
    }
    async onDelete(this: Block) {
        await this.page.onAction(ActionDirective.onDelete, async () => {
            await this.delete();
        })
    }
    async onUpdateProps(this: Block, props: Record<string, any>, range = BlockRenderRange.none) {
        await this.page.onAction(ActionDirective.onUpdateProps, async () => {
            this.updateProps(props, range);
        })
    }
    async onManualUpdateProps(this: Block, oldProps: Record<string, any>, newProps: Record<string, any>, range = BlockRenderRange.none) {
        await this.page.onAction(ActionDirective.onUpdateProps, async () => {
            this.manualUpdateProps(oldProps, newProps, range);
        })
    }
    async onKeyTab(this: Block, isBack?: boolean) {
        var list = this.closest(x => x.url == BlockUrlConstant.List);
        if (isBack) {
            if (!(list.parent && list.parent.url == BlockUrlConstant.List)) return false
        }
        else {
            var prev = list.prev;
            if (!(prev && prev.url == BlockUrlConstant.List)) return false
        }
        await this.page.onAction(ActionDirective.onKeyTab, async () => {
            if (isBack) {
                var pa = list.parent;
                var at = list.at;
                var rest = pa.blocks[pa.childKey].findAll((item, i) => i > at);
                await list.insertAfter(pa);
                await list.appendArray(rest, undefined, list.childKey)
            }
            else {
                var prev = list.prev;
                await prev.append(this, undefined, prev.childKey);
            }
        })
    }
}