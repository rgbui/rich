
import React from "react";
import { ReactNode } from "react";
import { EventsComponent } from "../../../../../component/lib/events.component";
import { Button } from "../../../../../component/view/button";
import { Divider } from "../../../../../component/view/grid";
import { PopoverSingleton } from "../../../../../component/popover/popover";
import { PopoverPosition } from "../../../../../component/popover/position";
import { CardPropsType } from "../declare";
import { CardFactory } from "../factory/factory";
import { TableSchema } from "../../../schema/meta";
import { S } from "../../../../../i18n/view";

export class CardSelector extends EventsComponent {
    render(): ReactNode {
        return <div className="w-500 round ">
            <div className="h4 gap-14"><S>数据模板</S></div>
            <div className="flex h-400 overflow-y flex-wrap">
                {this.getStores().map(cs => {
                    return <div
                        className={"padding-14 w-160 flex flex-col  round cursor item-hover" + (this.selectUrl == cs.url ? " item-focus-hover" : "")}
                        onMouseDown={e => this.onSelect(cs, e)}
                        key={cs.url}>
                        <div className="gap-b-10 flex-center"><img className="round-8 obj-center" style={{ width: 120, height: 80 }} src={cs.image} /></div>
                        <div className="text f-14 flex-center">{cs.title}</div>
                        <div className="remark f-12 flex-center">{cs.remark}</div>
                    </div>
                })}
            </div>
            <Divider></Divider>
            <div className="padding-w-14 flex-end  min-h-40">
                <Button onMouseDown={e => this.onSave()} className="gap-r-10"><S>确定</S></Button>
                <Button ghost onMouseDown={e => this.onClose()}><S>取消</S></Button>
            </div>
        </div>
    }
    getStores() {
        return Array.from(CardFactory.CardModels.values()).findAll(g => !this.forUrl || !Array.isArray(g.forUrls) || this.forUrl && Array.isArray(g.forUrls) && g.forUrls.includes(this.forUrl)).filter(g => g.abled !== false)
    }
    selectUrl: string = '';
    schema: TableSchema = null;
    forUrl?: string;
    open(props?: { schema?: TableSchema, forUrl?: string, item?: { url?: string } }) {
        this.selectUrl = props?.item?.url || '';
        this.schema = props?.schema;
        this.forUrl = props?.forUrl;
        this.forceUpdate()
    }
    onSelect(d: CardPropsType, event: React.MouseEvent) {
        this.selectUrl = d.url;
        this.current = d;
        this.forceUpdate();
        this.emit('save', d)
    }
    onSave() {
        this.emit('save', this.current)
    }
    onClose() {
        this.emit('close');
    }
    current: CardPropsType;
}

export async function useCardSelector(pos: PopoverPosition, options?: { schema?: TableSchema, forUrl?: string, item?: { url?: string } }) {
    let popover = await PopoverSingleton(CardSelector, { mask: true });
    let cardSelector = await popover.open(pos);
    cardSelector.open(options);
    return new Promise((resolve: (data: CardPropsType) => void, reject) => {
        popover.only('close', () => {
            resolve(null)
        });
        cardSelector.only('close', d => {
            popover.close()
            resolve(null)
        })
        cardSelector.only('save', (d) => {
            popover.close()
            resolve(d)
        })
    })
}