import React from "react";
import { ResourceArguments } from "../../extensions/icon/declare";
import { prop, url, view } from "../../src/block/factory/observable";
import { BlockView } from "../../src/block/view";
import { S, Sp } from "../../i18n/view";
import { useAudioPicker } from "../../extensions/file/audio.picker";
import { PointArrow, Rect } from "../../src/common/vector/point";
import { Block } from "../../src/block";
import { BlockDirective, BlockDisplay, BlockRenderRange } from "../../src/block/enum";
import { channel } from "../../net/channel";
import { AudioSvg, DownloadSvg, UploadSvg } from "../../component/svgs";
import { Icon } from "../../component/view/icon";
import { util } from "../../util/util";
import { Remark } from "../../component/view/text";
import { lst } from "../../i18n/store";
import "./style.less";
import { MenuItem, MenuItemType } from "../../component/view/menu/declare";
import { PopoverPosition } from "../../component/popover/position";
import { CopyAlert } from "../../component/copy";
import { getImageSize } from "../../component/file";
import { closeBoardEditTool } from "../../extensions/board.edit.tool";
import { useImagePicker } from "../../extensions/image/picker";

/*
 * https://howlerjs.com/
 */
@url('/audio')
export class Audio extends Block {
    @prop()
    src: ResourceArguments = { name: 'none' }
    display = BlockDisplay.block;
    async addAudio(pos: PopoverPosition) {
        var r = await useAudioPicker(pos);
        if (r) {
            await this.onUpdateProps({ src: r }, { range: BlockRenderRange.self, merge: true });
        }
    }
    @prop()
    fixedWidth = 300;
    speed = '';
    get appearAnchors() {
        if (this.src.name == 'none') return [];
        return this.__appearAnchors;
    }
    async didMounted() {
        await this.onBlockReloadData(async () => {
            try {
                if (this.createSource == 'InputBlockSelector' && !this.src?.url) {
                    var r = await useAudioPicker({ roundArea: Rect.fromEle(this.el) });
                    if (r) {
                        await this.onUpdateProps({ src: r }, { range: BlockRenderRange.self, merge: true });
                    }
                     delete this.createSource;
                }
                if (this.initialData && this.initialData.file) {
                    var d = await channel.post('/ws/upload/file', {
                        file: this.initialData.file, uploadProgress: (event) => {
                            if (event.lengthComputable) {
                                this.speed = `${util.byteToString(event.total)}${(100 * event.loaded / event.total).toFixed(2)}%`;
                                this.forceManualUpdate();
                            }
                        }
                    });
                    if (d.ok && d.data?.file?.url) {
                        await this.onUpdateProps({ src: { ...d.data?.file } }, { range: BlockRenderRange.self, merge: true });
                    }
                    this.initialData={};
                }
                if (this.initialData && this.initialData.url) {
                    var d = await channel.post('/ws/download/url', { url: this.initialData.url });
                    if (d.ok && d.data?.file?.url) {
                        await this.onUpdateProps({ src: { ...d.data?.file, source: this.initialData.url } }, { range: BlockRenderRange.self, merge: true });
                    }
                    this.initialData={};
                }
            }
            catch (ex) {
                console.error(ex);
            }
        });
    }
    async getMd() {
        return `[${this.src?.filename || lst('音频')}](${this.src?.url})`;
    }
    async onGetContextMenus() {
        var rs = await super.onGetContextMenus();
        var items: MenuItem<string | BlockDirective>[] = [];
        items.push({
            name: 'origin',
            text: lst('打开音频'),
            icon: { name: 'bytedance-icon', code: 'arrow-right-up' },
            disabled: this.src?.url ? false : true
        });
        items.push({
            name: 'copyFileUrl',
            text: lst('复制音频网址'),
            icon: { name: 'byte', code: 'copy-link' },
            disabled: this.src?.url ? false : true
        });
        items.push({
            name: 'replace',
            text: this.src?.url ? lst('重新上传音频') : lst('上传音频'),
            icon: UploadSvg
        });
        items.push({
            name: 'download',
            text: lst('下载'),
            icon: DownloadSvg,
            disabled: this.src?.url ? false : true
        });
        items.push({ type: MenuItemType.divide })
        var at = rs.findIndex(g => g.name == BlockDirective.comment);
        rs.splice(at, 0, ...items)
        at = rs.findIndex(g => g.name == 'color');
        rs.splice(at, 2);
        return rs;
    }
    async onClickContextMenu(item, event) {
        switch (item.name) {
            case 'replace':
                this.addAudio({ roundArea: this.getVisibleBound() })
                return;
            case 'origin':
                window.open(this.src?.url)
                return;
            case 'copyFileUrl':
                CopyAlert(this.src?.url, lst('已复制音频网址'))
                return;
            case 'align':
                await this.onUpdateProps({ align: item.value }, { range: BlockRenderRange.self })
                return;
            case 'download':
                util.downloadFile(this.src?.url, (this.src?.filename) + (this.src.ext || '.mp3'))
                return;
        }
        await super.onClickContextMenu(item, event);
    }
    getResolveContent(this: Block) {
        return lst('音频')
    }
    get fixedSize() {
        return {
            width: Math.max(this.fixedWidth, 300),
            height: 60
        }
    }
    async getBoardEditCommand(): Promise<{ name: string; value?: any; }[]> {
        var cs: { name: string; value?: any; }[] = [];
        cs.push({ name: 'upload' });
        cs.push({ name: 'download' });
        return cs;
    }
    async setBoardEditCommand(name: string, value: any) {
        if (name == 'upload') {
            closeBoardEditTool();
            setTimeout(() => {
                this.addAudio({ roundArea: this.getVisibleBound() })
            }, 200);
        }
        else if (name == 'download') {
            await util.downloadFile(this.src?.url, (this.src?.filename) || (lst('图像')) + (this.src.ext || '.jpg'));
        }
        else
            await super.setBoardEditCommand(name, value)
    }
    async getBoardCopyStyle() {
        return null;
    }
}
@view('/audio')
export class AudioView extends BlockView<Audio> {
    renderView() {
        var style = this.block.visibleStyle;
        if (this.block.isFreeBlock) {
            var size = this.block.fixedSize;
            style.width = size.width;
            style.boxSizing = 'border-box'
            // style.height = size.height;
            style.padding = 10;
        }
        return <div className={'sy-block-audio round ' + (this.block.isFreeBlock ? " item-hover-light" : "")} style={style}>
            {this.block.src.name == 'none' && <div onMouseDown={e => this.block.addAudio({ roundArea: Rect.fromEle(e.currentTarget as HTMLElement) })} className='sy-block-audio-nofile'>
                <Icon size={16} icon={AudioSvg}></Icon>
                {!this.block.speed && <S>添加音频</S>}
                {this.block.speed && <Remark>{this.block.speed}</Remark>}
            </div>}
            {this.block.src.name != 'none' && <div className='sy-block-audio-content'>
                <audio draggable={false} controls style={{ width: 'inherit', height: 'inherit' }} src={this.block.src.url}></audio>
            </div>}
            {this.renderComment()}
        </div>
    }
}