import React from "react";
import { url, view } from "../../../../src/block/factory/observable";
import { BlockView } from "../../../../src/block/view";
import { ChildsArea } from "../../../../src/block/view/appear";
import { DataGridBase } from "../base/table";
@url('/data-grid/list')
export class TableStoreList extends DataGridBase {

}
@view('/data-grid/list')
export class TableStoreListView extends BlockView<TableStoreList>{
    render() {
        return <div className='sy-data-grid-list'>
            <ChildsArea childs={this.block.childs}></ChildsArea>
        </div>
    }
}