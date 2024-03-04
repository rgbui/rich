import dayjs from "dayjs";
import lodash from "lodash";
import React from "react";
import { DataGridView } from ".";

import { ShyAlert } from "../../../../component/lib/alert";
import { ArrowLeftSvg, ArrowRightSvg, HideSvg, ArrowDownSvg, ArrowUpSvg, FilterSvg, DuplicateSvg, TrashSvg, SettingsSvg, EditSvg, EmojiSvg, TypesSelectSvg, DotsSvg, PlusSvg, CheckSvg, MaximizeSvg } from "../../../../component/svgs";
import { Icon } from "../../../../component/view/icon";
import { useSelectMenuItem } from "../../../../component/view/menu";
import { MenuItem, MenuItemType } from "../../../../component/view/menu/declare";
import { useTableStoreAddField } from "../../../../extensions/data-grid/field";
import { useFormula } from "../../../../extensions/data-grid/formula";
import { useOpenEmoji } from "../../../../extensions/emoji";
import { BlockDirective } from "../../../../src/block/enum";
import { Rect, Point } from "../../../../src/common/vector/point";
import { util } from "../../../../util/util";
import { DataGridOptionType } from "../../schema/field";
import { FieldType } from "../../schema/type";
import { ViewField } from "../../schema/view";
import { lst } from "../../../../i18n/store";
import { BackgroundColorList, OptionBackgroundColorList } from "../../../../extensions/color/data";

export class DataGridViewField {
    private getFieldMenuItems(this: DataGridView, viewField: ViewField) {
        var items: MenuItem<BlockDirective | string>[] = [];
        if (viewField.type || viewField?.field?.type == FieldType.autoIncrement) {
            items.push(...[
                {
                    name: 'name',
                    type: MenuItemType.input,
                    value: viewField?.text,
                    text: lst('编辑列名'),
                },
                { type: MenuItemType.divide },
                { name: 'leftInsert', icon: ArrowLeftSvg, text: lst('左侧插入') },
                { name: 'rightInsert', icon: ArrowRightSvg, text: lst('右侧插入') },
                { type: MenuItemType.divide },
                {
                    name: 'hide',
                    icon: HideSvg,
                    text: lst('隐藏列')
                }
            ]);
            if (viewField?.field?.type == FieldType.autoIncrement) {
                items.addRange(4, [
                    { name: 'sortDesc', icon: ArrowDownSvg, text: lst('降序') },
                    { name: 'sortAsc', icon: ArrowUpSvg, text: lst('升序') },
                    { name: 'filter', icon: FilterSvg, text: lst('过滤') },
                ])
                items.push(...[
                    {
                        name: 'clone',
                        icon: DuplicateSvg,
                        text: lst('复制列')
                    },
                    {
                        name: 'deleteProperty',
                        icon: TrashSvg,
                        text: lst('删除字段')
                    }
                ])
            }
        }
        else {
            items.push(...[
                {
                    name: 'name',
                    type: MenuItemType.input,
                    value: viewField.field?.text,
                    text: lst('编辑列名'),
                },
                { type: MenuItemType.divide },
                {
                    name: 'editProperty',
                    disabled: viewField.field.type == FieldType.title ? true : false,
                    icon: { name: "bytedance-icon", code: 'list-two' } as any,
                    text: lst('编辑字段')
                },
                { type: MenuItemType.divide },
                { name: 'leftInsert', icon: ArrowLeftSvg, text: lst('左侧插入') },
                { name: 'rightInsert', icon: ArrowRightSvg, text: lst('右侧插入') },
                { name: 'sortDesc', icon: ArrowDownSvg, text: lst('降序') },
                { name: 'sortAsc', icon: ArrowUpSvg, text: lst('升序') },
                { name: 'filter', icon: FilterSvg, text: lst('过滤') },
                { type: MenuItemType.divide },
                {
                    name: 'hide',
                    icon: HideSvg,
                    text: lst('隐藏列')
                },
                {
                    name: 'clone',
                    icon: DuplicateSvg,
                    text: lst('复制列')
                },
                { name: 'deleteProperty', icon: TrashSvg, text: lst('删除字段') },
            ]);
            if (viewField.field?.type == FieldType.date) {
                var dateItems: MenuItem<BlockDirective | string>[] = [];
                var day = dayjs(new Date());
                dateItems.push(...[
                    {
                        name: 'dateCustomFormat',
                        type: MenuItemType.input,
                        value: viewField?.field?.config?.dateFormat || lst('YYYY年MM月DD日'),
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
                    checked: viewField?.field?.config?.includeTime ? true : false
                });
                items.insertAt(6, { type: MenuItemType.divide })
            }
            else if (viewField.field?.type == FieldType.number) {
                var dateItems: MenuItem<BlockDirective | string>[] = [];
                dateItems.push(...[
                    { name: 'numberFormat', text: lst('数字'), value: 'number', checkLabel: viewField.field.config?.numberFormat == 'number' },
                    { name: 'numberFormat', text: lst('整数'), value: 'int', checkLabel: viewField.field.config?.numberFormat == 'int' },
                    { name: 'numberFormat', text: lst('千分位'), value: '1000', checkLabel: viewField.field.config?.numberFormat == '1000' },
                    { name: 'numberFormat', text: lst('两位小数'), value: '0.00', checkLabel: viewField.field.config?.numberFormat == '0.00' },
                    { name: 'numberFormat', text: lst('百分比'), value: '%', checkLabel: viewField.field.config?.numberFormat == '%' },
                    //{ name: 'numberFormat', type: MenuItemType.divide },
                    //{ name: 'numberFormat', text: '进度条', value: 'progress', checkLabel: viewField.field.config?.numberFormat == 'progress' },
                    // { text: '评分', value: 'score' },
                    { type: MenuItemType.divide },
                    { name: 'numberFormat', text: lst('人民币'), value: '￥', checkLabel: viewField.field.config?.numberFormat == '￥' },
                    { name: 'numberFormat', text: lst('美元'), value: '$', checkLabel: viewField.field.config?.numberFormat == '$' },
                    { name: 'numberFormat', text: lst('欧元'), value: '€', checkLabel: viewField.field.config?.numberFormat == '€' },
                    { name: 'numberFormat', text: lst('日元'), value: 'JP¥', checkLabel: viewField.field.config?.numberFormat == 'JP¥' },
                    { name: 'numberFormat', text: lst('港元'), value: 'HK$', checkLabel: viewField.field.config?.numberFormat == 'HK$' },
                    { type: MenuItemType.divide },
                    {
                        text: lst('自定义格式'),
                        childs: [
                            {
                                name: 'numberUnitCustom',
                                type: MenuItemType.input,
                                value: viewField.field.config?.numberFormat?.indexOf('{value}') > -1 ? viewField.field.config?.numberFormat : '',
                                text: lst('输入数字格式'),
                            },
                            { type: MenuItemType.divide },
                            { name: 'numberUnit', text: 'm/s', value: '{value}m/s', checkLabel: viewField.field.config?.numberFormat == 'number' },
                            { name: 'numberUnit', text: 'kg', value: '{value}kg', checkLabel: viewField.field.config?.numberFormat == 'number' },
                            { name: 'numberUnit', text: ' °c', value: '{value}°c', checkLabel: viewField.field.config?.numberFormat == 'number' }
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
                    value: viewField.field.config?.numberDisplay?.display || 'auto',
                    options: [
                        { text: lst('数字'), value: 'auto' },
                        { text: lst('进度条'), value: 'percent' },
                        { text: lst('圆环'), value: 'ring' }
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
                        {
                            text: lst('颜色'),
                            type: MenuItemType.color,
                            value: viewField.field.config?.numberDisplay?.color || 'rgba(55,53,47,0.6)',
                            name: 'config.numberDisplay.color',
                            options: BackgroundColorList().map(f => {
                                return {
                                    text: f.text,
                                    overlay: f.text,
                                    value: f.color,
                                    checked: lodash.isEqual(viewField.field.config?.numberDisplay?.color, f.color) ? true : false
                                }
                            })
                        },
                        { type: MenuItemType.divide },
                        {
                            text: lst('度量'),
                            label: lst('度量'),
                            type: MenuItemType.input,
                            value: viewField.field.config?.numberDisplay?.decimal || 100,
                            name: 'config.numberDisplay.decimal'
                        },
                        { type: MenuItemType.divide },
                        {
                            text: lst('数字'),
                            type: MenuItemType.switch,
                            checked: viewField.field.config?.numberDisplay?.showNumber ? true : false,
                            name: 'config.numberDisplay.showNumber',
                            icon: { name: 'byte', code: 'preview-open' }
                        }
                    ]
                });
            }
            else if (viewField.field.type == FieldType.image) {
                items.insertAt(4, {
                    text: lst('图片展示'),
                    type: MenuItemType.select,
                    name: 'config.imageFormat.display',
                    icon: { name: 'bytedance-icon', code: 'picture-one' },
                    value: viewField.field.config?.imageFormat?.display || "thumb",
                    options: [
                        { text: lst('略缩图'), value: 'thumb' },
                        { text: lst('自适应'), value: 'auto' }
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
                    checked: viewField?.field?.config?.isMultiple ? true : false
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
                    value: viewField.field.config?.imageFormat?.multipleDisplay || "tile",
                    options: [
                        { text: lst('平铺'), value: 'tile' },
                        { text: lst('轮播'), value: 'carousel' }
                    ],
                    buttonClick: 'select'
                });
                items.insertAt(7, { type: MenuItemType.divide });
            }
            else if ([
                FieldType.file,
                FieldType.user
            ].includes(viewField.field?.type)) {
                var text = lst('允许多文件');
                if (viewField.field.type == FieldType.user)
                    text = lst('允许多用用户');
                items.insertAt(5, {
                    text: text,
                    type: MenuItemType.switch,
                    name: 'isMultiple',
                    icon: { name: "bytedance-icon", code: 'more-two' },
                    updateMenuPanel: true,
                    checked: viewField?.field?.config?.isMultiple ? true : false
                });
                items.insertAt(6, {
                    type: MenuItemType.divide
                })
            }
            else if (viewField.field?.type == FieldType.formula) {
                items.insertAt(4, {
                    text: lst('编辑公式'),
                    name: 'formula',
                    icon: EditSvg
                });
                items.insertAt(5, {
                    type: MenuItemType.divide
                })
                items.removeAll(g => ['sortDesc', 'sortAsc', 'filter'].includes((g as any).name));
            }
            else if (viewField.field?.type == FieldType.relation) {
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
                    checked: viewField?.field?.config?.isMultiple ? true : false
                });
                items.insertAt(6, {
                    type: MenuItemType.divide
                })
            }
            else if (viewField.field?.type == FieldType.emoji) {
                items.insertAt(4, {
                    text: lst('更换表情'),
                    name: 'emoji',
                    icon: EmojiSvg
                });
                items.insertAt(5, {
                    type: MenuItemType.divide
                })
            }
            else if (viewField.field?.type == FieldType.option || viewField.field.type == FieldType.options) {
                items.insertAt(3, { type: MenuItemType.divide });
                items.insertAt(4, {
                    text: lst('选项'),
                    icon: TypesSelectSvg,
                    childs: [
                        {
                            type: MenuItemType.container,
                            name: 'optionContainer',
                            childs: [
                                ...(viewField.field.config?.options || []).map(op => {
                                    return {
                                        value: op.value,
                                        name: 'optionItem',
                                        type: MenuItemType.drag,
                                        renderContent() {
                                            return <span className="round padding-w-5 f-14 padding-h-2  l-16" style={{ backgroundColor: op.color }}>{op.text}</span>
                                        },
                                        btns: [{ name: 'editOptionOption', icon: DotsSvg }]
                                    }
                                })
                            ]
                        },
                        ...((viewField.field.config?.options || []).length > 0 ? [{ type: MenuItemType.divide }] : []),
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
        }
        return items;
    }
    async onOpenFieldOptions(options: DataGridOptionType[], option: DataGridOptionType, event: React.MouseEvent) {
        event.stopPropagation();
        var menus = [
            { text: lst('标签'), name: 'name', value: option.text, type: MenuItemType.input },
            { type: MenuItemType.divide },
            { name: 'delete', icon: TrashSvg, text: lst('删除') },
            { type: MenuItemType.divide },
            { type: MenuItemType.text, text: lst('颜色') },
            ...OptionBackgroundColorList().map(b => {
                return {
                    name: 'color',
                    value: b.color,
                    text: b.text,
                    type: MenuItemType.custom,
                    render(item) {
                        return <div className="flex padding-w-14 h-30 item-hover round cursor">
                            <span className="flex-fixed size-20 round gap-r-10 border" style={{ backgroundColor: item.value }}></span>
                            <span className="flex-auto text f-14">{b.text}</span>
                            {option.color == item.value &&
                                <span className="flex-fixed size-24 flex-center"><Icon size={16} icon={CheckSvg}></Icon></span>
                            }
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
                ShyAlert(lst('当前标签项已存在。'));
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
        var rp = Rect.fromEvent(event);
        await this.onDataGridTool(async () => {
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
                                        await self.onUpdateField(viewField.field, { config });
                                        mp.updateItems(self.getFieldMenuItems(viewField))
                                    }
                                }
                            }
                            else if (item.name == 'addOption') {
                                var ops = lodash.cloneDeep(viewField.field?.config?.options || []);
                                var or = OptionBackgroundColorList().find(g => ops.some(s => s.color == g.color) ? false : true);
                                var op: DataGridOptionType = { text: '', value: util.guid(), color: or?.color || OptionBackgroundColorList[0].color };
                                await self.onOpenFieldOptions(ops, op, ev);
                                if (op.text) {
                                    ops.push(op);
                                    var config = lodash.cloneDeep(viewField?.field?.config);
                                    if (typeof config == 'undefined') config = {};
                                    config.options = ops;
                                    await self.onUpdateField(viewField.field, { config });
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
                            await self.onUpdateFieldConfig(viewField.field, { includeTime: item.checked });
                        }
                        else if (item.name == 'isMultiple') {
                            await self.onUpdateFieldConfig(viewField.field, { isMultiple: item.checked });
                        }
                        else if (item.name == 'optionContainer') {
                            var [from, to] = item.value;
                            var ops = lodash.cloneDeep(viewField.field.config.options);
                            var f = ops[from];
                            ops.remove(g => g === f);
                            ops.insertAt(to, f);
                            await self.onUpdateFieldConfig(viewField.field, { options: ops });
                        }
                        else if (['config.numberDisplay.showNumber',
                            'config.numberDisplay.display',
                            'config.imageFormat.display',
                            'config.imageFormat.multipleDisplay',
                            'config.numberDisplay.color'].includes(item.name as string)) {
                            var n = (item.name as string).replace('config.', '');
                            await self.onUpdateFieldConfig(viewField.field, { [n]: item.value });
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
                        { field: viewField.field, dataGrid: self }
                    );
                    if (r) {
                        if (r.type == viewField.field.type) {
                            var rd = util.extendKey(r.config, 'config')
                            await this.onUpdateField(viewField.field, { text: r.text, ...rd })
                        }
                        else {
                            var rd = util.extendKey(r.config, 'config')
                            await this.onTurnField(viewField, r.type, { text: r.text, ...rd });
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
                    this.onCloneViewField(viewField);
                }
                else if (re.item.name == 'deleteProperty') {
                    this.onDeleteViewField(viewField);
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
                else if (re?.item.name == 'dateFormat') {
                    if (dateCustomFormat) dateCustomFormat.value = re.item.value;
                    await this.onUpdateFieldConfig(viewField.field, { dateFormat: re.item.value })
                }
                else if (re?.item.name == 'numberFormat' || re?.item.name == 'numberUnit') {
                    numberUnitCustom.value = re.item.value;
                    await this.onUpdateFieldConfig(viewField.field, { numberFormat: re.item.value });
                }
                else if (re.item.name == 'formula') {
                    var formula = await useFormula({ roundArea: rp }, {
                        schema: this.schema,
                        formula: viewField.field.config.formula?.formula || ''
                    });
                    if (formula) await this.onUpdateFieldConfig(viewField.field, { formula });
                }
                else if (re.item.name == 'emoji') {
                    var rc = await useOpenEmoji({ roundArea: rp });
                    if (rc) {
                        await self.onUpdateFieldConfig(viewField.field, { emoji: rc });
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
                    await self.onUpdateFieldConfig(viewField.field, { [n]: re.item.value });
                }
                else if (re.item.name == 'openRelation') {
                    await self.onOpenSchemaPage(viewField.field.config.relationTableId)
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
                    this.onUpdateField(viewField.field, { text: ReItem.value })
                }
            }
            if (dateCustomFormat) {
                if (dateCustomFormat.value != viewField.field?.config?.dateFormat) {
                    await this.onUpdateFieldConfig(viewField.field, { dateFormat: dateCustomFormat.value });
                }
            }
            if (config_numberDisplay_decimal) {
                if (config_numberDisplay_decimal.value != viewField.field?.config?.numberDisplay?.decimal) {
                    await this.onUpdateFieldConfig(viewField.field, { numberDisplay: { decimal: config_numberDisplay_decimal.value } });
                }
            }
            if (numberUnitCustom) {
                if (numberUnitCustom.value && numberUnitCustom.value != viewField.field.config.numberFormat) {
                    await this.onUpdateFieldConfig(viewField.field, { numberFormat: numberUnitCustom.value });
                }
            }
        })
    }
}