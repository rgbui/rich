
import React from "react";
import { Tip } from "../../component/view/tip";
import { LangID } from "../../i18n/declare";
import { EventsComponent } from "../../component/lib/events.component";


import { UploadView } from "../file/upload";
import { EmojiView } from "../emoji/view";
import { FontAwesomeView } from "../font-awesome";
import { OutsideUrl } from "../link/outside";
import { Tab } from "../../component/view/tab";
import { IconArguments } from "./declare";
import { PopoverSingleton } from "../popover/popover";
import { PopoverPosition } from "../popover/position";
import './style.less';
import { EmojiSvg, FontawesomeSvg, LinkSvg, TrashSvg, UploadSvg } from "../../component/svgs";
import { Icon } from "../../component/view/icon";
class IconPicker extends EventsComponent {
    onChange(data: IconArguments) {
        this.emit('change', data);
    }
    onClearIcon() {
        this.emit('change', { name: 'none' });
    }
    render() {
        return <div className='shy-icon-picker' >
            <Tab keeplive rightBtns={<><Icon mousedown={e => this.onClearIcon()} icon={TrashSvg}></Icon></>}>
                <Tab.Page item={<Tip placement='bottom' id={LangID.IconEmoji}><Icon icon={EmojiSvg} size={18}></Icon></Tip>}>
                    <EmojiView onChange={e => this.onChange({ name: "emoji", code: e.code })}></EmojiView>
                </Tab.Page>
                <Tab.Page item={<Tip placement='bottom' id={LangID.IconFontAwesome}><Icon icon={FontawesomeSvg} size={30}></Icon></Tip>}>
                    <FontAwesomeView onChange={e => this.onChange({ name: "font-awesome", ...e })}></FontAwesomeView>
                </Tab.Page>
                <Tab.Page item={<Tip placement='bottom' id={LangID.IconUpload}><Icon icon={UploadSvg} size={30}></Icon></Tip>}>
                    <UploadView mine='image' change={e => this.onChange({ name: 'image', url: e.url })}></UploadView>
                </Tab.Page>
                <Tab.Page item={<Tip placement='bottom' id={LangID.ImageLink}><Icon icon={LinkSvg} size={18}></Icon></Tip>}>
                    <OutsideUrl change={e => this.onChange({ name: 'link', url: e })}></OutsideUrl>
                </Tab.Page>
            </Tab>
        </div>
    }
}
interface IconPicker {
    emit(name: 'change', data: IconArguments);
    only(name: 'change', fn: (data: IconArguments) => void);
}
export async function useIconPicker(pos: PopoverPosition) {
    let popover = await PopoverSingleton(IconPicker, { mask: true, visible: 'hidden' });
    let filePicker = await popover.open(pos);
    return new Promise((resolve: (data: IconArguments) => void, reject) => {
        filePicker.only('change', (data) => {
            popover.close();
            resolve(data);
        })
        popover.only('close', () => {
            resolve(null)
        })
    })
}