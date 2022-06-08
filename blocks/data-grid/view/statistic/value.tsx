import React from "react";
import { channel } from "../../../../net/channel";
import { Block } from "../../../../src/block";
import { prop, url, view } from "../../../../src/block/factory/observable";
import { BlockView } from "../../../../src/block/view";
import { TableSchema } from "../../schema/meta";
import { DataGridTurns } from "../../turn";
@url('/data-grid/statistic/value')
export class TableStatisticValue extends Block {
    @prop()
    schemaId: string;
    schema: TableSchema;
    async onGetTurnUrls() {
        return DataGridTurns.urls
    }
    async getWillTurnData(url: string) {
        return await DataGridTurns.turn(this, url);
    }
    @prop()
    filter: Record<string, any>;
    @prop()
    indicator: string;
    async loadSchema() {
        if (this.schemaId && !this.schema) {
            this.schema=await TableSchema.loadTableSchema(this.schemaId)
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
    async didMounted() {
        await this.loadSchema();
        await this.loadData();
        this.forceUpdate();
    }
}
@view('/data-grid/statistic/value')
export class TableStatisticValueView extends BlockView<TableStatisticValue>{
    render() {
        return <div className="sy-dg-statistic-value">
            <div style={{ fontSize: 40 }}>统计值  {this.block.statisticValue}</div>
        </div>
    }
}
