
import React, { CSSProperties } from 'react';
import { BlockView } from "../view";
import { url, view } from "../factory/observable";
import { Block } from '..';
import { ChildsArea } from '../view/appear';
import { PageLayoutType } from '../../page/declare';
import { isMobileOnly } from 'react-device-detect';
import { PageCover } from '../../page/view/cover';

@url('/view')
export class View extends Block {
    get isView() {
        return true;
    }
}

/*** 在一个页面上，从视觉上有多个视图块，
 * 如每个页面都有一个初始的内容视图，不可拖动
 *  但页面可以会有弹层等一些其它的视图
 */
@view('/view')
export class ViewComponent extends BlockView<View>{
    renderView() {
        var isMainView = this.block.page.views[0] == this.block ? true : false;
        var layoutStyle = this.block.page.getScreenStyle();
        if (this.block.page.isCanOutline || this.block.page?.pageLayout?.type == PageLayoutType.textChannel) layoutStyle = {};
        var WrapperStyle: CSSProperties = {};
        var isTextChannel = this.block.page.pageLayout?.type == PageLayoutType.textChannel;
        var isDocCard = this.block.page.pageLayout?.type == PageLayoutType.ppt;
        if (isMainView) {
            WrapperStyle.paddingTop = 50;
        }
        if (this.block.page.isSupportScreen && !isTextChannel && !isDocCard && isMainView) {
            layoutStyle.border = '1px solid transparent';
            layoutStyle.boxShadow = 'none';
            layoutStyle.borderRadius = 0;
            var isContentGap = this.block.page?.pageTheme?.coverStyle?.display == 'none' || this.block.page?.pageTheme?.coverStyle?.display == 'inside-cover'
            if (this.block.page?.pageTheme?.contentStyle) {
                var cs = this.block.page?.pageTheme?.contentStyle;
                WrapperStyle.padding = isMobileOnly ? 10 : 60;
                layoutStyle.backgroundColor = '#fff';
                layoutStyle.borderRadius = isMobileOnly ? 6 : 16;
                layoutStyle.boxShadow = 'rgba(18, 18, 18, 0.1) 0px 1px 3px 0px';
                if (cs.border) {
                    if (typeof cs.border == 'string') layoutStyle.border = cs.border;
                    else Object.assign(layoutStyle, cs.border);
                }
                if (cs.round) {
                    if (typeof cs?.round == 'string') layoutStyle.borderRadius = cs.round;
                    else Object.assign(layoutStyle, cs.round);
                }
                if (cs.shadow) {
                    if (typeof cs.shadow == 'string') layoutStyle.boxShadow = cs.shadow;
                    else Object.assign(layoutStyle, cs.shadow);
                }
                if (cs?.transparency) {
                    if (cs.transparency == 'frosted') {
                        layoutStyle.backdropFilter = 'blur(20px) saturate(170%)';
                        //'rgba(255, 252, 248, 0.75)';
                        if (cs.color == 'light') layoutStyle.backgroundColor = 'rgba(255,255,255, 0.75)';
                        else layoutStyle.backgroundColor = 'rgba(12, 12, 12, 0.75)';
                    }
                    else if (cs.transparency == 'faded') {
                        if (cs.color == 'light') layoutStyle.backgroundColor = 'rgba(255,255,255, 0.75)';
                        else layoutStyle.backgroundColor = 'rgba(12, 12, 12, 0.75)';
                    }
                    else if (cs.transparency == 'solid') {
                        if (cs.color == 'light') layoutStyle.backgroundColor = '#fff'
                        else layoutStyle.backgroundColor = 'rgba(12, 12, 12, 0.75)';
                    }
                    else if (cs.transparency == 'noborder') {
                        if (cs.color == 'light') layoutStyle.backgroundColor = 'transparent'
                        else layoutStyle.backgroundColor = 'transparent';
                        WrapperStyle.padding = 0;
                        layoutStyle.boxShadow = 'none';
                        layoutStyle.borderRadius = 0;
                        layoutStyle.border = 'none'
                    }
                }
            }
            return <div className={'sy-block-view'} >
                {isContentGap && <div style={{ height: isMobileOnly ? 30 : 80 }}></div>}
                <div className={'sy-block-view-wrapper'} style={layoutStyle}>
                    {this.block.page.pageTheme?.coverStyle?.display == 'inside-cover' && <PageCover page={this.block.page}></PageCover>}
                    <div style={WrapperStyle}>
                        <ChildsArea childs={this.block.childs}></ChildsArea>
                    </div>
                </div>
            </div>
        }
        else {
            WrapperStyle = {};
            if (isDocCard) {
                layoutStyle.display = 'block';
                layoutStyle.width = '100%';
            }
            layoutStyle = {}
            return <div className='sy-block-view' style={layoutStyle} >
                <div style={WrapperStyle}><ChildsArea childs={this.block.childs}></ChildsArea></div>
            </div>
        }
    }
}

