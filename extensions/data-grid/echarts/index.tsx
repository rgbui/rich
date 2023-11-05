import React from "react";
import { EventsComponent } from "../../../component/lib/events.component";
import { ResourceArguments } from "../../icon/declare";
import { PopoverSingleton } from "../../../component/popover/popover";
import { PopoverPosition } from "../../../component/popover/position";
import { DataGridChart } from "../../../blocks/data-grid/view/statistic/charts";
import { lst } from "../../../i18n/store";
import { TableFilterView } from "../view.config/filter";
import { Tab } from "../../../component/view/tab";
import { DataGridChartViewConfig } from "./view";
import "./style.less";

export class DataGridChartConfig extends EventsComponent {
    block: DataGridChart
    onOpen(dataGrid: DataGridChart, mode?: 'view' | 'field' | 'sort' | 'filter' | 'group') {
        this.block = dataGrid;
        if (this.dataGridViewConfig)
            this.dataGridViewConfig.onOpen(this.block)
        if (this.tableFilterView)
            this.tableFilterView.onOpen(this.block);
        this.forceUpdate()
    }
    dataGridViewConfig: DataGridChartViewConfig;
    tableFilterView: TableFilterView;
    tab: Tab;
    render() {
        return <div className='min-w-300 min-h-50 max-h-500 overflow-y' >
            <Tab ref={e => this.tab = e} show="text" keeplive>
                <Tab.Page item={lst('视图')}>
                    <DataGridChartViewConfig gc={this} ref={e => this.dataGridViewConfig = e} ></DataGridChartViewConfig>
                </Tab.Page>
                <Tab.Page item={lst('过滤')}>
                    <TableFilterView ref={e => this.tableFilterView = e}></TableFilterView>
                </Tab.Page>
            </Tab>
        </div>

    }
    onClose() {
        this.emit('close')
    }
}



export async function useDataGridChartConfig(pos: PopoverPosition, options?: { mode?: 'view' | 'field' | 'sort' | 'filter' | 'group', dataGrid: DataGridChart }) {
    let popover = await PopoverSingleton(DataGridChartConfig, { mask: true });
    let dataGridViewer = await popover.open(pos);
    dataGridViewer.onOpen(options.dataGrid, options.mode)
    return new Promise((resolve: (data: ResourceArguments) => void, reject) => {
        popover.only('close', () => {
            resolve(null);
        });
        dataGridViewer.only('close', () => {
            popover.close();
            resolve(null)
        })
    })
}