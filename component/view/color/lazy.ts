import { lazy } from "react";
import { LazyPopoverSingleton } from "../../popover/popover";
import { PopoverPosition } from "../../popover/position";

export async function useColorPicker(pos: PopoverPosition, options: { color: string, change?: (color: string) => void }) {
    let popover = await LazyPopoverSingleton(lazy(()=>import("./picker")), { mask: true });
    let colorSelector = await popover.open(pos);
    colorSelector.open(options.color);
    return new Promise((resolve: (data: string) => void, reject) => {
        colorSelector.only('change', (data) => {
            if (typeof options.change == 'function')
                options.change(data);
        })
        popover.only('close', () => {
            if (colorSelector.isChange)
                resolve(colorSelector.color);
        })
    })
}