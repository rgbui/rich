
import { Block } from "../../../../../src/block";
import { BlockView } from "../../../../../src/block/view";
import { BlockDirective, BlockDisplay } from "../../../../../src/block/enum";
import { url, view } from "../../../../../src/block/factory/observable";
import React from "react";
import { TableStore } from "..";
import { TableStoreHead } from "./head";
import { Icon } from "../../../../../component/view/icon";
import { FieldType } from "../../../schema/type";
import { useSelectMenuItem } from "../../../../../component/view/menu";
import { Rect } from "../../../../../src/common/vector/point";
import { MouseDragger } from "../../../../../src/common/dragger";
import { ActionDirective } from "../../../../../src/history/declare";
import { MenuItemType, MenuItemTypeValue } from "../../../../../component/view/menu/declare";
import loop from "../../../../../src/assert/svg/loop.svg";
import trash from "../../../../../src/assert/svg/trash.svg";
import duplicate from "../../../../../src/assert/svg/duplicate.svg";
import settings from "../../../../../src/assert/svg/settings.svg";
import filter from "../../../../../src/assert/svg/filter.svg";
import arrowDown from "../../../../../src/assert/svg/arrowDown.svg";
import arrowUp from "../../../../../src/assert/svg/arrowUp.svg";
import arrowLeft from "../../../../../src/assert/svg/arrowLeft.svg";
import arrowRight from "../../../../../src/assert/svg/arrowRight.svg";
import hide from "../../../../../src/assert/svg/hide.svg";
import { getTypeSvg } from "../../../schema/util";

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
                await this.tableStore.onSetSortField(index, -1)
                break;
            case BlockDirective.arrowUp:
                await this.tableStore.onSetSortField(index, 1)
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
                { name: BlockDirective.trun, icon: getTypeSvg(FieldType.text), text: '文本', param: FieldType.text },
                { name: BlockDirective.trun, icon: getTypeSvg(FieldType.bool), text: '待办', param: FieldType.bool },
                { name: BlockDirective.trun, icon: getTypeSvg(FieldType.number), text: '数字', param: FieldType.number },
                { name: BlockDirective.trun, icon: getTypeSvg(FieldType.date), text: '日期', param: FieldType.date },
                { name: BlockDirective.trun, icon: getTypeSvg(FieldType.email), text: '邮箱', param: FieldType.email },
                { name: BlockDirective.trun, icon: getTypeSvg(FieldType.phone), text: '手机号', param: FieldType.phone },
                { name: BlockDirective.trun, icon: getTypeSvg(FieldType.option), text: '选项', param: FieldType.option },
                { name: BlockDirective.trun, icon: getTypeSvg(FieldType.options), text: '多选', param: FieldType.options },
                { name: BlockDirective.trun, icon: getTypeSvg(FieldType.file), text: '文件', param: FieldType.file },
                { name: BlockDirective.trun, icon: getTypeSvg(FieldType.link), text: '链接', param: FieldType.link },
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
    get handleBlock(): Block {
        return this.parent.parent;
    }
}

@view('/tablestore/th')
export class TableStoreThView extends BlockView<TableStoreTh>{
    renderIcon() {
        return <Icon icon={getTypeSvg(this.block.field.field.type)} size='none'></Icon>
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
                data.width = self.block.field.colWidth;
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
                        field.colWidth = newWidth;
                        self.block.tableStore.updateArrayUpdate('fields', at, field);
                    })
                }
            }
        });
    }
    resizeEl: HTMLElement;
    render() {
        return <div className='sy-tablestore-head-th'
            style={{ width: this.block.field.colWidth + 'px' }}>
            <span className='sy-tablestore-head-th-icon' >{this.renderIcon()}</span>
            <span className="sy-tablestore-head-th-field">{this.block.field.text}</span>
            <Icon mousedown={e => e.stopPropagation()} click={e => this.mousedown(e)} className='sy-tablestore-head-th-operator' icon='elipsis:sy'></Icon>
            <div onMouseDown={e => this.mousedownResize(e)} ref={e => this.resizeEl = e} className='sy-tablestore-head-th-resize' ></div>
        </div>
    }
}