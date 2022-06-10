import React from "react";
import { EventsComponent } from "../../component/lib/events.component";
import './style.less';
import { EmojiCode } from "./store";
import { EmojiView } from "./view";
import { PopoverSingleton } from "../popover/popover";
import { PopoverPosition } from "../popover/position";
/**
 * https://www.zhangxinxu.com/wordpress/2020/03/css-emoji-opentype-svg-fonts/
 */
export class EmojiPicker extends EventsComponent {
    render() {
        return <div className='shy-emoji-picker' ><EmojiView onChange={e => this.onPick(e)}></EmojiView></div>
    }
    private onPick(emoji: EmojiCode) {
        this.emit('pick', emoji);
    }
}
export interface EmojiPicker {
    only(name: 'pick', fn: (data: EmojiCode) => void);
    emit(name: 'pick', data: EmojiCode);
}
export async function useOpenEmoji(pos: PopoverPosition) {
    var popover = await PopoverSingleton(EmojiPicker, { mask: true });
    var emojiPicker = await popover.open(pos);
    return new Promise((resolve: (emoji: EmojiCode) => void, reject) => {
        emojiPicker.only('pick', (data) => {
            resolve(data);
            popover.close();
        });
        popover.only('close', () => {
            resolve(null);
        })
    })
}
