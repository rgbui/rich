import React, { CSSProperties } from "react";
import { Block } from "../../../src/block";
import { prop, url, view } from "../../../src/block/factory/observable";
import { BlockView } from "../../../src/block/view";
import { ResourceArguments } from "../../../extensions/icon/declare";
import { Icon } from "../../../component/view/icon";
import { DotsSvg, DownloadSvg, DuplicateSvg, LinkSvg, PicSvg, TrashSvg, UploadSvg } from "../../../component/svgs";
import { MouseDragger } from "../../../src/common/dragger";
import { useImagePicker } from "../../../extensions/image/picker";
import { Rect } from "../../../src/common/vector/point";
import { getImageSize } from "../../../component/file";
import { BlockDirective, BlockRenderRange } from "../../../src/block/enum";
import lodash from "lodash";
import { MenuItem, MenuItemType } from "../../../component/view/menu/declare";
import { util } from "../../../util/util";
import { MenuPanel, useSelectMenuItem } from "../../../component/view/menu";

/***
 * https://react-slick.neostack.com/
 */
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import "./style.less";
import { lst } from "../../../i18n/store";
import { S } from "../../../i18n/view";

@url('/carousel/image')
export class Carousel extends Block {
    @prop()
    srcs: {
        id: string,
        src: ResourceArguments,
        originSize: { width: number, height: number }
    }[] = [];
    @prop()
    align: 'left' | 'right' | 'center' = 'center';
    @prop()
    mask: 'rect' | 'circle' | 'radius' | 'rhombus' | 'pentagon' | "star" = 'rect';
    async addImage(e?: MouseEvent, oldSrc?: ResourceArguments) {
        var rect = e ? Rect.fromEvent(e) : this.getVisibleBound();
        var r = await useImagePicker({ roundArea: rect });
        if (r) {
            var imgSize = await getImageSize(r?.url);
            var srcs = lodash.cloneDeep(this.srcs);
            if (oldSrc) {
                var old = srcs.find(g => g.src.url == oldSrc.url);
                if (old) {
                    old.src = r;
                    old.originSize = imgSize;
                    await this.onUpdateProps({
                        srcs: srcs
                    }, { range: BlockRenderRange.self });
                    return;
                }
            }
            srcs.push({ id: util.guid(), src: r, originSize: imgSize })
            await this.onUpdateProps({
                srcs: srcs
            }, { range: BlockRenderRange.self });
        }
    }
    @prop()
    contentWidthPercent: number = 100;
    @prop()
    contentHeight = 200;
    @prop()
    autoCarousel: number = 2;

    async onGetContextMenus() {
        if (this.isFreeBlock) {
            return await this.onGetBoardContextMenus()
        }
        var items: MenuItem<BlockDirective | string>[] = [];
        items.push({
            name: BlockDirective.copy,
            text: '拷贝副本',
            label: "Ctrl+D",
            icon: DuplicateSvg
        });
        items.push({
            type: MenuItemType.divide
        });
        items.push({
            name: BlockDirective.link,
            text: lst('拷贝块链接'),
            icon: LinkSvg
        });
        items.push({
            type: MenuItemType.divide
        });
        items.push({
            text: lst("图片列表"),
            icon: { name: 'bytedance-icon', code: 'multi-picture-carousel' },
            childs: [
                ...(this.srcs.length > 0 ? [
                    {
                        type: MenuItemType.container,
                        drag: true,
                        name: 'srcs',
                        containerHeight: 200,
                        childs: [
                            ...this.srcs.map(v => {
                                return {
                                    name: 'srcItem',
                                    type: MenuItemType.drag,
                                    value: v,
                                    renderContent() {
                                        return <div className="gap-h-5 gap-l-5">
                                            <img className="w-80 h-80 border round obj-center" src={v.src?.url} />
                                        </div>
                                    },
                                    btns: [
                                        { icon: DotsSvg, name: 'property' }
                                    ]
                                }
                            })
                        ]
                    },
                    { type: MenuItemType.divide },
                ] : []),
                {
                    name: 'append',
                    type: MenuItemType.button,
                    text: lst('上传图片'),
                    icon: UploadSvg
                }
            ]
        });
        items.push({
            name: 'append',
            text: lst('添加图片'),
            icon: UploadSvg
        })
        items.push({
            type: MenuItemType.divide
        });
        items.push({
            text: lst('自动播放'),
            icon: { name: 'byte', code: 'play' },
            childs: [
                { name: "autoCarousel", text: '0.5s', value: 1, checkLabel: this.autoCarousel == 0.5 },
                { name: "autoCarousel", text: '1s', value: 1, checkLabel: this.autoCarousel == 1 },
                { name: "autoCarousel", text: '2s', value: 2, checkLabel: this.autoCarousel == 2 },
                { name: "autoCarousel", text: '5s', value: 5, checkLabel: this.autoCarousel == 5 },
                { name: "autoCarousel", text: '10s', value: 10, checkLabel: this.autoCarousel == 10 },
            ]
        })
        items.push({
            name: 'origin',
            text: lst('原图'),
            icon: { name: 'bytedance-icon', code: 'arrow-right-up' }
        });
        items.push({
            name: 'download',
            text: lst('下载'),
            icon: DownloadSvg
        });
        items.push({
            type: MenuItemType.divide
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
            name: BlockDirective.delete,
            icon: TrashSvg,
            text: lst('删除'),
            label: "Del"
        });
        return items;
    }
    async onClickContextMenu(item, event) {
        switch (item.name) {
            case 'append':
                this.addImage()
                return;
            case 'origin':
                for (let i = 0; i < this.srcs.length; i++)
                    window.open(this.srcs[i].src.url)
                return;
            case 'download':
                for (let i = 0; i < this.srcs.length; i++)
                    await util.downloadFile(this.srcs[i].src?.url, (this.srcs[i].src?.filename || (lst('图像') + (this.srcs[i].src.ext || '.jpg'))))
                return;
            case 'align':
                await this.onUpdateProps({ align: item.value }, { range: BlockRenderRange.self })
                return;
            case 'autoCarousel':
                await this.onUpdateProps({ autoCarousel: item.value }, { range: BlockRenderRange.self })
                return;
        }
        await super.onClickContextMenu(item, event);
    }
    async onContextMenuInput(item: MenuItem<string | BlockDirective>): Promise<void> {
        if (item.name == 'srcs') {
            var [from, to] = item.value;
            var ops = lodash.cloneDeep(this.srcs);
            var f = ops[from];
            ops.remove(g => g === f);
            ops.insertAt(to, f);
            await this.onUpdateProps({ srcs: ops }, { range: BlockRenderRange.self })
            return;
        }
        super.onContextMenuInput(item)
    }
    async onContextMenuClick(item: MenuItem<string | BlockDirective>, event: React.MouseEvent<Element, MouseEvent>, clickName: string, mp: MenuPanel<any>) {
        if (item.name == 'srcItem') {
            var rg = await useSelectMenuItem(
                { roundArea: Rect.fromEvent(event) },
                [
                    { name: 'replace', icon: UploadSvg, text: lst('替换') },
                    { type: MenuItemType.divide },
                    { name: 'download', icon: DownloadSvg, text: lst('下载') },
                    { name: 'origin', icon: { name: 'bytedance-icon', code: 'arrow-right-up' }, text: lst('原图') },
                    { type: MenuItemType.divide },
                    { name: 'delete', icon: TrashSvg, text: lst('删除') }
                ],
                { nickName: 'second' }
            );
            if (rg?.item) {
                if (rg?.item.name == 'delete') {
                    var srcs = lodash.cloneDeep(this.srcs);
                    lodash.remove(srcs, g => g.id && g.id == item.value.id || g.src && g.src.url == item.value.src.url)
                    await this.onUpdateProps({ srcs }, { range: BlockRenderRange.self })
                    mp.updateItems(await this.onGetContextMenus());
                }
                else if (rg?.item.name == 'origin') {
                    window.open(item.value.src.url);
                }
                else if (rg?.item.name == 'download') {
                    var sc = item.value
                    await util.downloadFile(sc.src?.url, sc.src?.filename || (lst('图像') + (sc.src.ext || '.jpg')))
                }
                else if (rg?.item.name == 'replace') {
                    this.addImage(event.nativeEvent, item.value.src)
                }
            }
        }
    }
    getVisibleContentBound() {
        var img = this.el.querySelector('.sy-block-embed-wrapper') as HTMLElement;
        if (img) {
            return Rect.fromEle(img);
        }
        return super.getVisibleContentBound();
    }
}
@view('/carousel/image')
export class CarouselView extends BlockView<Carousel>{
    onMousedown(event: React.MouseEvent, operator: 'bottom-left' | "bottom-right") {
        event.stopPropagation();
        var el = this.block.el;
        var bound = el.getBoundingClientRect();
        var self = this;
        MouseDragger<{ event: React.MouseEvent, realWidth: number, realHeight: number }>({
            event,
            moveStart(ev, data) {
                data.realWidth = self.imageWrapper.getBoundingClientRect().width;
                data.realHeight = self.imageWrapper.getBoundingClientRect().height;
                data.event = ev as any;
                self.forceUpdate();
            },
            moving(ev, data, isEnd) {
                var dy = ev.clientY - data.event.clientY;
                var height = data.realHeight + dy;
                height = Math.max(40, height);
                var dx = ev.clientX - data.event.clientX;
                if (operator == 'bottom-left') dx = -dx;
                var width: number;
                width = data.realWidth + dx * 2;
                width = Math.max(100, width);
                width = Math.min(bound.width, width);
                self.imageWrapper.style.width = width + "px";
                self.imageWrapper.style.height = height + "px";
                if (isEnd) {
                    var rw = width * 100 / bound.width;
                    rw = Math.ceil(rw);
                    self.block.onUpdateProps(
                        { contentWidthPercent: rw, contentHeight: height },
                        { range: BlockRenderRange.self }
                    );
                }
            }
        })
    }
    imageWrapper: HTMLDivElement;
    renderSlickImages() {
        var style: CSSProperties = {};
        style.height = this.block.contentHeight;
        style.width = '100%';
        style.objectFit = 'cover';
        style.objectPosition = '50% 50%';
        var self = this;
        const settings = {
            dots: true,
            infinite: true,
            speed: 500,
            autoplay: true,
            autoplaySpeed:this.block.autoCarousel * 1000,
            slidesToShow: 1,
            slidesToScroll: 1,
            pauseOnHover: true
        };
        return <div onMouseDown={e => { e.stopPropagation() }}><Slider {...settings}>{this.block.srcs.map((img, i) => {
            return <div key={i} ><img className="round" src={img.src?.url} style={style} /></div>
        })}</Slider></div>
    }
    renderView() {
        var style: CSSProperties = {
            justifyContent: 'center'
        }
        if (this.block.align == 'left') style.justifyContent = 'flex-start'
        else if (this.block.align == 'right') style.justifyContent = 'flex-end'
        style.width = '100%'
        return <div className='sy-block-embed' style={this.block.visibleStyle}>
            {this.block.srcs.length == 0 && <div onMouseDown={e => this.block.addImage(e.nativeEvent)} className='sy-block-file-nofile'>
                <Icon size={24} icon={PicSvg}></Icon>
                <span><S>添加图片</S></span>
            </div>}
            {this.block.srcs.length > 0 && <div className="flex flex-center" style={{
                ...style,
                ...this.block.contentStyle
            }}><div className='visible-hover sy-block-embed-wrapper'
                ref={e => this.imageWrapper = e}
                style={{
                    height: this.block.contentHeight,
                    width: this.block.contentWidthPercent ? this.block.contentWidthPercent + "%" : undefined
                }}>
                    {this.renderSlickImages()}
                    {this.block.isCanEdit() && <>
                        <div className="sy-block-resize-bottom-right visible" onMouseDown={e => this.onMousedown(e, 'bottom-right')}></div>
                        <div className="sy-block-resize-bottom-left visible" onMouseDown={e => this.onMousedown(e, 'bottom-left')}></div>
                        <div onMouseDown={e => {
                            e.stopPropagation();
                            this.block.onContextmenu(e.nativeEvent)
                        }} className="bg-dark cursor visible text-white pos-top-right gap-10 size-24 round flex-center ">
                            <Icon size={18} icon={DotsSvg}></Icon>
                        </div>
                    </>}
                </div></div>}
        </div>
    }
}