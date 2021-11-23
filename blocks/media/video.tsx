import React from "react";
import { ResourceArguments } from "../../extensions/icon/declare";
import { Sp } from "../../i18n/view";
import { LangID } from "../../i18n/declare";
import { BlockDisplay, BlockRenderRange } from "../../src/block/enum";
import { prop, url, view } from "../../src/block/factory/observable";
import { BlockView } from "../../src/block/view";
import { Rect } from "../../src/common/point";
import VideoSvg from "../../src/assert/svg/video.svg";
import { useVideoPicker } from "../../extensions/file/video.picker";
import { Block } from "../../src/block";
import { SolidArea } from "../../src/block/view/appear";
import { Directive } from "../../util/bus/directive";
import { messageChannel } from "../../util/bus/event.bus";
@url('/video')
export class Video extends Block {
    @prop()
    src: ResourceArguments = { name: 'none' }
    display = BlockDisplay.block;
    async addVideo(event: React.MouseEvent) {
        var target = event.target as HTMLElement;
        var bound = Rect.from(target.getBoundingClientRect());
        var r = await useVideoPicker({ roundArea: bound });
        if (r) {
            await this.onUpdateProps({ src: r });
        }
    }
    async didMounted() {
        try {
            if (this.createSource == 'InputBlockSelector' && !this.src) {
                var r = await useVideoPicker({ roundArea: Rect.fromEle(this.el) });
                if (r) {
                    await this.onUpdateProps({ src: r }, BlockRenderRange.self);
                }
            }
            if (this.initialData && this.initialData.file) {
                var d = await messageChannel.fireAsync(Directive.UploadWorkspaceFile, this.initialData.file, (event) => {
                    console.log(event, 'ev');
                });
                if (d.ok && d.data.url) {
                    await this.onUpdateProps({ src: { url: d.data.url, name: 'upload' } }, BlockRenderRange.self);
                }
            }
            if (this.initialData && this.initialData.url) {
                var d = await messageChannel.fireAsync(Directive.UploadWorkspaceFileUrl, this.initialData.url);
                if (d.ok && d.data.url) {
                    await this.onUpdateProps({ src: { url: d.data.url, name: 'download', source: this.initialData.url } }, BlockRenderRange.self);
                }
            }
        }
        catch (ex) {
            console.error(ex);
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
            {this.block.src.name != 'none' && <SolidArea rf={e => this.block.elementAppear({ el: e, prop: 'src' })}>
                <video src={this.block.src.url}></video>
            </SolidArea>}
        </div>
    }
}