import React from "react";
import { ReactNode } from "react";
import { SchemaFilter } from "../../../blocks/data-grid/schema/declare";
import { TableSchema } from "../../../blocks/data-grid/schema/meta";
import { FieldType } from "../../../blocks/data-grid/schema/type";
import { getSchemaViewIcon } from "../../../blocks/data-grid/schema/util";
import { DataGridView } from "../../../blocks/data-grid/view/base/table";
import { EventsComponent } from "../../../component/lib/events.component";
import { Divider } from "../../../component/view/grid";
import { Icon } from "../../../component/view/icon";
import { Select } from "../../../component/view/select";
import { PopoverSingleton } from "../../popover/popover";
import { PopoverPosition } from "../../popover/position";
// import PlusSvg from "../../../src/assert/svg/plus.svg";
// import Dots from "../../../src/assert/svg/dots.svg";
// import TrashSvg from "../../../src/assert/svg/trash.svg";
import "./style.less";
import { Input } from "../../../component/view/input";
import { useSelectMenuItem } from "../../../component/view/menu";
import { Point } from "../../../src/common/vector/point";
import { util } from "../../../util/util";
import { DotsSvg, LinkSvg, PlusSvg, TrashSvg } from "../../../component/svgs";

class TableFilterView extends EventsComponent {
    schema: TableSchema;
    filter: SchemaFilter;
    block: DataGridView;
    open(options: {
        schema: TableSchema,
        block: DataGridView,
        filter?: SchemaFilter;
    }) {
        this.schema = options.schema;
        this.filter = options.filter;
        if (!this.filter) {
            this.filter = {
                logic: 'and',
                items: []
            }
        }
        if (!this.filter.items) this.filter.items = [];
        this.block = options.block;
        this.forceUpdate()
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
    renderFilter(filter, deep?: number) {
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
            // if (!Array.isArray(filter)) filter = { logic: 'and', items: [] };
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
            self.forceUpdate();
        }
        async function clickProperty(event: React.MouseEvent, filter) {
            var menus = [
                { text: '复制', name: 'copy', icon:LinkSvg },
                { text: '删除', name: 'delete', icon: TrashSvg }
            ]
            var um = await useSelectMenuItem({ roundPoint: Point.from(event) }, menus);
            if (um) {
                if (um.item.name == 'delete') {
                    items.remove(g => g == filter);
                    self.forceUpdate();
                }
                else if (um.item.name == 'copy') {
                    var at = items.findIndex(g => g == filter);
                    if (at > -1) {
                        var newItem = util.clone(filter);
                        if (newItem) {
                            items.splice(at + 1, 0, newItem);
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
                        display: 'inline-flex',
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
        return <div className="shy-table-filter-view">
            {this.schema && <div className="shy-table-filter-view-head">
                <span>设置过滤条件</span>
                <Icon style={{ marginLeft: 5 }} size={14} icon={getSchemaViewIcon(this.block.url)}></Icon>
                <span>{this.block.schemaView?.text}</span>
            </div>}
            <div className="shy-table-filter-view-content">
                {this.schema && this.renderFilter(this.filter, 0)}
            </div>
        </div>
    }
}

export async function useTableFilterView(pos: PopoverPosition, options: {
    schema: TableSchema,
    block: DataGridView,
    filter?: SchemaFilter
}) {
    let popover = await PopoverSingleton(TableFilterView, { mask: true });
    let fv = await popover.open(pos);
    fv.open(options);
    return new Promise((resolve: (data: SchemaFilter) => void, reject) => {
        popover.only('close', () => {
            resolve(fv.filter)
        })
    })
}