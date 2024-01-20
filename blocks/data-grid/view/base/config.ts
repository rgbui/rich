
import {
    FilterSvg,
    TrashSvg,
    DotsSvg,
    DuplicateSvg,
    LinkSvg,
    FileSvg,
    LockSvg,
    PropertysSvg,
    SortSvg,
    LoopSvg,
    UnlockSvg,
    DatasourceSvg
} from "../../../../component/svgs";

import { useSelectMenuItem } from "../../../../component/view/menu";
import { MenuItem, MenuItemType } from "../../../../component/view/menu/declare";
import { BlockDirective } from "../../../../src/block/enum";
import { Rect } from "../../../../src/common/vector/point";
import { DataGridView } from ".";
import { useDataGridConfig } from "../../../../extensions/data-grid/view.config";
import { getSchemaViewIcon } from "../../schema/util";
import { ElementType, getElementUrl } from "../../../../net/element.type";
import { channel } from "../../../../net/channel";
import { TableSchema } from "../../schema/meta";
import { useTabelSchemaFormDrop } from "../../../../extensions/data-grid/record.template/view";
import { BlockUrlConstant } from "../../../../src/block/constant";
import { lst } from "../../../../i18n/store";
import lodash from "lodash";
import { DataGridChart } from "../statistic/charts";
import { IconValueType } from "../../../../component/view/icon";
import { useDataSourceView } from "../../../../extensions/data-grid/datasource";

export class DataGridViewConfig {
    async onOpenViewSettings(this: DataGridView, rect: Rect) {
        var self = this;
        var view = this.schemaView;
        await this.onDataGridTool(async () => {
            function getMenuItems() {
                var items: MenuItem<BlockDirective | string>[] = [];
                items.push(...[
                    {
                        name: 'name',
                        type: MenuItemType.inputTitleAndIcon,
                        value: self.schemaView?.text,
                        icon: getSchemaViewIcon(self.schemaView),
                        text: lst('编辑视图名'),
                    },
                    { type: MenuItemType.divide },
                    {
                        text: lst("切换视图"),
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
                                            icon: getSchemaViewIcon(v),
                                            checkLabel: v.id == self.schemaView?.id,
                                            btns: [
                                                { icon: DotsSvg, name: 'property' }
                                            ]
                                        }
                                    }),
                                    { type: MenuItemType.divide },
                                    { name: 'addView', type: MenuItemType.button, text: lst('创建视图') }
                                ]
                            }
                        ]
                    },
                    { text: lst('配置视图'), name: 'viewConfig', icon: { name: 'byte', code: 'setting-one' } as IconValueType },
                    { type: MenuItemType.divide },
                    { text: lst('数据源'), name: 'datasource', icon: DatasourceSvg },
                    { type: MenuItemType.divide },
                    { name: 'link', icon: LinkSvg, text: lst('复制视图链接') },
                    { type: MenuItemType.divide },
                    { name: 'clone', icon: DuplicateSvg, text: lst('复制视图') },
                    { name: 'delete', icon: TrashSvg, text: lst('移除视图') },
                ]);
                if (self.page.pe.type == ElementType.Schema) {
                    items.splice(-7, 2);
                    items.splice(-1, 1);
                }
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
                                    { name: 'duplicate', icon: DuplicateSvg, text: lst('复制') }
                                ])
                            }
                            else
                                rs.push(...[
                                    {
                                        name: 'name',
                                        type: MenuItemType.inputTitleAndIcon,
                                        icon: getSchemaViewIcon(view),
                                        value: item.text,
                                        text: lst('编辑视图名'),
                                    },
                                    { type: MenuItemType.divide },
                                    { name: 'delete', disabled: item.value == view?.id, icon: TrashSvg, text: lst('删除') }
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
                            var props: Record<string, any> = {};
                            var rn = rs.find(g => g.name == 'name');
                            if (rn.value != item.text && rn.value) {
                                props.text = rn.value;
                            }
                            if (!lodash.isEqual(rn.icon, item.icon)) {
                                props.icon = rn.icon;
                            }
                            if (Object.keys(props).length > 0) {
                                await self.schema.onSchemaOperate([
                                    { name: 'updateSchemaView', id: item.value, data: props }
                                ]);
                                if (props.text) item.text = props.text || item.text;
                                if (props.icon) item.icon = props.icon || item.icon;
                                mp.updateItems(items);
                                if (props.text && view.url.startsWith('/data-grid/charts')) {
                                    await (self as DataGridChart).renderEcharts();
                                }
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
            var props: Record<string, any> = {};
            if (rname.value != self.schemaView.text && rname.value) {
                props.text = rname.value;
            }
            if (!lodash.isEqual(rname.icon, self.schemaView.icon)) {
                props.icon = rname.icon;
            }
            if (Object.keys(props).length > 0) {
                await self.onSchemaViewUpdate(view?.id, props);
                if (props.text && view.url.startsWith('/data-grid/charts')) {
                    await (self as DataGridChart).renderEcharts();
                }
            }
        })
    }
    async onOpenViewConfig(this: DataGridView, rect: Rect, mode?: 'view' | 'field' | 'sort' | 'filter' | 'group') {
        var self = this;
        await self.onDataGridTool(async () => {
            await useDataGridConfig(
                { roundArea: rect },
                {
                    dataGrid: this,
                    mode: mode
                });
        })
    }
    async onOpenViewProperty(this: DataGridView, rect: Rect) {
        var self = this;
        await this.onDataGridTool(async () => {
            var menus: MenuItem<BlockDirective | string>[] = [
                { text: lst('复制视图链接'), icon: LinkSvg, name: 'copylink' },
                { type: MenuItemType.divide },
                { text: lst('视图设置...'), icon: { name: 'byte', code: 'setting-one' }, name: 'view' },
                { text: lst('字段设置...'), icon: PropertysSvg, name: 'propertys' },
                { text: lst('过滤设置...'), icon: FilterSvg, name: 'filter' },
                { text: lst('排序设置...'), icon: SortSvg, name: 'sort' },
                { type: MenuItemType.divide },
                {
                    text: lst('锁定数据表格'),
                    name: 'lock',
                    checked: this.schema.locker?.lock ? true : false,
                    type: MenuItemType.switch,
                    icon: this.schema.locker?.lock ? UnlockSvg : LockSvg
                },
                { type: MenuItemType.divide },
                // { text: '导入', disabled: true, icon: ImportSvg, name: 'import' },
                { text: lst('导出'), icon: FileSvg, name: 'export' },
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
                        await this.onExport()
                }
            }
        })
    }
    async onOpenSchemaPage(this: DataGridView, schema?: TableSchema | string) {
        var s = schema ? (typeof schema == 'string' ? schema : schema.id) : this.schema.id;
        await channel.air('/page/open', { elementUrl: getElementUrl(ElementType.Schema, s) });
    }
    async onOpenViewTemplates(this: DataGridView, rect: Rect) {
        await this.onDataGridTool(async () => {
            await useTabelSchemaFormDrop({ roundArea: rect, direction: 'bottom', align: 'end' }, { block: this });
        })
    }
    async onOpenAddTabView(this: DataGridView, event: React.MouseEvent) {
        var self = this;
        self.onDataGridTool(async () => {
            var rect = Rect.fromEle(event.currentTarget as HTMLElement);
            var g = await useDataSourceView({ roundArea: rect }, {
                tableId: this.schema.id,
                viewId: this.syncBlockId,
                selectView: true,
                editTable: true
            });
            if (g) {
                if (typeof g != 'string' && g.type == 'view') {
                    var s = this.schemaId == g.tableId ? this.schema : await TableSchema.loadTableSchema(g.tableId, this.page.ws);
                    var sv = s.listViews.find(c => c.id == (g as any).viewId)
                    this.page.onReplace(this, {
                        url: BlockUrlConstant.DataGridTab,
                        tabIndex: 1,
                        tabItems: [
                            {
                                schemaId: this.schemaId,
                                viewId: this.syncBlockId,
                                viewText: this.schemaView?.text,
                                viewIcon: this.schemaView?.icon
                            },
                            {
                                schemaId: g.tableId,
                                viewId: g.viewId,
                                viewText: sv?.text,
                                viewIcon: sv?.icon
                            }
                        ],
                        blocks: {
                            childs: [],
                            otherChilds: [
                                {
                                    url: BlockUrlConstant.DataGridTabPage,
                                    blocks: {
                                        childs: [
                                            {
                                                url: this.url,
                                                schemaId: this.schemaId,
                                                syncBlockId: this.syncBlockId
                                            }
                                        ]
                                    }
                                },
                                {
                                    url: BlockUrlConstant.DataGridTabPage,
                                    blocks: {
                                        childs: [
                                            {
                                                url: sv.url,
                                                schemaId: g.tableId,
                                                syncBlockId: g.viewId
                                            }
                                        ]
                                    }
                                }
                            ]
                        }
                    })
                }
            }
        })
    }
}