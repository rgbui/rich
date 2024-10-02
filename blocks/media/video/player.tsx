
import React from "react"
import Player from "xgplayer";
import { util } from "../../../util/util"
import 'xgplayer/dist/index.min.css';
import { I18N } from 'xgplayer'
import ZH from 'xgplayer/es/lang/zh-cn'

// 启用中文
if (!window.shyConfig?.isUS)
    I18N.use(ZH)

export default class VideoPlayer extends React.Component<{
    src: string,
    autoplayMuted?: boolean,
    videoLoop?: boolean,
    height?: number
}> {

    player: Player
    videoPanel: HTMLElement;
    render() {
        return <div style={{
            height: this.props.height || 300
        }}>
            <div ref={e => this.videoPanel = e}></div>
        </div>
    }
    componentDidMount(): void {
        this.loadPlayer()
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
            // var size = await this.block.getVideoSize()
            // var width = this.contentWrapper.getBoundingClientRect().width;
            // if (this.block.isFreeBlock) width = this.block.fixedWidth;
            // var height = width * size.height / size.width;
            // this.contentWrapper.style.height = `${height}px`;
            this.player = new Player({
                el: this.videoPanel,
                url: this.props.src,
                height: '100%',
                width: '100%',
                autoplayMuted: this.props.autoplayMuted,
                autoplay: this.props.autoplayMuted,
                loop: this.props.videoLoop
            });
        }
    }
}