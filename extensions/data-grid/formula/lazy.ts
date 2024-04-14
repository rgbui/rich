import { lazy } from "react";
import { TableSchema } from "../../../blocks/data-grid/schema/meta";
import { LazyPopoverSingleton } from "../../../component/popover/popover";
import { PopoverPosition } from "../../../component/popover/position";

export async function useFormula(pos: PopoverPosition, options: {
    schema: TableSchema,
    formula: string
}) {
    let popover = await LazyPopoverSingleton(lazy(() => import("./index")), { mask: true });
    let fv = await popover.open(pos);
    fv.open(options.schema, options.formula);
    return new Promise((resolve: (data: { formula: string, jsCode: string, exp: any }) => void, reject) => {
        fv.only('close', () => {
            popover.close();
            resolve(undefined);
        })
        fv.only('save', () => {
            popover.close();
            if (fv.formula) resolve(fv.result);
            else resolve({
                formula: '',
                jsCode: '',
                exp: null
            })
        })
        fv.only('update', () => {
            popover.updateLayout()
        })
        popover.only('close', () => {
            resolve(undefined)
        })
    })
}