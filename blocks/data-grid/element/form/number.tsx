import React from "react";
import { InputNumber } from "../../../../component/view/input/number";
import { prop, url, view } from "../../../../src/block/factory/observable";
import { BlockView } from "../../../../src/block/view";
import { FieldView, OriginFormField } from "./origin.field";
import lodash from "lodash";
import { S } from "../../../../i18n/view";
import { Ring } from "../../../../component/view/spin";
import { ColorUtil } from "../../../../util/color";
import { util } from "../../../../util/util";
import { FieldConfig } from "../../schema/field";
import { MenuItem, MenuItemType } from "../../../../component/view/menu/declare";
import { BlockDirective, BlockRenderRange } from "../../../../src/block/enum";
import { TypesNumberSvg, SettingsSvg } from "../../../../component/svgs";
import { lst } from "../../../../i18n/store";
import { Block } from "../../../../src/block";

// 数字转为千分位，并保留两个小数位
function numberFilter(oldNum, isFixed) {
    // 例（123456.78）
    if (oldNum === "") return {}; // 传入的数值为空直接返回空对象
    let newNum = oldNum.toLocaleString("en-US"); // 数字转成千分位 = 123,456.78
    const numArr = newNum.split("."); // 按小数点吧数字拆分 = [123,456, 78]
    if (!isFixed) { // 如果传了第二个参数，如果有小数位直接返回，否则向下执行
        if (!numArr[1]) { // 如果数组没有下标1的元素，就加.00，例：123,456 = 123,456.00
            newNum = newNum + ".00";
        } else if (numArr[1].length === 1) { // 如果数组下标1的元素只有一位小数，就加个0，例：123,456.7 = 123,456.70
            newNum = newNum + "0";
        } else if (numArr[1].length >= 2) { // // 如果数组下标1的元素小数位大于等于2位，就截取前两位，例：123,456.789 = 123,456.78
            newNum = numArr[0] + "." + numArr[1].substr(0, 2);
        }
    }
    return { oldNum, newNum };
}

@url('/form/number')
class FieldNumber extends OriginFormField {
    inputChange = lodash.debounce((value: string) => {
        var n = parseFloat(value);
        if (lodash.isNumber(n))
            this.onChange(n);
    }, 700)
    @prop()
    fieldConfig: {
        numberDisplay: FieldConfig['numberDisplay'],
        numberFormat?: string
    } = {
            numberDisplay: null,
        };
    formatValue(value: any) {
        if (typeof value == 'undefined' || lodash.isNull(value) || typeof value == 'string' && value == '') {
            return '';
        }
        var v = typeof value != 'number' ? parseFloat(value.toString()) : value;
        if (lodash.isNaN(v)) return '';
        if (this.fieldConfig?.numberFormat) {
            if (['number'].includes(this.fieldConfig?.numberFormat)) {
                return v;
            }
            else if (['int'].includes(this.fieldConfig?.numberFormat)) {
                return parseInt(v.toString());
            }
            else if (['1000'].includes(this.fieldConfig?.numberFormat)) {
                return numberFilter(v, true).newNum;
            }
            else if (['0.00'].includes(this.fieldConfig?.numberFormat)) {
                return v.toFixed(2);
            }
            else if (['%'].includes(this.fieldConfig?.numberFormat)) {
                return v.toString() + '%'
            }
            else if (['￥', '$', '€', 'JP¥', 'HK$'].includes(this.fieldConfig?.numberFormat)) {
                return this.fieldConfig?.numberFormat + numberFilter(v, true).newNum;
            }
            else if (this.fieldConfig?.numberFormat.indexOf('{value}') > -1) {
                return this.fieldConfig?.numberFormat.replace('{value}', v.toString());
            }
            else return value.toString();
        }
        else return value.toString();
    }
    async onGetContextMenus(): Promise<MenuItem<string | BlockDirective>[]> {
        var items = await super.onGetContextMenus();
        var at = items.findIndex(c => c.name == 'hidePropTitle' || c.name == 'required');
        if (this.fromType == 'doc-detail') {
            var dateItems: MenuItem<BlockDirective | string>[] = [];
            dateItems.push(...[
                { name: 'fieldConfig.numberFormat', text: lst('数字'), value: 'number', checkLabel: this.fieldConfig?.numberFormat == 'number' },
                { name: 'fieldConfig.numberFormat', text: lst('整数'), value: 'int', checkLabel: this.fieldConfig?.numberFormat == 'int' },
                { name: 'fieldConfig.numberFormat', text: lst('千分位'), value: '1000', checkLabel: this.fieldConfig?.numberFormat == '1000' },
                { name: 'fieldConfig.numberFormat', text: lst('两位小数'), value: '0.00', checkLabel: this.fieldConfig?.numberFormat == '0.00' },
                { name: 'fieldConfig.numberFormat', text: lst('百分比'), value: '%', checkLabel: this.fieldConfig?.numberFormat == '%' },
                { type: MenuItemType.divide },
                { name: 'fieldConfig.numberFormat', text: lst('人民币'), value: '￥', checkLabel: this.fieldConfig?.numberFormat == '￥' },
                { name: 'fieldConfig.numberFormat', text: lst('美元'), value: '$', checkLabel: this.fieldConfig?.numberFormat == '$' },
                { name: 'fieldConfig.numberFormat', text: lst('欧元'), value: '€', checkLabel: this.fieldConfig?.numberFormat == '€' },
                { name: 'fieldConfig.numberFormat', text: lst('日元'), value: 'JP¥', checkLabel: this.fieldConfig?.numberFormat == 'JP¥' },
                { name: 'fieldConfig.numberFormat', text: lst('港元'), value: 'HK$', checkLabel: this.fieldConfig?.numberFormat == 'HK$' },
                { type: MenuItemType.divide },
                {
                    text: lst('自定义格式'),
                    childs: [
                        {
                            name: 'fieldConfig.numberUnitCustom',
                            type: MenuItemType.input,
                            value: this.fieldConfig?.numberFormat?.indexOf('{value}') > -1 ? this.fieldConfig?.numberFormat : '',
                            text: lst('输入数字格式'),
                        },
                        { type: MenuItemType.divide },
                        { name: 'fieldConfig.numberUnit', text: 'm/s', value: '{value}m/s', checkLabel: this.fieldConfig?.numberFormat == 'number' },
                        { name: 'fieldConfig.numberUnit', text: 'kg', value: '{value}kg', checkLabel: this.fieldConfig?.numberFormat == 'number' },
                        { name: 'fieldConfig.numberUnit', text: ' °c', value: '{value}°c', checkLabel: this.fieldConfig?.numberFormat == 'number' }
                    ]
                },
                /**
                 * 这里需要加上单位的基准
                 */
                // { text: '单位换算', childs: [{ text: '距离' }] },
                // { text: '数字区间', childs: [{ text: '胖' }] }
            ]);
            items.insertAt(at + 3, { type: MenuItemType.divide });
            items.insertAt(at + 4, {
                text: lst('显示'),
                updateMenuPanel: true,
                type: MenuItemType.select,
                icon: { name: 'byte', code: 'sales-report' },
                name: 'fieldConfig.numberDisplay.display',
                value: this.fieldConfig?.numberDisplay?.display || 'auto',
                options: [
                    { text: lst('数字'), value: 'auto', icon: TypesNumberSvg },
                    { text: lst('进度条'), value: 'percent', icon: { name: 'byte', code: 'percentage' } },
                    { text: lst('圆环'), value: 'ring', icon: { name: 'byte', code: 'chart-ring' } }
                ]
            })
            items.insertAt(at + 5, {
                text: lst('数字格式'),
                childs: dateItems,
                icon: SettingsSvg,
                visible: (items) => {
                    var mp = items.find(g => g.name == 'fieldConfig.numberDisplay.display');
                    if (mp?.value == 'auto') return true
                    else return false
                },
            });
            items.insertAt(at + 6, {
                text: lst('格式'),
                icon: SettingsSvg,
                visible: (items) => {
                    var mp = items.find(g => g.name == 'fieldConfig.numberDisplay.display');
                    if (mp?.value == 'auto') return false
                    else return true
                },
                childs: [
                    // {
                    //     text: lst('颜色'),
                    //     type: MenuItemType.color,
                    //     value: this.fieldConfig?.numberDisplay?.color || 'rgba(55,53,47,0.6)',
                    //     name: 'config.numberDisplay.color',
                    //     options: BackgroundColorList().map(f => {
                    //         return {
                    //             text: f.text,
                    //             overlay: f.text,
                    //             value: f.color,
                    //             checked: lodash.isEqual(this.fieldConfig?.numberDisplay?.color, f.color) ? true : false
                    //         }
                    //     })
                    // },
                    // { type: MenuItemType.divide },
                    {
                        text: lst('度量'),
                        label: lst('度量'),
                        type: MenuItemType.input,
                        value: this.fieldConfig?.numberDisplay?.decimal || 100,
                        name: 'fieldConfig.numberDisplay.decimal'
                    },
                    { type: MenuItemType.divide },
                    {
                        text: lst('数字'),
                        type: MenuItemType.switch,
                        checked: this.fieldConfig?.numberDisplay?.showNumber ? true : false,
                        name: 'fieldConfig.numberDisplay.showNumber',
                        icon: { name: 'byte', code: 'preview-open' }
                    }
                ]
            });
        }
        return items;
    }
    async onClickContextMenu(this: Block, item: MenuItem<BlockDirective | string>, event: MouseEvent): Promise<void> {
        if (['fieldConfig.numberUnit', 'fieldConfig.numberFormat'].includes(item.name as string)) {
            await this.onUpdateProps({
                ['fieldConfig.numberFormat']: item.value
            }, { range: BlockRenderRange.self })
        }
        else await super.onClickContextMenu(item, event);
    }
    async onContextMenuInput(item: MenuItem<BlockDirective | string>) {
        if ([
            'fieldConfig.numberDisplay.showNumber',
            'fieldConfig.numberDisplay.display',
            'fieldConfig.numberDisplay.color',
        ].includes(item.name as string)) {
            await this.onUpdateProps({
                [item.name]: item.value
            }, { range: BlockRenderRange.self })
        }
        if (item.name == 'fieldConfig.numberUnit' || item.name == 'fieldConfig.numberFormat') {
            await this.onUpdateProps({
                ['fieldConfig.numberFormat']: item.value
            }, { range: BlockRenderRange.self })
        }
        else
            await super.onContextMenuInput(item);
    }
    async onContextMenuAfter(items: MenuItem<BlockDirective | string>[]) {
        var numberUnitCustom = items.arrayJsonFind('childs', g => g.name == 'fieldConfig.numberUnitCustom');
        var config_numberDisplay_decimal = items.arrayJsonFind('childs', g => g.name == 'fieldConfig.numberDisplay.decimal');
        if (config_numberDisplay_decimal) {
            if (config_numberDisplay_decimal.value != this.fieldConfig?.numberDisplay?.decimal) {
                await this.onUpdateProps({ 'fieldConfig.numberDisplay.decimal': config_numberDisplay_decimal.value }, { range: BlockRenderRange.self });
            }
        }
        if (numberUnitCustom) {
            if (numberUnitCustom.value && numberUnitCustom.value != this.fieldConfig?.numberFormat) {
                await this.onUpdateProps({ 'fieldConfig.numberFormat': numberUnitCustom.value }, { range: BlockRenderRange.self });
            }
        }
    }
}

@view('/form/number')
class FieldTextView extends BlockView<FieldNumber> {
    renderView() {
        return <FieldView block={this.block}>
            {this.block.fromType == 'doc-detail' && this.renderDetail()}
            {this.block.fromType == 'doc-add' && this.renderForm()}
            {this.block.fromType == 'doc' && this.renderField()}
        </FieldView>
    }
    renderDetail() {
        var nd = this.block.fieldConfig?.numberDisplay || this.block.field?.config?.numberDisplay
        var cc = nd?.decimal || 100;
        var co = nd?.color;
        var f = nd?.display || 'auto';
        if (f == 'auto') return <span className="text l-22 " >{this.block.formatValue(this.block.value)}</span>
        else if (f == 'percent') {
            var color = co || '#ddd';
            var cd = ColorUtil.parseColor(color);
            var hex = ColorUtil.toHex(cd);
            hex = 'rgb(108, 155, 125)';
            // var cd = ColorUtil.parseColor(color);
            // var hex = ColorUtil.toHex(cd);
            return <div className="flex-auto flex min-h-30">
                <div className="flex-auto  round relative" style={{
                    backgroundColor: 'rgba(199, 198, 196, 0.5)',
                    height: 6,
                    boxSizing: 'border-box'
                }}>
                    <div className="round pos " style={{ top: 0, left: 0, bottom: 0, backgroundColor: hex, height: 6, maxWidth: '100%', width: util.toPercent(this.block.value || 0, cc, 1) }}></div>
                </div>
                {this.block.field?.config.numberDisplay?.showNumber == true && <span className="text l-22 gap-l-10 flex-fixed w-50 f-14" >{util.toPercent(this.block.value || 0, cc, 1)}</span>}
            </div>
        }
        else if (f == 'ring') {
            var r = 24;
            var d = 4;
            var color = co || '#ddd';
            var cd = ColorUtil.parseColor(color);
            var hex = ColorUtil.toHex(cd);
            var isNumber = typeof this.block.value == 'number'
            hex = 'rgb(108, 155, 125)';
            return <div className="flex flex-inline">
                {isNumber && <Ring className='flex-fixed' size={r}
                    lineWidth={d}
                    value={this.block.value}
                    percent={this.block.field?.config?.numberDisplay?.decimal || 100}
                    hoverColor={hex}
                ></Ring>}
                {this.block.field?.config.numberDisplay?.showNumber == true && <span className="text l-22  gap-l-10 flex-fixed w-50 f-14" >{util.toPercent(this.block.value || 0, cc, 1)}</span>}
            </div>
        }
        return <div className={typeof this.block.value != 'number' ? "f-14 remark" : ""}>{typeof this.block.value == 'number' ? this.block.value.toString() : <S>空内容</S>}</div>
    }
    renderForm() {
        var self = this;
        return <InputNumber
            value={this.block.value}
            onChange={e => this.block.onInput(e)}
            onEnter={e => self.block.onChange(e)}
        ></InputNumber>
    }
    renderField() {
        var self = this;
        function keydown(event: React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>) {
            if (event.key == 'Enter') {
                if (!self.block.isCanEdit()) return;
                self.block.onChange((event.target as HTMLInputElement).value);
            }
        }
        return <input
            className={"padding-w-10 round sy-doc-field-input-value item-hover"}
            type='text'
            data-shy-page-no-focus={true}
            defaultValue={lodash.isNumber(this.block.value) ? this.block.value.toString() : ''}
            onInput={e => { this.block.inputChange((e.target as HTMLInputElement).value) }}
            onKeyDown={e => keydown(e)}
        />
    }
}