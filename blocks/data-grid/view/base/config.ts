import dayjs from "dayjs";
import { HideSvg, FilterSvg, ArrowDownSvg, ArrowUpSvg, OptionsSvg, TrashSvg, ArrowLeftSvg, ArrowRightSvg, SettingsSvg, TypesSelectSvg, DotsSvg, PlusSvg, EditSvg, EmojiSvg, Emoji1Svg, DuplicateSvg, LinkSvg, FileSvg, LockSvg, PropertysSvg, SortSvg, TemplatesSvg, ImportSvg, LoopSvg, UnlockSvg } from "../../../../component/svgs";
import { useSelectMenuItem } from "../../../../component/view/menu";
import { MenuItem, MenuItemType } from "../../../../component/view/menu/declare";
import { useTableStoreAddField } from "../../../../extensions/data-grid/field";
import { useFormula } from "../../../../extensions/data-grid/formula";
import { BlockDirective } from "../../../../src/block/enum";
import { Rect, Point } from "../../../../src/common/vector/point";
import { util } from "../../../../util/util";
import { FieldType } from "../../schema/type";
import { ViewField } from "../../schema/view";
import { DataGridView } from ".";
import { useDataGridConfig } from "../../../../extensions/data-grid/view.config";
import { getSchemaViewIcon } from "../../schema/util";
import { useTabelSchemaFormDrop } from "../../../../extensions/data-grid/switch.forms/view";
import { useFormPage } from "../../../../extensions/data-grid/form";
import { getWsElementUrl, ElementType } from "../../../../net/element.type";
import { useOpenEmoji } from "../../../../extensions/emoji";

export class DataGridViewConfig {
    async onOpenFieldConfig(this: DataGridView, event: React.MouseEvent | MouseEvent, viewField: ViewField) {
        event.stopPropagation();
        var self = this;
        self.dataGridTool.isOpenTool = true;
        var rp = Rect.fromEvent(event);
        var items: MenuItem<BlockDirective | string>[] = [];
        var isSysField: boolean = false;
        if (viewField.type || viewField?.field?.type == FieldType.autoIncrement) {
            items.push(...[
                {
                    name: 'name',
                    type: MenuItemType.input,
                    value: viewField?.text,
                    text: '编辑列名',
                },
                { type: MenuItemType.divide },
                { name: 'leftInsert', icon: ArrowLeftSvg, text: '左侧插入' },
                { name: 'rightInsert', icon: ArrowRightSvg, text: '右侧插入' },
                { type: MenuItemType.divide },
                {
                    name: 'hide',
                    icon: HideSvg,
                    text: '隐藏列'
                }
            ]);
            if (viewField?.field?.type == FieldType.autoIncrement) {
                items.addRange(4, [
                    { name: 'sortDesc', icon: ArrowDownSvg, text: '降序' },
                    { name: 'sortAsc', icon: ArrowUpSvg, text: '升序' },
                    { name: 'filter', icon: FilterSvg, text: '过滤' },
                ])
            }
            isSysField = true;
        }
        else {
            items.push(...[
                {
                    name: 'name',
                    type: MenuItemType.input,
                    value: viewField.field?.text,
                    text: '编辑列名',
                },
                { type: MenuItemType.divide },
                {
                    name: 'editProperty',
                    disabled: viewField.field.type == FieldType.title ? true : false,
                    icon: OptionsSvg,
                    text: '编辑字段'
                },
                { type: MenuItemType.divide },
                { name: 'leftInsert', icon: ArrowLeftSvg, text: '左侧插入' },
                { name: 'rightInsert', icon: ArrowRightSvg, text: '右侧插入' },
                { name: 'sortDesc', icon: ArrowDownSvg, text: '降序' },
                { name: 'sortAsc', icon: ArrowUpSvg, text: '升序' },
                { name: 'filter', icon: FilterSvg, text: '过滤' },
                { type: MenuItemType.divide },
                {
                    name: 'hide',
                    icon: HideSvg,
                    text: '隐藏列'
                },
                {
                    name: 'clone',
                    icon: DuplicateSvg,
                    text: '复制列'
                },
                { name: 'deleteProperty', icon: TrashSvg, text: '删除字段' },
            ]);
            if (viewField.field?.type == FieldType.date) {
                var dateItems: MenuItem<BlockDirective | string>[] = [];
                var day = dayjs(new Date());
                dateItems.push(...[
                    {
                        name: 'dateCustomFormat',
                        type: MenuItemType.input,
                        value: viewField?.field?.config?.dateFormat || 'YYYY年MM月DD日',
                        text: '编辑日期格式',
                    },
                    { type: MenuItemType.divide },
                    {
                        name: 'dateFormat',
                        text: '年月日',
                        value: 'YYYY年MM月DD日',
                        label: day.format('YYYY年MM月DD日')
                    },
                    {
                        name: 'dateFormat',
                        text: '年月',
                        value: 'YYYY年MM月',
                        label: day.format('YYYY年MM月')
                    },
                    {
                        name: 'dateFormat',
                        text: '月日',
                        value: 'MM月DD日',
                        label: day.format('MM月DD日')
                    },
                    {
                        name: 'dateFormat',
                        text: '日期时间',
                        value: 'YYYY/MM/DD HH:mm',
                        label: day.format('YYYY/MM/DD HH:mm')
                    },
                    {
                        name: 'dateFormat',
                        text: '时间',
                        value: 'HH:mm',
                        label: day.format('HH:mm')
                    }
                ]);
                items.insertAt(3, { type: MenuItemType.divide });
                items.insertAt(4, {
                    text: '日期格式',
                    childs: dateItems
                });
                items.insertAt(5, {
                    text: '包括时间',
                    type: MenuItemType.switch,
                    name: 'includeTime',
                    checked: viewField?.field?.config?.includeTime ? true : false
                });
            }
            else if (viewField.field?.type == FieldType.number) {
                var dateItems: MenuItem<BlockDirective | string>[] = [];
                dateItems.push(...[
                    { text: '数字', value: '' },
                    { text: '整数', value: '' },
                    { text: '千分位', value: '' },
                    { text: '两位小数', value: '' },
                    { text: '百分比', value: '' },
                    { type: MenuItemType.divide },
                    { text: '进度条', value: '' },
                    { text: '评分', value: '' },
                    { type: MenuItemType.divide },
                    { text: '人民币', value: '' },
                    { text: '美元', value: '' },
                    { text: '欧元', value: '' },
                    { text: '日元', value: '' },
                    { text: '港元', value: '' },
                    { type: MenuItemType.divide },
                    {
                        text: '自定义格式',
                        childs: [
                            {
                                name: 'dateCustomFormat',
                                type: MenuItemType.input,
                                value: '',
                                text: '编辑日期格式',
                            },
                            { text: 'm/s' },
                            { text: 'kg' },
                            { text: 'C/' }
                        ]
                    },
                    /**
                     * 这里需要加上单位的基准
                     */
                    { text: '单位换算', childs: [{ text: '距离' }] },
                    { text: '数字区间', childs: [{ text: '胖' }] }
                ]);
                items.insertAt(3, { type: MenuItemType.divide });
                items.insertAt(4, {
                    text: '数字格式',
                    childs: dateItems,
                    icon: SettingsSvg
                });
            }
            else if (viewField.field?.type == FieldType.bool) {
                var dateItems: MenuItem<BlockDirective | string>[] = [];
                dateItems.push(...[
                    { text: '勾选框', value: '' },
                    { text: '开关', value: '' },
                    {
                        text: '自定义',
                        childs: [
                            {
                                name: 'dateCustomFormat',
                                type: MenuItemType.input,
                                value: '',
                                text: '编辑日期格式',
                            },
                            { text: '是否', value: '' },
                        ]
                    }
                ]);
                items.insertAt(3, { type: MenuItemType.divide });
                items.insertAt(4, {
                    text: '显示格式',
                    childs: dateItems,
                    icon: SettingsSvg
                });
            }
            else if ([
                FieldType.file,
                FieldType.image,
            ].includes(viewField.field?.type)) {
                var text = '允许多文件';
                if (viewField.field.type == FieldType.image) {
                    text = '允许多张图片';
                }
                items.insertAt(4, {
                    text: text,
                    type: MenuItemType.switch,
                    name: 'isMultiple',
                    checked: viewField?.field?.config?.isMultiple ? true : false
                });
            }
            else if (viewField.field?.type == FieldType.formula) {
                items.insertAt(4, {
                    text: '编辑公式',
                    name: 'formula',
                    icon: EditSvg
                });
            }
            else if (viewField.field?.type == FieldType.relation) {
                items.insertAt(4, {
                    text: '允许关联一对多',
                    type: MenuItemType.switch,
                    name: 'isMultiple',
                    checked: viewField?.field?.config?.isMultiple ? true : false
                });
            }
            else if (viewField.field?.type == FieldType.emoji) {
                items.insertAt(4, {
                    text: '更换表情',
                    name: 'emoji',
                    icon: EmojiSvg
                });
            }
            else if (viewField.field?.type == FieldType.option || viewField.field.type == FieldType.options) {
                items.insertAt(3, { type: MenuItemType.divide });
                items.insertAt(4, {
                    text: '选项',
                    icon: TypesSelectSvg,
                    childs: [
                        ...viewField.field.config.options.map(op => {
                            return {
                                text: op.text,
                                drag: 'option',
                                type: MenuItemType.drag,
                                btns: [{ name: 'editOptionOption', icon: DotsSvg }]
                            }
                        }),
                        ...(viewField.field.config.options.length > 0 ? [{ type: MenuItemType.divide }] : []),
                        {
                            type: MenuItemType.button,
                            text: '添加选项',
                            icon: PlusSvg
                        }
                    ]
                });
            }
        }
        var re = await useSelectMenuItem(
            {
                roundArea: rp,
                direction: 'left'
            },
            items,
            {
                async input(item) {
                    if (item.name == 'includeTime') {
                        var config = util.clone(viewField?.field?.config);
                        if (typeof config == 'undefined') config = {};
                        config.includeTime = item.checked;
                        await self.onUpdateField(viewField, { config });
                    }
                    else if (item.name == 'isMultiple') {
                        var config = util.clone(viewField?.field?.config);
                        if (typeof config == 'undefined') config = {};
                        config.isMultiple = item.checked;
                        await self.onUpdateField(viewField, { config });
                    }
                }
            }
        );
        var ReItem = items.find(g => g.name == 'name');
        if (re) {
            if (re.item.name == 'hide') {
                this.onHideField(viewField);
            }
            else if (re.item.name == 'editProperty') {
                var r = await useTableStoreAddField(
                    { roundArea: rp },
                    { field: viewField.field, dataGrid: self }
                )
            }
            else if (re.item.name == 'leftInsert') {
                this.onAddField(rp, this.fields.findIndex(g => g == viewField));
            }
            else if (re.item.name == 'rightInsert') {
                this.onAddField(rp, this.fields.findIndex(g => g == viewField) + 1);
            }
            else if (re.item.name == 'clone') {
                this.onCloneField(viewField);
            }
            else if (re.item.name == 'delete') {
                this.onDeleteField(viewField);
            }
            else if (re.item.name == 'filter') {
                this.onAddFilter(viewField);
            }
            else if (re.item.name == 'sortDesc') {
                this.onSetSortField(viewField, -1);
            }
            else if (re.item.name == 'sortAsc') {
                this.onSetSortField(viewField, 1);
            }
            // else if (re.item.name == 'turnFieldType') {
            //     if (re.item.value == viewField?.field?.type) return;
            //     if (re.item.value == FieldType.relation) {
            //         var r = await useRelationView({ roundArea: rp }, {
            //             config: viewField.field.config
            //         });
            //         if (r) {
            //             await this.onTurnField(viewField, re.item.value, r.config);
            //         }
            //     }
            //     else if (re.item.value == FieldType.rollup) {
            //         var r = await useRollupView({ roundArea: rp }, {
            //             schema: this.schema,
            //             config: viewField.field.config
            //         })
            //         if (r) {
            //             await this.onTurnField(viewField, re.item.value, r);
            //         }
            //     }
            //     else if (re.item.value == FieldType.formula) {
            //         var formula = await useFormula({ roundArea: rp }, {
            //             schema: this.schema,
            //             formula: viewField.field.config.formula
            //         });
            //         if (formula) {
            //             await this.onTurnField(viewField, re.item.value, { formula });
            //         }
            //     }
            //     else if (re.item.value == FieldType.emoji) {
            //         var r = await useFieldEmojiView({ roundArea: rp }, {
            //             schema: this.schema,
            //             config: viewField.field.config
            //         })
            //         if (r) {
            //             await this.onTurnField(viewField, re.item.value, r);
            //         }
            //     }
            //     else {
            //         this.onTurnField(viewField, re.item.value);
            //     }
            // }
            else if (re?.item.name == 'dateFormat') {
                var config = util.clone(viewField?.field?.config);
                if (typeof config == 'undefined') config = {};
                config.dateFormat = re.item.value;
                await this.onUpdateField(viewField, { config });
            }
            else if (re.item.name == 'formula') {
                var formula = await useFormula({ roundArea: rp }, {
                    schema: this.schema,
                    formula: viewField.field.config.formula
                });
                var config = util.clone(viewField?.field?.config);
                if (typeof config == 'undefined') config = {};
                config.formula = formula;
                await self.onUpdateField(viewField, { config });
            }
            else if (re.item.name == 'emoji') {
                console.log('ggg');
                var rc = await useOpenEmoji({ roundArea: rp });
                if (rc) {
                    var config = util.clone(viewField?.field?.config);
                    if (typeof config == 'undefined') config = {};
                    config.emoji = rc;
                    await self.onUpdateField(viewField, { config });
                }
            }
        }
        if (isSysField) {
            if (ReItem.value != viewField?.text) {
                //编辑列名了
                console.log(viewField, ReItem.value);
                this.onUpdateViewField(viewField, { text: ReItem.value })
            }
        }
        else {
            if (ReItem.value != viewField.field?.text) {
                //编辑列名了
                this.onUpdateField(viewField, { text: ReItem.value })
            }
        }
        var dItem = items.arrayJsonFind('childs', g => g.name == 'dateCustomFormat');
        if (dItem) {
            if (dItem.value != viewField.field.config.dateFormat) {
                var config = util.clone(viewField?.field?.config);
                if (typeof config == 'undefined') config = {};
                config.dateFormat = dItem.value;
                await this.onUpdateField(viewField, { config });
            }
        }
        self.dataGridTool.isOpenTool = false;
        this.onOver(this.getVisibleContentBound().contain(Point.from(this.page.kit.operator.moveEvent)))
    }
    async onOpenViewSettings(this: DataGridView, rect: Rect) {
        var self = this;
        var view = self.schemaView;
        self.dataGridTool.isOpenTool = true;
        function getMenuItems() {
            var items: MenuItem<BlockDirective | string>[] = []; items.push(...[
                {
                    name: 'name',
                    type: MenuItemType.input,
                    value: self.schemaView.text,
                    text: '编辑视图名',
                },
                { type: MenuItemType.divide },
                {
                    text: "切换视图",
                    icon: LoopSvg,
                    childs: [...self.schema.views.map(v => {
                        return {
                            name: 'turn',
                            text: v.text,
                            type: MenuItemType.drag,
                            drag: 'view',
                            value: v.id,
                            icon: getSchemaViewIcon(v.url),
                            checkLabel: v.id == self.schemaView.id,
                            btns: [
                                { icon: DotsSvg, name: 'property' }
                            ]
                        }
                    }),
                    { type: MenuItemType.divide },
                    { name: 'addView', type: MenuItemType.button, text: '创建视图' }
                    ]
                },
                { text: '配置设图', name: 'viewConfig', icon: SettingsSvg },
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
                        if (item.value == view.id) {
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
                                { name: 'delete', disabled: item.value == view.id, icon: TrashSvg, text: '删除' }
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

            }
        });
        if (r?.item?.name) {
            if (r.item.name == 'link') {
                self.onCopyViewLink();
            }
            else if (r.item.name == 'delete') {
                self.onDelete();
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
        }


        if (rname.value != self.schemaView.text && rname.value) {
            self.schema.onSchemaOperate([
                {
                    name: 'updateSchemaView',
                    id: view.id,
                    data: { text: rname.value }
                }
            ]);
            self.forceUpdate()
        }
        self.onOver(self.getVisibleContentBound().contain(Point.from(self.page.kit.operator.moveEvent)))
        self.dataGridTool.isOpenTool = false;
    }
    async onOpenViewConfig(this: DataGridView, rect: Rect, mode?: 'view' | 'field' | 'sort' | 'filter' | 'group') {
        var self = this;
        self.dataGridTool.isOpenTool = true;
        var r = await useDataGridConfig({ roundArea: rect }, {
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
            { text: '复制链接', icon: LinkSvg, name: 'copylink' },
            { type: MenuItemType.divide },
            { text: '视图设置...', icon: TemplatesSvg, name: 'view' },
            { text: '字段设置...', icon: PropertysSvg, name: 'propertys' },
            { text: '过滤设置...', icon: FilterSvg, name: 'filter' },
            { text: '排序设置...', icon: SortSvg, name: 'sort' },
            { type: MenuItemType.divide },
            {
                text: '锁定数据表格',
                name: 'lock',
                checked: this.schemaView?.locker?.lock ? true : false,
                type: MenuItemType.switch,
                icon: this.schemaView?.locker?.lock ? UnlockSvg : LockSvg
            },
            { type: MenuItemType.divide },
            { text: '导入', disabled: true, icon: ImportSvg, name: 'import' },
            { text: '导出', disabled: true, icon: FileSvg, name: 'export' },
        ]
        var um = await useSelectMenuItem({ roundArea: rect }, menus, {
            async input(item) {
                if (item.name == 'lock') {
                    await self.onLock(item.checked);
                }
            }
        });
        if (um) {
            switch (um.item.name) {
                case 'copylink':
                    var url = getWsElementUrl({
                        type: ElementType.SchemaView,
                        id: this.syncBlockId,
                        id1: this.schemaView.id
                    });
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
            }
        }
        this.dataGridTool.isOpenTool = false;
        this.onOver(this.getVisibleContentBound().contain(Point.from(this.page.kit.operator.moveEvent)))
    }
    async onOpenForm(this: DataGridView, rect: Rect) {
        this.dataGridTool.isOpenTool = true;
        var newRow = await useFormPage({
            schema: this.schema,
            recordViewId: this.schema.recordViews.first().id
        });
        if (newRow) {
            await this.onAddRow(newRow, undefined, 'after')
        }
        this.dataGridTool.isOpenTool = false;
        this.onOver(this.getVisibleContentBound().contain(Point.from(this.page.kit.operator.moveEvent)))
    }
    async onOpenFormDrop(this: DataGridView, rect: Rect) {
        this.dataGridTool.isOpenTool = true;
        await useTabelSchemaFormDrop({ roundArea: rect }, {
            schema: this.schema
        });
        this.dataGridTool.isOpenTool = false;
        this.onOver(this.getVisibleContentBound().contain(Point.from(this.page.kit.operator.moveEvent)))
    }
}