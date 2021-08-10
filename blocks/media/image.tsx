import { BlockView } from "../../src/block/view";
import { prop, url, view } from "../../src/block/factory/observable";
import React from 'react';
import { BlockAppear } from "../../src/block/enum";
import { SolidArea } from "../../src/block/partial/appear";
import { Rect } from "../../src/common/point";
import { ResourceArguments } from "../../extensions/icon/declare";
import { Block } from "../../src/block";
import ImageError from "../../src/assert/svg/imageError.svg";
import { LangID } from "../../i18n/declare";
import { Sp } from "../../i18n/view";
@url('/image')
export class Image extends Block {
    @prop()
    src: ResourceArguments;
    appear = BlockAppear.solid;
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
    render() {
        return <div className='sy-block-image' style={this.block.visibleStyle} >
            <div className='sy-block-image-content' >
                {this.isLoadError && <div style={{ background: 'rgb(242, 241, 238)' }} className='sy-block-image-error'>
                    <ImageError></ImageError>
                    <p style={{
                        fontSize: '14px',
                        lineHeight: '20px',
                        color: 'rgba(55, 53, 47, 0.6)',
                        margin: '0px 0px 14px'
                    }}><Sp id={LangID.imageErrorLoadTip}></Sp></p>
                    <p><a><Sp id={LangID.learnMore}></Sp></a></p>
                    <p style={{
                        fontSize: '12px',
                        lineHeight: '16px',
                        color: 'rgba(55, 53, 47, 0.4)'
                    }}>{this.errorUrl}</p>
                </div>}
                {!this.isLoadError && <SolidArea content={
                    this.block.src && <img onError={e => this.onError(e)} src={this.block?.src?.url} />
                }></SolidArea>}
            </div>
        </div>
    }
}