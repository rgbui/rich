import React from "react";
import { Tip } from "../../component/view/tooltip/tip";
import { PopoverSingleton } from "../../component/popover/popover";
import { EventsComponent } from "../../component/lib/events.component";
import Link from "../../src/assert/svg/link.svg";
import Upload from "../../src/assert/svg/upload.svg";
import Unsplash from "../../src/assert/svg/unsplash.svg";
import Pexels from "../../src/assert/svg/pexels.svg";
import { OutsideUrl } from "../link/outside";
import { UploadView } from "../file/upload";
import { PopoverPosition } from "../../component/popover/position";
import { ResourceArguments } from "../icon/declare";
import { GalleryType } from "./declare";
import { ThirdGallery } from "./third.gallery";
import { Icon } from "../../component/view/icon";
import { Tab } from "../../component/view/tab";
import "./style.less";
import { GalleryView } from "./gellery";
import { PicSvg } from "../../component/svgs";

class ImagePicker extends EventsComponent {
    onChange(data: ResourceArguments) {
        this.emit('select', data);
    }
    showGallery: boolean = false;
    onOpen(options?: { gallery: boolean }) {
        this.showGallery = options?.gallery ? true : false;
        if (this.tab) {
            if (this.showGallery) this.tab.onFocus(0)
            else this.tab.onFocus(1)
        }
        this.forceUpdate();
    }
    tab: Tab;
    render() {
        return <div className='shy-image-picker' >
            <Tab ref={e => this.tab = e} change={e => this.emit('change', e)} keeplive>
                <Tab.Page visible={this.showGallery} item={<Tip placement='bottom' text={'画廊'}><Icon size={18} icon={PicSvg}></Icon></Tip>}>
                    <GalleryView onChange={e => this.onChange(e as any)}></GalleryView>
                </Tab.Page>
                <Tab.Page item={<Tip placement='bottom' text={'上传图片'}><Icon size={20} icon={Upload}></Icon></Tip>}>
                    <UploadView mine='image' change={e => this.onChange(e)}></UploadView>
                </Tab.Page>
                <Tab.Page item={<Tip placement='bottom' text={'图片网址'}><Icon size={18} icon={Link}></Icon></Tip>}>
                    <OutsideUrl change={e => this.onChange({ url: e })}></OutsideUrl>
                </Tab.Page>
                <Tab.Page item={<Tip placement='bottom' overlay={'Pexels'}><Icon size={20} icon={Pexels}></Icon></Tip>}>
                    <ThirdGallery type={GalleryType.pexels} onChange={e => { this.onChange(e as any) }}></ThirdGallery>
                </Tab.Page>
                <Tab.Page item={<Tip placement='bottom' overlay={'Unsplash'}><Icon size={18} icon={Unsplash}></Icon></Tip>}>
                    <ThirdGallery type={GalleryType.unsplash} onChange={e => this.onChange(e as any)}></ThirdGallery>
                </Tab.Page>
            </Tab>
        </div>
    }
}

interface ImagePicker {
    only(name: 'select', fn: (data: ResourceArguments) => void);
    emit(name: 'select', data: ResourceArguments);
    only(name: 'change', fn: (data: number) => void);
    emit(name: 'change', data: number);
}

export async function useImagePicker(pos: PopoverPosition, options?: { gallery: boolean }) {
    let popover = await PopoverSingleton(ImagePicker, { slow: true });
    let filePicker = await popover.open(pos);
    filePicker.onOpen(options)
    setTimeout(() => {
        filePicker.emit('change', 1);
    }, 200);
    return new Promise((resolve: (data: ResourceArguments) => void, reject) => {
        filePicker.only('select', (data) => {
            popover.close();
            resolve(data);
        })
        filePicker.only('change', e => {
            popover.updateLayout()
        })
        popover.only('close', () => {
            resolve(null)
        })
    })
}