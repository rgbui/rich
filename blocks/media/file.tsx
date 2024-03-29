import React from "react";
import { ResourceArguments } from "../../extensions/icon/declare";
import { Block } from "../../src/block";
import { BlockDirective, BlockDisplay, BlockRenderRange } from "../../src/block/enum";
import { url, prop, view } from "../../src/block/factory/observable";
import { BlockView } from "../../src/block/view";
import { Rect } from "../../src/common/vector/point";
import { useFilePicker } from "../../extensions/file/file.picker";
import { channel } from "../../net/channel";
import { DotsSvg, DownloadSvg, FileSvg, PageSvg, UploadSvg } from "../../component/svgs";
import { Icon } from "../../component/view/icon";
import { util } from "../../util/util";
import { lst } from "../../i18n/store";
import { S } from "../../i18n/view";
import { Tip } from "../../component/view/tooltip/tip";
import { MenuItem, MenuItemType } from "../../component/view/menu/declare";
import { CopyAlert } from "../../component/copy";
import { PopoverPosition } from "../../component/popover/position";
import "./style.less";

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
    async addFile(pos: PopoverPosition) {
        var r = await useFilePicker(pos);
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
        return this.src?.filename || ''
    }
    async getMd() {
        return `[${this.src?.filename || lst('文件')}](${this.src?.url})`;
    }
    async onGetContextMenus() {
        var rs = await super.onGetContextMenus();
        var items: MenuItem<string | BlockDirective>[] = [];
        items.push({
            name: 'origin',
            text: lst('打开文件'),
            icon: { name: 'bytedance-icon', code: 'arrow-right-up' },
            disabled: this.src?.url ? false : true
        });
        items.push({
            name: 'copyFileUrl',
            text: lst('复制文件网址'),
            icon: { name: 'byte', code: 'copy-link' },
            disabled: this.src?.url ? false : true
        });

        items.push({
            name: 'replace',
            text: this.src?.url ? lst('重新上传文件') : lst('上传文件'),
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
                this.addFile({ roundArea: this.getVisibleBound() })
                return;
            case 'origin':
                window.open(this.src?.url)
                return;
            case 'copyFileUrl':
                CopyAlert(this.src?.url, lst('已复制文件网址'))
                return;
            case 'download':
                util.downloadFile(this.src?.url, (this.src?.filename) + (this.src.ext))
                return;
        }
        await super.onClickContextMenu(item, event);
    }
    async downloadFile() {
        util.downloadFile(this.src?.url, (this.src?.filename) + (this.src.ext))
    }
}
@view('/file')
export class FileView extends BlockView<File>{
    renderView() {
        return <div className='sy-block-file visible-hover' style={this.block.visibleStyle}>
            {this.block.src.name == 'none' && <div onMouseDown={e => this.block.addFile({ roundArea: Rect.fromEle(e.currentTarget as HTMLElement) })} className='sy-block-file-nofile item-hover'>
                <Icon className={'remark gap-r-10'} size={16} icon={FileSvg}></Icon>
                {!this.block.speed && <span><S>添加附件</S></span>}
                {this.block.speed && <div className="remark gap-l-10">{this.block.speed}</div>}
            </div>}
            {this.block.src.name != 'none' && <div className='flex padding-w-5 padding-h-5 round cursor item-hover' >
                <span className="size-20 flex-center round item-hover"><Icon icon={PageSvg} size={18} className='text-1 '></Icon></span>
                <span className='flex-fixed text-overflow flex gap-l-5'>{this.block.src?.filename}</span>
                <span className='remark gap-l-5 f-12 flex-auto flex'>{util.byteToString(this.block.src.size)}</span>
                <span className="flex-fixed visible gap-r-10 remark r-cursor">
                    <Tip text='下载'><a
                        style={{ color: 'inherit' }}
                        onMouseDown={e => {
                            e.preventDefault();
                            this.block.downloadFile();
                        }}
                        download={this.block.src?.filename}
                        href={this.block.src.url}><Icon size={20} icon={DownloadSvg}></Icon></a></Tip>
                    <Tip text='属性'>
                        <Icon className={'gap-l-10'}
                            onMousedown={async e => {
                                var sp = e.currentTarget.closest('.visible');
                                sp.classList.remove('visible');
                                try {
                                    await this.block.onContextmenu(e.nativeEvent)
                                }
                                catch (ex) { }
                                finally {
                                    sp.classList.add('visible');
                                }
                            }} size={20} icon={DotsSvg}></Icon>
                    </Tip>
                </span>
            </div>}
        </div>
    }
}