import React from "react";
import { ReactNode } from "react";
import { EventsComponent } from "../../../../../component/lib/events.component";
import { PopoverSingleton } from "../../../../../extensions/popover/popover";
import { PopoverPosition } from "../../../../../extensions/popover/position";
import { CardPropsType } from "../declare";
import { CardFactory } from "../factory/factory";

var groups = [
    { name: 'text', text: '文字' },
    { name: 'image-text', text: '图文' },
    { name: 'image', text: '图片' }
]

export class CardSelector extends EventsComponent {
    name: string = 'image-text';
    render(): ReactNode {
        return <div className="padding-l-14 w-500 min-h-400 round   flex-full">
            <div className="flex-fixed w-100 padding-h-14 border-right padding-r-10">
                {groups.map(g => {
                    return <div
                        className={"h-30 flex padding-w-10  cursor round" + (this.name == g.name ? " item-hover-focus" : "item-hover")}
                        onMouseDown={e => { this.name = g.name; this.forceUpdate() }}
                        key={g.name}><span>{g.text}</span>
                    </div>
                })}
            </div>
            <div className="flex-auto overflow-y h-400 padding-14">
                {this.getStores().findAll(c => c.group == this.name).map(cs => {
                    return <div className={"padding-14 round cursor item-hover" + (this.selectUrl == cs.url ? " item-focus-hover" : "")} onMouseDown={e => this.onMousedown(cs, e)} key={cs.url}>
                        <div className="gap-b-10"><img className="round-8" style={{ maxWidth: 300 }} src={cs.image} /></div>
                        <div className="text f-14">{cs.title}</div>
                        <div className="remark f-12">{cs.remark}</div>
                    </div>
                })}
            </div>
        </div>
    }
    getStores() {
        return Array.from(CardFactory.CardModels.values())
    }
    selectUrl: string = '';
    open(props: { url?: string }) {
        this.selectUrl = props.url || '';
        this.forceUpdate()
    }
    onMousedown(d, event: React.MouseEvent) {
        this.emit('save', d)
    }
}

export async function useCardSelector(pos: PopoverPosition, item: { url?: string }) {
    let popover = await PopoverSingleton(CardSelector, { mask: true });
    let cardSelector = await popover.open(pos);
    cardSelector.open(item);
    return new Promise((resolve: (data: CardPropsType) => void, reject) => {
        popover.only('close', () => {
            resolve(null)
        });
        cardSelector.only('save', (d) => {
            popover.close()
            resolve(d)
        })
    })
}