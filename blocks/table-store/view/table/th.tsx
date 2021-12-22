
import { Block } from "../../../../src/block";
import { BlockView } from "../../../../src/block/view";
import { BlockDirective, BlockDisplay } from "../../../../src/block/enum";
import { url, view } from "../../../../src/block/factory/observable";
import React from "react";
import { TableStore } from ".";
import { TableStoreHead } from "./head";
import { Icon } from "../../../../component/view/icon";
import checkbox from "../../../../src/assert/svg/types.checkbox.svg";
import select from "../../../../src/assert/svg/types.select.svg";
import string from "../../../../src/assert/svg/types.string.svg";
import multipleSelect from "../../../../src/assert/svg/types.multiple.select.svg";
import file from "../../../../src/assert/svg/types.file.svg";
import link from "../../../../src/assert/svg/types.link.svg";
import number from "../../../../src/assert/svg/types.number.svg";
import date from "../../../../src/assert/svg/types.date.svg";
import email from "../../../../src/assert/svg/types.email.svg";
import phone from "../../../../src/assert/svg/types.phone.svg";
import person from "../../../../src/assert/svg/types.person.svg";
import { FieldType } from "../../schema/field.type";
import { useSelectMenuItem } from "../../../../component/view/menu";
import { Rect } from "../../../../src/common/point";
import { MouseDragger } from "../../../../src/common/dragger";
import { ActionDirective } from "../../../../src/history/declare";
import { MenuItemType, MenuItemTypeValue } from "../../../../component/view/menu/declare";
import loop from "../../../../src/assert/svg/loop.svg";
import trash from "../../../../src/assert/svg/trash.svg";
import duplicate from "../../../../src/assert/svg/duplicate.svg";
import settings from "../../../../src/assert/svg/settings.svg";
import filter from "../../../../src/assert/svg/filter.svg";
import arrowDown from "../../../../src/assert/svg/arrowDown.svg";
import arrowUp from "../../../../src/assert/svg/arrowUp.svg";
import arrowLeft from "../../../../src/assert/svg/arrowLeft.svg";
import arrowRight from "../../../../src/assert/svg/arrowRight.svg";
import hide from "../../../../src/assert/svg/hide.svg";
import { FieldSort } from "./view.field";

@url('/tablestore/th')
export class TableStoreTh extends Block {
    display = BlockDisplay.block;
    name: string;
    partName = 'th';
    get field() {
        return this.tableStore.fields[this.at];
    }
    get fieldIndex() {
        return this.tableStore.fields.findIndex(g => g === this.field)
    }
    get tableStore(): TableStore {
        return (this.parent as TableStoreHead).tableStore;
    }
    get isCol() {
        return true;
    }
    async onClickContextMenu(item: MenuItemType<BlockDirective>, event: MouseEvent) {
        var index = this.fieldIndex;
        switch (item.name) {
            case BlockDirective.fieldSettings:
                break;
            case BlockDirective.arrowDown:
                await this.tableStore.onSetSortField(index, FieldSort.asc)
                break;
            case BlockDirective.arrowUp:
                await this.tableStore.onSetSortField(index, FieldSort.desc)
                break;
            case BlockDirective.arrowLeft:
                await this.tableStore.onAddField(event, index)
                break;
            case BlockDirective.arrowRight:
                await this.tableStore.onAddField(event, index + 1)
                break;
            case BlockDirective.filter:
                break;
            case BlockDirective.delete:
                await this.tableStore.onDeleteField(index);
                break;
            case BlockDirective.hide:
                await this.tableStore.onHideField(index);
                break;
            case BlockDirective.copy:
                await this.tableStore.onCopyField(index);
                break;
            case BlockDirective.trun:
                await this.tableStore.onTurnField(index, item.param as FieldType)
                break;
        }
    }
    async onGetContextMenus() {
        var items: MenuItemType<BlockDirective>[] = [];
        items.push({
            icon: loop,
            text: '切换',
            childs: [
                { type: MenuItemTypeValue.text, text: '基本' },
                { name: BlockDirective.trun, icon: string, text: '文本', param: FieldType.text },
                { name: BlockDirective.trun, icon: checkbox, text: '待办', param: FieldType.bool },
                { name: BlockDirective.trun, icon: number, text: '数字', param: FieldType.number },
                { name: BlockDirective.trun, icon: date, text: '日期', param: FieldType.date },
                { name: BlockDirective.trun, icon: email, text: '邮箱', param: FieldType.email },
                { name: BlockDirective.trun, icon: phone, text: '手机号', param: FieldType.phone },
                { name: BlockDirective.trun, icon: select, text: '选项', param: FieldType.option },
                { name: BlockDirective.trun, icon: multipleSelect, text: '多选', param: FieldType.options },
                { name: BlockDirective.trun, icon: file, text: '文件', param: FieldType.file },
                { name: BlockDirective.trun, icon: link, text: '链接', param: FieldType.link },
            ]
        });
        items.push({
            name: BlockDirective.fieldSettings,
            text: '配置',
            icon: settings
        });
        items.push({ type: MenuItemTypeValue.divide });
        items.push({
            name: BlockDirective.arrowDown,
            text: '降序',
            icon: arrowDown
        });
        items.push({
            name: BlockDirective.arrowUp,
            text: '升序',
            icon: arrowUp
        });
        items.push({
            name: BlockDirective.arrowLeft,
            text: '左边插入列',
            icon: arrowLeft
        });
        items.push({
            name: BlockDirective.arrowRight,
            text: '右边插入列',
            icon: arrowRight
        });
        items.push({ type: MenuItemTypeValue.divide });
        items.push({
            name: BlockDirective.filter,
            text: '筛选',
            icon: filter
        });
        items.push({
            name: BlockDirective.hide,
            text: '隐藏',
            icon: hide
        });
        items.push({ type: MenuItemTypeValue.divide });
        items.push({
            name: BlockDirective.delete,
            icon: trash,
            text: '删除'
        });
        items.push({
            name: BlockDirective.copy,
            text: '拷贝',
            icon: duplicate
        });
        return items;
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
    async mousedown(e: React.MouseEvent) {
        e.stopPropagation();
        var rect = Rect.from((e.target as HTMLElement).getBoundingClientRect())
        var sr = await useSelectMenuItem({ roundArea: rect }, await this.block.onGetContextMenus());
        if (sr) {
            await this.block.onClickContextMenu(sr.item, sr.event);
        }
    }
    async mousedownResize(e: React.MouseEvent) {
        e.stopPropagation();
        var self = this;
        MouseDragger<{ width: number, blocks: Block[] }>({
            event: e,
            dis: 5,
            moveStart(ev, data) {
                data.width = self.block.field.width;
                data.blocks = self.block.tableStore.getBlocksByField(self.block.field);
            },
            moving(ev, data, isEnd) {
                var dx = ev.clientX - e.clientX;
                var newWidth = data.width + dx;
                newWidth = Math.max(40, newWidth);
                (data.blocks as Block[]).each(block => {
                    if (block.el) {
                        block.el.style.width = newWidth + 'px';
                    }
                })
                if (isEnd) {
                    self.block.tableStore.onAction(ActionDirective.onTablestoreUpdateViewField, async () => {
                        var at = self.block.tableStore.fields.findIndex(g => g === self.block.field);
                        var field = self.block.field.clone();
                        field.width = newWidth;
                        self.block.tableStore.updateArrayUpdate('fields', at, field);
                    })
                }
            }
        });
    }
    resizeEl: HTMLElement;
    render() {
        return <div className='sy-tablestore-head-th'
            style={{ width: this.block.field.width + 'px' }}>
            <span className='sy-tablestore-head-th-icon' >{this.renderIcon()}</span>
            <span className="sy-tablestore-head-th-field">{this.block.field.text}</span>
            <Icon mousedown={e => e.stopPropagation()} click={e => this.mousedown(e)} className='sy-tablestore-head-th-operator' icon='elipsis:sy'></Icon>
            <div onMouseDown={e => this.mousedownResize(e)} ref={e => this.resizeEl = e} className='sy-tablestore-head-th-resize' ></div>
        </div>
    }
}