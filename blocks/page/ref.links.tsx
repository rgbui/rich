
import lodash from "lodash";
import React from "react";
import { PageSvg, TriangleSvg } from "../../component/svgs";
import { Icon } from "../../component/view/icon";
import { Loading } from "../../component/view/loading";
import { IconArguments } from "../../extensions/icon/declare";
import { channel } from "../../net/channel";
import { Block } from "../../src/block";
import { BlockRenderRange } from "../../src/block/enum";
import { prop, url, view } from "../../src/block/factory/observable";
import { BlockView } from "../../src/block/view";
import { util } from "../../util/util";

export interface BlockRefPage {
    id: string;
    createDate: Date;
    creater: string;
    workspaceId: string;
    pageId: string;
    blockId: string;
    rowBlockId: string;
    rowBlockText: string;
    refPageId: string;
    refPageIcon: IconArguments,
    refPageText: string;
    spread?: boolean,
    blocks?: BlockRefPage[]
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
        var r = await channel.get('/block/ref/pages', { pageId: this.page.pageInfo?.id });
        this.loading = false;
        if (r.ok) {
            this.list = r.data.list;
            var ps: BlockRefPage[] = [];
            this.list.forEach(c => {
                var p = ps.find(g => g.refPageId == c.refPageId);
                if (!p) {
                    p = lodash.cloneDeep(c);
                    p.blocks = [];
                    p.spread = true;
                    ps.push(p);
                }
                if (p) {
                    p.blocks.push(c);
                }
            });
            this.list = ps;
        }
        this.forceUpdate()
    }
}
@view('/ref/links')
export class RefLinksView extends BlockView<RefLinks>{
    open(refPage: BlockRefPage) {
        channel.air('/page/open', { blockId: refPage.blockId, item: { id: refPage.refPageId } });
    }
    renderRefBlocks() {
        return this.block.list.map(pa => {
            return <div key={pa.refPageId} className='gap-h-10'>
                <div className="flex h-24 cursor" onMouseDown={e => { pa.spread = !pa.spread; this.forceUpdate() }} ><span className="remark ts-transform flex-center size-16 cursor  round"
                    style={{ transform: pa.spread ? 'rotateZ(180deg)' : 'rotateZ(90deg)' }}><Icon size={12} icon={TriangleSvg}></Icon></span><span><span className="size-24 gap-r-5 flex-center flex-inline"><Icon size={16} icon={pa.refPageIcon || PageSvg}></Icon></span></span><span className="bold text">{pa.refPageText}</span></div>
                {pa.spread && <div className="gap-l-10">{pa.blocks.map((b, i) => {
                    return <div onMouseDown={e => this.open(b)} key={b.blockId} className='gap-h-5 h-30 flex flex-top item-hover round padding-w-5 cursor'><span className="flex-fixed">{i + 1}.</span><span className="flex-auto">{b.rowBlockText}</span><span className="flex-fixed f-12 remark gap-t-5">{util.showTime(b.createDate)}</span></div>
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
            <div className="flex h-24">
                <span onMouseDown={e => this.onToggle(e)} className="remark ts-transform flex-center size-16 cursor  round"
                    style={{ transform: this.block.expand ? 'rotateZ(180deg)' : 'rotateZ(90deg)' }}>
                    <Icon size={12} icon={TriangleSvg}></Icon>
                </span>
                <span className="remark f-12">引用页面</span>
            </div>
            {this.block.expand && <div className="sy-block-ref-links bg round padding-10">
                {this.block.loading && <Loading></Loading>}
                {!this.block.loading && this.renderRefBlocks()}
            </div>}
        </div>
    }
}