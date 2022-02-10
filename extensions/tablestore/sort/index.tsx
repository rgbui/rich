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
            }
        })
    }
    render(): ReactNode {
        var self = this;
        function addSort() {
            var f = self.schema.fields.find(g => !self.sorts.some(s => s.field == g.id));
            if (!f) f = self.schema.fields.first();
            self.sorts.push({ field: f.id, sort: 1 });
            self.forceUpdate()
        }
        function removeSort(at: number) {
            self.sorts.splice(at, 1);
            self.forceUpdate();
        }
        var hasSorts = Array.isArray(this.sorts) && this.sorts.length > 0;
        return <div className="shy-table-sorts-view">
            <div className="shy-table-sorts-view-head"></div>
            <div className="shy-table-sorts-view-content">
                {hasSorts && this.sorts.map((so, i) => {
                    return <div key={i}>
                        <Select options={this.getFields()} onChange={e => { so.field = e; self.forceUpdate() }}></Select>
                        <Select options={[
                            { text: '降序', value: -1 },
                            { text: '升序', value: 1 }
                        ]} onChange={e => { so.sort = e; self.forceUpdate() }}>
                        </Select>
                        <Icon icon={closeTick} click={e => removeSort(i)}></Icon>
                    </div>
                })}
                {hasSorts && <Button onClick={e => addSort()}>添加排序</Button>}
                {!hasSorts && <Remark>
                </Remark>}
            </div>
            {!hasSorts && <div className="shy-table-sorts-view-footer">
                <Button onClick={e => addSort()}>添加排序</Button>
            </div>}
        </div>
    }
}

export async function useTableSortView(pos: PopoverPosition, options: {
    schema: TableSchema,
    text: string,
    url: string,
    sorts?: { field: string, sort: number }[]
}) {
    let popover = await PopoverSingleton(TableSortView);
    let fv = await popover.open(pos);
    fv.open(options);
    return new Promise((resolve:(sorts: { field: string, sort: number }[]) => void, reject) =>{
        popover.only('close', () => {
            resolve(fv.sorts)
        })
    })
}