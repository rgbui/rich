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
import { DataGridDynamic } from "./dynamic";

class DataGridConfig extends EventsComponent {
    dataGrid: DataGridView
    onOpen(dataGrid: DataGridView, mode?: 'view' | 'field' | 'sort' | 'filter' | 'group') {
        this.dataGrid = dataGrid;
        if (this.dataGridViewConfig)
            this.dataGridViewConfig.onOpen(this.dataGrid);
        if (this.dataGridFields)
            this.dataGridFields.onOpen(this.dataGrid);
        if (this.tableFilterView)
            this.tableFilterView.onOpen(this.dataGrid);
        if (this.tableSortView)
            this.tableSortView.onOpen(this.dataGrid);
        if (mode == 'field' && this.tab) this.tab.onFocus(1)
        if (mode == 'filter' && this.tab) this.tab.onFocus(2)
        if (mode == 'sort' && this.tab) this.tab.onFocus(3)
        if (mode == 'group' && this.tab) this.tab.onFocus(4)
    }
    dataGridViewConfig: DataGridViewConfig;
    dataGridFields: DataGridFields;
    tableFilterView: TableFilterView;
    tableSortView: TableSortView;
    dataGridDynamic: DataGridDynamic;
    tab: Tab;
    render() {
        return <div className='shy-data-grid-config' >
            <Tab ref={e => this.tab = e} show="text" keeplive>
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

export async function useDataGridConfig(pos: PopoverPosition, options?: { mode?: 'view' | 'field' | 'sort' | 'filter' | 'group', dataGrid: DataGridView }) {
    let popover = await PopoverSingleton(DataGridConfig, { mask: true });
    let filePicker = await popover.open(pos);
    filePicker.onOpen(options.dataGrid, options.mode)
    return new Promise((resolve: (data: ResourceArguments) => void, reject) => {
        popover.only('close', () => {
            resolve(null)
        })
    })
}