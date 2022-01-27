import { channel } from "../../../../net/channel";
import { Block } from "../../../../src/block";
import { BlockFactory } from "../../../../src/block/factory/block.factory";
import { prop } from "../../../../src/block/factory/observable";
import { Exception, ExceptionType } from "../../../../src/error/exception";
import { TableSchema } from "../../schema/meta";
import { ViewField } from "../../schema/view";
import { TableStoreTurns } from "../../turn";
import { TableStoreItem } from "../item";

export class TableStoreBase extends Block {
    @prop()
    fields: ViewField[] = [];
    @prop()
    schemaId: string;
    schema: TableSchema;
    async loadSchema() {
        if (this.schemaId) {
            var r = await channel.get('/schema/query', { id: this.schemaId });
            if (r.ok) {
                this.schema = new TableSchema(r.data.schema);
            }
        }
        else {
            this.page.onError(new Exception(ExceptionType.tableSchemaNotEmpty, '表格schema不为空'))
        }
    }
    async loadViewFields() {
        var vfs = this.schema.getViewFields();
        this.fields = vfs.map(vf => {
            return new ViewField(this.schema, vf);
        })
    }
    async onGetTurnUrls() {
        return TableStoreTurns.urls
    }
    async getWillTurnData(url: string) {
        return await TableStoreTurns.turn(this, url);
    }
    data: any;
    isLoadData: boolean = false;
    index: number = 1;
    size: number = 50;
    total: number = 0;
    async loadData() {
        if (this.schema) {
            var r = await this.schema.list({ page: this.index, size: this.size });
            if (r.data) {
                this.data = Array.isArray(r.data.list) ? r.data.list : [];
                this.total = r.data?.total || 0;
            }
        }
    }
    async createItem() {
        this.blocks.childs = [];
        for (let i = 0; i < this.data.length; i++) {
            var row = this.data[i];
            var rowBlock: TableStoreItem = await BlockFactory.createBlock('/data-grid/item', this.page, { mark: i, dataRow: row }, this) as TableStoreItem;
            this.blocks.childs.push(rowBlock);
            await rowBlock.createElements();
        }
    }
    async didMounted() {
        await this.loadSchema();
        await this.loadViewFields();
        await this.loadData();
        await this.createItem();
        this.view.forceUpdate();
    }
}