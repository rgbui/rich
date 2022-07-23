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
        return <div className="data-grid-create">
            <div style={{ margin: '0px 10px' }}><Input value={this.text} onChange={e => { this.text = e }}></Input></div>
            {this.selectView && <><Divider ></Divider><div className="data-grid-create-views">
                {getSchemaViews().map(v => {
                    return <div
                        key={v.url}
                        onMouseDown={e => this.selectUrl(v.url)}
                        className={this.url == v.url ? "hover" : ""}>
                        <Icon size={14} icon={getSchemaViewIcon(v.url)}></Icon>
                        <span>{v.text}</span>
                        {this.url == v.url && <Icon size={14} icon={CheckSvg}></Icon>}
                    </div>
                })}
            </div></>}
            <div style={{ margin: '0px 10px' }}><Button block onClick={e => this.onChange()}>创建</Button></div>
        </div>
    }
    selectView: boolean = false;
    open(options: { selectView: boolean }) {
        this.url = '';
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

