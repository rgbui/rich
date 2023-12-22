import React from "react";
import { EventsComponent } from "../../component/lib/events.component";
import { ResourceArguments } from "../icon/declare";
import { PopoverSingleton } from "../../component/popover/popover";
import { PopoverPosition } from "../../component/popover/position";
import { UploadView } from "./upload";
// import { Tab } from "../../component/view/tab";
// import { UploadSvg, LinkSvg } from "../../component/svgs";
// import { Icon } from "../../component/view/icon";
// import { Tip } from "../../component/view/tooltip/tip";
// import { OutsideUrl } from "../link/outside";

class ImageFilePicker extends EventsComponent {
    onChange(data: any) {
        this.emit('select', { ...data });
    }
    render() {
        return <div className='shy-file-picker' >
            <UploadView mine='image' change={e => this.onChange({ name: 'upload', ...e })}></UploadView>
            
            {/* <Tab keeplive>
                <Tab.Page item={<Tip placement='bottom' text={'上传图片'}><Icon size={16} icon={UploadSvg}></Icon></Tip>}>
                    <UploadView mine='image' change={e => this.onChange({ name: 'upload', ...e })}></UploadView>
                </Tab.Page>
                <Tab.Page item={<Tip placement='bottom' text={'图片链接'}><Icon size={16} icon={LinkSvg}></Icon></Tip>}>
                    <OutsideUrl change={e => this.onChange({ name: 'link', url: e })}></OutsideUrl>
                </Tab.Page>
            </Tab> */}
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