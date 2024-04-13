import React from "react";
import { EventsComponent } from "../../../component/lib/events.component";
import { PopoverSingleton } from "../../../component/popover/popover";
import { PopoverPosition } from "../../../component/popover/position";
import { getChartViews, getSchemaViewIcon, getSchemaViews } from "../../../blocks/data-grid/schema/util";
import { MenuItemType } from "../../../component/view/menu/declare";
import { lst } from "../../../i18n/store";
import { CardFactory } from "../../../blocks/data-grid/template/card/factory/factory";
import { CheckSvg, PlusSvg } from "../../../component/svgs";
import { Icon } from "../../../component/view/icon";
import { TableSchema } from "../../../blocks/data-grid/schema/meta";
import { Input } from "../../../component/view/input";
import { Button } from "../../../component/view/button";
import { S } from "../../../i18n/view";
import { HelpText } from "../../../component/view/text";
import { Divider } from "../../../component/view/grid";

/**
 * 
 * 创建数据表格视图
 * 
 */
export class DataGridCreateView extends EventsComponent {
    url: string = '/data-grid/table';
    source: 'tableView' | 'dataView' = 'tableView';
    viewText: string = '';
    render() {
        return <div className="w-300">
            <div className="gap-w-10 gap-h-10"><Input placeholder={lst('数据表视图')} value={this.viewText} onChange={e => { this.viewText = e }}  ></Input></div>
            <div>
                <div className="flex padding-w-10 h-30 f-14 r-padding-w-10 r-round r-gap-r-10 r-h-24 r-flex-center r-cursor" >
                    <span onMouseDown={e => { this.mode = 'base'; this.forceUpdate() }} className={(this.mode == 'base' ? "item-hover-light-focus" : "item-hover")}><S>视图</S></span>
                    <span onMouseDown={e => { this.mode = 'chart'; this.forceUpdate() }} className={(this.mode == 'chart' ? "item-hover-light-focus" : "item-hover")}><S>图表</S></span>
                    <span onMouseDown={e => { this.mode = 'template'; this.forceUpdate() }} className={(this.mode == 'template' ? "item-hover-light-focus" : "item-hover")}><S>模板</S></span>
                </div>
                <Divider></Divider>
                <div className="max-h-250 padding-w-10 overflow-y">
                    {this.mode == 'base' && this.renderBase()}
                    {this.mode == 'template' && this.renderTemplate()}
                    {this.mode == 'chart' && this.renderCharts()}
                </div>
            </div>
            <div className="gap-w-10 gap-h-10">
                <Button onMouseDown={e => this.onSave()} block><Icon size={18} icon={PlusSvg}></Icon><S>创建视图</S></Button>
            </div>
            <div className="gap-w-10">
                <HelpText url={window.shyConfig?.isUS ? "https://help.shy.red/page/44#p6dtzzCsUHUrhyfNdrfkXh" : "https://help.shy.live/page/288#eNk3NZZyXWMCgMEMCyJRcG"}><S>了解如何创建数据表视图</S></HelpText>
            </div>
        </div>
    }
    mode: 'base' | 'template' | 'chart' = 'base';
    renderBase() {
        var views = getSchemaViews();
        return <div>
            {views.map(v => {
                return <div className="flex h-30 padding-w-10 item-hover round cursor" onMouseDown={e => {
                    this.url = v.url;
                    this.source = 'tableView';
                    this.forceUpdate();
                }} key={v.url}>
                    <span className="flex-fixed size-20 flex-center">
                        <Icon size={16} icon={getSchemaViewIcon(v as any)}></Icon>
                    </span>
                    <span className="flex-auto">{v.text}</span>
                    <label className="flex-fixed">{this.url == v.url && <Icon size={16} icon={CheckSvg}></Icon>}</label>
                </div>
            })}
        </div>
    }
    renderTemplate() {
        var self = this;
        var cms = CardFactory.getCardModels(this.schema);
        return <div className="gap-t-10">
            <div className="f-12  remark flex"><span className="flex-auto">选择数据表模板</span>
            </div>
            <div className="">
                {cms.map((c, i) => {
                    return <div key={i} onMouseDown={e => {
                        self.url = c.model.url;
                        self.source = 'dataView';
                        self.forceUpdate()
                    }} className="flex-full relative item-hover round padding-w-10 padding-h-5">
                        <div className="flex-fixed">
                            <img src={c.model.image} className="obj-center h-40 w-80" />
                        </div>
                        <div className="flex-auto gap-l-10 f-14">
                            <div>{c.model.title}</div>
                            <div className="remark">{c.model.remark}</div>
                        </div>
                        {self.source == 'dataView' && self.url == c.model.url && <div className="pos pos-right pos-t-5 pos-r-5 size-20 cursor round">
                            <Icon size={16} icon={CheckSvg}></Icon>
                        </div>}
                    </div>
                })}
            </div>
        </div>
    }
    renderCharts() {
        var views = getChartViews();
        return <div>
            {views.map((v, i) => {
                if (v?.type == MenuItemType.divide) return <div key={i}></div>
                return <div key={i} className="flex h-30  padding-w-10  item-hover round cursor" onMouseDown={e => {
                    this.url = v.url;
                    this.source = 'tableView';
                    this.forceUpdate();
                }}>
                    <span className="flex-fixed size-20 flex-center">
                        <Icon size={16} icon={getSchemaViewIcon(v as any)}></Icon>
                    </span>
                    <span className="flex-auto">{v.text}</span>
                    <label className="flex-fixed">{this.url == v.url && <Icon size={16} icon={CheckSvg}></Icon>}</label>
                </div>
            })}
        </div>
    }
    onSave() {
        var self = this;
        self.emit('save', {
            text: self.viewText,
            url: self.url,
            source: self.source
        })
    }
    schema: TableSchema = null;
    async open(options: { schema: TableSchema }) {

        this.schema = options?.schema;
        this.forceUpdate();
    }
}

export async function useCreateDataGridView(pos: PopoverPosition, options?: { schema: TableSchema }) {
    let popover = await PopoverSingleton(DataGridCreateView, { mask: true });
    let fv = await popover.open(pos);
    await fv.open(options);
    return new Promise((resolve: (data: {
        schemaId?: string,
        syncBlockId?: string,
        url?: string,
        text?: string,
        source?: DataGridCreateView['source']
    }) => void, reject) => {
        fv.only('save', (value) => {
            console.log('save value', value);
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

