
import React from "react";
import { TableSchema } from "../../blocks/table-store/schema/meta";
import { PopoverSingleton } from "../popover/popover";
import { PopoverPosition } from "../popover/position";
import "./style.less";

export class EChartOptions extends React.Component {
    open(options) {

    }
    render(): React.ReactNode {
        return <div className="shy-echarts">

        </div>
    }
}
export async function useEChartOptions(pos: PopoverPosition,
    options: {
        schema: TableSchema
    }) {
    let popover = await PopoverSingleton(EChartOptions);
    let fv = await popover.open(pos);
    fv.open(options);
    // return new Promise((resolve: (data: { text: string, type: FieldType }) => void, reject) => {
    //     fv.only('save', (value) => {
    //         popover.close();
    //         resolve(value);
    //     });
    //     fv.only('input', (ops: TableStoreOption[]) => {

    //     });
    //     fv.only('changeOptions', (ops: TableStoreOptionType[]) => {
    //         options.changeOptions(ops);
    //     });
    //     fv.only('close', () => {
    //         popover.close();
    //         resolve(null);
    //     });
    //     popover.only('close', () => {
    //         resolve(null)
    //     });
    // })
}
