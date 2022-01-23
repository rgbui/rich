import { Block } from "../../../../src/block";
import { prop } from "../../../../src/block/factory/observable";
import { Exception, ExceptionType } from "../../../../src/error/exception";
import { PageDirective } from "../../../../src/page/directive";
import { TableSchema } from "../../schema/meta";
export class TableStoreBase extends Block {
    @prop()
    schemaId: string;
    schema: TableSchema;
    async loadSchema() {
        if (this.schemaId) {
            var schemaData = await this.page.emitAsync(PageDirective.schemaLoad, this.schemaId);
            this.schema = new TableSchema(schemaData);
        }
        else {
            this.page.onError(new Exception(ExceptionType.tableSchemaNotEmpty, '表格schema不为空'))
        }
    }
}