import { BlockView } from "../../src/block/view";
import { prop, url, view } from "../../src/block/factory/observable";
import React, { CSSProperties } from 'react';
import { BlockDirective, BlockDisplay, BlockRenderRange } from "../../src/block/enum";
import { TextArea } from "../../src/block/view/appear";
import { Point, Rect } from "../../src/common/vector/point";
import { ResourceArguments } from "../../extensions/icon/declare";
import { Block } from "../../src/block";
import { MouseDragger } from "../../src/common/dragger";
import { Icon } from "../../component/view/icon";
import { useImagePicker } from "../../extensions/image/picker";
import { getImageSize } from "../../component/file";
import { channel } from "../../net/channel";
import { autoImageUrl } from "../../net/element.type";
import { util } from "../../util/util";
import { AlignTextCenterSvg, DotsSvg, DownloadSvg, DuplicateSvg, Edit1Svg, GlobalLinkSvg, ImageErrorSvg, LinkSvg, PicSvg, PlusSvg, RefreshSvg, TrashSvg } from "../../component/svgs";
import { Spin } from "../../component/view/spin";
import { MenuItem, MenuItemType } from "../../component/view/menu/declare";
import { MenuItemView } from "../../component/view/menu/item";
import { useImageViewer } from "../../component/view/image.preview";
import { BlockUrlConstant } from "../../src/block/constant";
import { lst } from "../../i18n/store";
import { S } from "../../i18n/view";
import { PageLink } from "../../extensions/link/declare";
import { LinkPageItem, getPageIcon } from "../../src/page/declare";
import { useLinkPicker } from "../../extensions/link/picker";
import { MenuPanel } from "../../component/view/menu";
import { UA } from "../../util/ua";
import "./style.less";

@url('/image')
export class Image extends Block {
    @prop()
    src: ResourceArguments;

    @prop()
    imageWidthPercent: number = 70;

    @prop()
    imageSizeMode: "none" | '100%' | '50%' | '150%' = 'none'
    @prop()
    caption: string = '';
    @prop()
    allowCaption: boolean = false;
    @prop()
    captionAlign: 'left' | 'center' = 'center';
    @prop()
    originSize: { width: number, height: number } = null;
    @prop()
    align: 'left' | 'right' | 'center' = 'center';
    @prop()
    mask: 'rect' | 'circle' | 'radius' | 'rhombus' | 'pentagon' | "star" = 'rect';
    display = BlockDisplay.block;
    speed = '';
    @prop()
    link: PageLink = null;
    async onOpenUploadImage(event: React.MouseEvent) {
        var r = await useImagePicker({ roundArea: Rect.fromEvent(event) });
        if (r) {
            await this.onSaveImageSize(r, false);
        }
    }
    get appearAnchors() {
        if (this.src?.name != 'none') return this.__appearAnchors;
        return [];
    }
    async onSaveImageSize(d: { url?: string }, merge: boolean) {
        var imgSize = await getImageSize(d?.url);
        var width = this.el.getBoundingClientRect().width;
        var per = Math.min(70, parseInt((imgSize.width * 100 / width).toString()));
        per = Math.max(30, per);
        this.speed = '';
        if (((this.view as any) as ImageView)) {
            ((this.view as any) as ImageView).isLoadError = false;
            ((this.view as any) as ImageView).errorUrl = ''
        }
        await this.onUpdateProps({
            imageWidthPercent: per,
            originSize: imgSize,
            imageSizeMode: 'none',
            src: { ...d }
        }, { range: BlockRenderRange.self, merge });

    }
    async didMounted() {
        try {
            await this.onBlockReloadData(async () => {
                if (this.createSource == 'InputBlockSelector' && !this.link) {
                    var r = await useImagePicker({ roundArea: Rect.fromEle(this.el) });
                    if (r) {
                        await this.onSaveImageSize(r, true);
                    }
                    delete this.createSource;
                }
                if (this.initialData && this.initialData.file) {
                    this.speed = '0%';
                    this.view.forceUpdate();
                    var d = await channel.post('/ws/upload/file', {
                        file: this.initialData.file,
                        uploadProgress: (event) => {
                            if (event.lengthComputable) {
                                this.speed = `${util.byteToString(event.total)}  ${(100 * event.loaded / event.total).toFixed(2)}%`;
                                this.forceManualUpdate();
                            }
                        }
                    });
                    if (d.ok && d.data?.file?.url) {
                        await this.onSaveImageSize(d.data?.file, true);
                    }
                    this.initialData = {};
                }
                if (this.initialData && this.initialData.url) {
                    var d = await channel.post('/ws/download/url', { url: this.initialData.url });
                    if (d.ok && d.data?.file?.url) {
                        await this.onSaveImageSize(d.data?.file, true);
                    }
                    this.initialData = {};
                }
            })
        }
        catch (ex) {
            console.error(ex);
        }
    }
    getResolveContent() {
        return lst('图片')
    }
    getVisibleContentBound() {
        var img = this.el.querySelector('.sy-block-image-content-view-wrapper img') as HTMLElement;
        if (img) {
            return Rect.fromEle(img);
        }
        return super.getVisibleContentBound();
    }
    addBlockSelect() {
        var el = this.el.querySelector('.sy-block-image-content-view-wrapper');
        if (el) {
            el.classList.add('shy-block-selected');
            return el as HTMLElement;
        }
        return this.el;
    }
    get contentEl() {
        var el = this.el.querySelector('.sy-block-image-content-view-wrapper') as HTMLElement;
        if (el) return el;
        return this.el;
    }
    async getMd() {
        return `![${this.caption || lst('图片')}](${this.src?.url})`;
    }
    async onGetContextMenus() {
        if (this.isFreeBlock) {
            return await this.onGetBoardContextMenus()
        }
        var rc = (item: MenuItem<string>, view?: MenuItemView) => {
            return <span className="flex-inline flex-center size-20"><span style={{ border: '1px solid var(--text-color)' }} className="round w-10 h-12 inline-block"></span></span>
        }
        var pageLink: LinkPageItem;
        if (this.link?.pageId) {
            var pa = await channel.get('/page/item', { id: this.link.pageId });
            if (pa?.ok) { pageLink = pa.data.item; }
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
            text: lst('图片操作'),
            icon: { name: 'byte', code: 'write' },
            childs: [

                {
                    text: lst('尺寸'),
                    icon: { name: 'bytedance-icon', code: 'full-screen' },
                    childs: [
                        {
                            name: 'resetSize50',
                            text: '50%',
                            value: '50%',
                            icon: { name: 'bytedance-icon', code: 'zoom-out' },
                            checkLabel: this.imageSizeMode == '50%'
                        },
                        {
                            name: 'resetSize',
                            text: lst('原图大小'),
                            icon: { name: 'bytedance-icon', code: 'equal-ratio' },
                            value: '100%',
                            checkLabel: this.imageSizeMode == '100%'
                        },
                        {
                            name: 'resetSize50',
                            text: '150%',
                            value: '150%',
                            icon: { name: 'bytedance-icon', code: 'zoom-in' },
                            checkLabel: this.imageSizeMode == '150%'
                        },
                        {
                            name: 'autoSize',
                            text: lst('自适应'),
                            icon: { name: 'bytedance-icon', code: 'auto-width-one' },
                        }
                    ]
                },
                {
                    name: 'allowCaption',
                    text: lst('添加说明文字'),
                    icon: { name: 'bytedance-icon', code: 'doc-detail' },
                    type: MenuItemType.switch,
                    checked: this.allowCaption,
                    updateMenuPanel: true,
                    disabled: this.src?.url ? false : true
                },
                {
                    visible: (items) => {
                        var r = items.find(g => g.name == 'allowCaption');
                        return r?.checked
                    },
                    name: 'captionAlign',
                    icon: AlignTextCenterSvg,
                    text: lst('说明文字居中'),
                    type: MenuItemType.switch,
                    checked: this.captionAlign == 'center',
                    disabled: this.src?.url ? false : true
                },

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
                    checkLabel: this.mask == 'rect'
                },
                {
                    name: 'mask',
                    renderIcon: rc,
                    text: lst('圆角'),
                    value: 'radius',
                    checkLabel: this.mask == 'radius'
                },
                {
                    name: 'mask',
                    icon: {
                        name: 'bytedance-icon',
                        code: 'oval-one'
                    },
                    text: lst('圆'),
                    value: 'circle',
                    checkLabel: this.mask == 'circle'
                },
                {
                    name: 'mask',
                    icon: { name: 'bytedance-icon', code: 'diamond-three' },
                    text: lst('菱形'),
                    value: 'rhombus',
                    checkLabel: this.mask == 'rhombus'
                },
                {
                    name: 'mask',
                    icon: { name: 'bytedance-icon', code: 'pentagon-one' },
                    text: lst('五边形'),
                    value: 'pentagon',
                    checkLabel: this.mask == 'pentagon'
                },
                {
                    name: 'mask',
                    icon: { name: 'bytedance-icon', code: 'star' },
                    text: lst('星形'),
                    value: 'star',
                    checkLabel: this.mask == 'star'
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
        items.push(...[
            {
                name: 'preview',
                text: lst('查看'),
                icon: { name: 'bytedance-icon', code: "zoom-in" } as any,
                disabled: this.src?.url ? false : true
            },
            {
                name: 'origin',
                text: lst('原图'),
                icon: { name: 'bytedance-icon', code: 'arrow-right-up' } as any,
                disabled: this.src?.url ? false : true
            }, {
                name: 'replace',
                text: lst('替换'),
                icon: RefreshSvg
            },
            {
                name: 'download',
                text: lst('下载'),
                icon: DownloadSvg,
                disabled: this.src?.url ? false : true
            }
        ]);
        items.push({
            type: MenuItemType.divide
        });
        items.push({
            text: lst('添加链接...'),
            icon: { name: 'bytedance-icon', code: 'link-two' },
            name: this.link ? undefined : "imageLink",
            childs: this.link ? [
                {
                    name: 'imageLink',
                    text: pageLink?.text || this.link?.url,
                    value: pageLink,
                    icon: pageLink ? getPageIcon(pageLink) : GlobalLinkSvg,
                    btns: [{ icon: Edit1Svg, name: 'editImageLink' }]
                }
            ] : undefined,
            disabled: this.src?.url ? false : true
        })
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
            text: lst('了解如何使用图片'),
            url: window.shyConfig?.isUS ? "https://help.shy.live/page/43#uYGXg2kxrBEe3FsLiP4fUm" : "https://help.shy.live/page/43#uYGXg2kxrBEe3FsLiP4fUm"
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
    async onClickContextMenu(item, event) {
        switch (item.name) {
            case 'replace':
                var r = await useImagePicker({ roundArea: this.getVisibleBound() });
                if (r) {
                    await this.onSaveImageSize(r, false);
                }
                return;
            case 'origin':
                window.open(this.src?.url)
                return;
            case 'download':
                await util.downloadFile(this.src?.url, (this.src?.filename) || (this.caption || lst('图像')) + (this.src.ext || '.jpg'));
                return;
            case 'align':
                await this.onUpdateProps({ align: item.value }, { range: BlockRenderRange.self })
                return;
            case 'mask':
                await this.onUpdateProps({ mask: item.value }, { range: BlockRenderRange.self })
                return;
            case 'resetSize':
                var imgSize = this.originSize || (await getImageSize(this.src?.url));
                var width = this.el.getBoundingClientRect().width;
                var per = Math.min(100, parseInt((imgSize.width * 100 / width).toString()));
                per = Math.max(5, per);
                await this.onUpdateProps({
                    imageWidthPercent: per,
                    originSize: imgSize,
                    imageSizeMode: item.value,
                }, { range: BlockRenderRange.self });
                return;
            case 'resetSize50':
                var imgSize = this.originSize || (await getImageSize(this.src?.url));
                var width = this.el.getBoundingClientRect().width;
                var n = item.vaue == '150%' ? 150 : 50;
                var per = Math.min(100, parseInt((imgSize.width * n / width).toString()));
                per = Math.max(5, per);
                await this.onUpdateProps({
                    imageWidthPercent: per,
                    originSize: imgSize,
                    imageSizeMode: item.value,
                }, { range: BlockRenderRange.self });
                break;
            case 'autoSize':
                await this.onUpdateProps({
                    imageWidthPercent: 70,
                    imageSizeMode: 'none'
                }, { range: BlockRenderRange.self });
                return;
            case 'preview':
                this.openPreview()
                return;
            case 'imageLink':
                var rgc = await useLinkPicker({ roundArea: Rect.fromEle(this.el) }, {
                }, { allowCreate: false });
                if (rgc) {
                    var link = Array.isArray(rgc.refLinks) ? rgc.refLinks[0] : rgc.link;
                    await this.onUpdateProps({ link: link }, { range: BlockRenderRange.self });
                }
                return;
        }
        await super.onClickContextMenu(item, event);
    }
    async openPreview() {
        var pics = this.page.findAll(g => g.url == BlockUrlConstant.Image).map(g => (g as Image).src)
        await useImageViewer(this.src, pics);
    }
    async onContextMenuInput(item: MenuItem<string | BlockDirective>): Promise<void> {
        if (item.name == 'allowCaption') {
            await this.onUpdateProps({ allowCaption: item.checked }, { range: BlockRenderRange.self });
            await util.delay(50);
            this.page.kit.anchorCursor.onFocusBlockAnchor(this, { last: true, merge: true });
            return;
        }
        else if (item.name == 'captionAlign') {
            await this.onUpdateProps({ captionAlign: item.checked ? 'center' : 'left' }, { range: BlockRenderRange.self });
        }
        return super.onContextMenuInput(item);
    }
    async onContextMenuBtnClick(item: MenuItem<string | BlockDirective>, event: React.MouseEvent<Element, MouseEvent>, clickName: string, mp: MenuPanel<any>) {
        if (item.name == 'imageLink') {
            var r = await useLinkPicker({ roundArea: Rect.fromEvent(event) }, {
                url: this.link?.url,
                pageId: this.link?.pageId,
                text: (item?.value as PageLink)?.text
            }, { allowCreate: false });
            if (r) {
                var link = Array.isArray(r.refLinks) ? r.refLinks[0] : r.link;
                await this.onUpdateProps({ link: link }, { range: BlockRenderRange.self });
                mp.updateItems(await this.onGetContextMenus())
            }
        }
    }
    getVisibleHandleCursorPoint(): Point {
        var el = this.el.querySelector('.sy-block-image-content-view-wrapper') as HTMLElement;
        if (el) {
            return Rect.fromEle(el).leftTop.move(0, 10);
        }
        return super.getVisibleHandleCursorPoint();
    }
}

@view('/image')
export class ImageView extends BlockView<Image> {
    errorUrl: string;
    isLoadError: boolean = false;
    onError(e: React.SyntheticEvent<HTMLImageElement, Event>) {
        this.isLoadError = true;
        this.errorUrl = this.block.src?.url;
        this.forceUpdate();
    }
    onMousedown(event: React.MouseEvent, operator: 'left' | "right") {
        event.stopPropagation();
        var el = this.block.el;
        var bound = el.getBoundingClientRect();
        var self = this;
        MouseDragger<{ event: React.MouseEvent, realWidth: number }>({
            event,
            moveStart(ev, data) {
                data.realWidth = self.imageWrapper.getBoundingClientRect().width;
            },
            moving: (ev, data, isEnd) => {
                var dx = ev.clientX - event.clientX;
                var width: number;
                if (operator == 'right') width = data.realWidth + dx * 2;
                else width = data.realWidth - dx * 2;
                width = Math.max(30, width);
                width = Math.min(bound.width, width);
                self.imageWrapper.style.width = width + "px";
                if (isEnd) {
                    var rw = width * 100 / bound.width;
                    rw = Math.ceil(rw);
                    self.block.onUpdateProps({ imageWidthPercent: rw, imageSizeMode: 'none' });
                }
            }
        })
    }
    mousedown(event: React.MouseEvent) {
        if (this.block.link) {
            if (this.block.link.url) {
                window.open(this.block.link.url)
                event.stopPropagation();
            }
            else if (this.block.link.pageId) {
                event.stopPropagation();
                channel.act('/page/open', { item: this.block.link.pageId })
            }
        }
    }
    imageWrapper: HTMLDivElement;
    renderEmptyImage() {
        if (this.block.speed) {
            return <div className="sy-block-image-empty flex f-14">
                <Spin size={16}></Spin>
                <span className="gap-l-5"><S>上传中</S>:<i >{this.block.speed}</i></span>
            </div>
        }
        return <div className='sy-block-image-empty item-hover cursor' onMouseDown={e => this.block.onOpenUploadImage(e)}>
            <Icon size={16} icon={PicSvg}></Icon>
            <span><S>添加图片</S></span>
        </div>
    }
    renderImage() {
        var style: CSSProperties = {
            justifyContent: 'center'
        }
        if (this.block.align == 'left') style.justifyContent = 'flex-start'
        else if (this.block.align == 'right') style.justifyContent = 'flex-end'
        var captionStyle: CSSProperties = {
            justifyContent: 'center'
        }
        if (this.block.captionAlign == 'left') captionStyle.justifyContent = 'flex-start'
        var imageMaskStyle: CSSProperties = {}
        if (this.block.mask == 'radius') imageMaskStyle.borderRadius = '10%';
        else if (this.block.mask == 'circle') {
            imageMaskStyle.borderRadius = '50%';
        }
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
        var wStyle = {
            width: this.block.imageWidthPercent ? this.block.imageWidthPercent + "%" : undefined
        }
        if (this.block.imageSizeMode != 'none') {
            if (this.block.originSize?.width) {
                var n = parseFloat(this.block.imageSizeMode.replace('%', '')) * this.block.originSize.width / 100;
                wStyle.width = n + 'px';
            }
        }
        return <>{this.isLoadError && <div className='sy-block-image-error flex r-gap-r-10 text-1'>
            <Icon className={'flex-fixed'} icon={ImageErrorSvg}></Icon>
            <span className="f-14 flex-auto"><S>图片</S>{this.errorUrl}<S>加载失败</S></span>
            {this.block.isCanEdit() && <span className="f-14 flex-fixed link cursor" onMouseDown={e => this.block.onOpenUploadImage(e)}><S>重新添加图片</S></span>}
        </div>}
            {!this.isLoadError && <div className='sy-block-image-content-view flex-center' style={style}>
                <div className='sy-block-image-content-view-wrapper visible-hover' ref={e => this.imageWrapper = e} style={wStyle}>
                    {this.block.src.name != 'none' && <img
                        draggable={false}
                        className={this.block.link?.url || this.block?.link?.pageId ? "cursor" : ""}
                        onMouseDown={e => { this.mousedown(e) }}
                        style={imageMaskStyle} onError={e => this.onError(e)}
                        src={autoImageUrl(this.block?.src?.url, this.block.originSize?.width > 1200 ? 1200 : undefined)}
                    />}
                    {this.block.isCanEdit() && <>
                        <div className='sy-block-image-left-resize' onMouseDown={e => this.onMousedown(e, 'left')}></div>
                        <div className='sy-block-image-right-resize' onMouseDown={e => this.onMousedown(e, 'right')}></div>
                        <div onMouseDown={e => {
                            e.stopPropagation();
                            this.block.onContextmenu(e.nativeEvent)
                        }} className="bg-dark cursor visible text-white pos-top-right gap-10 size-24 round flex-center ">
                            <Icon size={18} icon={DotsSvg}></Icon>
                        </div>
                    </>}
                    {this.block.allowCaption && <div className='sy-block-image-caption flex' style={captionStyle}>
                        {<TextArea block={this.block} prop='content' placeholderEmptyVisible placeholder={'图片描述'}></TextArea>}
                    </div>}
                </div>
            </div>}
        </>
    }
    renderView() {
        return <div className='sy-block-image' style={this.block.visibleStyle} >
            <div className='sy-block-image-content' >
                {!this.block?.src && this.block.isCanEdit() && this.renderEmptyImage()}
                {this.block?.src && this.renderImage()}
            </div>
            {this.renderComment()}
        </div>
    }
}