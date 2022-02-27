import React from "react";
import { url, view } from "../../../../src/block/factory/observable";
import { BlockView } from "../../../../src/block/view";
import { OriginField } from "../../element/field/origin.field";
import { TableStoreItem } from "../item";
@url('/data-grid/table/row')
export class DataGridTableItem extends TableStoreItem {

}
@view('/data-grid/table/row')
export class DataGridTableItemView extends BlockView<DataGridTableItem>{
    render() {
        return <div className='sy-dg-table-row'>
            {this.block.childs.map((block: OriginField) => {
                return <div key={block.id} className='sy-dg-table-row-cell' style={{ width: block.viewField.colWidth || 120 }}>
                    <block.viewComponent block={block}></block.viewComponent>
                </div>
            })}
            <div className='sy-dg-table-row-cell' style={{ minWidth: 40, flexGrow: 1, flexShrink: 1 }}></div>
        </div>
    }
}
