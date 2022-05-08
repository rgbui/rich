import React from "react";
import { Tip } from "../../component/view/tip";
import { LangID } from "../../i18n/declare";
import { PopoverSingleton } from "../popover/popover";
import { EventsComponent } from "../../component/lib/events.component";
import Link from "../../src/assert/svg/link.svg";
import Upload from "../../src/assert/svg/upload.svg";
import Unsplash from "../../src/assert/svg/unsplash.svg";
import Pexels from "../../src/assert/svg/pexels.svg";
import { OutsideUrl } from "../link/outside";
import { UploadView } from "../file/upload";
import { PopoverPosition } from "../popover/position";
import { ResourceArguments } from "../icon/declare";
import { GalleryType } from "./declare";
import { ThirdGallery } from "./third.gallery";
import { Icon } from "../../component/view/icon";
import { Tab } from "../../component/view/tab";
import "./style.less";
import { GalleryView } from "./gellery";
import { PictureSvg } from "../../component/svgs";
class ImagePicker extends EventsComponent {
    onChange(data: any) {
        this.emit('select', { ...data });
    }
    render() {
        return <div className='shy-image-picker' >
            <Tab keeplive>
                <Tab.Page item={<Tip placement='bottom' overlay={'画廊'}><Icon size={18} icon={PictureSvg}></Icon></Tip>}>
                    <GalleryView onChange={e => this.onChange({ ...e })}></GalleryView>
                </Tab.Page>
                <Tab.Page item={<Tip placement='bottom' id={LangID.UploadImage}><Icon size={28} icon={Upload}></Icon></Tip>}>
                    <UploadView mine='image' change={e => this.onChange({ url: e })}></UploadView>
                </Tab.Page>
                <Tab.Page item={<Tip placement='bottom' id={LangID.ImageLink}><Icon size={18} icon={Link}></Icon></Tip>}>
                    <OutsideUrl change={e => this.onChange({ url: e })}></OutsideUrl>
                </Tab.Page>
                <Tab.Page item={<Tip placement='bottom' overlay={'Pexels'}><Icon size={18} icon={Pexels}></Icon></Tip>}>
                    <ThirdGallery type={GalleryType.pexels} onChange={e => { this.onChange({ ...e }) }}></ThirdGallery>
                </Tab.Page>
                <Tab.Page item={<Tip placement='bottom' overlay={'Unsplash'}><Icon size={16} icon={Unsplash}></Icon></Tip>}>
                    <ThirdGallery type={GalleryType.unsplash} onChange={e => this.onChange({ ...e })}></ThirdGallery>
                </Tab.Page>
            </Tab>
        </div>
    }
}

interface ImagePicker {
    only(name: 'select', fn: (data: ResourceArguments) => void);
    emit(name: 'select', data: ResourceArguments);
}

export async function useImagePicker(pos: PopoverPosition) {
    let popover = await PopoverSingleton(ImagePicker);
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