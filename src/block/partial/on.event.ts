import { Block } from "..";
import { MenuItem, MenuItemType } from "../../../component/view/menu/declare";
import { BlockDirective, BlockRenderRange } from "../enum";
import { blockStore } from "../../../extensions/block/store";
import { ActionDirective, OperatorDirective } from "../../history/declare";
import { AppearAnchor } from "../appear";
import { Point, Rect } from "../../common/vector/point";
import { MenuPanel, useSelectMenuItem } from "../../../component/view/menu";
import { CopyText } from "../../../component/copy";
import { ShyAlert } from "../../../component/lib/alert";
import {
    AiStartSvg,
    BlockcolorSvg,
    BoardMoveBottomSvg,
    BoardMoveTopSvg,
    DuplicateSvg,
    LinkSvg,
    LockSvg,
    LoopSvg,
    TrashSvg,
    UnlockSvg
} from "../../../component/svgs";
import lodash from "lodash";
import { FontColorList, BackgroundColorList } from "../../../extensions/color/data";
import { BlockUrlConstant } from "../constant";
import { List } from "../../../blocks/present/list/list";
import { BlockFactory } from "../factory/block.factory";
import { util } from "../../../util/util";
import { ls, lst } from "../../../i18n/store";
import { channel } from "../../../net/channel";

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
                icon: it.icon,
                url: it.url,
                checkLabel: lodash.isEqual(BlockFactory.parseBlockUrl(it.url),
                    BlockFactory.parseBlockUrl(this.getUrl())) ? true : false,
                iconSize: 16
            }
        })
    }
    async onGetContextMenus(this: Block) {
        if (this.isFreeBlock) {
            return await this.onGetBoardContextMenus()
        }
        var items: MenuItem<BlockDirective | string>[] = [];
        var hasAi: boolean = true;
        if (this.page.ws.aiConfig?.disabled == true) {
            hasAi = false;
        }
        else {
            if (!(this.appearAnchors.some(s => s.isText) || this.find(c => c.appearAnchors.some(s => s.isText)))) {
                hasAi = false;
            }
        }
        if (this.isPanel) {
            hasAi = false;
        }
        if (this.isComposite) {
            hasAi = false;
        }
        if (hasAi) {
            items.push({
                name: 'askAi',
                icon: AiStartSvg,
                text: lst("诗云AI"),
            });
            items.push({ type: MenuItemType.divide });
        }
        items.push({
            name: BlockDirective.copy,
            text: lst('拷贝副本'),
            label: "Ctrl+D",
            icon: DuplicateSvg
        });
        var menus = await this.onGetTurnMenus();
        if (menus.length > 0) {
            items.push({
                text: lst('切换'),
                icon: LoopSvg,
                childs: menus.map(m => {
                    return {
                        ...m,
                    }
                })
            });
        }
        items.push({
            name: BlockDirective.link,
            text: lst('复制块链接'),
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
        items.push({
            type: MenuItemType.divide
        });
        if (typeof (this as any).align != 'undefined') {
            items.push({
                name: 'text-center',
                value: (this as any).align,
                text: lst('文字对齐'),
                childs: [
                    {
                        name: 'text-center',
                        text: lst('左对齐'),
                        value: 'left',
                        icon: { name: 'byte', code: 'align-text-left' },
                        checkLabel: (this as any).align == 'left' ? true : false
                    },
                    {
                        name: 'text-center',
                        text: lst('居中'),
                        value: 'center',
                        icon: { name: 'byte', code: 'align-text-center' },
                        checkLabel: (this as any).align == 'center' ? true : false
                    },
                    {
                        name: 'text-center',
                        text: lst('右对齐'),
                        value: 'right',
                        icon: { name: 'byte', code: 'align-text-right' },
                        checkLabel: (this as any).align == 'right' ? true : false
                    }
                ],
                icon: (this as any).align == 'left' ? { name: 'byte', code: 'align-text-left' } : (this as any).align == 'center' ? { name: 'byte', code: 'align-text-center' } : { name: 'byte', code: 'align-text-right' }
            });
        }

        items.push({
            text: lst('颜色'),
            icon: BlockcolorSvg,
            name: 'color',
          
            childs: [
                {
                    text: lst('文字颜色'),
                    type: MenuItemType.text
                },
                {
                    name: 'fontColor',
                    type: MenuItemType.color,
                    block: ls.isCn ? false : true,
                    options: FontColorList().map(f => {
                        return {
                            text: f.text,
                            overlay: f.text,
                            value: f.color,
                            checked: lodash.isEqual(this.pattern?.getFontStyle()?.color, f.color) ? true : false
                        }
                    })
                },
                {
                    type: MenuItemType.divide
                },
                {
                    text: lst('背景颜色'),
                    type: MenuItemType.text
                },
                {
                    type: MenuItemType.color,
                    name: 'fillColor',
                    block: ls.isCn ? false : true,
                    options: BackgroundColorList().map(f => {
                        return {
                            text: f.text,
                            value: f.color,
                            checked: this.pattern?.getFillStyle()?.color == f.color ? true : false
                        }
                    })
                },
            ]
        });
        items.push({
            type: MenuItemType.divide
        });
        items.push({
            name: BlockDirective.delete,
            icon: TrashSvg,
            text: lst('删除'),
            label: "Del"
        });
        if (this.editor) {
            items.push({
                type: MenuItemType.divide,
            });
            if (this.editDate) items.push({
                type: MenuItemType.text,
                text: lst('编辑于 ') + util.showTime(new Date(this.editDate))
            });
            var r = await channel.get('/user/basic', { userid: this.editor });
            if (r?.data?.user) items.push({
                type: MenuItemType.text,
                text: lst('编辑人 ') + r.data.user.name
            });
        }
        return items;
    }
    async onGetBoardContextMenus(this: Block) {
        var items: MenuItem<BlockDirective | string>[] = [];
        items.push({
            name: BlockDirective.bringToFront,
            text: lst('移到前面'),
            icon: BoardMoveTopSvg,
        });
        items.push({
            name: BlockDirective.sendToBack,
            text: lst('移到最下面'),
            icon: BoardMoveBottomSvg
        });
        items.push({
            type: MenuItemType.divide
        });
        items.push({
            name: this.locker?.lock == false ? BlockDirective.lock : BlockDirective.unlock,
            text: this.locker?.lock == false ? lst('锁住') : lst('解锁'),
            icon: this.locker?.lock == false ? LockSvg : UnlockSvg
        });
        items.push({
            type: MenuItemType.divide
        });
        items.push({
            name: 'copy',
            text: lst('复制'),
            icon: DuplicateSvg
        });
        items.push({
            type: MenuItemType.divide
        });
        items.push({
            name: BlockDirective.delete,
            icon: TrashSvg,
            text: lst('删除'),
            label: "delete"
        });
        return items;
    }
    async onContextmenu(this: Block, event: MouseEvent | Point | Rect) {
        var self = this;
        var re = await useSelectMenuItem(
            this.isFreeBlock ? {
                roundPoint: event instanceof Rect ? undefined : (event instanceof Point ? event : Point.from(event)),
                roundArea: event instanceof Rect ? event : undefined,
            } : {
                roundArea: !(event instanceof Point) ? Rect.fromEvent(event) : undefined,
                roundPoint: event instanceof Point ? event : undefined,
                direction: 'left'
            },
            await this.onGetContextMenus(),
            {
                async input(item) {
                    await self.onContextMenuInput(item);
                },
                async click(item, ev, name, mp) {
                    mp.onFree();
                    try {
                        await self.onContextMenuClick(item, ev, name, mp);
                    }
                    catch (ex) {

                    }
                    finally {
                        mp.onUnfree()
                    }
                }
            }
        );
        if (re) {
            await this.onClickContextMenu(re.item, re.event);
        }
    }
    async onContextMenuInput(this: Block, item: MenuItem<BlockDirective | string>, options?: { merge?: boolean }) {
        if (item?.name == 'text-center') {
            await this.onUpdateProps({ align: item.value }, { range: BlockRenderRange.self, merge: options?.merge ? true : undefined });
        }
    }
    async onContextMenuClick(this: Block, item: MenuItem<string | BlockDirective>, event: React.MouseEvent<Element, MouseEvent>, clickName: string, mp: MenuPanel<any>) {

    }
    async onClickContextMenu(this: Block, item: MenuItem<BlockDirective | string>, event: MouseEvent, options?: { merge?: boolean }) {
        if (this.isFreeBlock) {
            return await this.onClickBoardContextMenu(item, event);
        }
        switch (item.name) {
            case BlockDirective.delete:
                await this.page.onBatchDelete([this]);
                break;
            case BlockDirective.copy:
                await this.onClone()
                break;
            case BlockDirective.link:
                await this.onCopyLink();
                break;
            case BlockDirective.trun:
                await this.page.onBatchTurn([this], (item as any).url);
                break;
            case BlockDirective.comment:
                break;
            case 'askAi':
                await this.page.kit.writer.onAskAi([this])
                break;
            case 'fontColor':
                await this.page.onAction('setFontStyle', async () => {
                    if (options?.merge) this.page.snapshoot.merge();
                    await this.pattern.setFontStyle({ color: item.value });
                    this.page.addBlockUpdate(this);
                })
                break;
            case 'fillColor':
                await this.page.onAction('setFillStyle', async () => {
                    if (options?.merge) this.page.snapshoot.merge();
                    await this.pattern.setFillStyle({ mode: 'color', color: item.value })
                    this.page.addBlockUpdate(this);
                })
                break;
            case 'text-center':
                await this.onUpdateProps({ align: item.value }, { range: BlockRenderRange.self, merge: options?.merge ? true : undefined });
                break;
        }
    }
    async onClickBoardContextMenu(this: Block, item: MenuItem<BlockDirective | string>, event: MouseEvent) {
        switch (item.name) {
            case BlockDirective.lock:
                await this.onLock(true);
                break;
            case BlockDirective.unlock:
                await this.onLock(false);
                break;
            case BlockDirective.bringToFront:
                await this.onZIndex('top');
                break;
            case BlockDirective.sendToBack:
                await this.onZIndex('bottom');
                break;
            case BlockDirective.delete:
                await this.page.onBatchDelete([this]);
                break;
            case BlockDirective.copy:
                await this.onClone();
                break;
        }
    }
    async onInputText(this: Block, options: {
        appear: AppearAnchor,
        oldValue: string,
        newValue: string,
        action?: () => Promise<void>
    }) {
        var { appear, oldValue, newValue, action } = options;
        await this.page.onAction(ActionDirective.onInputText, async () => {
            await this.manualUpdateProps({ [appear.prop]: oldValue }, { [appear.prop]: newValue }, BlockRenderRange.none, { isOnlyRecord: true });
            if (typeof action == 'function') await action();
            await this.changeAppear(appear);
        })
    }
    async onDelete(this: Block) {
        await this.page.onAction(ActionDirective.onDelete, async () => {
            await this.delete();
        })
    }
    async onClone(this: Block) {
        /**
        *复制块
        */
        await this.page.onAction(ActionDirective.onCopyBlock, async () => {
            var nb = await this.clone();
            if (this.isFreeBlock) {
                var ma = nb.matrix.clone();
                ma.translate(this.realPx(50), this.realPx(50));
                await nb.updateMatrix(nb.matrix, ma);
            }
            this.page.addUpdateEvent(async () => {
                this.page.kit.anchorCursor.onFocusBlockAnchor(nb, { merge: true, render: true, last: true })
            })
        });
    }
    async clone(this: Block) {
        var d = await this.cloneData();
        var pa = this.parent;
        var nb = await pa.appendBlock(d, this.at + 1, this.parentKey);
        return nb;
    }
    async onCopyLink(this: Block) {
        CopyText(this.blockUrl);
        ShyAlert(lst('块的链接已复制'))
    }
    async onUpdateProps(this: Block, props: Record<string, any>, options?: {
        range?: BlockRenderRange,
        merge?: boolean
    }, force?: boolean) {
        if (typeof options == 'undefined') options = { range: BlockRenderRange.none };
        if (typeof options.range == 'undefined') options.range = BlockRenderRange.none;
        await this.page.onAction(ActionDirective.onUpdateProps, async () => {
            if (options.merge) this.page.snapshoot.merge();
            await this.updateProps(props, options.range, force);
        })
    }
    async onManualUpdateProps(this: Block,
        oldProps: Record<string, any>,
        newProps: Record<string, any>,
        options?: {
            range?: BlockRenderRange,
            isOnlyRecord?: boolean,
            isOnlyStore?: boolean;
        }
    ) {
        await this.page.onAction(ActionDirective.onUpdateProps, async () => {
            await this.manualUpdateProps(oldProps,
                newProps,
                options?.range,
                {
                    isOnlyRecord: options?.isOnlyRecord,
                    isOnlyStore: options?.isOnlyStore
                });
        })
    }
    async onLock(this: Block, locked: boolean) {
        await this.page.onAction(ActionDirective.onLock, async () => {
            await this.updateProps({
                locker: {
                    lock: locked,
                    date: Date.now(),
                    userid: this.page.user.id
                }
            });
        })
    }
    async unlock(this: Block, locked: boolean) {
        await this.updateProps({
            locker: {
                lock: locked,
                date: Date.now(),
                userid: this.page.user.id
            }
        });
    }
    async onZIndex(this: Block, layer: 'top' | 'bottom') {
        await this.page.onAction(ActionDirective.onZIndex, async () => {
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
        })
    }
    async onArraySave<T>(this: Block, options: {
        syncBlock?: Block,
        prop: string,
        data: T | ((t: T) => boolean),
        update: Partial<T>
    }) {
        if (typeof options.data != 'undefined') await this.page.onAction('onArrayUpdate', async () => {
            await this.arrayUpdate(options);
        })
        else await this.onArrayPush({
            syncBlock: options.syncBlock,
            prop: options.prop,
            data: options.update
        })
    }
    async onArrayRemove<T>(this: Block, options: {
        syncBlock?: Block, prop: string,
        data?: T | ((t: T) => boolean),
        at?: number,
    }) {
        await this.page.onAction('onArrayRemove', async () => {
            await this.arrayRemove(options);
        })
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
        })
    }
    async arrayUpdate<T>(this: Block, options: {
        prop: string,
        data: T | ((t: T) => boolean),
        update: Partial<T>
    }) {
        var arr = lodash.get(this, options.prop);
        if (!Array.isArray(arr)) {
            arr = [];
            lodash.set(this, options.prop, arr);
        }
        if (Array.isArray(arr)) {
            var ar = typeof options.data == 'function' ? arr.find(options.data) : options.data;
            if (ar) {
                var oldValue: Record<string, any> = {};
                var newValue: Record<string, any> = {};
                for (let n in options.update) {
                    if (!lodash.isEqual(options.update[n], ar[n])) {
                        oldValue[n] = lodash.cloneDeep(ar[n]);
                        newValue[n] = lodash.cloneDeep(options.update[n]);
                        if (typeof ar.load == 'function') ar.load({ [n]: newValue[n] })
                        else ar[n] = newValue[n];
                    }
                }
                this.page.addBlockChange(this);
                await this.page.onNotifyEditBlock(this);
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
        if (!Array.isArray(arr)) {
            arr = [];
            lodash.set(this, options.prop, arr);
        }
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
            this.page.addBlockChange(this);
            await this.page.onNotifyEditBlock(this);
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
        if (!Array.isArray(arr)) {
            arr = [];
            lodash.set(this, options.prop, arr);
        }
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
            this.page.addBlockChange(this);
            await this.page.onNotifyEditBlock(this);
            this.page.snapshoot.record(OperatorDirective.$array_delete, {
                pos,
                data: cd
            }, this)
        }
    }
    async arrayMove<T>(this: Block,
        options: {
            prop: string,
            data?: T | ((t: T) => boolean),
            from?: number,
            to: number
        }) {
        var arr: T[] = lodash.get(this, options.prop);
        if (!Array.isArray(arr)) {
            arr = [];
            lodash.set(this, options.prop, arr);
        }
        if (Array.isArray(arr)) {
            var from = options.from;
            if (typeof options.data != 'undefined') {
                if (typeof options.data == 'function') from = arr.findIndex(g => (options.data as any)(g))
                else from = arr.findIndex(g => g == options.data)
            }
            var pos = this.getArrayItemPos(options.prop);
            var item = arr[from];
            lodash.remove(arr, (g, i) => i == from);
            arr.splice(to, 0, item);
            var to = options.to;
            this.page.addBlockChange(this);
            await this.page.onNotifyEditBlock(this);
            this.page.snapshoot.record(OperatorDirective.$array_move, {
                pos,
                from,
                to
            }, this)
        }
    }
    async onHandlePlus(this: Block) {
        await this.page.onAction('handle.plus.create', async () => {
            var url = BlockUrlConstant.TextSpan;
            var data: Record<string, any> = {};
            if (this.url == BlockUrlConstant.CardBox) url = BlockUrlConstant.CardBox;
            if (this.url == BlockUrlConstant.List) {
                url = BlockUrlConstant.List;
                data = {
                    listType: (this as List).listType,
                    listView: (this as List).listView
                }
            }
            if (this.url == BlockUrlConstant.Todo) {
                url = BlockUrlConstant.Todo;
            }
            var isBlow = true;
            if (this.page.keyboardPlate.isAlt()) isBlow = false;
            var block = isBlow ? await this.visibleDownCreateBlock(url, data) : await this.visibleUpCreateBlock(url, data);
            await util.delay(20);
            if (block) {
                block.mounted(() => {
                    this.page.kit.anchorCursor.onFocusBlockAnchor(block, {
                        render: true,
                        merge: true
                    });
                })
            }
        })
    }
}


