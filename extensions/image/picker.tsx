import React from "react";
import { Tip } from "../../component/tip";
import { LangID } from "../../i18n/declare";
import { PopoverSingleton } from "../popover/popover";
import { EventsComponent } from "../events.component";
import Link from "../../src/assert/svg/link.svg";
import Upload from "../../src/assert/svg/uplaod.svg";
import Unsplash from "../../src/assert/svg/unsplash.svg";
import Pexels from "../../src/assert/svg/pexels.svg";
import { OutsideUrl } from "../link/outside";
import { UploadView } from "../file/upload";
import { PopoverPosition } from "../popover/position";
import { ResourceArguments } from "../icon/declare";
import { GalleryType } from "./declare";
import { ThirdGallery } from "./third.gallery";

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
        return <div className='shy-audio-picker' >
            <div className='shy-audio-picker-head'>
                <Tip id={LangID.IconUpload}><a onMouseDown={e => this.onChangeMode('upload')}><Upload></Upload></a></Tip>
                <Tip id={LangID.IconLink}><a onMouseDown={e => this.onChangeMode('link')}><Link></Link></a></Tip>
                <Tip overlay={'Pexels'}><a onMouseDown={e => this.onChangeMode('pexels')}><Pexels></Pexels></a></Tip>
                <Tip overlay={'Unsplash'}><a onMouseDown={e => this.onChangeMode('unsplash')}><Unsplash></Unsplash></a></Tip>
            </div>
            <div className='shy-audio-picker-content'>
                {this.mode == 'upload' && <UploadView mine='audio' change={e => this.onChange(this.mode, { url: e })}></UploadView>}
                {this.mode == 'link' && <OutsideUrl change={e => this.onChange(this.mode, { url: e })}></OutsideUrl>}
                {this.mode == 'pexels' && <ThirdGallery type={GalleryType.pexels} onChange={e => this.onChange(this.mode, { ...e })}></ThirdGallery>}
                {this.mode == 'unsplash' && <ThirdGallery type={GalleryType.unsplash} onChange={e => this.onChange(this.mode, { ...e })}></ThirdGallery>}
            </div>
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