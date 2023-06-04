import React from "react";
import { ResourceArguments } from "../../extensions/icon/declare";
import { Block } from "../../src/block";
import { BlockDisplay, BlockRenderRange } from "../../src/block/enum";
import { url, prop, view } from "../../src/block/factory/observable";
import { BlockView } from "../../src/block/view";
import { Rect } from "../../src/common/vector/point";
import { useFilePicker } from "../../extensions/file/file.picker";
import { channel } from "../../net/channel";
import { DownloadSvg, FileSvg } from "../../component/svgs";
import { Icon } from "../../component/view/icon";
import { util } from "../../util/util";

@url('/file')
export class File extends Block {
    @prop()
    src: ResourceArguments = { name: 'none' }
    display = BlockDisplay.block;
    speed = '';
    get appearAnchors() {
        if (this.src.name == 'none') return [];
        return this.__appearAnchors;
    }
    async addFile(event: React.MouseEvent) {
        var target = event.target as HTMLElement;
        var bound = Rect.from(target.getBoundingClientRect());
        var r = await useFilePicker({ roundArea: bound });
        if (r) {
            await this.onUpdateProps({ src: r }, { range: BlockRenderRange.self, merge: true });
        }
    }
    async didMounted() {
        try {
            if (this.createSource == 'InputBlockSelector') {
                var r = await useFilePicker({ roundArea: Rect.fromEle(this.el) });
                if (r) {
                    await this.onUpdateProps({ src: r }, { range: BlockRenderRange.self, merge: true });
                }
            }
            if (this.initialData && this.initialData.file) {
                var d = await channel.post('/ws/upload/file', {
                    file: this.initialData.file,
                    uploadProgress: (event) => {
                        if (event.lengthComputable) {
                            this.speed = `${util.byteToString(event.total)}${(100 * event.loaded / event.total).toFixed(2)}%`;
                            this.forceUpdate();
                        }
                    }
                });
                if (d.ok && d.data?.file?.url) {
                    await this.onUpdateProps({
                        src: {
                            ...d.data?.file
                        }
                    }, { range: BlockRenderRange.self, merge: true });
                }
            }
            if (this.initialData && this.initialData.url) {
                var d = await channel.post('/ws/download/url', { url: this.initialData.url });
                if (d.ok && d.data?.file?.url) {
                    await this.onUpdateProps({
                        src: {
                            ...d.data?.file,
                            source: this.initialData.url
                        }
                    }, { range: BlockRenderRange.self, merge: true });
                }
            }
        }
        catch (ex) {
            console.error(ex);
        }
    }
    async getPlain() {
         return this.src?.filename||''
    }
}
@view('/file')
export class FileView extends BlockView<File>{
    render() {
        return <div className='sy-block-file' style={this.block.boxStyle}>
            {this.block.src.name == 'none' && <div onMouseDown={e => this.block.addFile(e)} className='sy-block-file-nofile'>
                <Icon className={'text-1'} icon={FileSvg}></Icon>
                {!this.block.speed && <span>添加附件</span>}
                {this.block.speed && <div className="remark">{this.block.speed}</div>}
            </div>}
            {this.block.src.name != 'none' && <div className='sy-block-file-content' >
                <Icon icon={FileSvg} size={18} className='text-1 sy-block-file-content-icon'></Icon>
                <span className='sy-block-file-content-title'>{this.block.src?.filename}</span>
                <span className='sy-block-file-content-bytes'>{util.byteToString(this.block.src.size)}</span>
                <a className='sy-block-file-content-link' download={this.block.src?.filename} href={this.block.src.url}><Icon size={30} icon={DownloadSvg}></Icon></a>
            </div>}
        </div>
    }
}