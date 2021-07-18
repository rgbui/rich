import { Block } from "../../../src/block";
import { BlockView } from "../../../src/block/view";
import React from 'react';
import { TableMeta } from "../schema/meta";
import { prop, url, view } from "../../../src/block/factory/observable";
import { BlockAppear, BlockDisplay } from "../../../src/block/partial/enum";
import { BlockFactory } from "../../../src/block/factory/block.factory";
import { TableStoreRow } from "./row";
import { ChildsArea } from "../../../src/block/partial/appear";
import { Pattern } from "../../../src/block/pattern";
import { ViewField } from "../schema/view.field";

/***
 * 数据总共分三部分
 * 1. 数据源（调用第三方接口获取数据），编辑的数据源需要触发保存
 * 2. 表格的元数据信息（来源于全局的表格元数据信息)
 * 3. 表格的视图展示（具体到视图的展现,信息存在tableStore） 
 */
@url('/table/store')
export class TableStore extends Block {
    @prop()
    fields: ViewField[] = [];
    @prop()
    metaId: string;
    meta: TableMeta;
    data: any[];
    async load(data) {
        if (!this.pattern) this.pattern = new Pattern(this);
        for (var n in data) {
            if (n == 'pattern') {
                await this.pattern.load(data[n]);
            }
            else if (n == 'fields') {
                data.fields.each(n => {
                    this.fields.push(new ViewField(n));
                })
            }
            else {
                this[n] = data[n];
            }
        }
    }
    async loadMeta() {
        if (this.metaId) {
            this.meta = await this.page.emitAsync('searchDataPresentMeta', this.metaId);
        }
        else {
            this.meta = await this.page.emitAsync('createDefaultPresentData');
            this.metaId = this.meta.id;
        }
    }
    isLoadData: boolean = false;
    async loadData() {
        if (this.meta) {
            this.data = await this.page.emitAsync('loadDataPresentData')
        }
    }
    async createHeads() {
        this.blocks.childs = [];
        var head = await BlockFactory.createBlock('/tablestore/head', this.page, {}, this);
        this.blocks.childs.push(head);
        await this.fields.eachAsync(async () => {
            var block = await BlockFactory.createBlock('/tablestore/th', this.page, {}, head);
            head.blocks.childs.push(block);
        });
    }
    async createRows() {
        this.blocks.rows = [];
        for (let i = 0; i < this.data.length; i++) {
            var row = this.data[i];
            var rowBlock: TableStoreRow = await BlockFactory.createBlock('/tablestore/row', this.page, { dataRow: row }, this) as TableStoreRow;
            this.blocks.rows.push(rowBlock);
            await rowBlock.createCells();
        }
    }
    appear = BlockAppear.layout;
    display = BlockDisplay.block;
    async onAddColumn(at?: number) {
        //if (typeof at == 'undefined') at = this.cols.length;
        // this.page.snapshoot.declare('tablestore.addColumn');
        // var name = this.meta.createNewName();
        // var text = this.meta.createNewText();
        // var tf = TableMeta.createFieldMeta({
        //     name,
        //     type: TableMetaFieldType.string,
        //     text
        // });
        // this.page.snapshoot.record(OperatorDirective.arrayPropInsert, {
        //     blockId: this.id,
        //     propKey: 'meta',
        //     data: tf.get(),
        //     at: this.meta.cols.length
        // });
        // this.meta.cols.push(tf);
        // this.page.snapshoot.record(OperatorDirective.arrayPropInsert, {
        //     blockId: this.id,
        //     propKey: 'cols',
        //     data: { name, width: 100 },
        //     at
        // });
        // this.cols.push({ name, width: 100 });
        // await (this.blocks.childs.first() as TableStoreHead).appendTh(at);
        // await this.blocks.rows.asyncMap(async (row: TableStoreRow) => {
        //     row.appendCell(at);
        // })
        // this.page.snapshoot.store();
        // this.view.forceUpdate();
    }
}
@view('/table/store')
export class TableStoreView extends BlockView<TableStore>{
    renderHead() {
        if (this.block.meta) return <ChildsArea childs={this.block.blocks.childs}></ChildsArea>
        else return <div></div>
    }
    renderBody() {
        if (this.block.data && this.block.isLoadData)
            return <div className='sy-tablestore-body'><ChildsArea childs={this.block.blocks.rows}></ChildsArea>
            </div>
        else if (this.block.data && !this.block.isLoadData)
            return <div className='sy-tablestore-body'><ChildsArea childs={this.block.blocks.rows}></ChildsArea>
            </div>
        else return <div></div>
    }
    async didMount() {
        await this.block.loadMeta();
        await this.block.createHeads();
        this.forceUpdate()
        await this.block.loadData();
        await this.block.createRows();
        this.forceUpdate();
    }
    render() {
        return <div className='sy-tablestore'>
            <div className='sy-tablestore-col-resize'></div>
            <div className='sy-table-store-content'>
                {this.renderHead()}
                {this.renderBody()}
            </div>
        </div>
    }
}