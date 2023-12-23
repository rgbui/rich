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
import { lst } from "../../../../i18n/store";
import { BlockDirective, BlockRenderRange } from "../../../../src/block/enum";
import { S } from "../../../../i18n/view";

@url('/form/option')
class FieldText extends OriginFormField {
    @prop()
    optionType: 'default' | 'select' | 'checkList' = 'default';
    async onGetContextMenus() {
        var items = await super.onGetContextMenus();
        if (this.fieldType == 'doc-add') {
            var index = items.findIndex(g => g.name == 'hide');
            items.splice(index, 0, {
                name: 'optionType',
                text: lst('选项类型'),
                type: MenuItemType.select,
                value: this.optionType,
                options: [
                    { text: lst('默认'), value: 'default' },
                    { text: lst('下拉框'), value: 'select' },
                    { text: lst('多选框'), value: 'checkList' }
                ],
                icon: { name: 'bytedance-icon', code: 'more-two' }
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
    async turnForm(fieldType: any): Promise<void> {
        await super.turnForm(fieldType);
        if (this.fieldType != 'doc-add') {
            await this.updateProps({ optionType: 'default' })
        }
    }
}

@view('/form/option')
class FieldTextView extends BlockView<FieldText>{
    async mousedown(event: React.MouseEvent) {
        if (this.block.checkEdit() === false) return;
        var fc: FieldConfig = this.block.field.config;
        var op = await useTableStoreOption({
            roundArea: Rect.fromEle(event.currentTarget as HTMLElement)
        }, this.block.value,
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
                    })
                }
            }
        );
        if (op !== null && typeof op != 'undefined') {
            if (fc?.isMultiple) this.block.onChange(op.map(c => c.value));
            else this.block.onChange(op[0].value);
        }
    }
    renderView() {
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
        function renderSelectOptions() {
            if (self.block.optionType == 'select') {
                return <SelectBox className={self.block.fieldType == 'doc-add' ? "sy-form-field-input-value" : "  padding-h-5 round item-hover-light padding-w-10 "} border dropAlign="full" value={fc?.isMultiple ? ops.map(o => o.value) : ops?.first()?.value} multiple={fc?.isMultiple ? true : false} options={options} onChange={e => {
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
            return <div className={"flex " + (self.block.fieldType == 'doc-add' ? "sy-form-field-input-value" : "  padding-h-5 round item-hover-light padding-w-10 " + (ops.length == 0 ? " h-30" : ""))} onMouseDown={e => self.mousedown(e)}>
                {ops.map(op => {
                    return <span key={op.value} className="gap-r-10 padding-w-5 f-14 padding-h-2  l-16 round cursor" style={{ background: op.color }}>{op.text}</span>
                })}
            </div>
        }
        return <FieldView block={this.block}>
            {this.block.fieldType != 'doc-detail' && renderSelectOptions()}
            {this.block.fieldType == 'doc-detail' && <div className="flex">
                {ops.map(op => {
                    return <span key={op.value} className="gap-r-10 padding-w-5 f-14 padding-h-2  l-16  round cursor" style={{ background: op.color }}>{op.text}</span>
                })}
                {ops.length == 0 && <span className="f-14 remark"><S>空内容</S></span>}
            </div>}
        </FieldView>
    }
}