
import dayjs from "dayjs";
import React from "react";
import { useDatePicker } from "../../../../extensions/date";
import { prop, url, view } from "../../../../src/block/factory/observable";
import { BlockView } from "../../../../src/block/view";
import { Rect } from "../../../../src/common/vector/point";
import { FieldView, OriginFormField } from "./origin.field";
import { MenuItem, MenuItemType } from "../../../../component/view/menu/declare";
import { BlockDirective, BlockRenderRange } from "../../../../src/block/enum";
import { ls, lst } from "../../../../i18n/store";
import { Block } from "../../../../src/block";
import { DateInput } from "../../../../extensions/date/input";
import lodash from "lodash";
import { S } from "../../../../i18n/view";
import { BackgroundColorList, FontColorList, GetTextCacheFontColor } from "../../../../extensions/color/data";
import { UA } from "../../../../util/ua";
import { BlockcolorSvg } from "../../../../component/svgs";

@url('/form/date')
class FieldText extends OriginFormField {
    get dateString() {
        var v = this.value;
        if (!(v && v instanceof Date)) return '';
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
        var at = items.findIndex(c => c.name == 'hidePropTitle' || c.name == 'required');
        items.splice(at - 1, 0,
            { type: MenuItemType.divide },
            {
                text: lst('日期格式'),
                childs: dateItems,
                icon: { name: 'bytedance-icon', code: 'calendar-thirty' }
            }, { type: MenuItemType.divide })
        if (this.fromType == 'doc-detail') {
            var lastFontItems: any[] = [];
            var lastColor = await GetTextCacheFontColor();
            if (lastColor) {
                lastFontItems.push({
                    text: lst('上次颜色'),
                    type: MenuItemType.text,
                    label: UA.isMacOs ? "⌘+Shift+H" : "Ctrl+Shift+H"
                });
                lastFontItems.push({
                    type: MenuItemType.color,
                    name: lastColor.name == 'font' ? 'fontColor' : 'fillColor',
                    block: ls.isCn ? false : true,
                    options: [
                        {
                            text: '',
                            value: lastColor.color
                        }
                    ]
                });
            }
            items.splice(at+4, 0,{
                text: lst('颜色'),
                icon: BlockcolorSvg,
                name: 'color',
                childs: [
                    ...lastFontItems,
                    {
                        text: lst('文字颜色'),
                        type: MenuItemType.text
                    },
                    {
                        name: 'fontColor',
                        type: MenuItemType.color,
                        block: ls.isCn ? false : true,
                        options: FontColorList().map(f => {
                            return {
                                text: f.text,
                                overlay: f.text,
                                value: f.color,
                                checked: lodash.isEqual(this.pattern?.getFontStyle()?.color, f.color) ? true : false
                            }
                        })
                    },
                    {
                        type: MenuItemType.divide
                    },
                    {
                        text: lst('背景颜色'),
                        type: MenuItemType.text
                    },
                    {
                        type: MenuItemType.color,
                        name: 'fillColor',
                        block: ls.isCn ? false : true,
                        options: BackgroundColorList().map(f => {
                            return {
                                text: f.text,
                                value: f.color,
                                checked: this.pattern?.getFillStyle()?.color == f.color ? true : false
                            }
                        })
                    },
                ]
            });
        }
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
class FieldTextView extends BlockView<FieldText> {
    renderDetail() {
        return <div style={this.block.contentStyle} className={" " + (this.block.dateString ? "" : 'f-14 remark')}>{this.block.dateString || <S>空内容</S>}</div>
    }
    renderForm() {
        return <DateInput value={this.block.value} onChange={e => { this.block.onChange(e) }}></DateInput>
    }
    renderField() {
        return <div className="min-h-30 item-hover-light padding-w-10 round  flex  text" onMouseDown={e => this.mousedown(e)}>{this.block.dateString}</div>
    }
    async mousedown(event: React.MouseEvent) {
        event.stopPropagation();
        if (this.block.checkEdit() === false) return;
        var hover = this.block.el.querySelector('.item-hover-light');
        try {
            if (hover) hover.classList.add('item-hover-light-focus')
            var el = event.target as HTMLElement;
            var pickDate = await useDatePicker({ roundArea: Rect.from(el.getBoundingClientRect()) }, this.block.value);
            if (!lodash.isUndefined(pickDate)) {
                this.block.onChange(pickDate);
            }
        }
        catch (ex) {

        }
        finally {
            if (hover)
                hover.classList.remove('item-hover-light-focus')
        }
    }
    renderView() {
        return <FieldView block={this.block}>
            {this.block.fromType == 'doc-detail' && this.renderDetail()}
            {this.block.fromType == 'doc-add' && this.renderForm()}
            {this.block.fromType == 'doc' && this.renderField()}
        </FieldView>
    }
}