
import React from "react";
import { Tip } from "../../component/view/tooltip/tip";
import { EventsComponent } from "../../component/lib/events.component";

import { UploadView } from "../file/upload";
import { EmojiView } from "../emoji/view";
import { FontAwesomeView } from "../font-awesome";
import { ByteDanceIconView } from "../byte-dance.icons";
import { OutsideUrl } from "../link/outside";
import { Tab } from "../../component/view/tab";
import { IconArguments } from "./declare";
import { PopoverSingleton } from "../../component/popover/popover";
import { PopoverPosition } from "../../component/popover/position";
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

class IconPicker extends EventsComponent {
    onChange(data: IconArguments) {
        this.emit('change', data);
    }
    onClearIcon() {
        this.emit('change', null);
    }
    fav: FontAwesomeView;
    byte: ByteDanceIconView;
    ev: EmojiView;
    render() {
        return <div className='shy-icon-picker' >
            <Tab keeplive rightBtns={<>
                <ToolTip overlay={'清理图标'}><span className="flex-center item-hover size-30 round cursor gap-l-10"><Icon size={16} onMousedown={e => this.onClearIcon()} icon={TrashSvg}></Icon>
                </span>
                </ToolTip>
            </>}>
                <Tab.Page item={<Tip placement='bottom' text='表情'><Icon icon={EmojiSvg} size={18}></Icon></Tip>}>
                    <EmojiView ref={e => this.ev = e} onChange={e => this.onChange({ name: "emoji", code: e.code })}></EmojiView>
                </Tab.Page>
                <Tab.Page item={<Tip placement='bottom' text='SVG图标'><Icon icon={{ name: 'bytedance-icon', code: 'oval-love-two' }} size={18}></Icon></Tip>}>
                    <ByteDanceIconView ref={e => this.byte = e} onChange={e => this.onChange({ name: "bytedance-icon", ...e })}></ByteDanceIconView>
                </Tab.Page>
                <Tab.Page item={<Tip placement='bottom' text='FontAwesome' ><Icon icon={FontawesomeSvg} size={24}></Icon></Tip>}>
                    <FontAwesomeView ref={e => this.fav = e} onChange={e => this.onChange({ name: "font-awesome", ...e })}></FontAwesomeView>
                </Tab.Page>
                <Tab.Page item={<Tip placement='bottom' text='上传图标'><Icon icon={UploadSvg} size={20}></Icon></Tip>}>
                    <UploadView mine='image' change={e => this.onChange({ name: 'image', url: e.url })}></UploadView>
                </Tab.Page>
                <Tab.Page item={<Tip placement='bottom' text='图片链接'><Icon icon={LinkSvg} size={18}></Icon></Tip>}>
                    <OutsideUrl change={e => this.onChange({ name: 'link', url: e })}></OutsideUrl>
                </Tab.Page>
            </Tab>
        </div>
    }
    open(d: IconArguments) {
        if (d && d.name == 'font-awesome') {
            if (this.fav) this.fav.open(d)
        }
        if (this.fav) this.fav.onClear()
        if (this.ev) this.ev.onClear()
        if (this.byte) this.byte.onClear()
    }
}
interface IconPicker {
    emit(name: 'change', data: IconArguments);
    only(name: 'change', fn: (data: IconArguments) => void);
}
export async function useIconPicker(pos: PopoverPosition, data?: IconArguments) {
    let popover = await PopoverSingleton(IconPicker, { mask: true, visible: 'hidden' });
    let filePicker = await popover.open(pos);
    filePicker.open(data)
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