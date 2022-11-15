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
            if (!this.page?.pageInfo.text) {
                this.page.kit.anchorCursor.onFocusBlockAnchor(this, { render: true });
            }
        }
    }
    get handleBlock() {
        return null;
    }
}
@view('/title')
export class TitleView extends BlockView<Title>{
    async didMount() {
        channel.sync('/page/update/info', this.updatePageInfo);
        await this.block.loadPageInfo();
        this.forceUpdate(() => {
            this.block.onEmptyTitleFocusAnchor();
        });
    }
    updatePageInfo = (r: { elementUrl: string, pageInfo: LinkPageItem }) => {
        var { elementUrl, pageInfo } = r;
        if (this.block.page.elementUrl == elementUrl) {
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
        var pd=this.block.page.getPageDataInfo();
        return <div className='sy-block-page-info' style={this.block.visibleStyle}>
            <div className="min-h-72">{this.block.pageInfo?.icon && pd.cover?.abled !== true && <div onMouseDown={e => this.block.page.onChangeIcon(e)} className="sy-block-page-info-icon">
                <Icon size={72} icon={this.block.pageInfo?.icon}></Icon>
            </div>}</div>
            {isAdd && (!this.block.pageInfo?.icon || !pd.cover?.abled) && <div className='sy-block-page-info-operators' >
                {!this.block.pageInfo?.icon && <a onMouseDown={e => this.block.page.onAddIcon()}><Icon size={14} icon={AddPageIconSvg}></Icon><span>添加图标</span></a>}
                {!pd.cover?.abled && <a onMouseDown={e => this.block.page.onAddCover()}><Icon size={14} icon={AddPageCoverSvg}></Icon><span>添加封面</span></a>}
            </div>}
            {this.block.pageInfo == null && <div className='sy-block-page-info-loading'>
                <Spin></Spin>
            </div>}
            {this.block.pageInfo != null && <div className='sy-block-page-info-head'>
                <span className='sy-block-page-info-head-title'><TextArea
                    block={this.block}
                    placeholder='输入标题'
                    prop='pageInfo.text'
                ></TextArea></span>
            </div>}
        </div>
    }
}