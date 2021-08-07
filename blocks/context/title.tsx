import React from "react";
import { Block } from "../../src/block";
import { BlockAppear, BlockDisplay } from "../../src/block/enum";
import { prop, url, view } from "../../src/block/factory/observable";
import { TextArea } from "../../src/block/partial/appear";
import { IconArguments } from "../../extensions/icon/declare";
import { BlockView } from "../../src/block/view";
import { PageDirective } from "../../src/page/directive";
import { Icon } from "../../component/icon";
import { useIconPicker } from "../../extensions/icon";
import { Rect } from "../../src/common/point";
@url('/title')
export class Title extends Block {
    @prop()
    isShowIcon: boolean = true;
    @prop()
    isShowDescription: boolean = false;
    appear = BlockAppear.text;
    display = BlockDisplay.block;
    pageInfo: { id: string, text: string, icon?: IconArguments, description?: string } = null;
    async loadPageInfo() {
        var r = await this.page.emitAsync(PageDirective.loadPageInfo);
        if (r) {
            this.pageInfo = r;
        }
    }
    async onChangeIcon(event: React.MouseEvent) {
        var icon = await useIconPicker({ roundArea: Rect.fromEvent(event) });
        if (icon) {
            this.pageInfo.icon = icon;
            await this.page.emitAsync(PageDirective.updatePageInfo, this.pageInfo.id, { icon });
            this.view.forceUpdate()
        }
    }
    get isSupportTextStyle() {
        return false;
    }
}
@view('/title')
export class TitleView extends BlockView<Title>{
    async didMount() {
        await this.block.loadPageInfo();
        this.forceUpdate();
    }
    render() {
        return <div className='sy-block-page-info' style={this.block.visibleStyle}>
            {this.block.pageInfo == null && <div className='sy-block-page-info-loading'></div>}
            {this.block.pageInfo != null &&
                <><div className='sy-block-page-info-head'>
                    {this.block.isShowIcon && this.block.pageInfo.icon && <span onMouseDown={e => this.block.onChangeIcon(e)} className='sy-block-page-info-head-icon'>
                        <Icon size={36} icon={this.block.pageInfo.icon}></Icon>
                    </span>}
                    <span className='sy-block-page-info-head-title'><TextArea html={this.block.pageInfo.text}></TextArea></span>
                </div>
                    {this.block.isShowDescription && <div className='sy-block-page-info-description'>
                    </div>}
                </>}
        </div>
    }
}