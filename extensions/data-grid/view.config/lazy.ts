import { lazy } from "react";
import { DataGridView } from "../../../blocks/data-grid/view/base";
import { LazyPopoverSingleton } from "../../../component/popover/popover";
import { PopoverPosition } from "../../../component/popover/position";
import { ResourceArguments } from "../../icon/declare";
export async function useDataGridConfig(pos: PopoverPosition, options?: { mode?: 'view' | 'field' | 'sort' | 'filter' | 'group', dataGrid: DataGridView }) {
    //mask: true 
    let popover = await LazyPopoverSingleton(lazy(() => import("./index")), {});
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