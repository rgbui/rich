import React from "react";
import { url, view } from "../../../../src/block/factory/observable";
import { BlockView } from "../../../../src/block/view";
import { OriginField } from "../../element/field/origin.field";
import { DataGridView } from "../base/table";
import { TableStoreItem } from "../item";
import { createFieldBlock } from "../item/service";

@url('/data-grid/table/row')
export class DataGridTableItem extends TableStoreItem {
    dataRow: Record<string, any> = {};
    get schema() {
        return (this.parent as DataGridView).schema;
    }
    get fields() {
        return (this.parent as DataGridView).fields;
    }
    async createElements() {
        console.log(this.fields,'fs');
        for (let i = 0; i < this.fields.length; i++) {
            var field = this.fields[i];
            if (field.field) {
                console.log(field.field?.name);
                var block = await createFieldBlock(field, this.dataRow, this);
                this.blocks.childs.push(block);
            }
        }
    }
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
            <div className='sy-dg-table-row-cell' style={{ width: 40 }}></div>
        </div>
    }
}
