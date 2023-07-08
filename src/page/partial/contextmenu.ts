
import React from "react";
import { Page } from "..";
import { useSelectMenuItem } from "../../../component/view/menu";
import { MenuItem, MenuItemType } from "../../../component/view/menu/declare";
import { BlockDirective } from "../../block/enum";
import { Point, Rect } from "../../common/vector/point";
import { PageLayoutType, PageTemplateTypeGroups } from "../declare";
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
    FileSvg,
    FourLeavesSvg,
    GlobalLinkSvg,
    HSvg,
    LinkSvg,
    LockSvg,
    LogoutSvg,
    MoveToSvg,
    NoteSvg,
    OutlineSvg,
    PlatteSvg,
    RedoSvg,
    RefreshOneSvg,
    RefreshSvg,
    TemplatesSvg,
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
import { useCardBoxStyle } from "../../../extensions/doc.card/style";
import { GetFieldTypeSvg } from "../../../blocks/data-grid/schema/util";
import { OriginFormField } from "../../../blocks/data-grid/element/form/origin.field";
import { Field } from "../../../blocks/data-grid/schema/field";
import { GetFieldFormBlockInfo } from "../../../blocks/data-grid/element/service";
import { ElementType } from "../../../net/element.type";
import { FieldType } from "../../../blocks/data-grid/schema/type";
import { getWsWikiRobots } from "../../../net/ai/robot";
import { util } from "../../../util/util";
import { ActionDirective } from "../../history/declare";
import { useExportFile } from "../../../extensions/export-file";
import { DataGridView } from "../../../blocks/data-grid/view/base";
import { useForm } from "../../../component/view/form/dialoug";

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
                { type: MenuItemType.divide },
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
                { name: 'favourite', visible: false, icon: 'favorite:sy', text: '添加至收藏', disabled: true },
                { name: 'history', icon: VersionHistorySvg, text: '页面历史' },
                { name: 'lock', disabled: this.isCanManage ? false : true, text: this.locker?.lock ? "除消编辑保护" : "编辑保护", icon: this.locker?.lock ? LockSvg : UnlockSvg },
                { name: 'undo', text: '撤消', icon: UndoSvg, disabled: this.snapshoot.historyRecord.isCanUndo ? false : true, label: 'Ctrl+Z' },
                { name: 'redo', text: '重做', icon: RedoSvg, disabled: this.snapshoot.historyRecord.isCanRedo ? false : true, label: 'Ctrl+Y' },
                { type: MenuItemType.divide },
                { name: 'export', iconSize: 16, text: '导出', icon: FileSvg },
                ...(window.shyConfig.isDev || window.shyConfig.isBeta || this.ws?.sn == 19 ? [
                    { name: 'requireTemplate', icon: TemplatesSvg, text: '申请模板' },
                ] : []),
                { name: 'move', text: '移动', icon: MoveToSvg, visible: false },
                { type: MenuItemType.divide },
                { name: 'delete', icon: TrashSvg, text: '删除' },
                { name: 'copylink', icon: LinkSvg, text: '复制链接' },
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
                { name: 'lock', disabled: this.isCanManage ? false : true, text: this.locker?.lock ? "除消编辑保护" : "编辑保护", icon: this.locker?.lock ? LockSvg : UnlockSvg },
                { type: MenuItemType.divide },
                { name: 'favourite', icon: 'favorite:sy', text: '添加至收藏', disabled: true },
                { name: 'history', icon: VersionHistorySvg, text: '页面历史' },
                { type: MenuItemType.divide },
                { name: 'undo', text: '撤消', icon: UndoSvg, disabled: this.snapshoot.historyRecord.isCanUndo ? false : true, label: 'Ctrl+Z' },
                { name: 'redo', text: '重做', icon: RedoSvg, disabled: this.snapshoot.historyRecord.isCanRedo ? false : true, label: 'Ctrl+Y' },
                { type: MenuItemType.divide },
                { name: 'export', iconSize: 16, text: '导出', icon: FileSvg },
                { type: MenuItemType.divide },
                { name: 'move', text: '移动', icon: MoveToSvg, disabled: true },
                { name: 'delete', icon: TrashSvg, text: '删除' },
                { name: 'copylink', icon: LinkSvg, text: '复制链接' },
            ];
        }
        else if (this.pageLayout.type == PageLayoutType.docCard) {
            items = [
                { name: 'smallText', text: '小字号', checked: this.smallFont ? true : false, type: MenuItemType.switch },
                { name: 'fullWidth', text: '宽版', checked: this.isFullWidth ? true : false, type: MenuItemType.switch },
                { type: MenuItemType.divide },
                {
                    name: 'bg',
                    text: '主题',
                    icon: PlatteSvg
                },
                { name: 'lock', disabled: this.isCanManage ? false : true, text: this.locker?.lock ? "除消编辑保护" : "编辑保护", icon: this.locker?.lock ? LockSvg : UnlockSvg },
                { name: 'history', icon: VersionHistorySvg, text: '页面历史' },
                { type: MenuItemType.divide },
                { name: 'undo', text: '撤消', icon: UndoSvg, disabled: this.snapshoot.historyRecord.isCanUndo ? false : true, label: 'Ctrl+Z' },
                { name: 'redo', text: '重做', icon: RedoSvg, disabled: this.snapshoot.historyRecord.isCanRedo ? false : true, label: 'Ctrl+Y' },
                { type: MenuItemType.divide },
                { name: 'export', iconSize: 16, text: '导出', icon: FileSvg },
                ...(window.shyConfig.isDev || window.shyConfig.isBeta || this.ws?.sn == 19 ? [
                    { name: 'requireTemplate', icon: TemplatesSvg, text: '申请模板' },
                ] : []),
                { type: MenuItemType.divide },
                { name: 'move', text: '移动', icon: MoveToSvg, disabled: true },
                { name: 'delete', icon: TrashSvg, text: '删除' },
                { name: 'copylink', icon: LinkSvg, text: '复制链接' },
            ];
        }
        else if (this.pageLayout.type == PageLayoutType.textChannel) {
            items = [
                {
                    name: 'speak',
                    text: '发言',
                    icon: CommunicationSvg,
                    type: MenuItemType.select,
                    value: this.pageInfo?.speak || 'more',
                    options: [
                        { text: '允许发言多次', value: 'more' },
                        { text: '从此刻仅允许发言一次', value: "only" }
                    ]
                },
                { type: MenuItemType.divide },
                { name: 'copylink', icon: LinkSvg, text: '复制链接' },
                { type: MenuItemType.divide },
                { name: 'delete', icon: TrashSvg, text: '删除' },
            ];
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
                CopyText(this.pageUrl);
                ShyAlert('复制链接');
            }
            else if (r.item.name == 'lock') {
                this.onLockPage();
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
            else if (r.item.name == 'export') {
                this.onExport();
            }
            else if (r.item.name == 'requireTemplate') {
                this.onRequireTemplate()
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
        await usePagePublish({ roundArea: Rect.fromEvent(event) }, this)
    }
    async onOpenMember(this: Page, event: React.MouseEvent) {
        this.showMembers = this.showMembers ? false : true;
        this.forceUpdate()
    }
    async onOpenFieldProperty(this: Page, event: React.MouseEvent) {
        var self = this;
        var r = await useSelectMenuItem(
            { roundArea: Rect.fromEvent(event) },
            [
                { text: '显示字段', type: MenuItemType.text },
                ...this.schema.allowFormFields.findAll(g => (this.pe.type == ElementType.SchemaRecordView && !this.isSchemaRecordViewTemplate || this.pe.type == ElementType.SchemaData) && g.type == FieldType.title ? false : true).toArray(uf => {
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
        else
            await useExportFile({ page: this });
    }
    async onRequireTemplate(this: Page) {
        var ws = this.ws;
        var tg = await channel.get('/get/workspace/template', {
            wsId: ws.id,
            pageId: this.pageInfo?.id,
        });
        var tgd = tg.data?.template || {};
        var rf = await useForm({
            title: '申请模板',
            model: {
                mime: tgd['mime'],
                classify: tgd['classify'],
                tags: tgd['tags'],
                previewCover: tgd['previewCover']
            },
            fields: [
                { name: 'text', text: '标题', default: this.pageInfo?.text, type: 'input' },
                { name: 'description:', text: '描述', default: this.pageInfo?.description, type: 'textarea' },
                {
                    name: 'mime',
                    text: '类型',
                    type: 'select',
                    options: [
                        { text: '页面', value: 'page' },
                        { text: '数据表格', value: 'db' },
                        { text: '频道', value: 'channel' },
                        { text: 'PPT', value: 'ppt' }
                    ]
                },
                {
                    name: 'classify',
                    text: '分类',
                    type: 'select',
                    multiple: true,
                    options: PageTemplateTypeGroups.map(c => {
                        return {
                            text: c.text,
                            icon: c.icon,
                            childs: c.childs.map(g => {
                                return {
                                    text: g.text,
                                    value: g.text
                                }
                            })
                        }
                    })
                },
                {
                    name: 'previewCover',
                    text: '封面图',
                    type: "file",
                    mime:'image'
                }
            ]
        })
        ShyAlert('正在申请中...', 'warn', 1000 * 60 * 10);
        try {

            var g = await channel.post('/create/template', { config: { pageId: this.pageInfo?.id } })
            if (g.ok) {
                var r = await channel.post('/download/file', { url: g.data.file.url });
                if (r.ok) {
                    await channel.post('/create/workspace/template', {
                        wsId: ws.id,
                        pageId: this.pageInfo?.id,
                        type: 'page',
                        templateUrl: r.data.file.url,
                        text: rf.text,
                        description: rf.description,
                        file: r.data.file,
                        config: {
                            mime: rf.mime,
                            classify: rf.classify,
                            previewCover: rf.previewCover
                        }
                    });
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