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
    @prop()
    groups: string[];
    @prop()
    aggregate: string[];
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
            var r = await this.schema.statistics({
                page: 1,
                groups: [''],
                aggregate: ['']
            })
            // var r = await this.schema.statisticValue({
            //     filter: this.filter,
            //     indicator: this.indicator
            // });
            // if (r.ok) {
            //     this.statisticValue = r.data.value;
            // }
        }
    }
    async didMounted() {
        await this.loadSchema();
        await this.loadData();
    }
    async renderEcharts(){
        
    }
}
@view('/data-grid/charts')
export class DataGridChartView extends BlockView<DataGridChart>{
    render() {
        return <div className='sy-dg-charts'>

        </div>
    }
}