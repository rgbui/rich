import React from "react";
import { EventsComponent } from "../../../component/lib/events.component";
import { Button } from "../../../component/view/button";
import { Icon } from "../../../component/view/icon";
import { Input } from "../../../component/view/input";
import { PopoverSingleton } from "../../popover/popover";
import { PopoverPosition } from "../../popover/position";
import "./style.less";
import { getSchemaViewIcon, getSchemaViews } from "../../../blocks/data-grid/schema/util";
import { Divider } from "../../../component/view/grid";
import { CheckSvg } from "../../../component/svgs";

export class DataGridCreate extends EventsComponent {
    render() {
        var vs = getSchemaViews();
        return <div className="data-grid-create">
            <div className="gap-w-10"><Input placeholder={this.selectView ? "输入视图名" : "输入创建的数据表格名称"} value={this.text} onChange={e => { this.text = e }}></Input></div>
            <Divider></Divider>
            {this.selectView && <div className="data-grid-create-views">
                {vs.map(v => {
                    return <div
                        key={v.url}
                        onMouseDown={e => this.selectUrl(v.url)}
                        className={'padding-w-10 cursor flex item-hover round h-30' + (this.url == v.url ? " hover" : "")}>
                        <span className="flex-fix  flex-center size-24 round"><Icon size={14} icon={getSchemaViewIcon(v.url)}></Icon></span>
                        <span className="flex-auto f-14 ">{v.text}</span>
                        {this.url == v.url && <span className="size-24 flex-center flex-fix"><Icon className={'flex-fix '} size={14} icon={CheckSvg}></Icon></span>}
                    </div>
                })}
            </div>}
            <div className="gap-w-10"><Button block onClick={e => this.onChange()}>创建</Button></div>
        </div>
    }
    selectView: boolean = false;
    open(options: { selectView: boolean }) {
        this.url = '/data-grid/table';
        if (options) {
            Object.assign(this, options);
            this.forceUpdate();
        }
    }
    selectUrl(url: string) {
        this.url = url;
        this.forceUpdate();
    }
    text: string = '';
    url: string = '';
    onChange() {
        if (this.text) {
            this.emit('save', { text: this.text, url: this.url });
        }
    }
}

export async function useDataGridCreate(pos: PopoverPosition, options?: { selectView: boolean }) {
    let popover = await PopoverSingleton(DataGridCreate, { mask: true });
    let fv = await popover.open(pos);
    fv.open(options);
    return new Promise((resolve: (data: {
        text: string,
        url: string
    }) => void, reject) => {
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

