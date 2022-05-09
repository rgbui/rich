
import React from "react";
import { Tip } from "../../component/view/tip";
import { LangID } from "../../i18n/declare";
import { EventsComponent } from "../../component/lib/events.component";
import Emoji from "../../src/assert/svg/emoji.svg";
import FontAwesome from "../../src/assert/svg/fontawesome.svg";
import Link from "../../src/assert/svg/link.svg";
import Upload from "../../src/assert/svg/upload.svg";
import { UploadView } from "../file/upload";
import { EmojiView } from "../emoji/view";
import { FontAwesomeView } from "../font-awesome";
import { OutsideUrl } from "../link/outside";
import { Tab } from "../../component/view/tab";
import { IconArguments } from "./declare";
import { PopoverSingleton } from "../popover/popover";
import { PopoverPosition } from "../popover/position";
import './style.less';
import { LinkSvg } from "../../component/svgs";
import { Icon } from "../../component/view/icon";
class IconPicker extends EventsComponent {
    onChange(data: IconArguments) {
        this.emit('change', data);
    }
    render() {
        return <div className='shy-icon-picker' >
            <Tab keeplive>
                <Tab.Page item={<Tip placement='bottom' id={LangID.IconEmoji}><Emoji ></Emoji></Tip>}>
                    <EmojiView onChange={e => this.onChange({ name: "emoji", code: e.code })}></EmojiView>
                </Tab.Page>
                <Tab.Page item={<Tip placement='bottom' id={LangID.IconFontAwesome}><FontAwesome ></FontAwesome></Tip>}>
                    <FontAwesomeView onChange={e => this.onChange({ name: "font-awesome", ...e })}></FontAwesomeView>
                </Tab.Page>
                <Tab.Page item={<Tip placement='bottom' id={LangID.IconUpload}><Upload ></Upload></Tip>}>
                    <UploadView mine='image' change={e => this.onChange({ name: 'image', url: e })}></UploadView>
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