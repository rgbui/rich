import { BlockView } from "../../src/block/view";
import { prop, url, view } from "../../src/block/factory/observable";
import React from 'react';
import { BlockAppear, BlockDisplay } from "../../src/block/enum";
import { SolidArea } from "../../src/block/partial/appear";
import { Rect } from "../../src/common/point";
import { ResourceArguments } from "../../extensions/icon/declare";
import { Block } from "../../src/block";
import ImageError from "../../src/assert/svg/imageError.svg";
import { LangID } from "../../i18n/declare";
import { Sp } from "../../i18n/view";
import { MouseDragger } from "../../src/common/dragger";

@url('/image')
export class Image extends Block {
    @prop()
    src: ResourceArguments;
    @prop()
    widthPercent: number = 100;
    appear = BlockAppear.solid;
    display = BlockDisplay.block;
    getVisibleContentBound() {
        var img = this.el.querySelector('.sy-block-image-content img');
        return Rect.from(img.getBoundingClientRect())
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
        var bound = el.getBoundingClientRect()
        var self = this;
        MouseDragger<{ event: React.MouseEvent, realWidth: number }>({
            event,
            moveStart(ev, data) {
                data.realWidth = self.img.getBoundingClientRect().width;
                data.event = ev as any;
            },
            move: (ev, data) => {
                var dx = ev.clientX - data.event.clientX;
                var width: number;
                if (operator == 'right') width = data.realWidth + dx * 2;
                else width = data.realWidth - dx * 2;
                width = Math.max(100, width);
                width = Math.min(bound.width, width);
                self.img.style.width = width + "%";
            },
            moveEnd: (ev, isMove, data) => {
                var dx = ev.clientX - data.event.clientX;
                var width: number;
                if (operator == 'right') width = data.realWidth + dx * 2;
                else width = data.realWidth - dx * 2;
                width = Math.max(100, width);
                width = Math.min(bound.width, width);
                self.img.style.width = width + "%";
                var rw = width * 100 / bound.width;
                rw = Math.ceil(rw);
                self.block.onUpdateProps({ widthPercent: rw });
            }
        })
    }
    img: HTMLImageElement;
    render() {
        return <div className='sy-block-image' style={this.block.visibleStyle} >
            <div className='sy-block-image-content' >
                {this.isLoadError && <div className='sy-block-image-error'>
                    <ImageError></ImageError>
                    <p className='sy-block-image-error-tip' ><Sp id={LangID.imageErrorLoadTip}></Sp></p>
                    <p className='sy-block-image-error-learn-more'><a><Sp id={LangID.learnMore}></Sp></a></p>
                    <p className='sy-block-image-error-url' >{this.errorUrl}</p>
                </div>}
                {!this.isLoadError && <div className='sy-block-image-content-view'>
                    <SolidArea content={
                        this.block.src && <img style={{ width: this.block.widthPercent + "%" }} ref={e => this.img = e} onError={e => this.onError(e)} src={this.block?.src?.url} />
                    }></SolidArea>
                    <div className='sy-block-image-left-resize' onMouseDown={e => this.onMousedown(e, 'left')}></div>
                    <div className='sy-block-image-right-resize' onMouseDown={e => this.onMousedown(e, 'right')}></div>
                </div>}
            </div>
        </div>
    }
}