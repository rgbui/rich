import React from "react";
import { EventsComponent } from "../../../component/lib/events.component";
import { Input } from "../../../component/view/input";
import { PopoverSingleton } from "../../../component/popover/popover";
import { PopoverPosition } from "../../../component/popover/position";
import { getSchemaViewIcon, getSchemaViews } from "../../../blocks/data-grid/schema/util";
import { CheckSvg, CloseSvg, CollectTableSvg, TriangleSvg } from "../../../component/svgs";
import { TableSchema } from "../../../blocks/data-grid/schema/meta";
import lodash from "lodash";
import { lst } from "../../../i18n/store";
import { BlockUrlConstant } from "../../../src/block/constant";
import { CardFactory } from "../../../blocks/data-grid/template/card/factory/factory";
import { Icon } from "../../../component/view/icon";
import { Button } from "../../../component/view/button";
import { Tab } from "../../../component/view/tab";
import { Tip } from "../../../component/view/tooltip/tip";
import { HelpText } from "../../../component/view/text";
import { S } from "../../../i18n/view";
import { util } from "../../../util/util";
import { ToolTip } from "../../../component/view/tooltip";

/**
 * 
 * 创建数据表格
 * 选择数据模板
 * 
 * 选择已存在的表格视图
 * 
 */
export class DataGridCreate extends EventsComponent {
    url: string = BlockUrlConstant.DataGridTable;
    source: 'createView' | 'tableView' | 'dataView' = 'createView';
    viewText: string = '';
    inputViewText: string = '';
    schemaId: string;
    syncBlockId: string;
    render() {
        return <div className="w-400 ">
            <Tab change={e => {
                this.emit('changeIndex')
            }}>
                <Tab.Page item={<Tip placement='bottom' text={'新建数据表'}><Icon size={18} icon={CollectTableSvg}></Icon></Tip>}>
                    {this.renderCreate()}
                </Tab.Page>
                <Tab.Page item={<Tip placement='bottom' text={'已创建的数据表'}><Icon size={18} icon={{ name: 'byte', code: 'history' }}></Icon></Tip>}>
                    {this.renderTables()}
                </Tab.Page>
            </Tab>
        </div>
    }
    cmsSpread: boolean = false;
    renderCms() {
        var self = this;
        var cms = CardFactory.getCardModels();
        return <div className="gap-t-10">
            <div className="f-12 remark flex"
                onMouseDown={e => {
                    this.cmsSpread = this.cmsSpread !== false ? false : true;
                    this.forceUpdate(() => { this.emit('update') });
                }}>
                <span className={"flex-fixed item-hover cursor round  size-16 flex-center ts " + (this.cmsSpread !== false ? "angle-180 " : "angle-90 ")}><Icon size={8} icon={TriangleSvg}></Icon></span>
                <span className="flex-fixed item-hover cursor">选择数据表模板</span>
            </div>
            {this.cmsSpread && <div className="max-h-200   gap-w-10 overflow-y">
                {cms.map((c, i) => {
                    return <div key={i} onMouseDown={e => {
                        self.url = c.model.url;
                        self.source = 'dataView';
                        if (!this.inputViewText) this.inputViewText = c.model.title;
                        self.viewText = c.model.title;
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
            </div>}
        </div>
    }
    rsSpreads: { [key: string]: boolean } = {};
    renderTables() {
        var list = Array.from(TableSchema.schemas.values());
        list = lodash.sortBy(list, g => 0 - g.createDate.getTime())
        var self = this;
        var srs = getSchemaViews()
        return <div className="gap-t-10">
            <div className="f-12 gap-w-10 remark flex">
                <span className="gap-l-3"><S>选择已创建的数据表视图</S></span>
            </div>
            <div className="max-h-200 gap-w-10  overflow-y">
                {list.map((rd, r) => {
                    var vs = rd.views.filter(c => srs.some(s => s.url == c.url));
                    return <div key={r} className="gap-b-5">
                        <div className="flex cursor" onMouseDown={e => {
                            self.rsSpreads[rd.id] = self.rsSpreads[rd.id] !== false ? false : true;
                            self.forceUpdate();
                        }}>
                            <span className={"flex-fixed item-hover cursor round  size-16 flex-center ts " + (this.rsSpreads[rd.id] !== false ? "angle-180 " : "angle-90 ")}><Icon size={8} icon={TriangleSvg}></Icon></span>
                            <span className="flex-auto f-12">{rd.text}</span>
                            <span className="flex-fixed f-12 remark">{util.showTime(rd.createDate)}</span>
                        </div>
                        {this.rsSpreads[rd.id] !== false && <div>{vs.map((view, c) => {
                            return <div className="flex gap-w-5 h-24 gap-h-5 item-hover round cursor padding-l-10" onMouseDown={e => {
                                self.source = 'tableView';
                                self.schemaId = rd.id;
                                self.syncBlockId = view.id;
                                self.url = view.url;
                                self.forceUpdate()
                            }} key={c}>
                                <span className="size-24 flex-center flex-fixed text-1"><Icon size={16} icon={getSchemaViewIcon(view)}></Icon></span>
                                <span className="flex-auto text-1">{view.text}</span>
                                {self.source == 'tableView' && self.syncBlockId == view.id && <span className="flex-fixed size-16 flex-center gap-r-10"><Icon size={16} icon={CheckSvg}></Icon></span>}
                            </div>
                        })}</div>}
                    </div>
                })}
            </div>
            <div className="border-top  padding-w-10  flex-end">
                <Button className="gap-h-5" onMouseDown={e => this.onSave()}>确定</Button>
            </div>
        </div>
    }
    onSave() {
        var self = this;
        if (this.source == 'createView') {
            self.emit('save', {
                text: self.inputViewText || lst('未命名数据表'),
                url: BlockUrlConstant.DataGridTable,
                source: this.source
            })
        }
        else if (this.source == 'tableView') {
            self.emit('save', {
                schemaId: this.schemaId,
                syncBlockId: this.syncBlockId,
                text: self.viewText || lst('未命名数据表'),
                url: this.url,
                source: this.source
            })
        }
        else if (this.source == 'dataView') {
            self.emit('save', {
                text: self.inputViewText || lst('未命名数据表'),
                url: this.url,
                source: this.source
            })
        }
    }
    renderCreate() {
        return <div className="gap-10">
            <div><Input placeholder={lst('数据表名称')} value={this.inputViewText}
                onChange={e => {
                    this.inputViewText = e
                }}
                onEnter={e => {
                    this.inputViewText = e;
                }} ></Input></div>
            {this.renderCms()}
            {this.source == 'dataView' && <div onMouseDown={e => {
                this.source = 'createView';
                this.forceUpdate(() => {
                    this.emit('update')
                });
            }} className="flex f-12 gap-h-5 item-hover-light-focus round"><span className="flex-fixed">已选择数据表模板</span><span className="flex-auto">:{this.viewText}</span><ToolTip overlay={<S>移除选择的数据表模板</S>}><span className="flex-fixed size-20 flex-center cursor item-hover round" ><Icon size={8} icon={CloseSvg}></Icon></span></ToolTip></div>}
            <div className="gap-h-10"><Button block onMouseDown={e => this.onSave()}><S>创建</S></Button></div>
            <div><HelpText url={window.shyConfig?.isUS ? "https://help.shy.red/page/38#3qfPYqnTJCwwQ6P9zYx8Q8" : 'https://help.shy.live/page/285#xcmSsiEKkYt3pgKVwyDHxJ'}>了解如何创建数据表</HelpText></div>
        </div>
    }
    input: Input;
    async open() {
        await TableSchema.onLoadAll()
        this.forceUpdate();
    }
}

export async function useDataGridCreate(pos: PopoverPosition) {
    let popover = await PopoverSingleton(DataGridCreate, { mask: true });
    let fv = await popover.open(pos);
    await fv.open();
    return new Promise((resolve: (data: {
        schemaId?: string,
        syncBlockId?: string,
        url?: string,
        text?: string,
        source?: 'tableView' | 'dataView' | 'createView'

    }) => void, reject) => {
        fv.only('save', (value) => {
            popover.close();
            resolve(value);
        });
        fv.only('close', () => {
            popover.close();
            resolve(null);
        });
        fv.only('changeIndex', () => {
            popover.updateLayout();
        })
        fv.only('update', () => {
            popover.updateLayout();
        })
        popover.only('close', () => {
            resolve(null)
        });
    })
}

