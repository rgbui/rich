import React from "react";
import { prop, url, view } from "../../../../src/block/factory/observable";
import { BlockView } from "../../../../src/block/view";
import { FieldView, OriginFormField } from "./origin.field";
import { ls, lst } from "../../../../i18n/store";
import { MenuItem, MenuItemType } from "../../../../component/view/menu/declare";
import { BlockDirective, BlockRenderRange } from "../../../../src/block/enum";
import { FieldType } from "../../schema/type";
import lodash from "lodash";
import { S } from "../../../../i18n/view";
import { BlockcolorSvg } from "../../../../component/svgs";
import { GetTextCacheFontColor, FontColorList, BackgroundColorList } from "../../../../extensions/color/data";
import { UA } from "../../../../util/ua";

@url('/form/text')
class FieldText extends OriginFormField {
    @prop()
    inputType: 'input' | 'textarea' = 'input';
    async onGetContextMenus() {
        var items = await super.onGetContextMenus();
        if (this.fromType == 'doc-add' && [FieldType.text].includes(this.field.type)) {
            var at = items.findIndex(c => c.name == 'required');
            items.splice(at - 1, 0,
                { type: MenuItemType.divide },
                {
                    name: 'inputType',
                    text: lst('多行文本'),
                    type: MenuItemType.switch,
                    checked: this.inputType == 'textarea',
                    icon: { name: 'bytedance-icon', code: 'more-two' }
                }, { type: MenuItemType.divide });
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
class FieldTextView extends BlockView<FieldText> {
    renderView() {
        return <FieldView block={this.block}>
            {this.block.fromType == 'doc-detail' && this.renderDetail()}
            {this.block.fromType == 'doc-add' && this.renderForm()}
            {this.block.fromType == 'doc' && this.renderField()}
        </FieldView>
    }
    renderDetail() {
        if (!this.block.isCanEdit() && !this.block.value) return '';
        if (this.block.field?.type == FieldType.link) {
            return <a className="link cursor" href={this.block.value} target="_blank">{this.block.value}</a>
        }
        else if (this.block.field?.type == FieldType.phone) {
            return <a className="link cursor" href={`tel:` + this.block.value}>{this.block.value}</a>
        }
        else if (this.block.field?.type == FieldType.email) {
            return <a className="link cursor" href={`mailto:` + this.block.value}>{this.block.value}</a>
        }
        return <div style={this.block.contentStyle} className={'min-h-30 flex ' + (this.block.value ? "" : "remark f-14")}>{this.block.value || <S>空内容</S>}</div>
    }
    renderForm() {
        var self = this;
        function keydown(event: React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>) {
            if (event.key == 'Enter') {
                self.block.onChange((event.target as HTMLInputElement).value);
            }
        }
        return <>
            {this.block.inputType == 'input' && <input
                className={this.block.fromType == 'doc-add' ? "sy-form-field-input-value" : "padding-w-10 round sy-doc-field-input-value item-hover"}
                type='text'
                data-shy-page-no-focus={true}
                defaultValue={this.block.value}
                onInput={e => { this.block.inputChange((e.target as HTMLInputElement).value) }}
                onKeyDown={e => keydown(e)}
            />}
            {this.block.inputType == 'textarea' && <textarea
                className="sy-form-field-input-value"
                data-shy-page-no-focus={true}
                defaultValue={this.block.value}
                style={{ height: 80 }}
                onInput={e => {
                    this.block.inputChange((e.target as HTMLInputElement).value)
                }}
                onKeyDown={e => keydown(e)}
            >
            </textarea>}
        </>
    }
    renderField() {
        var self = this;
        function keydown(event: React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>) {
            if (event.key == 'Enter') {
                self.block.onChange((event.target as HTMLInputElement).value);
            }
        }
        return <>
            {this.block.inputType == 'input' && <input
                className={this.block.fromType == 'doc-add' ? "sy-form-field-input-value" : "padding-w-10 round sy-doc-field-input-value item-hover"}
                type='text'
                data-shy-page-no-focus={true}
                defaultValue={this.block.value}
                onInput={e => { this.block.inputChange((e.target as HTMLInputElement).value) }}
                onKeyDown={e => keydown(e)}
            />}
            {this.block.inputType == 'textarea' && <textarea
                className="sy-form-field-input-value"
                data-shy-page-no-focus={true}
                defaultValue={this.block.value}
                style={{ height: 80 }}
                onInput={e => {
                    this.block.inputChange((e.target as HTMLInputElement).value)
                }}
                onKeyDown={e => keydown(e)}
            >
            </textarea>}
        </>
    }
}