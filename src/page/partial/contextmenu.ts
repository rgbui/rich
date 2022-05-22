
import React from "react";
import { Page } from "..";
import { useSelectMenuItem } from "../../../component/view/menu";
import { MenuItemType, MenuItemTypeValue } from "../../../component/view/menu/declare";
import { BlockDirective } from "../../block/enum";
import { Point, Rect } from "../../common/vector/point";
import { PageLayoutType } from "../declare";
import { FileSvg, LinkSvg, LockSvg, MoveToSvg, TrashSvg, UndoSvg, UnlockSvg, UploadSvg, VersionHistorySvg } from "../../../component/svgs";
import { usePageLayout } from "../../../extensions/layout";
import { CopyText } from "../../../component/copy";
import { ShyAlert } from "../../../component/lib/alert";
import { channel } from "../../../net/channel";
import { Confirm } from "../../../component/lib/confirm";

export class PageContextmenu {
    async onGetContextMenus(this: Page) {
        if (this.isBoard) return this.onGetBoardContextMenus();
        var items: MenuItemType<BlockDirective | string>[] = [];
        return items;
    }
    async onGetBoardContextMenus(this: Page) {
        var items: MenuItemType<BlockDirective | string>[] = [];
        items.push({ type: MenuItemTypeValue.switch, checked: this.pageInfo?.locker?.userid ? true : false, text: '编辑保护', name: 'lock' });
        items.push({ type: MenuItemTypeValue.divide });
        // items.push({ name: 'add-favourite', text: '星标' });
        items.push({ name: 'copy-link', text: '复制链接' })
        items.push({ type: MenuItemTypeValue.divide });
        items.push({ name: 'show-all', text: '显示所有内容' });
        // items.push({ name: 'show-grid', text: '显示网格' })
        return items;
    }
    async onClickContextMenu(this: Page, item: MenuItemType<BlockDirective | string>, event: MouseEvent) {
        if (this.isBoard) return this.onClickBoardContextMenu(item, event);
        switch (item.name) {

        }
    }
    async onClickBoardContextMenu(this: Page, item: MenuItemType<BlockDirective | string>, event: MouseEvent) {
        switch (item.name) {
            case 'lock':
                channel.air('/page/update/info', {
                    id: this.pageInfo.id, pageInfo: {
                        locker: this.pageInfo.locker?.userid ? null : {
                            userid: this.user.id,
                            lockDate: Date.now()
                        }
                    }
                });
            case 'copy-link':
                CopyText(this.pageInfo.url);
                ShyAlert('复制链接');
                break;
            case 'show-all':
                break;

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
    async onPageContextmenu(this: Page, event: React.MouseEvent) {
        var items: MenuItemType<BlockDirective | string>[] = [];
        if (this.pageLayout.type == PageLayoutType.doc) {
            items = [
                { name: 'smallText', text: '小字号', checked: this.smallFont ? true : false, type: MenuItemTypeValue.switch },
                { name: 'fullWidth', text: '宽版', checked: this.isFullWidth ? true : false, type: MenuItemTypeValue.switch },
                { type: MenuItemTypeValue.divide },
                // { name: 'layout', text: '版面', icon: CustomizePageSvg },
                { name: 'lock', text: this.pageInfo.locker?.userid ? "解除锁定" : '编辑保护', icon: this.pageInfo.locker?.userid ? UnlockSvg : LockSvg },
                // { type: MenuItemTypeValue.divide },
                // { name: 'favourite', icon: 'favorite:sy', text: '添加至收藏', disabled: true },
                // { name: 'history', icon: VersionHistorySvg, text: '页面历史', disabled: true },
                { name: 'copylink', icon: LinkSvg, text: '复制链接' },
                { type: MenuItemTypeValue.divide },
                { name: 'undo', text: '撤消', icon: UndoSvg, disabled: this.snapshoot.historyRecord.isCanUndo ? false : true, label: 'ctrl+Z' },
                { name: 'delete', icon: TrashSvg, text: '删除' },
                { type: MenuItemTypeValue.divide },
                { name: 'import', icon: UploadSvg, text: '导入', disabled: true },
                { name: 'export', text: '导出', icon: FileSvg, disabled: true, remark: '导出PDF,HTML,Markdown' },
                // { type: MenuItemTypeValue.divide },
                // { name: 'move', text: '移动', icon: MoveToSvg, disabled: true },
            ];
        }
        var r = await useSelectMenuItem({ roundArea: Rect.fromEvent(event) }, items, {
            overflow: 'visible',
            update: (item) => {
                if (item.name == 'smallText') {
                    this.onUpdateProps({ smallFont: item.checked }, true);
                }
                else if (item.name == 'fullWidth') {
                    this.onUpdateProps({ isFullWidth: item.checked }, true);
                }
            }
        });
        if (r) {
            if (r.item.name == 'layout') {
                var up = await usePageLayout({ roundArea: Rect.fromEvent(event) })
            }
            else if (r.item.name == 'copylink') {
                CopyText(this.pageInfo.url);
                ShyAlert('复制链接');
            }
            else if (r.item.name == 'lock') {
                channel.air('/page/update/info', {
                    id: this.pageInfo.id, pageInfo: {
                        locker: this.pageInfo.locker?.userid ? null : {
                            userid: this.user.id,
                            lockDate: Date.now()
                        }
                    }
                })
            }
            else if (r.item.name == 'delete') {
                if (await Confirm('确认要删除吗?')) {
                    channel.air('/page/remove', { item: this.pageInfo.id });
                }
            }
            else if (r.item.name == 'undo') {
                this.onUndo();
            }
        }
    }
}