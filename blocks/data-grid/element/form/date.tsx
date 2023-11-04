
import dayjs from "dayjs";
import React from "react";
import { useDatePicker } from "../../../../extensions/date";
import { prop, url, view } from "../../../../src/block/factory/observable";
import { BlockView } from "../../../../src/block/view";
import { Rect } from "../../../../src/common/vector/point";
import { FieldView, OriginFormField } from "./origin.field";
import { MenuItem, MenuItemType } from "../../../../component/view/menu/declare";
import { BlockDirective, BlockRenderRange } from "../../../../src/block/enum";
import { lst } from "../../../../i18n/store";
import { Block } from "../../../../src/block";

@url('/form/date')
class FieldText extends OriginFormField {
    get dateString() {
        var v = this.value;
        if (!v) v = new Date();
        var r = dayjs(v);
        return r.format(this.dateFormat);
    }
    @prop()
    dateFormat: string = 'YYYY-MM-DD HH:mm';
    async onGetContextMenus(): Promise<MenuItem<string | BlockDirective>[]> {
        var items = await super.onGetContextMenus();
        var dateItems: MenuItem<BlockDirective | string>[] = [];
        var day = dayjs(new Date());
        dateItems.push(...[
            // {
            //     name: 'dateCustomFormat',
            //     type: MenuItemType.input,
            //     value: this.dateFormat || lst('YYYY年MM月DD日'),
            //     text: lst('编辑日期格式'),
            // },
            // { type: MenuItemType.divide },
            {
                name: 'dateFormat',
                text: lst('年月日'),
                value: lst('YYYY年MM月DD日'),
                label: day.format(lst('YYYY年MM月DD日'))
            },
            {
                name: 'dateFormat',
                text: lst('年月'),
                value: lst('YYYY年MM月'),
                label: day.format(lst('YYYY年MM月'))
            },
            {
                name: 'dateFormat',
                text: lst('月日'),
                value: lst('MM月DD日'),
                label: day.format(lst('MM月DD日'))
            },
            {
                name: 'dateFormat',
                text: lst('日期时间'),
                value: lst('YYYY/MM/DD HH:mm'),
                label: day.format(lst('YYYY/MM/DD HH:mm'))
            },
            {
                name: 'dateFormat',
                text: lst('时间'),
                value: 'HH:mm',
                label: day.format('HH:mm')
            }
        ]);
        items.push({
            type: MenuItemType.divide
        })
        items.push({
            text: lst('日期格式'),
            childs: dateItems,
            icon: { name: 'bytedance-icon', code: 'calendar-thirty' }
        });
        return items;
    }
    async onClickContextMenu(this: Block, item: MenuItem<string | BlockDirective>, event: MouseEvent): Promise<void> {
        if (item?.name == 'dateFormat') {
            await this.onUpdateProps({ dateFormat: item.value }, { range: BlockRenderRange.self })
        }
        else await super.onClickContextMenu(item, event);
    }
}

@view('/form/date')
class FieldTextView extends BlockView<FieldText>{
    async mousedown(event: React.MouseEvent) {
        event.stopPropagation();
        if (this.block.checkEdit() === false) return;
        var el = event.target as HTMLElement;
        var pickDate = await useDatePicker({ roundArea: Rect.from(el.getBoundingClientRect()) }, this.block.value);
        if (pickDate) {
            this.block.onChange(pickDate);
        }
    }
    renderView() {
        return <FieldView block={this.block}>
            {this.block.fieldType == 'doc-detail' && <div className="flex">{this.block.dateString}</div>}
            {this.block.fieldType != 'doc-detail' && <div className="sy-form-field-date-value flex text" onMouseDown={e => this.mousedown(e)}>{this.block.dateString}</div>}
        </FieldView>
    }
}