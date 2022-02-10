import React from "react";
import { ReactNode } from "react";
import { TableSchema } from "../../../blocks/data-grid/schema/meta";
import { FieldType } from "../../../blocks/data-grid/schema/type";
import { EventsComponent } from "../../../component/lib/events.component";
import { Icon } from "../../../component/view/icon";
import { Select } from "../../../component/view/select";
import { PopoverSingleton } from "../../popover/popover";
import { PopoverPosition } from "../../popover/position";

class TableFilterView extends EventsComponent {
    schema: TableSchema;
    text: string;
    url: string;
    filter: any;
    open(options: {
        schema: TableSchema,
        text: string,
        url: string,
        filter?: any;
    }) {
        this.schema = options.schema;
        this.text = options.text;
        this.url = options.url;
        this.filter = options.filter;
        this.forceUpdate()
    }
    getFields() {
        return this.schema.fields.map(fe => {
            return {
                text: fe.text,
                value: fe.id
            }
        })
    }
    getFieldType(field: string) {
        return [{ text: '', value: '' }]
    }
    renderFilter(filter, deep?: number) {
        var items = filter?.items || [];
        var self = this;
        var nameField = this.schema.fields.find(g => g.type == FieldType.title);
        function renderFilterItem(item, index) {
            if (item.logic) return self.renderFilter(item, deep + 1);
            else return <div>
                <Select options={self.getFields()} value={item.field} onChange={e => item.field = e}></Select>
                <Select options={self.getFieldType(item.field)} value={item.operator} onChange={e => item.operator = e} ></Select>
                <div></div>
            </div>
        }
        function addFilter(value: 'item' | 'group') {
            if (!Array.isArray(self.filter)) self.filter = { logic: 'and', items: [] };
            if (value == 'item') {
                self.filter.items.push({ field: nameField.id, operator: 'equal', value: '' })
            }
            else {
                self.filter.items.push({ logic: 'and', items: [{ field: nameField.id, operator: 'equal', value: '' }] })
            }
            self.forceUpdate();
        }
        return <div className="shy-table-filter-view-group">
            {items.map((it, index) => {
                if (index == 0) return <div className="shy-table-filter-view-item" key={index}>
                    <span>条件</span>
                    {renderFilterItem(it, index)}
                    <Icon icon=''></Icon>
                </div>
                else if (index == 1) return <div className="shy-table-filter-view-item" key={index}>
                    <span><Select value={filter.logic}
                        options={[{ text: 'and', value: 'and' }, { text: 'or', value: 'or' }]}
                        onChange={e => { filter.logic = e; }}></Select>
                    </span>
                    {renderFilterItem(it, index)}
                    <Icon icon=''></Icon>
                </div>
                else if (index > 1) return <div className="shy-table-filter-view-item" key={index}>
                    <span>{filter.logic}</span>
                    {renderFilterItem(it, index)}
                    <Icon icon=''></Icon>
                </div>
            })}
            <Select options={this.getFilters()} onChange={e => { addFilter(e) }}>添加筛选条件</Select>
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
            <div className="shy-table-filter-view-head"></div>
            <div className="shy-table-filter-view-content">
                {this.renderFilter(this.filter, 0)}
            </div>
        </div>
    }
}

export async function useTableFilterView(pos: PopoverPosition, options: {
    schema: TableSchema,
    text: string,
    url: string,
    filter?: any[]
}) {
    let popover = await PopoverSingleton(TableFilterView);
    let fv = await popover.open(pos);
    fv.open(options);
    return new Promise((resolve: (data: Record<string, any>) => void, reject) => {
        popover.only('close', () => {
            resolve(fv.filter)
        })
    })
}