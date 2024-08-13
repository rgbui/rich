import React from "react";
import { PexelsSvg, PicSvg, UnsplashSvg } from "../../../component/svgs";
import { ToolTip } from "../../../component/view/tooltip";
import { S } from "../../../i18n/view";
import { Icon } from "../../../component/view/icon";
import { GalleryType } from "../../image/declare";
import { LastUploadFiles } from "../../image/lasterUpload";
import { ThirdGallery } from "../../image/third.gallery";
import { GalleryBgs } from "../../image/store";

export class MaterialImageView extends React.Component<{
    onChange: (resource: any) => void
}> {
    mode: "images" | 'pexels' | 'unsplash' | 'LastUploadFiles' = 'images';
    render() {
        return <div>
            <div className="flex  gap-t-10  gap-w-10 r-cursor r-gap-r-10 r-size-24 r-flex-center">

                <ToolTip overlay={<span><S>图片</S></span>}>
                    <div className={this.mode == 'images' ? "text-p item-hover-focus round" : ""} onMouseDown={e => { this.mode = 'images'; this.forceUpdate() }}>
                        <Icon icon={PicSvg} size={18}></Icon>
                    </div>
                </ToolTip>

                <ToolTip overlay={<S>最近上传的图片</S>}>
                    <div className={this.mode == 'LastUploadFiles' ? "text-p item-hover-focus round" : ""} onMouseDown={async e => {
                        this.mode = 'LastUploadFiles';
                        this.forceUpdate(async () => {
                            if (this.lastUpdateFiles)
                                await this.lastUpdateFiles.load()
                        })
                    }}>
                        <Icon icon={{ name: 'byte', code: 'history' }} size={18}></Icon>
                    </div>
                </ToolTip>

                <ToolTip overlay={<span>Pexels</span>}>
                    <div className={this.mode == 'pexels' ? "text-p item-hover-focus round" : ""} onMouseDown={e => { this.mode = 'pexels'; this.forceUpdate() }}>
                        <Icon icon={PexelsSvg} size={18}></Icon>
                    </div>
                </ToolTip>

                <ToolTip overlay={<span>Unsplash</span>}>
                    <div className={this.mode == 'unsplash' ? "text-p item-hover-focus round" : ""} onMouseDown={e => { this.mode = 'unsplash'; this.forceUpdate() }}>
                        <Icon icon={UnsplashSvg} size={18}></Icon>
                    </div>
                </ToolTip>
            </div>
            <div>
                {this.mode == 'images' && <div>
                    {GalleryBgs().map(gp => {
                        return <div className="shy-gallery-group gap-w-5" key={gp.group}>
                            <h3>{gp.group}</h3>
                            {this.renderImages(gp.childs)}
                        </div>
                    })}
                </div>}
                {this.mode == 'LastUploadFiles' && <LastUploadFiles ref={e => this.lastUpdateFiles = e} onChange={e => this.props.onChange({ url: e.url })}></LastUploadFiles>}
                {this.mode == 'pexels' && <ThirdGallery type={GalleryType.pexels} onChange={e => { this.props.onChange(e as any) }}></ThirdGallery>}
                {this.mode == 'unsplash' && <ThirdGallery type={GalleryType.unsplash} onChange={e => this.props.onChange(e as any)}></ThirdGallery>}
            </div>
        </div>
    }
    lastUpdateFiles: LastUploadFiles;
    renderImages(pics) {
        return <div className='shy-gallery-pics'>{pics.map((pic, i) => {
            return <div className='shy-gallery-pic' key={i} onClick={e => this.props.onChange({ url: pic.url })}>
                <div><img src={pic.thumb} /></div>
            </div>
        })}</div>
    }
}