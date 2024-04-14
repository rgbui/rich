
import React, { CSSProperties } from "react"
import Player from "xgplayer/es/player";
import { VideoSvg, DotsSvg } from "../../../component/svgs";
import { MouseDragger } from "../../../src/common/dragger";
import { util } from "../../../util/util";
import { Icon } from "../../../component/view/icon";
import { Video } from ".";
import 'xgplayer/dist/index.min.css';
import { I18N } from 'xgplayer'
import ZH from 'xgplayer/es/lang/zh-cn'
// 启用中文
if (!window.shyConfig?.isUS)
    I18N.use(ZH)

export default class VideoWrapper extends React.Component<{ block: Video }> {
    get block() {
        return this.props.block;
    }
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
                <Icon icon={VideoSvg} size={16}></Icon>
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
    componentDidMount(): void {
        this.loadPlayer()
    }

}