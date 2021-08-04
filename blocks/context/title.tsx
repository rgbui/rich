import React from "react";
import { Block } from "../../src/block";
import { BlockAppear, BlockDisplay } from "../../src/block/enum";
import { prop, url, view } from "../../src/block/factory/observable";
import { TextArea } from "../../src/block/partial/appear";
import { IconArguments } from "../../extensions/icon/declare";
import { BlockView } from "../../src/block/view";
import { PageDirective } from "../../src/page/directive";

@url('/title')
export class Title extends Block {
    @prop()
    isShowIcon: boolean = true;
    @prop()
    isShowDescription: boolean = false;
    appear = BlockAppear.text;
    display = BlockDisplay.block;
    pageInfo: { title: string, icon: IconArguments, description?: string } = null;
    async loadPageInfo() {
        var r = await this.page.emitAsync(PageDirective.loadPageInfo);
        if (r) {
            this.pageInfo = r;
        }
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
                <><div className='sy-block-page-info-title'>
                    {this.block.isShowIcon && <span></span>}
                    <span><TextArea html={this.block.pageInfo.title}></TextArea></span>
                </div>
                    {this.block.isShowDescription && <div className='sy-block-page-info-description'>
                    </div>}
                </>}
        </div>
    }
}