
import { SyExtensionsComponent } from "../sy.component";
import React from "react";
import { Tip } from "../../component/tip";
import { LangID } from "../../i18n/declare";
import Link from "../../src/assert/svg/link.svg";
import Upload from "../../src/assert/svg/uplaod.svg";
import { UrlView } from "../link/url";
import { UploadView } from "./upload";
import { ResourceArguments } from "../icon/declare";
import { PopoverSingleton } from "../popover/popover";
import { PopoverPosition } from "../popover/position";

class FilePicker extends SyExtensionsComponent {
    mode: 'upload' | 'link' = 'upload';
    onChangeMode(mode: FilePicker['mode']) {
        this.mode = mode;
        this.forceUpdate()
    }
    onChange(mode: FilePicker['mode'], data: any) {
        this.emit('select', { name: mode, ...data });
    }
    render() {
        return <div className='shy-audio-picker' >
            <div className='shy-audio-picker-head'>
                <Tip id={LangID.IconUpload}><a onMouseDown={e => this.onChangeMode('upload')}><Upload></Upload></a></Tip>
                <Tip id={LangID.IconLink}><a onMouseDown={e => this.onChangeMode('link')}><Link></Link></a></Tip>
            </div>
            <div className='shy-audio-picker-content'>
                {this.mode == 'upload' && <UploadView mine='audio' change={e => this.onChange(this.mode, { url: e })}></UploadView>}
                {this.mode == 'link' && <UrlView change={e => this.onChange(this.mode, { url: e })}></UrlView>}
            </div>
        </div>
    }
}

interface FilePicker {
    only(name: 'select', fn: (data: ResourceArguments) => void);
    emit(name: 'select', data: ResourceArguments);
}

export async function useFilePicker(pos: PopoverPosition) {
    let popover = await PopoverSingleton(FilePicker);
    let filePicker = await popover.open<FilePicker>(pos);
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
