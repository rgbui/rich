import React from "react";
import { prop, url, view } from "../../../../src/block/factory/observable";
import { BlockView } from "../../../../src/block/view";
import { FieldView, OriginFormField } from "./origin.field";
import { CheckBox } from "../../../../component/view/checkbox";
import { TextArea } from "../../../../src/block/view/appear";
import { lst } from "../../../../i18n/store";

@url('/form/check')
class FieldText extends OriginFormField {
    @prop()
    checkLabel: string = '';
}

@view('/form/check')
class FieldTextView extends BlockView<FieldText>{
    renderView() {
        return <FieldView block={this.block}>
            {this.block.fromType == 'doc-detail' && <div className="flex min-h-30">
                <CheckBox readOnly checked={this.block.value}>{this.block.checkLabel}</CheckBox>
            </div>}
            {this.block.fromType != 'doc-detail' && <div className={this.block.fromType == 'doc-add' ? "" : "min-h-30 item-hover-light padding-w-10 round  "}><div className="flex min-h-30">
                <div className="flex-fixed" onMouseDown={e => { e.stopPropagation() }}><CheckBox
                    checked={this.block.value}
                    onChange={e => {
                        this.block.onChange(e);
                    }}></CheckBox></div>
                <div className="flex-auto f-14 gap-l-5">
                    <TextArea plain  placeholder={lst("输入...")} prop="checkLabel" block={this.block} ></TextArea>
                </div>
            </div></div>}
        </FieldView>
    }
}