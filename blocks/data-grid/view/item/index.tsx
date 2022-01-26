import React from "react";
import { Block } from "../../../../src/block";
import { url, view } from "../../../../src/block/factory/observable";
import { BlockView } from "../../../../src/block/view";
import { ChildsArea } from "../../../../src/block/view/appear";
import { TableStoreBase } from "../base/table";
import { createFieldBlock } from "./service";

import "./style.less";

@url('/data-grid/item')
export class TableStoreItem extends Block {
    dataRow: Record<string, any> = {};
    get schema() {
        return (this.parent as TableStoreBase).schema;
    }
    get fields() {
        return (this.parent as TableStoreBase).fields;
    }
    async createElements() {
        for (let i = 0; i < this.fields.length; i++) {
            var field = this.fields[i];
            var block = await createFieldBlock(field, this.dataRow, this);
            this.blocks.childs.push(block);
        }
    }
}
@view('/data-grid/item')
export class TableStoreItemView extends BlockView<TableStoreItem>{
    render() {
        return <div className='sy-data-grid-item'>
            <ChildsArea childs={this.block.childs}></ChildsArea>
        </div>
    }
}


