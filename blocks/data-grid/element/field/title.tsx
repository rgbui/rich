import React from "react";
import { url, view } from "../../../../src/block/factory/observable";
import { TextArea } from "../../../../src/block/view/appear";
import { BlockView } from "../../../../src/block/view";
import { OriginField } from "./origin.field";
import { Icon } from "../../../../component/view/icon";
import { PageLayoutType, getPageIcon } from "../../../../src/page/declare";
import { BlockUrlConstant } from "../../../../src/block/constant";
@url('/field/title')
export class FieldText extends OriginField {
    async openPage() {
        this.dataGrid.onOpenEditForm(this.item.dataRow.id);
    }
}
@view('/field/title')
export class FieldTextView extends BlockView<FieldText>{
    render() {
        return <div className='flex-top sy-field-title f-14'>
            <span className="size-20 flex-center inline-flex text-1"><Icon size={16} icon={getPageIcon({
                pageType: PageLayoutType.doc,
                icon: this.block.item?.dataRow?.icon
            })}></Icon></span>
            <TextArea block={this.block} prop='value' placeholder="标题" ></TextArea>
            {this.block.dataGrid.url == BlockUrlConstant.DataGridTable && <span onClick={e => this.block.openPage()} className="sy-field-title-button visible flex-center f-12 text-1 border  round padding-w-5 padding-h-2 cursor">
                <em>打开</em>
            </span>}
        </div>
    }
}