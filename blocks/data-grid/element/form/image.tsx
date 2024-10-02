import lodash from "lodash";
import React from "react";
import { DotsSvg, PlusSvg, TrashSvg, UploadSvg } from "../../../../component/svgs";
import { Icon } from "../../../../component/view/icon";
import { prop, url, view } from "../../../../src/block/factory/observable";
import { BlockView } from "../../../../src/block/view";
import { FieldView, OriginFormField } from "./origin.field";
import { S } from "../../../../i18n/view";
import { Tip } from "../../../../component/view/tooltip/tip";
import { util } from "../../../../util/util";
import { MenuItem, MenuItemType } from "../../../../component/view/menu/declare";
import { lst } from "../../../../i18n/store";
import { BlockDirective, BlockRenderRange } from "../../../../src/block/enum";
import { useSelectMenuItem } from "../../../../component/view/menu";
import { Rect } from "../../../../src/common/vector/point";
import { useImageFilePicker } from "../../../../extensions/file/image.picker";
import { PopoverPosition } from "../../../../component/popover/position";
import { autoImageUrl } from "../../../../net/element.type";
import { SliderView } from "../../../../component/view/slick";
import { Block } from "../../../../src/block";

@url('/form/image')
class FormFieldImage extends OriginFormField {

    @prop()
    multipleNav: 'bottom' | 'left' | 'right' | 'none' = 'bottom';
    @prop()
    border: 'border' | 'none' = 'border';
    @prop()
    imageWidthPercent: number = 70;
    async uploadFile(pos: PopoverPosition, img?: any) {
        if (this.checkEdit() === false) return;
        var r = await useImageFilePicker(pos);
        if (r) {
            var vs = util.covertToArray(this.value);
            if (img) {
                var at = vs.indexOf(img);
                vs[at] = r;
            }
            else {
                if (this.field?.config?.isMultiple !== true) vs = [];
                vs.push(r);
            }
            this.onChange(vs);
        }
    }

    async onGetContextMenus() {
        var items = await super.onGetContextMenus();
        var newItems = [];
        if (this.fromType == 'doc-detail') {
            newItems.push({ type: MenuItemType.divide })
            newItems.push({
                name: 'border',
                type: MenuItemType.switch,
                checked: this.border == 'none' ? false : true,
                text: lst('边框'),
                icon: { name: "byte", code: 'rectangle-one' }
            });
            if (this.field?.config?.isMultiple) {
                newItems.push({
                    text: lst('导航'),
                    type: MenuItemType.select,
                    name: 'multipleNav',
                    icon: { name: "bytedance-icon", code: 'more-two' },
                    value: this.multipleNav,
                    options: [
                        { text: lst('无'), value: 'none', icon: { name: 'byte', code: 'rectangle-one' } },
                        { text: lst('底部'), value: 'bottom', icon: { name: 'byte', code: 'down-square' } },
                        { text: lst('左边'), value: 'left', icon: { name: 'byte', code: 'left-square' } },
                        { text: lst('右边'), value: 'right', icon: { name: 'byte', code: 'right-square' } }
                    ]
                });
            }
            newItems.push({ type: MenuItemType.divide })
        }
        var at = items.findIndex(c => c.name == 'hidePropTitle' || c.name == 'required');
        items.splice(at - 1, 0, ...newItems);
        return items;
    }

    async onContextMenuInput(item: MenuItem<BlockDirective | string>) {
        if (item?.name == 'required') {
            await this.onUpdateProps({ [item?.name]: item.checked }, { range: BlockRenderRange.self });
        }
        else if (item?.name == 'multipleNav') {
            await this.onUpdateProps({ multipleNav: item.value }, { range: BlockRenderRange.self });
        }
        else if (item?.name == 'border') {
            await this.onUpdateProps({ border: item.checked ? 'border' : 'none' }, { range: BlockRenderRange.self });
        }
        else if (item?.name == 'allowRemark') {
            await this.onUpdateProps({ [item?.name]: item.checked }, { range: BlockRenderRange.self });
        }
        else await super.onContextMenuInput(item);
    }
    async onClickContextMenu(this: Block, item: MenuItem<BlockDirective | string>, event: MouseEvent): Promise<void> {
        if (item?.name == 'multipleNav') {
            await this.onUpdateProps({ multipleNav: item.value }, { range: BlockRenderRange.self });
        }
        else await super.onClickContextMenu(item, event);
    }
}

@view('/form/image')
class FormFieldImageView extends BlockView<FormFieldImage> {
    deleteImage(img, event: React.MouseEvent) {
        var vs = util.covertToArray(this.block.value)
        lodash.remove(vs, g => g == img);
        this.block.onChange(vs);
    }
    async openProperty(img, event: React.MouseEvent) {
        var pos = { roundArea: Rect.fromEvent(event) }
        var r = await useSelectMenuItem(pos, [
            { text: lst('替换'), icon: UploadSvg, name: 'replace' },
            { type: MenuItemType.divide },
            { text: lst('移除'), icon: TrashSvg, name: 'remove' }
        ]);
        if (r) {
            if (r.item.name == 'replace') {
                await this.block.uploadFile(pos, img);
            }
            else {
                this.deleteImage(img, event);
            }
        }
    }
    sdd: any;
    renderDetail(images: { url: string }[]) {
        var settings = {
            arrows: true,
            dots: false,
            infinite: true,
            speed: 500,
            slidesToShow: 1,
            slidesToScroll: 1,
        };
        var sd = <div className={'round ' + (this.block.border == 'border' ? "border-light" : "border-light-hover")}> <SliderView ref={e => this.sdd = e} {...settings}>
            {images.map((img, i) => {
                return <div
                    className={"relative visible-hover"}
                    key={i}>
                    <img src={autoImageUrl(img.url, 900)} className={"obj-center     round"} />
                </div>
            })}
        </SliderView></div>
        return <div className={"gap-w-10"}>
            {images.length > 0 && <div>
                {this.block.multipleNav == 'none' && { sd }}
                {this.block.multipleNav == 'bottom' && <div>
                    <div>{sd}</div>
                    <div className="flex r-gap-r-10 gap-h-10">
                        {images.map((img, i) => {
                            return <div
                                onMouseDown={e => {
                                    console.log(this.sdd, i);
                                    if (this.sdd) this.sdd.slickGoTo(i)
                                }}
                                className={"relative visible-hover round padding-10 item-hover " + (this.block.border == 'border' ? "border-light" : "border-light-hover")}
                                key={i}>
                                <img src={autoImageUrl(img.url, 120)} style={{ width: 100, height: 60 }}  className={"obj-center  round " + (this.block.border == 'border' ? "border-light" : "border-light-hover")} />
                            </div>
                        })}
                    </div>
                </div>}
                {this.block.multipleNav == 'left' && <div className="flex flex-top">
                    <div style={{ width: 140 }} className="flex-fixed gap-r-10 r-gap-b-10">
                        {images.map((img, i) => {
                            return <div
                                onMouseDown={e => {
                                    if (this.sdd) this.sdd.slickGoTo(i)
                                }}
                                className={"relative visible-hover round padding-10 item-hover " + (this.block.border == 'border' ? "border-light" : "border-light-hover")}
                                key={i}>
                                <img src={autoImageUrl(img.url, 120)} style={{ width: 120, height: 60 }} className={"obj-center  round " + (this.block.border == 'border' ? "border-light" : "border-light-hover")} />
                            </div>
                        })}
                    </div>
                    <div style={{
                        width: 'calc(100% - 140px)'
                    }} className="flex-auto">
                        <div> {sd}</div>
                    </div>
                </div>}
                {this.block.multipleNav == 'right' && <div className="flex flex-top">
                    <div style={{
                        width: 'calc(100% - 140px)'
                    }} className="flex-auto">{sd}</div>
                    <div style={{ width: 140 }} className="flex-fixed gap-l-10 r-gap-b-10">
                        {images.map((img, i) => {
                            return <div
                                onMouseDown={e => {
                                    if (this.sdd) this.sdd.slickGoTo(i)
                                }}
                                className={"relative visible-hover round padding-10 item-hover " + (this.block.border == 'border' ? "border-light" : "border-light-hover")}
                                key={i}>
                                <img src={autoImageUrl(img.url, 120)} style={{ width: 120, height: 60 }} className={"obj-center  round " + (this.block.border == 'border' ? "border-light" : "border-light-hover")} />
                            </div>
                        })}
                    </div>
                </div>}
            </div>}
            {images.length == 0 && <div className={"f-14 min-h-30 cursor f-14 flex  remark"}>{<S>空内容</S>}</div>}
        </div>
    }
    renderFormField(images: { url: string }[]) {
        var settings = {
            arrows: true,
            dots: false,
            infinite: true,
            speed: 500,
            slidesToShow: 1,
            slidesToScroll: 1,
        };
        return <div className={this.block.fromType == 'doc-add' ? "" : "gap-w-10"}>
            {images.map((img, i) => {
                return <div
                    className={"relative visible-hover   gap-b-10 " + (images.length > 1 || this.isCanPlus() ? "gap-r-10 " : "")}
                    key={i}>
                    {this.block.fromType != 'doc-detail' && <Tip text='属性'><span
                        onClick={e => this.openProperty(img, e)}
                        className="pos-top-right flex-center size-20  bg-dark-1 text-white round cursor visible">
                        <Icon size={16} icon={DotsSvg}></Icon>
                    </span></Tip>}
                    <img src={img.url} className={"obj-center " + (" size-120 round")} />
                </div>
            })}
            {this.isCanPlus() && <div className={"flex " + (images.length == 0 ? "" : "visible")}><span className="item-hover-light-focus item-hover round padding-w-5 f-12   cursor flex text-1" onClick={e => this.block.uploadFile({ roundArea: Rect.fromEvent(e) })}><Icon icon={PlusSvg}></Icon><span ><S>添加图片</S></span></span></div>}
        </div>
    }
    renderFieldImages(images: { url: string }[]) {
        return <div className={"flex flex-top flex-wrap " + (this.block.fromType == 'doc-add' ? "" : "gap-w-10")}>
            {images.map((img, i) => {
                return <div
                    className={"relative visible-hover   gap-b-10 " + (images.length > 1 || this.isCanPlus() ? "gap-r-10 " : "")}
                    key={i}>
                    {this.block.fromType != 'doc-detail' && <Tip text='属性'><span
                        onClick={e => this.openProperty(img, e)}
                        className="pos-top-right flex-center size-20  bg-dark-1 text-white round cursor visible">
                        <Icon size={16} icon={DotsSvg}></Icon>
                    </span></Tip>}
                    <img src={img.url} className={"obj-center " + (" size-120 round")} />
                </div>
            })}
            {this.isCanPlus() && <Tip text='添加图片'><div onClick={e => this.block.uploadFile({ roundArea: Rect.fromEvent(e) })} className={" dashed cursor round flex-center size-80 item-hover-light-focus item-hover " + (images.length == 0 ? " " : "visible")}>
                <span className="item-hover size-24 circle flex-center cursor"> <Icon className={'text-1'} size={18} icon={PlusSvg}></Icon></span>
            </div></Tip>}
        </div>
    }
    isCanPlus() {
        var vs = Array.isArray(this.block.value) ? this.block.value : (this.block.value ? [this.block.value] : []);
        if (!this.block.field?.config?.isMultiple && vs.length > 1) vs = [vs.first()]
        return (vs.length < 1 || this.block.field?.config?.isMultiple) && this.block.fromType != 'doc-detail'
    }
    renderView() {
        var vs = Array.isArray(this.block.value) ? this.block.value : (this.block.value ? [this.block.value] : []);
        if (!this.block.field?.config?.isMultiple && vs.length > 1) vs = [vs.first()]
        return <FieldView block={this.block} className={'visible-hover'}>
            {this.block.fromType == 'doc-detail' && this.renderDetail(vs)}
            {this.block.fromType == 'doc-add' && this.renderFormField(vs)}
            {this.block.fromType == 'doc' && this.renderFieldImages(vs)}
        </FieldView>
    }
}