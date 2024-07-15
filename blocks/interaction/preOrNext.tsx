import React from "react";
import { Block } from "../../src/block";
import { url, view } from "../../src/block/factory/observable";
import { BlockView } from "../../src/block/view";
import { Icon } from "../../component/view/icon";
import { S } from "../../i18n/view";
import { ElementType } from "../../net/element.type";
import { LinkPageItem, getPageText } from "../../src/page/declare";
import { channel } from "../../net/channel";

@url('/page/preOrNext')
export class PageOrNext extends Block {
    async didMounted() {
        await this.onBlockReloadData(async () => {
            await this.loadPageOrNext();
        });
    }
    async loadPageOrNext() {
        if (this.page.pe.type == ElementType.SchemaRecordView) return;
        if (this.page.formPreRow) return;
        var r = await channel.get('/current/page/preOrNext', {
            pageId: this.page.pageInfo.id
        });
        if (r.ok) {
            console.log(r.data);
            this.prePageInfo = r.data.pre;
            this.nextPageInfo = r.data.next;
            this.forceManualUpdate();
        }
    }
    prePageInfo: LinkPageItem;
    nextPageInfo: LinkPageItem;
}

@view('/page/preOrNext')
export class PageOrNextView extends BlockView<PageOrNext> {
    renderContent() {
        var arrowSize = 20;
        var s = <S>没有了</S>;
        var e = <S>没有了</S>;
        var ss = false;
        var se = false;
        if (this.block.page.pe.type == ElementType.SchemaRecordView) {

        }
        else if (this.props.block.page.formPreRow) {
            if (this.block.page.formPreRow?.title) { s = this.block.page.formPreRow?.title; }
            if (this.block.page.formNextRow?.title) { e = this.block.page.formNextRow?.title; }
            if (this.block.page.formPreRow) ss = true;
            if (this.block.page.formNextRow) se = true;
        }
        else {
            if (this.block.prePageInfo) { s = getPageText(this.block.prePageInfo); ss = true; }
            if (this.block.nextPageInfo) { e = getPageText(this.block.nextPageInfo); se = true; }
        }

        var cs = this.block.contentStyle;
        var bg = { backgroundColor: cs.backgroundColor, backround: cs.background };

        return <div className='flex flex-top' >
            <a className={"w50 border gap-r-10 round padding-16 flex " + (ss ? " item-light-hover" : "")}
                style={{ cursor: ss ? 'pointer' : 'default', ...bg }}
                onClick={e => {
                    if (this.block.prePageInfo)
                        channel.act('/page/open', { item: this.block.prePageInfo?.id })
                    else if (this.block.page.formPreRow)
                        this.block.page.onPageViewTurn('prev')
                }}>
                <span className={"flex-center flex-fixed " + (ss ? "flex-center size-20 cursor item-hover round" : "")} ><Icon className={'remark-im'} size={arrowSize} icon={{ name: 'byte', code: 'left' }}></Icon></span>
                <div className="flex-auto ">
                    <span className="flex-end gap-w-5  remark-im   f-14   flex-fixed"><S>上一篇</S></span>
                    <span className={'flex-end f-14 ' + (ss ? "" : "remark-im")}>{s}</span>
                </div>
            </a>
            <a className={"w50  border gap-l-10 round padding-16  flex " + (se == true ? " item-light-hover" : "")}
                style={{ cursor: se ? 'pointer' : 'default', ...bg }}
                onClick={e => {
                    if (this.block.nextPageInfo)
                        channel.act('/page/open', { item: this.block.nextPageInfo?.id })
                    else if (this.block.page.formNextRow)
                        this.block.page.onPageViewTurn('next')
                }}>
                <div className="flex-auto">
                    <span className={'block flex remark-im  f-14   '}><S>下一篇</S></span>
                    <span className={"gap-w-5 flex f-14 " + (se ? "" : "remark-im")}>{e}</span>
                </div>
                <span className={"flex-fixed flex-center " + (se == true ? " round item-hover size-20 cursor" : "")} ><Icon className={'remark-im'} size={arrowSize} icon={{ name: 'byte', code: 'right' }}></Icon></span>

            </a>
        </div>
    }

    renderView() {
        var cs = this.block.contentStyle;
        delete cs.background;
        delete cs.backgroundColor;
        return <div style={this.block.visibleStyle}>
            <div style={{ ...cs }}>{this.renderContent()}</div>
            {this.renderComment()}
        </div>
    }
}