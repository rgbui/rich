import React from "react";
import { PopoverSingleton } from "../popover/popover";
import { EventsComponent } from "../../component/lib/events.component";
import { PopoverPosition } from "../popover/position";

export class TrashBox extends EventsComponent {
    render() {
         return <div>
            
         </div>
    }
    el: HTMLElement;
    isNav: boolean = false;
    async open(options?: { word?: string, isNav?: boolean }) {
        // if (options?.word) this.searchList.word = options?.word;
        // else this.searchList.word = '';
        // if (options?.isNav) this.isNav = true;
        // else this.isNav = false;
        // if (this.searchList.word) {
        //     await this.onForceSearch()
        // }
        this.forceUpdate();
    }
}

export async function useTrashBox(options?: { word?: string, isNav?: boolean }) {
    var pos: PopoverPosition = { center: true, centerTop: 100 };
    let popover = await PopoverSingleton(TrashBox, { mask: true, frame: true, shadow: true, });
    let fv = await popover.open(pos);
    fv.open(options);
    return new Promise((resolve: (p: { id: string, content?: string }) => void, reject) => {
        fv.only('save', (value) => {
            popover.close();
            resolve(value);
        });
        fv.only('close', () => {
            popover.close();
            resolve(null);
        });
        popover.only('close', () => {
            resolve(null)
        });
    })
}