
import { EventsComponent } from "../../component/events.component";
import React from "react";
import { Tip } from "../../component/view/tip";
import { LangID } from "../../i18n/declare";
import Link from "../../src/assert/svg/link.svg";
import Upload from "../../src/assert/svg/upload.svg";
import { OutsideUrl } from "../link/outside";
import { UploadView } from "./upload";
import { ResourceArguments } from "../icon/declare";
import { PopoverSingleton } from "../popover/popover";
import { PopoverPosition } from "../popover/position";
import { Tab } from "../../component/view/tab";
import { Icon } from "../../component/view/icon";

class FilePicker extends EventsComponent {
    onChange(data: any) {
        this.emit('select', { ...data });
    }
    render() {
        return <div className='shy-file-picker' >
            <Tab keeplive>
                <Tab.Page item={<Tip placement='bottom' id={LangID.UploadFile}><Icon size={30} icon={Upload}></Icon></Tip>}>
                    <UploadView mine='file' change={e => this.onChange({ name: 'upload', url: e })}></UploadView>
                </Tab.Page>
                <Tab.Page item={<Tip placement='bottom' id={LangID.ImageLink}><Icon size={30} icon={Link}></Icon></Tip>}>
                    <OutsideUrl change={e => this.onChange({ name: 'link', url: e })}></OutsideUrl>
                </Tab.Page>
            </Tab>
        </div>
    }
}

interface FilePicker {
    only(name: 'select', fn: (data: ResourceArguments) => void);
    emit(name: 'select', data: ResourceArguments);
}

export async function useFilePicker(pos: PopoverPosition) {
    let popover = await PopoverSingleton(FilePicker);
    let filePicker = await popover.open(pos);
    return new Promise((resolve: (data: ResourceArguments) => void, reject) => {
        filePicker.only('select', (data) => {
            popover.close();
            resolve(data);
        })
        popover.only('close', () => {
            resolve(null)
        })
    })
}
