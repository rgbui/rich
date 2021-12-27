
import { PopoverPosition } from "../../popover/position";
import { PopoverSingleton } from "../../popover/popover";
import { FieldType } from "../../../blocks/table-store/schema/field.type";
import { TableFieldView } from "./view";
export async function useTableStoreAddField(pos: PopoverPosition,
    option: {
        text: string, type: FieldType,
        check?: (newText: string) => string
    }) {
    let popover = await PopoverSingleton(TableFieldView);
    let fv = await popover.open(pos);
    fv.open(option, option.check);
    return new Promise((resolve: (data: { text: string, type: FieldType }) => void, reject) => {
        fv.only('save', (data: { text: string, type: FieldType }) => {
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