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
import { DataGridControl } from "./control";
import { BlockUrlConstant } from "../../../src/block/constant";
import { PageLayoutType } from "../../../src/page/declare";
import { lst } from "../../../i18n/store";

export class DataGridConfig extends EventsComponent {
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
        if (this.dataGridControl)
            this.dataGridControl.onOpen(this.dataGrid);
        if (mode == 'field' && this.tab) this.tab.onFocus(1)
        if (mode == 'filter' && this.tab) this.tab.onFocus(2)
        if (mode == 'sort' && this.tab) this.tab.onFocus(3)
        if (mode == 'group' && this.tab) this.tab.onFocus(4)
        this.forceUpdate()
    }
    dataGridViewConfig: DataGridViewConfig;
    dataGridFields: DataGridFields;
    tableFilterView: TableFilterView;
    tableSortView: TableSortView;
    dataGridControl: DataGridControl;
    tab: Tab;
    render() {
        if (this.dataGrid?.page?.pageLayout?.type != PageLayoutType.db)
            return <div className='min-w-300 min-h-50 max-h-500 overflow-y' >
                <Tab ref={e => this.tab = e} show="text" keeplive>
                    <Tab.Page item={lst('视图')}>
                        <DataGridViewConfig gc={this} ref={e => this.dataGridViewConfig = e} ></DataGridViewConfig>
                    </Tab.Page>
                    <Tab.Page item={[BlockUrlConstant.DataGridBoard, BlockUrlConstant.DataGridGallery].includes(this.dataGrid?.url as any) ? lst('卡片') : lst("字段")}>
                        <DataGridFields ref={e => this.dataGridFields = e}></DataGridFields>
                    </Tab.Page>
                    <Tab.Page item={lst('过滤')}>
                        <TableFilterView ref={e => this.tableFilterView = e}></TableFilterView>
                    </Tab.Page>
                    <Tab.Page item={lst('排序')}>
                        <TableSortView ref={e => this.tableSortView = e}></TableSortView>
                    </Tab.Page>
                    <Tab.Page item={lst('触发器')}>
                        <DataGridControl ref={e => this.dataGridControl = e}></DataGridControl>
                    </Tab.Page>
                </Tab>
            </div>
        else return <div className='min-w-300 min-h-50 max-h-500 overflow-y' >
            <Tab ref={e => this.tab = e} show="text" keeplive>
                <Tab.Page item={lst('视图')}>
                    <DataGridViewConfig gc={this} ref={e => this.dataGridViewConfig = e} ></DataGridViewConfig>
                </Tab.Page>
                <Tab.Page item={[BlockUrlConstant.DataGridBoard, BlockUrlConstant.DataGridGallery].includes(this.dataGrid?.url as any) ? lst('卡片') : lst("字段")}>
                    <DataGridFields ref={e => this.dataGridFields = e}></DataGridFields>
                </Tab.Page>
                <Tab.Page item={lst('过滤')}>
                    <TableFilterView ref={e => this.tableFilterView = e}></TableFilterView>
                </Tab.Page>
                <Tab.Page item={lst('排序')}>
                    <TableSortView ref={e => this.tableSortView = e}></TableSortView>
                </Tab.Page>
                {/*<Tab.Page item={'触发器'}>
                  <DataGridTrigger ref={e => this.dataGridTrigger = e}></DataGridTrigger>
                 </Tab.Page>*/}
            </Tab>
        </div>
    }
    onClose() {
        this.emit('close')
    }
}



export async function useDataGridConfig(pos: PopoverPosition, options?: { mode?: 'view' | 'field' | 'sort' | 'filter' | 'group', dataGrid: DataGridView }) {
    let popover = await PopoverSingleton(DataGridConfig, { mask: true });
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