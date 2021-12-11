import React from "react";
import { Link } from "../../blocks/at/link";
import { EventsComponent } from "../../component/lib/events.component";
import { Icon } from "../../component/view/icon";
import { Tab } from "../../component/view/tab";
import { Tip } from "../../component/view/tip";
import { LangID } from "../../i18n/declare";
import { ResourceArguments } from "../icon/declare";
import { PopoverSingleton } from "../popover/popover";
import { PopoverPosition } from "../popover/position";
import { OutsideUrl } from "./outside";

class OutSideUrlInput extends EventsComponent {
    onChange(data: any) {
        this.emit('select', { ...data });
    }
    render() {
        return <div className='shy-file-picker' >
            <Tab keeplive>
                <Tab.Page item={<Tip placement='bottom' id={LangID.ImageLink}><Icon size={30} icon={Link}></Icon></Tip>}>
                    <OutsideUrl change={e => this.onChange({ name: 'link', url: e })}></OutsideUrl>
                </Tab.Page>
            </Tab>
        </div>
    }
}

interface OutSideUrlInput {
    only(name: 'select', fn: (data: ResourceArguments) => void);
    emit(name: 'select', data: ResourceArguments);
}

export async function useOutSideUrlInput(pos: PopoverPosition) {
    let popover = await PopoverSingleton(OutSideUrlInput);
    let outSideUrlInput = await popover.open(pos);
    return new Promise((resolve: (data: ResourceArguments) => void, reject) => {
        outSideUrlInput.only('select', (data) => {
            popover.close();
            resolve(data);
        })
        popover.only('close', () => {
            resolve(null)
        })
    })
}