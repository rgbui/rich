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
import { Slick } from "../../../../component/view/slick";
import { MenuItem, MenuItemType } from "../../../../component/view/menu/declare";
import { lst } from "../../../../i18n/store";
import { BlockDirective, BlockRenderRange } from "../../../../src/block/enum";
import { useSelectMenuItem } from "../../../../component/view/menu";
import { Rect } from "../../../../src/common/vector/point";
import { useImageFilePicker } from "../../../../extensions/file/image.picker";
import { PopoverPosition } from "../../../../component/popover/position";

@url('/form/image')
class FormFieldImage extends OriginFormField {
    @prop()
    imageFormat?: { display: 'thumb' | 'auto', multipleDisplay: "tile" | 'carousel' } = {
        display: 'thumb',
        multipleDisplay: 'tile'
    }
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
            this.forceUpdate();
        }
    }
    async onGetContextMenus() {
        var items = await super.onGetContextMenus();
        var newItems = [];
        newItems.push({
            text: lst('图片展示'),
            type: MenuItemType.select,
            name: 'imageFormat.display',
            value: this.imageFormat?.display,
            icon: { name: 'bytedance-icon', code: 'picture-one' },
            options: [{ text: lst('缩略图'), value: 'thumb' }, { text: lst('自适应'), value: 'auto' }]
        });
        if (this.field?.config?.isMultiple) {
            newItems.push({
                text: lst('多张图片展示'),
                type: MenuItemType.select,
                name: 'imageFormat.multipleDisplay',
                icon: { name: "bytedance-icon", code: 'more-two' },
                value: this.imageFormat?.multipleDisplay,
                options: [{ text: lst('平铺'), value: 'tile' }, { text: lst('滚轮'), value: 'carousel' }]
            });
        }
        newItems.push({ type: MenuItemType.divide })
        items.splice(2, 0, ...newItems);
        return items;
    }
    async onContextMenuInput(item: MenuItem<BlockDirective | string>) {
        if (item?.name == 'required') {
            this.onUpdateProps({ [item?.name]: item.checked }, { range: BlockRenderRange.self });
        }
        else if (item?.name == 'allowRemark') {
            this.onUpdateProps({ [item?.name]: item.checked }, { range: BlockRenderRange.self });
        }
        if (item?.name == 'imageFormat.display' || item?.name == 'imageFormat.multipleDisplay') {
            var d = lodash.cloneDeep(this.imageFormat);
            if (item.name == 'imageFormat.display') d.display = item.value;
            else d.multipleDisplay = item.value;
            await this.onUpdateProps({ imageFormat: d }, { range: BlockRenderRange.self })
        }
    }
}

@view('/form/image')
class FormFieldImageView extends BlockView<FormFieldImage>{
    deleteImage(img, event: React.MouseEvent) {
        var vs = util.covertToArray(this.block.value)
        lodash.remove(vs, g => g == img);
        this.block.onChange(vs);
        this.forceUpdate();
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
                await this.deleteImage(img, event);
            }
        }
    }
    renderImages(images: { url: string }[]) {
        var isCarousel = this.block.imageFormat?.multipleDisplay == 'carousel';
        if (images.length == 1) isCarousel = false;
        if (images.length == 0 && this.block.fieldType == 'doc-detail') return <div className="f-14 remark"><S>空内容</S></div>
        if (isCarousel) {
            var settings = {
                autoplay: true,
                renderCenterLeftControls: () => <></>,
                renderCenterRightControls: () => <></>
            };
            return <div className={this.block.fieldType == 'doc-add' ? "" : "gap-w-10"}>
                <Slick  {...settings}>
                    {images.map((img, i) => {
                        return <div
                            className={"relative visible-hover"}
                            key={i}>
                            {this.block.fieldType != 'doc-detail' && <Tip text='属性'><span
                                onClick={e => this.openProperty(img, e)}
                                className="pos-top-right flex-center size-20  bg-dark-1 text-white round cursor visible">
                                <Icon size={16} icon={DotsSvg}></Icon>
                            </span></Tip>}
                            <img src={img.url} className={"obj-center " + (this.block?.imageFormat?.display == 'thumb' ? " size-100 round" : "max-w100 max-w-300  max-h-300  round")} />
                        </div>
                    })}
                </Slick>
                {this.isCanPlus() && <div className={"flex " + (images.length == 0 ? "" : "visible")}><span className="item-hover-light-focus item-hover round padding-w-5 f-12   cursor flex text-1" onClick={e => this.block.uploadFile({ roundArea: Rect.fromEvent(e) })}><Icon icon={PlusSvg}></Icon><span ><S>添加图片</S></span></span></div>}
            </div>
        }
        else {
            return <div className={"flex flex-top " + (this.block.fieldType == 'doc-add' ? "" : "gap-w-10")}>
                {images.map((img, i) => {
                    return <div
                        className={"relative visible-hover   gap-b-10 " + (images.length > 1 || this.isCanPlus() ? "gap-r-10 " : "")}
                        key={i}>
                        {this.block.fieldType != 'doc-detail' && <Tip text='属性'><span
                            onClick={e => this.openProperty(img, e)}
                            className="pos-top-right flex-center size-20  bg-dark-1 text-white circle cursor visible">
                            <Icon size={16} icon={DotsSvg}></Icon>
                        </span></Tip>}
                        <img src={img.url} className={"obj-center " + (this.block?.imageFormat?.display == 'thumb' ? " size-80 round" : "max-w100 max-w-300  max-h-300  round")} />
                    </div>
                })}
                {this.isCanPlus() && <Tip text='添加图片'><div onClick={e => this.block.uploadFile({ roundArea: Rect.fromEvent(e) })} className={" dashed cursor round flex-center size-80 item-hover-light-focus item-hover " + (images.length == 0 ? " " : "visible")}>
                    <span className="item-hover size-24 circle flex-center cursor"> <Icon className={'text-1'} size={18} icon={PlusSvg}></Icon></span>
                </div></Tip>}
            </div>
        }
    }
    isCanPlus() {
        var vs = Array.isArray(this.block.value) ? this.block.value : (this.block.value ? [this.block.value] : []);
        if (!this.block.field?.config?.isMultiple && vs.length > 1) vs = [vs.first()]
        return (vs.length < 1 || this.block.field?.config?.isMultiple) && this.block.fieldType != 'doc-detail'
    }
    renderView() {
        var vs = Array.isArray(this.block.value) ? this.block.value : (this.block.value ? [this.block.value] : []);
        if (!this.block.field?.config?.isMultiple && vs.length > 1) vs = [vs.first()]
        return <FieldView block={this.block} className={'visible-hover'}>
            {this.renderImages(vs)}
        </FieldView>
    }
}