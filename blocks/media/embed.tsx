
/**
 * 
 * 网易云音乐
 * 原网址：https://music.163.com/#/song?id=1928721936
 * 嵌入：<iframe referrerpolicy="origin" src="https://music.163.com/outchain/player?type=2&amp;id=1928721936&amp;auto=0&amp;height=66" frameborder="no" allowfullscreen="" sandbox="allow-top-navigation-by-user-activation allow-same-origin allow-forms allow-scripts allow-popups" class="" style="width: 100%; height: 100%; pointer-events: auto;"></iframe>
 * 
 * B站
 * 原网址：
 * https://www.bilibili.com/video/BV1xU4y1m7BK?spm_id_from=333.851.b_7265636f6d6d656e64.4
 * 嵌入：<iframe referrerpolicy="origin" src="//player.bilibili.com/player.html?bvid=BV1xU4y1m7BK&amp;page=1&amp;high_quality=1&amp;as_wide=1&amp;allowfullscreen=true" frameborder="no" allowfullscreen="" sandbox="allow-top-navigation-by-user-activation allow-same-origin allow-forms allow-scripts allow-popups" class="" style="width: 100%; height: 100%;"></iframe>
 * 
 * 
 * https://www.bilibili.com/video/BV1PK4y1X7YK/?p=1&vd_source=e8d247d285c5e9fd33441213dfe3af45
 * 
 */

import React, { CSSProperties } from "react";
import { CompassSvg, RefreshSvg } from "../../component/svgs";
import { Icon } from "../../component/view/icon";
import { ResourceArguments } from "../../extensions/icon/declare";
import { useOutSideUrlInput } from "../../extensions/link/outsite.input";
import { ConvertEmbed, EmbedType } from "../../extensions/link/url/embed.url";
import { Block } from "../../src/block";
import { prop, url, view } from "../../src/block/factory/observable";
import { BlockView } from "../../src/block/view";
import { MouseDragger } from "../../src/common/dragger";
import { Rect } from "../../src/common/vector/point";
import { BlockDirective, BlockRenderRange } from "../../src/block/enum";
import { lst } from "../../i18n/store";
import { S } from "../../i18n/view";
import { PopoverPosition } from "../../component/popover/position";
import "./style.less";
import B from "../../src/assert/img/bilibili.ico";
import M from "../../src/assert/img/163.music.ico";
import FB from "../../src/assert/img/figma.png";
import MG from "../../src/assert/img/mastergo.png";
import VQQ from "../../src/assert/img/vqq.ico";
import YK from "../../src/assert/img/youku.png";
import YB from "../../src/assert/img/youtube.png";

import { MenuItem, MenuItemType } from "../../component/view/menu/declare";
import { CopyAlert } from "../../component/copy";


@url('/embed')
export class Embed extends Block {
    @prop()
    src: ResourceArguments = { name: 'none', url: '' }
    @prop()
    contentWidthPercent: number = 100;
    @prop()
    contentHeight = 200;
    @prop()
    origin: string = '';
    @prop()
    embedType: EmbedType = '';
    @prop()
    align: 'left' | 'right' | 'center' = 'center';
    async addEmbed(pos: PopoverPosition) {
        var r = await useOutSideUrlInput(pos, { embedType: this.embedType, isEmbed: true });
        if (r?.url) {
            var cr = ConvertEmbed(r.url);
            var props = {
                embedType: cr.embedType,
                origin: cr.origin,
                src: {
                    name: 'link',
                    url: cr.url
                }
            } as Record<string, any>;
            if (this.isFreeBlock) {
                if (cr?.embedType == 'music.163') {
                    props.fixedWidth = 300;
                }
                else {
                    props.fixedWidth = 350;
                    props.fixedHeight = 200;
                }
            }
            await this.onUpdateProps(props, { range: BlockRenderRange.self })
        }
    }
    async didMounted() {
        await this.onBlockReloadData(async () => {
            if (this.createSource == 'InputBlockSelector' && !(this.src && this.src.url)) {
                await this.addEmbed({ roundArea: Rect.fromEle(this.el) })
            }
        });
    }
    getVisibleContentBound() {
        var img = this.el.querySelector('.sy-block-embed-wrapper iframe') as HTMLElement;
        if (img) {
            return Rect.fromEle(img);
        }
        else {
            var nofile = this.el.querySelector('.sy-block-file-nofile');
            if (nofile) return Rect.fromEle(nofile as HTMLElement);
        }
        return super.getVisibleContentBound();
    }
    async getMd() {
        return `[${this.src?.filename || lst('嵌入')}](${this.src?.url})`;
    }
    async onGetContextMenus() {
        var rs = await super.onGetContextMenus();
        if (rs.exists(c => c.name == 'text-center')) {
            var rat = rs.findIndex(g => g.name == 'text-center');
            rs.splice(rat, 2);
        }
        var items: MenuItem<string | BlockDirective>[] = [];
        items.push({
            name: 'origin',
            text: lst('打开嵌入网页'),
            icon: { name: 'bytedance-icon', code: 'arrow-right-up' },
            disabled: this.src?.url ? false : true
        });
        items.push({
            name: 'copyFileUrl',
            text: lst('复制嵌入网页网址'),
            icon: { name: 'byte', code: 'copy-link' },
            disabled: this.src?.url ? false : true
        });
        items.push({
            name: 'replace',
            text: this.src?.url ? lst('更换嵌入网页') : lst('添加嵌入网页'),
            icon: RefreshSvg
        });
        items.push({ type: MenuItemType.divide })
        items.push({
            text: lst('对齐'),
            icon: { name: 'bytedance-icon', code: 'align-text-both' },
            childs: [
                {
                    name: 'align',
                    icon: { name: 'bytedance-icon', code: 'align-text-left' },
                    text: lst('居左'),
                    value: 'left',
                    checkLabel: this.align == 'left'
                },
                {
                    name: 'align',
                    icon: { name: 'bytedance-icon', code: 'align-text-center' },
                    text: lst('居中'), value: 'center', checkLabel: this.align == 'center'
                },
                {
                    name: 'align',
                    icon: {
                        name: 'bytedance-icon',
                        code: 'align-text-right'
                    },
                    text: lst('居右'),
                    value: 'right',
                    checkLabel: this.align == 'right'
                }
            ]
        });

        items.push({ type: MenuItemType.divide })
        var at = rs.findIndex(g => g.name == BlockDirective.comment);
        rs.splice(at - 1, 0, ...items)
        var dat = rs.findIndex(g => g.name == BlockDirective.delete);
        rs.splice(dat + 1, 0,
            { type: MenuItemType.divide },
            {
                type: MenuItemType.help,
                text: lst('了解如何使用嵌入网页'),
                url: window.shyConfig.isUS ? "https://help.shy.live/page/270#qwNuJC5aEquidQgYi5qg2u" : "https://help.shy.live/page/270#qwNuJC5aEquidQgYi5qg2u"
            }
        )
        var cat = rs.findIndex(g => g.name == 'color');
        rs.splice(cat, 2);
        return rs;
    }
    async onClickContextMenu(item, event) {
        switch (item.name) {
            case 'replace':
                this.addEmbed({ roundArea: this.getVisibleBound() })
                return;
            case 'origin':
                window.open(this.src?.url)
                return;
            case 'copyFileUrl':
                CopyAlert(this.src?.url, lst('已复制嵌入网页网址'))
                return;
            case 'align':
                await this.onUpdateProps({ align: item.value }, { range: BlockRenderRange.self })
                return;
        }
        await super.onClickContextMenu(item, event);
    }
    get fixedSize() {
        if (this.src.name == 'none') {
            return {
                width: 250,
                height: 40
            }
        }
        if (this.embedType == 'music.163') {
            return {
                width: this.fixedWidth,
                height: 90
            }
        }
        return {
            width: this.fixedWidth,
            height: this.fixedHeight
        }
    }
}

@view('/embed')
export class EmbedView extends BlockView<Embed> {
    isResize: boolean = false;
    onMousedown(event: React.MouseEvent, operator: 'left' | "right" | 'height') {
        event.stopPropagation();
        var el = this.block.el;
        var bound = el.getBoundingClientRect();
        var self = this;
        MouseDragger<{ event: React.MouseEvent, realWidth: number, realHeight: number }>({
            event,
            moveStart(ev, data) {
                data.realWidth = self.imageWrapper.getBoundingClientRect().width;
                data.realHeight = self.imageWrapper.getBoundingClientRect().height;
                data.event = ev as any;
                self.isResize = true;
                self.forceUpdate();
            },
            moving: (ev, data, isEnd) => {
                if (operator == 'height') {
                    var dy = ev.clientY - data.event.clientY;
                    var height = data.realHeight + dy;
                    height = Math.max(40, height);
                    self.imageWrapper.style.height = height + "px";
                    if (isEnd) {
                        self.block.onUpdateProps({ contentHeight: height });
                        self.isResize = false;
                        self.forceUpdate();
                    }
                }
                else {
                    var dx = ev.clientX - data.event.clientX;
                    var width: number;
                    if (operator == 'right') width = data.realWidth + dx * 2;
                    else width = data.realWidth - dx * 2;
                    width = Math.max(100, width);
                    width = Math.min(bound.width, width);
                    self.imageWrapper.style.width = width + "px";
                    if (isEnd) {
                        var rw = width * 100 / bound.width;
                        rw = Math.ceil(rw);
                        self.block.onUpdateProps({ contentWidthPercent: rw });
                        self.isResize = false;
                        self.forceUpdate();
                    }
                }
            }
        })
    }
    imageWrapper: HTMLDivElement;
    renderView() {
        var self = this;
        var isAllowResizeHeight = self.block.embedType == 'music.163' ? false : true;
        var height = self.block.embedType == 'music.163' ? 90 : self.block.contentHeight;
        function getIframeStyle() {
            var style: CSSProperties = { height: 'inherit' };
            if (self.block.embedType == 'music.163') {

                if (self.block.isFreeBlock) style.margin = '0px'
                else style.margin = '0px 10px';
                if (self.block.isFreeBlock)
                    style.padding = '10px';
            }
            else {
                if (self.block.isFreeBlock)
                    style.padding = '10px';
            }
            return style;
        }
        function renderEmptyTip() {
            if (self.block.embedType == 'music.163') {
                return <>
                    <Icon size={16} className={'remark gap-r-10'} icon={{ name: 'image', url: M }}></Icon>
                    <span><S>添加内嵌网易云音乐</S></span>
                </>
            }
            else if (self.block.embedType == 'bilibili') {
                return <>
                    <Icon size={16} className={'remark gap-r-10'} icon={{ name: 'image', url: B }}></Icon>
                    <span><S>添加内嵌B站</S></span>
                </>
            }
            else if (self.block.embedType == 'figma') {
                return <>
                    <Icon size={16} className={'remark gap-r-10'} icon={{ name: 'image', url: FB }}></Icon>
                    <span><S>添加内嵌Figma</S></span>
                </>
            }
            else if (self.block.embedType == 'mastergo') {
                return <>
                    <Icon size={16} className={'remark gap-r-10'} icon={{ name: 'image', url: MG }}></Icon>
                    <span><S>添加内嵌MasterGo</S></span>
                </>
            }
            else if (self.block.embedType == 'vqq') {
                return <>
                    <Icon size={16} className={'remark gap-r-10'} icon={{ name: 'image', url: VQQ }}></Icon>
                    <span><S>添加内嵌腾讯视频</S></span>
                </>
            }
            else if (self.block.embedType == 'youku') {
                return <>
                    <Icon size={16} className={'remark gap-r-10'} icon={{ name: 'image', url: YK }}></Icon>
                    <span><S>添加内嵌优酷视频</S></span>
                </>
            }
            else if (self.block.embedType == 'ytob') {
                return <>
                    <Icon size={16} className={'remark gap-r-10'} icon={{ name: 'image', url: YB }}></Icon>
                    <span><S>添加内嵌YouTube视频</S></span>
                </>
            }
            else {
                return <>
                    <Icon size={16} className={'remark gap-r-10'} icon={CompassSvg}></Icon>
                    <span><S text="添加内嵌网页">添加内嵌网页</S></span>
                </>
            }
        }
        var contentStyle: CSSProperties = this.block.contentStyle;
        if (this.block.align == 'center') contentStyle.justifyContent = 'center';
        else if (this.block.align == 'right') contentStyle.justifyContent = 'flex-end';
        else contentStyle.justifyContent = 'flex-start';
        var style = this.block.visibleStyle;
        var width = this.block.contentWidthPercent ? this.block.contentWidthPercent + "%" : undefined
        if (this.block.isFreeBlock) {
            style.width = this.block.fixedSize.width;
            style.height = this.block.fixedSize.height;
            height = this.block.fixedSize.height;
            width = this.block.fixedSize.width + 'px';
        }

        return <div className='sy-block-embed' style={style}>
            {this.block.src.name == 'none' && <div
                onMouseDown={e => this.block.addEmbed({ roundArea: Rect.fromEle(e.currentTarget as HTMLElement) })}
                className={'sy-block-file-nofile ' + (this.block.isFreeBlock ? " w100 h100 border-box" : "")}>
                {renderEmptyTip()}
            </div>}
            {this.block.src.name != 'none' && <div className="flex w100" style={contentStyle}><div className='sy-block-embed-wrapper' ref={e => this.imageWrapper = e}
                style={{
                    height,
                    width: width
                }}>
                <div className={this.block.isFreeBlock ? " border-box round border-light" : ""} style={{ ...getIframeStyle(), pointerEvents: this.isResize ? "none" : 'auto' }}>
                    <iframe draggable={false}
                        referrerPolicy="origin"
                        src={this.block.src.url} ></iframe>
                </div>
                {this.block.isCanEdit() && !this.block.isFreeBlock && <>
                    <div className='sy-block-embed-left-resize' onMouseDown={e => this.onMousedown(e, 'left')}></div>
                    <div className='sy-block-embed-right-resize' onMouseDown={e => this.onMousedown(e, 'right')}></div>
                    {isAllowResizeHeight && <div className="sy-block-embed-height-resize" onMouseDown={e => this.onMousedown(e, 'height')}></div>}
                </>}
            </div></div>}
            {this.renderComment()}
        </div>
    }
}