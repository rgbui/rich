import React from "react";
import { BlockFactory } from "../../../../src/block/factory/block.factory";
import { prop, url, view } from "../../../../src/block/factory/observable";
import { BlockView } from "../../../../src/block/view";
import { ChildsArea } from "../../../../src/block/view/appear";
import { FieldType } from "../../schema/type";
import { DataGridView } from "../base/table";
import { TableStoreBoard } from "../board";
import { TableStoreItem } from "../item";

@url('/data-grid/timeline')
export class TableStoreCalendar extends DataGridView {
    @prop()
    startDate: number = Date.now();
    @prop()
    endDate: number = Date.now();
    @prop()
    mode: 'day' | 'week' | 'year' = 'day';
    dateFieldId: string;
    get dateField() {
        return this.schema.fields.find(g => g.id == this.dateFieldId);
    }
    data: { group: string, list: any[], count: number }[] = [];
    async loadData() {
        if (!this.dateFieldId) {
            this.dateFieldId = this.fields.find(g => g.field.type == FieldType.date)?.field?.id;
        }
        if (this.dateField) {
            if (this.schema) {
                var name = this.dateField.name;
                var r = await this.schema.group({ group: name });
                if (r.data) {
                    r.data.list.forEach(groupR => {

                    })
                    //var keys = r.data.list.map(l => l[name]);
                    //var rl = await this.schema.all({ page: 1, filter: { [name]: { $in: keys } } });
                    //var ops = this.dateField.config.options || [];
                    // this.data = ops.map(op => {
                    //     return {
                    //         group: op.text,
                    //         count: r.data.list.find(g => g[name] == op.text)?.count || 0,
                    //         list: rl.data.list.findAll(g => g[name] == op.text)
                    //     }
                    // });
                    // if (keys.exists(g => g === null)) {
                    //     this.data.push({
                    //         group: null,
                    //         count: r.data.list.find(g => g[name] === null)?.count || 0,
                    //         list: rl.data.list.findAll(g => typeof g[name] == 'undefined')
                    //     })
                    // };
                    console.log(this.data);
                }
            }
        }
    }
    async createItem() {
        this.blocks.childs = [];
        for (let i = 0; i < this.data.length; i++) {
            var dg = this.data[i];
            await dg.list.eachAsync(async row => {
                var rowBlock: TableStoreItem = await BlockFactory.createBlock('/data-grid/item', this.page, { mark: dg.group, dataRow: row }, this) as TableStoreItem;
                this.blocks.childs.push(rowBlock);
                await rowBlock.createElements();
            })
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
@view('/data-grid/timeline')
export class TableStoreCalendarView extends BlockView<TableStoreCalendar>{
    renderGroup(dg: ArrayOf<TableStoreBoard['data']>, index: number) {
        var cs = this.block.childs.findAll(g => g.mark == dg.group);
        return <div className="sy-data-grid-board-group" key={index}>
            <div className="sy-data-grid-board-group-head"><span>{dg.group}</span><label>{dg.count}</label></div>
            <div className="sy-data-grid-board-group-childs">
                <ChildsArea childs={cs}></ChildsArea>
            </div>
        </div>
    }
    render() {
        return <div className='sy-data-grid-timeline'>
            {this.block.data.map((dg, i) => {
                return this.renderGroup(dg, i)
            })}
        </div>
    }
}