import dayjs from "dayjs";
import React from "react";
import { CloseSvg, SwitchArrowSvg } from "../../../../component/svgs";
import { Icon } from "../../../../component/view/icon";
import { useDatePicker } from "../../../../extensions/date";
import { prop, url, view } from "../../../../src/block/factory/observable";
import { BlockView } from "../../../../src/block/view";
import { Rect } from "../../../../src/common/vector/point";
import { util } from "../../../../util/util";
import { SchemaFilter } from "../../schema/declare";
import { OriginFilterField, OriginFilterFieldView } from "./origin.field";
import { S } from "../../../../i18n/view";
import { SelectBox } from "../../../../component/view/select/box";
import { lst } from "../../../../i18n/store";
import { MenuItem, MenuItemType } from "../../../../component/view/menu/declare";
import { SelectButtons } from "../../../../component/view/button/select";
import { BlockDirective, BlockRenderRange } from "../../../../src/block/enum";

@url('/field/filter/date')
export class FilterFieldDate extends OriginFilterField {
    startDate: Date;
    endDate: Date;
    @prop()
    filterType: 'dateRange' | 'dateSelect' | 'dateButtons' = 'dateRange';
    async openDatePicker(key: string, event: React.MouseEvent) {
        event.stopPropagation();
        var el = event.currentTarget as HTMLElement;
        var rect = Rect.from(el.parentElement.getBoundingClientRect())
        var pickDate = await useDatePicker({ roundArea: rect }, this[key], {
            includeTime: this.field?.config?.includeTime ? true : false
        });
        if (typeof pickDate != 'undefined') {
            this[key] = pickDate;
            if (this.refBlock) this.refBlock.onSearch()
            this.forceUpdate()
        }
    }
    dateSelectValue: '' | 'today' | 'yesterday' | 'tomorrow' | 'thisWeek' | 'lastWeek' | 'nextWeek' | 'thisMonth' | 'lastMonth' | 'nextMonth' | 'thisYear' | 'lastYear' | 'nextYear' = ''
    get format() {
        var fr = 'YYYY-MM-DD';
        if (this.field?.config?.includeTime) fr = 'YYYY-MM-DD HH:mm';
        return fr;
    }
    get filters(): SchemaFilter[] {
        var rs: SchemaFilter[] = [];
        var s: Date;
        var e: Date;
        if (this.filterType == 'dateRange') {
            s = this.startDate;
            e = this.endDate;
        }
        else {
            if (this.dateSelectValue == 'today') {
                s = new Date();
                e = new Date()
            }
            else if (this.dateSelectValue == 'yesterday') {
                s = dayjs(new Date()).subtract(1, 'day').toDate();
                e = new Date()
            }
            else if (this.dateSelectValue == 'tomorrow') {
                s = new Date();
                e = dayjs(new Date()).add(1, 'day').toDate();
            }
            else if (this.dateSelectValue == 'thisWeek') {
                s = dayjs(new Date()).startOf('week').toDate();
                e = dayjs(new Date()).endOf('week').toDate();
            }
            else if (this.dateSelectValue == 'lastWeek') {
                s = dayjs(new Date()).subtract(1, 'week').startOf('week').toDate();
                e = dayjs(new Date()).subtract(1, 'week').endOf('week').toDate();
            }
            else if (this.dateSelectValue == 'nextWeek') {
                s = dayjs(new Date()).add(1, 'week').startOf('week').toDate();
                e = dayjs(new Date()).add(1, 'week').endOf('week').toDate();
            }
            else if (this.dateSelectValue == 'thisMonth') {
                s = dayjs(new Date()).startOf('month').toDate();
                e = dayjs(new Date()).endOf('month').toDate();
            }
            else if (this.dateSelectValue == 'lastMonth') {
                s = dayjs(new Date()).subtract(1, 'month').startOf('month').toDate();
                e = dayjs(new Date()).subtract(1, 'month').endOf('month').toDate();
            }
            else if (this.dateSelectValue == 'nextMonth') {
                s = dayjs(new Date()).add(1, 'month').startOf('month').toDate();
                e = dayjs(new Date()).add(1, 'month').endOf('month').toDate();
            }
            else if (this.dateSelectValue == 'thisYear') {
                s = dayjs(new Date()).startOf('year').toDate();
                e = dayjs(new Date()).endOf('year').toDate();
            }
            else if (this.dateSelectValue == 'lastYear') {
                s = dayjs(new Date()).subtract(1, 'year').startOf('year').toDate();
                e = dayjs(new Date()).subtract(1, 'year').endOf('year').toDate();
            }
            else if (this.dateSelectValue == 'nextYear') {
                s = dayjs(new Date()).add(1, 'year').startOf('year').toDate();
                e = dayjs(new Date()).add(1, 'year').endOf('year').toDate();
            }
        }
        if (this.field?.config?.includeTime) {
            if (s) {
                rs.push({
                    field: this.field.name,
                    operator: "$gte",
                    value: s
                })
            }
            if (e) {
                rs.push({
                    field: this.field.name,
                    operator: "$lte",
                    value: e
                })
            }
            return rs;
        }
        else {
            var sd: Date;
            if (s) {
                sd = util.dateToStart(s)
            }
            var ed: Date;
            if (e) {
                ed = util.dateToStart(e)
            }
            if (sd) {
                rs.push({
                    field: this.field.name,
                    operator: "$gte",
                    value: sd
                })
            }
            if (ed) {
                rs.push({
                    field: this.field.name,
                    operator: "$lte",
                    value: ed
                })
            }
            return rs;
        }
    }
    onClear() {
        this.startDate = null;
        this.endDate = null;
        if (this.refBlock) this.refBlock.onSearch()
        this.forceUpdate()
    }
    async onGetContextMenus() {
        var rs = await super.onGetContextMenus();
        var pos = rs.findIndex(g => g.name == 'fieldTextDisplay');
        var ns: MenuItem<string | BlockDirective>[] = [];
        ns.push({ type: MenuItemType.divide });
        ns.push({
            name: 'filterType',
            text: lst('日期类型'),
            type: MenuItemType.select,
            value: this.filterType,
            icon: { name: 'bytedance-icon', code: 'config' },
            options: [
                { text: lst('范围日期'), value: 'dateRange' },
                { text: lst('固定选择'), value: 'dateSelect' },
                { text: lst('固定分组'), value: 'dateButtons' },
            ]
        })
        rs.splice(pos + 1, 0, ...ns)
        return rs;
    }
    async onContextMenuInput(item: MenuItem<string | BlockDirective>): Promise<void> {
        switch (item.name) {
            case 'filterType':
                this.onUpdateProps({ [item.name]: item.value }, { range: BlockRenderRange.self })
                return;
        }
        super.onContextMenuInput(item)
    }
}

@view('/field/filter/date')
export class FilterFieldDateView extends BlockView<FilterFieldDate>{
    renderView() {
        var dateOptions = [
            { text: lst('不限'), value: '' },
            { type: MenuItemType.divide },
            { text: lst('今天'), value: 'today' },
            { text: lst('昨天'), value: 'yesterday' },
            { text: lst('明天'), value: 'tomorrow' },
            { type: MenuItemType.divide },
            { text: lst('本周'), value: 'thisWeek' },
            { text: lst('上周'), value: 'lastWeek' },
            { text: lst('下周'), value: 'nextWeek' },
            { type: MenuItemType.divide },
            { text: lst('本月'), value: 'thisMonth' },
            { text: lst('上月'), value: 'lastMonth' },
            { text: lst('下月'), value: 'nextMonth' },
            { type: MenuItemType.divide },
            { text: lst('今年'), value: 'thisYear' },
            { text: lst('去年'), value: 'lastYear' },
            // { text: lst('来年'), value: 'nextYear' },
        ]
        return <div style={this.block.visibleStyle}><OriginFilterFieldView style={this.block.contentStyle} filterField={this.block}>
            {this.block.filterType == 'dateButtons' && <div>
                <SelectButtons value={this.block.dateSelectValue} onChange={e => {
                    this.block.dateSelectValue = e;
                    if (this.block.refBlock) this.block.refBlock.onSearch()
                    this.forceUpdate()
                }} options={dateOptions.filter(g => g?.type != MenuItemType.divide) as any}></SelectButtons>
            </div>}
            {this.block.filterType == 'dateSelect' && <SelectBox inline border options={dateOptions} value={this.block.dateSelectValue} onChange={e => {
                this.block.dateSelectValue = e;
                if (this.block.refBlock) this.block.refBlock.onSearch()
                this.forceUpdate()
            }}></SelectBox>}
            {this.block.filterType == 'dateRange' && <div className="flex-line flex round relative visible-hover" style={{
                height: 28,
                width: '100%',
                boxShadow: 'rgba(15, 15, 15, 0.1) 0px 0px 0px 1px inset',
                background: '#fff',
                // background: 'rgba(242, 241, 238, 0.6)',
                borderRadius: 4,
                lineHeight: '26px'
            }}>
                <span className="cursor gap-l-10 flex-fixed f-14" onMouseDown={e => this.block.openDatePicker('startDate', e)}>{this.block.startDate ? dayjs(this.block.startDate).format(this.block.format) : <em className="remark f-14"><S>起始日期</S></em>}</span>
                <em className="remark gap-w-5 flex-center h-20 flex-fixed"><Icon size={16} icon={SwitchArrowSvg}></Icon></em>
                <span className="cursor flex-fixed f-14" onMouseDown={e => this.block.openDatePicker('endDate', e)}>{this.block.endDate ? dayjs(this.block.endDate).format(this.block.format) : <em className="remark f-14"><S>结束日期</S></em>}</span>
                <span style={{ display: this.block.startDate || this.block.endDate ? "flex" : 'none' }} onMouseDown={e => this.block.onClear()} className="pos-right-full flex-center gap-r-5 visible" >
                    <span className="size-20 flex-center cursor circle item-hover"><Icon size={12} icon={CloseSvg}></Icon></span>
                </span>
            </div>}
        </OriginFilterFieldView></div>
    }
}