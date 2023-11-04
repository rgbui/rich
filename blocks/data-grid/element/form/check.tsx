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
        var self = this;
        return <FieldView block={this.block}>
            {this.block.fieldType == 'doc-detail' && <div className="flex">
                <div className="flex-fixed gap-r-5"><CheckBox checked={this.block.value}></CheckBox></div>
                <div className="flex-auto">
                    {this.block.checkLabel}
                </div>
            </div>}
            {this.block.fieldType != 'doc-detail' && <div className="flex">
                <div className="flex-fixed gap-r-5"><CheckBox
                    checked={this.block.value}
                    onChange={e => {
                        this.block.onChange(e);
                    }}></CheckBox></div>
                <div className="flex-auto">
                    <TextArea plain placeholderEmptyVisible={true} placeholder={lst("输入待办内容")} prop="checkLabel" block={this.block} ></TextArea>
                </div>
            </div>}
        </FieldView>
    }
}