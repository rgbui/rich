import { prop, url, view } from "../../../../src/block/factory/observable";
import { BlockView } from "../../../../src/block/view";
import React from 'react';
import { DataGridBase } from "../base/table";
import { FieldType } from "../../schema/type";
import { BlockFactory } from "../../../../src/block/factory/block.factory";
import { TableStoreItem } from "../item";
import { ChildsArea } from "../../../../src/block/view/appear";
import './style.less';
@url('/data-grid/board')
export class TableStoreBoard extends DataGridBase {
    @prop()
    groupFieldId: string;
    get groupField() {
        return this.schema.fields.find(g => g.id == this.groupFieldId);
    }
    blocks = { childs: [] };
    data: { group: string, list: any[], count: number }[] = [];
    async loadData() {
        if (!this.groupFieldId) {
            this.groupFieldId = this.fields.find(g => g.field.type == FieldType.option || g.field.type == FieldType.options)?.field?.id;
        }
        if (this.groupField) {
            if (this.schema) {
                var name = this.groupField.name;
                var r = await this.schema.group({ group: name });
                if (r.data) {
                    var keys = r.data.list.map(l => l[name]);
                    var rl = await this.schema.all({ page: 1, filter: { [name]: { $in: keys } } });
                    if (this.groupField.type == FieldType.options || this.groupField.type == FieldType.option) {
                        var ops = this.groupField.config.options || [];
                        this.data = ops.map(op => {
                            return {
                                group: op.text,
                                count: r.data.list.find(g => g[name] == op.text)?.count || 0,
                                list: rl.data.list.findAll(g => g[name] == op.text)
                            }
                        });
                        if (keys.exists(g => g === null)) {
                            this.data.push({
                                group: null,
                                count: r.data.list.find(g => g[name] === null)?.count || 0,
                                list: rl.data.list.findAll(g => typeof g[name] == 'undefined')
                            })
                        };
                        console.log(this.data);
                    }
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
@view('/data-grid/board')
export class TableStoreBoardView extends BlockView<TableStoreBoard>{
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
        return <div className='sy-data-grid-board'>
            {this.block.data.map((dg, i) => {
                return this.renderGroup(dg, i)
            })}
        </div>
    }
}