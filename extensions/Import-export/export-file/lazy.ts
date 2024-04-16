import { lazy } from "react";
import { LazyPopoverSingleton } from "../../../component/popover/popover";
import { Page } from "../../../src/page";

export async function useExportFile(options?: { page: Page }) {
    let popover = await LazyPopoverSingleton(lazy(() => import("./index")), { slow: true, mask: true });
    let filePicker = await popover.open({ center: true, centerTop: 100 });
    filePicker.onOpen(options)
    return new Promise((resolve: (data: any) => void, reject) => {
        filePicker.only('save', data => {
            popover.close();
            resolve(null)
        })
        popover.only('close', () => {
            resolve(null)
        })
    })
}