import React from "react";
import { Confirm } from "../../component/lib/confirm";
import { EventsComponent } from "../../component/lib/events.component";
import { ImportSvg, RenameSvg, TrashSvg } from "../../component/svgs";
import { Button } from "../../component/view/button";
import { useForm } from "../../component/view/form/dialoug";
import { Col, Row } from "../../component/view/grid";
import { Icon } from "../../component/view/icon";
import { Loading } from "../../component/view/loading";
import { useSelectMenuItem } from "../../component/view/menu";
import { MenuItemTypeValue } from "../../component/view/menu/declare";
import { Remark } from "../../component/view/text";
import { channel } from "../../net/channel";
import { ElementType, getElementUrl } from "../../net/element.type";
import { Rect } from "../../src/common/vector/point";
import { util } from "../../util/util";
import { PopoverSingleton } from "../popover/popover";
import { PopoverPosition } from "../popover/position";
import { createFormPage } from "./page";
import "./style.less";

export class PageHistoryStore extends EventsComponent {
    render() {
        return <div className="shy-page-history">
            <div className="shy-page-history-body">
                <div className="shy-page-history-list">
                    <div className="shy-page-history-list-record"><span>{this.total}条历史记录</span></div>
                    {this.loadList && <Loading></Loading>}
                    {this.list.map(r => {
                        return <a className={r.id == this.currentId ? "hover" : ""} onMouseDown={e => this.loadPageContent(r.id)} key={r.id}>
                            <span>{r.bakeTitle || util.showTime(r.createDate ? r.createDate : new Date())}</span>
                            <div onMouseDown={e => this.openProperty(e, r)} className="operate"><Icon icon={'elipsis:sy'}></Icon></div>
                        </a>
                    })}
                </div>
                <div className="shy-page-history-view">
                    {this.loadContent && <Loading></Loading>}
                    <div ref={e => this.el = e} className="shy-page-history-view-content"></div>
                </div>
            </div>
            <div className="shy-page-history-footer">
                <Row>
                    <Col span={12}><Remark>被重命名的版本,系统将不在自动清理,需要手动清理</Remark></Col>
                    <Col span={12} align='end'><Button disabled={this.currentId ? false : true}>恢复</Button></Col>
                </Row>
            </div>
        </div>
    }
    pageId: string;
    el: HTMLElement;
    async openProperty(e: React.MouseEvent, data) {
        e.stopPropagation();
        var r = await useSelectMenuItem({ roundArea: Rect.fromEvent(e) },
            [
                { name: 'delete', icon: TrashSvg, text: '删除' },
                { name: 'rename', icon: RenameSvg, text: '备份重命名' },
                { type: MenuItemTypeValue.divide },
                { name: 'export', icon: ImportSvg, text: '导出', disabled: true }
            ]
        );
        if (r?.item) {
            if (r.item == 'delete') {
                if (await Confirm('确认要删除吗')) {
                    await channel.del('/view/snap/del', { id: data.id });
                    this.list.remove(g => g.id == data.id);
                    this.forceUpdate()
                }
            }
            else if (r.item == 'rename') {
                var d = await useForm({
                    title: '重命版本',
                    model: { naem: data.bakeTitle || '' },
                    remark: '被重命名的版本,系统将不在自动清理',
                    fields: [{ name: 'name', text: '版本名称', type: 'input' }],
                    checkModel: async (d) => {
                        if (!d.name) return '名称不能为空';
                    }
                });
                if (d) {
                    await channel.patch('/view/snap/patch', { id: data.id, data: { bakeTitle: d.name } });
                    var g = this.list.find(c => c.id == data.id);
                    if (g) {
                        g.bakeTitle = d.name;
                    }
                    this.forceUpdate()
                }
            }
        }
    }
    async open(options?: { pageId: string }) {
        this.pageId = options.pageId;
        await this.load();
    }
    list: { id: string, creater: string, bakeTitle?: string, createDate: Date, bakeup?: boolean }[] = [];
    loadList: boolean = false;
    total = 0;
    page = 1;
    size = 20;
    async load() {
        this.loadList = true;
        this.forceUpdate();
        var r = await channel.get('/view/snap/list', { elementUrl: getElementUrl(ElementType.PageItem, this.pageId), page: 1, size: 20 });
        if (r.ok) {
            this.total = r.data.total;
            this.page = r.data.page;
            this.size = r.data.size;
            this.list = r.data.list.filter(g => g.createDate ? true : true);
        }
        this.loadList = false;
        this.forceUpdate();
    }
    currentId: string = '';
    loadContent: boolean = false;
    async loadPageContent(id) {
        this.loadContent = true;
        this.currentId = id;
        this.forceUpdate();
        var r = await channel.get('/view/snap/content', { id });
        this.loadContent = false;
        this.forceUpdate()
        if (r.ok) {
            console.log(this.el, 'el');
            createFormPage(this.el, r.data.content);
        }
    }
}

export async function usePageHistoryStore(options?: { pageId: string }) {
    var pos: PopoverPosition = { center: true };
    let popover = await PopoverSingleton(PageHistoryStore, { mask: true, });
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
