import { lazy } from "react";
import { LazyPopoverSingleton } from "../../../component/popover/popover";
import { Page } from "../../../src/page";

export async function useImportFile(options?: { page: Page }) {
    let popover = await LazyPopoverSingleton(lazy(()=>import("./index")), { slow: true });
    let filePicker = await popover.open({ center: true, centerTop: 100 });
    filePicker.onOpen(options)
    return new Promise((resolve: (data: { text: string, blocks: any[] }) => void, reject) => {

        filePicker.only('save', data => {
            popover.close();
            resolve(data);
        })
        popover.only('close', () => {
            resolve(null)
        })
    })
}