
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
import { CompassSvg } from "../../component/svgs";
import { Icon } from "../../component/view/icon";
import { ResourceArguments } from "../../extensions/icon/declare";
import { useOutSideUrlInput } from "../../extensions/link/outsite.input";
import { ConvertEmbed } from "../../extensions/link/url/embed.url";
import { Block } from "../../src/block";
import { prop, url, view } from "../../src/block/factory/observable";
import { BlockView } from "../../src/block/view";
import { MouseDragger } from "../../src/common/dragger";
import { Rect } from "../../src/common/vector/point";
import { BlockRenderRange } from "../../src/block/enum";
import { lst } from "../../i18n/store";
import { S } from "../../i18n/view";

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
    embedType: string = '';
    async addEmbed(event: MouseEvent) {
        var r = await useOutSideUrlInput({ roundArea: Rect.fromEle(event.currentTarget as HTMLElement) });
        if (r?.url) {
            var cr = ConvertEmbed(r.url);
            this.onUpdateProps({ embedType: cr.embedType, origin: cr.origin, src: { name: 'link', url: cr.url } }, { range: BlockRenderRange.self })
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
    renderView()  {
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
        return <div className='sy-block-embed' style={this.block.visibleStyle}>
            {this.block.src.name == 'none' && <div onMouseDown={e => this.block.addEmbed(e.nativeEvent)} className='sy-block-file-nofile'>
                <Icon icon={CompassSvg}></Icon>
                <span><S>添加内嵌网页(网易云音乐、B站)</S></span>
            </div>}
            {this.block.src.name != 'none' && <div className='sy-block-embed-wrapper' ref={e => this.imageWrapper = e} style={{ height, width: this.block.contentWidthPercent ? this.block.contentWidthPercent + "%" : undefined }}>
                <div style={{ ...getIframeStyle(), pointerEvents: this.isResize ? "none" : 'auto' }}>
                    <iframe referrerPolicy="origin" src={this.block.src.url} ></iframe>
                </div>
                {this.block.isCanEdit() && <>
                    <div className='sy-block-embed-left-resize' onMouseDown={e => this.onMousedown(e, 'left')}></div>
                    <div className='sy-block-embed-right-resize' onMouseDown={e => this.onMousedown(e, 'right')}></div>
                    {isAllowResizeHeight && <div className="sy-block-embed-height-resize" onMouseDown={e => this.onMousedown(e, 'height')}></div>}
                </>}
            </div>}
        </div>
    }
}