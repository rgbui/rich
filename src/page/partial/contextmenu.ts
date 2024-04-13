
import React from "react";
import { Page } from "..";
import { useSelectMenuItem } from "../../../component/view/menu";
import { MenuItem, MenuItemType } from "../../../component/view/menu/declare";
import { BlockDirective, BlockRenderRange } from "../../block/enum";
import { Point, Rect } from "../../common/vector/point";
import { PageLayoutType, PageTemplateTags, PageTemplateTypeGroups } from "../declare";
import {
    AiStartSvg,
    CommentSvg,
    CustomizePageSvg,
    DuplicateSvg,
    EyeHideSvg,
    FieldsSvg,
    HSvg,
    LinkSvg,
    LockSvg,
    MoveToSvg,
    NoteSvg,
    OutlineSvg,
    PicSvg,
    PlatteSvg,
    RedoSvg,
    RefreshOneSvg,
    RefreshSvg,
    TrashSvg,
    UndoSvg,
    UnlockSvg,
    VersionHistorySvg
} from "../../../component/svgs";

import { CopyText } from "../../../component/copy";
import { CloseShyAlert, ShyAlert } from "../../../component/lib/alert";
import { channel } from "../../../net/channel";
import { Confirm } from "../../../component/lib/confirm";
import { usePageHistoryStore } from "../../../extensions/history";
import { PageDirective } from "../directive";
import { usePagePublish } from "../../../extensions/publish";
import { BlockUrlConstant } from "../../block/constant";
import { GetFieldTypeSvg } from "../../../blocks/data-grid/schema/util";
import { OriginFormField } from "../../../blocks/data-grid/element/form/origin.field";
import { Field } from "../../../blocks/data-grid/schema/field";
import { GetFieldFormBlockInfo } from "../../../blocks/data-grid/element/service";
import { ElementType } from "../../../net/element.type";
import { FieldType } from "../../../blocks/data-grid/schema/type";

import { util } from "../../../util/util";
import { ActionDirective } from "../../history/declare";
import { useExportFile } from "../../../extensions/export-file";
import { DataGridView } from "../../../blocks/data-grid/view/base";
import { useForm } from "../../../component/view/form/dialoug";
import { lst } from "../../../i18n/store";
import { Title } from "../../../blocks/interaction/title";
import { BlockButton } from "../../../blocks/interaction/button";
import { Block } from "../../block";
import { RobotInfo } from "../../../types/user";
import { usePageTheme } from "../../../extensions/theme";
import { getAiDefaultModel } from "../../../net/ai/cost";
import { UA } from "../../../util/ua";

export class PageContextmenu {
    async onGetContextMenus(this: Page) {
        if (this.isBoard) return this.onGetBoardContextMenus();
        var items: MenuItem<BlockDirective | string>[] = [];
        return items;
    }
    async onGetBoardContextMenus(this: Page) {
        var items: MenuItem<BlockDirective | string>[] = [];
        items.push({
            type: MenuItemType.switch,
            checked: this.pageInfo?.locker?.lock ? true : false,
            text: lst('编辑保护'),
            name: 'lock'
        });
        items.push({ type: MenuItemType.divide });
        items.push({ name: 'copy-link', text: lst('复制链接'), label: UA.isMacOs ? "⌥+Shift+L" : "Alt+Shift+L" })
        items.push({ type: MenuItemType.divide });
        items.push({ name: 'show-all', text: lst('显示所有内容') });
        // items.push({ name: 'show-grid', text: '显示网格' })
        return items;
    }
    async onClickContextMenu(this: Page, item: MenuItem<BlockDirective | string>, event: MouseEvent) {
        if (this.isBoard) return this.onClickBoardContextMenu(item, event);
    }
    async onClickBoardContextMenu(this: Page, item: MenuItem<BlockDirective | string>, event: MouseEvent) {
        switch (item.name) {
            case 'lock':
                channel.air('/page/update/info', {
                    id: this.pageInfo.id,
                    pageInfo: {
                        locker: this.pageInfo.locker?.userid ? null : {
                            userid: this.user.id,
                            date: Date.now(),
                            lock: this.pageInfo?.locker?.lock ? false : true
                        }
                    }
                });
            case 'copy-link':
                CopyText(this.pageInfo.url);
                ShyAlert(lst('复制链接'));
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
        var items: MenuItem<BlockDirective | string>[] = [];
        var robots = (await this.ws.getWsRobots()).filter(g => g.disabledWiki !== true);
        if (this.pageLayout.type == PageLayoutType.doc) {
            items = [
                { name: 'smallText', icon: { name: 'bytedance-icon', code: 'add-text' }, text: lst('小字号'), checked: this.smallFont ? true : false, type: MenuItemType.switch },
                { name: 'fullWidth', icon: { name: 'bytedance-icon', code: 'fullwidth' }, text: lst('宽版'), checked: this.isFullWidth ? true : false, type: MenuItemType.switch },
                {
                    text: lst('主题'),
                    icon: PlatteSvg,
                    name: 'theme',
                },
                { type: MenuItemType.divide },
                { name: 'nav', text: lst('目录'), icon: OutlineSvg, type: MenuItemType.switch, checked: this.nav },
                {
                    text: lst('小部件'),
                    icon: FieldsSvg,
                    childs: [
                        { name: 'onlyDisplayContent', text: lst('标题'), type: MenuItemType.switch, checked: this.hideDocTitle ? false : true, icon: HSvg },
                        { name: 'showCover', text: lst('封面'), type: MenuItemType.switch, checked: this.pageInfo?.cover?.abled && this.pageInfo?.cover.url ? true : false, icon: PicSvg },
                        { name: 'pageAuthor', text: lst('作者'), icon: { name: 'bytedance-icon', code: 'edit-name' }, type: MenuItemType.switch, checked: this.exists(g => g.url == BlockUrlConstant.PageAuthor) },
                        { type: MenuItemType.divide },
                        { name: 'showComment', text: lst("评论"), icon: CommentSvg, type: MenuItemType.switch, checked: this.exists(g => g.url == BlockUrlConstant.Comment) },
                        { name: 'pageUpvotedOrShared', text: lst('点赞分享'), icon: { name: 'bytedance-icon', code: 'send' }, type: MenuItemType.switch, checked: this.exists(g => g.url == BlockUrlConstant.PageUpvotedOrShared) },
                        { name: 'prevOrNext', text: lst('上下篇'), icon: { name: 'bytedance-icon', code: 'transfer-data' }, type: MenuItemType.switch, checked: this.exists(g => g.url == BlockUrlConstant.PagePreOrNext) },
                        { name: 'refPages', text: lst("引用"), visible: [ElementType.SchemaRecordView].includes(this.pe.type) ? false : true, icon: CustomizePageSvg, type: MenuItemType.switch, checked: this.exists(g => g.url == BlockUrlConstant.RefLinks) },
                        { type: MenuItemType.divide },
                        { type: MenuItemType.help, url: window.shyConfig?.isUS ? "https://help.shy.red/page/68#sm8Eix3mziuLx83RnrUYw8" : "https://help.shy.live/page/1988#5ChJozytSL93WbD7Uxy8sk", text: lst('了解如何使用小组件') }
                    ]
                },
                {
                    icon: AiStartSvg,
                    text: lst("AI语料库"),
                    visible: robots.length > 0 ? true : false,
                    childs: robots.map(robot => {
                        return {
                            type: MenuItemType.user,
                            userid: robot.robotId,
                            childs: [
                                { name: 'ai-sync', value: robot, icon: RefreshSvg, text: lst('同步') },
                                { name: 'ai-sync-turn', value: robot, icon: RefreshOneSvg, text: lst('同步且训练') },
                                { type: MenuItemType.divide },
                                { name: 'ai-open', value: robot, icon: { name: 'bytedance-icon', code: 'arrow-right-up' }, text: lst('打开') }
                            ]
                        }
                    })
                },
                { type: MenuItemType.divide },
                { name: 'lock', disabled: this.isCanManage ? false : true, text: this.locker?.lock ? lst("除消编辑保护") : lst("编辑保护"), icon: this.locker?.lock ? LockSvg : UnlockSvg },
                {
                    name: 'turnToPPT',
                    text: lst('转换为PPT'),
                    icon: { name: 'byte', code: 'cycle-one' },
                    // label: UA.isMacOs ? "⌘+Shift+P" : "Ctrl+Shift+P"
                },
                {
                    name: 'copy',
                    text: lst('拷贝'),
                    icon: DuplicateSvg,
                    label: UA.isMacOs ? "⌘+D" : "Ctrl+D"
                },
                {
                    name: 'move',
                    text: lst('移动'),
                    icon: MoveToSvg,
                    label: UA.isMacOs ? "⌘+Shift+P" : "Ctrl+Shift+P"
                },
                { name: 'export', iconSize: 16, text: lst('导出'), icon: { name: 'bytedance-icon', code: 'download-one' } },
                {
                    name: 'delete', icon: TrashSvg, text: lst('删除'),
                    label: "Del"
                },
                { type: MenuItemType.divide },
                { name: 'undo', text: lst('撤消'), icon: UndoSvg, disabled: this.snapshoot.historyRecord.isCanUndo ? false : true, label: UA.isMacOs ? "⌘+Z" : 'Ctrl+Z' },
                { name: 'redo', text: lst('重做'), icon: RedoSvg, disabled: this.snapshoot.historyRecord.isCanRedo ? false : true, label: UA.isMacOs ? "⌘+Y" : 'Ctrl+Y' },

                ...(window.shyConfig.isDev || window.shyConfig.isBeta || this.ws?.sn == 19 ? [
                    { type: MenuItemType.divide },
                    { name: 'requireTemplate', icon: { name: 'byte', code: 'graphic-stitching' } as any, text: lst('申请模板') },
                ] : []),
                { type: MenuItemType.divide },
                {
                    name: 'copylink', icon: LinkSvg, text: lst('复制链接'),
                    label: UA.isMacOs ? "⌥+Shift+L" : "Alt+Shift+L"
                },
                { name: 'history', icon: VersionHistorySvg, text: lst('页面历史') },
            ];
        }
        else if (this.pageLayout.type == PageLayoutType.db) {
            items = [
                { name: 'smallText', icon: { name: 'bytedance-icon', code: 'add-text' }, text: lst('小字号'), checked: this.smallFont ? true : false, type: MenuItemType.switch },
                { name: 'fullWidth', icon: { name: 'bytedance-icon', code: 'fullwidth' }, text: lst('宽版'), checked: this.isFullWidth ? true : false, type: MenuItemType.switch },
                {
                    text: lst('主题'),
                    icon: PlatteSvg,
                    name: 'theme',
                },
                { type: MenuItemType.divide },
                {
                    text: lst('小部件'),
                    icon: FieldsSvg,
                    childs: [
                        { name: 'onlyDisplayContent', text: lst('标题'), type: MenuItemType.switch, checked: this.hideDocTitle ? false : true, icon: NoteSvg },
                        { name: 'pageUpvotedOrShared', text: lst('点赞分享'), icon: { name: 'bytedance-icon', code: 'send' }, type: MenuItemType.switch, checked: this.exists(g => g.url == BlockUrlConstant.PageUpvotedOrShared) },
                        { name: 'showComment', text: lst("评论"), icon: CommentSvg, type: MenuItemType.switch, checked: this.exists(g => g.url == BlockUrlConstant.Comment) },
                        { type: MenuItemType.divide },
                        { type: MenuItemType.help, url: window.shyConfig?.isUS ? "https://help.shy.red/page/68#sm8Eix3mziuLx83RnrUYw8" : "https://help.shy.live/page/1988#5ChJozytSL93WbD7Uxy8sk", text: lst('了解如何使用小组件') }
                    ]
                },
                { type: MenuItemType.divide },
                { name: 'lock', disabled: this.isCanManage ? false : true, text: this.locker?.lock ? lst("除消编辑保护") : lst("编辑保护"), icon: this.locker?.lock ? LockSvg : UnlockSvg },
                {
                    name: 'copy', text: lst('拷贝'), icon: DuplicateSvg,
                    label: UA.isMacOs ? "⌘+D" : "Ctrl+D"
                },
                {
                    name: 'move', text: lst('移动'), icon: MoveToSvg,
                    label: UA.isMacOs ? "⌘+Shift+P" : "Ctrl+Shift+P"
                },
                { name: 'export', iconSize: 16, text: lst('导出'), icon: { name: 'bytedance-icon', code: 'download-one' } },
                { name: 'delete', icon: TrashSvg, text: lst('删除'), label: "Del" },
                { type: MenuItemType.divide },
                { name: 'undo', text: lst('撤消'), icon: UndoSvg, disabled: this.snapshoot.historyRecord.isCanUndo ? false : true, label: UA.isMacOs ? "⌘+Z" : 'Ctrl+Z' },
                { name: 'redo', text: lst('重做'), icon: RedoSvg, disabled: this.snapshoot.historyRecord.isCanRedo ? false : true, label: UA.isMacOs ? "⌘+Y" : 'Ctrl+Y' },
                { type: MenuItemType.divide },
                {
                    name: 'copylink', icon: LinkSvg, text: lst('复制链接'),
                    label: UA.isMacOs ? "⌥+Shift+L" : "Alt+Shift+L"
                },
                { name: 'history', icon: VersionHistorySvg, text: lst('页面历史') },
            ];
        }
        else if (this.pageLayout.type == PageLayoutType.ppt) {
            items = [
                { name: 'smallText', icon: { name: 'bytedance-icon', code: 'add-text' }, text: lst('小字号'), checked: this.smallFont ? true : false, type: MenuItemType.switch },
                { name: 'fullWidth', icon: { name: 'bytedance-icon', code: 'fullwidth' }, text: lst('宽版'), checked: this.isFullWidth ? true : false, type: MenuItemType.switch },
                { type: MenuItemType.divide },
                {
                    text: lst('主题'),
                    icon: PlatteSvg,
                    name: 'theme',
                },
                {
                    text: lst('小部件'),
                    icon: FieldsSvg,
                    childs: [
                        { name: 'onlyDisplayContent', text: lst('标题'), type: MenuItemType.switch, checked: this.hideDocTitle ? false : true, icon: HSvg },
                        {
                            name: 'pageAuthor', text: lst('作者'), icon: { name: 'bytedance-icon', code: 'edit-name' },
                            type: MenuItemType.switch, checked: this.exists(g => g.url == BlockUrlConstant.PageAuthor)
                        },
                        { type: MenuItemType.divide },
                        { name: 'pageUpvotedOrShared', text: lst('点赞分享'), icon: { name: 'bytedance-icon', code: 'send' }, type: MenuItemType.switch, checked: this.exists(g => g.url == BlockUrlConstant.PageUpvotedOrShared) },
                        { name: 'prevOrNext', text: lst('上下篇'), icon: { name: 'bytedance-icon', code: 'transfer-data' }, type: MenuItemType.switch, checked: this.exists(g => g.url == BlockUrlConstant.PagePreOrNext) },
                        { name: 'showComment', text: lst("评论"), icon: CommentSvg, type: MenuItemType.switch, checked: this.exists(g => g.url == BlockUrlConstant.Comment) },
                        { name: 'refPages', text: lst("引用"), visible: [ElementType.SchemaRecordView].includes(this.pe.type) ? false : true, icon: CustomizePageSvg, type: MenuItemType.switch, checked: this.exists(g => g.url == BlockUrlConstant.RefLinks) },
                        { type: MenuItemType.divide },
                        { type: MenuItemType.help, url: window.shyConfig?.isUS ? "https://help.shy.red/page/68#sm8Eix3mziuLx83RnrUYw8" : "https://help.shy.live/page/1988#5ChJozytSL93WbD7Uxy8sk", text: lst('了解如何使用小组件') }
                    ]
                },
                { type: MenuItemType.divide },
                { name: 'lock', disabled: this.isCanManage ? false : true, text: this.locker?.lock ? lst("除消编辑保护") : lst("编辑保护"), icon: this.locker?.lock ? LockSvg : UnlockSvg },
                {
                    name: 'turnToDoc',
                    text: lst('转换为文档'),
                    icon: { name: 'byte', code: 'cycle-one' },
                    // label: UA.isMacOs ? "⌘+Shift+P" : "Ctrl+Shift+P"
                },
                {
                    name: 'copy', text: lst('拷贝'), icon: DuplicateSvg,
                    label: UA.isMacOs ? "⌘+D" : "Ctrl+D"
                },
                {
                    name: 'move', text: lst('移动'), icon: MoveToSvg,
                    label: UA.isMacOs ? "⌘+Shift+P" : "Ctrl+Shift+P"
                },
                { name: 'export', iconSize: 16, text: lst('导出'), icon: { name: 'bytedance-icon', code: 'download-one' } },
                { name: 'delete', icon: TrashSvg, text: lst('删除'), label: "Del" },
                { type: MenuItemType.divide },
                { name: 'undo', text: lst('撤消'), icon: UndoSvg, disabled: this.snapshoot.historyRecord.isCanUndo ? false : true, label: UA.isMacOs ? "⌘+Z" : 'Ctrl+Z' },
                { name: 'redo', text: lst('重做'), icon: RedoSvg, disabled: this.snapshoot.historyRecord.isCanRedo ? false : true, label: UA.isMacOs ? "⌘+Y" : 'Ctrl+Y' },
                ...(window.shyConfig.isDev || window.shyConfig.isBeta || this.ws?.sn == 19 ? [
                    { type: MenuItemType.divide },
                    { name: 'requireTemplate', icon: { name: 'byte', code: 'graphic-stitching' } as any, text: lst('申请模板') },
                ] : []),
                { type: MenuItemType.divide },
                {
                    name: 'copylink', icon: LinkSvg, text: lst('复制链接'),
                    label: UA.isMacOs ? "⌥+Shift+L" : "Alt+Shift+L"
                },
                { name: 'history', icon: VersionHistorySvg, text: lst('页面历史') },
            ];
        }
        else if (this.pageLayout.type == PageLayoutType.textChannel) {
            items = [
                { name: 'smallText', icon: { name: 'bytedance-icon', code: 'add-text' }, text: lst('小字号'), checked: this.smallFont ? true : false, type: MenuItemType.switch },
                {
                    name: 'fullWidth', icon: { name: 'bytedance-icon', code: 'fullwidth' }, text: lst('宽版'),
                    updateMenuPanel: true,
                    checked: this.isFullWidth ? true : false, type: MenuItemType.switch
                },
                {
                    text: lst('主题'),
                    icon: PlatteSvg,
                    name: 'theme',
                    visible(items) {
                        var ic = items.find(g => g.name == 'fullWidth');
                        return ic.checked ? false : true;
                    }
                },
                { type: MenuItemType.divide },
                {
                    name: 'speak',
                    text: lst('发言'),
                    icon: { name: 'bytedance-icon', code: 'voice-one' },
                    type: MenuItemType.select,
                    value: this.pageInfo?.speak || 'more',
                    options: [
                        { text: lst('允许多人发言'), value: 'more' },
                        { text: lst('禁言'), value: 'unspeak' },
                        { text: lst('仅限每人发言一次'), value: "only" }
                    ]
                },
                { type: MenuItemType.divide },
                {
                    name: 'copy', text: lst('拷贝'),
                    icon: DuplicateSvg,
                    label: UA.isMacOs ? "⌘+D" : "Ctrl+D"
                },
                {
                    name: 'move', text: lst('移动'),
                    icon: MoveToSvg,
                    label: UA.isMacOs ? "⌘+Shift+P" : "Ctrl+Shift+P"
                },
                { name: 'delete', icon: TrashSvg, text: lst('删除'), label: "Del" },
                { type: MenuItemType.divide },
                {
                    name: 'copylink', icon: LinkSvg, text: lst('复制链接'),
                    label: UA.isMacOs ? "⌥+Shift+L" : "Alt+Shift+L"
                },
            ];
        }
        else if (this.pageLayout.type == PageLayoutType.board) {
            items = [
                // {
                //     text: lst('主题'),
                //     icon: PlatteSvg,
                //     name: 'theme',
                // },
                // { type: MenuItemType.divide },
                { name: 'lock', disabled: this.isCanManage ? false : true, text: this.locker?.lock ? lst("除消编辑保护") : lst("编辑保护"), icon: this.locker?.lock ? LockSvg : UnlockSvg },
                {
                    name: 'copy', text: lst('拷贝'), icon: DuplicateSvg,
                    label: UA.isMacOs ? "⌘+D" : "Ctrl+D"
                },
                {
                    name: 'move', text: lst('移动'), icon: MoveToSvg,
                    label: UA.isMacOs ? "⌘+Shift+P" : "Ctrl+Shift+P"
                },
                { name: 'export', iconSize: 16, text: lst('导出'), icon: { name: 'bytedance-icon', code: 'download-one' } },
                { name: 'delete', icon: TrashSvg, text: lst('删除'), label: "Del" },
                { type: MenuItemType.divide },
                { name: 'undo', text: lst('撤消'), icon: UndoSvg, disabled: this.snapshoot.historyRecord.isCanUndo ? false : true, label: 'Ctrl+Z' },
                { name: 'redo', text: lst('重做'), icon: RedoSvg, disabled: this.snapshoot.historyRecord.isCanRedo ? false : true, label: 'Ctrl+Y' },
                ...(window.shyConfig.isDev || window.shyConfig.isBeta || this.ws?.sn == 19 ? [
                    { type: MenuItemType.divide },
                    { name: 'requireTemplate', icon: { name: 'byte', code: 'graphic-stitching' } as any, text: lst('申请模板') },
                ] : []),
                { type: MenuItemType.divide },
                {
                    name: 'copylink', icon: LinkSvg, text: lst('复制链接'),
                    label: UA.isMacOs ? "⌥+Shift+L" : "Alt+Shift+L"
                },
                { name: 'history', icon: VersionHistorySvg, text: lst('页面历史') }

            ];
        }
        if (this.pageInfo?.editor) {
            items.push({
                type: MenuItemType.divide,
            });
            if (this.pageInfo.editDate) items.push({
                type: MenuItemType.text,
                text: lst('编辑于 ') + util.showTime(new Date(this.pageInfo.editDate))
            });
            var re = await channel.get('/user/basic', { userid: this.pageInfo.editor });
            if (re?.data?.user) items.push({
                type: MenuItemType.text,
                text: lst('编辑人 ') + re.data.user.name
            });
        }
        else if (this.pageInfo?.creater) {
            items.push({
                type: MenuItemType.divide,
            });
            if (this.pageInfo?.createDate) items.push({
                type: MenuItemType.text,
                text: lst('创建于 ') + util.showTime(new Date(this.pageInfo.createDate))
            });
            var re = await channel.get('/user/basic', { userid: this.pageInfo.creater });
            if (re?.data?.user) items.push({
                type: MenuItemType.text,
                text: lst('创建人 ') + re.data.user.name
            });
        }
        if (items.length == 0) return;
        var r = await useSelectMenuItem({ roundArea: Rect.fromEvent(event) }, items, {
            overflow: 'visible',
            input: (item) => {
                if (item.name == 'smallText') {
                    this.onUpdateProps({ smallFont: item.checked }, true);
                }
                else if (item.name == 'fullWidth') {
                    this.onUpdateProps({ isFullWidth: item.checked }, true);
                }
                else if (item.name == 'isPageContent') {
                    this.onUpdateProps({ isPageContent: item.checked }, true);
                }
                else if (item.name == 'turnToPPT') {
                    this.onTurnToPPT();
                }
                else if (item.name == 'turnToDoc') {
                    this.onTurnToDoc();
                }
                else if (item.name == 'onlyDisplayContent') {
                    this.onAction('onlyDisplayContent', async () => {
                        var title = this.find(g => g.url == BlockUrlConstant.Title);
                        if (!title) {
                            await this.createBlock(BlockUrlConstant.Title, {}, this.views[0], 0, 'childs');
                        }
                        await this.updateProps({ hideDocTitle: item.checked ? false : true })
                        this.addPageUpdate();
                    });
                }
                else if (item.name == 'nav') {
                    this.onToggleOutline({ nav: item.checked })
                }
                else if (item.name == 'refPages') {
                    this.onToggleRefPages({ refPages: item.checked })
                }
                else if (item.name == 'speak') {
                    this.onChangeTextChannelSpeak(item.value as any)
                }
                else if (item.name == 'showComment') {
                    this.onToggleComments(item.checked)
                }
                else if (item.name == 'showCover') {
                    this.onAddCover(item.checked ? false : true);
                }
                else if (item.name == 'pageAuthor') {
                    this.onTogglePageAuthor(item.checked);
                }
                else if (item.name == 'pageUpvotedOrShared') {
                    this.onToggleUpvotedOrShared(item.checked);
                }
                else if (item.name == 'prevOrNext') {
                    this.onTogglePrevOrNext(item.checked);
                }
            }
        });
        if (r) {
            if (r.item.name == 'copylink') {
                CopyText(this.pageUrl);
                ShyAlert(lst('复制链接'));
            }
            else if (r.item.name == 'lock') {
                this.onLockPage();
            }
            else if (r.item.name == 'delete') {
                if (await Confirm(lst('确认要删除吗?'))) {
                    this.onPageRemove()
                }
            }
            else if (r.item.name == 'copy') {
                await this.onPageCopy();
            }
            else if (r.item.name == 'move') {
                await this.onPageMove();
            }
            else if (r.item.name == 'undo') {
                this.onUndo();
            }
            else if (r.item.name == 'redo') {
                this.onRedo();
            }
            else if (r.item.name == 'history') {
                this.onOpenHistory()
            }
            else if (r.item.name == 'turnToPPT') {
                this.onTurnToPPT();
            }
            else if (r.item.name == 'turnToDoc') {
                this.onTurnToDoc();
            }
            else if (r.item.name == 'theme') {
                this.onOpenTheme()
            }
            else if (r.item.name == 'ai-sync-turn') {
                this.onSyncAi(r.item.value, true);
            }
            else if (r.item.name == 'ai-sync') {
                this.onSyncAi(r.item.value, false);
            }
            else if (r.item.name == 'ai-open') {
                this.onOpenRobot(r.item.value);
            }
            else if (r.item.name == 'export') {
                this.onExport();
            }
            else if (r.item.name == 'requireTemplate') {
                this.onRequireTemplate()
            }
        }
    }
    async onOpenHistory(this: Page) {
        var result = await usePageHistoryStore(this);
        if (result) {
            this.emit(PageDirective.rollup, result);
        }
    }
    async onPageCopy(this: Page) {
        await channel.act('/current/page/copy');
    }
    async onPageMove(this: Page) {
        await channel.act('/current/page/move');
    }
    async onOpenPublish(this: Page, event: React.MouseEvent) {
        await usePagePublish({ roundArea: Rect.fromEvent(event) }, this)
    }
    async onOpenMember(this: Page, event: React.MouseEvent) {
        this.showMembers = this.showMembers ? false : true;
        this.forceUpdate()
    }
    async onOpenFieldProperty(this: Page, event: React.MouseEvent) {
        var self = this;
        var view = this.schema.recordViews.find(g => g.id == this.pe.id1)
        var r = await useSelectMenuItem(
            { roundArea: Rect.fromEvent(event) },
            [
                {
                    name: 'viewDisplay',
                    type: MenuItemType.buttonOptions,
                    value: this.formType,
                    options: [
                        {
                            text: lst('默认'),
                            value: 'doc',
                            icon: { name: 'bytedance-icon', code: 'editor' },
                            overlay: lst('数据记录浏览编辑')
                        },
                        {
                            text: lst('表单'),
                            value: 'doc-add',
                            icon: { name: 'bytedance-icon', code: 'doc-add' },
                            overlay: lst('收集数据的数据表单')
                        },
                        {
                            text: lst('清单'),
                            value: 'doc-detail',
                            icon: { name: 'bytedance-icon', code: 'doc-detail' },
                            overlay: lst('只读的数据记录清单')
                        }
                    ]
                },
                { type: MenuItemType.divide },
                {
                    icon: { name: 'bytedance-icon', code: 'one-key' },
                    name: 'disabledUserMultiple',
                    text: lst('仅允许提交一次'),
                    type: MenuItemType.switch,
                    checked: view?.disabledUserMultiple,
                    visible: this.isSchemaRecordViewTemplate ? true : false
                },
                {
                    icon: { name: 'bytedance-icon', code: 'personal-privacy' },
                    name: 'allowAnonymous',
                    text: lst('允许匿名提交'),
                    type: MenuItemType.switch,
                    checked: view?.allowAnonymous,
                    visible: this.isSchemaRecordViewTemplate ? true : false
                },
                {
                    name: 'editForm',
                    icon: { name: 'bytedance-icon', code: 'arrow-right-up' },
                    text: lst('编辑模板'),
                    visible: this.pe.type == ElementType.SchemaRecordViewData || this.pe.type == ElementType.SchemaRecordView && !this.isSchemaRecordViewTemplate ? true : false
                },
                {
                    type: MenuItemType.gap,
                    visible: true
                },
                { text: lst('显示字段'), type: MenuItemType.text },
                ...this.schema.allowFormFields.findAll(g => (this.pe.type == ElementType.SchemaRecordView && !this.isSchemaRecordViewTemplate || this.pe.type == ElementType.SchemaData) && g.type == FieldType.title ? false : true).toArray(uf => {
                    if (this.pe.type == ElementType.SchemaData && uf.type == FieldType.title) return;
                    return {
                        icon: GetFieldTypeSvg(uf.type),
                        name: uf.id,
                        text: uf.text,
                        type: MenuItemType.switch,
                        checked: this.exists(c => (c instanceof OriginFormField) && c.field.id == uf.id)
                    }
                }),
                { type: MenuItemType.divide },
                {
                    name: 'hidePropTitle',
                    type: MenuItemType.switch,
                    checked: this.findAll(g => g instanceof OriginFormField).every(c => (c as OriginFormField).hidePropTitle !== true),
                    icon: { name: 'bytedance-icon', code: 'tag-one' },
                    text: lst('字段属性名')
                },
                {
                    name: 'hideAllFields',
                    icon: EyeHideSvg,
                    text: lst('隐藏所有字段')
                }
            ],
            {
                input: async (newItem) => {
                    if (['disabledUserMultiple', 'allowAnonymous'].includes(newItem.name)) {
                        self.onChangeSchemaView(view.id, { [newItem.name]: newItem.checked })
                    }
                    else if (newItem.name == 'hidePropTitle') {
                        self.onAction('hideAllFields', async () => {
                            var fs = self.findAll(c => (c instanceof OriginFormField));
                            var isHide = (fs[0] as OriginFormField)?.hidePropTitle ? false : true
                            for (let f of fs) {
                                await f.updateProps({ hidePropTitle: isHide }, BlockRenderRange.self)
                            }
                        })
                    }
                    else self.onToggleFieldView(this.schema.allowFormFields.find(g => g.id == newItem.name), newItem.checked)
                }
            }
        )
        if (r) {
            if (r.item.name == 'editForm') {
                self.onFormOpen('template');
            }
            else if (r.item.name == 'hideAllFields') {
                self.onAction('hideAllFields', async () => {
                    var fs = self.findAll(c => (c instanceof OriginFormField));
                    for (let f of fs) {
                        await f.delete()
                    }
                })
            }
            else if (r.item.name == 'hidePropTitle') {
                self.onAction('hideAllFields', async () => {
                    var fs = self.findAll(c => (c instanceof OriginFormField));
                    for (let f of fs) {
                        await f.updateProps({ hidePropTitle: true }, BlockRenderRange.self)
                    }
                })
            }
            else if (r.item.name == 'viewDisplay') {
                await this.onTurnForm(r.item.value);
            }
        }
    }
    async onTurnForm(this: Page, value: 'doc' | 'doc-add' | 'doc-detail') {
        var self = this;
        await this.onAction('onTurnForm', async () => {
            var fs = this.findAll(g => g instanceof OriginFormField) as OriginFormField[];
            for (let i = 0; i < fs.length; i++) {
                var off = fs[i];
                await off.turnForm(value);
            }
            if (value == 'doc-add') {
                var title = self.find(g => g.url == BlockUrlConstant.Title) as Title;
                await title.updateProps({ align: 'center' })
                var button = self.find(g => g.url == BlockUrlConstant.Button && (g as BlockButton).isFormSubmit() == true) as BlockButton;
                if (!button) {
                    var last: Block = self.findReverse(g => (g instanceof OriginFormField));
                    if (!last) {
                        last = self.views[0].childs.last();
                    }
                    if (last) {
                        await last.visibleDownCreateBlock(BlockUrlConstant.Button, {
                            align: 'center',
                            buttonText: lst('提交') + this.getPageDataInfo()?.text,
                            flow: {
                                commands: [{ url: '/form/submit' }]
                            }
                        });
                    }
                }
            }
            else {
                var button = self.find(g => g.url == BlockUrlConstant.Button && (g as BlockButton).isFormSubmit() == true) as BlockButton;
                if (button) await button.delete();
            }
            await this.updateProps({ formType: value })
        })
    }
    async onChangeSchemaView(this: Page, viewId: string, props) {
        var view = this.schema.views.find(g => g.id == viewId);
        if (view) {
            this.schema.onSchemaOperate([{ name: 'updateSchemaView', id: view.id, data: props }])
        }
    }
    async onToggleFieldView(this: Page, field: Field, checked: boolean) {
        await this.onAction('onToggleFieldView', async () => {
            if (checked) {
                var b: Record<string, any> = GetFieldFormBlockInfo(field);
                if (b) {
                    b.fieldMode = 'detail';
                    var at = this.views[0].childs.findLastIndex(c => (c instanceof OriginFormField))
                    if (at == -1) at = 0;
                    var newBlock = await this.createBlock(b.url, b, this.views[0], at);
                    if (this.formRowData) newBlock.updateProps({ value: field.getValue(this.formRowData) })
                }
            }
            else {
                var f = this.find(c => (c instanceof OriginFormField) && c.field.id == field.id);
                if (f) await f.delete()
            }
        });
        this.view.forceUpdate();
    }
    async onOpenTheme(this: Page) {
        await usePageTheme(this);
    }
    async onPageRemove(this: Page) {
        channel.air('/page/remove', { item: this.pageInfo.id });
    }
    async onOpenRobot(this: Page, robot: RobotInfo) {
        await channel.air('/robot/open', { robot });
    }
    async onSyncAi(this: Page, robot: RobotInfo, isTurn?: boolean) {
        ShyAlert(lst('正在同步中...'), 'warn', isTurn ? 1000 * 60 * 10 : 1000 * 4);
        try {
            var r = await channel.put('/sync/wiki/doc', {
                robotId: robot.robotId,
                elementUrl: this.customElementUrl,
                pageText: this.getPageDataInfo()?.text,
                contents: [{ id: util.guid(), content: await this.getMd() }]
            })
            if (isTurn) {
                if (r.ok) {
                    ShyAlert(lst('正在微调中...'), 'warn', isTurn ? 1000 * 60 * 10 : 1000 * 60 * 2);
                    await new Promise((resolve, reject) => {
                        channel.post('/fetch', {
                            url: '/robot/doc/embedding/stream',
                            data: {
                                id: r.data.doc.id,
                                model: getAiDefaultModel(robot.embeddingModel, 'embedding')
                            },
                            method: 'post',
                            callback: (str, done) => {
                                if (done) {
                                    resolve(done);
                                }
                            }
                        })
                    })

                }
            }
        }
        catch (ex) {
            this.onError(ex)
        }
        finally {
            if (isTurn)
                CloseShyAlert()
        }
    }
    async onLockPage(this: Page, lock?: boolean) {
        await this.onAction(ActionDirective.onPageLock, async () => {
            await this.updateProps({
                locker: {
                    userid: this.user?.id,
                    date: Date.now(),
                    lock: this.locker?.lock ? false : true
                }
            });
            this.addPageUpdate();
        })
    }
    async onExport(this: Page) {
        if (this.pe.type == ElementType.Schema) {
            var dg: DataGridView = this.find(g => g instanceof DataGridView) as DataGridView;
            if (dg) {
                dg.onExport()
            }
        }
        else await useExportFile({ page: this });
    }
    async onRequireTemplate(this: Page) {
        var ws = this.ws;
        var tg = await channel.get('/get/workspace/template', {
            wsId: ws.id,
            pageId: this.pageInfo?.id,
            elementUrl: this.elementUrl,
        });
        var tgd = tg.data?.template || {};
        var rf = await useForm({
            maskCloseNotSave: true,
            deleteButton: true,
            title: lst('申请模板'),
            model: {
                classify: tgd['classify'],
                tags: tgd['tags'],
                description: tgd['description'],
                text: tgd['text'] || this.pageInfo?.text
            },
            fields: [
                { name: 'text', text: lst('标题'), type: 'input' },
                { name: 'description', text: lst('描述'), type: 'textarea' },
                {
                    name: 'tags',
                    text: lst('标签'),
                    multiple: true,
                    type: 'select',
                    options: PageTemplateTags.map(p => {
                        return {
                            text: p.text,
                            value: p.text,
                            type: p.type
                        }
                    })
                },
                {
                    name: 'classify',
                    text: lst('分类'),
                    type: 'select',
                    multiple: true,
                    options: PageTemplateTypeGroups.map(c => {
                        return {
                            text: c.text,
                            icon: c.icon,
                            value: c.text
                        }
                    })
                }
            ]
        })
        if (rf) {
            ShyAlert(rf && rf.delete == true ? lst('正在删除中...') : lst('正在申请中...'), 'warn', 1000 * 60 * 10);
            try {
                if (rf && rf.delete == true) {
                    await channel.del('/del/workspace/template', { id: tg.data.template.id });
                }
                else {
                    var g = await channel.post('/create/template', { config: { pageId: this.pageInfo?.id } })
                    if (g.ok) {
                        var r = await channel.post('/download/file', { url: g.data.file.url });
                        if (r.ok) {
                            await channel.post('/create/workspace/template', {
                                wsId: ws.id,
                                pageId: this.pageInfo?.id,
                                type: 'page',
                                templateUrl: r.data.file.url,
                                elementUrl: this.elementUrl,
                                text: rf.text,
                                description: rf.description,
                                file: r.data.file,
                                icon: this.pageInfo?.icon,
                                config: {
                                    classify: rf.classify,
                                    tags: rf.tags
                                }
                            });
                        }
                    }
                }
            }
            catch (ex) {

            }
            finally {
                CloseShyAlert()
            }
        }
    }
    async onCopyPage(this: Page) {
        await channel.act('/current/page/copy');
    }
    async onMovePage(this: Page, event: React.MouseEvent) {
        await channel.act('/current/page/move', { event: event } as any);
    }
}


