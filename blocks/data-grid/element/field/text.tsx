import React from "react";
import { url, view } from "../../../../src/block/factory/observable";
import { TextArea } from "../../../../src/block/view/appear";
import { OriginField, OriginFileView } from "./origin.field";
import { lst } from "../../../../i18n/store";
import { BlockUrlConstant } from "../../../../src/block/constant";
import { FieldType } from "../../schema/type";

@url('/field/text')
export class FieldText extends OriginField {
    onCellMousedown(event: React.MouseEvent<Element, MouseEvent>): void {
        var isDataGridTable = [BlockUrlConstant.DataGridTable].includes(this.dataGrid.url as any);
        if (!isDataGridTable) {
            setTimeout(() => {
                this.page.kit.anchorCursor.onFocusBlockAnchor(this, { last: true })
            }, 200);

        }
    }
}

@view('/field/text')
export class FieldTextView extends OriginFileView<FieldText>{
    renderFieldValue() {
        if (this.block.field?.type == FieldType.id) {
            return <div className="f-14">{this.block.value}</div>
        }
        return <div className='sy-field-text  f-14' ><TextArea plain block={this.block} placeholder={lst("输入文本")} prop='value' ></TextArea></div>
    }
}