import React from "react";
import { BlockFactory } from "../../../../src/block/factory/block.factory";
import { url, view } from "../../../../src/block/factory/observable";
import { BlockView } from "../../../../src/block/view";
import { ChildsArea } from "../../../../src/block/view/appear";
import { DataGridView } from "../base";
import { DataGridTool } from "../components/tool";
import { TableStoreListItem } from "./row";
import "./style.less";

@url('/data-grid/list')
export class TableStoreList extends DataGridView {
    async createItem() {
        this.blocks.childs = [];
        for (let i = 0; i < this.data.length; i++) {
            var row = this.data[i];
            var rowBlock: TableStoreListItem = await BlockFactory.createBlock('/data-grid/list/row', this.page, { mark: i, dataId: row.id }, this) as TableStoreListItem;
            this.blocks.childs.push(rowBlock);
            await rowBlock.createElements();
        }
    }
}
@view('/data-grid/list')
export class TableStoreListView extends BlockView<TableStoreList>{
    render() {
        return <div className='sy-data-grid-list'
            onMouseEnter={e => this.block.onOver(true)}
            onMouseLeave={e => this.block.onOver(false)}
        >
            <DataGridTool block={this.block}></DataGridTool>
            <ChildsArea childs={this.block.childs}></ChildsArea>
        </div>
    }
}