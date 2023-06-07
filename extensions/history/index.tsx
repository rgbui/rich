import dayjs from "dayjs";
import React from "react";
import { Confirm } from "../../component/lib/confirm";
import { EventsComponent } from "../../component/lib/events.component";
import { ImportSvg, RenameSvg, TrashSvg } from "../../component/svgs";
import { Button } from "../../component/view/button";
import { useForm } from "../../component/view/form/dialoug";
import { Icon } from "../../component/view/icon";
import { Loading } from "../../component/view/loading";
import { useSelectMenuItem } from "../../component/view/menu";
import { MenuItemType } from "../../component/view/menu/declare";
import { channel } from "../../net/channel";
import { Rect } from "../../src/common/vector/point";
import { Page } from "../../src/page";
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
                            <span>{r.bakeTitle || (r.createDate ? util.showTime(r.createDate ? r.createDate : new Date()) : r.seq)}</span>
                            <div onMouseDown={e => this.openProperty(e, r)} className="operate"><Icon icon={'elipsis:sy'}></Icon></div>
                        </a>
                    })}
                </div>
                <div className="shy-page-history-view relative">
                    {this.loadContent && <Loading></Loading>}
                    <div ref={e => this.el = e} className="shy-page-history-view-content"></div>
                </div>
            </div>
            <div className="shy-page-history-footer flex">
                <div className="remark flex-fixed">诗云将自动保留60天的历史记录<br />被重命名的版本,诗云将不在自动清理,需要手动清理</div>
                <div className="flex-auto flex-end"><Button ref={e => this.button = e} onClick={e => this.onBake()} disabled={this.currentId ? false : true}>恢复</Button></div>

            </div>
        </div>
    }
    pageId: string;
    el: HTMLElement;
    button: Button;
    async openProperty(e: React.MouseEvent, data) {
        e.stopPropagation();
        var r = await useSelectMenuItem({ roundArea: Rect.fromEvent(e) },
            [
                { name: 'delete', icon: TrashSvg, text: '删除' },
                { name: 'rename', icon: RenameSvg, text: '备份重命名' },
                { type: MenuItemType.divide },
                { name: 'export', icon: ImportSvg, text: '导出', disabled: true }
            ]
        );
        if (r?.item) {
            if (r.item.name == 'delete') {
                if (await Confirm('确认要删除吗')) {
                    await channel.del('/view/snap/del', { id: data.id });
                    this.list.remove(g => g.id == data.id);
                    this.total -= 1;
                    if (this.total < 10) {
                        await this.load();
                    } else this.forceUpdate()
                }
            }
            else if (r.item.name == 'rename') {
                var d = await useForm({
                    title: '重命版本',
                    model: { name: data.bakeTitle || '' },
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
    shyPage: Page;
    async open(page: Page) {
        this.shyPage = page;
        this.button.loading = false;
        await this.load();
    }
    list: { id: string, creater: string, seq: number, bakeTitle?: string, createDate: Date, bakeup?: boolean }[] = [];
    loadList: boolean = false;
    total = 0;
    page = 1;
    size = 20;
    pageTitle: string = '';
    async load() {
        this.loadList = true;
        this.forceUpdate();
        var r = await channel.get('/view/snap/list', { elementUrl: this.shyPage.elementUrl, page: 1, size: 20 });
        if (r.ok) {
            this.total = r.data.total;
            this.page = r.data.page;
            this.size = r.data.size;
            this.list = r.data.list.filter(g => g.createDate ? true : true);
        }
        this.loadList = false;
        this.forceUpdate();
        if (this.list.length > 0) {
            await this.loadPageContent(this.list.first().id)
        }
    }
    currentId: string = '';
    loadContent: boolean = false;
    viewPage: Page;
    async loadPageContent(id) {
        this.loadContent = true;
        this.currentId = id;
        this.forceUpdate();
        var r = await channel.get('/view/snap/content', { id });
        this.loadContent = false;
        this.forceUpdate()
        if (r.ok) {
            if (this.viewPage) this.viewPage.destory();
            this.viewPage = await createFormPage(this.el, r.data.content, this.shyPage);
        }
    }
    async onBake() {
        this.button.loading = true;
        this.forceUpdate();
        var d = await useForm({
            title: '历史版本恢复',
            model: { name: dayjs().format('YYYY-MM-DD HH:mm版本恢复') },
            remark: '将创建一个新的版本',
            fields: [{ name: 'name', text: '恢复版本名称', type: 'input' }],
            checkModel: async (d) => {
                if (!d.name) return '恢复版本名称';
            },
            maskCloseNotSave: true
        });
        if (d) {
            var r = await channel.post('/view/snap/rollup', {
                id: this.currentId,
                elementUrl: this.shyPage.elementUrl,
                bakeTitle: d.name,
                pageTitle: this.pageTitle
            });
            if (r.ok) {
                this.emit('save', r.data.id);
                return;
            }
        }
        this.button.loading = false;
        this.forceUpdate();
    }
}

export async function usePageHistoryStore(page: Page) {
    var pos: PopoverPosition = { center: true };
    let popover = await PopoverSingleton(PageHistoryStore, { mask: true, shadow: true });
    let fv = await popover.open(pos);
    fv.open(page);
    return new Promise((resolve: (id: string) => void, reject) => {
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
