import React from "react";
import { Tip } from "../../component/tip";
import { LangID } from "../../i18n/declare";
import { PopoverSingleton } from "../popover/popover";
import { EventsComponent } from "../events.component";
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
import { Icon } from "../../component/icon";
import { Tab } from "../../component/tab";
import "./style.less";
class ImagePicker extends EventsComponent {
    mode: 'upload' | 'link' | 'pexels' | 'unsplash' = 'upload';
    onChangeMode(mode: ImagePicker['mode']) {
        this.mode = mode;
        this.forceUpdate()
    }
    onChange(mode: ImagePicker['mode'], data: any) {
        this.emit('select', { name: mode, ...data });
    }
    render() {
        return <div className='shy-image-picker' >
            <Tab keeplive>
                <Tab.Page item={<Tip placement='bottom' id={LangID.UploadImage}><Icon size={30} icon={Upload}></Icon></Tip>}>
                    <UploadView mine='image' change={e => this.onChange(this.mode, { url: e })}></UploadView>
                </Tab.Page>
                <Tab.Page item={<Tip placement='bottom' id={LangID.ImageLink}><Icon size={30} icon={Link}></Icon></Tip>}>
                    <OutsideUrl change={e => this.onChange(this.mode, { url: e })}></OutsideUrl>
                </Tab.Page>
                <Tab.Page item={<Tip placement='bottom' overlay={'Pexels'}><Icon size={18} icon={Pexels}></Icon></Tip>}>
                    <ThirdGallery type={GalleryType.pexels} onChange={e => this.onChange(this.mode, { ...e })}></ThirdGallery>
                </Tab.Page>
                <Tab.Page item={<Tip placement='bottom' overlay={'Unsplash'}><Icon size={16} icon={Unsplash}></Icon></Tip>}>
                    <ThirdGallery type={GalleryType.unsplash} onChange={e => this.onChange(this.mode, { ...e })}></ThirdGallery>
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
    let filePicker = await popover.open<ImagePicker>(pos);
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