

import React from "react";
import { DotsSvg, RefreshSvg, TrashSvg, TriangleSvg } from "../../component/svgs";
import { Icon } from "../../component/view/icon";
import { channel } from "../../net/channel";
import { ElementType, getElementUrl, parseElementUrl } from "../../net/element.type";
import { Block } from "../../src/block";
import { BlockDirective, BlockRenderRange } from "../../src/block/enum";
import { prop, url, view } from "../../src/block/factory/observable";
import { BlockView } from "../../src/block/view";
import { util } from "../../util/util";
import { Spin } from "../../component/view/spin";
import { LinkPageItem, getPageIcon, getPageText } from "../../src/page/declare";
import { BlockRefPage } from "../../extensions/tag/ref.declare";
import { S } from "../../i18n/view";
import { lst } from "../../i18n/store";
import { MenuItem } from "../../component/view/menu/declare";
import { Point, Rect } from "../../src/common/vector/point";
import { useSelectMenuItem } from "../../component/view/menu";
import lodash from "lodash";
import { BlockRefPageLink } from "../../extensions/link/declare";
import { SyncMessageUrl } from "../../net/sync.message";

@url('/ref/links')
export class RefLinks extends Block {
    async didMounted(): Promise<void> {
        await this.loadList();
    }
    @prop()
    expand: boolean = false;
    loading: boolean = false;
    list: BlockRefPage[] = [];
    async loadList() {
        this.loading = true;
        this.forceManualUpdate();
        var r = await channel.get('/get/page/refs', { ws: this.page.ws, pageId: this.page.pageInfo?.id });
        this.loading = false;
        if (r.ok) {
            this.list = r.data.pages.map(c => {
                return {
                    ...c,
                    spread: false,
                    childs: util.arrayRemoveDuplication(
                        r.data.list.findAll(g => g.pageId == c.id),
                        x => x.elementUrl
                    )
                }
            })
        }
        this.forceManualUpdate()
    }
    async getMd() {
        var ws = this.page.ws
        return this.list.map(pa => {
            return `[${getPageText(pa)}](${ws.url + '/page/' + pa.sn})  \n` + pa.childs.map(b => {
                return `${b.html}`
            }).join("  \n")
        }).join("  \n")
    }
    async onGetContextMenus() {
        var rs = await super.onGetContextMenus();
        var at = rs.findIndex(g => g.name == BlockDirective.comment);
        rs.splice(at, 1, {
            name: 'reload',
            text: lst('重新加载引用'),
            icon: RefreshSvg
        });
        return rs;
    }
    async onClickContextMenu(item: MenuItem<string | BlockDirective>, event: MouseEvent): Promise<void> {
        if (item.name == 'reload') {
            await this.loadList();
            return;
        }
        return await super.onClickContextMenu(item, event);
    }
    getVisibleHandleCursorPoint() {
        if (!this.el) return null;
        var r = this.el.querySelector('.h-30');
        if (r) {
            var rect = Rect.fromEle(r as HTMLElement);
            return rect.leftMiddle;
        }
    }
}

@view('/ref/links')
export class RefLinksView extends BlockView<RefLinks> {
    async open(refPage: ArrayOf<BlockRefPage['childs']>, e: React.MouseEvent) {
        if (e.button == 2) {
            var rs = await useSelectMenuItem({ roundPoint: Point.from(e) }, [{ icon: TrashSvg, text: lst('删除'), name: 'delete' }]);
            if (rs?.item?.name == 'delete') {
                var r = await channel.del('/delete/page/ref', { id: refPage.id, ws: this.block.page.ws });
                if (r.ok) {
                    var rc = this.block.list.find(c => c.childs.some(g => g.id == refPage.id));
                    lodash.remove(rc.childs, c => c.id == refPage.id);
                    if (rc.childs.length == 0) {
                        lodash.remove(this.block.list, c => c.id == rc.id);
                    }
                    this.forceUpdate();
                }
            }
            return;
        }
        var pe = parseElementUrl(refPage.elementUrl);
        channel.act('/page/open', {
            elementUrl: getElementUrl(ElementType.PageItem, pe.id),
            config: { blockId: pe.id1 }
        });
    }
    msSpread: Map<string, boolean> = new Map();
    renderRefBlocks() {
        if (this.block.list.length == 0) {
            return <div className="flex-center remark f-12"><S>没有引用</S></div>
        }
        return this.block.list.map((pa, i) => {
            var sp = this.msSpread.get(pa.id);
            return <div key={pa.id} className={i == this.block.list.length - 1 ? "" : 'gap-b-10'}>
                <div className="flex h-24 cursor" onMouseDown={e => {
                    this.msSpread.set(pa.id, sp ? false : true);
                    this.forceUpdate()
                }} >
                    <span className="remark ts-transform flex-center size-16 cursor item-hover  round remark"
                        style={{ transform: sp ? 'rotateZ(180deg)' : 'rotateZ(90deg)' }}><Icon size={10} icon={TriangleSvg}></Icon></span>
                    <span className="size-24 flex-center flex-inline"><Icon size={18} icon={getPageIcon(pa)}></Icon></span>
                    <span className="bold text">{getPageText(pa)}</span>
                </div>
                {sp && <div className="gap-l-10">{pa.childs.map((b, i) => {
                    return <div onMouseDown={e => this.open(b, e)} key={b.id} className='text gap-h-5  flex flex-top item-light-hover round padding-5 cursor'>
                        <span className="flex-fixed l-20 gap-r-5">{i + 1}.</span>
                        <div className="flex-auto l-20 f-14" dangerouslySetInnerHTML={{ __html: b.html }}></div>
                        <span className="flex-fixed f-12 remark  l-20 gap-l-30">{util.showTime(b.createDate)}</span></div>
                })}</div>}
            </div>
        })
    }
    onToggle(e: React.MouseEvent) {
        e.stopPropagation();
        var ed = this.block.expand;
        this.block.expand = !ed;
        this.forceUpdate();
        this.block.onManualUpdateProps(
            { expand: ed },
            { expand: ed ? false : true },
            { range: BlockRenderRange.none }
        );
    }
    renderView() {
        return <div style={this.block.visibleStyle}>
            <div style={this.block.contentStyle} className="visible-hover">
                <div className="flex h-30 ">
                    <span className="flex-auto">
                        <span className="flex round item-hover l-20 padding-r-5" style={{ display: 'inline-flex' }}>
                            <span onMouseDown={e => this.onToggle(e)} className="flex-fixed remark ts-transform  flex-center  size-16 cursor  round"
                                style={{ transform: this.block.expand ? 'rotateZ(180deg)' : 'rotateZ(90deg)' }}
                            ><Icon size={10} icon={TriangleSvg}></Icon>
                            </span>
                            <span className="flex-fixed remark f-12 cursor"><span onMouseDown={e => this.onToggle(e)}><S>引用页面</S></span></span>
                        </span>
                    </span>
                    <div className="visible flex-fixed bg-white shadow-s round flex text-1">
                        <span onClick={e => {
                            e.stopPropagation();
                            this.block.loadList()
                        }} className=" flex-fixed flex-center size-24 round item-hover cursor">
                            <Icon size={16} icon={RefreshSvg}></Icon>
                        </span>
                        <span onClick={e => {
                            e.stopPropagation();
                            this.block.onContextmenu(e.nativeEvent);
                        }} className="flex-fixed flex-center size-24 round item-hover cursor">
                            <Icon size={16} icon={DotsSvg}></Icon>
                        </span>
                    </div>
                </div>
                <div style={{
                    display: this.block.expand ? 'block' : 'none'
                }} className="sy-block-ref-links item-hover-light-focus round padding-10 gap-l-5">
                    {this.block.loading && <Spin block></Spin>}
                    {!this.block.loading && this.renderRefBlocks()}
                </div>
            </div>
            {this.renderComment()}
        </div>
    }
    didMount(): void {
        channel.sync(SyncMessageUrl.blcokSyncRefs, this.syncRefs)
        channel.sync('/page/update/info', this.syncPageInfo)
    }
    syncRefs = async (e: { operators: BlockRefPageLink[], pageId: string },
        op: {
            locationId?: string | number;
            sockId?: string;
        }) => {
        var pd = this.block.page.getPageDataInfo();
        console.log(pd, e, op);
        try {
            var pc: LinkPageItem;
            var isUpdate = false;
            await e.operators.eachAsync(async c => {
                if (c.ref?.pageId == pd.id) {
                    if (c.op == 'delete') {
                        this.block.list.forEach(pa => {
                            if (pa.childs.some(g => g.id == c.id)) isUpdate = true;
                            lodash.remove(pa.childs, g => g.id == c.id)
                        })
                        lodash.remove(this.block.list, pa => pa.childs.length == 0)
                    }
                    else if (c.op == 'sync') {
                        var isFind: boolean = false;
                        this.block.list.forEach(pa => {
                            pa.childs.forEach(g => {
                                if (g.id == c.id) {
                                    isUpdate = true;
                                    g.html = c.html;
                                    g.text = c.text;
                                    isFind = true;
                                }
                            })
                        })
                        if (isFind == false) {
                            var pa = this.block.list.find(g => g.id == e.pageId);
                            if (pa) {
                                isUpdate = true;
                                if (!pa.childs.some(s => s.elementUrl == c.elementUrl)) {
                                    isUpdate = true; pa.childs.push({
                                        id: c.id,
                                        html: c.html,
                                        text: c.text,
                                        createDate: (c as any).createDate || new Date(),
                                        elementUrl: c.elementUrl
                                    })
                                }
                            }
                            else {
                                if (!pc) {
                                    pc = (await channel.get('/page/item', { ws: this.block.page.ws, id: e.pageId })).data.item
                                }
                                if (pc) {
                                    isUpdate = true;
                                    this.block.list.push({
                                        id: pc.id,
                                        icon: pc.icon,
                                        sn: pc.sn,
                                        text: pc.text,
                                        spread: false,
                                        childs: [{
                                            id: c.id,
                                            html: c.html,
                                            text: c.text,
                                            createDate: (c as any).createDate || new Date(),
                                            elementUrl: c.elementUrl
                                        }]
                                    })
                                }

                            }
                        }
                    }
                }

            })
            console.log(isUpdate, pc, e, op);
            if (isUpdate) this.block.forceManualUpdate()
        }
        catch (ec) {
            this.block.page.onError(ec);
        }
    }
    syncPageInfo = async (e: {
        id: string,
        elementUrl?: string;
        pageInfo: LinkPageItem
    }) => {
        var pa = this.block.list.find(c => e.id && c.id == e.id || e.elementUrl && parseElementUrl(e.elementUrl).id == c.id);
        if (pa) {
            var isUpdate = false;
            if (typeof e.pageInfo.icon != 'undefined') { pa.icon = e.pageInfo.icon; isUpdate = true }
            if (typeof e.pageInfo.text != 'undefined') { pa.text = e.pageInfo.text; isUpdate = true }
            if (isUpdate)
                this.block.forceManualUpdate();
        }
    }
    willUnmount(): void {
        channel.off(SyncMessageUrl.blcokSyncRefs, this.syncRefs)
        channel.off('/page/update/info', this.syncPageInfo)
    }
}