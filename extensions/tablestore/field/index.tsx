
import { PopoverPosition } from "../../popover/position";
import { PopoverSingleton } from "../../popover/popover";
import { FieldType } from "../../../blocks/data-grid/schema/type";
import { TableFieldView } from "./view";
import { FieldConfig } from "../../../blocks/data-grid/schema/field";

import './style.less';

export async function useTableStoreAddField(pos: PopoverPosition,
    option: {
        text: string, type: FieldType,
        check?: (newText: string) => string,
        config?: Record<string, any>
    }) {
    let popover = await PopoverSingleton(TableFieldView, { mask: true });
    let fv = await popover.open(pos);
    fv.open(option, option.check);
    return new Promise((resolve: (data: { text: string, type: FieldType, config?: FieldConfig }) => void, reject) => {
        fv.only('save', (data: { text: string, type: FieldType, config?: FieldConfig }) => {
            popover.close();
            resolve(data);
        });
        fv.only('close', () => {
            popover.close();
            resolve(null);
        })
        popover.only('close', () => {
            resolve(null)
        })
    })
}