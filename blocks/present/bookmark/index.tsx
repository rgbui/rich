import { BlockView } from "../../../src/block/view";
import React from 'react';
import { prop, url, view } from "../../../src/block/factory/observable";
import { Block } from "../../../src/block";
import { BlockDisplay } from "../../../src/block/enum";
import { ResourceArguments } from "../../../extensions/icon/declare";
import { useOutSideUrlInput } from "../../../extensions/link/outsite.input";
import { Rect } from "../../../src/common/vector/point";
import { BookSvg, RefreshSvg } from "../../../component/svgs";
import { Icon } from "../../../component/view/icon";
import "./style.less";
import { channel } from "../../../net/channel";
import { autoImageUrl } from "../../../net/element.type";
import { ActionDirective } from "../../../src/history/declare";
import { Spin } from "../../../component/view/spin";
import { ToolTip } from "../../../component/view/tooltip";

@url('/bookmark')
export class Bookmark extends Block {
    display = BlockDisplay.block;
    @prop()
    bookmarkInfo: { title: string, description: string, icon: ResourceArguments, image: ResourceArguments } = null;
    loading: boolean = false;
    @prop()
    bookmarkUrl: string = '';
    async didMounted() {
        if (!this.bookmarkInfo) {
            if (this.initialData && this.initialData.url) {
                await this.onLoadBookmarkByUrl(this.initialData.url, true);
            }
            else if (this.createSource == 'InputBlockSelector') {
                if (this.bookmarkUrl) {
                    await this.onLoadBookmarkByUrl(this.bookmarkUrl, true);
                }
                else {
                    var r = await useOutSideUrlInput({ roundArea: Rect.fromEle(this.el) });
                    if (r?.url) {
                        await this.onLoadBookmarkByUrl(r.url, true);
                    }
                }
            }
        }
        else {
            var rect = Rect.fromEle(this.el);
            this.imageWidth = rect.width * 0.2;
            this.forceUpdate();
        }
    }
    imageWidth = -20;
    async onLoadBookmarkByUrl(url: string, isInit?: boolean) {
        this.loading = true;
        this.forceUpdate();
        try {
            this.updateProps({ bookmarkUrl: url });
            var r = await channel.put('/bookmark/url', { url });
            await this.page.onAction(ActionDirective.onBookMark, async () => {
                if (isInit) this.page.snapshoot.merge();
                if (r?.ok) {
                    this.updateProps({ bookmarkInfo: r.data })
                }

            })
        }
        catch (ex) {

        }
        finally {
            this.loading = false;
        }
        this.forceUpdate();
    }
    async openInputBookmark(event: React.MouseEvent) {
        var r = await useOutSideUrlInput({ roundArea: Rect.fromEle(this.el) });
        if (r?.url) {
            await this.onLoadBookmarkByUrl(r.url);
        }
    }
    async getPlain() {
        if (this.bookmarkInfo)
            return this.bookmarkInfo.title + (this.bookmarkInfo.description || '')
        else return '';
    }
    async getMd() {
        return `[${this.bookmarkInfo.title}](${this.bookmarkUrl})  `
    }
}
@view('/bookmark')
export class BookmarkView extends BlockView<Bookmark>{
    renderEmpty() {
        if (!this.block.bookmarkInfo) {
            if (this.block.loading) {
                return <div className="sy-block-bookmark-loading flex">
                    <Spin></Spin>
                    <span className="text-1 gap-l-10">{this.block.bookmarkUrl}</span>
                </div>
            }
            else if (this.block.bookmarkUrl) {
                return <a className='sy-block-bookmark-link flex visible-hover' href={this.block.bookmarkUrl} target='_blank' >
                    <span className="remark flex-auto">{this.block.bookmarkUrl}</span>
                    <ToolTip overlay={'重新生成书签'}> <span onMouseDown={e => {
                        e.stopPropagation();
                        e.preventDefault();
                    }} className="flex-fixed size-24 flex-center cursor visible" onClick={e => {
                        e.stopPropagation();
                        e.preventDefault();
                        this.block.onLoadBookmarkByUrl(this.block.bookmarkUrl)
                    }}><Icon size={18} icon={RefreshSvg}></Icon></span></ToolTip>
                </a>
            }
            else {
                return <div className="sy-block-bookmark-empty" onMouseDown={e => this.block.openInputBookmark(e)}>
                    <Icon icon={BookSvg}></Icon>
                    <span>添加书签</span>
                </div>
            }
        }
    }
    render() {
        return <div style={this.block.visibleStyle}><div className='sy-block-bookmark' style={this.block.contentStyle} >
            {this.block.bookmarkInfo && <a className='sy-block-bookmark-link' href={this.block.bookmarkUrl} target='_blank' >
                <div className="sy-block-bookmark-content" style={{ marginRight: this.block.imageWidth > 180 && this.block.imageWidth < 250 ? this.block.imageWidth : 0 }}>
                    {this.block.bookmarkInfo.title && <div className="sy-block-bookmark-title">{this.block.bookmarkInfo.title}</div>}
                    {this.block.bookmarkInfo.description && <div className="sy-block-bookmark-description">{this.block.bookmarkInfo.description}</div>}
                    <div className="sy-block-bookmark-iconurl"> {this.block.bookmarkInfo.icon && <img src={this.block.bookmarkInfo.icon.url || this.block.bookmarkInfo.icon.origin} />}<span>{this.block.bookmarkUrl}</span></div>
                </div>
                {this.block.bookmarkInfo.image && this.block.imageWidth > 180 && this.block.imageWidth < 250 && <div style={{ width: this.block.imageWidth }} className='sy-block-bookmark-image'>
                    <img src={autoImageUrl(this.block.bookmarkInfo.image.url, 250)} />
                </div>}
            </a>}
            {this.renderEmpty()}
        </div></div>
    }
}