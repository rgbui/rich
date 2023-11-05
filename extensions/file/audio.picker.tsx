import React from "react";
import { Tip } from "../../component/view/tooltip/tip";
import { OutsideUrl } from "../link/outside";
import { EventsComponent } from "../../component/lib/events.component";
import { UploadView } from "./upload";
import Link from "../../src/assert/svg/link.svg";
import Upload from "../../src/assert/svg/upload.svg";
import { ResourceArguments } from "../icon/declare";

import { PopoverPosition } from "../../component/popover/position";
import { PopoverSingleton } from "../../component/popover/popover";
import { Tab } from "../../component/view/tab";
import { Icon } from "../../component/view/icon";

class AudioPicker extends EventsComponent {
    onChange(data: any) {
        this.emit('select', { ...data });
    }
    render() {
        return <div className='shy-audio-picker'>
            <Tab keeplive>
                <Tab.Page item={<Tip placement='bottom' text={'上传音频'}><Icon size={20} icon={Upload}></Icon></Tip>}>
                    <UploadView mine='file' change={e => this.onChange({ name: 'upload', ...e })}></UploadView>
                </Tab.Page>
                <Tab.Page item={<Tip placement='bottom' text={'上传图片'}><Icon size={18} icon={Link}></Icon></Tip>}>
                    <OutsideUrl change={e => this.onChange({ name: 'link', url: e })}></OutsideUrl>
                </Tab.Page>
            </Tab>
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