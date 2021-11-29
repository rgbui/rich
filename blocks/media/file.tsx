import React from "react";
import { ResourceArguments } from "../../extensions/icon/declare";
import { Block } from "../../src/block";
import AudioSvg from "../../src/assert/svg/audio.svg";
import { BlockDisplay, BlockRenderRange } from "../../src/block/enum";
import { url, prop, view } from "../../src/block/factory/observable";
import { SolidArea } from "../../src/block/view/appear";
import { BlockView } from "../../src/block/view";
import { Rect } from "../../src/common/point";
import { Directive } from "../../util/bus/directive";
import { messageChannel } from "../../util/bus/event.bus";
import { useFilePicker } from "../../extensions/file/file.picker";
import { LangID } from "../../i18n/declare";
import { Sp } from "../../i18n/view";


@url('/file')
export class File extends Block {
    @prop()
    src: ResourceArguments = { name: 'none' }
    display = BlockDisplay.block;
    get appearAnchors() {
        if (this.src.name == 'none') return [];
        return this.__appearAnchors;
    }
    async addFile(event: React.MouseEvent) {
        var target = event.target as HTMLElement;
        var bound = Rect.from(target.getBoundingClientRect());
        var r = await useFilePicker({ roundArea: bound });
        if (r) {
            await this.onUpdateProps({ src: r }, BlockRenderRange.self);
        }
    }
    async didMounted() {
        try {
            if (this.createSource == 'InputBlockSelector' && !this.src) {
                var r = await useFilePicker({ roundArea: Rect.fromEle(this.el) });
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
@view('/file')
export class FileView extends BlockView<File>{
    render() {
        return <div className='sy-block-file' style={this.block.visibleStyle}>
            {this.block.src.name == 'none' && <div onMouseDown={e => this.block.addFile(e)} className='sy-block-audio-nofile'>
                <AudioSvg></AudioSvg>
                <Sp id={LangID.AddAudioTip}></Sp>
            </div>}
            {this.block.src.name != 'none' && <SolidArea rf={e => this.block.elementAppear({ el: e, prop: 'src' })}>
            </SolidArea>}
        </div>
    }
}