import React from "react";
import { Tip } from "../../component/view/tip";
import { LangID } from "../../i18n/declare";
import { OutsideUrl } from "../link/outside";
import { EventsComponent } from "../../component/lib/events.component";
import { UploadView } from "./upload";
import Link from "../../src/assert/svg/link.svg";
import Upload from "../../src/assert/svg/upload.svg";
import { ResourceArguments } from "../icon/declare";
import { PopoverPosition } from "../popover/position";
import { PopoverSingleton } from "../popover/popover";
import { Tab } from "../../component/view/tab";
import { Icon } from "../../component/view/icon";
class VideoPicker extends EventsComponent {


    onChange(data: any) {
        this.emit('select', { ...data });
    }
    render() {
        return <div className='shy-video-picker' >
            <Tab keeplive>
                <Tab.Page item={<Tip placement='bottom' id={LangID.UploadFile}><Icon size={30} icon={Upload}></Icon></Tip>}>
                    <UploadView mine='video' change={e => this.onChange({ name: 'upload', url: e })}></UploadView>
                </Tab.Page>
                <Tab.Page item={<Tip placement='bottom' id={LangID.ImageLink}><Icon size={30} icon={Link}></Icon></Tip>}>
                    <OutsideUrl change={e => this.onChange({ name: 'link', url: e })}></OutsideUrl>
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