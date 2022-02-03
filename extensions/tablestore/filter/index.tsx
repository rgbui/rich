import React from "react";
import { ReactNode } from "react";
import { TableSchema } from "../../../blocks/data-grid/schema/meta";
import { EventsComponent } from "../../../component/lib/events.component";
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
    renderFilter() {
        return <div className="shy-table-filter-item">

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

            </div>
            <div className="shy-table-filter-view-footer">
                <Select options={this.getFilters()} onChange={e => { }} >添加筛选条件</Select>
            </div>
        </div>
    }
}

export async function useTableFilterView(pos: PopoverPosition, options: {
    schema: TableSchema,
    text: string,
    url: string,
    filter?: Record<string, any>
}) {
    let popover = await PopoverSingleton(TableFilterView);
    let fv = await popover.open(pos);
    fv.open(options);
    return new Promise((resolve: (data: Record<string, any>) => void, reject) => {

    })
}