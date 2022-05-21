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
import { useIconPicker } from "../../extensions/icon";
import { Rect } from "../../src/common/vector/point";
import lodash from "lodash";

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
            if (this.page.pageInfo)
                this.page.pageInfo.text = this.pageInfo?.text
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
    onEmptyTitleFocusAnchor() {
        if (this.page?.pageInfo) {
            if (!this.page?.pageInfo.text) {
                this.page.kit.writer.onFocusBlockAnchor(this);
            }
        }
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
    updatePageInfo = (r: { id: string, pageInfo: LinkPageItem }) => {
        var { id, pageInfo } = r;
        if (this.block.pageInfo.id == id) {
            var isUpdate: boolean = false;
            if (typeof pageInfo.text != 'undefined' && pageInfo.text != this.block.pageInfo.text) {
                this.block.pageInfo.text = pageInfo.text;
                isUpdate = true;
            }
            if (typeof pageInfo.icon != 'undefined' && JSON.stringify(pageInfo.icon) != JSON.stringify(this.block.pageInfo.icon)) {
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
        var self = this;
        async function changeIcon(event: React.MouseEvent) {
            event.stopPropagation();
            var icon = await useIconPicker({ roundArea: Rect.fromEvent(event) });
            if (icon) {
                channel.air('/page/update/info', { id: self.block.page.pageItemId, pageInfo: { icon } })
            }
        }
        var isAdd: boolean = this.block.page.isSupportCover;
        return <div className='sy-block-page-info' style={this.block.visibleStyle}>
            {this.block.pageInfo?.icon && this.block.page.cover?.abled !== true && <div onMouseDown={e => changeIcon(e)} className="sy-block-page-info-icon">
                <Icon size={72} icon={this.block.pageInfo?.icon}></Icon>
            </div>}
            {isAdd && (!this.block.pageInfo?.icon || !this.block.page.cover?.abled) && <div className='sy-block-page-info-operators' >
                {!this.block.pageInfo?.icon && <a onMouseDown={e => this.block.page.onAddIcon()}><Icon size={14} icon={AddPageIconSvg}></Icon><span>添加图标</span></a>}
                {!this.block.page.cover?.abled && <a onMouseDown={e => this.block.page.onAddCover()}><Icon size={14} icon={AddPageCoverSvg}></Icon><span>添加封面</span></a>}
            </div>}
            {this.block.pageInfo == null && <div className='sy-block-page-info-loading'></div>}
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