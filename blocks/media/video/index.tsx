import React from "react";
import { ResourceArguments } from "../../../extensions/icon/declare";
import { BlockDisplay, BlockRenderRange } from "../../../src/block/enum";
import { prop, url, view } from "../../../src/block/factory/observable";
import { BlockView } from "../../../src/block/view";
import { Rect } from "../../../src/common/vector/point";
import { useVideoPicker } from "../../../extensions/file/video.picker";
import { Block } from "../../../src/block";
import { channel } from "../../../net/channel";
import { Icon } from "../../../component/view/icon";
import "./video.min.css";
import { VideoSvg } from "../../../component/svgs";
import { MouseDragger } from "../../../src/common/dragger";

/**
 * https://www.zhangxinxu.com/wordpress/2018/12/html5-video-play-picture-in-picture/s
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
                var d = await channel.post('/ws/upload/file', {
                    file: this.initialData.file,
                    uploadProgress: (event) => {
                        console.log(event, 'ev');
                    }
                });
                if (d.ok && d.data?.file?.url) {
                    await this.onUpdateProps({ src: { url: d.data?.file?.url, name: 'upload' } }, BlockRenderRange.self);
                }
            }
            if (this.initialData && this.initialData.url) {
                var d = await channel.post('/ws/download/url', { url: this.initialData.url });
                if (d.ok && d.data?.file?.url) {
                    await this.onUpdateProps({ src: { url: d.data?.file?.url, name: 'download', source: this.initialData.url } }, BlockRenderRange.self);
                }
            }
            // var video = this.el.querySelector('video');
            // if (video) {
            //     var videojs = await loadVideoJs();
            //     this.player = videojs(video, {}, function onPlayerReady() {
            //         // videojs.log('Your player is ready!');
            //         // In this context, `this` is the player that was created by Video.js.
            //         // this.play();
            //         // How about an event listener?
            //         // this.on('ended', function () {
            //         //     videojs.log('Awww...over so soon?!');
            //         // });
            //     });
            //     var bound = Rect.fromEle((this.view as any).contentWrapper);
            //     (this.view as any).contentWrapper.style.height = (bound.width * 3 / 4) + 'px';
            // }
        }
        catch (ex) {
            console.error(ex);
        }
    }
    player;
}
@view('/video')
export class VideoView extends BlockView<Video>{
    onMousedown(event: React.MouseEvent, operator: 'left' | "right")
    {
        event.stopPropagation();
        var el = this.block.el;
        var bound = el.getBoundingClientRect();
        var self = this;
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
                this.contentWrapper.style.height = (width * 3 / 4) + 'px';
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
        return <div className='sy-block-video' style={this.block.visibleStyle}>
            {!this.block.src?.url && this.block.isCanEdit() && <div onMouseDown={e => this.block.addVideo(e)} className='sy-block-video-nofile'>
                <Icon icon={VideoSvg} size={24}></Icon>
                <span>添加视频</span>
            </div>}
            {this.block.src?.url && <div className='sy-block-video-content'>
                <div
                    className="sy-block-video-wrapper"
                    ref={e => this.contentWrapper = e}
                    style={{ width: this.block.contentWidthPercent ? this.block.contentWidthPercent + "%" : undefined }}>
                    <video data-setup='{}' preload={'metadata'} className="video-js vjs-default-skin vjs-big-play-centered" controls src={this.block.src.url} style={{
                        width: '100%', height: '100%'
                    }} >
                    </video>
                    {this.block.isCanEdit() && <><div className='sy-block-video-left-resize' onMouseDown={e => this.onMousedown(e, 'left')}></div>
                        <div className='sy-block-video-right-resize' onMouseDown={e => this.onMousedown(e, 'right')}></div></>}
                </div>
            </div>}
        </div>
    }
}

// import ('./video.min.js');
// var videoJS;
// export async function loadVideoJs() {
//     if (typeof videoJS == 'undefined') {
//         videoJS = VideoJS;
//         // videoJS=(window as any).videoJS;
//         // console.log(videoJS)
//         // var r = await import(
//         //     /* webpackChunkName: 'videojs' */
//         //     /* webpackPrefetch: true */
//         //     './video.min.js'
//         // );
//         // videoJS = r.default;
//     }
//     return videoJS;
// }