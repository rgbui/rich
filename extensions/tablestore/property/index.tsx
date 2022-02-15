import React from "react";
import { ReactNode } from "react";
import { TableSchema } from "../../../blocks/data-grid/schema/meta";
import { DataGridView } from "../../../blocks/data-grid/view/base/table";
import { EventsComponent } from "../../../component/lib/events.component";
import { PopoverSingleton } from "../../popover/popover";
import { PopoverPosition } from "../../popover/position";

class TablePropertyView extends EventsComponent {
    schema: TableSchema;
    open(
        options: {
            schema: TableSchema,
            gridView: DataGridView
        }) {
        this.schema = options.schema;
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
        return <div className="shy-table-property-view">

        </div>
    }
}

export async function useTablePropertyView(pos: PopoverPosition,
    options: {
        schema: TableSchema,
        gridView: DataGridView
    }) {
    let popover = await PopoverSingleton(TablePropertyView);
    let fv = await popover.open(pos);
    fv.open(options);
    return new Promise((resolve: (config: Record<string, any>) => void, reject) => {
        popover.only('close', () => {
            resolve({})
        })
    })
}