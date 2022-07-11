import React from "react";
import { ReactNode } from "react";
import { FieldType } from "../../../../blocks/data-grid/schema/type";
import { DataGridView } from "../../../../blocks/data-grid/view/base";
import { EventsComponent } from "../../../../component/lib/events.component";
import { Divider } from "../../../../component/view/grid";
import { Icon } from "../../../../component/view/icon";
import { Select } from "../../../../component/view/select";
import "./style.less";
import { Input } from "../../../../component/view/input";
import { useSelectMenuItem } from "../../../../component/view/menu";
import { Point } from "../../../../src/common/vector/point";
import { util } from "../../../../util/util";
import { DotsSvg, LinkSvg, PlusSvg, TrashSvg } from "../../../../component/svgs";
import lodash from "lodash";
import { SchemaFilter } from "../../../../blocks/data-grid/schema/declare";

export class TableFilterView extends EventsComponent {
    get schema() {
        return this.block?.schema;
    }
    block: DataGridView;
    oldFilters: SchemaFilter;
    onOpen(block: DataGridView) {
        this.block = block;
        this.oldFilters = lodash.cloneDeep(this.block.filter);
        this.forceUpdate();
    }
    getFields() {
        var fs = this.schema.fields.findAll(g => g.text ? true : false).map(fe => {
            return {
                text: fe.text,
                value: fe.id
            }
        });
        return fs;
    }
    getFieldType(field: string) {
        return [
            { text: '等于', value: '$eq' },
            { text: '不等于', value: '$ne' },
            { text: '包含', value: '$contain' },
            { text: '不包含', value: '$notContain' },
            { text: '开头为', value: '$startWidth' },
            { text: '结尾为', value: '$endWidth' },
            { text: '为空', value: '$isNull' },
            { text: '不为空', value: '$isNotNull' },
        ]
    }
    onStore = lodash.debounce(async () => {
        this.block.onManualUpdateProps({ filter: this.oldFilters }, { filter: this.block.filter })
    }, 800);
    renderFilter(filter, deep?: number) {
        if (!this.block) return <></>;
        var items = filter?.items;
        var self = this;
        var nameField = this.schema.fields.find(g => g.type == FieldType.title);
        if (!nameField) nameField = this.schema.fields.find(g => g.text ? true : false);
        function renderFilterItem(item, index) {
            if (item.logic) return self.renderFilter(item, deep + 1);
            else return <div className="shy-table-filter-view-item-content">
                <Select border style={{ width: 100 }} options={self.getFields()} value={item.field} onChange={e => { item.field = e; self.forceUpdate() }}></Select>
                <Select border style={{ width: 100 }} options={self.getFieldType(item.field)} value={item.operator} onChange={e => { item.operator = e; self.forceUpdate() }} ></Select>
                <Input style={{ width: 150 }} value={item.value} onChange={e => item.value = e}></Input>
            </div>
        }
        function addFilter(value: 'item' | 'group') {
            if (value == 'item') {
                filter.items.push({
                    field: nameField.id,
                    operator: '$eq',
                    value: ''
                })
            }
            else {
                filter.items.push({
                    logic: 'and',
                    items: [{ field: nameField.id, operator: '$eq', value: '' }]
                })
            }
            self.onStore();
            self.forceUpdate();
        }
        async function clickProperty(event: React.MouseEvent, filter) {
            var menus = [
                { text: '复制', name: 'copy', icon: LinkSvg },
                { text: '删除', name: 'delete', icon: TrashSvg }
            ]
            var um = await useSelectMenuItem({ roundPoint: Point.from(event) }, menus);
            if (um) {
                if (um.item.name == 'delete') {
                    items.remove(g => g == filter);
                    self.onStore()
                    self.forceUpdate();
                }
                else if (um.item.name == 'copy') {
                    var at = items.findIndex(g => g == filter);
                    if (at > -1) {
                        var newItem = util.clone(filter);
                        if (newItem) {
                            items.splice(at + 1, 0, newItem);
                            self.onStore()
                            self.forceUpdate()
                        }
                    }
                }
            }
        }
        return <div className="shy-table-filter-view-group">
            {items.map((it, index) => {
                if (index == 0) return <div className="shy-table-filter-view-item" key={index}>
                    <span style={{ display: 'inline-block', height: 32, lineHeight: '32px' }}>条件</span>
                    {renderFilterItem(it, index)}
                    <Icon style={{ padding: 5 }} mousedown={e => clickProperty(e, it)} icon={DotsSvg} wrapper></Icon>
                </div>
                else if (index == 1) return <div className="shy-table-filter-view-item" key={index}>
                    <span><Select value={filter.logic}
                        options={[
                            { text: 'and', value: 'and' },
                            { text: 'or', value: 'or' }
                        ]}
                        onChange={e => {
                            filter.logic = e;
                            self.onStore();
                            self.forceUpdate();
                        }}></Select>
                    </span>
                    {renderFilterItem(it, index)}
                    <Icon style={{ padding: 5 }} mousedown={e => clickProperty(e, it)} icon={DotsSvg} wrapper></Icon>
                </div>
                else if (index > 1) return <div className="shy-table-filter-view-item" key={index}>
                    <span>{filter.logic}</span>
                    {renderFilterItem(it, index)}
                    <Icon style={{ padding: 5 }} mousedown={e => clickProperty(e, it)} icon={DotsSvg} wrapper></Icon>
                </div>
            })}
            {deep == 0 && <Divider></Divider>}
            <div className="shy-table-filter-view-group-footer">
                <Select options={this.getFilters()} onChange={e => { addFilter(e) }}><a
                    style={{
                        fontSize: 14,
                        display: 'flex',
                        justifyContent: 'flex-start',
                        alignItems: 'center'
                    }}><Icon size={14} icon={PlusSvg}></Icon>添加筛选条件</a></Select>
            </div>
        </div>
    }
    private getFilters() {
        return [
            { text: '添加条件项', value: 'item' },
            { text: '添加条件组', value: 'group' }
        ]
    }
    render(): ReactNode {
        if (!this.block) return <></>;
        if (!Array.isArray(this.block.filter)) {
            this.block.filter = { logic: 'and', items: [] };
        }
        return <div className="shy-table-filter-view">
            <div className="shy-table-filter-view-content">
                {this.schema && this.renderFilter(this.block.filter, 0)}
            </div>
        </div>
    }
}