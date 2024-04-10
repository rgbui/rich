import dayjs from "dayjs";
import React from "react";
import { Confirm } from "../../component/lib/confirm";
import { EventsComponent } from "../../component/lib/events.component";
import { DotsSvg, TrashSvg } from "../../component/svgs";
import { Button } from "../../component/view/button";
import { useForm } from "../../component/view/form/dialoug";
import { Icon } from "../../component/view/icon";
import { useSelectMenuItem } from "../../component/view/menu";
import { MenuItemType } from "../../component/view/menu/declare";
import { channel } from "../../net/channel";
import { Rect } from "../../src/common/vector/point";
import { Page } from "../../src/page";
import { util } from "../../util/util";
import { PopoverSingleton } from "../../component/popover/popover";
import { PopoverPosition } from "../../component/popover/position";
import { createFormPage } from "./page";
import { S, Sp } from "../../i18n/view";
import { lst } from "../../i18n/store";
import "./style.less";
import { Spin } from "../../component/view/spin";
import { HelpText } from "../../component/view/text";

export class PageHistoryStore extends EventsComponent {
    render() {
        return <div className="shy-page-history">
            <div className="shy-page-history-body">
                <div className="shy-page-history-list">
                    <div className="shy-page-history-list-record"><span><Sp text={'{total}条历史记录'} data={{ total: this.total }}>{this.total}条历史记录</Sp></span></div>
                    {this.loadList && <Spin block></Spin>}
                    {this.list.map(r => {
                        return <a className={"visible-hover " + (r.id == this.currentId ? "hover" : "")} onMouseDown={e => this.loadPageContent(r.id)} key={r.id}>
                            <span>{r.bakeTitle || (r.createDate ? util.showTime(r.createDate ? r.createDate : new Date()) : r.seq)}</span>
                            <div onMouseDown={e => this.openProperty(e, r)} className="operate visible flex-center"><Icon size={16} icon={DotsSvg}></Icon></div>
                        </a>
                    })}
                </div>
                <div className="shy-page-history-view relative">
                    {this.loadContent && <Spin block></Spin>}
                    <div ref={e => this.el = e} className="shy-page-history-view-content"></div>
                </div>
            </div>
            <div className="shy-page-history-footer flex">
                <div className="remark flex-fixed f-14">
                    <Sp text={'诗云将自动保留60天的历史记录'}>诗云将自动保留60天的历史记录<br />被重命名的版本,诗云将不在自动清理,需要手动清理</Sp>
                </div>
                <div className="flex-fixed">
                    <HelpText url={window.shyConfig?.isUS ? "https://shy.red/ws/help/page/53" : "https://help.shy.live/page/1891"}><S>了解页面历史</S></HelpText>
                </div>
                <div className="flex-auto flex-end"><Button ref={e => this.button = e} onClick={e => this.onBake()} disabled={this.currentId ? false : true}><S>恢复</S></Button></div>

            </div>
        </div>
    }
    pageId: string;
    el: HTMLElement;
    button: Button;
    async openProperty(e: React.MouseEvent, data) {
        e.stopPropagation();
        var c = e.currentTarget as HTMLElement;
        c.classList.remove('visible');
        try {
            var rs = [
                { name: 'onBake', icon: { name: 'byte', code: "return" }, text: lst('恢复') },
                { name: 'rename', icon: { name: 'byte', code: 'write' }, text: lst('重命名备份') },
                // { type: MenuItemType.divide },
                // { name: 'export', icon: { name: "byte", code: 'download-one' }, text: lst('导出'), disabled: true },
                { type: MenuItemType.divide },
                { name: 'delete', icon: TrashSvg, text: lst('删除') },
                { type: MenuItemType.divide },
                { type: MenuItemType.help, text: lst('了解页面历史'), url: window.shyConfig?.isUS ? "https://shy.red/ws/help/page/53" : "https://help.shy.live/page/1891" }
            ] as any;
            if (data.createDate) {
                rs.push({
                    type: MenuItemType.divide,
                });
                if (data?.createDate) rs.push({
                    type: MenuItemType.text,
                    text: lst('创建于 ') + util.showTime(new Date(data.createDate))
                });
                var re = await channel.get('/user/basic', { userid: data.creater });
                if (re?.data?.user) rs.push({
                    type: MenuItemType.text,
                    text: lst('创建人 ') + re.data.user.name
                })
            }
            var r = await useSelectMenuItem({ roundArea: Rect.fromEvent(e) },
                rs as any
            );
            if (r?.item) {
                if (r.item.name == 'delete') {
                    if (await Confirm(lst('确认要删除吗'))) {
                        await channel.del('/view/snap/del', { id: data.id });
                        this.list.remove(g => g.id == data.id);
                        this.total -= 1;
                        if (this.total < 10) await this.load();
                        else this.forceUpdate()
                    }
                }
                else if (r.item.name == 'onBake') {
                    if (await Confirm(lst('确认要恢复吗'))) {
                        this.currentId = data.id;
                        await this.onBake();
                    }
                }
                else if (r.item.name == 'rename') {
                    var d = await useForm({
                        title: lst('重命版本'),
                        head: false,
                        model: { name: data.bakeTitle || '' },
                        remark: lst('被重命名的版本系统将不在自动清理', '被重命名的版本,系统将不在自动清理'),
                        fields: [{ name: 'name', text: lst('版本名称'), type: 'input' }],
                        checkModel: async (d) => {
                            if (!d.name) return lst('名称不能为空');
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
        catch (ex) {

        }
        finally {
            c.classList.add('visible');
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
        var r = await channel.get('/view/snap/list', { ws: this.shyPage.ws, elementUrl: this.shyPage.elementUrl, page: 1, size: 20 });
        if (r.ok) {
            this.total = r.data.total;
            this.page = r.data.page;
            this.size = r.data.size;
            this.list = r.data.list;
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
        var r = await channel.get('/view/snap/content', { id, ws: this.shyPage?.ws });
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
            head: false,
            model: { name: dayjs().format('YYYY-MM-DD HH:mm') + lst('版本恢复') },
            remark: lst('将创建一个新的版本'),
            fields: [{ name: 'name', text: lst('恢复版本名称'), type: 'input' }],
            checkModel: async (d) => {
                if (!d.name) return lst('恢复版本名称');
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
