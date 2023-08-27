import React from "react";
import { Block } from "../../../../src/block";
import { prop, url, view } from "../../../../src/block/factory/observable";
import { BlockView } from "../../../../src/block/view";
import { TableSchema } from "../../schema/meta";
import { FieldType } from "../../schema/type";
import { DataGridTurns } from "../../turn";


@url('/data-grid/charts')
export class DataGridChart extends Block {
    @prop()
    schemaId: string;
    schema: TableSchema;
    @prop()
    groups: string[];
    @prop()
    aggregate: Record<string, any>;
    async onGetTurnUrls() {
        return DataGridTurns.urls
    }
    async getWillTurnData(url: string) {
        return await DataGridTurns.turn(this, url);
    }
    async loadSchema() {
        if (this.schemaId && !this.schema) {
            this.schema = await TableSchema.loadTableSchema(this.schemaId, this.page.ws)
        }
    }
    data: any[] = [];
    async loadData() {
        if (this.schema) {
            if (!this.groups) {
                this.groups = [
                    this.schema.fields.find(g => g.type == FieldType.option).id
                ];
            }
            var r = await this.schema.statistics({
                page: 1,
                groups: this.groups.toArray(g => {
                    var f = this.schema.fields.find(x => x.id == g);
                    if (f) return f.name
                }),
                aggregate: this.aggregate
            }, this.page.ws)
            if (r.ok) {
                this.data = r.data.list;
                console.log(r.data, 'rd');
            }
        }
    }
    async didMounted() {
        await this.loadSchema();
        await this.loadData();
        await this.renderEcharts();
        this.forceUpdate();
    }
    async renderEcharts() {
        // var ele = this.el?.querySelector('.sy-dg-echarts-view') as HTMLElement;
        // if (ele) {
        //     var echarts = await loadEchart();
        //     var myChart = echarts.init(ele);
        //     var option;
        //     option = {
        //         xAxis: {
        //             type: 'category',
        //             data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
        //         },
        //         yAxis: {
        //             type: 'value'
        //         },
        //         series: [
        //             {
        //                 data: [150, 230, 224, 218, 135, 147, 260],
        //                 type: 'line'
        //             }
        //         ]
        //     };
        //     option && myChart.setOption(option);
        // }
    }
}
@view('/data-grid/charts')
export class DataGridChartView extends BlockView<DataGridChart>{
    renderView()  {
        return <div className='sy-dg-charts'>
            <div className="sy-dg-echarts-view" style={{ width: 300, height: 200 }}></div>
        </div>
    }
}