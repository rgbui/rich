import React from "react";
import { ResourceArguments } from "../../extensions/icon/declare";

import { prop, url, view } from "../../src/block/factory/observable";
import { BlockView } from "../../src/block/view";
import AudioSvg from "../../src/assert/svg/audio.svg";
import { Sp } from "../../i18n/view";
import { LangID } from "../../i18n/declare";
import { useAudioPicker } from "../../extensions/file/audio.picker";
import { Rect } from "../../src/common/point";
import { Block } from "../../src/block";
import { BlockDisplay, BlockRenderRange } from "../../src/block/enum";
import { SolidArea } from "../../src/block/view/appear";
import { Directive } from "../../util/bus/directive";
import { messageChannel } from "../../util/bus/event.bus";
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
            await this.onUpdateProps({ src: r }, BlockRenderRange.self);
        }
    }

    get appearAnchors() {
        if (this.src.name == 'none') return [];
        return this.__appearAnchors;
    }
    async didMounted() {
        try {
            if (this.createSource == 'InputBlockSelector' && !this.src) {
                var r = await useAudioPicker({ roundArea: Rect.fromEle(this.el) });
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
@view('/audio')
export class AudioView extends BlockView<Audio>{
    render() {
        return <div className='sy-block-audio' style={this.block.visibleStyle}>
            {this.block.src.name == 'none' && <div onMouseDown={e => this.block.addAudio(e)} className='sy-block-audio-nofile'>
                <AudioSvg></AudioSvg>
                <Sp id={LangID.AddAudioTip}></Sp>
            </div>}
            {this.block.src.name != 'none' && <div className='sy-block-audio-content'>
                <SolidArea rf={e => this.block.elementAppear({ el: e, prop: "src" })}><audio src={this.block.src.url}></audio></SolidArea>
            </div>}
        </div>
    }
}