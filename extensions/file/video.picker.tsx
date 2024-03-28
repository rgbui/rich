import React from "react";
import { EventsComponent } from "../../component/lib/events.component";
import { UploadView } from "./upload";
import { ResourceArguments } from "../icon/declare";
import { PopoverPosition } from "../../component/popover/position";
import { PopoverSingleton } from "../../component/popover/popover";

class VideoPicker extends EventsComponent {
    onChange(data: any) {
        this.emit('select', { ...data });
    }
    render() {
        return <div className='shy-video-picker  gap-w-10' >
            <UploadView mine='video' change={e => this.onChange({ name: 'upload', ...e })}></UploadView>
        </div>
    }
}

interface VideoPicker {
    only(name: 'select', fn: (data: ResourceArguments) => void);
    emit(name: 'select', data: ResourceArguments);
}

export async function useVideoPicker(pos: PopoverPosition) {
    let popover = await PopoverSingleton(VideoPicker);
    let videoPicker = await popover.open(pos);
    return new Promise((resolve: (data: ResourceArguments) => void, reject) => {
        videoPicker.only('select', (data) => {
            popover.close();
            resolve(data);
        })
        popover.only('close', () => {
            resolve(null)
        })
    })
}