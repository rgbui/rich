import { EventsComponent } from "../../component/lib/events.component";
import { LinkWs } from "../../src/page/declare";
import { PopoverSingleton } from "../../component/popover/popover";
import { PopoverPosition } from "../../component/popover/position";
import React from "react";
import { S } from "../../i18n/view";
import { channel } from "../../net/channel";
import { autoImageUrl } from "../../net/element.type";
import { util } from "../../util/util";
import { Button } from "../../component/view/button";
import { CheckSvg } from "../../component/svgs";
import { Icon } from "../../component/view/icon";

export class WsPicker extends EventsComponent {
    async onOpen() {
        await this.Search();
        this.forceUpdate();
    }
    render() {
        return <div className="bg-white w-350">
            <div className="gap-t-5 gap-w-5 padding-w-5"><span className="f-12 remark"><S>选择移动到的空间</S></span></div>
            <div className="max-h-250 overflow-y">
                {this.wss.map(ws => {
                    return <div
                        className={"flex gap-h-5 cursor round gap-w-5 padding-w-5 padding-h-3 item-hover-light" + (this.currentWs?.id == ws.id ? ' item-hover-focus' : '')}
                        onMouseDown={e => this.onSelect(ws)}
                        key={ws.id}>
                        <span className="flex-fixed">{ws.icon && <a className="size-48 flex-center round-16">
                            <img className="round-16 " src={autoImageUrl(ws.icon.url, 120)} style={{ width: 48, height: 48 }} />
                        </a>}{!ws.icon && <a style={{ color: '#3ba55d' }} className="flex-center size-48 bg-white shadow-s round-16"><span style={{ fontSize: 18 }}>{util.firstToUpper(ws?.text?.slice(0, 2))}</span>
                        </a>}
                        </span>
                        <span className="flex-auto gap-l-10 text-overflow">{ws.text}</span>
                        {this.currentWs?.id == ws.id && <span className="flex-fixed">
                            <Icon size={18} icon={CheckSvg}></Icon>
                        </span>}
                    </div>
                })}
                {this.wss.length == 0 && <div className="flex-center f-12 remark gap-h-10">
                    <S>没有可选择的空间</S></div>
                }
            </div>
            <div className="border-top padding-w-10 flex-end padding-h-5">
                <Button onMouseDown={e => this.onSave()}>确定</Button>
            </div>
        </div>
    }
    wss: LinkWs[] = [];
    async Search() {
        var r = await channel.query('/query/my/wss');
        this.wss = r.wss || [];
        this.forceUpdate();
    }
    currentWs: LinkWs;
    onSelect(ws: LinkWs) {
        this.currentWs = ws;
        this.forceUpdate();
    }
    onSave() {
        this.emit('change', this.currentWs);
    }
}


export async function useWsPicker(pos: PopoverPosition) {
    var popover = await PopoverSingleton(WsPicker, { mask: true });
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