
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
import { MenuItem, MenuItemType } from "../../component/view/menu/declare";
import { CopyAlert } from "../../component/copy";
import lodash from "lodash";

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
            await this.onUpdateProps({ embedType: cr.embedType, origin: cr.origin, src: { name: 'link', url: cr.url } }, { range: BlockRenderRange.self })
        }
    }
    async didMounted() {
        if (this.createSource == 'InputBlockSelector') {
            await this.addEmbed({ roundArea: Rect.fromEle(this.el) })
        }
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
        var at = rs.findIndex(g => g.name == 'color');
        rs.splice(at, 0, ...items)
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
}

@view('/embed')
export class EmbedView extends BlockView<Embed>{
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
                // style.height = 90;
                style.margin = '0px 10px';
            }
            else {
                // style.height = self.block.contentHeight;
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
            else if (self.block.embedType == 'amap') {
                return <>
                    <Icon size={16} className={'remark gap-r-10'} icon={{
                        name: 'image',
                        url: `data:image/png;base64,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`
                    }}></Icon>
                    <span><S>添加内嵌高德地图</S></span>
                </>
            }
            else {
                return <>
                    <Icon size={16} className={'remark gap-r-10'} icon={CompassSvg}></Icon>
                    <span><S text="添加内嵌网页">添加内嵌网页(网易云音乐、B站)</S></span>
                </>
            }
        }
        var contentStyle: CSSProperties = this.block.contentStyle;
        if (this.block.align == 'center') contentStyle.justifyContent = 'center';
        else if (this.block.align == 'right') contentStyle.justifyContent = 'flex-end';
        else contentStyle.justifyContent = 'flex-start';
        return <div className='sy-block-embed' style={this.block.visibleStyle}>
            {this.block.src.name == 'none' && <div onMouseDown={e => this.block.addEmbed({ roundArea: Rect.fromEle(e.currentTarget as HTMLElement) })} className='sy-block-file-nofile'>
                {renderEmptyTip()}
            </div>}
            {this.block.src.name != 'none' && <div className="flex w100" style={contentStyle}><div className='sy-block-embed-wrapper' ref={e => this.imageWrapper = e} style={{ height, width: this.block.contentWidthPercent ? this.block.contentWidthPercent + "%" : undefined }}>
                <div style={{ ...getIframeStyle(), pointerEvents: this.isResize ? "none" : 'auto' }}>
                    <iframe referrerPolicy="origin" src={this.block.src.url} ></iframe>
                </div>
                {this.block.isCanEdit() && <>
                    <div className='sy-block-embed-left-resize' onMouseDown={e => this.onMousedown(e, 'left')}></div>
                    <div className='sy-block-embed-right-resize' onMouseDown={e => this.onMousedown(e, 'right')}></div>
                    {isAllowResizeHeight && <div className="sy-block-embed-height-resize" onMouseDown={e => this.onMousedown(e, 'height')}></div>}
                </>}
            </div></div>}
        </div>
    }
}