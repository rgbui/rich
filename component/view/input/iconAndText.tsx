import React from "react";
import { Input } from ".";
import { IconArguments } from "../../../extensions/icon/declare";
import { Icon } from "../icon";
import { EventsComponent } from "../../lib/events.component";
import { useIconPicker } from "../../../extensions/icon";
import { Rect } from "../../../src/common/vector/point";
import { PopoverPosition } from "../../popover/position";
import { PopoverSingleton } from "../../popover/popover";
import lodash from "lodash";
import { util } from "../../../util/util";


class InputIconAndText extends EventsComponent {
    async onChangeIcon(event: React.MouseEvent) {
        var icon = await useIconPicker({ roundArea: Rect.fromEle(this.el) });
        if (icon) {
            this.icon = icon;
            this.forceUpdate();
        }
    }
    el: HTMLDivElement;
    render() {
        return <div className="flex w-400 bg-white shadow padding-10 round" ref={e => this.el = e}>
            {this.ignoreIcon == false && <span onMouseDown={e => this.onChangeIcon(e)} className="flex-fixed size-24 border round cursor flex-center gap-r-10"><Icon icon={this.icon} size={16}></Icon></span>}
            <span className="flex-auto">
                <Input
                    value={this.text}
                    ref={e => this.input = e}
                    placeholder={this.placeholder}
                    onChange={e => {
                        this.text = e;
                    }} onEnter={e => {
                        this.text = e;
                        this.onSave();
                    }}></Input>
            </span>
        </div>
    }
    input: Input;
    icon: IconArguments;
    text: string;
    placeholder: string;
    ignoreIcon: boolean = false;
    open(options: { icon?: IconArguments, ignoreIcon?: boolean, placeholder?: string, text: string }) {
        var ops = lodash.cloneDeep(options);
        Object.assign(this, { text: '', ignoreIcon: false, placeholder: '' }, ops);
        this.input.updateValue(this.text)
        this.forceUpdate(async () => {
            await util.delay(100);
            this.input.focus();
        });
    }
    onSave() {
        this.emit('save', this.get())
    }
    get() {
        return {
            text: this.text,
            icon: lodash.cloneDeep(this.icon)
        }
    }
}

export async function useInputIconAndText(pos: PopoverPosition, options: { icon?: IconArguments, ignoreIcon?: boolean, placeholder?: string, text: string }) {
    let popover = await PopoverSingleton(InputIconAndText, { mask: true });
    let inputIconAndText = await popover.open(pos);
    inputIconAndText.open(options)
    return new Promise((resolve: (value?: { text: string, icon: IconArguments }) => void, reject) => {
        popover.only('close', () => {
            resolve(inputIconAndText.get())
        })
        inputIconAndText.only('save', e => {
            resolve(e);
        })
        inputIconAndText.only('close', () => {
            popover.close()
            resolve()
        })
    })
}