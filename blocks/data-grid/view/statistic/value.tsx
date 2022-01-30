import React from "react";
import { channel } from "../../../../net/channel";
import { Block } from "../../../../src/block";
import { prop, url, view } from "../../../../src/block/factory/observable";
import { BlockView } from "../../../../src/block/view";
import { TableSchema } from "../../schema/meta";
@url('/data-grid/statistic/value')
export class TableStatisticValue extends Block {
    @prop()
    schemaId: string;
    schema: TableSchema;
    @prop()
    filter: Record<string, any> = {};
    @prop()
    indicator: string;
    async loadSchema() {
        if (this.schemaId && !this.schema) {
            var r = await channel.get('/schema/query', { id: this.schemaId });
            if (r.ok) {
                this.schema = new TableSchema(r.data.schema);
            }
        }
    }
    statisticValue: number;
    async loadData() {
        if (this.schema) {
            var r = await this.schema.statisticValue({
                filter: this.filter,
                indicator: this.indicator
            });
            if (r.ok) {
                this.statisticValue = r.data.value;
            }
        }
    }
}
@view('/data-grid/statistic/value')
export class TableStatisticValueView extends BlockView<TableStatisticValue>{
    render() {
        return <span className="sy-dg-statistic-value">
            {this.block.statisticValue}
        </span>
    }
}
