
import { EventsComponent } from "../../component/lib/events.component";
import React from "react";
import { Tip } from "../../component/view/tooltip/tip";
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
                <Tab.Page item={<Tip placement='bottom' text={'上传文件'}><Icon size={20} icon={Upload}></Icon></Tip>}>
                    <UploadView mine={this.mime} change={e => this.onChange({ name: 'upload', ...e })}></UploadView>
                </Tab.Page>
                <Tab.Page item={<Tip placement='bottom' text={'网址链接'}><Icon size={18} icon={Link}></Icon></Tip>}>
                    <OutsideUrl change={e => this.onChange({ name: 'link', url: e })}></OutsideUrl>
                </Tab.Page>
            </Tab>
        </div>
    }
    mime: 'image' | 'file' | 'audio' | 'video' = 'file';
    open(mine?: 'image' | 'file' | 'audio' | 'video') {
        this.mime = mine || 'file';
        this.forceUpdate();
    }
}

interface FilePicker {
    only(name: 'select', fn: (data: ResourceArguments) => void);
    emit(name: 'select', data: ResourceArguments);
}

export async function useFilePicker(pos: PopoverPosition, mime?: UploadPicker['mime']) {
    let popover = await PopoverSingleton(FilePicker);
    let filePicker = await popover.open(pos);

    filePicker.open(mime);
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

class UploadPicker extends EventsComponent {
    onChange(data: any) {
        this.emit('select', { ...data });
    }
    render() {
        return <div className='shy-file-picker' >
            <Tab keeplive>
                <Tab.Page item={<Tip placement='bottom' text={'上传文件'}><Icon size={20} icon={Upload}></Icon></Tip>}>
                    <UploadView mine={this.mime} change={e => this.onChange({ name: 'upload', ...e })}></UploadView>
                </Tab.Page>
            </Tab>
        </div>
    }
    mime: 'image' | 'file' | 'audio' | 'video' = 'file';
    open(mine?: 'image' | 'file' | 'audio' | 'video') {
        this.mime = mine || 'file';
        this.forceUpdate();
    }
}

interface UploadPicker {
    only(name: 'select', fn: (data: ResourceArguments) => void);
    emit(name: 'select', data: ResourceArguments);
}

export async function useUploadPicker(pos: PopoverPosition, mime?: UploadPicker['mime']) {
    let popover = await PopoverSingleton(UploadPicker);
    let filePicker = await popover.open(pos);
    filePicker.open(mime);
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