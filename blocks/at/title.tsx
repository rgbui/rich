import React from "react";
import { Block } from "../../src/block";
import { BlockDisplay } from "../../src/block/enum";
import { prop, url, view } from "../../src/block/factory/observable";
import { TextArea } from "../../src/block/view/appear";
import { BlockView } from "../../src/block/view";
import { Icon } from "../../component/view/icon";
import { useIconPicker } from "../../extensions/icon";
import { Rect } from "../../src/common/vector/point";
import { BlockAppear } from "../../src/block/appear";
import lodash from "lodash";
import { channel } from "../../net/channel";
import { LinkPageItem } from "../../extensions/at/declare";
@url('/title')
export class Title extends Block {
    @prop()
    isShowIcon: boolean = true;
    @prop()
    isShowDescription: boolean = false;
    display = BlockDisplay.block;
    pageInfo: LinkPageItem = null;
    async loadPageInfo() {
        var r = await channel.get('/page/query/info', { id: this.page.pageItemId });
        if (r.ok) {
            this.pageInfo = r.data;
        }
    }
    async changeAppear(appear) {
        if (appear.prop == 'pageInfo.text' || appear.prop == 'pageInfo.description') {
            channel.air('/page/update/info', {
                id: this.pageInfo.id, pageInfo: {
                    id: this.pageInfo.id,
                    text: this.pageInfo?.text,
                    description: this.pageInfo?.description
                }
            })
        }
    }
    async onChangeIcon(event: React.MouseEvent) {
        var icon = await useIconPicker({ roundArea: Rect.fromEvent(event) });
        if (icon) {
            channel.air('/page/update/info', { id: this.pageInfo.id, pageInfo: { icon } })
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
            var isUpdate: boolean = false;
            if (typeof pageInfo.text != 'undefined' && pageInfo.text != this.block.pageInfo.text) {
                this.block.pageInfo.text = pageInfo.text;
                isUpdate = true;
            }
            if (!this.block.pageInfo.icon && pageInfo.icon || typeof pageInfo.icon != 'undefined' && !lodash.isEqual(pageInfo.icon, this.block.pageInfo.icon)) {
                this.block.pageInfo.icon = pageInfo.icon;
                isUpdate = true;
            }
            if (isUpdate)
                this.forceUpdate();
        }
    }
    willUnmount() {
        channel.off('/page/update/info', this.updatePageInfo);
    }
    render() {
        return <div className='sy-block-page-info' style={this.block.visibleStyle}>
            {this.block.pageInfo == null && <div className='sy-block-page-info-loading'></div>}
            {this.block.pageInfo != null &&
                <><div className='sy-block-page-info-head'>
                    {this.block.isShowIcon && this.block.pageInfo.icon && <span onMouseDown={e => this.block.onChangeIcon(e)} className='sy-block-page-info-head-icon'>
                        <Icon size={42} icon={this.block.pageInfo.icon}></Icon>
                    </span>}
                    <span className='sy-block-page-info-head-title'><TextArea placeholder='输入标题'
                        rf={e => this.block.elementAppear({ el: e, appear: BlockAppear.text, prop: 'pageInfo.text' })}
                        html={this.block.pageInfo.text}></TextArea></span>
                </div>
                    {this.block.isShowDescription && <div className='sy-block-page-info-description'>
                        <TextArea
                            rf={e => this.block.elementAppear({ el: e, appear: BlockAppear.text, prop: 'pageInfo.description' })}
                            html={this.block.pageInfo.description}
                        ></TextArea>
                    </div>}
                </>}
        </div>
    }
}