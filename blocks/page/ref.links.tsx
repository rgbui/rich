
import { timeStamp } from "console";
import React from "react";
import { ArrowDownSvg, TrashSvg } from "../../component/svgs";
import { Icon } from "../../component/view/icon";
import { Loading } from "../../component/view/loading";
import { channel } from "../../net/channel";
import { Block } from "../../src/block";
import { prop, url, view } from "../../src/block/factory/observable";
import { BlockView } from "../../src/block/view";
import { util } from "../../util/util";

export interface BlockRefPage {
    id: string;
    createDate: Date;
    creater: string;
    workspaceId: string;
    pageId: string;
    pageText: string;
    blockId: string;
    rowBlockId: string;
    rowBlockText: string;
    refPageId: string;
}

@url('/ref/links')
export class RefLinks extends Block {
    async didMounted(): Promise<void> {
        await this.loadList();
    }
    @prop()
    expand: boolean = true;
    loading: boolean = false;
    list: BlockRefPage[] = [];
    async loadList() {
        this.loading = true;
        this.forceUpdate();
        var r = await channel.get('/block/ref/pages', { pageId: this.page.pageInfo?.id });
        this.loading = false;
        if (r.ok) {
            this.list = r.data.list;

        } this.forceUpdate()

    }
}
@view('/ref/links')
export class RefLinksView extends BlockView<RefLinks>{
    renderRefBlocks() {
        var groups = this.block.list.lookup(s => s.pageId);
        var ps: JSX.Element[] = [];
        groups.forEach((g, k) => {
            ps.push(<div className="sy-block-ref-page" key={k}>
                <div className="sy-block-ref-page-head"><Icon icon={ArrowDownSvg}></Icon><span>{g[0].pageText}</span></div>
                <ol>
                    {g.map(i => {
                        return <li key={i.id}>
                            <a>{i.rowBlockText}</a>
                            <span>{util.timeToString(i.createDate.getTime())}</span>
                            {this.block.isCanEdit() && <Icon size={16} icon={TrashSvg}></Icon>}
                        </li>
                    })}
                </ol>
            </div>)
        });
        return ps;
    }
    render() {
        return <div className="sy-block-ref-links">
            <div className="sy-block-ref-links-head">
                <Icon icon={ArrowDownSvg}></Icon>
                <span>引用页面</span>
            </div>
            <div className="sy-block-ref-links">
                {this.block.loading && <Loading></Loading>}
                {!this.block.loading && this.renderRefBlocks()}
            </div>
        </div>
    }
}