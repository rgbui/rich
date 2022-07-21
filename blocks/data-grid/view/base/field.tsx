import dayjs from "dayjs";
import lodash from "lodash";
import React from "react";
import { DataGridView } from ".";
import { ShyAlert } from "../../../../component/lib/alert";
import { ArrowLeftSvg, ArrowRightSvg, HideSvg, ArrowDownSvg, ArrowUpSvg, FilterSvg, OptionsSvg, DuplicateSvg, TrashSvg, SettingsSvg, EditSvg, EmojiSvg, TypesSelectSvg, DotsSvg, PlusSvg, CheckSvg } from "../../../../component/svgs";
import { Icon } from "../../../../component/view/icon";
import { useSelectMenuItem } from "../../../../component/view/menu";
import { MenuItem, MenuItemType } from "../../../../component/view/menu/declare";
import { useTableStoreAddField } from "../../../../extensions/data-grid/field";
import { useFormula } from "../../../../extensions/data-grid/formula";
import { OptionBackgroundColorList } from "../../../../extensions/data-grid/option/option";
import { useOpenEmoji } from "../../../../extensions/emoji";
import { BlockDirective } from "../../../../src/block/enum";
import { Rect, Point } from "../../../../src/common/vector/point";
import { util } from "../../../../util/util";
import { DataGridOptionType } from "../../schema/field";
import { FieldType } from "../../schema/type";
import { ViewField } from "../../schema/view";

export class DataGridViewField {
    private getFieldMenuItems(this: DataGridView, viewField: ViewField) {
        var items: MenuItem<BlockDirective | string>[] = [];
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
                items.removeAll(g => ['sortDesc', 'sortAsc', 'filter'].includes((g as any).name));
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
                        {
                            type: MenuItemType.container,
                            name: 'optionContainer',
                            childs: [
                                ...viewField.field.config.options.map(op => {
                                    return {
                                        text: op.text,
                                        value: op.value,
                                        name: 'optionItem',
                                        type: MenuItemType.drag,
                                        btns: [{ name: 'editOptionOption', icon: DotsSvg }]
                                    }
                                })
                            ]
                        }
                        ,
                        ...(viewField.field.config.options.length > 0 ? [{ type: MenuItemType.divide }] : []),
                        {
                            type: MenuItemType.button,
                            text: '添加选项',
                            icon: PlusSvg,
                            buttonClick: 'click',
                            name: 'addOption'
                        }
                    ]
                });
            }
        }
        return items;
    }
    async onOpenFieldOptions(options: DataGridOptionType[], option: DataGridOptionType, event: React.MouseEvent) {
        event.stopPropagation();
        var menus = [
            { text: '标签', name: 'name', value: option.text, type: MenuItemType.input },
            { type: MenuItemType.divide },
            { name: 'delete', icon: TrashSvg, text: '删除' },
            { type: MenuItemType.divide },
            { type: MenuItemType.text, text: '颜色' },
            ...OptionBackgroundColorList.map(b => {
                return {
                    name: 'color',
                    value: b.color,
                    text: b.text,
                    type: MenuItemType.custom,
                    render(item) {
                        return <div className="shy-tablestore-option-selector-property">
                            <span style={{ backgroundColor: item.value }}></span>
                            <span >{b.text}</span>
                            {option.color == item.value && <Icon size={12} icon={CheckSvg}></Icon>}
                        </div>
                    }
                }
            })
        ]
        if (!option.text) {
            menus.remove(g => g.name == 'delete');
        }
        var um = await useSelectMenuItem({ roundPoint: Point.from(event) }, menus, { nickName: 'second' });
        if (um) {
            if (um.item.name == 'color') {
                option.color = um.item.value;
            }
            else if (um.item.name == 'delete') {
                options.remove(o => o === option);
            }
        }
        var name = menus[0].value;
        if (name && name != option.text) {
            if (options.some(s => s.text == name && s !== option)) {
                ShyAlert('当前标签项已存在。');
            }
            else {
                option.text = name;
            }
        }
    }
    async onOpenFieldConfig(this: DataGridView,
        event: React.MouseEvent | MouseEvent,
        viewField: ViewField) {
        event.stopPropagation();
        var self = this;
        self.dataGridTool.isOpenTool = true;
        var rp = Rect.fromEvent(event);
        var isSysField: boolean = viewField.type || viewField?.field?.type == FieldType.autoIncrement ? true : false;
        var items = this.getFieldMenuItems(viewField);
        var re = await useSelectMenuItem(
            {
                roundArea: rp,
                direction: 'left'
            },
            items,
            {
                async click(item, ev, name, mp) {
                    mp.onFree();
                    try {
                        if (item.name == 'optionItem') {
                            if (name == 'editOptionOption') {
                                var ops = lodash.cloneDeep(viewField.field.config.options);
                                var op = ops.find(g => g.value == item.value);
                                await self.onOpenFieldOptions(ops, op, ev);
                                if (JSON.stringify(ops) != JSON.stringify(viewField.field.config.options)) {
                                    var config = lodash.cloneDeep(viewField?.field?.config);
                                    if (typeof config == 'undefined') config = {};
                                    config.options = ops;
                                    await self.onUpdateField(viewField, { config });
                                    mp.updateItems(self.getFieldMenuItems(viewField))
                                }
                            }
                        }
                        else if (item.name == 'addOption') {
                            var ops = lodash.cloneDeep(viewField.field.config.options);
                            var or = OptionBackgroundColorList.find(g => ops.some(s => s.color == g.color) ? false : true);
                            var op: DataGridOptionType = { text: '', value: util.guid(), color: or?.color || OptionBackgroundColorList[0].color };
                            await self.onOpenFieldOptions(ops, op, ev);
                            if (op.text) {
                                ops.push(op);
                                var config = lodash.cloneDeep(viewField?.field?.config);
                                if (typeof config == 'undefined') config = {};
                                config.options = ops;
                                await self.onUpdateField(viewField, { config });
                                mp.updateItems(self.getFieldMenuItems(viewField))
                            }
                        }
                    }
                    catch (ex) {

                    }
                    finally {
                        mp.onUnfree()
                    }
                },
                async input(item) {
                    if (item.name == 'includeTime') {
                        var config = lodash.cloneDeep(viewField?.field?.config);
                        if (typeof config == 'undefined') config = {};
                        config.includeTime = item.checked;
                        await self.onUpdateField(viewField, { config });
                    }
                    else if (item.name == 'isMultiple') {
                        var config = lodash.cloneDeep(viewField?.field?.config);
                        if (typeof config == 'undefined') config = {};
                        config.isMultiple = item.checked;
                        await self.onUpdateField(viewField, { config });
                    }
                    else if (item.name == 'optionContainer') {
                        var [from, to] = item.value;
                        var ops = lodash.cloneDeep(viewField.field.config.options);
                        var f = ops[from];
                        ops.remove(g => g === f);
                        ops.insertAt(to, f);
                        var config = lodash.cloneDeep(viewField?.field?.config);
                        if (typeof config == 'undefined') config = {};
                        config.options = ops;
                        await self.onUpdateField(viewField, { config });
                    }
                }
            }
        );
        var ReItem = items.find(g => g.name == 'name');
        var dItem = items.arrayJsonFind('childs', g => g.name == 'dateCustomFormat');
        if (re) {
            if (re.item.name == 'hide') {
                this.onHideField(viewField);
            }
            else if (re.item.name == 'editProperty') {
                var r = await useTableStoreAddField(
                    { roundArea: rp },
                    { field: viewField.field, dataGrid: self }
                );
                if (r) {
                    if (r.type == viewField.field.type) {

                    }
                    else {
                        var config = lodash.cloneDeep(viewField.field.config || {});
                        Object.assign(config, r.config);
                        await this.onTurnField(viewField, r.type, { text: r.text, config });
                    }
                }
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
                var config = lodash.cloneDeep(viewField?.field?.config);
                if (typeof config == 'undefined') config = {};
                config.dateFormat = re.item.value;
                if (dItem) dItem.value = re.item.value;
                await this.onUpdateField(viewField, { config });
            }
            else if (re.item.name == 'formula') {
                var formula = await useFormula({ roundArea: rp }, {
                    schema: this.schema,
                    formula: viewField.field.config.formula
                });
                var config = lodash.cloneDeep(viewField?.field?.config);
                if (typeof config == 'undefined') config = {};
                config.formula = formula;
                await self.onUpdateField(viewField, { config });
            }
            else if (re.item.name == 'emoji') {
                console.log('ggg');
                var rc = await useOpenEmoji({ roundArea: rp });
                if (rc) {
                    var config = lodash.cloneDeep(viewField?.field?.config);
                    if (typeof config == 'undefined') config = {};
                    config.emoji = rc;
                    await self.onUpdateField(viewField, { config });
                }
            }
        }
        if (isSysField) {
            if (ReItem.value != viewField?.text) {
                //编辑列名了
                this.onUpdateViewField(viewField, { text: ReItem.value })
            }
        }
        else {
            if (ReItem.value != viewField.field?.text) {
                //编辑列名了
                this.onUpdateField(viewField, { text: ReItem.value })
            }
        }

        if (dItem) {
            if (dItem.value != viewField.field.config.dateFormat) {
                var config = lodash.cloneDeep(viewField?.field?.config);
                if (typeof config == 'undefined') config = {};
                config.dateFormat = dItem.value;
                await this.onUpdateField(viewField, { config });
            }
        }
        self.dataGridTool.isOpenTool = false;
        this.onOver(this.getVisibleContentBound().contain(Point.from(this.page.kit.operator.moveEvent)))
    }
}