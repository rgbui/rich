import { BlockView } from "../../../src/block/view";
import React from 'react';
import { prop, url, view } from "../../../src/block/factory/observable";
import { Block } from "../../../src/block";
import { BlockDisplay } from "../../../src/block/enum";
import { IconArguments, ResourceArguments } from "../../../extensions/icon/declare";
import { useOutSideUrlInput } from "../../../extensions/link/outsite.input";
import { Rect } from "../../../src/common/vector/point";
import { Loading } from "../../../component/view/loading";
import { BookSvg } from "../../../component/svgs";
import { Icon } from "../../../component/view/icon";
import "./style.less";
import { channel } from "../../../net/channel";
import { autoImageUrl } from "../../../net/element.type";

@url('/bookmark')
export class Bookmark extends Block {
    display = BlockDisplay.block;
    @prop()
    src: IconArguments = { name: 'none' };
    @prop()
    bookmarkInfo: { title: string, description: string, icon: ResourceArguments, image: ResourceArguments } = null;
    loading: boolean = false;
    @prop()
    loadUrl: string = '';
    async didMounted() {
        if (!this.bookmarkInfo) {
            if (this.initialData && this.initialData.url) {
                await this.loadBookmarkByUrl(this.initialData.url);
            }
            else if (this.createSource == 'InputBlockSelector') {
                var r = await useOutSideUrlInput({ roundArea: Rect.fromEle(this.el) });
                if (r.url) {
                    await this.loadBookmarkByUrl(r.url);
                }
            }
        }
    }
    async loadBookmarkByUrl(url: string) {
        this.loading = true;
        this.forceUpdate();
        try {
            var r = await channel.put('/bookmark/url', { url });
            if (r?.ok) {
                this.bookmarkInfo = r.data;
            }
            else {

            }
            this.loadUrl = url;
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
            await this.loadBookmarkByUrl(r.url);
        }
    }
}
@view('/bookmark')
export class BookmarkView extends BlockView<Bookmark>{
    renderEmpty() {
        if (!this.block.bookmarkInfo) {
            if (this.block.loading) {
                return <div className="sy-block-bookmark-loading">
                    <Loading></Loading><span>{this.block.loadUrl}</span>
                </div>
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
        return <div className='sy-block-bookmark' style={this.block.visibleStyle}>
            {this.block.bookmarkInfo && <a className='sy-block-bookmark-link' href={this.block.loadUrl} target="_blank">
                <div className="sy-block-bookmark-content">
                    {this.block.bookmarkInfo.title && <div className="sy-block-bookmark-title">{this.block.bookmarkInfo.title}</div>}
                    {this.block.bookmarkInfo.description && <div className="sy-block-bookmark-description">{this.block.bookmarkInfo.description}</div>}
                    <div className="sy-block-bookmark-iconurl"> {this.block.bookmarkInfo.icon && <img src={this.block.bookmarkInfo.icon.url || this.block.bookmarkInfo.icon.origin} />}<span>{this.block.loadUrl}</span></div>
                </div>
                {this.block.bookmarkInfo.image && <div className='sy-block-bookmark-image'>
                    <div style={{ position: 'absolute', inset: 0 }}>
                        <img src={autoImageUrl(this.block.bookmarkInfo.image.url, 250)} />
                    </div>
                </div>}
            </a>}
            {this.renderEmpty()}
        </div>
    }
}