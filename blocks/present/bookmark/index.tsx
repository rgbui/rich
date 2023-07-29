import { BlockView } from "../../../src/block/view";
import React from 'react';
import { prop, url, view } from "../../../src/block/factory/observable";
import { Block } from "../../../src/block";
import { BlockDirective, BlockDisplay, BlockRenderRange } from "../../../src/block/enum";
import { ResourceArguments } from "../../../extensions/icon/declare";
import { useOutSideUrlInput } from "../../../extensions/link/outsite.input";
import { Rect } from "../../../src/common/vector/point";
import { BookSvg, DotsSvg, DuplicateSvg, RefreshSvg } from "../../../component/svgs";
import { Icon } from "../../../component/view/icon";
import "./style.less";
import { channel } from "../../../net/channel";
import { autoImageUrl } from "../../../net/element.type";
import { ActionDirective } from "../../../src/history/declare";
import { Spin } from "../../../component/view/spin";
import { ToolTip } from "../../../component/view/tooltip";
import { MenuItem, MenuItemType } from "../../../component/view/menu/declare";
import lodash from "lodash";
import { CopyAlert } from "../../../component/copy";


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
        var bo = this.bookmarkInfo;
        this.bookmarkInfo = null;
        this.forceUpdate();
        try {
            var r = await channel.put('/bookmark/url', { url });
            await this.page.onAction(ActionDirective.onBookMark, async () => {
                if (isInit) this.page.snapshoot.merge();
                await this.updateProps({ bookmarkUrl: url })
                if (r?.ok) {
                    await this.updateProps({ bookmarkInfo: r.data }, BlockRenderRange.self)
                }
                else {
                    if (bo) {
                        await this.updateProps({ bookmarkInfo: bo })
                    }
                }
            });
        }
        catch (ex) {
            console.error(ex);
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
        if (this.bookmarkInfo) return `[${this.bookmarkInfo.title}](${this.bookmarkUrl})  `
        else return `[书签](${this.bookmarkUrl})`
    }
    async onGetContextMenus() {
        var rs = await super.onGetContextMenus();
        rs = rs.splice(2);
        lodash.remove(rs, g => g.name == 'text-align');
        var at = rs.findIndex(g => g.text == '颜色');
        var ns: MenuItem<string | BlockDirective>[] = [];
        rs.splice(0, 0,
            { name: 'open', text: '打开书签网址', icon: { name: 'bytedance-icon', code: 'arrow-right-up' } },
            { type: MenuItemType.divide }
        )
        ns.push({ type: MenuItemType.divide });
        ns.push({ name: 'reload', text: '重新生成书签', icon: RefreshSvg });
        ns.push({ name: 'copyLink', text: '复制书签网址', icon: DuplicateSvg });
        ns.push({ type: MenuItemType.divide });
        rs.splice(at, 0, ...ns)
        return rs;
    }
    async onClickContextMenu(item: MenuItem<string | BlockDirective>, event: MouseEvent): Promise<void> {
        if (item.name == 'reload') {
            await this.onLoadBookmarkByUrl(this.bookmarkUrl)
            return;
        }
        if (item.name == 'copyLink') {
            CopyAlert(this.bookmarkUrl, '已复制书签网址')
            return;
        }
        if (item.name == 'open') {
            window.open(this.bookmarkUrl)
            return;
        }
        return await super.onClickContextMenu(item, event);
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
                    <ToolTip overlay={'重新生成书签'}><span onMouseDown={e => {
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
            {this.block.bookmarkInfo && <a className='sy-block-bookmark-link visible-hover' href={this.block.bookmarkUrl} target='_blank' >
                <div className="sy-block-bookmark-content" style={{ marginRight: this.block.imageWidth > 180 && this.block.imageWidth < 250 ? this.block.imageWidth : 0 }}>
                    {this.block.bookmarkInfo.title && <div className="sy-block-bookmark-title">{this.block.bookmarkInfo.title}</div>}
                    {this.block.bookmarkInfo.description && <div className="sy-block-bookmark-description">{this.block.bookmarkInfo.description}</div>}
                    <div className="sy-block-bookmark-iconurl"> {this.block.bookmarkInfo.icon && <img src={this.block.bookmarkInfo.icon.url || this.block.bookmarkInfo.icon.origin} />}<span>{this.block.bookmarkUrl}</span></div>
                </div>
                {this.block.bookmarkInfo.image && this.block.imageWidth > 180 && this.block.imageWidth < 250 && <div style={{ width: this.block.imageWidth }} className='sy-block-bookmark-image'>
                    <img src={autoImageUrl(this.block.bookmarkInfo.image.url, 250)} />
                </div>}
                {this.block.isCanEdit() && <div onMouseDown={e => {
                    e.stopPropagation();
                    this.block.onContextmenu(e.nativeEvent)
                }} className="bg-dark cursor visible text-white pos-top-right gap-5 size-24 round flex-center ">
                    <Icon size={18} icon={DotsSvg}></Icon>
                </div>}
            </a>}
            {this.renderEmpty()}
        </div></div>
    }
}