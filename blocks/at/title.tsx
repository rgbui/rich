import React from "react";
import { Block } from "../../src/block";
import { BlockDisplay } from "../../src/block/enum";
import { prop, url, view } from "../../src/block/factory/observable";
import { TextArea } from "../../src/block/view/appear";
import { IconArguments } from "../../extensions/icon/declare";
import { BlockView } from "../../src/block/view";
import { PageDirective } from "../../src/page/directive";
import { Icon } from "../../component/view/icon";
import { useIconPicker } from "../../extensions/icon";
import { Rect } from "../../src/common/point";
import { messageChannel } from "../../util/bus/event.bus";
import { Directive } from "../../util/bus/directive";
import { BlockAppear } from "../../src/block/appear";

@url('/title')
export class Title extends Block {
    @prop()
    isShowIcon: boolean = true;
    @prop()
    isShowDescription: boolean = false;
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
            messageChannel.fire(Directive.UpdatePageItem, this.pageInfo.id, { icon });
        }
    }
    get isSupportTextStyle() {
        return false;
    }
}
@view('/title')
export class TitleView extends BlockView<Title>{
    async didMount() {
        messageChannel.on(Directive.UpdatePageItem, this.updatePageInfo)
        await this.block.loadPageInfo();
        this.forceUpdate();
    }
    updatePageInfo = (id: string, pageInfo: { text: string, icon?: IconArguments }) => {
        if (this.block.pageInfo.id == id) {
            Object.assign(this.block.pageInfo, pageInfo);
            this.forceUpdate();
        }
    }
    willUnmount() {
        messageChannel.off(Directive.UpdatePageItem, this.updatePageInfo);
    }
    render() {
        return <div className='sy-block-page-info' style={this.block.visibleStyle}>
            {this.block.pageInfo == null && <div className='sy-block-page-info-loading'></div>}
            {this.block.pageInfo != null &&
                <><div className='sy-block-page-info-head'>
                    {this.block.isShowIcon && this.block.pageInfo.icon && <span onMouseDown={e => this.block.onChangeIcon(e)} className='sy-block-page-info-head-icon'>
                        <Icon size={36} icon={this.block.pageInfo.icon}></Icon>
                    </span>}
                    <span className='sy-block-page-info-head-title'><TextArea
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