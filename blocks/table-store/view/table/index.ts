
import React from 'react';
import { TableSchema } from "../../schema/meta";
import { url } from "../../../../src/block/factory/observable";
import { BlockFactory } from "../../../../src/block/factory/block.factory";
import { TableStoreRow } from "./part/row";
import { Pattern } from "../../../../src/block/pattern";

import { util } from "../../../../util/util";
import { FieldType } from "../../schema/type";
import { ActionDirective } from "../../../../src/history/declare";
import { Field } from "../../schema/field";
import { TableStoreHead } from "./part/head";
import { Confirm } from "../../../../component/lib/confirm";
import { useTableStoreAddField } from "../../../../extensions/tablestore/field";
import { Rect } from "../../../../src/common/vector/point";
import { useFormPage } from "../../../../extensions/tablestore/form";
import { TableStoreBase } from '../base/table';
import { Block } from '../../../../src/block';
import { channel } from '../../../../net/channel';
import { ViewField } from '../../schema/view';


/***
 * 数据总共分三部分
 * 1. 数据源（调用第三方接口获取数据），编辑的数据源需要触发保存
 * 2. 表格的元数据信息（来源于全局的表格元数据信息)
 * 3. 表格的视图展示（具体到视图的展现,信息存在tableStore） 
 * 
 */
@url('/table/store')
export class TableStore extends TableStoreBase {
    index: number;
    size: number = 50;
    total: number;
    data: any[] = [];
    blocks = { childs: [], rows: [] };
    get blockKeys() {
        return ['childs', 'rows'];
    }
    get allBlockKeys(): string[] {
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
    isLoadData: boolean = false;
    async loadData() {
        if (this.schema) {
            var r = await this.schema.list({ page: this.index, size: this.size });
            if (r.data) {
                this.data = Array.isArray(r.data.list) ? r.data.list : [];
                this.total = r.data?.total || 0;
            }
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
            var fieldData = await this.schema.fieldAdd({ text: result.text, type: result.type });
            if (fieldData.ok) {
                var field = new Field();
                field.load(fieldData.data);
                this.schema.fields.push(field);
                var vf = new ViewField(this.schema, {
                    colWidth: 120,
                    fieldId: field.id,
                    text: result.text
                });
                this.updateArrayInsert('fields', at, vf);
                await (this.blocks.childs.first() as TableStoreHead).createTh(at);
                await this.blocks.rows.asyncMap(async (row: TableStoreRow) => {
                    await row.createCell(at);
                });
            }
        });
    }
    async onDeleteField(at?: number) {
        if (await Confirm('确定要删除该列吗')) {
            if (typeof at == 'undefined') at = this.fields.length - 1;
            var viewField = this.fields[at];
            var field = viewField.field;
            this.page.onAction(ActionDirective.onSchemaDeleteField, async () => {
                var r = await this.schema.fieldRemove(field.id);
                if (r.ok) {
                    await (this.blocks.childs.first() as TableStoreHead).childs[at].delete()
                    await this.blocks.rows.asyncMap(async (row: TableStoreRow) => {
                        await row.deleteCell(at);
                    });
                    this.updateArrayRemove('fields', at);
                }
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
        var field = viewField.field;
        var fieldData = field.get()
        this.page.onAction(ActionDirective.onSchemaCreateField, async () => {
            var r = await this.schema.fieldAdd(fieldData);
            if (r.ok) {
                var fd = r.data;
                var newField = new Field();
                newField.load(fd);
                this.schema.fields.push(newField);
                var vf = new ViewField(this.schema, {
                    colWidth: 60,
                    fieldId: newField.id,
                    text: newField.text
                });
                this.updateArrayInsert('fields', at + 1, vf);
                await (this.blocks.childs.first() as TableStoreHead).createTh(at + 1);
                await this.blocks.rows.asyncMap(async (row: TableStoreRow) => {
                    await row.createCell(at + 1);
                });
            }
        });
    }
    async onSetSortField(at?: number, sort?: 0 | 1 | -1) {
        if (typeof at == 'undefined') at = this.fields.length - 1;
        if (typeof sort == 'undefined') sort = 0;
        var viewField = this.fields[at];
        await this.page.onAction(ActionDirective.onTablestoreUpdateViewField, async () => {
            var newViewField = viewField.clone();
            newViewField.sort = sort;
            this.updateArrayUpdate('fields', at, newViewField);
        });
        await this.loadData()
    }
    async onTurnField(at: number, type: FieldType) {
        if (typeof at == 'undefined') at = this.fields.length - 1;
        var viewField = this.fields[at];
        var field = viewField.field;
        await this.page.onAction(ActionDirective.onSchemaTurnField, async () => {
            var r = await this.schema.turnField({ fieldId: field.id, type: type });
            if (r.ok) {
                field.type = type;
            }
        });
        await this.loadData()
    }
    async onAddRow(data, id?: string, arrow: 'before' | 'after' = 'after') {
        if (typeof id == 'undefined') {
            id = this.data.last().id;
        }
        await this.page.onAction(ActionDirective.onSchemaCreateDefaultRow, async () => {
            var r = await this.schema.rowAdd({ data, pos: { dataId: id, pos: arrow } });
            if (r.ok) {
                var newRow = r.data;
                var at = this.blocks.rows.findIndex(g => (g as TableStoreRow).dataRow.id == id);
                if (arrow == 'after') at += 1;
                this.data.insertAt(at, newRow);
                var rowBlock: TableStoreRow = await this.page.createBlock('/tablestore/row', { dataRow: newRow }, this, at, 'rows') as TableStoreRow;
                await rowBlock.createCells();
            }
        });
    }
    async onRowUpdateCell(id: string, viewField: ViewField, value: any) {
        var vfName = viewField.field.name || viewField.field.text;
        var row = this.data.find(g => g.id == id)
        var oldValue = row[vfName];
        var newValue = value;
        if (!util.valueIsEqual(oldValue, newValue)) {
            this.schema.rowUpdate({ dataId: id, data: { [vfName]: newValue } })
            row[vfName] = newValue;
        }
    }
    async onRowUpdate(id: string, data: Record<string, any>) {
        var oldValue = this.data.find(g => g.id == id);
        if (!util.valueIsEqual(oldValue, data)) {
            var r = await this.schema.rowUpdate({ dataId: id, data });
            if (r.ok) {
                var rv: TableStoreRow = this.blocks.rows.find(g => g.dataRow.id == id);
                if (rv) {
                    rv.updateData(data);
                }
            }
        }
    }
    async onUpdateCellFieldSchema(field: Field, fs: Record<string, any>) {
        field.load(fs);
        await this.schema.fieldUpdate({ fieldId: field.id, data: field.get() })
    }
    async onRowDelete(id: string) {
        await this.page.onAction(ActionDirective.onSchemaRowDelete, async () => {
            await this.schema.rowRemove(id);
            var row: Block = this.blocks.rows.find(g => (g as TableStoreRow).dataRow.id == id);
            await row.delete()
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
    initialData: { text: string, templateId?: string }
    async created() {
        if (!this.schemaId) {
            var r = await channel.put('/schema/create', this.initialData);
            if (r.ok) {
                var schemaData = r.data;
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
                        var v = new ViewField(this.schema, vf);
                        return v;
                    });
                }
            }
        }
    }
    async onAddOpenForm() {
        var row = await useFormPage(this.schema);
        await this.onAddRow(row, undefined, 'after');
    }
    async onEditOpenForm(id: string) {
        var rowData = this.data.find(g => g.id == id);
        var row = await useFormPage(this.schema, rowData);
        await this.onRowUpdate(id, row);
    }
    getBlocksByField(field: ViewField) {
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


