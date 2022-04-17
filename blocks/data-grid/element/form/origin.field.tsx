import React from "react";
import { Icon } from "../../../../component/view/icon";
import { Block } from "../../../../src/block";
import { BlockDisplay } from "../../../../src/block/enum";
import { prop } from "../../../../src/block/factory/observable";
import { PageLayoutType } from "../../../../src/page/declare";
import { getTypeSvg } from "../../schema/util";
import "./style.less";
export class OriginFormField extends Block {
    display = BlockDisplay.block;
    value: any;
    get field() {
        if (this.page.pageLayout.type == PageLayoutType.dbForm&&this.page.schema) {
            return this.page.schema.fields.find(g => g.id == this.fieldId);
        }
    }
    @prop()
    fieldId: string;
    get isSupportTextStyle() {
        return false;
    }
    onInput(value: any) {
        this.value = value;
    }
    onChange(value: any) {
        this.value = value;
        this.view.forceUpdate();
    }
    fieldRemark: string = '';
    fieldError: string = '';
}

export function FieldView(props: { block: OriginFormField, children?: JSX.Element | string | React.ReactNode }) {
    var block = props.block;
    return <div className='sy-form-field' onMouseDown={e => e.stopPropagation()}>
        <div className="sy-form-field-box">
            <div className="sy-form-field-label">
                <Icon icon={getTypeSvg(block.field.type)} size={16}></Icon>
                {block.field.required && <em>*</em>}
                <label>{block.field.text}:</label>
            </div>
            <div className="sy-form-field-control">{props.children}</div>
        </div>
        {block.fieldRemark && <div className="sy-form-field-remark">{block.fieldRemark}</div>}
        {block.fieldError && <div className="sy-form-field-error">{block.fieldError}</div>}
    </div>
}