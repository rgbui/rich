import React from "react";
import { ReactNode } from "react";
import { EventsComponent } from "../../../../../component/lib/events.component";
import { PopoverSingleton } from "../../../../../extensions/popover/popover";
import { PopoverPosition } from "../../../../../extensions/popover/position";
import { CardPropsType } from "../declare";
import { CardFactory } from "../factory/factory";

export class CardSelector extends EventsComponent {
    render(): ReactNode {
        return <div className="padding-h-14 round max-h-300 overflow-y">
            {this.getStores().map(cs => {
                return <div className={"padding-14 round cursor item-hover" + (this.selectUrl == cs.url ? " item-focus-hover" : "")} onMouseDown={e => this.onMousedown(cs, e)} key={cs.url}>
                    <div className="gap-b-10"><img className="round-30" style={{ maxWidth: 300 }} src={cs.image} /></div>
                    <div className="text f-14">{cs.title}</div>
                    <div className="remark f-12">{cs.remark}</div>
                </div>
            })}
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