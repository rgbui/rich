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
            {this.block.fieldType == 'doc-detail' && <div >
                <CheckBox checked={this.block.value}>{this.block.checkLabel}</CheckBox>
            </div>}
            {this.block.fieldType != 'doc-detail' && <div className={this.block.fieldType == 'doc-add' ? "" : "padding-w-10"}><div className="flex">
                <div className="flex-fixed" onMouseDown={e => { e.stopPropagation() }}><CheckBox
                    checked={this.block.value}
                    onChange={e => {
                        this.block.onChange(e);
                    }}></CheckBox></div>
                <div className="flex-auto f-14 gap-l-5">
                    <TextArea plain placeholderEmptyVisible={true} placeholder={lst("输入待办内容")} prop="checkLabel" block={this.block} ></TextArea>
                </div>
            </div></div>}
        </FieldView>
    }
}