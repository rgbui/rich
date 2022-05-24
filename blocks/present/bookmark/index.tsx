import { BlockView } from "../../../src/block/view";
import React from 'react';
import { prop, url, view } from "../../../src/block/factory/observable";
import { Block } from "../../../src/block";
import { BlockDisplay } from "../../../src/block/enum";
import { IconArguments, ResourceArguments } from "../../../extensions/icon/declare";
import { useOutSideUrlInput } from "../../../extensions/link/outsite.input";
import { Rect } from "../../../src/common/vector/point";
import { Loading } from "../../../component/view/loading";

@url('/bookmark')
export class Bookmark extends Block {
    display = BlockDisplay.block;
    @prop()
    src: IconArguments = { name: 'none' };
    @prop()
    bookmarkInfo: { url: string, title: string, description: string, thumbnail: ResourceArguments, icon: ResourceArguments } = null;
    loading: boolean = false;
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
        this.loadUrl = url;
    }
    async openInputBookmark(event: React.MouseEvent) {
        var r = await useOutSideUrlInput({ roundArea: Rect.fromEle(this.el) });
        if (r.url) {
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

                </div>
            }
        }
    }
    render() {
        return <div className='sy-block-bookmark' style={this.block.visibleStyle}>
            {this.block.bookmarkInfo && <a href={this.block.bookmarkInfo.url} target="_blank">
                {this.block.bookmarkInfo.thumbnail && <img src={this.block.bookmarkInfo.thumbnail?.url} />}
                <div className="sy-block-bookmark-content">
                    <div className="sy-block-bookmark-title">{this.block.bookmarkInfo.title}</div>
                    <div className="sy-block-bookmark-description">{this.block.bookmarkInfo.description}</div>
                    <div className="sy-block-bookmark-iconurl">{this.block.bookmarkInfo.icon && <img src={this.block.bookmarkInfo.icon.url} />} {this.block.bookmarkInfo.url}</div>
                </div>
            </a>}
            {this.renderEmpty()}
        </div>
    }
}