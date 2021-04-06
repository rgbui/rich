import { Block } from "../../base";
import { BaseComponent } from "../../base/component";
import React from 'react';
import { TableMeta } from "./meta";
import { util } from "../../../util/util";
import "./style.less";
import { url, view } from "../../factory/observable";
import { BlockAppear, BlockDisplay } from "../../base/enum";
import { BlockFactory } from "../../factory/block.factory";
import { TableStoreRow } from "./row";
import { ChildsArea } from "../../base/appear";

/***
 * 数据总共分三部分
 * 1. 数据源（调用第三方接口获取数据），编辑的数据源需要触发保存
 * 2. 表格的元数据信息（来源于全局的表格元数据信息)
 * 3. 表格的视图展示（具体到视图的展现,信息存在tableStore） 
 */
@url('/table/store')
export class TableStore extends Block {
    meta: TableMeta;
    cols: {
        name: string,
        width: number
    }[] = [];
    data: any[] = [];
    pagination: boolean;
    async load(data) {
        for (var n in data) {
            if (n == 'meta') {
                this.meta = new TableMeta(data[n]);
            }
            else {
                this[n] = data[n];
            }
        }
        await this.loadHeads();
        await this.loadRows();
    }
    async loadHeads() {
        this.blocks.childs = [];
        var head = await BlockFactory.createBlock('/tablestore/head', this.page, {}, this);
        this.blocks.childs.push(head);
        await this.cols.eachAsync(async (col) => {
            var block = await BlockFactory.createBlock('/tablestore/th', this.page, { name: col.name }, head);
            head.blocks.childs.push(block);
        });
    }
    async loadRows() {
        this.blocks.rows = [];
        for (let i = 0; i < this.data.length; i++) {
            var row = this.data[i];
            var rowBlock: TableStoreRow = await BlockFactory.createBlock('/tablestore/row', this.page, { dataRow: row }, this) as TableStoreRow;
            this.blocks.rows.push(rowBlock);
            await rowBlock.createCells();
        }
    }
    async get() {
        var json: Record<string, any> = {
            cols: util.clone(this.cols),
            meta: this.meta.get(),
            data: util.clone(this.data),
            pagination: this.pagination
        };
        return json;
    }
    appear = BlockAppear.layout;
    display = BlockDisplay.block;
}
@view('/table/store')
export class TableStoreView extends BaseComponent<TableStore>{
    renderHead() {
        return <ChildsArea childs={this.block.blocks.childs}></ChildsArea>
    }
    renderBody() {
        return <div className='sy-tablestore-body'><ChildsArea childs={this.block.blocks.rows}></ChildsArea>
        </div>
    }
    renderFooter() {
        return this.block.pagination && <div className='sy-tablestore-footer'></div>
    }
    render() {
        return <div className='sy-tablestore'>
            {this.renderHead()}
            {this.renderBody()}
            {this.renderFooter()}
        </div>
    }
}