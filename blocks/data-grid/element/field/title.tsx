import React from "react";
import { url, view } from "../../../../src/block/factory/observable";
import { TextArea } from "../../../../src/block/view/appear";
import { BlockView } from "../../../../src/block/view";
import { OriginField } from "./origin.field";
import { Icon } from "../../../../component/view/icon";
import { getPageIcon } from "../../../../extensions/at/declare";
import { PageLayoutType } from "../../../../src/page/declare";

@url('/field/title')
export class FieldText extends OriginField {
    async openPage() {
        this.dataGrid.onOpenEditForm(this.item.dataRow.id);
    }
}
@view('/field/title')
export class FieldTextView extends BlockView<FieldText>{
    render() {
        return <div className='sy-field-title f-14'>
            {this.block.item.dataRow['icon'] && <Icon icon={getPageIcon({ pageType: PageLayoutType.doc, icon: this.block.item.dataRow['icon'] })}></Icon>}
            <TextArea block={this.block} prop='value' placeholder="输入文本" ></TextArea>
            <span onClick={e => this.block.openPage()} className="sy-field-title-button flex-center f-14 text-1 border item-hover round padding-w-5 padding-h-2 cursor">
                <em>打开</em>
            </span>
        </div>
    }
}