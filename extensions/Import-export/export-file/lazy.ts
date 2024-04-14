import { lazy } from "react";
import { LazyPopoverSingleton } from "../../../component/popover/popover";
import { Page } from "../../../src/page";

export async function useExportFile(options?: { page: Page }) {
    let popover = await LazyPopoverSingleton(lazy(() => import("./index")), { slow: true });
    let filePicker = await popover.open({ center: true, centerTop: 100 });
    filePicker.onOpen(options)
    return new Promise((resolve: (data: any) => void, reject) => {
        popover.only('close', () => {
            resolve(null)
        })
    })
}