import React from "react";
import { DataGridView } from "../../../../blocks/data-grid/view/base";
import { EventsComponent } from "../../../../component/lib/events.component";
import lodash from "lodash";
import { SchemaFilter } from "../../../../blocks/data-grid/schema/filter";
import { FilterView } from "./view";
import { util } from "../../../../util/util";

export class TableFilterView extends EventsComponent {
    get schema() {
        return this.block?.schema;
    }
    get formSchema() {
        return this.block?.page?.schema;
    }
    block: DataGridView;
    oldFilters: SchemaFilter;
    onOpen(block: DataGridView): void {
        this.block = block;
        this.oldFilters = lodash.cloneDeep(this.block.filter || { id: util.guid(), logic: 'and', items: [] });
        if (!Array.isArray(this.oldFilters.items)) this.oldFilters = { id: util.guid(), logic: 'and', items: [] }
        this.forceUpdate();
    }

    onStore = lodash.debounce(async () => {
        await this.onForceStore();
    }, 800);

    onForceStore = async () => {
        await this.block.onReloadData(async () => {
            await this.block.onManualUpdateProps({ filter: this.block.filter }, { filter: lodash.cloneDeep(this.oldFilters) });
        });
    }

    render() {
        if (!this.block?.page) return <></>
        return <FilterView
            filter={this.oldFilters}
            schema={this.schema}
            formSchema={this.formSchema}
            onInput={e => {
                this.oldFilters = e;
                this.onStore()
            }}
            onChange={e => {
                this.oldFilters = e;
                this.onForceStore()
            }}
            ws={this.block.page.ws}
        ></FilterView>
    }

}