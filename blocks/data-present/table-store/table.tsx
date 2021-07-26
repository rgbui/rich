import { Block } from "../../../src/block";
import { BlockView } from "../../../src/block/view";
import React from 'react';
import { TableSchema } from "../schema/meta";
import { prop, url, view } from "../../../src/block/factory/observable";
import { BlockAppear, BlockDisplay } from "../../../src/block/partial/enum";
import { BlockFactory } from "../../../src/block/factory/block.factory";
import { TableStoreRow } from "./row";
import { ChildsArea } from "../../../src/block/partial/appear";
import { Pattern } from "../../../src/block/pattern";
import { ViewField } from "../schema/view.field";
import { util } from "../../../util/util";
import { Exception, ExceptionType } from "../../../src/error/exception";
import { FieldType } from "../schema/field.type";
import { ActionDirective } from "../../../src/history/declare";
import { Field } from "../schema/field";
import { TableStoreHead } from "./head";

/***
 * 数据总共分三部分
 * 1. 数据源（调用第三方接口获取数据），编辑的数据源需要触发保存
 * 2. 表格的元数据信息（来源于全局的表格元数据信息)
 * 3. 表格的视图展示（具体到视图的展现,信息存在tableStore） 
 * 
 */
@url('/table/store')
export class TableStore extends Block {
    @prop()
    fields: ViewField[] = [];
    @prop()
    schemaId: string;
    schema: TableSchema;
    data: any[] = [];
    index: number;
    size: number;
    total: number;
    blocks = { childs: [], rows: [] };
    get blockKeys() {
        return ['childs', 'rows'];
    }
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
            else if (n == 'blocks') {
                this.blocks = { childs: [], rows: [] };
            }
            else {
                this[n] = data[n];
            }
        }
    }
    initialInformation: { text: string, templateId?: string }
    async loadSchema() {
        if (this.schemaId) {
            var schemaData = await this.page.emitAsync('loadTableSchema', this.schemaId);
            this.schema = new TableSchema(schemaData);
        }
        else {
            this.page.onError(new Exception(ExceptionType.tableSchemaNotEmpty, '表格schema不为空'))
        }
    }
    isLoadData: boolean = false;
    async loadData() {
        if (this.schema) {
            var r = await this.page.emitAsync('loadTableSchemaData', this.schema.id, {
                index: this.index,
                size: this.size
            });
            this.data = Array.isArray(r.list) ? r.list : [];
            this.total = r?.total || 0;
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
        if (typeof at == 'undefined') at = this.fields.length;
        this.page.onAction(ActionDirective.onSchemaCreateField, async () => {
            var fieldData = this.page.emitAsync('createTableSchemaField', { text: '列', type: FieldType.text })
            var field = new Field();
            field.load(fieldData);
            this.schema.fields.push(field);
            var vf = new ViewField({
                width: 60,
                type: field.type,
                name: field.name,
                text: field.text
            });
            this.updateArrayInsert('fields', at, vf);
            await (this.blocks.childs.first() as TableStoreHead).createTh(at);
            await this.blocks.rows.asyncMap(async (row: TableStoreRow) => {
                await row.createCell(at);
            });
        });
    }
    async get() {
        var json: Record<string, any> = { id: this.id, url: this.url };
        if (typeof this.pattern.get == 'function')
            json.pattern = await this.pattern.get();
        else {
            console.log(this, this.pattern);
        }
        json.blocks = { childs: [], rows: [] };
        if (Array.isArray((this as any).__props)) {
            (this as any).__props.each(pro => {
                if (Array.isArray(this[pro])) {
                    json[pro] = this[pro].map(pr => {
                        if (typeof pr.get == 'function') return pr.get();
                        else return util.clone(pr);
                    })
                }
                else if (typeof this[pro] != 'undefined') {
                    if (typeof this[pro].get == 'function')
                        json[pro] = this[pro].get();
                    else json[pro] = util.clone(this[pro]);
                }
            })
        }
        return json;
    }
    async onCreated() {
        if (!this.schemaId) {
            var schemaData = await this.page.emitAsync('createDefaultTableSchema', this.initialInformation);
            this.schema = new TableSchema(schemaData);
            this.schemaId = this.schema.id;
            if (this.fields.length == 0) {
                this.fields = this.schema.fields.toArray(f => {
                    var vf = {
                        name: f.name,
                        type: f.type,
                        text: f.text || f.name,
                        width: 60,
                    };
                    if ([FieldType.id, FieldType.sort].exists(f.type)) return undefined;
                    var v = new ViewField(vf);
                    return v;
                });
            }
        }
    }
}
@view('/table/store')
export class TableStoreView extends BlockView<TableStore>{
    renderHead() {
        if (this.block.schema) return <ChildsArea childs={this.block.blocks.childs}></ChildsArea>
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
        await this.block.loadSchema();
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