import { BlockView } from "../../../src/block/view";
import React from 'react';
import { prop, url, view } from "../../../src/block/factory/observable";
import { Block } from "../../../src/block";
import { BlockDisplay } from "../../../src/block/enum";
import { ResourceArguments } from "../../../extensions/icon/declare";
import { useOutSideUrlInput } from "../../../extensions/link/outsite.input";
import { Rect } from "../../../src/common/vector/point";
import { Loading } from "../../../component/view/loading";
import { BookSvg } from "../../../component/svgs";
import { Icon } from "../../../component/view/icon";
import "./style.less";
import { channel } from "../../../net/channel";
import { autoImageUrl } from "../../../net/element.type";
import { ActionDirective } from "../../../src/history/declare";

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
    }
    async onLoadBookmarkByUrl(url: string, isInit?: boolean) {
        this.loading = true;
        this.forceUpdate();
        try {
            var r = await channel.put('/bookmark/url', { url });
            await this.onAction(ActionDirective.onBookMark, async () => {
                if (isInit) this.page.snapshoot.merge();
                if (r?.ok) {
                    this.updateProps({ bookmarkInfo: r.data })
                }
                this.updateProps({ bookmarkUrl: url });
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
}
@view('/bookmark')
export class BookmarkView extends BlockView<Bookmark>{
    renderEmpty() {
        if (!this.block.bookmarkInfo) {
            if (this.block.loading) {
                return <div className="sy-block-bookmark-loading">
                    <Loading></Loading><span>{this.block.bookmarkUrl}</span>
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
            {this.block.bookmarkInfo && <a className='sy-block-bookmark-link' href={this.block.bookmarkUrl} target="_blank">
                <div className="sy-block-bookmark-content">
                    {this.block.bookmarkInfo.title && <div className="sy-block-bookmark-title">{this.block.bookmarkInfo.title}</div>}
                    {this.block.bookmarkInfo.description && <div className="sy-block-bookmark-description">{this.block.bookmarkInfo.description}</div>}
                    <div className="sy-block-bookmark-iconurl"> {this.block.bookmarkInfo.icon && <img src={this.block.bookmarkInfo.icon.url || this.block.bookmarkInfo.icon.origin} />}<span>{this.block.bookmarkUrl}</span></div>
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