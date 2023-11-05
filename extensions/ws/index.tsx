import { ReactNode } from "react";
import { EventsComponent } from "../../component/lib/events.component";
import { LinkWs } from "../../src/page/declare";
import { PopoverSingleton } from "../../component/popover/popover";
import { PopoverPosition } from "../../component/popover/position";
import React from "react";
import { S } from "../../i18n/view";
import { channel } from "../../net/channel";
import { autoImageUrl } from "../../net/element.type";
import { util } from "../../util/util";
export class WsPicker extends EventsComponent {
    async onOpen() {
        await this.Search();
        this.forceUpdate();
    }
    render(): ReactNode {
        return <div className="bg-white w-200  ">
            <div className="gap-h-5 padding-w-10"><span className="f-12 remark"><S>选择空间</S></span></div>
            <div className="max-h-250 overflow-y">
                {this.wss.map(ws => {
                    return <div
                        className="flex gap-h-5 cursor round padding-w-10 padding-h-3 item-hover-focus item-hover-light"
                        onMouseDown={e => this.onSelect(ws)}
                        key={ws.id}>
                        <span className="flex-fixed">{ws.icon && <a className="size-48 flex-center round-16">
                            <img src={autoImageUrl(ws.icon.url, 120)} style={{ width: 48, height: 48 }} />
                        </a>}{!ws.icon && <a style={{ color: '#3ba55d' }} className="flex-center size-48 bg-white round-16"><span style={{ fontSize: 18 }}>{util.firstToUpper(ws?.text?.slice(0, 2))}</span>
                        </a>}
                        </span>
                        <span className="flex-auto gap-l-10">{ws.text}</span>
                    </div>
                })}
            </div>
        </div>
    }
    wss: LinkWs[] = [];
    async Search() {
        var r = await channel.query('/query/my/wss');
        console.log('r', r);
        this.wss = r.wss || [];
        this.forceUpdate();
    }
    onSelect(ws: LinkWs) {
        this.emit('change', ws);
    }
}


export async function useWsPicker(pos: PopoverPosition) {
    var popover = await PopoverSingleton(WsPicker, {});
    var picker = await popover.open(pos);
    await picker.onOpen();
    return new Promise((resolve: (link: LinkWs) => void, reject) => {
        picker.on('change', (link: LinkWs) => {
            resolve(link);
            popover.close();
        })
        popover.on('close', () => resolve(null))
    })
}