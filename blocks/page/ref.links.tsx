

import React from "react";
import { RefreshSvg, TriangleSvg } from "../../component/svgs";
import { Icon } from "../../component/view/icon";
import { channel } from "../../net/channel";
import { ElementType, getElementUrl, parseElementUrl } from "../../net/element.type";
import { Block } from "../../src/block";
import { BlockRenderRange } from "../../src/block/enum";
import { prop, url, view } from "../../src/block/factory/observable";
import { BlockView } from "../../src/block/view";
import { util } from "../../util/util";
import { Spin } from "../../component/view/spin";
import { LinkPageItem, getPageIcon, getPageText } from "../../src/page/declare";

type BlockRefPage = LinkPageItem & {
    spread?: boolean,
    childs: {
        text: string,
        id: string,
        content: string,
        html: string,
        createDate: Date,
        elementUrl: string
    }[]
}

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
        var r = await channel.get('/get/page/refs', { pageId: this.page.pageInfo?.id });
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
}
@view('/ref/links')
export class RefLinksView extends BlockView<RefLinks>{
    open(refPage: ArrayOf<BlockRefPage['childs']>) {
        var pe = parseElementUrl(refPage.elementUrl);
        channel.air('/page/open', {
            elementUrl: getElementUrl(ElementType.PageItem, pe.id)
        });
    }
    renderRefBlocks() {
        if (this.block.list.length == 0) {
            return <div className="flex-center remark f-12"> 没有引用</div>
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
        return <div className="sy-block-ref-links" style={this.block.visibleStyle}>
            <div className="flex h-24 visible-hover">
                <span onMouseDown={e => this.onToggle(e)} className="flex-fixed remark ts-transform flex-center size-16 cursor  round"
                    style={{ transform: this.block.expand ? 'rotateZ(180deg)' : 'rotateZ(90deg)' }}>
                    <Icon size={10} icon={TriangleSvg}></Icon>
                </span>
                <span className="flex-auto remark f-12">引用页面</span>
                <span onClick={e => this.block.loadList()} className="visible flex-fixed flex-center size-20 round item-hover cursor">
                    <Icon size={12} icon={RefreshSvg}></Icon>
                </span>
            </div>
            {this.block.expand && <div className="sy-block-ref-links bg round padding-10">
                {this.block.loading && <div className="flex-center"><Spin></Spin></div>}
                {!this.block.loading && this.renderRefBlocks()}
            </div>}

        </div>
    }
}