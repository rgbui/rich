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
import { ActionDirective } from "../../history/declare";
import { AppearAnchor } from "../appear";
import { Point, Rect } from "../../common/vector/point";
import { useSelectMenuItem } from "../../../component/view/menu";

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
        if (this.isFreeBlock) {
            return await this.onGetBoardContextMenus()
        }
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
            childs: menus.map(m => {
                return {
                    ...m,
                }
            })
        });
        // items.push({
        //     name: BlockDirective.trunIntoPage,
        //     text: langProvider.getText(LangID.menuTurnInPage),
        //     icon: squareplus,
        //     disabled: true
        // });
        // items.push({
        //     name: BlockDirective.moveTo,
        //     text: langProvider.getText(LangID.menuMoveTo),
        //     icon: moveTo,
        //     disabled: true
        // });
        items.push({
            name: BlockDirective.link,
            text: langProvider.getText(LangID.menuCopyLink),
            icon: link,
            disabled: true
        });
        // items.push({
        //     type: MenuItemTypeValue.divide
        // });
        // items.push({
        //     name: BlockDirective.comment,
        //     text: langProvider.getText(LangID.menuComment),
        //     icon: comment,
        //     disabled: true
        // });
        // items.push({
        //     type: MenuItemTypeValue.divide
        // });
        // items.push({
        //     name: BlockDirective.color,
        //     text: langProvider.getText(LangID.menuColor),
        //     icon: blockcolor,
        //     disabled: true
        // });
        return items;
    }
    async onGetBoardContextMenus(this: Block) {
        var items: MenuItemType<BlockDirective | string>[] = [];
        items.push({
            name: BlockDirective.bringToFront,
            text: '移到前面'
        });
        items.push({
            name: BlockDirective.sendToBack,
            text: '移到最下面'
        });
        items.push({
            type: MenuItemTypeValue.divide
        });
        items.push({
            name: this.locker?.lock == false ? BlockDirective.lock : BlockDirective.unlock,
            text: this.locker?.lock == false ? '解锁' : '锁住',
        });
        items.push({
            type: MenuItemTypeValue.divide
        });
        items.push({
            name: 'copy',
            text: '复制'
        });
        items.push({
            name: 'paste',
            text: '粘贴'
        });
        items.push({
            type: MenuItemTypeValue.divide
        });
        items.push({
            name: BlockDirective.delete,
            icon: trash,
            text: langProvider.getText(LangID.menuDelete),
            label: "delete"
        });
        return items;
    }
    async onContextmenu(this: Block, event: MouseEvent) {
        var re = await useSelectMenuItem(
            this.isFreeBlock ? { roundPoint: Point.from(event) } : { roundArea: Rect.fromEvent(event), direction: 'left' },
            await this.onGetContextMenus()
        );
        if (re) {
            await this.onClickContextMenu(re.item, re.event);
        }
    }
    async onClickContextMenu(this: Block, item: MenuItemType<BlockDirective | string>, event: MouseEvent) {
        if (this.isFreeBlock) {
            return await this.onClickBoardContextMenu(item, event);
        }
        switch (item.name) {
            case BlockDirective.delete:
                this.page.onBatchDelete([this]);
                break;
            case BlockDirective.copy:
                /**
                 * 复制块
                 */
                this.onAction(ActionDirective.onCopyBlock, async () => {
                    var d = this.cloneData();
                    var pa = this.parent;
                    await pa.appendBlock(d, this.at, this.parentKey);
                });
                break;
            case BlockDirective.link:
                
                break;
            case BlockDirective.trun:
                this.page.onBatchTurn([this], (item as any).url);
                break;
            case BlockDirective.trunIntoPage:
                break;
            case BlockDirective.comment:
                break;
            case BlockDirective.color:
                break;
        }
    }
    async onClickBoardContextMenu(this: Block, item: MenuItemType<BlockDirective | string>, event: MouseEvent) {
        switch (item.name) {
            case BlockDirective.lock:
                this.onLock(true);
                break;
            case BlockDirective.unlock:
                this.onLock(false);
                break;
            case BlockDirective.bringToFront:
                this.onZIndex('top');
                break;
            case BlockDirective.sendToBack:
                this.onZIndex('bottom');
                break;
            case BlockDirective.delete:
                this.page.onBatchDelete([this]);
                break;
        }
    }
    async onInputText(this: Block, options: {
        appear: AppearAnchor,
        oldValue: string,
        oldOffset: number,
        newValue: string,
        newOffset: number
        action?: () => Promise<void>
    }) {
        var { appear, oldValue, newValue, action } = options;
        await this.page.onAction(ActionDirective.onInputText, async () => {
            this.manualUpdateProps({ [appear.prop]: oldValue }, { [appear.prop]: newValue }, BlockRenderRange.none, true);
            this.keepCursorOffset(appear.prop, options.oldOffset, options.newOffset);
            if (typeof action == 'function') await action();
            this.changeAppear(appear);
        })
    }
    async onDelete(this: Block) {
        await this.page.onAction(ActionDirective.onDelete, async () => {
            await this.delete();
        })
    }
    async onUpdateProps(this: Block, props: Record<string, any>, options?: {
        range?: BlockRenderRange,
        merge?: boolean
    }) {
        if (typeof options == 'undefined') options = { range: BlockRenderRange.none };
        if (typeof options.range == 'undefined') options.range = BlockRenderRange.none;
        await this.page.onAction(ActionDirective.onUpdateProps, async () => {
            if (options.merge) this.page.snapshoot.merge();
            await this.updateProps(props, options.range);
        })
    }
    async onManualUpdateProps(this: Block, oldProps: Record<string, any>, newProps: Record<string, any>, range = BlockRenderRange.none, isOnlyRecord: boolean = false) {
        await this.page.onAction(ActionDirective.onUpdateProps, async () => {
            this.manualUpdateProps(oldProps, newProps, range, isOnlyRecord);
        })
    }
    async onLock(this: Block, locked: boolean) {
        this.onAction(ActionDirective.onLock, async () => {
            this.updateProps({
                locker: {
                    lock: locked, date: Date.now(),
                    userid: this.page.user.id
                }
            });
        })
    }
    async onZIndex(this: Block, layer: 'top' | 'bottom') {
        this.onAction(ActionDirective.onZIndex, async () => {
            var zindex = this.zindex;
            if (layer == 'top') zindex = this.parent.childs.max(g => g.zindex) + 1;
            else zindex = this.parent.childs.min(g => g.zindex) - 1;
            this.updateProps({ zindex }, BlockRenderRange.self);
        })
    }
    /**
     * 光标输入完后触发的事件
     */
    async onInputed() {

    }
}


