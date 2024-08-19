import { BlockView } from "../../../src/block/view";
import React from 'react';
import { prop, url, view } from "../../../src/block/factory/observable";
import { Block } from "../../../src/block";
import { BlockDirective, BlockDisplay, BlockRenderRange } from "../../../src/block/enum";
import { ResourceArguments } from "../../../extensions/icon/declare";
import { useOutSideUrlInput } from "../../../extensions/link/outsite.input";
import { Rect } from "../../../src/common/vector/point";
import { BookSvg, DotsSvg, RefreshSvg } from "../../../component/svgs";
import { Icon } from "../../../component/view/icon";
import { channel } from "../../../net/channel";
import { autoImageUrl } from "../../../net/element.type";
import { ActionDirective } from "../../../src/history/declare";
import { Spin } from "../../../component/view/spin";
import { MenuItem, MenuItemType } from "../../../component/view/menu/declare";
import { CopyAlert } from "../../../component/copy";
import { lst } from "../../../i18n/store";
import { S } from "../../../i18n/view";
import { Tip } from "../../../component/view/tooltip/tip";
import { ShyAlert } from "../../../component/lib/alert";
import "./style.less";

@url('/bookmark')
export class Bookmark extends Block {
    display = BlockDisplay.block;
    @prop()
    fixedWidth = 500;
    @prop()
    fixedHeight = 120;
    @prop()
    bookmarkInfo: { title: string, description: string, icon: ResourceArguments, image: ResourceArguments } = null;
    loading: boolean = false;
    @prop()
    bookmarkUrl: string = '';
    async didMounted() {
        if (!this.bookmarkInfo) {
            await this.onBlockReloadData(async () => {
                if (this.initialData && this.initialData.url) {
                    await this.onLoadBookmarkByUrl(this.initialData.url, true);
                    this.initialData={};
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
                    delete this.createSource;
                }
            });
        }
        else {
            var rect = Rect.fromEle(this.el);
            this.imageWidth = rect.width * 0.2;
            this.forceManualUpdate();
        }
    }
    imageWidth = -20;
    async onLoadBookmarkByUrl(url: string, isInit?: boolean) {
        this.loading = true;
        var bo = this.bookmarkInfo;
        this.bookmarkInfo = null;
        this.forceManualUpdate();
        try {
            var r = await channel.put('/bookmark/url', { url });
            if (!r.ok) {
                ShyAlert(lst('无法获取书签信息'))
            }
            await this.page.onAction(ActionDirective.onBookMark, async () => {
                if (isInit) this.page.snapshoot.merge();
                await this.updateProps({ bookmarkUrl: url }, BlockRenderRange.self)
                if (r?.ok) {
                    await this.updateProps({ bookmarkInfo: r.data }, BlockRenderRange.self)
                }
                else {
                    if (bo) {
                        await this.updateProps({ bookmarkInfo: bo }, BlockRenderRange.self)
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
        var rect = Rect.fromEle(this.el);
        this.imageWidth = rect.width * 0.2;
        this.forceManualUpdate();
    }
    async openInputBookmark() {
        if (!this.isCanEdit()) return;
        var r = await useOutSideUrlInput({ roundArea: Rect.fromEle(this.el) },
            { embedType: 'bookmark' }
        );
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
    getResolveContent(this: Block) {
        return lst('书签')
    }
    async onGetContextMenus() {
        var rs = await super.onGetContextMenus();
        var ns: MenuItem<string | BlockDirective>[] = [];
        ns.push({
            text: lst('打开书签网址'),
            icon: { name: 'bytedance-icon', code: 'arrow-right-up' },
            disabled: this.bookmarkUrl ? false : true
        })
        ns.push({ name: 'copyLink', disabled: this.bookmarkUrl ? false : true, text: lst('复制书签网址'), icon: { name: 'byte', code: 'bookmark-one' } });
        ns.push({ type: MenuItemType.divide });
        ns.push({
            name: 'reload',
            text: this.bookmarkUrl ? lst('重新生成书签') : lst('添加书签'),
            icon: RefreshSvg
        });
        ns.push({ type: MenuItemType.divide });
        var at = rs.findIndex(g => g.name == BlockDirective.comment);
        rs.splice(at - 1, 0, ...ns);
        var dat = rs.findIndex(g => g.name == BlockDirective.delete);
        rs.splice(dat + 1, 0, {
            type: MenuItemType.divide
        },
            {
                type: MenuItemType.help,
                text: lst('了解如何使用书签'),
                url: window.shyConfig?.isUS ? "https://help.shy.live/page/269#gxcRqJXWfdDa1TUKzvp5yo" : "https://help.shy.live/page/269#gxcRqJXWfdDa1TUKzvp5yo"
            })
        return rs;
    }
    async onClickContextMenu(item: MenuItem<string | BlockDirective>, event: MouseEvent): Promise<void> {
        if (item.name == 'reload') {
            if (this.bookmarkUrl) await this.onLoadBookmarkByUrl(this.bookmarkUrl)
            else await this.openInputBookmark()
            return;
        }
        if (item.name == 'copyLink') {
            CopyAlert(this.bookmarkUrl, lst('已复制书签网址'))
            return;
        }
        if (item.name == 'open') {
            window.open(this.bookmarkUrl)
            return;
        }
        return await super.onClickContextMenu(item, event);
    }
    async getBoardEditCommand(): Promise<{ name: string; value?: any; }[]> {
        var cs: { name: string; value?: any; }[] = [];
        cs.push({ name: 'embed', value: { embedType: 'bookmark', url: this.bookmarkUrl } })
        return cs;
    }
    async setBoardEditCommand(name: string, value: any) {
        if (await super.setBoardEditCommand(name, value) == false) {
            if (name == 'embed') {
                setTimeout(() => {
                    this.onLoadBookmarkByUrl(value.url)
                }, 200);

                // var cr = ConvertEmbed(value.url);
                // var props = {
                //     embedType: cr.embedType,
                //     origin: cr.origin,
                //     src: {
                //         name: 'link',
                //         url: cr.url
                //     }
                // } as Record<string, any>;
                // if (this.isFreeBlock) {
                //     if (cr?.embedType == 'music.163') {
                //         props.fixedWidth = 300;
                //     }
                //     else {
                //         // props.fixedWidth = 350;
                //         // props.fixedHeight = 200;
                //     }
                // }
                // await this.updateProps(props, BlockRenderRange.self)
            }
        }
    }
    get fixedSize() {
        if (!this.el)
            return { width: this.fixedWidth, height: this.fixedHeight }
        var el = this.el;
        // this.el.querySelector('.sy-block-bookmark') as HTMLElement;
        return {
            width: Math.max(this.fixedWidth, 500),
            height: el.offsetHeight
        }
    }
}

@view('/bookmark')
export class BookmarkView extends BlockView<Bookmark> {
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
                    <Tip text={'重新生成书签'}><span onMouseDown={e => {
                        e.stopPropagation();
                        e.preventDefault();
                    }} className="flex-fixed size-24 flex-center cursor visible" onClick={e => {
                        e.stopPropagation();
                        e.preventDefault();
                        this.block.onLoadBookmarkByUrl(this.block.bookmarkUrl)
                    }}><Icon size={18} icon={RefreshSvg}></Icon></span></Tip>
                </a>
            }
            else {
                return <div className="item-hover-light-focus remark cursor item-hover round padding-h-3 padding-w-5 flex" onMouseDown={e => this.block.openInputBookmark()}>
                    <Icon size={16} icon={BookSvg}></Icon>
                    <span className="gap-l-3 f-14"><S>添加书签</S></span>
                </div>
            }
        }
    }
    renderView() {
        if (!this.block.bookmarkInfo) return <div style={this.block.visibleStyle}><div style={this.block.contentStyle}>
            {this.renderEmpty()}</div></div>
        var style = this.block.visibleStyle;
        if (this.block.isFreeBlock) {
            var fs = this.block.fixedSize;
            style.width = fs.width;
            style.padding = 20;
            // style.padding = 20 / this.block.matrix.getScaling().x;
            // style.height = fs.height;
        }
        return <div className={(this.block.isFreeBlock ? "round  border-box item-hover-light" : "")} style={style}><div
            className={'sy-block-bookmark relative  visible-hover '}
            style={this.block.contentStyle}
        >
            <a className='sy-block-bookmark-link' draggable={false} href={this.block.bookmarkUrl} target='_blank' >
                <div className="sy-block-bookmark-content" style={{ marginRight: this.block.imageWidth > 180 && this.block.imageWidth < 250 ? this.block.imageWidth : 0 }}>
                    {this.block.bookmarkInfo.title && <div className="sy-block-bookmark-title">{this.block.bookmarkInfo.title}</div>}
                    {this.block.bookmarkInfo.description && <div className="sy-block-bookmark-description">{this.block.bookmarkInfo.description}</div>}
                    <div className="sy-block-bookmark-iconurl"> {this.block.bookmarkInfo.icon?.url && <img src={this.block.bookmarkInfo.icon.url || this.block.bookmarkInfo.icon.origin} />}<span>{this.block.bookmarkUrl}</span></div>
                </div>
                {this.block.bookmarkInfo.image && this.block.imageWidth > 180 && this.block.imageWidth < 250 && <div style={{ width: this.block.imageWidth }} className='sy-block-bookmark-image'>
                    <img draggable={false} src={autoImageUrl(this.block.bookmarkInfo.image.url, 250)} />
                </div>}
            </a>
            {this.block.isCanEdit() && !this.block.isFreeBlock && <div onMouseDown={e => {
                e.preventDefault();
                e.stopPropagation();
                this.block.onContextmenu(e.nativeEvent)
            }} className="bg-dark cursor visible text-white pos-top-right gap-5 size-24 round flex-center ">
                <Icon size={18} icon={DotsSvg}></Icon>
            </div>}
        </div>
            {this.renderComment()}
        </div>
    }
}