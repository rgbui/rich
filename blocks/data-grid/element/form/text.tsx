import React from "react";
import { prop, url, view } from "../../../../src/block/factory/observable";
import { BlockView } from "../../../../src/block/view";
import { FieldView, OriginFormField } from "./origin.field";
import { lst } from "../../../../i18n/store";
import { MenuItem, MenuItemType } from "../../../../component/view/menu/declare";
import { BlockDirective, BlockRenderRange } from "../../../../src/block/enum";
import { FieldType } from "../../schema/type";
import lodash from "lodash";
import { S } from "../../../../i18n/view";

@url('/form/text')
class FieldText extends OriginFormField {
    @prop()
    inputType: 'input' | 'textarea' = 'input';
    async onGetContextMenus() {
        var items = await super.onGetContextMenus();
        if (this.fieldType == 'doc-add' && [FieldType.text].includes(this.field.type)) {
            items.splice(0, 0, {
                name: 'inputType',
                text: lst('多行文本'),
                type: MenuItemType.switch,
                checked: this.inputType == 'textarea',
                icon: { name: 'bytedance-icon', code: 'more-two' }
            });
        }
        return items;
    }
    async onContextMenuInput(item: MenuItem<BlockDirective | string>) {
        if (item?.name == 'inputType') {
            this.onUpdateProps({ [item.name]: item.checked ? 'textarea' : 'input' }, { range: BlockRenderRange.self })
            return;
        }
        return await super.onContextMenuInput(item);
    }
    inputChange = lodash.debounce((value: string) => {
        this.onChange(value);
    }, 700)
}

@view('/form/text')
class FieldTextView extends BlockView<FieldText>{
    renderView() {
        var self = this;
        function keydown(event: React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>) {
            if (event.key == 'Enter') {
                self.block.onChange((event.target as HTMLInputElement).value);
            }
        }
        if (this.block.fieldType == 'doc-detail') {
            return <FieldView block={this.block}>
                <div className={this.block.value ? "" : "remark f-14"}>{this.block.value || <S>空内容</S>}</div>
            </FieldView>
        }
        return <FieldView block={this.block}>
            {this.block.inputType == 'input' && <input
                className={this.block.fieldType == 'doc-add' ? "sy-form-field-input-value" : "padding-w-10 round sy-doc-field-input-value item-hover"}
                type='text'
                placeholder={lst('请输入') + this.block.field?.text}
                data-shy-page-no-focus={true}
                defaultValue={this.block.value}
                onInput={e => { this.block.inputChange((e.target as HTMLInputElement).value) }}
                onKeyDown={e => keydown(e)}
            />}
            {this.block.inputType == 'textarea' && <textarea
                className="sy-form-field-input-value"
                placeholder={lst('请输入') + this.block.field?.text}
                data-shy-page-no-focus={true}
                defaultValue={this.block.value}
                style={{ height: 80 }}
                onInput={e => {
                    this.block.inputChange((e.target as HTMLInputElement).value)
                }}
                onKeyDown={e => keydown(e)}
            >
            </textarea>}
        </FieldView>
    }
}