import React from "react";
import { ResourceArguments } from "../../extensions/icon/declare";
import { Sp } from "../../i18n";
import { LangID } from "../../i18n/declare";
import { Content } from "../../src/block/element/content";
import { BlockAppear } from "../../src/block/enum";
import { prop, url, view } from "../../src/block/factory/observable";
import { BlockView } from "../../src/block/view";
import { Rect } from "../../src/common/point";
import VideoSvg from "../../src/assert/svg/video.svg";
import { useVideoPicker } from "../../extensions/file/video.picker";
@url('/video')
export class Video extends Content {
    @prop()
    src: ResourceArguments = { name: 'none' }
    appear = BlockAppear.solid;
    async addVideo(event: React.MouseEvent) {
        var target = event.target as HTMLElement;
        var bound = Rect.from(target.getBoundingClientRect());
        var r = await useVideoPicker({ roundArea: bound });
        if (r) {
            await this.onUpdateProps({ src: r });
        }
    }
}
@view('/video')
export class VideoView extends BlockView<Video>{
    render() {
        return <div className='sy-block-video' style={this.block.visibleStyle}>
            {this.block.src.name == 'none' && <div onMouseDown={e => this.block.addVideo(e)} className='sy-block-video-nofile'>
                <VideoSvg></VideoSvg>
                <Sp id={LangID.AddVideoTip}></Sp>
            </div>}
            {this.block.src.name != 'none' && <div className='sy-block-video-content'>
                <video src={this.block.src.url}></video>
            </div>}
        </div>
    }
}