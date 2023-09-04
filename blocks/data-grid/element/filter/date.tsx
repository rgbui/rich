import dayjs from "dayjs";
import React from "react";
import { CloseSvg, SwitchArrowSvg } from "../../../../component/svgs";
import { Icon } from "../../../../component/view/icon";
import { useDatePicker } from "../../../../extensions/date";
import { url, view } from "../../../../src/block/factory/observable";
import { BlockView } from "../../../../src/block/view";
import { Rect } from "../../../../src/common/vector/point";
import { util } from "../../../../util/util";
import { SchemaFilter } from "../../schema/declare";
import { OriginFilterField, OriginFilterFieldView } from "./origin.field";
import { S } from "../../../../i18n/view";

@url('/field/filter/date')
export class FilterFieldDate extends OriginFilterField {
    startDate: Date;
    endDate: Date;
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
    get format() {
        var fr = 'YYYY-MM-DD';
        if (this.field?.config?.includeTime) fr = 'YYYY-MM-DD HH:mm';
        return fr;
    }
    get filters(): SchemaFilter[] {
        var rs: SchemaFilter[] = [];
        if (this.field?.config?.includeTime) {
            if (this.startDate) {
                rs.push({
                    field: this.field.name,
                    operator: "$gte",
                    value: this.startDate
                })
            }
            if (this.endDate) {
                rs.push({
                    field: this.field.name,
                    operator: "$lte",
                    value: this.endDate
                })
            }
            return rs;
        }
        else {
            var sd: Date;
            if (this.startDate) {
                sd = util.dateToStart(this.startDate)
            }
            var ed: Date;
            if (this.endDate) {
                ed = util.dateToStart(this.endDate)
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
                    operator: "$gte",
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
}
@view('/field/filter/date')
export class FilterFieldDateView extends BlockView<FilterFieldDate>{
    renderView() {
        return <div style={this.block.visibleStyle}><OriginFilterFieldView style={this.block.contentStyle} filterField={this.block}>
            <div className="flex-line flex round relative" style={{
                height: 28,
                width: '100%',
                boxShadow: 'rgba(15, 15, 15, 0.1) 0px 0px 0px 1px inset',
                background: 'rgba(242, 241, 238, 0.6)',
                borderRadius: 4,
                lineHeight: '26px'
            }}>
                <span className="cursor gap-l-10" onMouseDown={e => this.block.openDatePicker('startDate', e)}>{this.block.startDate ? dayjs(this.block.startDate).format(this.block.format) : <em className="remark f-14"><S>起始日期</S></em>}</span>
                <em className="remark gap-w-5 flex-center h-20"><Icon size={16} icon={SwitchArrowSvg}></Icon></em>
                <span className="cursor" onMouseDown={e => this.block.openDatePicker('endDate', e)}>{this.block.endDate ? dayjs(this.block.endDate).format(this.block.format) : <em className="remark f-14"><S>结束日期</S></em>}</span>
                <span style={{ display: this.block.startDate || this.block.endDate ? "flex" : 'none' }} onMouseDown={e => this.block.onClear()} className="pos-right-full flex-center gap-r-5" >
                    <span className="size-16 flex-center cursor circle item-hover"><Icon size={12} icon={CloseSvg}></Icon></span>
                </span>
            </div>
        </OriginFilterFieldView></div>
    }
}