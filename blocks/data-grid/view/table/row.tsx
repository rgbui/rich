import React, { CSSProperties } from "react";
import { TableStore } from ".";
import { url, view } from "../../../../src/block/factory/observable";
import { BlockView } from "../../../../src/block/view";
import { OriginField } from "../../element/field/origin.field";
import { TableStoreItem } from "../item";

@url('/data-grid/table/row')
export class DataGridTableItem extends TableStoreItem {
    get isShowHandleBlock(): boolean {
        return true;
    }
}
@view('/data-grid/table/row')
export class DataGridTableItemView extends BlockView<DataGridTableItem>{
    renderView() {
        var totalWidth = (this.block.parent as TableStore).sumWidth;
        var rowStyle: CSSProperties = {
            width: totalWidth
        }
        if (!(this.block.parent.isCanEdit() && !(this.block.parent as TableStore).isCanLocker())) {
            rowStyle = {
                minWidth: totalWidth
            }
        }
        return <div className='sy-dg-table-row visible-hover' style={rowStyle}>
            {this.block.childs.map((block: OriginField, i) => {
                var w = block?.viewField?.colWidth || 120;
                var style: CSSProperties = {
                    width: w
                }
                if (!(this.block.parent.isCanEdit() && !(this.block.parent as TableStore).isCanLocker()) && i == this.block.fields.length - 1) {
                    style = {
                        minWidth: w,
                        flexGrow: 1,
                        flexShrink: 1
                    }
                }
                return <div key={block.id} onMouseDown={e => block.onCellMousedown(e)} className='sy-dg-table-row-cell' style={style}>
                    <block.viewComponent block={block}></block.viewComponent>
                </div>
            })}
            {(this.block.parent as TableStore).dataGridIsCanEdit() && <div className='sy-dg-table-row-cell' style={{ minWidth: 40, flexGrow: 1, flexShrink: 1 }}></div>}
        </div>
    }
}
