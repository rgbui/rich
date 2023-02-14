
import React from "react";
import { ReactNode } from "react";
import { EventsComponent } from "../../../../../component/lib/events.component";
import { Button } from "../../../../../component/view/button";
import { PopoverSingleton } from "../../../../../extensions/popover/popover";
import { PopoverPosition } from "../../../../../extensions/popover/position";
import { CardPropsType } from "../declare";
import { CardFactory } from "../factory/factory";

export class CardSelector extends EventsComponent {
    name: string = 'image-text';
    render(): ReactNode {
        return <div className="padding-l-14 w-500 round ">
            <div className=" min-h-400  flex-full">
                <div className="flex-fixed w-150  overflow-y h-400 padding-h-14 border-right padding-r-10">
                    {this.getStores().map(cs => {
                        return <div className={"padding-14 round cursor item-hover" + (this.selectUrl == cs.url ? " item-focus-hover" : "")} onMouseDown={e => this.onSelect(cs, e)} key={cs.url}>
                            <div className="gap-b-10"><img className="round-8" style={{ maxWidth: 120 }} src={cs.image} /></div>
                            <div className="text f-14">{cs.title}</div>
                            <div className="remark f-12">{cs.remark}</div>
                        </div>
                    })}
                </div>
                <div className="flex-auto overflow-y h-400 padding-14">
                    {this.current && <div>
                        <div className="gap-b-10"><img className="round-8" style={{ maxWidth: 300 }} src={this.current.image} /></div>
                        <div className="text f-14">{this.current.title}</div>
                        <div className="remark f-12">{this.current.remark}</div>
                    </div>}
                </div>
            </div>
            <div className="flex-end gap-w-14">
                <Button size="small" onMouseDown={e => this.onSave()} className="gap-r-10">确定</Button>
                <Button size="small" ghost>取消</Button>
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
    onSelect(d: CardPropsType, event: React.MouseEvent) {
        //this.emit('save', d)
        this.selectUrl = d.url;
        this.current = d;
    }
    onSave() {

        this.emit('save', this.current)
    }
    current: CardPropsType;
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