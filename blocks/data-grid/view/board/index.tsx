import { prop, url, view } from "../../../../src/block/factory/observable";
import { BlockView } from "../../../../src/block/view";
import React from 'react';
import { DataGridView } from "../base";
import { FieldType } from "../../schema/type";
import { BlockFactory } from "../../../../src/block/factory/block.factory";
import { TableStoreItem } from "../item";
import { ChildsArea } from "../../../../src/block/view/appear";
import './style.less';
import { DataGridTool } from "../components/tool";
import { CollectTableSvg } from "../../../../component/svgs";
import { Icon } from "../../../../component/view/icon";
import { lst } from "../../../../i18n/store";
import { S } from "../../../../i18n/view";

@url('/data-grid/board')
export class TableStoreBoard extends DataGridView {
    @prop()
    groupFieldId: string;
    get groupField() {
        return this.schema.fields.find(g => g.id == this.groupFieldId);
    }
    dataGroups: { group: string, color: string, value: string, count: number }[] = [];
    async loadData() {
        if (!this.groupFieldId) {
            this.groupFieldId = this.fields.find(g => g.field?.type == FieldType.option || g.field?.type == FieldType.options)?.field?.id;
        }
        if (this.groupField) {
            if (this.schema) {
                var name = this.groupField.name;
                var r = await this.schema.group({ group: name },this.page);
                if (r.data) {
                    var keys = r.data.list.map(l => l[name]);
                    var rl = await this.schema.all({ page: 1, filter: { [name]: { $in: keys } } },this.page);
                    this.data = rl.data.list;
                    if (this.groupField.type == FieldType.options || this.groupField.type == FieldType.option) {
                        var ops = this.groupField.config.options || [];
                        this.dataGroups = ops.map(op => {
                            return {
                                group: op.text,
                                color: op.color,
                                value: op.value,
                                count: r.data.list.find(g => g[name] == op.value)?.count || 0
                            }
                        });
                        if (keys.exists(g => g === null)) {
                            this.dataGroups.push({
                                group: null,
                                value: null,
                                color: null,
                                count: r.data.list.find(g => g[name] === null)?.count || 0
                            })
                        };
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
                else if (x[name] == dg.value) return true;
                else return false;
            });
            await list.eachAsync(async row => {
                var rowBlock: TableStoreItem = await BlockFactory.createBlock('/data-grid/item', this.page, { mark: dg.group, dataId: row.id }, this) as TableStoreItem;
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
            <div className="sy-data-grid-board-group-head"><span style={{ backgroundColor: dg.color || undefined }}>{dg.group || lst('未定义')}</span><label>{dg.count}</label></div>
            <div className="sy-data-grid-board-group-childs">
                <ChildsArea childs={cs}></ChildsArea>
            </div>
        </div>
    }
    renderCreateTable() {
        return !this.block.schema && this.block.isCanEdit() && <div className="item-hover item-hover-focus cursor round flex" onClick={e => this.block.onCreateTableSchema()}>
            <span className="size-24 flex-center remark"><Icon size={16} icon={CollectTableSvg}></Icon></span>
            <span className="remark"><S>创建数据表格</S></span>
        </div>
    }
    renderView()  {
        return <div className='sy-data-grid-board' onMouseEnter={e => this.block.onOver(true)}
            onMouseLeave={e => this.block.onOver(false)}>
            <DataGridTool block={this.block}></DataGridTool>
            <div className="sy-data-grid-board-list">
                {this.block.dataGroups.map((dg, i) => {
                    return this.renderGroup(dg, i)
                })}
            </div>
            {this.renderCreateTable()}
        </div>
    }
}