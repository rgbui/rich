import React from "react";
import { channel } from "../../../../net/channel";
import { Block } from "../../../../src/block";
import { prop, url, view } from "../../../../src/block/factory/observable";
import { BlockView } from "../../../../src/block/view";
import { TableSchema } from "../../schema/meta";

@url('/data-grid/charts')
export class DataGridChart extends Block {
    @prop()
    schemaId: string;
    schema: TableSchema;
    async loadSchema() {
        if (this.schemaId && !this.schema) {
            var r = await channel.get('/schema/query', { id: this.schemaId });
            if (r.ok) {
                this.schema = new TableSchema(r.data.schema);
            }
        }
    }
    async loadData() {
        if (this.schema) {
            // var r = await this.schema.statisticValue({
            //     filter: this.filter,
            //     indicator: this.indicator
            // });
            // if (r.ok) {
            //     this.statisticValue = r.data.value;
            // }
        }
    }
}

@view('/data-grid/charts')
export class DataGridChartView extends BlockView<DataGridChart>{
    render() {
        return <div className='sy-dg-charts'>

        </div>
    }
}