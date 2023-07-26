import React, { CSSProperties } from "react";
import { ResourceArguments } from "../../../extensions/icon/declare";
import { BlockDirective, BlockDisplay, BlockRenderRange } from "../../../src/block/enum";
import { prop, url, view } from "../../../src/block/factory/observable";
import { BlockView } from "../../../src/block/view";
import { Rect } from "../../../src/common/vector/point";
import { useVideoPicker } from "../../../extensions/file/video.picker";
import { Block } from "../../../src/block";
import { channel } from "../../../net/channel";
import { Icon } from "../../../component/view/icon";
import { DotsSvg, DownloadSvg, DuplicateSvg, LinkSvg, RefreshSvg, TrashSvg, VideoSvg } from "../../../component/svgs";
import { MouseDragger } from "../../../src/common/dragger";
import { util } from "../../../util/util";

import Player from 'xgplayer';
import 'xgplayer/dist/index.min.css';
import { I18N } from 'xgplayer'
import ZH from 'xgplayer/es/lang/zh-cn'
import { getVideoSize } from "../../../component/file";
import { MenuItem, MenuItemType } from "../../../component/view/menu/declare";
import { MenuItemView } from "../../../component/view/menu/item";
import { LangID } from "../../../i18n/declare";
import { langProvider } from "../../../i18n/provider";
// 启用中文
I18N.use(ZH)
/**
 * 
 * https://h5player.bytedance.com/

 * 
 * 分辨率比例通过 aspect 设置，目前有 3：4 和 9：16 两种，
 * 根据当前推流与播放画面在手机上的显示区域比例来设置。
 * 手机竖屏状态一般都是 9：16 比例
 * ，如果一个人推流满屏，
 * 则设置 9：16 ；如果双人并排展示，一个推流一个播放，显示区域为 3：4 比例，则设置 3：4。
 * 
 */
@url('/video')
export class Video extends Block {
    @prop()
    src: ResourceArguments = { name: 'none' }
    @prop()
    contentWidthPercent: number = 100;
    @prop()
    originSize: { width: number, height: number, duration: number } = null;
    @prop()
    autoplayMuted: boolean = false;
    display = BlockDisplay.block;
    speed = '';
    async addVideo(event: React.MouseEvent) {
        if (this.speed) return;
        var target = event.target as HTMLElement;
        var bound = Rect.from(target.getBoundingClientRect());
        var r = await useVideoPicker({ roundArea: bound });
        if (r) {
            await this.onSaveSize(r, false);
        }
    }
    async didMounted() {
        try {
            if (this.createSource == 'InputBlockSelector') {
                var r = await useVideoPicker({ roundArea: Rect.fromEle(this.el) });
                if (r) {
                    await this.onSaveSize(r, true);
                    return;
                }
            }
            if (this.initialData && this.initialData.file) {
                var d = await channel.post('/ws/upload/file', {
                    file: this.initialData.file,
                    uploadProgress: (event) => {
                        if (event.lengthComputable) {
                            this.speed = `${util.byteToString(event.total)}${(100 * event.loaded / event.total).toFixed(2)}%`;
                            this.forceUpdate();
                        }
                    }
                });
                this.speed = '';
                if (d.ok && d.data?.file?.url) {
                    await this.onSaveSize(d.data.file, true);
                    return;
                }
            }
            if (this.initialData && this.initialData.url) {
                var d = await channel.post('/ws/download/url', { url: this.initialData.url });
                if (d.ok && d.data?.file?.url) {
                    await this.onSaveSize(d.data.file, true);
                    return;
                }
            }
            await (this.view as any).loadPlayer();
        }
        catch (ex) {
            console.error(ex);
        }
    }
    player;
    getVisibleContentBound() {
        var img = this.el.querySelector('.sy-block-video-wrapper video') as HTMLElement;
        if (img) {
            return Rect.fromEle(img);
        }
        return super.getVisibleContentBound();
    }
    async getMd() {
        return `[${this.src?.filename || '视频'}](${this.src?.url})`;
    }
    async getVideoSize() {
        if (this.originSize) return this.originSize;
        if (this.src?.url)
            this.originSize = await getVideoSize(this.src?.url);
        return this.originSize;
    }
    async onSaveSize(d: { url?: string }, merge: boolean) {
        var imgSize = await getVideoSize(d?.url);
        var width = this.el.getBoundingClientRect().width;
        var per = Math.min(70, parseInt((imgSize.width * 100 / width).toString()));
        per = Math.max(30, per);
        this.speed = '';
        await this.onUpdateProps({
            imageWidthPercent: per,
            originSize: imgSize,
            src: { ...d }
        }, { range: BlockRenderRange.self, merge });
        await (this.view as any).loadPlayer();
    }
    @prop()
    align: 'left' | 'right' | 'center' = 'center';
    @prop()
    mask: 'rect' | 'circle' | 'radius' | 'rhombus' | 'pentagon' | "star" = 'rect';
    async onGetContextMenus() {
        if (this.isFreeBlock) {
            return await this.onGetBoardContextMenus()
        }
        var rc = (item: MenuItem<string>, view?: MenuItemView) => {
            return <span className="flex-inline flex-center size-20"><span style={{ border: '1px solid var(--text-color)' }} className="round w-10 h-12 inline-block"></span></span>
        }
        var items: MenuItem<BlockDirective | string>[] = [];
        items.push({
            name: BlockDirective.copy,
            text: '拷贝副本',
            label: "Ctrl+D",
            icon: DuplicateSvg
        });
        items.push({
            type: MenuItemType.divide
        });
        items.push({
            name: BlockDirective.link,
            text: langProvider.getText(LangID.menuCopyLink),
            icon: LinkSvg
        });
        items.push({
            type: MenuItemType.divide
        });
        items.push({
            name: 'replace',
            text: '替换',
            icon: RefreshSvg
        });
        items.push({
            name: 'origin',
            text: '原图',
            icon: { name: 'bytedance-icon', code: 'arrow-right-up' }
        });
        items.push({
            name: 'download',
            text: '下载',
            icon: DownloadSvg
        });
        items.push({
            type: MenuItemType.divide
        });
        items.push({
            name: 'autoplayMuted',
            text: '自动播放',
            type: MenuItemType.switch,
            icon: { name: 'bytedance-icon', code: 'play' },
            checked: this.autoplayMuted
        });
        items.push({
            text: '对齐',
            icon: { name: 'bytedance-icon', code: 'align-text-both' },
            childs: [
                {
                    name: 'align',
                    icon: { name: 'bytedance-icon', code: 'align-text-left' },
                    text: '居左',
                    value: 'left',
                    checkLabel: this.align == 'left'
                },
                {
                    name: 'align',
                    icon: { name: 'bytedance-icon', code: 'align-text-center' },
                    text: '居中', value: 'center', checkLabel: this.align == 'center'
                },
                {
                    name: 'align',
                    icon: {
                        name: 'bytedance-icon',
                        code: 'align-text-right'
                    },
                    text: '居右',
                    value: 'right',
                    checkLabel: this.align == 'right'
                }
            ]
        });
        items.push({
            text: '蒙板',
            icon: { name: 'bytedance-icon', code: 'mask-two' },
            childs: [
                {
                    name: 'mask',
                    icon: {
                        name: 'bytedance-icon',
                        code: 'rectangle'
                    },
                    text: '无',
                    value: 'rect',
                    checkLabel: this.mask == 'rect'
                },
                {
                    name: 'mask',
                    renderIcon: rc,
                    text: '圆角',
                    value: 'radius',
                    checkLabel: this.mask == 'radius'
                },
                {
                    name: 'mask',
                    icon: {
                        name: 'bytedance-icon',
                        code: 'oval-one'
                    },
                    text: '圆',
                    value: 'circle',
                    checkLabel: this.mask == 'circle'
                },
                {
                    name: 'mask',
                    icon: { name: 'bytedance-icon', code: 'diamond-three' },
                    text: '菱形',
                    value: 'rhombus',
                    checkLabel: this.mask == 'rhombus'
                },
                {
                    name: 'mask',
                    icon: { name: 'bytedance-icon', code: 'pentagon-one' },
                    text: '五边形',
                    value: 'pentagon',
                    checkLabel: this.mask == 'pentagon'
                },
                {
                    name: 'mask',
                    icon: { name: 'bytedance-icon', code: 'star' },
                    text: '星形',
                    value: 'star',
                    checkLabel: this.mask == 'star'
                }
            ]
        });
        items.push({
            type: MenuItemType.divide
        });
        items.push({
            name: BlockDirective.delete,
            icon: TrashSvg,
            text: langProvider.getText(LangID.menuDelete),
            label: "Del"
        });
        return items;
    }
    async onContextMenuInput(this: Block, item: MenuItem<BlockDirective | string>) {
        if (item?.name == 'autoplayMuted') {
            this.onUpdateProps({ autoplayMuted: item.checked }, { range: BlockRenderRange.self });
        }
    }
    async onClickContextMenu(item, event) {
        switch (item.name) {
            case 'replace':
                var r = await useVideoPicker({ roundArea: this.getVisibleBound() });
                if (r) {
                    await this.onSaveSize(r, false);
                }
                return;
            case 'origin':
                window.open(this.src?.url)
                return;
            case 'download':
                util.downloadFile(this.src?.url, (this.src?.filename) + (this.src.ext || '.mp4'))
                return;
            case 'align':
                await this.onUpdateProps({ align: item.value }, { range: BlockRenderRange.self })
                return;
            case 'mask':
                await this.onUpdateProps({ mask: item.value }, { range: BlockRenderRange.self })
                return;
            case 'autoplayMuted':
                await this.onUpdateProps({ autoplayMuted: this.autoplayMuted ? false : true }, { range: BlockRenderRange.self })
                return;
        }
        await super.onClickContextMenu(item, event);
    }
}
@view('/video')
export class VideoView extends BlockView<Video>{
    async loadPlayer() {
        if (this.player) return;
        if (!this.videoPanel) {
            await util.delay(50);
        }
        if (!this.videoPanel) {
            await util.delay(50);
        }
        if (this.videoPanel) {
            var size = await this.block.getVideoSize()
            var width = this.contentWrapper.getBoundingClientRect().width;
            var height = width * size.height / size.width;
            this.contentWrapper.style.height = `${height}px`;
            this.player = new Player({
                el: this.videoPanel,
                url: this.block.src?.url,
                height: '100%',
                width: '100%',
                autoplayMuted: this.block.autoplayMuted,
                autoplay: this.block.autoplayMuted,
            });
        }
    }
    player: Player
    videoPanel: HTMLElement;
    async onMousedown(event: React.MouseEvent, operator: 'left' | "right") {
        var el = this.block.el;
        var bound = el.getBoundingClientRect();
        var self = this;
        var size = await this.block.getVideoSize()
        MouseDragger<{ event: React.MouseEvent, realWidth: number }>({
            event,
            moveStart(ev, data) {
                data.realWidth = self.contentWrapper.getBoundingClientRect().width;
                data.event = ev as any;
            },
            moving: (ev, data, isEnd) => {
                var dx = ev.clientX - data.event.clientX;
                var width: number;
                if (operator == 'right') width = data.realWidth + dx * 2;
                else width = data.realWidth - dx * 2;
                width = Math.max(100, width);
                width = Math.min(bound.width, width);
                self.contentWrapper.style.width = width + "px";
                self.contentWrapper.style.height = (width * size.height / size.width) + "px";
                if (isEnd) {
                    var rw = width * 100 / bound.width;
                    rw = Math.ceil(rw);
                    self.block.onUpdateProps({ contentWidthPercent: rw });
                }
            }
        })
    }
    contentWrapper: HTMLDivElement;
    render() {
        var style: CSSProperties = {
            justifyContent: 'center'
        }
        if (this.block.align == 'left') style.justifyContent = 'flex-start'
        else if (this.block.align == 'right') style.justifyContent = 'flex-end'
        var imageMaskStyle: CSSProperties = {}
        if (this.block.mask == 'radius') imageMaskStyle.borderRadius = '10%';
        else if (this.block.mask == 'circle') imageMaskStyle.borderRadius = '50%';
        else if (this.block.mask == 'rhombus') {
            imageMaskStyle.clipPath = 'polygon(50% 0, 100% 50%, 50% 100%, 0 50%)';
        }
        else if (this.block.mask == 'pentagon') imageMaskStyle.clipPath = 'polygon(50% 0%, 100% 38%, 82% 100%, 18% 100%, 0% 38%)'
        else if (this.block.mask == 'star') imageMaskStyle.clipPath = `polygon(
            50% 0%,
            64.43% 25%,
            93.3% 25%,
            78.87% 50%,
            93.3% 75%,
            64.43% 75%,
            50% 100%,
            35.57% 75%,
            6.7% 75%,
            21.13% 50%,
            6.7% 25%,
            35.57% 25%)`
        else if (this.block.mask == 'rect') imageMaskStyle.borderRadius = '0%';
        return <div className='sy-block-video' style={this.block.visibleStyle}>
            {!this.block.src?.url && this.block.isCanEdit() && <div onMouseDown={e => this.block.addVideo(e)} className='sy-block-video-nofile flex'>
                <Icon icon={VideoSvg} size={24}></Icon>
                {!this.block.speed && <span className="gap-w-10">添加视频</span>}
                {this.block.speed && <span>{this.block.speed}</span>}
            </div>}
            {this.block.src?.url && <div className='sy-block-video-content flex-center' style={style}>
                <div
                    className="sy-block-video-wrapper  visible-hover"
                    ref={e => this.contentWrapper = e}
                    style={{ width: this.block.contentWidthPercent ? this.block.contentWidthPercent + "%" : undefined }}>
                    <div style={imageMaskStyle} ref={e => this.videoPanel = e}></div>
                    {this.block.isCanEdit() && <>
                        <div className='sy-block-video-left-resize' onMouseDown={e => {
                            e.stopPropagation();
                            this.onMousedown(e, 'left');
                        }}>
                        </div>
                        <div className='sy-block-video-right-resize' onMouseDown={e => {
                            e.stopPropagation();
                            this.onMousedown(e, 'right');
                        }}>
                        </div>
                        <div onMouseDown={e => {
                            e.stopPropagation();
                            this.block.onContextmenu(e.nativeEvent)
                        }} className="bg-dark cursor visible text-white pos-top-right gap-10 size-24 round flex-center ">
                            <Icon size={18} icon={DotsSvg}></Icon>
                        </div>
                    </>}
                </div>
            </div>}
        </div>
    }
}

