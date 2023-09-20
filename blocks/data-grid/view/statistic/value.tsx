import React from "react";
import { prop, url, view } from "../../../../src/block/factory/observable";
import { BlockView } from "../../../../src/block/view";
import { TableSchema } from "../../schema/meta";
import { DataGridTurns } from "../../turn";
import { DataGridView } from "../base";

@url('/data-grid/statistic/value')
export class TableStatisticValue extends DataGridView {
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
    statisticConfig: {
        title?: string,
        targetValue?: number,
        fieldId?: string,
        indicator?: string,
        color?: string
    } = {
            title: '',
            targetValue: null,
            fieldId: '',
            indicator: '',
            color: 'red'
        }
    // @prop()
    // indicator: string;
    async loadSchema() {
        if (this.schemaId && !this.schema) {
            this.schema = await TableSchema.loadTableSchema(this.schemaId, this.page.ws)
        }
    }
    statisticValue: number;
    statisticTotal: number;
    async loadData() {
        if (this.schema) {
            var field = this.schema.fields.find(c => c.id == this.statisticConfig.fieldId)
            var r = await this.schema.statisticValue({
                filter: this.filter,
                fieldName: field.name,
                indicator: this.statisticConfig.indicator
            }, this.page.ws);
            if (r.ok) {
                this.statisticValue = r.data.value;
                this.statisticTotal = r.data.total;
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
    renderView() {
        return <div className="sy-dg-statistic-value">
            <div>
                <div style={{ fontSize: 40 }}>{this.block.statisticConfig?.title}</div>
                <div style={{ fontSize: 40, color: this.block.statisticConfig.color }}>{this.block.statisticValue}</div>
                {this.block.statisticConfig?.targetValue && <div className="remark f-14">
                    <span>{this.block.statisticConfig.targetValue}</span>
                    <span>{this.block.statisticValue / this.block.statisticConfig.targetValue}%</span>
                </div>}
            </div>
        </div>
    }
}