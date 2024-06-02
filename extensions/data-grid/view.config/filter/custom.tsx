import { SchemaFilter } from "../../../../blocks/data-grid/schema/filter";
import { TableSchema } from "../../../../blocks/data-grid/schema/meta";
import lodash from "lodash";
import { LinkWs } from "../../../../src/page/declare";
import { PopoverSingleton } from "../../../../component/popover/popover";
import { PopoverPosition } from "../../../../component/popover/position";
import { EventsComponent } from "../../../../component/lib/events.component";
import React from "react";
import { FilterView } from "./view";
import { util } from "../../../../util/util";
export class CustomTableFilterView extends EventsComponent {
    onStore = lodash.debounce(async (filter: SchemaFilter) => {
        this.emit('change', lodash.cloneDeep(filter))
    }, 800);
    onForceStore = async (filter: SchemaFilter) => {
        this.emit('change', lodash.cloneDeep(filter))
        this.forceUpdate();
    }
    open(options: {
        schema: TableSchema,
        formSchema?: TableSchema,
        filter: SchemaFilter,
        ws: LinkWs,
    }) {
        this.schema = options.schema;
        this.formSchema = options.formSchema;
        this.filter = lodash.cloneDeep(options.filter);
        this.ws = options.ws;
        if (!this.filter) this.filter = { id: util.guid(), logic: 'and', items: [] };
        else if (Object.keys(this.filter).length == 0) this.filter = { id: util.guid(), logic: 'and', items: [] };
        this.forceUpdate();
    }
    schema: TableSchema;
    filter: SchemaFilter = { id: util.guid(), logic: 'and', items: [] };
    formSchema?: TableSchema;
    ws: LinkWs;
    render() {
        return <FilterView
            filter={this.filter}
            schema={this.schema}
            formSchema={this.formSchema}
            onInput={e => {
                this.onStore(e)
            }}
            onChange={e => {
                this.onForceStore(e)
            }}
            ws={this.ws}
        ></FilterView>
    }
}

export async function useCustomTableFilter(pos: PopoverPosition,
    option: {
        schema: TableSchema,
        formSchema?: TableSchema,
        filter: SchemaFilter,
        ws: LinkWs,
        onChange(filter: SchemaFilter): void
    }) {
    let popover = await PopoverSingleton(CustomTableFilterView, { mask: true });
    let fv = await popover.open(pos);
    fv.open(option);
    return new Promise((resolve: (data: string | { tableId: string, viewId: string, type: 'view' | 'form', viewUrl?: string }) => void, reject) => {
        fv.only('close', () => {
            popover.close();
            resolve(undefined);
        })
        fv.only('change', (g) => {
            if (typeof option.onChange == 'function') option.onChange(g);
        })
        popover.only('close', () => {
            resolve(undefined);
        })
    })
}