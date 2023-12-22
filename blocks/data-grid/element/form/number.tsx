import React from "react";
import { InputNumber } from "../../../../component/view/input/number";
import { url, view } from "../../../../src/block/factory/observable";
import { BlockView } from "../../../../src/block/view";
import { FieldView, OriginFormField } from "./origin.field";
import { lst } from "../../../../i18n/store";
import lodash from "lodash";
import { S } from "../../../../i18n/view";

@url('/form/number')
class FieldText extends OriginFormField {
    inputChange = lodash.debounce((value: string) => {
        var n = parseFloat(value);
        if (lodash.isNumber(n))
            this.onChange(n);
    }, 700)
}
@view('/form/number')
class FieldTextView extends BlockView<FieldText>{
    renderInput() {
        function keydown(event: React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>) {
            if (event.key == 'Enter') {
                if (!self.block.isCanEdit()) return;
                self.block.onChange((event.target as HTMLInputElement).value);
            }
        }
        var self = this;
        if (this.block.fieldType == 'doc-detail') return <div className={typeof this.block.value != 'number' ? "f-14 remark" : ""}>{typeof this.block.value == 'number' ? this.block.value.toString() : <S>空内容</S>}</div>
        if (this.block.fieldType == 'doc-add') return <InputNumber
            value={this.block.value}
            placeholder={lst('请输入') + this.block.field?.text}
            onChange={e => this.block.onInput(e)}
            onEnter={e => self.block.onChange(e)}
        ></InputNumber>
        return <input
            className={"padding-w-10 round sy-doc-field-input-value item-hover"}
            type='text'
            placeholder={lst('请输入') + this.block.field?.text}
            data-shy-page-no-focus={true}
            defaultValue={lodash.isNumber(this.block.value) ? this.block.value.toString() : ''}
            onInput={e => { this.block.inputChange((e.target as HTMLInputElement).value) }}
            onKeyDown={e => keydown(e)}
        />
    }
    renderView() {
        return <FieldView block={this.block}>
            {this.renderInput()}
        </FieldView>
    }
}