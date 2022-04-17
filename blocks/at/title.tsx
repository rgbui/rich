import React from "react";
import { Block } from "../../src/block";
import { BlockDisplay } from "../../src/block/enum";
import { url, view } from "../../src/block/factory/observable";
import { TextArea } from "../../src/block/view/appear";
import { BlockView } from "../../src/block/view";
import { BlockAppear } from "../../src/block/appear";
import { channel } from "../../net/channel";
import { LinkPageItem } from "../../extensions/at/declare";
import { PageLayoutType } from "../../src/page/declare";
import { Icon } from "../../component/view/icon";
import { AddPageCoverSvg, AddPageIconSvg } from "../../component/svgs";

@url('/title')
export class Title extends Block {
    display = BlockDisplay.block;
    pageInfo: LinkPageItem = null;
    async loadPageInfo() {
        var r = await channel.get('/page/query/info', { id: this.page.pageItemId });
        if (r.ok) {
            this.pageInfo = r.data;
        }
    }
    async changeAppear(appear) {
        if (appear.prop == 'pageInfo.text') {
            channel.air('/page/update/info', {
                id: this.pageInfo.id,
                pageInfo: {
                    id: this.pageInfo.id,
                    text: this.pageInfo?.text
                }
            })
        }
    }
    get isSupportTextStyle() {
        return false;
    }
}
@view('/title')
export class TitleView extends BlockView<Title>{
    async didMount() {
        channel.sync('/page/update/info', this.updatePageInfo);
        await this.block.loadPageInfo();
        this.forceUpdate();
    }
    updatePageInfo = (r: { id: string, pageInfo: LinkPageItem }) => {
        var { id, pageInfo } = r;
        if (this.block.pageInfo.id == id) {
            if (typeof pageInfo.text != 'undefined' && pageInfo.text != this.block.pageInfo.text) {
                this.block.pageInfo.text = pageInfo.text;
                this.forceUpdate();
            }
        }
    }
    willUnmount() {
        channel.off('/page/update/info', this.updatePageInfo);
    }
    render() {
        var isAdd: boolean = [PageLayoutType.doc].includes(this.block.page.pageLayout.type)
        return <div className='sy-block-page-info' style={this.block.visibleStyle}>
            {isAdd && (!this.block.page.pageInfo?.icon || !this.block.page.cover?.abled) && <div className='sy-block-page-info-operators' >
                {!this.block.page.pageInfo?.icon && <a onMouseDown={e => this.block.page.onAddIcon()}><Icon size={14} icon={AddPageIconSvg}></Icon><span>添加图标</span></a>}
                {!this.block.page.cover?.abled && <a onMouseDown={e => this.block.page.onAddCover()}><Icon size={14} icon={AddPageCoverSvg}></Icon><span>添加封面</span></a>}
            </div>}
            {this.block.pageInfo == null && <div className='sy-block-page-info-loading'></div>}
            {this.block.pageInfo != null &&
                <div className='sy-block-page-info-head'>
                    <span className='sy-block-page-info-head-title'><TextArea placeholder='输入标题'
                        rf={e => this.block.elementAppear({ el: e, appear: BlockAppear.text, prop: 'pageInfo.text' })}
                        html={this.block.pageInfo.text}></TextArea></span>
                </div>}
        </div>
    }
}