import { prop, url, view } from "../../../../src/block/factory/observable";
import { BlockView } from "../../../../src/block/view";
import React from 'react';
import { DataGridView } from "../base/table";
import { FieldType } from "../../schema/type";
import { BlockFactory } from "../../../../src/block/factory/block.factory";
import { TableStoreItem } from "../item";
import { ChildsArea } from "../../../../src/block/view/appear";
import './style.less';
@url('/data-grid/board')
export class TableStoreBoard extends DataGridView {
    @prop()
    groupFieldId: string;
    get groupField() {
        return this.schema.fields.find(g => g.id == this.groupFieldId);
    }
    dataGroups: { group: string, count: number }[] = [];
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
                    this.data = rl.data.list;
                    if (this.groupField.type == FieldType.options || this.groupField.type == FieldType.option) {
                        var ops = this.groupField.config.options || [];
                        this.dataGroups = ops.map(op => {
                            return {
                                group: op.text,
                                count: r.data.list.find(g => g[name] == op.text)?.count || 0
                            }
                        });
                        if (keys.exists(g => g === null)) {
                            this.dataGroups.push({
                                group: null,
                                count: r.data.list.find(g => g[name] === null)?.count || 0
                            })
                        };
                        console.log(this.dataGroups);
                    }
                }
            }
        }
    }
    async createItem() {
        this.blocks.childs = [];
        var name = this.groupField.name;
        for (let i = 0; i < this.dataGroups.length; i++) {
            var dg = this.dataGroups[i];
            var list = this.data.findAll(x => {
                if (dg.group === null && typeof x[name] == 'undefined') return true;
                else if (x[name] == dg.group) return true;
                else return false;
            });
            await list.eachAsync(async row => {
                var rowBlock: TableStoreItem = await BlockFactory.createBlock('/data-grid/item', this.page, { mark: dg.group, dataRow: row }, this) as TableStoreItem;
                this.blocks.childs.push(rowBlock);
                await rowBlock.createElements();
            })
        }
    }
}
@view('/data-grid/board')
export class TableStoreBoardView extends BlockView<TableStoreBoard>{
    renderGroup(dg: ArrayOf<TableStoreBoard['dataGroups']>, index: number) {
        var cs = this.block.childs.findAll(g => g.mark == dg.group);
        return <div className="sy-data-grid-board-group" key={index}>
            <div className="sy-data-grid-board-group-head"><span>{dg.group || '未定义'}</span><label>{dg.count}</label></div>
            <div className="sy-data-grid-board-group-childs">
                <ChildsArea childs={cs}></ChildsArea>
            </div>
        </div>
    }
    render() {
        return <div className='sy-data-grid-board'>
            <div className="sy-data-grid-board-list">
                {this.block.dataGroups.map((dg, i) => {
                    return this.renderGroup(dg, i)
                })}
            </div>
        </div>
    }
}