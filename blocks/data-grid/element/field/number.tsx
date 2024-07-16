import React from "react";
import { url, view } from "../../../../src/block/factory/observable";
import { FieldType } from "../../schema/type";
import { OriginField, OriginFileView } from "./origin.field";
import lodash from "lodash";
import { KeyboardCode } from "../../../../src/common/keys";
import { util } from "../../../../util/util";
import { BlockUrlConstant } from "../../../../src/block/constant";
import { lst } from "../../../../i18n/store";
import { ColorUtil } from "../../../../util/color";
import { Ring } from "../../../../component/view/spin";

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

//   ————————————————
//   版权声明：本文为CSDN博主「前端攻城狮路飞」的原创文章，遵循CC 4.0 BY-SA版权协议，转载请附上原文出处链接及本声明。
//   原文链接：https://blog.csdn.net/m0_46156566/article/details/124801406

@url('/field/number')
export class FieldNumber extends OriginField {
    get isSupportAnchor() {
        if (this.field.type == FieldType.autoIncrement) return false;
        return super.isSupportAnchor;
    }
    get appearAnchors() {
        if (this.field.type == FieldType.autoIncrement) return [];
        else return this.__appearAnchors;
    }
    formatValue(value: any) {
        if (typeof value == 'undefined' || lodash.isNull(value) || typeof value == 'string' && value == '') {
            return '';
        }
        var v = typeof value != 'number' ? parseFloat(value.toString()) : value;
        if (lodash.isNaN(v)) return '';
        if (this.field.config?.numberFormat) {
            if (['number'].includes(this.field.config?.numberFormat)) {
                return v;
            }
            else if (['int'].includes(this.field.config?.numberFormat)) {
                return parseInt(v.toString());
            }
            else if (['1000'].includes(this.field.config?.numberFormat)) {
                return numberFilter(v, true).newNum;
            }
            else if (['0.00'].includes(this.field.config?.numberFormat)) {
                return v.toFixed(2);
            }
            else if (['%'].includes(this.field.config?.numberFormat)) {
                return v.toString() + '%'
            }
            else if (['￥', '$', '€', 'JP¥', 'HK$'].includes(this.field.config?.numberFormat)) {
                return this.field.config?.numberFormat + numberFilter(v, true).newNum;
            }
            else if (this.field.config?.numberFormat.indexOf('{value}') > -1) {
                return this.field.config?.numberFormat.replace('{value}', v.toString());
            } else return value.toString();
        }
        else return value.toString();
    }
    isFocus: boolean = false;
    onCellMousedown(event: React.MouseEvent) {
       
        if (this.field.type == FieldType.autoIncrement) return;
        if (!this.isCanEdit()) return;
        event.stopPropagation();
        if (this.isFocus == false) {
            this.isFocus = true;
            this.view.forceUpdate(async () => {
                var input = this.el.querySelector('input');
                if (!input) {
                    await util.delay(100);
                    input = this.el.querySelector('input');
                    await util.delay(100);
                }
                else await util.delay(100);
                input.focus();
            })
        }
    }
}

@view('/field/number')
export class FieldTextView extends OriginFileView<FieldNumber> {
    isCom: boolean = false;
    renderFieldValue() {
        var self = this;
        var save = lodash.debounce<(value: number) => void>((value) => {
            self.block.onUpdateCellValue(value);
        }, 700);
        function keydown(event: React.KeyboardEvent) {
            var input = event.target as HTMLInputElement;
            var v = input.value.trim();
            if (event.key == KeyboardCode.Enter) {
                if (/^[\d\.\+\-]+$/.test(v)) {
                    self.block.onUpdateCellValue(parseFloat(v));
                }
                else if (v == '') self.block.onUpdateCellValue(null);
            }
        }
        function input(event) {
            if (self.isCom) return;
            var input = event.target as HTMLInputElement;
            var v = input.value.trim();
            if (v == '') return save(null)
            if (/^[\d\.\+\-]+$/.test(v)) {
                save(parseFloat(v));
            }
        }
        function paste(event) {
            var text = event.clipboardData.getData('text/plain');
            if (text) {
                event.preventDefault();
                var v = text.trim();
                if (v == '') return self.block.onUpdateCellValue(null);
                if (/^[\d\.\+\-]+$/.test(v)) {
                    var input = event.target as HTMLInputElement;
                    input.value = v;
                    self.block.onUpdateCellValue(parseFloat(v));
                }
            }
        }
        function keyup(event) {

        }
        function start(e) {
            self.isCom = true;
        }
        function end(e) {
            self.isCom = false;
        }
        function blur(event) {
            var input = event.target as HTMLInputElement;
            var v = input.value.trim();
            if (/^[\d\.\+\-]+$/.test(v)) {
                var gv = parseFloat(v);
                if (gv != self.block.value)
                    self.block.onUpdateCellValue(parseFloat(v));
            }
            else {
                if (v == '') self.block.onUpdateCellValue(null);
            }
            self.block.isFocus = false;
            self.forceUpdate();
        }
        var isTable = this.block.dataGrid.url == BlockUrlConstant.DataGridTable;
        if (this.block.field.type == FieldType.autoIncrement)
            return <div className={'sy-field-number  f-14 min-h-20 ' + (isTable ? "flex-end" : "")}  >{this.block.value}</div>
        else return <div className={'sy-field-number f-14 ' + (isTable ? "flex-end" : "")}>
            {this.block.isFocus && <input type='text'
                placeholder={lst('输入数字')}
                defaultValue={this.block.value}
                onKeyDown={keydown}
                onInput={input}
                onKeyUp={keyup}
                onBlur={blur}
                onCompositionStart={start}
                onCompositionUpdate={start}
                onCompositionEnd={end}
                onPaste={paste}
                style={{ textIndent: isTable ? 10 : 0 }}
            />}
            {!this.block.isFocus && this.renderNumber()}
        </div>
    }
    renderNumber() {
        var cc = this.block.field?.config?.numberDisplay?.decimal || 100;
        var co = this.block.field?.config?.numberDisplay?.color;
        var f = this.block.field?.config?.numberDisplay?.display || 'auto';
        if (f == 'auto') return <span className="text l-22 " >{this.block.formatValue(this.block.value)}</span>
        else if (f == 'percent') {
            var color = co || '#ddd';
            var cd = ColorUtil.parseColor(color);
            var hex = ColorUtil.toHex(cd);
            hex = 'rgb(108, 155, 125)';
            // var cd = ColorUtil.parseColor(color);
            // var hex = ColorUtil.toHex(cd);
            return <div className="flex-auto flex">
                <div className="flex-auto  round relative" style={{
                    backgroundColor: 'rgba(199, 198, 196, 0.5)',
                    height: 6,
                    boxSizing: 'border-box'
                }}>
                    <div className="round pos " style={{ top: 0, left: 0, bottom: 0, backgroundColor: hex, height: 6, maxWidth: '100%', width:util.toPercent(this.block.value||0,cc,1)}}></div>
                </div>
                {this.block.field?.config.numberDisplay?.showNumber == true && <span className="text l-22 gap-l-10 flex-fixed w-50 f-14" >{util.toPercent(this.block.value||0,cc,1)}</span>}
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
                  {this.block.field?.config.numberDisplay?.showNumber == true && <span className="text l-22  gap-l-10 flex-fixed w-50 f-14" >{util.toPercent(this.block.value||0,cc,1)}</span>}
            </div>
        }
    }
}