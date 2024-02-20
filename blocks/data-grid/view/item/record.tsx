import React from "react";
import { ElementType, autoImageUrl, getElementUrl } from "../../../../net/element.type";
import { Block } from "../../../../src/block";
import { prop, url, view } from "../../../../src/block/factory/observable";
import { BlockView } from "../../../../src/block/view";
import { ChildsArea } from "../../../../src/block/view/appear";
import { util } from "../../../../util/util";
import { CardFactory } from "../../template/card/factory/factory";
import { TableSchema } from "../../schema/meta";
import { FieldType } from "../../schema/type";
import { ViewField } from "../../schema/view";
import { CardConfig, createFieldBlock } from "./service";

/***
 * 
 * 每一条记录，显示 item ,row,card
 * 
 */
@url('/data-grid/record')
export class DataGridItemRecord extends Block {
    @prop()
    dataId: string;
    @prop()
    schemaId: string;
    @prop()
    fields: ViewField[] = [];
    @prop()
    cardConfig: CardConfig = {
        auto: false,
        showCover: false,
        coverFieldId: "",
        coverAuto: false,
        showMode: 'default',
        showField: 'none',
        templateProps: {}
    }
    @prop()
    cardSettings: Record<string, any> = {};
    schema: TableSchema;
    dataRow: Record<string, any> = {};
    relationSchemas: TableSchema[] = [];
    relationDatas: Map<string, any[]> = new Map();
    async didMounted() {
        this.schema = await TableSchema.getTableSchema(this.schemaId)
        if (this.schema) {
            await this.loadViewFields();
            await this.loadData();
            await this.loadRelationSchemas();
            await this.loadRelationDatas();
            await this.createElements();
            if (this.view) this.view.forceUpdate();
        }
    }
    async get() {
        return await super.get(undefined, { emptyChilds: true })
    }
    async createElements() {
        this.blocks.childs = [];
        for (let i = 0; i < this.fields.length; i++) {
            var field = this.fields[i];
            if (field) {
                var block = await createFieldBlock(field, this);
                if (block) this.blocks.childs.push(block);
            }
            else {
                console.log(this, this.fields);
            }
        }
    }
    async onUpdateCellValue(viewField: ViewField, value: any) {
        value = util.clone(value);
        this.dataRow[viewField.field.name] = value;
        await this.schema.rowUpdate({
            dataId: this.dataRow.id,
            data: { [viewField.field.name]: value }
        })
    }
    async loadSchema() {
        if (this.schemaId && !this.schema) {
            this.schema = await TableSchema.loadTableSchema(this.schemaId, this.page.ws);
        }
    }
    async loadViewFields() {
        if (this.fields.length == 0) {
            this.fields = this.schema.getViewFields()
        } else {
            if (!this.fields.every(s => s.fieldId || s.type ? true : false)) {
                this.fields = this.schema.getViewFields()
            }
            this.fields.each(f => {
                f.schema = this.schema;
            })
            for (let j = this.fields.length - 1; j >= 0; j--) {
                if (!(this.fields[j].field || this.fields[j].type))
                    this.fields.splice(j, 1);
            }
        }
    }
    async loadRelationSchemas() {
        var tableIds: string[] = [];
        this.fields.each(f => {
            if (f.field?.type == FieldType.relation) {
                if (f.field.config.relationTableId) {
                    tableIds.push(f.field.config.relationTableId);
                }
            }
        });
        if (tableIds.length > 0) {
            this.relationSchemas = await TableSchema.loadListSchema(tableIds, this.page);
        }
    }
    async loadRelationDatas() {
        if (this.relationSchemas.length > 0) {
            var maps: { key: string, ids: string[] }[] = [];
            var row = this.dataRow;
            this.fields.each(f => {
                if (f?.field?.type == FieldType.relation) {
                    var vs = row[f?.field.name];
                    if (!Array.isArray(vs)) vs = [];
                    var ms = maps.find(g => g.key == f?.field.config.relationTableId);
                    if (Array.isArray(ms?.ids)) {
                        vs.each(v => {
                            if (!ms?.ids.includes(v)) ms?.ids.push(v)
                        })
                    }
                    else {
                        maps.push({ key: f?.field.config.relationTableId, ids: vs })
                    }
                }
            })
            await maps.eachAsync(async (vr) => {
                var key = vr.key;
                var v = vr.ids;
                var sea = this.relationSchemas.find(g => g.id == key);
                if (sea) {
                    var rd = await sea.all({ page: 1, filter: { id: { $in: v } } }, this.page.ws);
                    if (rd.ok) {
                        this.relationDatas.set(key, rd.data.list);
                    }
                }
            })
        }
    }
    async loadData() {
        if (this.schema) {
            this.dataRow = await this.schema.rowGet(this.dataId);
        }
    }
    get elementUrl(){
        return getElementUrl(ElementType.SchemaData, this.schema.id, this.dataId)
    }
    get dataLink() {
        return this.page.ws.resolve({ elementUrl: this.elementUrl });
    }
}
@view('/data-grid/record')
export class DataGridItemRecordView extends BlockView<DataGridItemRecord>{
    renderItem() {
        if (this.block.cardConfig.showMode == 'define' && this.block.cardConfig.templateProps.url) {
            var CV = CardFactory.getCardView(this.block.cardConfig.templateProps.url);
            if (CV) return <CV item={this.block} dataGrid={this.block}></CV>
        }
        else if (this.block.cardConfig.showCover) {
            var field = this.block.schema.fields.find(g => g.id == this.block.cardConfig.coverFieldId);
            var imageData;
            if (field) imageData = this.block.dataRow[field.name];
            if (Array.isArray(imageData)) imageData = imageData[0];
            return <div className='sy-data-grid-item sy-data-grid-card'>
                <div className="sy-data-grid-card-cover">
                    {imageData && <img style={{ maxHeight: this.block.cardConfig.coverAuto ? "auto" : 200 }} src={autoImageUrl(imageData.url, 500)} />}
                </div>
                <div className="sy-data-grid-card-items">
                    <ChildsArea childs={this.block.childs}></ChildsArea>
                </div>
            </div>
        }
        return <div className='sy-data-grid-item'><ChildsArea childs={this.block.childs}></ChildsArea> </div>
    }
    renderView() {
        return this.renderItem();
    }
}