
import React from "react";
import { EventsComponent } from "../../../component/lib/events.component";
import { Button } from "../../../component/view/button";
import { Input } from "../../../component/view/input";
import { PopoverSingleton } from "../../popover/popover";
import { PopoverPosition } from "../../popover/position";

export class DataGridCreate extends EventsComponent {
    render() {
        return <div className="data-grid-create">
            <Input value={this.text} onChange={e => { this.text = e }}></Input>
            <Button onClick={e => this.onChange()}>创建</Button>
        </div>
    }
    text: string = '';
    onChange() {
        if (this.text) {
            this.emit('save', this.text);
        }
    }
}

export async function useDataGridCreate(pos: PopoverPosition) {
    let popover = await PopoverSingleton(DataGridCreate);
    let fv = await popover.open(pos);
    return new Promise((resolve: (data: { text: string }) => void, reject) => {
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
