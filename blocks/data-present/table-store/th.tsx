import { Block } from "../../../src/block";
import { BlockView } from "../../../src/block/view";
import { BlockAppear, BlockDisplay } from "../../../src/block/enum";
import { url, view } from "../../../src/block/factory/observable";
import React from "react";
import { TextArea } from "../../../src/block/partial/appear";
import { TableStore } from "./table";
import { TextEle } from "../../../src/common/text.ele";
import { TableStoreHead } from "./head";
import { Icon } from "../../../component/icon";
import checkbox from "../../../src/assert/svg/types.checkbox.svg";
import select from "../../../src/assert/svg/types.select.svg";
import string from "../../../src/assert/svg/types.string.svg";
import multipleSelect from "../../../src/assert/svg/types.multiple.select.svg";
import file from "../../../src/assert/svg/types.file.svg";
import link from "../../../src/assert/svg/types.link.svg";
import number from "../../../src/assert/svg/types.number.svg";
import date from "../../../src/assert/svg/types.date.svg";
import email from "../../../src/assert/svg/types.email.svg";
import phone from "../../../src/assert/svg/types.phone.svg";
import person from "../../../src/assert/svg/types.person.svg";
import { FieldType } from "../schema/field.type";
import { useSelectMenuItem } from "../../../component/menu";
import { Rect } from "../../../src/common/point";
import { Dragger } from "../../../src/common/dragger";
import { ActionDirective } from "../../../src/history/declare";
@url('/tablestore/th')
export class TableStoreTh extends Block {
    appear = BlockAppear.text;
    display = BlockDisplay.block;
    name: string;
    partName = 'th';
    get field() {
        return this.tableStore.fields[this.at];
    }
    get tableStore(): TableStore {
        return (this.parent as TableStoreHead).tableStore;
    }
    get htmlContent() {
        return TextEle.getTextHtml(this.field.text)
    }
    get isCol() {
        return true;
    }
}
@view('/tablestore/th')
export class TableStoreThView extends BlockView<TableStoreTh>{
    renderIcon() {
        switch (this.block.field.type) {
            case FieldType.bool:
                return <Icon icon={checkbox} size='none'></Icon>
            case FieldType.option:
                return <Icon icon={select} size='none'></Icon>
            case FieldType.options:
                return <Icon icon={multipleSelect} size='none'></Icon>
            case FieldType.file:
                return <Icon icon={file} size='none'></Icon>
            case FieldType.link:
                return <Icon icon={link} size='none'></Icon>
            case FieldType.phone:
                return <Icon icon={phone} size='none'></Icon>
            case FieldType.email:
                return <Icon icon={email} size='none'></Icon>;
            case FieldType.date:
                return <Icon icon={date} size='none'></Icon>;
            case FieldType.users:
                return <Icon icon={person} size='none'></Icon>;
            case FieldType.text:
                return <Icon icon={string} size='none'></Icon>;
            case FieldType.number:
                return <Icon icon={number} size='none'></Icon>;
            default:
                return <Icon icon={string} size='none'></Icon>;
        }
    }
    async mousedown(e: MouseEvent) {
        e.stopPropagation();
        var rect = Rect.from((e.target as HTMLElement).getBoundingClientRect())
        var sr = await useSelectMenuItem({ roundArea: rect }, await this.block.onGetContextMenus());
        if (sr) {
            await this.block.onClickContextMenu(sr.item, sr.event);
        }
    }
    didMount() {
        this.dragger = new Dragger(this.resizeEl, 'col-resize');
        this.dragger.mousedown = (event) => {
            this.dragger.data.width = this.block.field.width;
            this.dragger.data.blocks = this.block.tableStore.getBlocksByField(this.block.field)
        };
        this.dragger.move = (from, to) => {
            var dx = to.x - from.x;
            var newWidth = this.dragger.data.width + dx;
            newWidth = Math.max(40, newWidth);
            (this.dragger.data.blocks as Block[]).each(block => {
                if (block.el) {
                    block.el.style.width = newWidth + 'px';
                }
            })
        }
        this.dragger.moveEnd = (from, to) => {
            var dx = to.x - from.x;
            var newWidth = this.dragger.data.width + dx;
            newWidth = Math.max(40, newWidth);
            (this.dragger.data.blocks as Block[]).each(block => {
                if (block.el) {
                    block.el.style.width = newWidth + 'px';
                }
            })
            this.block.tableStore.onAction(ActionDirective.onTablestoreUpdateViewField, async () => {
                var at = this.block.tableStore.fields.findIndex(g => g === this.block.field);
                var field = this.block.field.clone();
                field.width = newWidth;
                this.block.tableStore.updateArrayUpdate('fields', at, field);
            })
        }
        this.dragger.bind();
    }
    willUnmount() {
        this.dragger.off();
    }
    dragger: Dragger
    resizeEl: HTMLElement;
    render() {
        return <div className='sy-tablestore-head-th'
            style={{ width: this.block.field.width + 'px' }}>
            {this.renderIcon()}
            <TextArea html={this.block.htmlContent}></TextArea>
            <Icon mousedown={e => this.mousedown(e)} className='sy-tablestore-head-th-operator' icon='elipsis:sy'></Icon>
            <div ref={e => this.resizeEl = e} className='sy-tablestore-head-th-resize' ></div>
        </div>
    }
}