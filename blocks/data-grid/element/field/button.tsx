import React from "react";
import { EditSvg, TrashSvg } from "../../../../component/svgs";
import { Icon } from "../../../../component/view/icon";
import { url, view } from "../../../../src/block/factory/observable";
import { BlockView } from "../../../../src/block/view";
import { OriginField } from "./origin.field";

@url('/field/button')
export class FieldCheck extends OriginField {
    onRowEdit(e: React.MouseEvent) {
        if (this.checkEdit() === false) return;
        this.dataGrid.onOpenEditForm(this.item.dataRow.id);
    }
    onRowDelete(e: React.MouseEvent) {
        if (this.checkEdit() === false) return;
        this.dataGrid.onBatchDelete([this.item.dataRow.id]);
    }
}
@view('/field/button')
export class FieldCheckView extends BlockView<FieldCheck>{
    render() {
        return <div className='sy-field-button' onMouseDown={e => e.stopPropagation()}>
            <div className="flex">
                <a className="text-1 f-14 cursor padding-w-5 padding-h-3 round item-hover flex-center " onMouseDown={e => this.block.onRowEdit(e)}><span className="size-20 flex-center"><Icon size={16} icon={EditSvg}></Icon></span><span>编辑</span></a>
                <a className="text-1 f-14 cursor padding-w-5 padding-h-3 round item-hover  flex-center" onMouseDown={e => this.block.onRowDelete(e)}><span className="size-20 flex-center"><Icon size={16} icon={TrashSvg}></Icon></span><span>删除</span></a>
            </div>
        </div>
    }
}