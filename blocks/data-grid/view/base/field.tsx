import dayjs from "dayjs";
import lodash from "lodash";
import React from "react";
import { DataGridView } from ".";

import { ShyAlert } from "../../../../component/lib/alert";
import {
    ArrowLeftSvg,
    ArrowRightSvg,
    HideSvg,
    FilterSvg,
    DuplicateSvg,
    TrashSvg,
    SettingsSvg,
    EmojiSvg,
    TypesSelectSvg,
    DotsSvg,
    PlusSvg,
    CheckSvg,
    MaximizeSvg,
    TypesNumberSvg
} from "../../../../component/svgs";
import { Icon } from "../../../../component/view/icon";
import { useSelectMenuItem } from "../../../../component/view/menu";
import { MenuItem, MenuItemType } from "../../../../component/view/menu/declare";
import { useTableStoreAddField } from "../../../../extensions/data-grid/field";
import { useOpenEmoji } from "../../../../extensions/emoji";
import { BlockDirective } from "../../../../src/block/enum";
import { Rect, Point } from "../../../../src/common/vector/point";
import { util } from "../../../../util/util";
import { DataGridOptionType, Field } from "../../schema/field";
import { FieldType, getFilterRollupFields, SupportTurnFieldTypes } from "../../schema/type";
import { ViewField } from "../../schema/view";
import { lst } from "../../../../i18n/store";
import { OptionBackgroundColorList } from "../../../../extensions/color/data";
import { TableSchema } from "../../schema/meta";
import { useFormula } from "../../../../extensions/data-grid/formula/lazy";
import { getFieldStatItems, GetFieldTypeSvg } from "../../schema/util";

export class DataGridViewField {
    private getFieldMenuItems(this: DataGridView, field: Field, viewField: ViewField) {
        var items: MenuItem<BlockDirective | string>[] = [];
        var tips: MenuItem<BlockDirective | string>[] = [
            { type: MenuItemType.divide },
            { type: MenuItemType.help, text: lst('了解如何使用数据表字段'), url: window.shyConfig?.isUS ? "https://help.shy.red/page/43#2PRKjiNkLmU6w4xciiy1t1" : "https://help.shy.live/page/1871#gVnf6Ar2iF5wa2fS2KpLws" }
        ]
        if (viewField?.type) {
            items.push(...[
                {
                    name: 'name',
                    type: MenuItemType.input,
                    value: viewField?.text,
                    text: lst('编辑列名'),
                },
                { type: MenuItemType.divide },
                { name: 'leftInsert', icon: ArrowLeftSvg, text: lst('在左侧添加字段') },
                { name: 'rightInsert', icon: ArrowRightSvg, text: lst('在右侧添加字段') },
                { type: MenuItemType.divide },
                {
                    name: 'hide',
                    icon: HideSvg,
                    text: lst('隐藏列')
                }, ...tips
            ]);
        }
        else {
            var descText = lst('按 Z → A 降序排序');
            var ascText = lst('按 A → Z 升序排序');
            if (TableSchema.fieldIsDate(field)) {
                descText = lst('按时间降序排序');
                ascText = lst('按时间升序排序');
            }
            else if ([
                FieldType.number,
                FieldType.price,
                FieldType.comment,
                FieldType.browse,
                FieldType.like,
                FieldType.vote,
                FieldType.autoIncrement
            ].includes(field.type)) {
                descText = lst('按 10 → 1 降序排序');
                ascText = lst('按 1 → 10 升序排序');
            }
            items.push(...[
                {
                    name: 'name',
                    type: MenuItemType.inputTitleAndIcon,
                    icon: GetFieldTypeSvg(field),
                    value: field?.text,
                    text: lst('编辑列名'),
                },
                { type: MenuItemType.divide },
                {
                    name: 'editProperty',
                    visible: SupportTurnFieldTypes.includes(field.type) ? true : false,
                    icon: { name: "bytedance-icon", code: 'write' } as any,
                    text: lst('编辑字段')
                },
                { type: MenuItemType.divide, visible: SupportTurnFieldTypes.includes(field.type) ? true : false, },
                { name: 'sortAsc', icon: { name: 'byte', code: 'sort-amount-up' } as any, text: ascText },
                { name: 'sortDesc', icon: { name: 'byte', code: 'sort-amount-down' } as any, text: descText },
                { name: 'filter', icon: FilterSvg, text: lst('按该字段筛选') },
                { type: MenuItemType.divide },
                { name: 'leftInsert', icon: ArrowLeftSvg, text: lst('在左侧添加字段') },
                { name: 'rightInsert', icon: ArrowRightSvg, text: lst('在右侧添加字段') },
                {
                    name: 'hide',
                    icon: HideSvg,
                    text: lst('隐藏列')
                },
                {
                    name: 'clone',
                    icon: DuplicateSvg,
                    disabled: TableSchema.isOnlyFieldTypes(field),
                    text: lst('复制列')
                },
                {
                    name: 'deleteProperty',
                    icon: TrashSvg,
                    warn: true,
                    disabled: TableSchema.isSystemField(field),
                    text: lst('删除字段')
                },
                ...tips
            ]);
            if (field?.type == FieldType.date || field?.type == FieldType.createDate || field?.type == FieldType.modifyDate) {
                var dateItems: MenuItem<BlockDirective | string>[] = [];
                var day = dayjs(new Date());
                dateItems.push(...[
                    {
                        name: 'dateCustomFormat',
                        type: MenuItemType.input,
                        value: field?.config?.dateFormat || lst('YYYY年MM月DD日'),
                        text: lst('编辑日期格式'),
                    },
                    { type: MenuItemType.divide },
                    {
                        name: 'dateFormat',
                        text: lst('年月日'),
                        value: lst('YYYY年MM月DD日'),
                        label: day.format(lst('YYYY年MM月DD日'))
                    },
                    {
                        name: 'dateFormat',
                        text: lst('年月'),
                        value: lst('YYYY年MM月'),
                        label: day.format(lst('YYYY年MM月'))
                    },
                    {
                        name: 'dateFormat',
                        text: lst('月日'),
                        value: lst('MM月DD日'),
                        label: day.format(lst('MM月DD日'))
                    },
                    {
                        name: 'dateFormat',
                        text: lst('日期时间'),
                        value: lst('YYYY/MM/DD HH:mm'),
                        label: day.format(lst('YYYY/MM/DD HH:mm'))
                    },
                    {
                        name: 'dateFormat',
                        text: lst('时间'),
                        value: 'HH:mm',
                        label: day.format('HH:mm')
                    }
                ]);
                items.insertAt(3, { type: MenuItemType.divide });
                items.insertAt(4, {
                    text: lst('日期格式'),
                    childs: dateItems,
                    icon: { name: 'bytedance-icon', code: 'calendar-thirty' }
                });
                items.insertAt(5, {
                    text: lst('包括时间'),
                    type: MenuItemType.switch,
                    name: 'includeTime',
                    icon: { name: "bytedance-icon", code: 'time' },
                    checked: field?.config?.includeTime ? true : false
                });
            }
            else if (field?.type == FieldType.number) {
                var dateItems: MenuItem<BlockDirective | string>[] = [];
                dateItems.push(...[
                    { name: 'numberFormat', text: lst('数字'), value: 'number', checkLabel: field.config?.numberFormat == 'number' },
                    { name: 'numberFormat', text: lst('整数'), value: 'int', checkLabel: field.config?.numberFormat == 'int' },
                    { name: 'numberFormat', text: lst('千分位'), value: '1000', checkLabel: field.config?.numberFormat == '1000' },
                    { name: 'numberFormat', text: lst('两位小数'), value: '0.00', checkLabel: field.config?.numberFormat == '0.00' },
                    { name: 'numberFormat', text: lst('百分比'), value: '%', checkLabel: field.config?.numberFormat == '%' },
                    { type: MenuItemType.divide },
                    { name: 'numberFormat', text: lst('人民币'), value: '￥', checkLabel: field.config?.numberFormat == '￥' },
                    { name: 'numberFormat', text: lst('美元'), value: '$', checkLabel: field.config?.numberFormat == '$' },
                    { name: 'numberFormat', text: lst('欧元'), value: '€', checkLabel: field.config?.numberFormat == '€' },
                    { name: 'numberFormat', text: lst('日元'), value: 'JP¥', checkLabel: field.config?.numberFormat == 'JP¥' },
                    { name: 'numberFormat', text: lst('港元'), value: 'HK$', checkLabel: field.config?.numberFormat == 'HK$' },
                    { type: MenuItemType.divide },
                    {
                        text: lst('自定义格式'),
                        childs: [
                            {
                                name: 'numberUnitCustom',
                                type: MenuItemType.input,
                                value: field.config?.numberFormat?.indexOf('{value}') > -1 ? field.config?.numberFormat : '',
                                text: lst('输入数字格式'),
                            },
                            { type: MenuItemType.divide },
                            { name: 'numberUnit', text: 'm/s', value: '{value}m/s', checkLabel: field.config?.numberFormat == 'number' },
                            { name: 'numberUnit', text: 'kg', value: '{value}kg', checkLabel: field.config?.numberFormat == 'number' },
                            { name: 'numberUnit', text: ' °c', value: '{value}°c', checkLabel: field.config?.numberFormat == 'number' }
                        ]
                    },
                    /**
                     * 这里需要加上单位的基准
                     */
                    // { text: '单位换算', childs: [{ text: '距离' }] },
                    // { text: '数字区间', childs: [{ text: '胖' }] }
                ]);
                items.insertAt(3, { type: MenuItemType.divide });
                items.insertAt(4, {
                    text: lst('显示'),
                    updateMenuPanel: true,
                    type: MenuItemType.select,
                    icon: { name: 'byte', code: 'sales-report' },
                    name: 'config.numberDisplay.display',
                    value: field.config?.numberDisplay?.display || 'auto',
                    options: [
                        { text: lst('数字'), value: 'auto', icon: TypesNumberSvg },
                        { text: lst('进度条'), value: 'percent', icon: { name: 'byte', code: 'percentage' } },
                        { text: lst('圆环'), value: 'ring', icon: { name: 'byte', code: 'chart-ring' } }
                    ]
                })
                items.insertAt(5, {
                    text: lst('数字格式'),
                    childs: dateItems,
                    icon: SettingsSvg,
                    visible: (items) => {
                        var mp = items.find(g => g.name == 'config.numberDisplay.display');
                        if (mp?.value == 'auto') return true
                        else return false
                    },
                });
                items.insertAt(6, {
                    text: lst('格式'),
                    icon: SettingsSvg,
                    visible: (items) => {
                        var mp = items.find(g => g.name == 'config.numberDisplay.display');
                        if (mp?.value == 'auto') return false
                        else return true
                    },
                    childs: [
                        // {
                        //     text: lst('颜色'),
                        //     type: MenuItemType.color,
                        //     value: field.config?.numberDisplay?.color || 'rgba(55,53,47,0.6)',
                        //     name: 'config.numberDisplay.color',
                        //     options: BackgroundColorList().map(f => {
                        //         return {
                        //             text: f.text,
                        //             overlay: f.text,
                        //             value: f.color,
                        //             checked: lodash.isEqual(field.config?.numberDisplay?.color, f.color) ? true : false
                        //         }
                        //     })
                        // },
                        // { type: MenuItemType.divide },
                        {
                            text: lst('度量'),
                            label: lst('度量'),
                            type: MenuItemType.input,
                            value: field.config?.numberDisplay?.decimal || 100,
                            name: 'config.numberDisplay.decimal'
                        },
                        { type: MenuItemType.divide },
                        {
                            text: lst('数字'),
                            type: MenuItemType.switch,
                            checked: field.config?.numberDisplay?.showNumber ? true : false,
                            name: 'config.numberDisplay.showNumber',
                            icon: { name: 'byte', code: 'preview-open' }
                        }
                    ]
                });
            }
            else if (field.type == FieldType.image) {
                items.insertAt(4, {
                    text: lst('图片展示'),
                    type: MenuItemType.select,
                    name: 'config.imageFormat.display',
                    icon: { name: 'bytedance-icon', code: 'picture-one' },
                    value: field.config?.imageFormat?.display || "thumb",
                    options: [
                        { text: lst('略缩图'), value: 'thumb', icon: { name: 'byte', code: 'new-picture' } },
                        { text: lst('自适应'), value: 'auto', icon: { name: 'byte', code: 'moving-picture' } }
                    ],
                    buttonClick: 'select'
                });
                text = lst('允许多张图片');
                items.insertAt(5, {
                    text: text,
                    type: MenuItemType.switch,
                    name: 'isMultiple',
                    icon: { name: "bytedance-icon", code: 'more-two' },
                    updateMenuPanel: true,
                    checked: field?.config?.isMultiple ? true : false
                });
                items.insertAt(6, {
                    text: lst('多张图片展示'),
                    visible: (items) => {
                        var mp = items.find(g => g.name == 'isMultiple');
                        if (mp?.checked) return true
                        else return false
                    },
                    type: MenuItemType.select,
                    name: 'config.imageFormat.multipleDisplay',
                    value: field.config?.imageFormat?.multipleDisplay || "tile",
                    options: [
                        { text: lst('平铺'), value: 'tile', icon: { name: 'byte', code: 'all-application' } },
                        { text: lst('轮播'), value: 'carousel', icon: { name: 'byte', code: 'multi-picture-carousel' } }
                    ],
                    buttonClick: 'select'
                });
                items.insertAt(7, { type: MenuItemType.divide });
            }
            else if ([FieldType.file, FieldType.user].includes(field?.type)) {
                var text = lst('允许多文件');
                if (field.type == FieldType.user)
                    text = lst('允许多用用户');
                items.insertAt(5, {
                    text: text,
                    type: MenuItemType.switch,
                    name: 'isMultiple',
                    icon: { name: "bytedance-icon", code: 'more-two' },
                    updateMenuPanel: true,
                    checked: field?.config?.isMultiple ? true : false
                });
                items.insertAt(6, {
                    type: MenuItemType.divide
                })
            }
            else if (field?.type == FieldType.formula) {
                items.insertAt(4, {
                    text: lst('编辑公式'),
                    name: 'formula',
                    icon: { name: 'byte', code: 'formula' }
                });
                // items.removeAll(g => ['sortDesc', 'sortAsc', 'filter'].includes((g as any).name));
                items.splice(items.findIndex(c => c.name == 'sortAsc'), 4);
            }
            else if (field?.type == FieldType.relation) {
                items.insertAt(4, {
                    text: lst('打开关联表'),
                    name: 'openRelation',
                    icon: MaximizeSvg
                });
                items.insertAt(5, {
                    text: lst('允许关联一对多'),
                    type: MenuItemType.switch,
                    name: 'isMultiple',
                    icon: { name: 'bytedance-icon', code: 'one-to-many' },
                    checked: field?.config?.isMultiple ? true : false
                });
                items.insertAt(6, {
                    type: MenuItemType.divide
                })
            }
            else if (field?.type == FieldType.rollup) {
                items.insertAt(4, {
                    text: lst('关联数据表'),
                    name: 'config.rollupTableId',
                    type: MenuItemType.select,
                    value: field.config?.rollupTableId,
                    options: this.relationSchemas.map(c => {
                        return {
                            icon: c.icon || { name: 'byte', code: 'table' },
                            text: c.text,
                            value: c.id,
                            checkLabel: c.id == field.config?.rollupTableId
                        }
                    })
                });
                items.insertAt(5, {
                    text: lst('字段'),
                    name: 'config.rollupFieldId',
                    type: MenuItemType.select,
                    value: field.config?.rollupFieldId,
                    cacOptions: async (items, item) => {
                        var rt = items.find(g => g.name == 'config.rollupTableId');
                        return getFilterRollupFields(this.relationSchemas.find(c => c.id == rt.value)?.visibleFields).map(r => {
                            return {
                                text: r.text,
                                value: r.id,
                                icon: GetFieldTypeSvg(r),
                                checkLabel: r.id == field.config?.rollupFieldId
                            }
                        })
                    }
                });
                items.insertAt(6, {
                    text: lst('计算'),
                    name: 'config.rollupStatistic',
                    value: field.config?.rollupStatistic,
                    type: MenuItemType.select,
                    cacOptions: async (items, item) => {
                        var rt = items.find(g => g.name == 'config.rollupTableId');
                        var rf = items.find(g => g.name == 'config.rollupFieldId');
                        var f = this.relationSchemas.find(c => c.id == rt.value)?.visibleFields?.find(g => g.id == rf.value);
                        var statMenus = getFieldStatItems(f?.type);
                        statMenus.splice(0, 1, {
                            text: lst('显示原值'),
                            value: 'origin',
                        }, {
                            text: lst('显示唯一原值'),
                            value: 'uniqueOrigin',
                        }, { type: MenuItemType.divide });
                        return statMenus;
                    }
                });
                items.insertAt(7, {
                    type: MenuItemType.divide
                })
                items.splice(items.findIndex(c => c.name == 'sortAsc'), 4);
            }
            else if (field?.type == FieldType.emoji) {
                items.insertAt(4, {
                    text: lst('更换表情'),
                    name: 'emoji',
                    icon: EmojiSvg
                });
                items.insertAt(5, {
                    type: MenuItemType.divide
                })
            }
            else if (field?.type == FieldType.option || field.type == FieldType.options) {
                items.insertAt(3, { type: MenuItemType.divide });
                items.insertAt(4, {
                    text: lst('选项'),
                    icon: TypesSelectSvg,
                    childs: [
                        {
                            type: MenuItemType.container,
                            name: 'optionContainer',
                            childs: [
                                ...(field.config?.options || []).map(op => {
                                    return {
                                        value: op.value,
                                        name: 'optionItem',
                                        type: MenuItemType.drag,
                                        renderContent() {
                                            return <span className="round padding-w-5 f-14 padding-h-2  l-16" style={{ backgroundColor: op?.fill || op?.color, color: op.textColor }}>{op.text}</span>
                                        },
                                        btns: [{ name: 'editOptionOption', icon: DotsSvg }]
                                    }
                                })
                            ]
                        },
                        ...((field.config?.options || []).length > 0 ? [{ type: MenuItemType.divide }] : []),
                        {
                            type: MenuItemType.button,
                            text: lst('添加选项'),
                            icon: PlusSvg,
                            buttonClick: 'click',
                            name: 'addOption'
                        }
                    ]
                });
            }
            if (!viewField) {
                lodash.remove(items, g =>
                    ['sortAsc', 'sortDesc', 'filter', 'leftInsert', 'rightInsert', 'hide'].includes(g.name as any))
            }
        }
        return items;
    }
    async onOpenFieldOptions(options: DataGridOptionType[], option: DataGridOptionType, event: React.MouseEvent) {
        event.stopPropagation();
        var menus = [
            { text: lst('标签'), name: 'name', value: option.text, type: MenuItemType.input },
            { type: MenuItemType.divide },
            { type: MenuItemType.text, text: lst('颜色') },
            ...OptionBackgroundColorList().map(b => {
                return {
                    name: 'color',
                    value: { fill: b.fill, textColor: b.color },
                    text: b.text,
                    type: MenuItemType.custom,
                    render(item) {
                        return <div className="flex padding-w-5 gap-w-5 h-30 item-hover round cursor">
                            <span className="flex-fixed size-20 gap-l-3 round gap-r-10 border" style={{ backgroundColor: item.value.fill, color: item.value.textColor }}></span>
                            <span className="flex-auto text f-14">{b.text}</span>
                            {(option.color && option.color == item.value?.fill || option.fill == item.value.fill) &&
                                <span className="flex-fixed size-24 flex-center"><Icon size={16} icon={CheckSvg}></Icon></span>
                            }
                        </div>
                    }
                }
            }),
            { type: MenuItemType.divide },
            { name: 'delete', icon: TrashSvg, text: lst('删除') },
        ]
        if (!option.text) {
            menus.remove(g => g.name == 'delete');
        }
        var um = await useSelectMenuItem({ roundPoint: Point.from(event) }, menus, { nickName: 'second' });
        if (um) {
            if (um.item.name == 'color') {
                option.fill = um.item.value.fill;
                option.textColor = um.item.value.color;
            }
            else if (um.item.name == 'delete') {
                options.remove(o => o === option);
            }
        }
        var name = menus[0].value;
        if (name && name != option.text) {
            if (options.some(s => s.text == name && s !== option)) {
                ShyAlert(lst('当前标签项已存在'));
            }
            else {
                option.text = name as string;
            }
        }
    }
    async onOpenFieldConfig(
        this: DataGridView,
        event: React.MouseEvent | MouseEvent,
        field: Field,
        viewField: ViewField) {
        event.stopPropagation();
        var self = this;
        var rp = Rect.fromEvent(event);
        await this.onDataGridTool(async () => {
            var isSysField: boolean = viewField?.type ? true : false;
            var items = this.getFieldMenuItems(field, viewField);
            items = util.neighborDeWeight(items, c => (c.name + "") + c.type);
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
                                    var ops = lodash.cloneDeep(field?.config?.options) || [];
                                    var op = ops.find(g => g.value == item.value);
                                    await self.onOpenFieldOptions(ops, op, ev);
                                    if (JSON.stringify(ops) != JSON.stringify(field.config.options)) {
                                        var config = lodash.cloneDeep(field?.config);
                                        if (typeof config == 'undefined') config = {};
                                        config.options = ops;
                                        await self.onUpdateField(field, { config });
                                        mp.updateItems(self.getFieldMenuItems(field, viewField))
                                    }
                                }
                            }
                            else if (item.name == 'addOption') {
                                var ops = lodash.cloneDeep(field?.config?.options || []);
                                var or = OptionBackgroundColorList().findAll(g => ops.some(s => s.color && s.color == g.fill || s.fill && s.fill == g.fill) ? false : true).randomOf();
                                if (!or) or = OptionBackgroundColorList().randomOf();
                                var op: DataGridOptionType = { text: '', value: util.guid(), fill: or.fill, textColor: or.color };
                                await self.onOpenFieldOptions(ops, op, ev);
                                if (op.text) {
                                    ops.push(op);
                                    var config = lodash.cloneDeep(field?.config);
                                    if (typeof config == 'undefined') config = {};
                                    config.options = ops;
                                    await self.onUpdateField(field, { config });
                                    mp.updateItems(self.getFieldMenuItems(field, viewField))
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
                            await self.onUpdateFieldConfig(field, { includeTime: item.checked });
                        }
                        else if (item.name == 'isMultiple') {
                            await self.onUpdateFieldConfig(field, { isMultiple: item.checked });
                        }
                        else if (item.name == 'optionContainer') {
                            var [from, to] = item.value;
                            var ops = lodash.cloneDeep(field.config.options);
                            var f = ops[from];
                            ops.remove(g => g === f);
                            ops.insertAt(to, f);
                            await self.onUpdateFieldConfig(field, { options: ops });
                        }
                        else if ([
                            'config.numberDisplay.showNumber',
                            'config.numberDisplay.display',
                            'config.imageFormat.display',
                            'config.imageFormat.multipleDisplay',
                            'config.numberDisplay.color',
                            'config.rollupTableId',
                            'config.rollupFieldId',
                            'config.rollupStatistic'
                        ].includes(item.name as string)) {
                            var n = (item.name as string).replace('config.', '');
                            await self.onUpdateFieldConfig(field, { [n]: item.value });
                        }

                    }
                }
            );
            var ReItem = items.find(g => g.name == 'name');
            var dateCustomFormat = items.arrayJsonFind('childs', g => g.name == 'dateCustomFormat');
            var numberUnitCustom = items.arrayJsonFind('childs', g => g.name == 'numberUnitCustom');
            var config_numberDisplay_decimal = items.arrayJsonFind('childs', g => g.name == 'config.numberDisplay.decimal');
            if (re) {
                if (re.item.name == 'hide') {
                    this.onHideField(viewField);
                }
                else if (re.item.name == 'editProperty') {
                    var r = await useTableStoreAddField(
                        { roundArea: rp },
                        { field: field, dataGrid: self }
                    );
                    if (r) {
                        if (!r.text) return;
                        if (r.type == field.type) {
                            var props: Record<string, any> = { text: r.text };
                            if (r.config) {
                                props.config = Object.assign({}, field.config || {}, r.config)
                            }
                            if (!lodash.isEqual(props, { text: field.text, config: field.config }))
                                await this.onUpdateField(field, props)
                        }
                        else {
                            var props: Record<string, any> = { text: r.text };
                            if (r.config) {
                                props.config = Object.assign({}, field.config || {}, r.config)
                            }
                            await this.onTurnField(field, r.type, props);
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
                    this.onCloneViewField(field, viewField);
                }
                else if (re.item.name == 'deleteProperty') {
                    this.onDeleteViewField(field);
                }
                else if (re.item.name == 'filter') {
                    this.onAddFilter(field);
                }
                else if (re.item.name == 'sortDesc') {
                    this.onSetSortField(field, -1);
                }
                else if (re.item.name == 'sortAsc') {
                    this.onSetSortField(field, 1);
                }
                else if (re?.item.name == 'dateFormat') {
                    if (dateCustomFormat) dateCustomFormat.value = re.item.value;
                    await this.onUpdateFieldConfig(field, { dateFormat: re.item.value })
                }
                else if (re?.item.name == 'numberFormat' || re?.item.name == 'numberUnit') {
                    numberUnitCustom.value = re.item.value;
                    await this.onUpdateFieldConfig(field, { numberFormat: re.item.value });
                }
                else if (re.item.name == 'formula') {
                    var formula = await useFormula({ roundArea: rp }, {
                        schema: this.schema,
                        formula: field.config.formula?.formula || ''
                    });
                    if (!lodash.isUndefined(formula)) await this.onUpdateFieldConfig(field, { formula });
                }
                else if (re.item.name == 'emoji') {
                    var rc = await useOpenEmoji({ roundArea: rp });
                    if (rc) {
                        await self.onUpdateFieldConfig(field, { emoji: rc });
                    }
                }
                else if (
                    [
                        'config.numberDisplay.showNumber',
                        'config.numberDisplay.display',
                        'config.imageFormat.display',
                        'config.imageFormat.multipleDisplay',
                        'config.numberDisplay.color'
                    ].includes(re.item.name as any)) {
                    var n = (re.item.name as string).replace('config.', '');
                    await self.onUpdateFieldConfig(field, { [n]: re.item.value });
                }
                else if (re.item.name == 'openRelation') {
                    await self.onOpenSchemaPage(field.config.relationTableId)
                }
                return;
            }
            if (isSysField) {
                var props: Record<string, any> = {};
                if (ReItem.value != viewField?.text) {
                    props.text = ReItem.value;
                }
                if (!lodash.isEqual(ReItem.icon, field.icon)) {
                    props.icon = ReItem.icon;
                }
                if (Object.keys(props).length > 0) {
                    if (field) await this.onUpdateField(field, props)
                    else await this.onUpdateViewField(viewField, props)
                }
            }
            else {
                var props: Record<string, any> = {};
                if (!lodash.isEqual(ReItem.icon, field.icon)) {
                    props.icon = ReItem.icon;
                }
                if (ReItem.value != field?.text) {
                    //编辑列名了
                    props.text = ReItem.value;
                }
                if (Object.keys(props).length > 0)
                    await this.onUpdateField(field, props)
            }
            if (dateCustomFormat) {
                if (dateCustomFormat.value != field?.config?.dateFormat) {
                    await this.onUpdateFieldConfig(field, { dateFormat: dateCustomFormat.value });
                }
            }
            if (config_numberDisplay_decimal) {
                if (config_numberDisplay_decimal.value != field?.config?.numberDisplay?.decimal) {
                    await this.onUpdateFieldConfig(field, { 'numberDisplay.decimal': config_numberDisplay_decimal.value });
                }
            }
            if (numberUnitCustom) {
                if (numberUnitCustom.value && numberUnitCustom.value != field.config.numberFormat) {
                    await this.onUpdateFieldConfig(field, { numberFormat: numberUnitCustom.value });
                }
            }
        })
    }
}