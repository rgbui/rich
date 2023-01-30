import { Block } from "../../../../src/block";
import { BlockUrlConstant } from "../../../../src/block/constant";
import { prop, url, view } from "../../../../src/block/factory/observable";
import { BlockView } from "../../../../src/block/view";
import { TableSchema } from "../../schema/meta";
import { DataGridView } from "../base";

@url(BlockUrlConstant.FormView)
export class DataGridForm extends Block {
    @prop()
    schemaId: string;
    schema: TableSchema;
    get schemaView() {
        if (this.schema)
            return this.schema.views.find(g => g.id == this.syncBlockId);
    }
    async loadSchema(this: DataGridView) {
        if (this.schemaId && !this.schema) {
            this.schema = await TableSchema.loadTableSchema(this.schemaId);
        }
    }
}

@view(BlockUrlConstant.FormView)
export class DataGridFormView extends BlockView<DataGridForm>{

}