import React from "react";
import { Block } from "../../src/block";
import { BlockDisplay } from "../../src/block/enum";
import { url, view } from "../../src/block/factory/observable";
import { TextArea } from "../../src/block/view/appear";
import { BlockView } from "../../src/block/view";
import { channel } from "../../net/channel";
import { LinkPageItem } from "../../extensions/at/declare";
import { Icon } from "../../component/view/icon";
import { AddPageCoverSvg, AddPageIconSvg } from "../../component/svgs";
import lodash from "lodash";
import { Spin } from "../../component/view/spin";

@url('/title')
export class Title extends Block {
    display = BlockDisplay.block;
    pageInfo: LinkPageItem = null;
    async loadPageInfo() {
        var r = this.page.getPageDataInfo();
        if (r) {
            this.pageInfo = lodash.cloneDeep(r);
        }
    }
    async changeAppear(appear) {
        if (appear.prop == 'pageInfo.text') {
            if (this.pageInfo.id) {
                await this.page.onUpdatePageTitle(this.pageInfo.text);
            }
        }
    }
    get isSupportTextStyle() {
        return false;
    }
    get isDisabledInputLine() {
        return true;
    }
    onEmptyTitleFocusAnchor() {
        if (this.page?.pageInfo) {
            this.page.kit.anchorCursor.onFocusBlockAnchor(this, { store: false, render: true });
        }
    }
    get handleBlock() {
        return null;
    }
    get isCanEmptyDelete() {
        return false
    }
}
@view('/title')
export class TitleView extends BlockView<Title>{
    async didMount() {
        channel.sync('/page/update/info', this.updatePageInfo);
        await this.block.loadPageInfo();
        this.forceUpdate(() => {
            this.block.onEmptyTitleFocusAnchor();
        })
    }
    updatePageInfo = (r: { elementUrl: string, id: string, pageInfo: LinkPageItem }) => {
        var { elementUrl, id, pageInfo } = r;
        if (elementUrl && this.block.page.elementUrl == elementUrl || id && id == this.block.page.pageInfo?.id) {
            var isUpdate: boolean = false;
            if (typeof pageInfo.text != 'undefined' && pageInfo.text != this.block.pageInfo.text) {
                this.block.pageInfo.text = pageInfo.text;
                isUpdate = true;
            }
            if (typeof pageInfo.icon != 'undefined') {
                this.block.pageInfo.icon = lodash.cloneDeep(pageInfo.icon);
                isUpdate = true;
            }
            if (isUpdate) {
                this.forceUpdate();
            }
        }
    }
    willUnmount() {
        channel.off('/page/update/info', this.updatePageInfo);
    }
    render() {
        var isAdd: boolean = this.block.page.isSupportCover;
        var pd = this.block.page.getPageDataInfo();
        return <div className='sy-block-page-info visible-hover' style={this.block.visibleStyle}>
            <div className="min-h-72">{pd?.icon && pd.cover?.abled !== true && <div onMouseDown={e => this.block.page.onChangeIcon(e)} className="sy-block-page-info-icon">
                <Icon size={72} icon={pd?.icon}></Icon>
            </div>}</div>
            {isAdd && (!pd?.icon || !pd.cover?.abled) && <div className='flex h-24 visible r-item-hover f-14 r-cursor r-gap-r-10 r-padding-w-6 r-padding-h-3 r-round remark r-flex-center gap-b-10' >
                {!pd?.icon && <a className="remark" onMouseDown={e => { this.block.page.onAddIcon(); this.forceUpdate() }}><Icon size={14} icon={AddPageIconSvg}></Icon><span className="gap-l-5">添加图标</span></a>}
                {!pd.cover?.abled && <a className="remark" onMouseDown={e => this.block.page.onAddCover()}><Icon size={14} icon={AddPageCoverSvg}></Icon><span className="gap-l-5">添加封面</span></a>}
            </div>}
            {!pd && <div className='sy-block-page-info-loading'>
                <Spin></Spin>
            </div>}
            {pd && <div className='sy-block-page-info-head'>
                <span className='sy-block-page-info-head-title'><TextArea
                    block={this.block}
                    placeholder='输入标题'
                    prop='pageInfo.text'
                    placeholderEmptyVisible
                ></TextArea></span>
            </div>}
        </div>
    }
}