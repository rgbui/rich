import { BlockView } from "../../src/block/view";
import { prop, url, view } from "../../src/block/factory/observable";
import React from 'react';
import { BlockDisplay } from "../../src/block/enum";
import { SolidArea } from "../../src/block/partial/appear";
import { Rect } from "../../src/common/point";
import { ResourceArguments } from "../../extensions/icon/declare";
import { Block } from "../../src/block";
import ImageError from "../../src/assert/svg/imageError.svg";
import { LangID } from "../../i18n/declare";
import { Sp } from "../../i18n/view";
import { MouseDragger } from "../../src/common/dragger";

import Picture from "../../src/assert/svg/picture.svg";
import { Icon } from "../../component/view/icon";
import { useImagePicker } from "../../extensions/image/picker";

@url('/image')
export class Image extends Block {
    @prop()
    src: ResourceArguments;
    @prop()
    imageWidthPercent: number = 100;
    display = BlockDisplay.block;
    async onOpenUploadImage(event: React.MouseEvent) {
        event.stopPropagation();
        var r = await useImagePicker({ roundArea: Rect.fromEvent(event) });
        if (r) {
            await this.onUpdateProps({ src: r });
        }
    }

    get appearElements() {
        if (this.src.name == 'none') return [];
        return this.__appearElements;
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
                    {this.block.src.name != 'none' && <SolidArea ref={e => this.block.elementAppear({ el: e })} ><img onError={e => this.onError(e)} src={this.block?.src?.url} /></SolidArea>}
                    <div className='sy-block-image-left-resize' onMouseDown={e => this.onMousedown(e, 'left')}></div>
                    <div className='sy-block-image-right-resize' onMouseDown={e => this.onMousedown(e, 'right')}></div>
                </div>
            </div>}
        </>
    }
    render() {
        return <div className='sy-block-image' style={this.block.visibleStyle} >
            <div className='sy-block-image-content' >
                {!this.block.src && this.renderEmptyImage()}
                {this.block.src && this.renderImage()}
            </div>
        </div>
    }
}