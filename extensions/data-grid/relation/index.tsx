import React from "react";
import { ReactNode } from "react";
import { TableSchema } from "../../../blocks/data-grid/schema/meta";
import { EventsComponent } from "../../../component/lib/events.component";
import { CheckSvg, CollectTableSvg } from "../../../component/svgs";
import { Icon } from "../../../component/view/icon";
import { channel } from "../../../net/channel";
import { util } from "../../../util/util";
import { PopoverSingleton } from "../../popover/popover";
import { PopoverPosition } from "../../popover/position";
import "./style.less";

export class DataSourceView extends EventsComponent {
    render(): ReactNode {
        return <div className="w-200 overflow-y max-h-300 padding-h-14 round">
            {this.relationDatas && this.relationDatas.map(r => {
                return <div onMouseDown={e => this.onChange(r.id)} key={r.id} className="padding-w-14 f-14 item-hover round cursor">
                    <div className="flex">
                        <span className="flex-fixed flex-center size-24 round item-hover">
                            <Icon size={16} icon={(r as any).icon || CollectTableSvg}></Icon>
                        </span>
                        <span className="flex-auto">{r.text}</span>
                        <span className="flex-fixed size-24 round item-hover">
                            {r.id == this.currentTableId && <Icon size={16} icon={CheckSvg}></Icon>}
                        </span>
                    </div>
                    <div className="remark gap-b-10">{util.showTime(r.createDate)}</div>
                </div>
            })}
        </div>
    }
    private relationDatas: TableSchema[];
    currentTableId: string = '';
    async open(option: { tableId: string }) {
        this.currentTableId = option.tableId;
        if (!this.relationDatas) await this.loadTypeDatas();
        this.forceUpdate();
    }
    async loadTypeDatas() {
        var isUpdate: boolean = false;
        if (!Array.isArray(this.relationDatas)) {
            var r = await channel.get('/schema/list');
            if (r.ok) {
                this.relationDatas = r.data.list as TableSchema[];
                isUpdate = true;
            }
        }
    }
    async onChange(id: string) {
        this.currentTableId = id;
        this.emit('save', id);
    }
}

export async function useDataSourceView(pos: PopoverPosition,
    option: {
        tableId: string,
    }) {
    let popover = await PopoverSingleton(DataSourceView, { mask: true });
    let fv = await popover.open(pos);
    fv.open(option);
    return new Promise((resolve: (data: string) => void, reject) => {
        fv.only('close', () => {
            popover.close();
            resolve(undefined);
        })
        fv.only('save', (g) => {
            resolve(g);
            popover.close();
        })
        popover.only('close', () => {
            resolve(undefined);
        })
    })
}