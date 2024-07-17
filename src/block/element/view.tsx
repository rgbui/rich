
import React, { CSSProperties } from 'react';
import { BlockView } from "../view";
import { url, view } from "../factory/observable";
import { Block } from '..';
import { ChildsArea } from '../view/appear';
import { PageLayoutType } from '../../page/declare';
import { isMobileOnly } from 'react-device-detect';
import { PageCover } from '../../page/view/cover';
import { S } from '../../../i18n/view';
import { ToolTip } from '../../../component/view/tooltip';
import { lst } from '../../../i18n/store';



import { BlockChildKey, BlockUrlConstant } from '../constant';
import { util } from '../../../util/util';
import { Matrix } from '../../common/matrix';
import { Icon } from '../../../component/view/icon';

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
export class ViewComponent extends BlockView<View> {

    submitedSpread = false;
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
                {isContentGap && <div style={{ height: isMobileOnly ? 30 : (this.props.block.page.hideDocTitle ? 40 : 80) }}></div>}
                <div className={'sy-block-view-wrapper'} style={layoutStyle}>
                    {this.block.page.pageTheme?.coverStyle?.display == 'inside-cover' && <PageCover page={this.block.page}></PageCover>}
                    <div style={WrapperStyle}>
                        {this.block.page.dataSubmitId && this.submitedSpread == false && <div onMouseDown={e => {
                            this.submitedSpread = true;
                            this.block.forceManualUpdate()
                        }} className='flex-center'>
                            <div className='w-400 padding-h-10 flex-center round bg-white shadow-s border-light'>
                                <span className='gap-r-3'><S>您已提交过1份数据</S></span>
                                <span className='cursor link'>重新编辑</span>
                            </div>
                        </div>}
                        <div style={{
                            display: this.block.page.dataSubmitId && this.submitedSpread == false ? "none" : "block"
                        }}>
                            <ChildsArea childs={this.block.childs}></ChildsArea>
                        </div>
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
                <div style={WrapperStyle}>
                    {this.block.page.dataSubmitId && this.submitedSpread == false && <div onMouseDown={e => {
                        this.submitedSpread = true;
                        this.block.forceManualUpdate()
                    }} className='flex-center'>
                        <div className='w-400 padding-h-10 flex-center round bg-white shadow-s border-light'>
                            <span className='gap-r-3'><S>您已提交过1份数据</S></span>
                            <span className='cursor link'>重新编辑</span>
                        </div>
                    </div>}
                    <div style={{
                        display: this.block.page.dataSubmitId && this.submitedSpread == false ? "none" : "block"
                    }}>
                        <ChildsArea childs={this.block.childs}></ChildsArea>
                        {isDocCard && this.block.childs.length == 0 && <div>
                            <div className="sy-block-view-card-ops flex-center padding-h-50 gap-w-50  ">
                                {this.block.isCanEdit() && <>
                                    <ToolTip overlay={lst('添加文档卡片')}>
                                        <div onMouseDown={e => this.onAddCardBox(e)} className="size-30 bg-white shadow-s flex-center cursor border circle text-1 link-hover gap-r-20"><Icon size={18} icon={{ name: "byte", code: 'add' }}></Icon></div>
                                    </ToolTip>
                                    <ToolTip overlay={lst('添加白板卡片')}>
                                        <div onMouseDown={e => this.onAddBoardCardBox(e)} className="size-30 bg-white shadow-s flex-center cursor border circle text-1 link-hover"> <Icon size={18} icon={{ name: 'byte', code: 'add-one' }}></Icon></div>
                                    </ToolTip>
                                </>}
                            </div>
                        </div>}
                    </div>
                </div>
            </div>
        }
    }
    async onAddCardBox(event: React.MouseEvent) {
        event.stopPropagation();
        await this.block.page.onAction('onAddCardBox', async () => {
            var d = {
                url: BlockUrlConstant.CardBox,
                blocks: {
                    childs: [
                        { url: BlockUrlConstant.Head }
                    ]
                }
            };
            var nb = (await this.block.appendArrayBlockData([d], 0, BlockChildKey.childs))[0];
            nb.mounted(async () => {
                await util.delay(100);
                await this.block.page.onPageScroll(nb);
                var head = nb.find(g => g.url == BlockUrlConstant.Head)
                this.block.page.kit.anchorCursor.onFocusBlockAnchor(head, { merge: true, render: true, last: true })
            })
        });
    }
    async onAddBoardCardBox(event: React.MouseEvent) {
        event.stopPropagation();
        this.block.page.onAction('onAddBoardCardBox', async () => {
            var ma = new Matrix();
            ma.translate(30, 20);
            var d = {
                url: BlockUrlConstant.CardBox,
                board: true,
                blocks: {
                    childs: [
                        {
                            url: BlockUrlConstant.TextSpan,
                            matrix: ma.getValues(),
                        }
                    ]
                }
            };
            var newBlock = (await this.block.appendArrayBlockData([d], 0, BlockChildKey.childs))[0];
            newBlock.mounted(async () => {
                await this.block.page.onPageScroll(newBlock);
                newBlock.page.kit.boardSelector.onShow(newBlock.el, { page: newBlock.page, block: newBlock })
                var textSpan = newBlock.find(g => g.url == BlockUrlConstant.TextSpan)
                await this.block.page.kit.picker.onPicker([textSpan], { merge: true, disabledOpenTool: true });
            })
        });
    }
}

