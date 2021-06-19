import { Block } from "../../src/block";
import { BlockView } from "../../src/block/view";
import { BlockAppear, BlockDisplay } from "../../src/block/partial/enum";
import { prop, url, view } from "../../src/block/factory/observable";
import React from "react";
import { TextArea } from "../../src/block/partial/appear";
import { TableStore } from "./table";
import { TextEle } from "../../src/common/text.ele";
import { TableStoreHead } from "./head";
import { TableMetaFieldType } from "./meta";
import { Icon } from "../../src/component/icon";
import checkbox from "../../src/assert/svg/types.checkbox.svg";
import select from "../../src/assert/svg/types.select.svg";
import string from "../../src/assert/svg/types.string.svg";
import multipleSelect from "../../src/assert/svg/types.multiple.select.svg";
import file from "../../src/assert/svg/types.file.svg";
import link from "../../src/assert/svg/types.link.svg";
import number from "../../src/assert/svg/types.number.svg";
import date from "../../src/assert/svg/types.date.svg";
import email from "../../src/assert/svg/types.email.svg";
import phone from "../../src/assert/svg/types.phone.svg";
import person from "../../src/assert/svg/types.person.svg";

@url('/tablestore/th')
export class TableStoreTh extends Block {
    appear = BlockAppear.text;
    display = BlockDisplay.block;
    name: string;
    partName = 'th';
    get col() {
        return this.tableStore.cols.find(g => g.name == this.name);
    }
    get metaCol() {
        return this.tableStore.meta.cols.find(g => g.name == this.name);
    }
    get tableStore(): TableStore {
        return (this.parent as TableStoreHead).tableStore;
    }
    get htmlContent() {
        return TextEle.getTextHtml(this.metaCol.text)
    }
    get isCol() {
        return true;
    }
}
@view('/tablestore/th')
export class TableStoreThView extends BlockView<TableStoreTh>{
    renderIcon() {
        switch (this.block.metaCol.type) {
            case TableMetaFieldType.checkbox:
                return <Icon icon={checkbox} size='none'></Icon>
            case TableMetaFieldType.select:
                return <Icon icon={select} size='none'></Icon>
            case TableMetaFieldType.multipleSelect:
                return <Icon icon={multipleSelect} size='none'></Icon>
            case TableMetaFieldType.file:
                return <Icon icon={file} size='none'></Icon>
            case TableMetaFieldType.url:
                return <Icon icon={link} size='none'></Icon>
            case TableMetaFieldType.phone:
                return <Icon icon={phone} size='none'></Icon>
            case TableMetaFieldType.email:
                return <Icon icon={email} size='none'></Icon>;
            case TableMetaFieldType.date:
                return <Icon icon={date} size='none'></Icon>;
            case TableMetaFieldType.users:
                return <Icon icon={person} size='none'></Icon>;
            case TableMetaFieldType.string:
                return <Icon icon={string} size='none'></Icon>;
            case TableMetaFieldType.number:
                return <Icon icon={number} size='none'></Icon>;
        }
    }
    render() {
        return <div className='sy-tablestore-head-th'
            style={{ width: this.block.col.width + 'px' }}>
            {this.renderIcon()}
            <TextArea html={this.block.htmlContent}></TextArea>
        </div>
    }
}