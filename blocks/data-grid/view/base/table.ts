import { channel } from "../../../../net/channel";
import { Block } from "../../../../src/block";
import { prop } from "../../../../src/block/factory/observable";
import { Exception, ExceptionType } from "../../../../src/error/exception";
import { TableSchema } from "../../schema/meta";
import { ViewField } from "../../schema/view";

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
}