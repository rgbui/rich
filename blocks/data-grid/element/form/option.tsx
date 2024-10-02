import React from "react";
import { useTableStoreOption } from "../../../../extensions/data-grid/option/option";
import { prop, url, view } from "../../../../src/block/factory/observable";
import { BlockView } from "../../../../src/block/view";
import { Rect } from "../../../../src/common/vector/point";
import { DataGridOptionType, FieldConfig } from "../../schema/field";
import { FieldView, OriginFormField } from "./origin.field";
import { SelectBox } from "../../../../component/view/select/box";
import { util } from "../../../../util/util";
import lodash from "lodash";
import { MenuItemType, MenuItem } from "../../../../component/view/menu/declare";
import { ls, lst } from "../../../../i18n/store";
import { BlockDirective, BlockRenderRange } from "../../../../src/block/enum";
import { S } from "../../../../i18n/view";
import { BlockcolorSvg, TypesMultipleSelectSvg, TypesSelectSvg } from "../../../../component/svgs";
import { FieldType } from "../../schema/type";
import { GetTextCacheFontColor, FontColorList, BackgroundColorList } from "../../../../extensions/color/data";
import { UA } from "../../../../util/ua";

@url('/form/option')
class FieldText extends OriginFormField {
    @prop()
    optionType: 'default' | 'select' | 'checkList' = 'default';
    async onGetContextMenus()
    {
        var items = await super.onGetContextMenus();
        if (this.fromType == 'doc-add') {
            var index = items.findIndex(g => g.name == 'required');
            items.splice(index, 0, {
                name: 'optionType',
                text: lst('选项类型'),
                type: MenuItemType.select,
                value: this.optionType,
                options: [
                    { text: lst('默认'), value: 'default', icon: this.field.type == FieldType.option ? TypesSelectSvg : TypesMultipleSelectSvg },
                    { text: lst('下拉框'), value: 'select', icon: { name: 'byte', code: 'drop-down-list' } },
                    { text: lst('多选框'), value: 'checkList', icon: { name: 'byte', code: 'list-checkbox' } }
                ],
                icon: { name: 'bytedance-icon', code: 'more-two' }
            });
        }
        var at = items.findIndex(c => c.name == 'hidePropTitle' || c.name == 'required');
        if (this.fromType == 'doc-detail') {
            var lastFontItems: any[] = [];
            var lastColor = await GetTextCacheFontColor();
            if (lastColor) {
                lastFontItems.push({
                    text: lst('上次颜色'),
                    type: MenuItemType.text,
                    label: UA.isMacOs ? "⌘+Shift+H" : "Ctrl+Shift+H"
                });
                lastFontItems.push({
                    type: MenuItemType.color,
                    name: lastColor.name == 'font' ? 'fontColor' : 'fillColor',
                    block: ls.isCn ? false : true,
                    options: [
                        {
                            text: '',
                            value: lastColor.color
                        }
                    ]
                });
            }
            items.splice(at + 4, 0, {
                text: lst('颜色'),
                icon: BlockcolorSvg,
                name: 'color',
                childs: [
                    ...lastFontItems,
                    {
                        text: lst('文字颜色'),
                        type: MenuItemType.text
                    },
                    {
                        name: 'fontColor',
                        type: MenuItemType.color,
                        block: ls.isCn ? false : true,
                        options: FontColorList().map(f => {
                            return {
                                text: f.text,
                                overlay: f.text,
                                value: f.color,
                                checked: lodash.isEqual(this.pattern?.getFontStyle()?.color, f.color) ? true : false
                            }
                        })
                    },
                    {
                        type: MenuItemType.divide
                    },
                    {
                        text: lst('背景颜色'),
                        type: MenuItemType.text
                    },
                    {
                        type: MenuItemType.color,
                        name: 'fillColor',
                        block: ls.isCn ? false : true,
                        options: BackgroundColorList().map(f => {
                            return {
                                text: f.text,
                                value: f.color,
                                checked: this.pattern?.getFillStyle()?.color == f.color ? true : false
                            }
                        })
                    },
                ]
            });
        }
        return items;
    }
    async onContextMenuInput(item: MenuItem<BlockDirective | string>) {
        if (item?.name == 'optionType') {
            this.onUpdateProps({ [item.name]: item.value }, { range: BlockRenderRange.self })
            return;
        }
        return await super.onContextMenuInput(item);
    }
}

@view('/form/option')
class FieldTextView extends BlockView<FieldText> {
    async mousedown(event: React.MouseEvent) {
        if (this.block.checkEdit() === false) return;
        var hover = this.block.el.querySelector('.item-hover-light');
        try {
            if (hover) hover.classList.add('item-hover-light-focus')
            var fc: FieldConfig = this.block.field.config;
            var op = await useTableStoreOption({
                dist: 3,
                roundArea: Rect.fromEle(event.currentTarget as HTMLElement)
            },
                this.block.value,
                {
                    multiple: fc?.isMultiple ? true : false,
                    options: fc?.options || [],
                    isEdit: this.block.isCanEdit(),
                    changeOptions: (ops) => {
                        this.block.schema.fieldUpdate({
                            fieldId: this.block.field.id,
                            data: {
                                config: { options: ops }
                            }
                        }, this.block.id)
                    }
                }
            );
            if (typeof op != 'undefined') {
                console.log('op', op);
                this.block.onChange(op ? op.map(o => o.value) : []);
            }
        }
        catch (ex) {

        }
        finally {
            if (hover)
                hover.classList.remove('item-hover-light-focus')
        }
    }
    renderView() {
        return <FieldView block={this.block}>
            {this.block.fromType == 'doc-detail' && this.renderDetail()}
            {this.block.fromType == 'doc-add' && this.renderForm()}
            {this.block.fromType == 'doc' && this.renderField()}
        </FieldView>
    }
    renderDetail() {
        var fc: FieldConfig = this.block.field.config;
        var options = this.block.field.config?.options || []
        var ops: DataGridOptionType[] = [];
        if (fc?.isMultiple) {
            ops = this.block.field.config?.options?.filter(g => (this.block.value || [])?.includes(g.value))
        }
        else {
            ops = fc?.options?.filter(g => g.value == this.block.value);
        }
        if (!Array.isArray(ops)) ops = [];
        return <div className="flex">
            {ops.map(op => {
                return <span key={op.value} className="gap-r-10 padding-w-5 f-14  h-24  l-24  round cursor"
                    style={this.block.contentStyle}>{op.text}</span>
            })}
            {ops.length == 0 && <span className="f-14 remark min-h-30 flex "><S>空内容</S></span>}
        </div>
    }
    renderForm() {
        var fc: FieldConfig = this.block.field.config;
        var options = this.block.field.config?.options || []
        var ops: DataGridOptionType[] = [];
        if (fc?.isMultiple) {
            ops = this.block.field.config?.options?.filter(g => (this.block.value || [])?.includes(g.value))
        }
        else {
            ops = fc?.options?.filter(g => g.value == this.block.value);
        }
        if (!Array.isArray(ops)) ops = [];
        var self = this;
        if (self.block.optionType == 'select') {
            return <SelectBox style={{
                height: self.block.fromType == 'doc-add' ? 32 : undefined
            }} className={self.block.fromType == 'doc-add' ? " f-14" : "  padding-h-5 round item-hover-light padding-w-10 "} border dropAlign="full" value={fc?.isMultiple ? ops.map(o => o.value) : ops?.first()?.value} multiple={fc?.isMultiple ? true : false} options={options} onChange={e => {
                self.block.onChange(e);
            }}></SelectBox>
        }
        else if (self.block.optionType == 'checkList') {
            if (fc?.isMultiple) {
                return <div >
                    {options.map(op => {
                        return <div key={op.value} className="flex"><input
                            id={["c", self.block.id, op.value].join("_")}
                            defaultChecked={ops.some(g => g.value == op.value) ? true : false}
                            onChange={e => {
                                var vs = util.covertToArray(self.block.value);
                                if (e.target.checked) {
                                    vs.push(op.value);
                                }
                                else {
                                    lodash.remove(vs, c => c == op.value);
                                }
                                self.block.onChange(vs);
                            }} type='checkbox'></input><label htmlFor={["c", self.block.id, op.value].join("_")} className="gap-l-3 cursor">{op.text}</label></div>
                    })}
                </div>
            }
            else {
                return <div className="flex">
                    {options.map(op => {
                        return <span key={op.value} className="flex gap-r-10 cursor"><input name={["rg", self.block.id].join("_")} type='radio' id={["r", self.block.id, op.value].join("_")} defaultChecked={ops?.first()?.value == op.value} onChange={e => {
                            self.block.onChange(op.value);
                        }}></input><label htmlFor={["r", self.block.id, op.value].join("_")} className="gap-l-3">{op.text}</label></span>
                    })}
                </div>
            }
        }
        return <div className={"flex " + (self.block.fromType == 'doc-add' ? "sy-form-field-input-value" : "   round item-hover-light padding-w-10 " + (ops.length == 0 ? " min-h-30" : "min-h-30"))} onMouseDown={e => self.mousedown(e)}>
            {ops.map(op => {
                return <span key={op.value} className="gap-r-10 padding-w-5 f-14 padding-h-2  l-16 round cursor" style={{ background: op?.fill || op?.color, color: op.textColor }}>{op.text}</span>
            })}
        </div>
    }
    renderField() {
        var fc: FieldConfig = this.block.field.config;
        var options = this.block.field.config?.options || []
        var ops: DataGridOptionType[] = [];
        if (fc?.isMultiple) {
            ops = this.block.field.config?.options?.filter(g => (this.block.value || [])?.includes(g.value))
        }
        else {
            ops = fc?.options?.filter(g => g.value == this.block.value);
        }
        if (!Array.isArray(ops)) ops = [];
        var self = this;
        if (self.block.optionType == 'select') {
            return <SelectBox style={{
                height: self.block.fromType == 'doc-add' ? 32 : undefined
            }} className={self.block.fromType == 'doc-add' ? " f-14" : "  padding-h-5 round item-hover-light padding-w-10 "} border dropAlign="full" value={fc?.isMultiple ? ops.map(o => o.value) : ops?.first()?.value} multiple={fc?.isMultiple ? true : false} options={options} onChange={e => {
                self.block.onChange(e);
            }}></SelectBox>
        }
        else if (self.block.optionType == 'checkList') {
            if (fc?.isMultiple) {
                return <div >
                    {options.map(op => {
                        return <div key={op.value} className="flex"><input
                            id={["c", self.block.id, op.value].join("_")}
                            defaultChecked={ops.some(g => g.value == op.value) ? true : false}
                            onChange={e => {
                                var vs = util.covertToArray(self.block.value);
                                if (e.target.checked) {
                                    vs.push(op.value);
                                }
                                else {
                                    lodash.remove(vs, c => c == op.value);
                                }
                                self.block.onChange(vs);
                            }} type='checkbox'></input><label htmlFor={["c", self.block.id, op.value].join("_")} className="gap-l-3 cursor">{op.text}</label></div>
                    })}
                </div>
            }
            else {
                return <div className="flex">
                    {options.map(op => {
                        return <span key={op.value} className="flex gap-r-10 cursor"><input name={["rg", self.block.id].join("_")} type='radio' id={["r", self.block.id, op.value].join("_")} defaultChecked={ops?.first()?.value == op.value} onChange={e => {
                            self.block.onChange(op.value);
                        }}></input><label htmlFor={["r", self.block.id, op.value].join("_")} className="gap-l-3">{op.text}</label></span>
                    })}
                </div>
            }
        }
        return <div className={"flex " + (self.block.fromType == 'doc-add' ? "sy-form-field-input-value" : "   round item-hover-light padding-w-10 " + (ops.length == 0 ? " min-h-30" : "min-h-30"))} onMouseDown={e => self.mousedown(e)}>
            {ops.map(op => {
                return <span key={op.value} className="gap-r-10 padding-w-5 f-14 padding-h-2  l-16 round cursor" style={{ background: op?.fill || op?.color, color: op.textColor }}>{op.text}</span>
            })}
        </div>
    }
}