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
        this.forceUpdate()
    }
    render() {
        return <div className='shy-data-grid-config' >
            <Tab show="text">
                <Tab.Page item={'视图配置'}>
                    <DataGridViewConfig dataGrid={this.dataGrid}></DataGridViewConfig>
                </Tab.Page>
                <Tab.Page item={'字段'}>
                    <DataGridFields dataGrid={this.dataGrid}></DataGridFields>
                </Tab.Page>
                <Tab.Page item={'过滤'}>
                    <TableFilterView dataGrid={this.dataGrid}></TableFilterView>
                </Tab.Page>
                <Tab.Page item={'排序'}>
                    <TableSortView dataGrid={this.dataGrid}></TableSortView>
                </Tab.Page>
            </Tab>
        </div>
    }
}

interface DataGridConfig {

}

export async function useDataGridConfig(pos: PopoverPosition, options?: { dataGrid: DataGridView }) {
    let popover = await PopoverSingleton(DataGridConfig);
    let filePicker = await popover.open(pos);
    filePicker.onOpen(options.dataGrid)
    return new Promise((resolve: (data: ResourceArguments) => void, reject) => {
        popover.only('close', () => {
            resolve(null)
        })
    })
}