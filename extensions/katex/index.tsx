import React from "react";
import { EventsComponent } from "../../component/lib/events.component";
import { Textarea } from "../../component/view/input";
import { PopoverSingleton } from "../popover/popover";
import { PopoverPosition } from "../popover/position";
import "./style.less";

class KatexInput extends EventsComponent {
    content: string;
    open(content: string) {
        this.content = content;
        this.forceUpdate();
    }
    render() {
        var self = this;
        function change(content: string) {
            self.content = content;
            self.emit('input', self.content);
        }
        return <div className="shy-katex-form">
            <Textarea value={this.content} onChange={e => change(e)}></Textarea>
        </div>
    }
}

interface KatexInput {
    only(name: 'input', fn: (data: string) => void);
    emit(name: 'input', data: string);
}

export async function listenKatexInput(pos: PopoverPosition, content: string, listen?: (data) => void) {
    let popover = await PopoverSingleton(KatexInput);
    let katexInput = await popover.open(pos);
    katexInput.open(content);
    return new Promise((resolve: (data: string) => void, reject) => {
        katexInput.only('input', (data) => {
            //popover.close();
            // resolve(data);
            if (listen) listen(data)
        })
        popover.only('close', () => {
            resolve(katexInput.content)
        })
    })
}