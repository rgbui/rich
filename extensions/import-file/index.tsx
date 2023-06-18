import React from "react";
import { EventsComponent } from "../../component/lib/events.component";
import { PopoverSingleton } from "../popover/popover";
import { PopoverPosition } from "../popover/position";
import { MindSvg } from "../../component/svgs";
import { Icon } from "../../component/view/icon";

class ImportFile extends EventsComponent {
    render() {
        return <div>
            <div className="h4">导入</div>
            <div className="flex flex-wrap  r-w-120">
                <div className="card">
                    <Icon icon={MindSvg}></Icon><span>Markdown文件</span>
                </div>
                <div className="card">
                    <Icon icon={MindSvg}></Icon><span>CSV</span>
                </div>
                <div className="card">
                    <Icon icon={MindSvg}></Icon><span>HTML</span>
                </div>
                <div className="card">
                    <Icon icon={MindSvg}></Icon><span>Word</span>
                </div>
            </div>
        </div>
    }
    onOpen(options) {

    }
}

export async function useImagePicker(pos: PopoverPosition, options?: { gallery: boolean }) {
    let popover = await PopoverSingleton(ImportFile, { slow: true });
    let filePicker = await popover.open(pos);
    filePicker.onOpen(options)
    return new Promise((resolve: (data: any) => void, reject) => {

        popover.only('close', () => {
            resolve(null)
        })
    })
}