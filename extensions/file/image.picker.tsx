import React from "react";
import { EventsComponent } from "../../component/lib/events.component";
import { ResourceArguments } from "../icon/declare";
import { PopoverSingleton } from "../../component/popover/popover";
import { PopoverPosition } from "../../component/popover/position";
import { UploadView } from "./upload";

class ImageFilePicker extends EventsComponent {
    onChange(data: any) {
        this.emit('select', { ...data });
    }
    render() {
        return <div className='shy-file-picker' >
            <UploadView mine='image' change={e => this.onChange({ name: 'upload', ...e })}></UploadView>
        </div>
    }
}

interface FilePicker {
    only(name: 'select', fn: (data: ResourceArguments) => void);
    emit(name: 'select', data: ResourceArguments);
}

export async function useImageFilePicker(pos: PopoverPosition) {
    let popover = await PopoverSingleton(ImageFilePicker);
    let imageFilePicker = await popover.open(pos);
    return new Promise((resolve: (data: ResourceArguments) => void, reject) => {
        imageFilePicker.only('select', (data) => {
            popover.close();
            resolve(data);
        })
        popover.only('close', () => {
            resolve(null)
        })
    })
}