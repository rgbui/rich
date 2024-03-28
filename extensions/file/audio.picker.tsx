import React from "react";
import { EventsComponent } from "../../component/lib/events.component";
import { UploadView } from "./upload";
import { ResourceArguments } from "../icon/declare";

import { PopoverPosition } from "../../component/popover/position";
import { PopoverSingleton } from "../../component/popover/popover";

class AudioPicker extends EventsComponent {
    onChange(data: any) {
        this.emit('select', { ...data });
    }
    render() {
        return <div className='shy-audio-picker  gap-w-10'>
            <UploadView mine='audio' change={e => this.onChange({ name: 'upload', ...e })}></UploadView>
        </div>
    }
}

interface AudioPicker {
    only(name: 'select', fn: (data: ResourceArguments) => void);
    emit(name: 'select', data: ResourceArguments);
}

export async function useAudioPicker(pos: PopoverPosition) {
    let popover = await PopoverSingleton(AudioPicker);
    let audioPicker = await popover.open(pos);
    return new Promise((resolve: (data: ResourceArguments) => void, reject) => {
        audioPicker.only('select', (data) => {
            popover.close();
            resolve(data);
        })
        popover.only('close', () => {
            resolve(null)
        })
    })
}