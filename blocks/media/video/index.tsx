import React, { Suspense, lazy } from "react";
import { ResourceArguments } from "../../../extensions/icon/declare";
import { BlockDirective, BlockDisplay, BlockRenderRange } from "../../../src/block/enum";
import { prop, url, view } from "../../../src/block/factory/observable";
import { BlockView } from "../../../src/block/view";
import { Rect } from "../../../src/common/vector/point";
import { useVideoPicker } from "../../../extensions/file/video.picker";
import { Block } from "../../../src/block";
import { channel } from "../../../net/channel";
import {  DownloadSvg, DuplicateSvg, LinkSvg, TrashSvg, UploadSvg } from "../../../component/svgs";
import { util } from "../../../util/util";
import { getVideoSize } from "../../../component/file";
import { MenuItem, MenuItemType } from "../../../component/view/menu/declare";
import { MenuItemView } from "../../../component/view/menu/item";
import { lst } from "../../../i18n/store";
import { UA } from "../../../util/ua";
import { Spin } from "../../../component/view/spin";
/**
 * 
 * https://h5player.bytedance.com/

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
    @prop()
    originSize: { width: number, height: number, duration: number } = null;
    @prop()
    autoplayMuted: boolean = false;
    display = BlockDisplay.block;
    speed = '';
    async addVideo(event: React.MouseEvent) {
        if (this.speed) return;
        var target = event.target as HTMLElement;
        var bound = Rect.from(target.getBoundingClientRect());
        var r = await useVideoPicker({ roundArea: bound });
        if (r) {
            await this.onSaveSize(r, false);
        }
    }
    async didMounted() {
        try {
            if (this.createSource == 'InputBlockSelector') {
                var r = await useVideoPicker({ roundArea: Rect.fromEle(this.el) });
                if (r) {
                    await this.onSaveSize(r, true);
                    return;
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
                this.speed = '';
                if (d.ok && d.data?.file?.url) {
                    await this.onSaveSize(d.data.file, true);
                    return;
                }
            }
            if (this.initialData && this.initialData.url) {
                var d = await channel.post('/ws/download/url', { url: this.initialData.url });
                if (d.ok && d.data?.file?.url) {
                    await this.onSaveSize(d.data.file, true);
                    return;
                }
            }
            // await (this.view as any).loadPlayer();
        }
        catch (ex) {
            console.error(ex);
        }
    }
    player;
    getVisibleContentBound() {
        var img = this.el.querySelector('.sy-block-video-wrapper video') as HTMLElement;
        if (img) {
            return Rect.fromEle(img);
        }
        return super.getVisibleContentBound();
    }
    async getMd() {
        return `[${this.src?.filename || lst('视频')}](${this.src?.url})`;
    }
    async getVideoSize() {
        if (this.originSize) return this.originSize;
        if (this.src?.url)
            this.originSize = await getVideoSize(this.src?.url);
        return this.originSize;
    }
    async onSaveSize(d: { url?: string }, merge: boolean) {
        var imgSize = await getVideoSize(d?.url);
        var width = this.el.getBoundingClientRect().width;
        var per = Math.min(70, parseInt((imgSize.width * 100 / width).toString()));
        per = Math.max(30, per);
        this.speed = '';
        await this.onUpdateProps({
            imageWidthPercent: per,
            originSize: imgSize,
            src: { ...d }
        }, { range: BlockRenderRange.self, merge });
        await (this.view as any).loadPlayer();
    }
    @prop()
    align: 'left' | 'right' | 'center' = 'center';
    @prop()
    mask: 'rect' | 'circle' | 'radius' | 'rhombus' | 'pentagon' | "star" = 'rect';
    async onGetContextMenus() {
        if (this.isFreeBlock) {
            return await this.onGetBoardContextMenus()
        }
        var rc = (item: MenuItem<string>, view?: MenuItemView) => {
            return <span className="flex-inline flex-center size-20"><span style={{ border: '1px solid var(--text-color)' }} className="round w-10 h-12 inline-block"></span></span>
        }
        var items: MenuItem<BlockDirective | string>[] = [];
        items.push({
            name: BlockDirective.copy,
            text: lst('拷贝副本'),
            label: UA.isMacOs ? "⌘+D" : "Ctrl+D",
            icon: DuplicateSvg
        });
        items.push({
            name: BlockDirective.link,
            text: lst('复制块链接'),
            icon: LinkSvg,
            label: UA.isMacOs ? "⌥+Shift+L" : "Alt+Shift+L"
        });
        items.push({
            type: MenuItemType.divide
        });
        items.push({
            text: lst('视频操作'),
            icon: { name: 'byte', code: 'write' },
            childs: [
                {
                    name: 'autoplayMuted',
                    text: lst('自动播放'),
                    type: MenuItemType.switch,
                    icon: { name: 'bytedance-icon', code: 'play' },
                    checked: this.autoplayMuted,
                    disabled: this.src?.url ? false : true
                },
                { type: MenuItemType.divide },
                {
                    name: 'origin',
                    text: lst('打开原视频'),
                    icon: { name: 'bytedance-icon', code: 'arrow-right-up' },
                    disabled: this.src?.url ? false : true
                },
                {
                    name: 'replace',
                    text: this.src?.url ? lst('重新上传视频') : lst('上传视频'),
                    icon: UploadSvg
                },
                {
                    name: 'download',
                    text: lst('下载'),
                    disabled: this.src?.url ? false : true,
                    icon: DownloadSvg
                }
            ]
        })
        items.push({
            text: lst('蒙板'),
            icon: { name: 'bytedance-icon', code: 'mask-two' },
            childs: [
                {
                    name: 'mask',
                    icon: {
                        name: 'bytedance-icon',
                        code: 'rectangle'
                    },
                    text: lst('无'),
                    value: 'rect',
                    checkLabel: this.mask == 'rect',
                    disabled: this.src?.url ? false : true
                },
                {
                    name: 'mask',
                    renderIcon: rc,
                    text: lst('圆角'),
                    value: 'radius',
                    checkLabel: this.mask == 'radius',
                    disabled: this.src?.url ? false : true
                },
                {
                    name: 'mask',
                    icon: {
                        name: 'bytedance-icon',
                        code: 'oval-one'
                    },
                    text: lst('圆'),
                    value: 'circle',
                    checkLabel: this.mask == 'circle',
                    disabled: this.src?.url ? false : true
                },
                {
                    name: 'mask',
                    icon: { name: 'bytedance-icon', code: 'diamond-three' },
                    text: lst('菱形'),
                    value: 'rhombus',
                    checkLabel: this.mask == 'rhombus',
                    disabled: this.src?.url ? false : true
                },
                {
                    name: 'mask',
                    icon: { name: 'bytedance-icon', code: 'pentagon-one' },
                    text: lst('五边形'),
                    value: 'pentagon',
                    checkLabel: this.mask == 'pentagon',
                    disabled: this.src?.url ? false : true
                },
                {
                    name: 'mask',
                    icon: { name: 'bytedance-icon', code: 'star' },
                    text: lst('星形'),
                    value: 'star',
                    checkLabel: this.mask == 'star',
                    disabled: this.src?.url ? false : true
                }
            ]
        });
        items.push({
            text: lst('对齐'),
            icon: { name: 'bytedance-icon', code: 'align-text-both' },
            childs: [
                {
                    name: 'align',
                    icon: { name: 'bytedance-icon', code: 'align-text-left' },
                    text: lst('居左'),
                    value: 'left',
                    checkLabel: this.align == 'left'
                },
                {
                    name: 'align',
                    icon: { name: 'bytedance-icon', code: 'align-text-center' },
                    text: lst('居中'), value: 'center', checkLabel: this.align == 'center'
                },
                {
                    name: 'align',
                    icon: {
                        name: 'bytedance-icon',
                        code: 'align-text-right'
                    },
                    text: lst('居右'),
                    value: 'right',
                    checkLabel: this.align == 'right'
                }
            ]
        });
        items.push({
            type: MenuItemType.divide
        });
        items.push({
            name: BlockDirective.comment,
            text: lst('评论'),
            icon: { name: 'byte', code: 'message' },
            label: UA.isMacOs ? "⌘+Opt+M" : "Ctrl+Alt+M"
        })
        items.push({
            type: MenuItemType.divide
        });
        items.push({
            name: BlockDirective.delete,
            icon: TrashSvg,
            text: lst('删除'),
            label: "Del"
        });
        items.push({
            type: MenuItemType.divide
        });
        items.push({
            type: MenuItemType.help,
            text: lst('了解如何使用视频'),
            url: window.shyConfig?.isUS ? "https://help.shy.live/page/1128#6qpZBQmUuiY2BZCisM66j1" : "https://help.shy.live/page/1128#6qpZBQmUuiY2BZCisM66j1"
        })
        if (this.editor) {
            items.push({
                type: MenuItemType.divide,
            });
            var r = await channel.get('/user/basic', { userid: this.editor });
            if (r?.data?.user) items.push({
                type: MenuItemType.text,
                text: lst('编辑人 ') + r.data.user.name
            });
            if (this.editDate) items.push({
                type: MenuItemType.text,
                text: lst('编辑于 ') + util.showTime(new Date(this.editDate))
            });
        }
        return items;
    }
    async onContextMenuInput(this: Block, item: MenuItem<BlockDirective | string>) {
        if (item?.name == 'autoplayMuted') {
            this.onUpdateProps({ autoplayMuted: item.checked }, { range: BlockRenderRange.self });
        }
    }
    async onClickContextMenu(item, event) {
        switch (item.name) {
            case 'replace':
                var r = await useVideoPicker({ roundArea: this.getVisibleBound() });
                if (r) {
                    await this.onSaveSize(r, false);
                }
                return;
            case 'origin':
                window.open(this.src?.url)
                return;
            case 'download':
                util.downloadFile(this.src?.url, (this.src?.filename) + (this.src.ext || '.mp4'))
                return;
            case 'align':
                await this.onUpdateProps({ align: item.value }, { range: BlockRenderRange.self })
                return;
            case 'mask':
                await this.onUpdateProps({ mask: item.value }, { range: BlockRenderRange.self })
                return;
            case 'autoplayMuted':
                await this.onUpdateProps({ autoplayMuted: this.autoplayMuted ? false : true }, { range: BlockRenderRange.self })
                return;
        }
        await super.onClickContextMenu(item, event);
    }
}
@view('/video')
export class VideoView extends BlockView<Video> {
    renderView() {
        var VC = lazy(() => import('./video'));
        return <div>
            <Suspense fallback={<Spin block></Spin>}>
                <VC block={this.block}></VC>
            </Suspense>
        </div>
    }
}

