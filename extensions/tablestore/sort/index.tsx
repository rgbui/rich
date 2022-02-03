import React, { ReactNode } from "react";
import { TableSchema } from "../../../blocks/data-grid/schema/meta";
import { EventsComponent } from "../../../component/lib/events.component";
import { Button } from "../../../component/view/button";
import { Select } from "../../../component/view/select";
import { PopoverSingleton } from "../../popover/popover";
import { PopoverPosition } from "../../popover/position";

import closeTick from "../../../src/assert/svg/closeTick.svg";
import { Icon } from "../../../component/view/icon";
import { Remark } from "../../../component/view/text";
class TableSortView extends EventsComponent {
    schema: TableSchema;
    text: string;
    url: string;
    sorts: any;
    open(options: {
        schema: TableSchema,
        text: string,
        url: string,
        sorts?: any;
    }) {
        this.schema = options.schema;
        this.text = options.text;
        this.url = options.url;
        this.sorts = options.sorts;
        this.forceUpdate()
    }
    getFields() {
        return this.schema.fields.map(fe => {
            return {
                text: fe.text,
                value: fe.id
                // value:fe.value
            }
        })
    }
    render(): ReactNode {
        var hasSorts = Array.isArray(this.sorts) && this.sorts.length > 0;
        return <div className="shy-table-sorts-view">
            <div className="shy-table-sorts-view-head"></div>
            <div className="shy-table-sorts-view-content">
                {hasSorts && this.sorts.map((so, i) => {
                    return <div key={i}>
                        <Select options={this.getFields()} onChange={e => { }}></Select>
                        <Select options={[
                            { text: '降序', value: -1 },
                            { text: '升序', value: 1 }
                        ]}>
                        </Select>
                        <Icon icon={closeTick}></Icon>
                    </div>
                })}
                {hasSorts && <Button>添加排序</Button>}
                {!hasSorts && <Remark>
                </Remark>}
            </div>
            {!hasSorts && <div className="shy-table-sorts-view-footer">
                <Button>添加排序</Button>
            </div>}
        </div>
    }
}

export async function useTableFilterView(pos: PopoverPosition, options: {
    schema: TableSchema,
    text: string,
    url: string,
    sorts?: Record<string, any>
}) {
    let popover = await PopoverSingleton(TableSortView);
    let fv = await popover.open(pos);
    fv.open(options);
    return new Promise((resolve: (data: Record<string, any>) => void, reject) => {

    })
}