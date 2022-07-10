import dayjs from "dayjs";
import { HideSvg, FilterSvg, ArrowDownSvg, ArrowUpSvg, TypesFormulaSvg, OptionsSvg } from "../../../../component/svgs";
import { useSelectMenuItem } from "../../../../component/view/menu";
import { MenuItem, MenuItemType } from "../../../../component/view/menu/declare";
import { useTableStoreAddField } from "../../../../extensions/tablestore/field";
import { useFormula } from "../../../../extensions/tablestore/formula";
import { BlockDirective } from "../../../../src/block/enum";
import { Rect, Point } from "../../../../src/common/vector/point";
import { util } from "../../../../util/util";
import { FieldType } from "../../schema/type";
import { ViewField } from "../../schema/view";
import { DataGridView } from ".";

export class DataGridViewConfig {
    async onOpenConfigField(this: DataGridView, event: React.MouseEvent | MouseEvent, viewField: ViewField) {
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
                {
                    name: 'hide',
                    icon: HideSvg,
                    text: '隐藏列'
                }
            ]);
            if (viewField?.field?.type == FieldType.autoIncrement) {
                items.addRange(1, [
                    { type: MenuItemType.divide },
                    { name: 'filter', icon: FilterSvg, text: '过滤' },
                    { name: 'sortDesc', icon: ArrowDownSvg, text: '降序' },
                    { name: 'sortAsc', icon: ArrowUpSvg, text: '升序' },
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
                {
                    name: 'editProperty',
                    disabled: viewField.field.type == FieldType.title ? true : false,
                    icon: OptionsSvg,
                    text: '编辑属性'
                },
                { type: MenuItemType.divide },
                { name: 'filter', icon: FilterSvg, text: '过滤' },
                { name: 'sortDesc', icon: ArrowDownSvg, text: '降序' },
                { name: 'sortAsc', icon: ArrowUpSvg, text: '升序' },
                { type: MenuItemType.divide },
                {
                    name: 'hide',
                    icon: HideSvg,
                    text: '隐藏列'
                }
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
                items.insertAt(2, {
                    text: '日期格式',
                    childs: dateItems
                });
                items.insertAt(3, {
                    text: '包括时间',
                    type: MenuItemType.switch,
                    name: 'includeTime',
                    checked: viewField?.field?.config?.includeTime ? true : false
                });
            }
            else if ([
                FieldType.file,
                FieldType.image,
                FieldType.audio,
                FieldType.video
            ].includes(viewField.field?.type)) {
                items.insertAt(2, {
                    text: '多文件上传',
                    type: MenuItemType.switch,
                    name: 'isMultiple',
                    checked: viewField?.field?.config?.isMultiple ? true : false
                });
            }
            else if (viewField.field?.type == FieldType.formula) {
                items.insertAt(2, {
                    text: '编辑公式',
                    name: 'formula',
                    icon: TypesFormulaSvg
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
                    { text: viewField.field.text, type: viewField.field.type }
                )
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
}