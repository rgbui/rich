
import {
    FilterSvg,
    TrashSvg,
    SettingsSvg,
    DotsSvg,
    DuplicateSvg,
    LinkSvg,
    FileSvg,
    LockSvg,
    PropertysSvg,
    SortSvg,
    TemplatesSvg,
    ImportSvg,
    LoopSvg,
    UnlockSvg,
    PlusSvg,
    DatasourceSvg,
    DocEditSvg
} from "../../../../component/svgs";

import { useSelectMenuItem } from "../../../../component/view/menu";
import { MenuItem, MenuItemType } from "../../../../component/view/menu/declare";
import { BlockDirective } from "../../../../src/block/enum";
import { Rect, Point } from "../../../../src/common/vector/point";
import { DataGridView } from ".";
import { useDataGridConfig } from "../../../../extensions/data-grid/view.config";
import { getSchemaViewIcon } from "../../schema/util";
import { ElementType, getElementUrl } from "../../../../net/element.type";
import { channel } from "../../../../net/channel";
import { Page } from "../../../../src/page";
import { TableSchema } from "../../schema/meta";
import { useTabelSchemaFormDrop } from "../../../../extensions/data-grid/record.template/view";
import { BlockUrlConstant } from "../../../../src/block/constant";

export class DataGridViewConfig {
    async onOpenViewSettings(this: DataGridView, rect: Rect) {
        var self = this;
        var view = self.schemaView;
        self.dataGridTool.isOpenTool = true;
        function getMenuItems() {
            var items: MenuItem<BlockDirective | string>[] = [];
            items.push(...[
                {
                    name: 'name',
                    type: MenuItemType.input,
                    value: self.schemaView?.text,
                    text: '编辑视图名',
                },
                { type: MenuItemType.divide },
                {
                    text: "切换视图",
                    icon: LoopSvg,
                    childs: [
                        {
                            type: MenuItemType.container,
                            drag: true,
                            name: 'viewContainer',
                            childs: [
                                ...self.schema.views.findAll(g => ![BlockUrlConstant.RecordPageView].includes(g.url as any)).map(v => {
                                    return {
                                        name: 'turn',
                                        text: v.text,
                                        type: MenuItemType.drag,
                                        value: v.id,
                                        icon: getSchemaViewIcon(v.url),
                                        checkLabel: v.id == self.schemaView?.id,
                                        btns: [
                                            { icon: DotsSvg, name: 'property' }
                                        ]
                                    }
                                }),
                                { type: MenuItemType.divide },
                                { name: 'addView', type: MenuItemType.button, text: '创建视图' }
                            ]
                        }
                    ]
                },
                { text: '配置设图', name: 'viewConfig', icon: SettingsSvg },
                { type: MenuItemType.divide },
                { text: '数据源', name: 'datasource', icon: DatasourceSvg },
                { type: MenuItemType.divide },
                { name: 'link', icon: LinkSvg, text: '复制视图链接' },
                { type: MenuItemType.divide },
                { name: 'clone', icon: DuplicateSvg, text: '复制视图' },
                { name: 'delete', icon: TrashSvg, text: '移除视图' },
            ]);
            return items;
        }
        var items: MenuItem<BlockDirective | string>[] = getMenuItems();
        var rname = items.find(g => g.name == 'name');
        var r = await useSelectMenuItem({ roundArea: rect }, items, {
            async click(item, ev, name, mp) {
                mp.onFree();
                try {
                    if (item.name == 'turn') {
                        var rs: MenuItem<BlockDirective | string>[] = [];
                        if (item.value == view?.id) {
                            rs.push(...[
                                { name: 'duplicate', icon: DuplicateSvg, text: '复制' }
                            ])
                        }
                        else
                            rs.push(...[
                                {
                                    name: 'name',
                                    type: MenuItemType.input,
                                    value: item.text,
                                    text: '编辑视图名',
                                },
                                { type: MenuItemType.divide },
                                { name: 'delete', disabled: item.value == view?.id, icon: TrashSvg, text: '删除' }
                            ])
                        var rg = await useSelectMenuItem({ roundArea: Rect.fromEvent(ev) },
                            rs,
                            { nickName: 'second' }
                        );
                        if (rg?.item) {
                            if (rg?.item.name == 'delete') {
                                self.schema.onSchemaOperate([{ name: 'removeSchemaView', id: item.value }])
                                items.arrayJsonRemove('childs', g => g === item);
                                mp.updateItems(items);
                            }
                        }
                        var rn = rs.find(g => g.name == 'name');
                        if (rn.value != item.text && rn.value) {
                            self.schema.onSchemaOperate([
                                { name: 'updateSchemaView', id: item.value, data: { text: rn.value } }
                            ]);
                            item.text = rn.value;
                            mp.updateItems(items);
                        }
                    }
                }
                catch (ex) {

                }
                finally {
                    mp.onUnfree()
                }
            },
            input(item) {
                if (item.name == 'viewContainer') {
                    var [from, to] = item.value;
                    self.onSchemaViewMove(self.schema.views[from].id, from, to);
                }
            }
        });
        if (r?.item?.name) {
            if (r.item.name == 'link') {
                self.onCopyViewLink();
            }
            else if (r.item.name == 'delete') {
                self.onDelete();
            }
            else if (r.item.name == 'datasource') {
                self.onOpenDataSource(rect);
            }
            else if (r.item.name == 'turn') {
                self.onDataGridTurnView(r.item.value);
            }
            else if (r.item.name == 'viewConfig') {
                self.onOpenViewConfig(rect);
            }
            else if (r.item.name == 'clone') {
                self.onCopySchemaView();
            }
            else if (r.item.name == 'addView') {
                await self.onAddCreateTableView();
            }
        }
        if (rname.value != self.schemaView.text && rname.value) {
            self.onSchemaViewRename(view?.id, rname.value);
        }
        self.onOver(self.getVisibleContentBound().contain(Point.from(self.page.kit.operator.moveEvent)))
        self.dataGridTool.isOpenTool = false;
    }
    async onOpenViewConfig(this: DataGridView, rect: Rect, mode?: 'view' | 'field' | 'sort' | 'filter' | 'group') {
        var self = this;
        self.dataGridTool.isOpenTool = true;
        var r = await useDataGridConfig(
            { roundArea: rect },
            {
                dataGrid: this,
                mode: mode
            });
        self.dataGridTool.isOpenTool = false;
        this.onOver(this.getVisibleContentBound().contain(Point.from(this.page.kit.operator.moveEvent)))
    }
    async onOpenViewProperty(this: DataGridView, rect: Rect) {
        this.dataGridTool.isOpenTool = true;
        var self = this;
        var menus = [
            { text: '复制视图链接', icon: LinkSvg, name: 'copylink' },
            { type: MenuItemType.divide },
            { text: '视图设置...', icon: TemplatesSvg, name: 'view' },
            { text: '字段设置...', icon: PropertysSvg, name: 'propertys' },
            { text: '过滤设置...', icon: FilterSvg, name: 'filter' },
            { text: '排序设置...', icon: SortSvg, name: 'sort' },
            { type: MenuItemType.divide },
            {
                text: '锁定数据表格',
                name: 'lock',
                checked: this.schema.locker?.lock ? true : false,
                type: MenuItemType.switch,
                icon: this.schema.locker?.lock ? UnlockSvg : LockSvg
            },
            { type: MenuItemType.divide },
            // { text: '导入', disabled: true, icon: ImportSvg, name: 'import' },
            { text: '导出', icon: FileSvg, name: 'export' },
        ]
        var um = await useSelectMenuItem({ roundArea: rect }, menus, {
            async input(item) {
                if (item.name == 'lock') {
                    await self.onTableSchemaLock(item.checked);
                }
            }
        });
        if (um) {
            switch (um.item.name) {
                case 'copylink':
                    this.onCopyViewLink();
                    break;
                case 'propertys':
                    await this.onOpenViewConfig(rect, 'field');
                    break;
                case 'view':
                    await this.onOpenViewConfig(rect);
                    break;
                case 'filter':
                    await this.onOpenViewConfig(rect, 'filter');
                    break;
                case 'sort':
                    await this.onOpenViewConfig(rect, 'sort');
                    break;
                case 'export':
                    await this.onExport(rect)
            }
        }
        this.dataGridTool.isOpenTool = false;
        this.onOver(this.getVisibleContentBound().contain(Point.from(this.page.kit.operator.moveEvent)))
    }
    async onOpenForm(this: DataGridView, rect: Rect) {
        this.dataGridTool.isOpenTool = true;
        var url: '/page/open' | '/page/dialog' | '/page/slide' = '/page/dialog';
        if (this.createRecordSource == 'page') {
            url = '/page/open';
        }
        else if (this.createRecordSource == 'slide') {
            url = '/page/slide';
        }
        var dialougPage: Page = await channel.air(url, {
            elementUrl: getElementUrl(ElementType.SchemaRecordView, this.schema.id, this.schema.defaultAddForm?.id),
            config: {
                force: true
            }
        })
        if (dialougPage) {
            dialougPage.onSave();
            var newRow = await dialougPage.getSchemaRow();
            if (newRow) await this.onAddRow(newRow, undefined, 'after', dialougPage)
        }
        if (url != '/page/open') await channel.air(url, { elementUrl: null });
        this.dataGridTool.isOpenTool = false;
        this.onOver(this.getVisibleContentBound().contain(Point.from(this.page.kit.operator.moveEvent)))
    }
    async onOpenSchemaPage(this: DataGridView, schema?: TableSchema | string) {
        var s = schema ? (typeof schema == 'string' ? schema : schema.id) : this.schema.id;
        await channel.air('/page/open', { elementUrl: getElementUrl(ElementType.Schema, s) });
    }
    async onOpenViewTemplates(this: DataGridView, rect: Rect) {
        this.dataGridTool.isOpenTool = true;
        await useTabelSchemaFormDrop({ roundArea: rect, direction: 'bottom', align: 'end' }, { block: this });
        this.dataGridTool.isOpenTool = false;
        this.onOver(this.getVisibleContentBound().contain(Point.from(this.page.kit.operator.moveEvent)))
    }
}