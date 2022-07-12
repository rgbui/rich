import React from "react";
import { DataGridView } from "../../../blocks/data-grid/view/base";
import { EventsComponent } from "../../../component/lib/events.component";
import { Tab } from "../../../component/view/tab";
import { ResourceArguments } from "../../icon/declare";
import { PopoverSingleton } from "../../popover/popover";
import { PopoverPosition } from "../../popover/position";
import { DataGridFields } from "./field";
import { TableFilterView } from "./filter";
import { TableSortView } from "./sort";
import { DataGridViewConfig } from "./view";
import "./style.less";

class DataGridConfig extends EventsComponent {
    dataGrid: DataGridView
    onOpen(dataGrid: DataGridView) {
        this.dataGrid = dataGrid;
        if (this.dataGridViewConfig)
            this.dataGridViewConfig.onOpen(this.dataGrid);
        if (this.dataGridFields)
            this.dataGridFields.onOpen(this.dataGrid);
        if (this.tableFilterView)
            this.tableFilterView.onOpen(this.dataGrid);
        if (this.tableSortView)
            this.tableSortView.onOpen(this.dataGrid);
    }
    dataGridViewConfig: DataGridViewConfig;
    dataGridFields: DataGridFields;
    tableFilterView: TableFilterView;
    tableSortView: TableSortView;
    render() {
        return <div className='shy-data-grid-config' >
            <Tab show="text" keeplive>
                <Tab.Page item={'视图配置'}>
                    <DataGridViewConfig ref={e => this.dataGridViewConfig = e} ></DataGridViewConfig>
                </Tab.Page>
                <Tab.Page item={'字段'}>
                    <DataGridFields ref={e => this.dataGridFields = e}></DataGridFields>
                </Tab.Page>
                <Tab.Page item={'过滤'}>
                    <TableFilterView ref={e => this.tableFilterView = e}></TableFilterView>
                </Tab.Page>
                <Tab.Page item={'排序'}>
                    <TableSortView ref={e => this.tableSortView = e}></TableSortView>
                </Tab.Page>
            </Tab>
        </div>
    }
}

interface DataGridConfig {

}

export async function useDataGridConfig(pos: PopoverPosition, options?: { dataGrid: DataGridView }) {
    let popover = await PopoverSingleton(DataGridConfig, { mask: true });
    let filePicker = await popover.open(pos);
    filePicker.onOpen(options.dataGrid)
    return new Promise((resolve: (data: ResourceArguments) => void, reject) => {
        popover.only('close', () => {
            resolve(null)
        })
    })
}