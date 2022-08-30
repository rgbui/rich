import { BlockView } from "../../src/block/view";
import { prop, url, view } from "../../src/block/factory/observable";
import React from 'react';
import { BlockDisplay, BlockRenderRange } from "../../src/block/enum";
import { TextArea } from "../../src/block/view/appear";
import { Rect } from "../../src/common/vector/point";
import { ResourceArguments } from "../../extensions/icon/declare";
import { Block } from "../../src/block";
import ImageError from "../../src/assert/svg/imageError.svg";
import { LangID } from "../../i18n/declare";
import { Sp } from "../../i18n/view";
import { MouseDragger } from "../../src/common/dragger";

import Picture from "../../src/assert/svg/picture.svg";
import { Icon } from "../../component/view/icon";
import { useImagePicker } from "../../extensions/image/picker";
import { getImageSize } from "../../component/file";
import { channel } from "../../net/channel";
import { autoImageUrl } from "../../net/element.type";
import { util } from "../../util/util";

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
    display = BlockDisplay.block;
    speed = '';
    async onOpenUploadImage(event: React.MouseEvent) {
        var r = await useImagePicker({ roundArea: Rect.fromEvent(event) });
        if (r) {
            await this.onUpdateProps({ src: r }, { range: BlockRenderRange.self, merge: true });
        }
    }
    get appearAnchors() {
        if (this.src?.name != 'none') return this.__appearAnchors;
        return [];
    }
    async didMounted() {
        try {
            if (this.createSource == 'InputBlockSelector') {
                var r = await useImagePicker({ roundArea: Rect.fromEle(this.el) });
                if (r) {
                    await this.onUpdateProps({ src: r }, { range: BlockRenderRange.self, merge: true });
                }
            }
            if (this.initialData && this.initialData.file) {
                var d = await channel.post('/ws/upload/file', {
                    file: this.initialData.file, uploadProgress: (event) => {
                        if (event.lengthComputable) {
                            this.speed = `${util.byteToString(event.total)}${(100 * event.loaded / event.total).toFixed(2)}%`;
                            this.forceUpdate();
                        }
                    }
                });
                if (d.ok && d.data?.file?.url) {
                    var imgSize = await getImageSize(d.data?.file?.url);
                    var width = this.el.getBoundingClientRect().width;
                    var per = Math.min(100, parseInt((imgSize.width * 100 / width).toString()));
                    await this.onUpdateProps({
                        imageWidthPercent: per,
                        src: { ...d.data?.file }
                    }, { range: BlockRenderRange.self, merge: true });
                }
            }
            if (this.initialData && this.initialData.url) {
                var d = await channel.post('/ws/download/url', { url: this.initialData.url });
                if (d.ok && d.data?.file?.url) {
                    var imgSize = await getImageSize(d.data?.file?.url);
                    var width = this.el.getBoundingClientRect().width;
                    var per = Math.min(100, parseInt((imgSize.width * 100 / width).toString()));
                    await this.onUpdateProps({ imageWidthPercent: per, src: { ...d.data?.file, source: this.initialData.url } }, { range: BlockRenderRange.self, merge: true });
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
                width = Math.max(100, width);
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
        return <div className='sy-block-image-empty' onMouseDown={e => this.block.onOpenUploadImage(e)}>
            <Icon icon={Picture} size={24}></Icon>
            <Sp id={LangID.AddImageTip}></Sp>
        </div>
    }
    renderImage() {
        return <>{this.isLoadError && <div className='sy-block-image-error'>
            <ImageError></ImageError>
            <p className='sy-block-image-error-tip' ><Sp id={LangID.imageErrorLoadTip}></Sp></p>
            <p className='sy-block-image-error-learn-more'><a><Sp id={LangID.learnMore}></Sp></a></p>
            <p className='sy-block-image-error-url' >{this.errorUrl}</p>
        </div>}
            {!this.isLoadError && <div className='sy-block-image-content-view'>
                <div className='sy-block-image-content-view-wrapper' ref={e => this.imageWrapper = e} style={{ width: this.block.imageWidthPercent ? this.block.imageWidthPercent + "%" : undefined }}>
                    {this.block.src.name != 'none' && <img onError={e => this.onError(e)} src={autoImageUrl(this.block?.src?.url)} />}
                    {this.block.isCanEdit() && <><div className='sy-block-image-left-resize' onMouseDown={e => this.onMousedown(e, 'left')}></div>
                        <div className='sy-block-image-right-resize' onMouseDown={e => this.onMousedown(e, 'right')}></div></>}
                    {this.block.allowCaption && <div className='sy-block-image-caption'>
                        {<TextArea block={this.block} prop='content' placeholder={'键入图片描述'}></TextArea>}
                    </div>}
                </div>
            </div>}
        </>
    }
    render() {
        if (this.isViewError) return this.renderViewError();
        return <div className='sy-block-image' style={this.block.boxStyle} >
            <div className='sy-block-image-content' >
                {!this.block?.src && this.block.isCanEdit() && this.renderEmptyImage()}
                {this.block?.src && this.renderImage()}
            </div>

        </div>
    }
}