import React from "react";
import { ResourceArguments } from "../../extensions/icon/declare";
import { Content } from "../../src/block/element/content";
import { BlockAppear } from "../../src/block/enum";
import { prop, url, view } from "../../src/block/factory/observable";
import { BlockView } from "../../src/block/view";
import AudioSvg from "../../src/assert/svg/audio.svg";
import { Sp } from "../../i18n/view";
import { LangID } from "../../i18n/declare";
import { useAudioPicker } from "../../extensions/file/audio.picker";
import { Rect } from "../../src/common/point";
@url('/audio')
export class Audio extends Content {
    @prop()
    src: ResourceArguments = { name: 'none' }
    appear = BlockAppear.solid;
    async addAudio(event: React.MouseEvent) {
        var target = event.target as HTMLElement;
        var bound = Rect.from(target.getBoundingClientRect());
        var r = await useAudioPicker({ roundArea: bound });
        if (r) {
            await this.onUpdateProps({ src: r });
        }
    }
}
@view('/audio')
export class AudioView extends BlockView<Audio>{
    render() {
        return <div className='sy-block-audio' style={this.block.visibleStyle}>
            {this.block.src.name == 'none' && <div onMouseDown={e => this.block.addAudio(e)} className='sy-block-audio-nofile'>
                <AudioSvg></AudioSvg>
                <Sp id={LangID.AddAudioTip}></Sp>
            </div>}
            {this.block.src.name != 'none' && <div className='sy-block-audio-content'>
                <audio src={this.block.src.url}></audio>
            </div>}
        </div>
    }
}