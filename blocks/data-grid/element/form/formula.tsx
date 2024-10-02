

import React from "react";
import { BlockcolorSvg } from "../../../../component/svgs";
import { MenuItemType } from "../../../../component/view/menu/declare";
import { GetTextCacheFontColor, FontColorList, BackgroundColorList } from "../../../../extensions/color/data";
import { cacFormulaValue } from "../../../../extensions/data-grid/formula/run";
import { lst, ls } from "../../../../i18n/store";
import { S } from "../../../../i18n/view";
import { url, view } from "../../../../src/block/factory/observable";
import { BlockView } from "../../../../src/block/view";
import { UA } from "../../../../util/ua";
import { FieldView, OriginFormField } from "./origin.field";
import lodash from "lodash";

@url('/form/formula')
class FieldFormula extends OriginFormField {
    async onGetContextMenus() {
        var items = await super.onGetContextMenus();
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
    cacValue;
    async didMounted() {
        this.cacFieldValue()
    }
    async cacFieldValue() {
        var v = await cacFormulaValue(this.page, null, this.field, this.page.formRowData);
        if (typeof v == 'number') {
            var vt = v.toString();
            if (vt.indexOf('.') > -1) {
                v = v.toFixed(2);
                v = parseFloat(v);
            }
        }
        this.cacValue = v;
        this.forceManualUpdate()
    }
}

@view('/form/formula')
class FieldTextView extends BlockView<FieldFormula> {
    renderView() {
        return <FieldView block={this.block}>
            {this.block.fromType == 'doc-detail' && this.renderDetail()}
            {this.block.fromType == 'doc-add' && this.renderForm()}
            {this.block.fromType == 'doc' && this.renderField()}
        </FieldView>
    }
    renderDetail() {
        if (!this.block.isCanEdit()) return '';
        return <div style={this.block.contentStyle} className={'' + (this.block.cacValue ? "" : "remark f-14")}>{this.block.cacValue || <S>空内容</S>}</div>
    }
    renderForm() {
        return this.renderDetail()
    }
    renderField() {
        return this.renderDetail()
    }
}