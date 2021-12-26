import { Block } from "../../../../src/block";
import React from 'react';
import { TableSchema } from "../../schema/meta";
import { prop, url } from "../../../../src/block/factory/observable";
import { BlockFactory } from "../../../../src/block/factory/block.factory";
import { TableStoreRow } from "./part/row";
import { Pattern } from "../../../../src/block/pattern";
import { FieldSort, TableStoreViewField } from "./field";
import { util } from "../../../../util/util";
import { Exception, ExceptionType } from "../../../../src/error/exception";
import { FieldType } from "../../schema/field.type";
import { ActionDirective, OperatorDirective } from "../../../../src/history/declare";
import { Field } from "../../schema/field";
import { TableStoreHead } from "./part/head";
import { Confirm } from "../../../../component/lib/confirm";
import { PageDirective } from "../../../../src/page/directive";
import { useTableStoreAddField } from "../../../../extensions/tablestore";
import { Rect } from "../../../../src/common/point";
import { useFormPage } from "../../../../extensions/tablestore/form";


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
    fields: TableStoreViewField[] = [];
    @prop()
    schemaId: string;
    schema: TableSchema;
    data: any[] = [];
    index: number;
    size: number;
    total: number;
    blocks = { childs: [], rows: [] };
    openSubPageId: string;
    subPages: { id: string, template: any }[] = [];
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
                    this.fields.push(new TableStoreViewField(n));
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
    initialData: { text: string, templateId?: string }
    async loadSchema() {
        if (this.schemaId) {
            var schemaData = await this.page.emitAsync(PageDirective.schemaLoad, this.schemaId);
            this.schema = new TableSchema(schemaData);
            console.log('schemaData', schemaData)
        }
        else {
            this.page.onError(new Exception(ExceptionType.tableSchemaNotEmpty, '表格schema不为空'))
        }
    }
    isLoadData: boolean = false;
    async loadData() {
        if (this.schema) {
            var r = await this.page.emitAsync(PageDirective.schemaTableLoad, this.schema.id, {
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
    async onAddField(event: React.MouseEvent | MouseEvent, at?: number) {
        if (typeof at == 'undefined') at = this.fields.length;
        var self = this;
        var result = await useTableStoreAddField(
            { roundArea: Rect.fromEle(event.target as HTMLDivElement) },
            {
                text: '',
                type: FieldType.text,
                check(newText) {
                    if (!newText) return '表格列名不能为空'
                    return self.fields.some(s => s.text == newText) ? '表列名有重复' : ""
                }
            }
        );
        if (!result) return;
        this.page.onAction(ActionDirective.onSchemaCreateField, async () => {
            var fieldData = await this.page.emitAsync(PageDirective.schemaCreateField, this.schema.id, { text: result.text, type: result.type })
            console.log(fieldData);
            var field = new Field();
            field.load(fieldData);
            this.schema.fields.push(field);
            var vf = new TableStoreViewField({
                width: 120,
                type: result.type,
                name: field.name,
                text: result.text
            });
            this.updateArrayInsert('fields', at, vf);
            await (this.blocks.childs.first() as TableStoreHead).createTh(at);
            await this.blocks.rows.asyncMap(async (row: TableStoreRow) => {
                await row.createCell(at);
            });
        });
    }
    async onDeleteField(at?: number) {
        if (await Confirm('确定要删除该列吗')) {
            if (typeof at == 'undefined') at = this.fields.length - 1;
            var field = this.fields[at];
            var tf = this.schema.fields.find(g => g.name == field.name);
            this.page.onAction(ActionDirective.onSchemaDeleteField, async () => {
                var result = await this.page.emitAsync(PageDirective.schemaRemoveField, this.schema.id, tf.id)
                await (this.blocks.childs.first() as TableStoreHead).childs[at].delete()
                await this.blocks.rows.asyncMap(async (row: TableStoreRow) => {
                    await row.deleteCell(at);
                });
                this.updateArrayRemove('fields', at);
            });
        }
    }
    async onHideField(at?: number) {
        if (typeof at == 'undefined') at = this.fields.length - 1;
        this.page.onAction(ActionDirective.onSchemaDeleteField, async () => {
            await (this.blocks.childs.first() as TableStoreHead).childs[at].delete()
            await this.blocks.rows.asyncMap(async (row: TableStoreRow) => {
                await row.deleteCell(at);
            });
            this.updateArrayRemove('fields', at);
        });
    }
    async onCopyField(at?: number) {
        if (typeof at == 'undefined') at = this.fields.length - 1;
        var viewField = this.fields[at];
        var field = this.schema.fields.find(g => g.name == viewField.name);
        var fieldData = field.get()
        this.page.onAction(ActionDirective.onSchemaCreateField, async () => {
            var fd = this.page.emitAsync(PageDirective.schemaCreateField, this.schema.id, { ...fieldData })
            var newField = new Field();
            newField.load(fd);
            this.schema.fields.push(newField);
            var vf = new TableStoreViewField({
                width: 60,
                type: newField.type,
                name: newField.name,
                text: newField.text
            });
            this.updateArrayInsert('fields', at + 1, vf);
            await (this.blocks.childs.first() as TableStoreHead).createTh(at + 1);
            await this.blocks.rows.asyncMap(async (row: TableStoreRow) => {
                await row.createCell(at + 1);
            });
        });
    }
    async onSetSortField(at?: number, sort?: FieldSort) {
        if (typeof at == 'undefined') at = this.fields.length - 1;
        if (typeof sort == 'undefined') sort = FieldSort.none;
        var vf = this.fields[at];
        await this.page.onAction(ActionDirective.onTablestoreUpdateViewField, async () => {
            var newViewField = vf.clone();
            newViewField.sort = sort;
            this.updateArrayUpdate('fields', at, newViewField);
        });
        await this.loadData()
    }
    async onTurnField(at: number, type: FieldType) {
        if (typeof at == 'undefined') at = this.fields.length - 1;
        var viewField = this.fields[at];
        var field = this.schema.fields.find(g => g.name == viewField.name);
        await this.page.onAction(ActionDirective.onSchemaTurnField, async () => {
            field.type = type;
            var newViewField = viewField.clone();
            newViewField.type = type;
            this.updateArrayUpdate('fields', at, newViewField);
            await this.page.emitAsync(PageDirective.schemaTurnTypeField, this.schema.id, field.name, type)
        });
        await this.loadData()
    }
    async onAddRow(id?: string, arrow: 'down' | 'up' = 'down') {
        if (typeof id == 'undefined') {
            id = this.data.last().id;
        }
        await this.page.onAction(ActionDirective.onSchemaCreateDefaultRow, async () => {
            var newRow = await this.page.emitAsync(PageDirective.schemaInsertRow, this.schema.id, {}, { id, pos: arrow });

        });
    }
    async onRowUpdate(id: string, viewField: TableStoreViewField, value: any) {
        var vfName = viewField.name || viewField.text;
        var oldValue = this.data.find(g => g.id == id)[vfName];
        var newValue = value;
        if (!util.valueIsEqual(oldValue, newValue)) {
            await this.page.emitAsync(PageDirective.schemaUpdateRow,
                this.schema.id,
                id,
                { [vfName]: newValue }
            )
        }
    }
    async onUpdateCellFieldSchema(field: Field, fs: Record<string, any>) {
        field.load(fs);
        await this.page.emitAsync(PageDirective.schemaUpdateField,
            this.schema.id,
            field.id,
            { ...field.get() }
        )
    }
    async onRowDelete(id: string) {
        var data = this.data.find(g => g.id == id);
        await this.page.onAction(ActionDirective.onSchemaRowDelete, async () => {
            this.page.snapshoot.record(OperatorDirective.schemaRowRemove, {
                schemaId: this.schema.id,
                data: util.clone(data)
            });
            await this.page.emitAsync(PageDirective.schemaDeleteRow,
                this.schema.id,
                id
            );
        })
    }
    async get() {
        var json: Record<string, any> = { id: this.id, url: this.url };
        if (typeof this.pattern.get == 'function')
            json.pattern = await this.pattern.get();
        else {
            console.log(this, this.pattern);
        }
        json.blocks = {
            childs: [],
            rows: []
        };
        if (Array.isArray((this as any).__props)) {
            (this as any).__props.each(pro => {
                if (Array.isArray(this[pro])) {
                    json[pro] = this[pro].map(pr => {
                        if (typeof pr?.get == 'function') return pr.get();
                        else return util.clone(pr);
                    })
                }
                else if (typeof this[pro] != 'undefined') {
                    if (typeof this[pro]?.get == 'function')
                        json[pro] = this[pro].get();
                    else json[pro] = util.clone(this[pro]);
                }
            })
        }
        return json;
    }
    async created() {
        if (!this.schemaId) {
            var schemaData = await this.page.emitAsync(PageDirective.schemaCreate, this.initialData);
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
                    var v = new TableStoreViewField(vf);
                    return v;
                });
            }
        }
    }
    async onAddOpenForm(event: React.MouseEvent) {
        var row = await useFormPage(this.page, this.schema);
        console.log(row);
    }
    getBlocksByField(field: TableStoreViewField) {
        var keys = this.blockKeys;
        var at = this.fields.findIndex(g => g === field);
        var cs: Block[] = [];
        for (let key of keys) {
            this.blocks[key].each(c => {
                cs.push(c.childs[at]);
            })
        }
        return cs;
    }
}


