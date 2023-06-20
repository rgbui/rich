
import React from "react";
import { Page } from "..";
import { useSelectMenuItem } from "../../../component/view/menu";
import { MenuItem, MenuItemType } from "../../../component/view/menu/declare";
import { BlockDirective } from "../../block/enum";
import { Point, Rect } from "../../common/vector/point";
import { PageLayoutType } from "../declare";
import {
    AiStartSvg,
    BookSvg,
    CardBackgroundFillSvg,
    CommentSvg,
    CommunicationSvg,
    ComponentsSvg,
    CustomizePageSvg,
    EditSvg,
    FieldsSvg,
    FourLeavesSvg,
    GlobalLinkSvg,
    HSvg,
    LinkSvg,
    LockSvg,
    LogoutSvg,
    NoteSvg,
    OutlineSvg,
    PlatteSvg,
    RefreshOneSvg,
    RefreshSvg,
    ThemeSvg,
    TrashSvg,
    UndoSvg,
    UnlockSvg,
    UploadSvg,
    VersionHistorySvg
} from "../../../component/svgs";
import { usePageLayout } from "../../../extensions/layout";
import { CopyText } from "../../../component/copy";
import { CloseShyAlert, ShyAlert } from "../../../component/lib/alert";
import { channel } from "../../../net/channel";
import { Confirm } from "../../../component/lib/confirm";
import { usePageHistoryStore } from "../../../extensions/history";
import { PageDirective } from "../directive";
import { usePagePublish } from "../../../extensions/publish";
import { BlockUrlConstant } from "../../block/constant";
import { DataGridForm } from "../../../blocks/data-grid/view/form";
import { useCardBoxStyle } from "../../../extensions/doc.card/style";
import { GetFieldTypeSvg } from "../../../blocks/data-grid/schema/util";
import { OriginFormField } from "../../../blocks/data-grid/element/form/origin.field";
import { Field } from "../../../blocks/data-grid/schema/field";
import { GetFieldFormBlockInfo } from "../../../blocks/data-grid/element/service";
import { ElementType } from "../../../net/element.type";
import { FieldType } from "../../../blocks/data-grid/schema/type";
import { getWsWikiRobots } from "../../../net/ai/robot";
import { util } from "../../../util/util";

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
            text: '编辑保护',
            name: 'lock'
        });
        items.push({ type: MenuItemType.divide });
        // items.push({ name: 'add-favourite', text: '星标' });
        items.push({ name: 'copy-link', text: '复制链接' })
        items.push({ type: MenuItemType.divide });
        items.push({ name: 'show-all', text: '显示所有内容' });
        // items.push({ name: 'show-grid', text: '显示网格' })
        return items;
    }
    async onClickContextMenu(this: Page, item: MenuItem<BlockDirective | string>, event: MouseEvent) {
        if (this.isBoard) return this.onClickBoardContextMenu(item, event);
        switch (item.name) {

        }
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
        var items: MenuItem<BlockDirective | string>[] = [];
        var robots = await getWsWikiRobots();
        if (this.pageLayout.type == PageLayoutType.doc) {
            items = [
                { name: 'smallText', text: '小字号', checked: this.smallFont ? true : false, type: MenuItemType.switch },
                { name: 'fullWidth', text: '宽版', checked: this.isFullWidth ? true : false, type: MenuItemType.switch },
                { type: MenuItemType.divide },
                { name: 'nav', text: '目录', icon: OutlineSvg, type: MenuItemType.switch, checked: this.nav },
                {
                    text: '小部件',
                    icon: FieldsSvg,
                    childs: [
                        { name: 'onlyDisplayContent', text: '标题', type: MenuItemType.switch, checked: this.onlyDisplayContent ? false : true, icon: HSvg },
                        { name: 'refPages', text: "引用", visible: [ElementType.SchemaRecordView, ElementType.SchemaData].includes(this.pe.type) ? false : true, icon: CustomizePageSvg, type: MenuItemType.switch, checked: this.autoRefPages },
                        { name: 'showComment', text: "评论", icon: CommentSvg, type: MenuItemType.switch, checked: this.exists(g => g.url == BlockUrlConstant.Comment) },
                    ]
                },
                {
                    name: 'theme',
                    text: '主题',
                    icon: ThemeSvg,
                    childs: [
                        { icon: GlobalLinkSvg, name: 'isWeb', text: '网页', checkLabel: this.isPageContent ? false : true },
                        { icon: NoteSvg, name: 'isContent', text: '内容', checkLabel: this.isPageContent ? true : false }
                    ]
                },
                {
                    icon: AiStartSvg,
                    text: "AI语料库",
                    childs: [
                        ...robots.map(robot => {
                            return {
                                type: MenuItemType.user,
                                userid: robot.robotId,
                                childs: [
                                    { name: 'ai-sync', value: robot.robotId, icon: RefreshSvg, text: '同步' },
                                    { name: 'ai-sync-turn', value: robot.robotId, icon: RefreshOneSvg, text: '同步且训练' },
                                ]
                            }
                        })
                    ]
                },
                // { name: 'border', text: "内容", checked: this.isPageContent },
                // { name: 'bg', text: '背景', icon: CardBackgroundFillSvg },
                // { type: MenuItemTypeValue.divide },
                // { name: 'favourite', icon: 'favorite:sy', text: '添加至收藏', disabled: true },
                { name: 'history', icon: VersionHistorySvg, text: '页面历史' },
                { name: 'copylink', icon: LinkSvg, text: '复制链接' },
                { type: MenuItemType.divide },
                { name: 'lock', text: this.isCanEdit ? "退出编辑" : '进入编辑', icon: this.isCanEdit ? LogoutSvg : EditSvg },
                // ...(this.isCanEdit && this.canEdit ? [
                //     { name: 'editSave', text: '保存更新', icon: EditSvg },
                // ] : []),
                { name: 'undo', text: '撤消', icon: UndoSvg, disabled: this.snapshoot.historyRecord.isCanUndo ? false : true, label: 'Ctrl+Z' },
                // { name: 'redo', text: '重做', icon: UndoSvg, disabled: this.snapshoot.historyRecord.isCanRedo ? false : true, label: 'Ctrl+Y' },
                { name: 'delete', icon: TrashSvg, text: '删除' },
                // { type: MenuItemTypeValue.divide },
                // { name: 'import', iconSize: 16, icon: ImportSvg, text: '导入', disabled: true },
                // { name: 'export', iconSize: 16, text: '导出', icon: FileSvg, disabled: true, remark: '导出PDF,HTML,Markdown' },
                // { type: MenuItemTypeValue.divide },
                // { name: 'move', text: '移动', icon: MoveToSvg, disabled: true },
            ];
        }
        else if (this.pageLayout.type == PageLayoutType.db) {
            items = [
                { name: 'smallText', text: '小字号', checked: this.smallFont ? true : false, type: MenuItemType.switch },
                { name: 'fullWidth', text: '宽版', checked: this.isFullWidth ? true : false, type: MenuItemType.switch },
                { type: MenuItemType.divide },
                {
                    text: '自定义页面',
                    icon: ComponentsSvg,
                    childs: [
                        { name: 'onlyDisplayContent', text: '标题', type: MenuItemType.switch, checked: this.onlyDisplayContent ? false : true, icon: NoteSvg },
                        { name: 'showComment', text: "评论", icon: CommentSvg, type: MenuItemType.switch, checked: this.exists(g => g.url == BlockUrlConstant.Comment) },
                    ]
                },
                { name: 'lock', text: this.isCanEdit ? "退出编辑" : '进入编辑', icon: this.isCanEdit ? LogoutSvg : EditSvg },
                // { type: MenuItemTypeValue.divide },
                // { name: 'favourite', icon: 'favorite:sy', text: '添加至收藏', disabled: true },
                // { name: 'history', icon: VersionHistorySvg, text: '页面历史' },
                { name: 'copylink', icon: LinkSvg, text: '复制链接' },
                { type: MenuItemType.divide },
                { name: 'undo', text: '撤消', icon: UndoSvg, disabled: this.snapshoot.historyRecord.isCanUndo ? false : true, label: 'Ctrl+Z' },
                // { name: 'redo', text: '重做', icon: UndoSvg, disabled: this.snapshoot.historyRecord.isCanRedo ? false : true, label: 'Ctrl+Y' },
                { name: 'delete', icon: TrashSvg, text: '删除' },
                // { type: MenuItemTypeValue.divide },
                // { name: 'import', iconSize: 16, icon: ImportSvg, text: '导入', disabled: true },
                // { name: 'export', iconSize: 16, text: '导出', icon: FileSvg, disabled: true, remark: '导出PDF,HTML,Markdown' },
                // { type: MenuItemTypeValue.divide },
                // { name: 'move', text: '移动', icon: MoveToSvg, disabled: true },
            ];
        }
        else if (this.pageLayout.type == PageLayoutType.docCard) {
            items = [
                { name: 'smallText', text: '小字号', checked: this.smallFont ? true : false, type: MenuItemType.switch },
                { name: 'fullWidth', text: '宽版', checked: this.isFullWidth ? true : false, type: MenuItemType.switch },
                { type: MenuItemType.divide },
                // { name: 'nav', text: '目录', icon: OutlineSvg, type: MenuItemType.switch, checked: this.nav },
                // {
                //     text: '自定义页面',
                //     icon: FieldsSvg,
                //     childs: [
                //         { name: 'refPages', text: "显示引用", icon: CustomizePageSvg, type: MenuItemType.switch, checked: this.autoRefPages },
                //         { name: 'showComment', text: "显示评论", icon: CommentSvg, type: MenuItemType.switch, checked: this.exists(g => g.url == BlockUrlConstant.Comment) },
                //     ]
                // },
                {
                    name: 'bg',
                    text: '主题',
                    icon: PlatteSvg
                },
                { name: 'lock', text: this.isCanEdit ? "退出编辑" : '进入编辑', icon: this.isCanEdit ? LogoutSvg : EditSvg },
                // { type: MenuItemTypeValue.divide },
                // { name: 'favourite', icon: 'favorite:sy', text: '添加至收藏', disabled: true },
                { name: 'history', icon: VersionHistorySvg, text: '页面历史' },
                { name: 'copylink', icon: LinkSvg, text: '复制链接' },
                { type: MenuItemType.divide },
                { name: 'undo', text: '撤消', icon: UndoSvg, disabled: this.snapshoot.historyRecord.isCanUndo ? false : true, label: 'Ctrl+Z' },
                // { name: 'redo', text: '重做', icon: UndoSvg, disabled: this.snapshoot.historyRecord.isCanRedo ? false : true, label: 'Ctrl+Y' },
                { name: 'delete', icon: TrashSvg, text: '删除' },
                // { type: MenuItemTypeValue.divide },
                // { name: 'import', iconSize: 16, icon: ImportSvg, text: '导入', disabled: true },
                // { name: 'export', iconSize: 16, text: '导出', icon: FileSvg, disabled: true, remark: '导出PDF,HTML,Markdown' },
                // { type: MenuItemTypeValue.divide },
                // { name: 'move', text: '移动', icon: MoveToSvg, disabled: true },
            ];
        }
        else if (this.pageLayout.type == PageLayoutType.textChannel) {
            items = [
                //     // {
                //     //     name: 'channel',
                //     //     text: '频道',
                //     //     icon: FourLeavesSvg,
                //     //     type: MenuItemType.select,
                //     //     value: this.pageInfo?.textChannelMode || 'chat',
                //     //     options: [
                //     //         { text: '聊天', value: 'chat' },
                //     //         { text: '微博', value: "weibo" },
                //     //         // { text: '问答', value: "ask" },
                //     //         // { text: '贴吧', value: "tiebar" }
                //     //     ]
                //     // },
                // {
                //     name: 'speak',
                //     text: '发言',
                //     icon: CommunicationSvg,
                //     type: MenuItemType.select,
                //     value: this.pageInfo?.speak || 'more',
                //     options: [
                //         { text: '允许发言多次', value: 'more' },
                //         { text: '从此刻仅允许发言一次', value: "only" }
                //     ]
                // },
                //     // { type: MenuItemType.divide },
                //     //{ name: 'refPages', text: "显示引用", icon: CustomizePageSvg, type: MenuItemType.switch, checked: this.autoRefPages },
                //     { name: 'lock', text: this.pageInfo.locker?.userid ? "解除锁定" : '编辑保护', icon: this.pageInfo.locker?.userid ? UnlockSvg : LockSvg },
                //     // { type: MenuItemTypeValue.divide },
                //     // { name: 'favourite', icon: 'favorite:sy', text: '添加至收藏', disabled: true },
                //     //{ name: 'history', icon: VersionHistorySvg, text: '页面历史' },
                { type: MenuItemType.divide },
                { name: 'copylink', icon: LinkSvg, text: '复制链接' },
                //     { type: MenuItemType.divide },
                //     //{ type: MenuItemType.divide },
                //     //{ name: 'undo', text: '撤消', icon: UndoSvg, disabled: this.snapshoot.historyRecord.isCanUndo ? false : true, label: 'Ctrl+Z' },
                //     // { name: 'redo', text: '重做', icon: UndoSvg, disabled: this.snapshoot.historyRecord.isCanRedo ? false : true, label: 'Ctrl+Y' },
                //     { name: 'delete', icon: TrashSvg, text: '删除' },
                //     // { type: MenuItemTypeValue.divide },
                //     // { name: 'import', iconSize: 16, icon: ImportSvg, text: '导入', disabled: true },
                //     // { name: 'export', iconSize: 16, text: '导出', icon: FileSvg, disabled: true, remark: '导出PDF,HTML,Markdown' },
                //     // { type: MenuItemTypeValue.divide },
                //     // { name: 'move', text: '移动', icon: MoveToSvg, disabled: true },
            ];
        }
        else if (this.pageLayout.type == PageLayoutType.formView) {
            var block = this.find(c => c.url == BlockUrlConstant.FormView) as DataGridForm;
            if (block) block.onFormSettings(event);
            return;
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
                else if (item.name == 'onlyDisplayContent') {
                    this.onAction('onlyDisplayContent', async () => {
                        var title = this.find(g => g.url == BlockUrlConstant.Title);
                        if (!title) {
                            await this.createBlock(BlockUrlConstant.Title, {}, this.views[0], 0, 'childs');
                        }
                        await this.updateProps({ onlyDisplayContent: item.checked ? false : true })
                        this.addPageUpdate();
                    });
                }
                else if (item.name == 'nav') {
                    this.onOpenNav({ nav: item.checked })
                }
                else if (item.name == 'refPages') {
                    this.onOpenRefPages({ refPages: item.checked })
                }
                else if (item.name == 'channel') {
                    this.onChangeTextChannel(item.value as any)
                } else if (item.name == 'speak') {
                    this.onChangeTextChannelSpeak(item.value as any)
                }
                else if (item.name == 'showComment') {
                    this.onToggleComments(item.checked)
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
                this.onChangeEditMode();
            }
            else if (r.item.name == 'delete') {
                if (await Confirm('确认要删除吗?')) {
                    this.onPageRemove()
                }
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
            else if (r.item.name == 'bg') {
                this.onOpenBackground()
            }
            else if (r.item.name == 'isWeb' || r.item.name == 'isContent') {
                this.onUpdateProps({ isPageContent: r.item.name == 'isWeb' ? false : true }, true)
            }
            else if (r.item.name == 'ai-sync-turn') {
                this.onSyncAi(r.item.value, true);
            }
            else if (r.item.name == 'ai-sync') {
                this.onSyncAi(r.item.value, false);
            }
        }
    }
    async onOpenHistory(this: Page,) {
        var result = await usePageHistoryStore(this);
        if (result) {
            this.emit(PageDirective.rollup, result);
        }
    }
    async onOpenPublish(this: Page, event: React.MouseEvent) {
        await usePagePublish({ roundArea: Rect.fromEvent(event) }, this.pageInfo, this)
    }
    async openMember(this: Page, event: React.MouseEvent) {
        this.showMembers = this.showMembers ? false : true;
        this.forceUpdate()
    }
    async onOpenFieldProperty(this: Page, event: React.MouseEvent) {
        var self = this;
        var r = await useSelectMenuItem(
            { roundArea: Rect.fromEvent(event) },
            [
                { text: '显示字段', type: MenuItemType.text },
                ...this.schema.allowFormFields.toArray(uf => {
                    if (this.pe.type == ElementType.SchemaData && uf.type == FieldType.title) return;
                    return {
                        icon: GetFieldTypeSvg(uf.type),
                        name: uf.id,
                        text: uf.text,
                        type: MenuItemType.switch,
                        checked: this.exists(c => (c instanceof OriginFormField) && c.field.id == uf.id)
                    }
                })
            ],
            {
                input: (newItem) => {
                    self.onToggleFieldView(this.schema.allowFormFields.find(g => g.id == newItem.name), newItem.checked)
                }
            }
        )
    }
    async onToggleFieldView(this: Page, field: Field, checked: boolean) {
        await this.onAction('onToggleFieldView', async () => {
            if (checked) {
                var b: Record<string, any> = GetFieldFormBlockInfo(field);
                if (b) {
                    if (this.pe.type == ElementType.SchemaRecordView) {
                        var sv = this.schema.views.find(g => g.id == this.pe.id1);
                        if (sv.url == BlockUrlConstant.RecordPageView) {
                            b.fieldMode = 'detail';
                        }
                    }
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
    async onOpenBackground(this: Page) {
        var g = await useCardBoxStyle({
            open: 'onlyBg',
            fill: this.pageFill,
            cardStyle: this.pageStyle
        }, (g) => {
            this.onLazyUpdateProps({ pageFill: g.fill, pageStyle: g.cardStyle }, true)
        });
        if (g) {
            await this.onUpdateProps({ pageFill: g.fill, pageStyle: g.cardStyle }, true)
        }
    }
    async onPageRemove(this: Page) {
        channel.air('/page/remove', { item: this.pageInfo.id });
    }
    async onSyncAi(this: Page, robotId: string, isTurn?: boolean) {
        ShyAlert('正在同步中...', 'warn', isTurn ? 1000 * 60 * 10 : 1000 * 4);
        try {
            var r = await channel.put('/sync/wiki/doc', {
                robotId,
                elementUrl: this.customElementUrl,
                pageText: this.getPageDataInfo()?.text,
                contents: [{ id: util.guid(), content: await this.getMd() }]
            })
            if (isTurn) {
                if (r.ok) {
                    ShyAlert('正在微调中...', 'warn', isTurn ? 1000 * 60 * 10 : 1000 * 60 * 2);
                    await channel.post('/robot/doc/embedding', { id: r.data.doc.id })
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
}