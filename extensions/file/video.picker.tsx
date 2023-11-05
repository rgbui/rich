import React from "react";
import { Tip } from "../../component/view/tooltip/tip";
import { OutsideUrl } from "../link/outside";
import { EventsComponent } from "../../component/lib/events.component";
import { UploadView } from "./upload";
import { ResourceArguments } from "../icon/declare";
import { PopoverPosition } from "../../component/popover/position";
import { PopoverSingleton } from "../../component/popover/popover";
import { Tab } from "../../component/view/tab";
import { Icon } from "../../component/view/icon";
import { LinkSvg, UploadSvg } from "../../component/svgs";

class VideoPicker extends EventsComponent {
    onChange(data: any) {
        this.emit('select', { ...data });
    }
    render() {
        return <div className='shy-video-picker' >
            <Tab keeplive>
                <Tab.Page item={<Tip placement='bottom' text={'视频链接'}><Icon size={20} icon={LinkSvg}></Icon></Tip>}>
                    <OutsideUrl change={e => this.onChange({ name: 'link', url: e })}></OutsideUrl>
                </Tab.Page>
                <Tab.Page item={<Tip placement='bottom' text={'上传文件'}><Icon size={20} icon={UploadSvg}></Icon></Tip>}>
                    <UploadView mine='video' change={e => this.onChange({ name: 'upload', ...e })}></UploadView>
                </Tab.Page>
            </Tab>
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