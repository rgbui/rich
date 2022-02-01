import React from "react";
import { url, view } from "../../../../src/block/factory/observable";
import { BlockView } from "../../../../src/block/view";
import { ChildsArea } from "../../../../src/block/view/appear";
import { DataGridView } from "../base/table";
import "./style.less";
@url('/data-grid/list')
export class TableStoreList extends DataGridView {

}
@view('/data-grid/list')
export class TableStoreListView extends BlockView<TableStoreList>{
    render() {
        return <div className='sy-data-grid-list'>
            <div className="sy-data-grid-list-head"></div>
            <ChildsArea childs={this.block.childs}></ChildsArea>
        </div>
    }
}