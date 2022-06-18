import React from "react";
import { ResourceArguments } from "../../extensions/icon/declare";
import { prop, url, view } from "../../src/block/factory/observable";
import { BlockView } from "../../src/block/view";
import { Sp } from "../../i18n/view";
import { LangID } from "../../i18n/declare";
import { useAudioPicker } from "../../extensions/file/audio.picker";
import { Rect } from "../../src/common/vector/point";
import { Block } from "../../src/block";
import { BlockDisplay, BlockRenderRange } from "../../src/block/enum";
import { SolidArea } from "../../src/block/view/appear";
import { channel } from "../../net/channel";
import { AudioSvg } from "../../component/svgs";
import { Icon } from "../../component/view/icon";
/*
 * https://howlerjs.com/
 */
@url('/audio')
export class Audio extends Block {
    @prop()
    src: ResourceArguments = { name: 'none' }
    display = BlockDisplay.block;
    async addAudio(event: React.MouseEvent) {
        var target = event.target as HTMLElement;
        var bound = Rect.from(target.getBoundingClientRect());
        var r = await useAudioPicker({ roundArea: bound });
        if (r) {
            await this.onUpdateProps({ src: r }, { range: BlockRenderRange.self, merge: true });
        }
    }

    get appearAnchors() {
        if (this.src.name == 'none') return [];
        return this.__appearAnchors;
    }
    async didMounted() {
        try {
            if (this.createSource == 'InputBlockSelector') {
                var r = await useAudioPicker({ roundArea: Rect.fromEle(this.el) });
                if (r) {
                    await this.onUpdateProps({ src: r }, { range: BlockRenderRange.self, merge: true });
                }
            }
            if (this.initialData && this.initialData.file) {
                var d = await channel.post('/ws/upload/file', {
                    file: this.initialData.file, uploadProgress: (event) => {
                        console.log(event, 'ev');
                    }
                });
                if (d.ok && d.data?.file?.url) {
                    await this.onUpdateProps({ src: { ...d.data?.file } }, { range: BlockRenderRange.self, merge: true });
                }
            }
            if (this.initialData && this.initialData.url) {
                var d = await channel.post('/ws/download/url', { url: this.initialData.url });
                if (d.ok && d.data?.file?.url) {
                    await this.onUpdateProps({ src: { ...d.data?.file, source: this.initialData.url } }, { range: BlockRenderRange.self, merge: true });
                }
            }
        }
        catch (ex) {
            console.error(ex);
        }
    }
}
@view('/audio')
export class AudioView extends BlockView<Audio>{
    render() {
        return <div className='sy-block-audio' style={this.block.visibleStyle}>
            {this.block.src.name == 'none' && <div onMouseDown={e => this.block.addAudio(e)} className='sy-block-audio-nofile'>
                <Icon icon={AudioSvg}></Icon>
                <Sp id={LangID.AddAudioTip}></Sp>
            </div>}
            {this.block.src.name != 'none' && <div className='sy-block-audio-content'>
                <audio controls style={{ width: 'inherit', height: 'inherit' }} src={this.block.src.url}></audio>
            </div>}
        </div>
    }
}