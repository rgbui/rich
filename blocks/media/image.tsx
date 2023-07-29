import { BlockView } from "../../src/block/view";
import { prop, url, view } from "../../src/block/factory/observable";
import React, { CSSProperties } from 'react';
import { BlockDirective, BlockDisplay, BlockRenderRange } from "../../src/block/enum";
import { TextArea } from "../../src/block/view/appear";
import { Rect } from "../../src/common/vector/point";
import { ResourceArguments } from "../../extensions/icon/declare";
import { Block } from "../../src/block";
import { MouseDragger } from "../../src/common/dragger";
import { Icon } from "../../component/view/icon";
import { useImagePicker } from "../../extensions/image/picker";
import { getImageSize } from "../../component/file";
import { channel } from "../../net/channel";
import { autoImageUrl } from "../../net/element.type";
import { util } from "../../util/util";
import { DotsSvg, DownloadSvg, DuplicateSvg, ImageErrorSvg, LinkSvg, PicSvg, RefreshSvg, TrashSvg } from "../../component/svgs";
import { Spin } from "../../component/view/spin";
import { MenuItem, MenuItemType } from "../../component/view/menu/declare";
import { LangID } from "../../i18n/declare";
import { langProvider } from "../../i18n/provider";
import { MenuItemView } from "../../component/view/menu/item";

@url('/image')
export class Image extends Block {
    @prop()
    src: ResourceArguments;
    @prop()
    imageWidthPercent: number = 70;
    @prop()
    caption: string = '';
    @prop()
    allowCaption: boolean = false;
    @prop()
    originSize: { width: number, height: number } = null;
    @prop()
    align: 'left' | 'right' | 'center' = 'center';
    @prop()
    mask: 'rect' | 'circle' | 'radius' | 'rhombus' | 'pentagon' | "star" = 'rect';
    display = BlockDisplay.block;
    speed = '';
    async onOpenUploadImage(event: React.MouseEvent) {
        var r = await useImagePicker({ roundArea: Rect.fromEvent(event) });
        if (r) {
            await this.onSaveImageSize(r, false);
        }
    }
    get appearAnchors() {
        if (this.src?.name != 'none') return this.__appearAnchors;
        return [];
    }
    async onSaveImageSize(d: { url?: string }, merge: boolean) {
        var imgSize = await getImageSize(d?.url);
        var width = this.el.getBoundingClientRect().width;
        var per = Math.min(70, parseInt((imgSize.width * 100 / width).toString()));
        per = Math.max(30, per);
        this.speed = '';
        await this.onUpdateProps({
            imageWidthPercent: per,
            originSize: imgSize,
            src: { ...d }
        }, { range: BlockRenderRange.self, merge });
    }
    async didMounted() {
        try {
            if (this.createSource == 'InputBlockSelector') {
                var r = await useImagePicker({ roundArea: Rect.fromEle(this.el) });
                if (r) {
                    await this.onSaveImageSize(r, true);
                }
            }
            if (this.initialData && this.initialData.file) {
                this.speed = '0%';
                this.view.forceUpdate();
                var d = await channel.post('/ws/upload/file', {
                    file: this.initialData.file,
                    uploadProgress: (event) => {
                        if (event.lengthComputable) {
                            this.speed = `${util.byteToString(event.total)}${(100 * event.loaded / event.total).toFixed(2)}%`;
                            this.forceUpdate();
                        }
                    }
                });
                if (d.ok && d.data?.file?.url) {
                    await this.onSaveImageSize(d.data?.file, true);
                }
            }
            if (this.initialData && this.initialData.url) {
                var d = await channel.post('/ws/download/url', { url: this.initialData.url });
                if (d.ok && d.data?.file?.url) {
                    await this.onSaveImageSize(d.data?.file, true);
                }
            }
        }
        catch (ex) {
            console.error(ex);
        }
    }
    getVisibleContentBound() {
        var img = this.el.querySelector('.sy-block-image-content-view-wrapper img') as HTMLElement;
        if (img) {
            return Rect.fromEle(img);
        }
        return super.getVisibleContentBound();
    }
    addBlockSelect() {
        var el = this.el.querySelector('.sy-block-image-content-view-wrapper');
        if (el) {
            el.classList.add('shy-block-selected');
            return el as HTMLElement;
        }
        return this.el;
    }
    get contentEl() {
        var el = this.el.querySelector('.sy-block-image-content-view-wrapper') as HTMLElement;
        if (el) return el;
        return this.el;
    }
    async getMd() {
        return `![${this.caption || '图片'}](${this.src?.url})`;
    }
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
            text: '尺寸',
            icon: { name: 'bytedance-icon', code: 'full-screen' },
            childs: [
                {
                    name: 'resetSize',
                    text: '原图大小',
                    icon: { name: 'bytedance-icon', code: 'equal-ratio' },
                },
                {
                    name: 'autoSize',
                    text: '自适应',
                    icon: { name: 'bytedance-icon', code: 'auto-width-one' },
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
    async onClickContextMenu(item, event) {
        switch (item.name) {
            case 'replace':
                var r = await useImagePicker({ roundArea: this.getVisibleBound() });
                if (r) {
                    await this.onSaveImageSize(r, false);
                }
                return;
            case 'origin':
                window.open(this.src?.url)
                return;
            case 'download':
                util.downloadFile(this.src?.url, (this.src?.filename || this.caption) + (this.src.ext || '.jpg'))
                return;
            case 'align':
                await this.onUpdateProps({ align: item.value }, { range: BlockRenderRange.self })
                return;
            case 'mask':
                await this.onUpdateProps({ mask: item.value }, { range: BlockRenderRange.self })
                return;
            case 'resetSize':
                var imgSize = this.originSize || (await getImageSize(this.src?.url));
                var width = this.el.getBoundingClientRect().width;
                var per = Math.min(100, parseInt((imgSize.width * 100 / width).toString()));
                per = Math.max(5, per);
                await this.onUpdateProps({
                    imageWidthPercent: per,
                    originSize: imgSize,
                }, { range: BlockRenderRange.self });
                return;
            case 'autoSize':
                await this.onUpdateProps({
                    imageWidthPercent: 70
                },{ range: BlockRenderRange.self });
                break;
        }
        await super.onClickContextMenu(item, event);
    }
}
@view('/image')
export class ImageView extends BlockView<Image>{
    errorUrl: string;
    isLoadError: boolean = false;
    onError(e: React.SyntheticEvent<HTMLImageElement, Event>) {
        this.isLoadError = true;
        this.errorUrl = this.block.src?.url;
        this.forceUpdate();
    }
    onMousedown(event: React.MouseEvent, operator: 'left' | "right") {
        event.stopPropagation();
        var el = this.block.el;
        var bound = el.getBoundingClientRect();
        var self = this;
        MouseDragger<{ event: React.MouseEvent, realWidth: number }>({
            event,
            moveStart(ev, data) {
                data.realWidth = self.imageWrapper.getBoundingClientRect().width;
                data.event = ev as any;
            },
            moving: (ev, data, isEnd) => {
                var dx = ev.clientX - data.event.clientX;
                var width: number;
                if (operator == 'right') width = data.realWidth + dx * 2;
                else width = data.realWidth - dx * 2;
                width = Math.max(30, width);
                width = Math.min(bound.width, width);
                self.imageWrapper.style.width = width + "px";
                if (isEnd) {
                    var rw = width * 100 / bound.width;
                    rw = Math.ceil(rw);
                    self.block.onUpdateProps({ imageWidthPercent: rw });
                }
            }
        })
    }
    imageWrapper: HTMLDivElement;
    renderEmptyImage() {
        if (this.block.speed) {
            return <div className="sy-block-image-empty flex f-14">
                <Spin size={16}></Spin>
                <span>上传中:{this.block.speed}</span>
            </div>
        }
        return <div className='sy-block-image-empty' onMouseDown={e => this.block.onOpenUploadImage(e)}>
            <Icon size={24} icon={PicSvg}></Icon>
            <span>添加图片</span>
        </div>
    }
    renderImage() {
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
        return <>{this.isLoadError && <div className='sy-block-image-error flex r-gap-r-10 text-1'>
            <Icon icon={ImageErrorSvg}></Icon>
            <span className="f-14">图片{this.errorUrl}加载失败</span>
            <span className="f-14 link cursor" onMouseDown={e => this.block.onOpenUploadImage(e)}>重新添加图片</span>
        </div>}
            {!this.isLoadError && <div className='sy-block-image-content-view flex-center' style={style}>
                <div className='sy-block-image-content-view-wrapper visible-hover' ref={e => this.imageWrapper = e} style={{ width: this.block.imageWidthPercent ? this.block.imageWidthPercent + "%" : undefined }}>
                    {this.block.src.name != 'none' && <img style={imageMaskStyle} onError={e => this.onError(e)} src={autoImageUrl(this.block?.src?.url)} />}
                    {this.block.isCanEdit() && <>
                        <div className='sy-block-image-left-resize' onMouseDown={e => this.onMousedown(e, 'left')}></div>
                        <div className='sy-block-image-right-resize' onMouseDown={e => this.onMousedown(e, 'right')}></div>
                        <div onMouseDown={e => {
                            e.stopPropagation();
                            this.block.onContextmenu(e.nativeEvent)
                        }} className="bg-dark cursor visible text-white pos-top-right gap-10 size-24 round flex-center ">
                            <Icon size={18} icon={DotsSvg}></Icon>
                        </div>
                    </>}
                    {this.block.allowCaption && <div className='sy-block-image-caption'>
                        {<TextArea block={this.block} prop='content' placeholder={'键入图片描述'}></TextArea>}
                    </div>}
                </div>
            </div>}
        </>
    }
    render() {
        if (this.isViewError) return this.renderViewError();
        return <div className='sy-block-image' style={this.block.visibleStyle} >
            <div className='sy-block-image-content' >
                {!this.block?.src && this.block.isCanEdit() && this.renderEmptyImage()}
                {this.block?.src && this.renderImage()}
            </div>
        </div>
    }
}