import React from "react";
import { url, view } from "../../../../src/block/factory/observable";
import { BlockView } from "../../../../src/block/view";
import { ChildsArea } from "../../../../src/block/view/appear";
import { DataGridView } from "../base";
import { DataGridTool } from "../components/tool";
import "./style.less";
@url('/data-grid/list')
export class TableStoreList extends DataGridView {

}
@view('/data-grid/list')
export class TableStoreListView extends BlockView<TableStoreList>{
    render() {
        return <div className='sy-data-grid-list' onMouseEnter={e => this.block.onOver(true)}
            onMouseLeave={e =>this.block.onOver(false)}>
            <DataGridTool block={this.block}></DataGridTool>
            <ChildsArea childs={this.block.childs}></ChildsArea>
        </div>
    }
}