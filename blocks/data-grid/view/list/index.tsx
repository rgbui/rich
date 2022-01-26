import React from "react";
import { Block } from "../../../../src/block";
import { url, prop, view } from "../../../../src/block/factory/observable";
import { BlockView } from "../../../../src/block/view";
import { Exception, ExceptionType } from "../../../../src/error/exception";
import { PageDirective } from "../../../../src/page/directive";
import { TableSchema } from "../../schema/meta";

@url('/datagrid/list')
export class TableStoreBoard extends Block {
    // @prop()
    // schemaId: string;
    // schema: TableSchema;
    // blocks = { childs: [], columns: [] };
    // data: any[] = [];
    // index: number;
    // size: number;
    // total: number;
    // get blockKeys() {
    //     return ['childs', 'columns'];
    // }
    // async loadSchema() {
    //     if (this.schemaId) {
    //         var schemaData = await this.page.emitAsync(PageDirective.schemaLoad, this.schemaId);
    //         this.schema = new TableSchema(schemaData);
    //         console.log('schemaData', schemaData)
    //     }
    //     else {
    //         this.page.onError(new Exception(ExceptionType.tableSchemaNotEmpty, '表格schema不为空'))
    //     }
    // }
    // isLoadData: boolean = false;
    // async loadData() {
    //     if (this.schema) {
    //         var r = await this.page.emitAsync(PageDirective.schemaTableLoad, this.schema.id, {
    //             index: this.index,
    //             size: this.size
    //         });
    //         this.data = Array.isArray(r.list) ? r.list : [];
    //         this.total = r?.total || 0;
    //     }
    // }
    // async createRows() {
    //     this.blocks.childs = [];
    //     for (let i = 0; i < this.data.length; i++) {
    //         var row = this.data[i];
    //         // var rowBlock: TableStoreRow = await BlockFactory.createBlock('/datagrid/row', this.page, { dataRow: row }, this) as TableStoreRow;
    //         // this.blocks.rows.push(rowBlock);

    //     }
    // }
}
@view('/datagrid/list')
export class TableStoreBoardView extends BlockView<TableStoreBoard>{
    render() {
        return <div className='sy-datagrid-board'>

        </div>
    }
}