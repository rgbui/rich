import lodash from "lodash";
import React from "react";
import { OpenFileDialoug } from "../../../../component/file";
import { CloseSvg } from "../../../../component/svgs";
import { Button } from "../../../../component/view/button";
import { Icon } from "../../../../component/view/icon";
import { channel } from "../../../../net/channel";
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

@url('/form/image')
class FormFieldImage extends OriginFormField {
    @prop()
    imageFormat?: { display: 'thumb' | 'auto', multipleDisplay: "tile" | 'carousel' } = {
        display: 'thumb',
        multipleDisplay: 'tile'
    }
    async uploadFile(event: React.MouseEvent) {
        if (this.checkEdit() === false) return;
        var exts = ['image/*'];
        var file = await OpenFileDialoug({ exts });
        if (file) {
            var r = await channel.post('/ws/upload/file', {
                file,
                uploadProgress: (event) => {
                    console.log(event, 'ev');
                }
            })
            if (r.ok) {
                if (r.data.file) {
                    var vs = util.covertToArray(this.value);
                    if (this.field?.config?.isMultiple === true)
                        vs = [];
                    vs.push(r.data.file);
                    this.onChange(vs);
                    this.forceUpdate();
                }
            }
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
            options: [{ text: '缩略图', value: 'thumb' }, { text: '自适应', value: 'auto' }]
        });
        if (this.field?.config?.isMultiple) {
            newItems.push({
                text: lst('多张图片展示'),
                type: MenuItemType.select,
                name: 'imageFormat.multipleDisplay',
                icon: { name: "bytedance-icon", code: 'more-two' },
                value: this.imageFormat?.multipleDisplay,
                options: [{ text: '平铺', value: 'tile' }, { text: '滚动', value: 'carousel' }]
            });
        }
        newItems.push({ type: MenuItemType.divide })
        items.splice(3, 0, ...newItems);
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
    renderImages(images: { url: string }[]) {
        if (this.block.field?.config?.isMultiple == true || this.block.imageFormat?.multipleDisplay == 'carousel') {
            var settings = {
                autoplay: true,
                renderCenterLeftControls: () => <></>,
                renderCenterRightControls: () => <></>
            };
            return <div>
                <Slick  {...settings}>
                    {
                        images.map((img, i) => {
                            return <div
                                className={"border round flex-center relative gap-r-10 gap-b-10 visible-hover round " + (this.block?.imageFormat?.display == 'thumb' ? " size-80 " : " w-200")}
                                key={i}>
                                {this.block.fieldType != 'doc-detail' && <Tip text='移除图片'><span
                                    onClick={e => this.deleteImage(img, e)}
                                    className="pos-top-right flex-center size-16  bg-dark-1 text-white circle cursor visible">
                                    <Icon size={8} icon={CloseSvg}></Icon>
                                </span></Tip>}
                                <img src={img.url} className={"max-w100 obj-center" + (this.block?.imageFormat?.display == 'thumb' ? "  max-h100" : " ")} />
                            </div>
                        })
                    }
                </Slick>
            </div>
        }
        return images.map((img, i) => {
            return <div
                className={"border round flex-center relative gap-r-10 gap-b-10 visible-hover round " + (this.block?.imageFormat?.display == 'thumb' ? " size-80 " : " w-200")}
                key={i}>
                {this.block.fieldType != 'doc-detail' && <Tip text='移除图片'><span
                    onClick={e => this.deleteImage(img, e)}
                    className="pos-top-right flex-center size-16  bg-dark-1 text-white circle cursor visible">
                    <Icon size={8} icon={CloseSvg}></Icon>
                </span></Tip>}
                <img src={img.url} className={"max-w100 obj-center" + (this.block?.imageFormat?.display == 'thumb' ? "  max-h100" : " ")} />
            </div>
        })
    }
    renderView() {
        var vs = Array.isArray(this.block.value) ? this.block.value : (this.block.value ? [this.block.value] : []);
        if (!this.block.field?.config?.isMultiple && vs.length > 1) vs = [vs.first()]
        return <FieldView block={this.block}>
            <div className="sy-form-field-image-value gap-h-10" >
                {vs.length > 0 && <div className="flex">
                    {this.renderImages(vs)}
                </div>}
                {(vs.length < 2 || this.block.field?.config?.isMultiple) && this.block.fieldType != 'doc-detail' && <Button size="small" ghost onClick={e => this.block.uploadFile(e)}><S>上传图片</S></Button>}
            </div>
        </FieldView>
    }
}