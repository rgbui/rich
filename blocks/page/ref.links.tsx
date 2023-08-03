

import React from "react";
import { DotsSvg, RefreshSvg, TriangleSvg } from "../../component/svgs";
import { Icon } from "../../component/view/icon";
import { channel } from "../../net/channel";
import { ElementType, getElementUrl, parseElementUrl } from "../../net/element.type";
import { Block } from "../../src/block";
import { BlockDirective, BlockRenderRange } from "../../src/block/enum";
import { prop, url, view } from "../../src/block/factory/observable";
import { BlockView } from "../../src/block/view";
import { util } from "../../util/util";
import { Spin } from "../../component/view/spin";
import { getPageIcon, getPageText } from "../../src/page/declare";
import { BlockRefPage } from "../../extensions/tag/ref.declare";
import { S } from "../../i18n/view";
import { lst } from "../../i18n/store";
import { MenuItem } from "../../component/view/menu/declare";

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
        this.forceUpdate();
        var r = await channel.get('/get/page/refs', { ws: this.page.ws, pageId: this.page.pageInfo?.id });
        this.loading = false;
        if (r.ok) {
            this.list = r.data.pages.map(c => {
                return {
                    ...c,
                    spread: false,
                    childs: r.data.list.findAll(g => g.pageId == c.id)
                }
            })
        }
        this.forceUpdate()
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
        var at = rs.findIndex(g => g.text == lst('颜色'));
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
}

@view('/ref/links')
export class RefLinksView extends BlockView<RefLinks>{
    open(refPage: ArrayOf<BlockRefPage['childs']>) {
        var pe = parseElementUrl(refPage.elementUrl);
        channel.air('/page/open', {
            elementUrl: getElementUrl(ElementType.PageItem, pe.id),
            config: { blockId: pe.id1 }
        });
    }
    renderRefBlocks() {
        if (this.block.list.length == 0) {
            return <div className="flex-center remark f-12"><S>没有引用</S></div>
        }
        return this.block.list.map(pa => {
            return <div key={pa.id} className='gap-h-10'>
                <div className="flex h-24 cursor" onMouseDown={e => { pa.spread = !pa.spread; this.forceUpdate() }} >
                    <span className="remark ts-transform flex-center size-16 cursor  round remark"
                        style={{ transform: pa.spread ? 'rotateZ(180deg)' : 'rotateZ(90deg)' }}><Icon size={10} icon={TriangleSvg}></Icon></span>
                    <span className="size-24 flex-center flex-inline"><Icon size={16} icon={getPageIcon(pa)}></Icon></span>
                    <span className="bold text">{getPageText(pa)}</span>
                </div>
                {pa.spread && <div className="gap-l-10">{pa.childs.map((b, i) => {
                    return <div onMouseDown={e => this.open(b)} key={b.id} className='text-1 gap-h-5  flex flex-top item-hover round padding-5 cursor'>
                        <span className="flex-fixed l-20">{i + 1}.</span>
                        <div className="flex-auto l-20 f-14" dangerouslySetInnerHTML={{ __html: b.html }}></div>
                        <span className="flex-fixed f-12 remark   l-20">{util.showTime(b.createDate)}</span></div>
                })}</div>}
            </div>
        })
    }
    onToggle(e: React.MouseEvent) {
        e.stopPropagation();
        this.block.onUpdateProps({ expand: this.block.expand ? false : true }, { range: BlockRenderRange.self })
    }
    render() {
        return <div style={this.block.visibleStyle}>
            <div className="flex h-24 visible-hover">
                <span onMouseDown={e => this.onToggle(e)} className="flex-fixed remark ts-transform flex-center size-16 cursor  round"
                    style={{ transform: this.block.expand ? 'rotateZ(180deg)' : 'rotateZ(90deg)' }}>
                    <Icon size={10} icon={TriangleSvg}></Icon>
                </span>
                <span className="flex-auto remark f-12"><span onMouseDown={e => this.onToggle(e)}><S>引用页面</S></span></span>
                <span onClick={e => {
                    e.stopPropagation();
                    this.block.loadList()
                }} className="visible flex-fixed flex-center size-20 round item-hover cursor">
                    <Icon size={12} icon={DotsSvg}></Icon>
                </span>
            </div>
            {this.block.expand && <div className="sy-block-ref-links bg round padding-10">
                {this.block.loading && <div className="flex-center"><Spin></Spin></div>}
                {!this.block.loading && this.renderRefBlocks()}
            </div>}
        </div>
    }
}