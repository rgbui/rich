
import React from "react";
import { Tip } from "../../component/view/tooltip/tip";
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
import {
    EmojiSvg,
    FontawesomeSvg,
    LinkSvg,
    RandomSvg,
    TrashSvg,
    UploadSvg
} from "../../component/svgs";

import { Icon } from "../../component/view/icon";
import { ToolTip } from "../../component/view/tooltip";
import { emojiStore } from "../emoji/store";
class IconPicker extends EventsComponent {
    onChange(data: IconArguments) {
        this.emit('change', data);
    }
    onClearIcon() {
        this.emit('change', null);
    }
    async onRandomIcon() {
        var e = await emojiStore.getRandom()
        this.onChange({ name: "emoji", code: e.code })
    }
    render() {
        return <div className='shy-icon-picker' >
            <Tab keeplive rightBtns={<>
                <ToolTip overlay={'随机图标'}> <span className="flex-center item-hover size-30 round cursor"><Icon size={16} onMousedown={e => this.onRandomIcon()} icon={RandomSvg}></Icon>
                </span>
                </ToolTip>
                <ToolTip overlay={'清理图标'}> <span className="flex-center item-hover size-30 round cursor gap-r-10"><Icon size={16} onMousedown={e => this.onClearIcon()} icon={TrashSvg}></Icon>
                </span>
                </ToolTip>
            </>}>
                <Tab.Page item={<Tip placement='bottom' id={LangID.IconEmoji}><Icon icon={EmojiSvg} size={18}></Icon></Tip>}>
                    <EmojiView onChange={e => this.onChange({ name: "emoji", code: e.code })}></EmojiView>
                </Tab.Page>
                <Tab.Page item={<Tip placement='bottom' id={LangID.IconFontAwesome}><Icon icon={FontawesomeSvg} size={24}></Icon></Tip>}>
                    <FontAwesomeView onChange={e => this.onChange({ name: "font-awesome", ...e })}></FontAwesomeView>
                </Tab.Page>
                <Tab.Page item={<Tip placement='bottom' id={LangID.IconUpload}><Icon icon={UploadSvg} size={18}></Icon></Tip>}>
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
            resolve(undefined)
        })
    })
}