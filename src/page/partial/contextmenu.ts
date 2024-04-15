
import React from "react";
import { Page } from "..";
import { useSelectMenuItem } from "../../../component/view/menu";
import { MenuItem, MenuItemType } from "../../../component/view/menu/declare";
import { BlockDirective, BlockRenderRange } from "../../block/enum";
import { Point, Rect } from "../../common/vector/point";
import { PageLayoutType } from "../declare";
import {
    AiStartSvg,
    CommentSvg,
    CustomizePageSvg,
    DuplicateSvg,
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
import { ShyAlert } from "../../../component/lib/alert";
import { channel } from "../../../net/channel";
import { Confirm } from "../../../component/lib/confirm";
import { BlockUrlConstant } from "../../block/constant";
import { GetFieldTypeSvg } from "../../../blocks/data-grid/schema/util";
import { OriginFormField } from "../../../blocks/data-grid/element/form/origin.field";
import { ElementType } from "../../../net/element.type";
import { FieldType } from "../../../blocks/data-grid/schema/type";

import { util } from "../../../util/util";
import { ActionDirective } from "../../history/declare";
import { lst } from "../../../i18n/store";
import { Block } from "../../block";
import { UA } from "../../../util/ua";
import lodash from "lodash";

export class Page$ContextMenu {
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
                        { type: MenuItemType.help, url: window.shyConfig?.isUS ? "https://help.shy.red/page/68#sm8Eix3mziuLx83RnrUYw8" : "https://help.shy.live/page/1988#5ChJozytSL93WbD7Uxy8sk", text: lst('了解如何使用小部件') }
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
                        { type: MenuItemType.help, url: window.shyConfig?.isUS ? "https://help.shy.red/page/68#sm8Eix3mziuLx83RnrUYw8" : "https://help.shy.live/page/1988#5ChJozytSL93WbD7Uxy8sk", text: lst('了解如何使用小部件') }
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
                        { type: MenuItemType.help, url: window.shyConfig?.isUS ? "https://help.shy.red/page/68#sm8Eix3mziuLx83RnrUYw8" : "https://help.shy.live/page/1988#5ChJozytSL93WbD7Uxy8sk", text: lst('了解如何使用小部件') }
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
    /**
   * 对block打开右键菜单
   * @param this 
   * @param blocks 
   * @param event 
   */
    async onOpenMenu(this: Page, blocks: Block[], event: MouseEvent | Point) {
        if (!(event instanceof Point)) event.preventDefault();
        if (blocks.length == 1) {
            try {
                return await blocks[0].onContextmenu(event);
            }
            catch (ex) {
                console.error(ex)
                return;
            }
        }
        var isSameUrl = blocks.every(b => b.url == blocks[0].url);
        var menus = await blocks[0].onGetContextMenus();
        if (!isSameUrl) {
            lodash.remove(menus, c => c.name == BlockDirective.link);
            var ns = await blocks[0].onGetTurnMenus();
            await blocks.eachAsync(async (b, i) => {
                if (i == 0) return;
                var ms = await b.onGetContextMenus();
                lodash.remove(menus, c => !ms.some(m => m.name == c.name));
                if (menus.some(s => s.name == BlockDirective.trun)) {
                    var ts = await b.onGetTurnMenus();
                    if (!lodash.isEqual(ns.map(n => n.url), ts.map(c => c.url))) {
                        lodash.remove(menus, c => c.name == BlockDirective.trun)
                    }
                }
            })
        }
        menus = util.neighborDeWeight(menus, c => (c.name + "") + c.type);
        if (menus[0]?.type == MenuItemType.divide) menus = menus.slice(1);
        else if (menus.last()?.type == MenuItemType.divide) menus = menus.slice(0, -1);
        var re = await useSelectMenuItem(
            {
                roundPoint: event instanceof Point ? event : Point.from(event),
                direction: 'left'
            },
            menus,
            {
                input: async (e) => {
                    await blocks.eachAsync(async b => {
                        await b.onContextMenuInput(e, { merge: true })
                    })
                }
            }
        );
        if (re) {
            await this.onClickBatchBlocksContextMenu(blocks, re.item, re.event)
        }
    }
    async onClickBatchBlocksContextMenu(this: Page, blocks: Block[], item: MenuItem<BlockDirective | string>, event: MouseEvent) {
        switch (item.name) {
            case BlockDirective.delete:
                this.onBatchDelete(blocks);
                break;
            case BlockDirective.copy:
                /**
                 * 复制块
                 */
                this.onAction(ActionDirective.onCopyBlock, async () => {
                    var bs = await blocks.asyncMap(async b => b.cloneData());
                    var at = blocks[0].at;
                    var to = blocks.last().at;
                    var pa = blocks[0].parent;
                    var newBlocks = await pa.appendArrayBlockData(bs, Math.max(at, to) + 1, blocks.first().parentKey);
                    this.addUpdateEvent(async () => {
                        this.kit.anchorCursor.onSelectBlocks(newBlocks, { render: true, merge: true });
                    })
                });
                break;
            case BlockDirective.link:
                CopyText(blocks[0].blockUrl);
                ShyAlert(lst('块的链接已复制'))
                break;
            case BlockDirective.trun:
                this.onBatchTurn(blocks, item.url);
                break;
            case BlockDirective.trunIntoPage:
                break;
            case 'fontColor':
                this.onAction('setFontStyle', async () => {
                    await blocks.eachAsync(async (block) => {
                        await block.pattern.setFontStyle({ color: item.value });
                        this.addBlockUpdate(block);
                    })
                })
                break;
            case 'fillColor':
                this.onAction('setFillStyle', async () => {
                    await blocks.eachAsync(async (block) => {
                        await block.pattern.setFillStyle({ mode: 'color', color: item.value })
                        this.addBlockUpdate(block);
                    })
                })
                break;
            case 'askAi':
                this.kit.writer.onAskAi(blocks)
                break;
            default:
                await blocks.eachAsync(async (block) => {
                    await block.onClickContextMenu(item, event, { merge: true });
                })
        }
    }
    async onOpenFormMenu(this: Page, event: React.MouseEvent) {
        var self = this;
        var view = this.schema.recordViews.find(g => g.id == this.pe.id1)
        var viewType = this.getPageSchemaRecordType();
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
                            overlay: lst('数据浏览编辑')
                        },
                        {
                            text: lst('表单'),
                            value: 'doc-add',
                            icon: { name: 'bytedance-icon', code: 'doc-add' },
                            overlay: lst('收集数据表单')
                        },
                        {
                            text: lst('清单'),
                            value: 'doc-detail',
                            icon: { name: 'bytedance-icon', code: 'doc-detail' },
                            overlay: lst('只读的数据清单')
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
                    visible: viewType == 'template' ? true : false
                },
                {
                    icon: { name: 'bytedance-icon', code: 'personal-privacy' },
                    name: 'allowAnonymous',
                    text: lst('允许匿名提交'),
                    type: MenuItemType.switch,
                    checked: view?.allowAnonymous,
                    visible: viewType == 'template' ? true : false
                },
                {
                    name: 'editForm',
                    icon: { name: 'bytedance-icon', code: 'arrow-right-up' },
                    text: lst('编辑模板'),
                    visible: viewType == 'add' || viewType == 'template-edit'
                },
                {
                    type: MenuItemType.gap,
                    visible: viewType == 'origin-edit' ? false : true
                },
                { text: lst('显示字段'), type: MenuItemType.text },
                ...this.schema.allowFormFields.findAll(g => viewType != 'template' && g.type == FieldType.title ? false : true).toArray(uf => {
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
                    text: lst('隐藏字段文本')
                },
                {
                    name: 'hideAllFields',
                    icon: { name: 'byte', code: 'clear-format' },
                    text: lst('清空页面所有字段')
                },
                { type: MenuItemType.divide },
                {
                    text: lst('了解如何设置数据表记录页面'),
                    type: MenuItemType.help,
                    url: window.shyConfig?.isUS ? "https://help.shy.red/page/42#vQh5qaxCEC3aPjuFisoRh5" : "https://help.shy.live/page/1870#3Fgw3UNGQErf8tZdJnhjru"
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
            else if (this.schema.fields.some(s => s.id == r.item.name)) {
                var sf = this.schema.fields.find(s => s.id == r.item.name);
                this.onToggleFieldView(sf, r.item.checked)
            }
        }
    }
}


