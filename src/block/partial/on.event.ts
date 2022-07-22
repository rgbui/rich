import { Block } from "..";
import { MenuItem, MenuItemType } from "../../../component/view/menu/declare";
import { BlockDirective, BlockRenderRange } from "../enum";
import duplicate from "../../assert/svg/duplicate.svg";
// import loop from "../../assert/svg/loop.svg";
import blockcolor from "../../assert/svg/blockcolor.svg";
// import link from "../../assert/svg/link.svg";
import squareplus from "../../assert/svg/squareplus.svg";
import moveTo from '../../assert/svg/moveTo.svg';
import comment from "../../assert/svg/comment.svg";
import trash from "../../assert/svg/trash.svg";
import { blockStore } from "../../../extensions/block/store";
import { langProvider } from "../../../i18n/provider";
import { LangID } from "../../../i18n/declare";
import { ActionDirective, OperatorDirective } from "../../history/declare";
import { AppearAnchor } from "../appear";
import { Point, Rect } from "../../common/vector/point";
import { useSelectMenuItem } from "../../../component/view/menu";
import { CopyText } from "../../../component/copy";
import { ShyAlert } from "../../../component/lib/alert";
import { LinkSvg, LoopSvg } from "../../../component/svgs";
import lodash from "lodash";


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
                checkLabel: it.url == this.url ? true : false,
                iconSize: 22
            }
        })
    }
    async onGetContextMenus(this: Block) {
        if (this.isFreeBlock) {
            return await this.onGetBoardContextMenus()
        }
        var items: MenuItem<BlockDirective>[] = [];
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
            icon: LoopSvg,
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
            icon: LinkSvg
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
        var items: MenuItem<BlockDirective | string>[] = [];
        items.push({
            name: BlockDirective.bringToFront,
            text: '移到前面'
        });
        items.push({
            name: BlockDirective.sendToBack,
            text: '移到最下面'
        });
        items.push({
            type: MenuItemType.divide
        });
        items.push({
            name: this.locker?.lock == false ? BlockDirective.lock : BlockDirective.unlock,
            text: this.locker?.lock == false ? '解锁' : '锁住',
        });
        items.push({
            type: MenuItemType.divide
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
            type: MenuItemType.divide
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
    async onClickContextMenu(this: Block, item: MenuItem<BlockDirective | string>, event: MouseEvent) {
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
                this.page.onAction(ActionDirective.onCopyBlock, async () => {
                    var d = this.cloneData();
                    var pa = this.parent;
                    await pa.appendBlock(d, this.at, this.parentKey);
                });
                break;
            case BlockDirective.link:
                CopyText(this.blockUrl);
                ShyAlert('块的链接已复制')
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
    async onClickBoardContextMenu(this: Block, item: MenuItem<BlockDirective | string>, event: MouseEvent) {
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
            //this.keepCursorOffset(appear.prop, options.oldOffset, options.newOffset);
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
        merge?: boolean,
        syncBlock?: Block
    }) {
        if (typeof options == 'undefined') options = { range: BlockRenderRange.none };
        if (typeof options.range == 'undefined') options.range = BlockRenderRange.none;
        await this.page.onAction(ActionDirective.onUpdateProps, async () => {
            if (options.merge) this.page.snapshoot.merge();
            await this.updateProps(props, options.range);
        }, { block: options?.syncBlock })
    }
    async onManualUpdateProps(this: Block,
        oldProps: Record<string, any>,
        newProps: Record<string, any>,
        options?: {
            range?: BlockRenderRange,
            isOnlyRecord?: boolean,
            syncBlock?: Block
        }
    ) {
        await this.page.onAction(ActionDirective.onUpdateProps, async () => {
            this.manualUpdateProps(oldProps, newProps, options?.range, options?.isOnlyRecord);
        }, { block: options?.syncBlock })
    }
    async onLock(this: Block, locked: boolean) {
        this.page.onAction(ActionDirective.onLock, async () => {
            this.updateProps({
                locker: {
                    lock: locked,
                    date: Date.now(),
                    userid: this.page.user.id
                }
            });
        })
    }
    async onZIndex(this: Block, layer: 'top' | 'bottom') {
        this.page.onAction(ActionDirective.onZIndex, async () => {
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
    async onArrayUpdate<T>(this: Block, options: {
        syncBlock?: Block,
        prop: string,
        data: T | ((t: T) => boolean),
        update: Partial<T>
    }) {
        await this.page.onAction('onArrayUpdate', async () => {
            await this.arrayUpdate(options);
        }, options.syncBlock ? { block: options.syncBlock } : undefined)
    }
    async onArrayRemove<T>(this: Block, options: {
        syncBlock?: Block, prop: string,
        data?: T | ((t: T) => boolean),
        at?: number,
    }) {
        await this.page.onAction('onArrayRemove', async () => {
            await this.arrayRemove(options);
        }, options.syncBlock ? { block: options.syncBlock } : undefined)
    }
    async onArrayPush<T>(this: Block, options: {
        syncBlock?: Block,
        prop: string,
        data: T,
        at?: number,
        where?: { item?: T | ((t: T) => boolean), arrow?: 'down' | 'up' }
    }) {
        await this.page.onAction('onArrayPush', async () => {
            await this.arrayPush(options);
        }, options.syncBlock ? { block: options.syncBlock } : undefined)
    }
    async arrayUpdate<T>(this: Block, options: {
        prop: string,
        data: T | ((t: T) => boolean),
        update: Partial<T>
    }) {
        var arr = lodash.get(this, options.prop);
        if (Array.isArray(arr)) {
            var ar = typeof options.data == 'function' ? arr.find(options.data) : options.data;
            if (ar) {
                var oldValue: Record<string, any> = {};
                var newValue: Record<string, any> = {};
                for (let n in options.update) {
                    if (!lodash.isEqual(options.update[n], ar[n])) {
                        oldValue[n] = lodash.cloneDeep(ar[n]);
                        newValue[n] = lodash.cloneDeep(options.update[n]);
                        ar[n] = newValue[n];
                    }
                }
                this.page.snapshoot.record(OperatorDirective.$array_update, {
                    pos: this.getArrayItemPos(options.prop, ar),
                    old_value: oldValue,
                    new_value: newValue
                }, this)
            }
        }
    }
    async arrayPush<T>(this: Block, options: {
        prop: string,
        data: T,
        at?: number,
        where?: { item?: T | ((t: T) => boolean), arrow?: 'down' | 'up' }
    }) {
        var arr: T[] = lodash.get(this, options.prop);
        if (Array.isArray(arr)) {
            var at = options.at;
            if (typeof options.where == 'undefined' && typeof options.at == 'undefined') {
                at = arr.length;
            }
            else if (typeof options.at == 'number') at = options.at;
            else if (typeof options.where != 'undefined') {
                var nat = arr.findIndex(g => (typeof options.where.item == 'function' ? (options.where as any).item(g) == true : options.where.item === g));
                if (options.where.arrow == 'down' || typeof options.where.arrow == 'undefined') {
                    nat += 1;
                }
                at = nat;
            }
            arr.splice(at, 0, options.data);
            var pos = this.getArrayItemPos(options.prop, options.data);
            var pm = this.pm(options.prop);
            var cd;
            if (pm) {
                if (typeof pm.get == 'function') cd = pm.get(options.data)
                else if (typeof (options.data as any).get == 'function') cd = (options.data as any).get()
                else cd = lodash.cloneDeep(options.data);
            } else cd = lodash.cloneDeep(options.data);
            this.page.snapshoot.record(OperatorDirective.$array_create, {
                pos,
                data: cd
            }, this)
        }
    }
    async arrayRemove<T>(this: Block, options: {
        prop: string,
        data?: T | ((t: T) => boolean),
        at?: number,
    }) {
        var arr: T[] = lodash.get(this, options.prop);
        if (Array.isArray(arr)) {
            var at = options.at;
            if (typeof options.at == 'number') at = options.at;
            else if (typeof options.data != 'undefined') {
                at = arr.findIndex(g => (typeof options.data == 'function' ? (options.data as any)(g) == true : options.data === g));
            }
            var currentData = arr[at];
            var pos = this.getArrayItemPos(options.prop, currentData);
            arr.splice(at, 1);
            var cd;
            var pm = this.pm(options.prop);
            if (pm) {
                if (typeof pm.get == 'function') cd = pm.get(currentData)
                else if (typeof (currentData as any).get == 'function') cd = (currentData as any).get()
                else cd = lodash.cloneDeep(currentData);
            } else cd = lodash.cloneDeep(currentData);
            this.page.snapshoot.record(OperatorDirective.$array_delete, {
                pos,
                data: cd
            }, this)
        }
    }
}


