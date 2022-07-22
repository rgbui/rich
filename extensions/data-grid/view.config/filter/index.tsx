import React from "react";
import { ReactNode } from "react";
import { FieldType } from "../../../../blocks/data-grid/schema/type";
import { DataGridView } from "../../../../blocks/data-grid/view/base";
import { EventsComponent } from "../../../../component/lib/events.component";
import { Divider } from "../../../../component/view/grid";
import { Icon } from "../../../../component/view/icon";
import "./style.less";
import { Input } from "../../../../component/view/input";
import { CloseTickSvg, PlusSvg } from "../../../../component/svgs";
import lodash from "lodash";
import { SchemaFilter } from "../../../../blocks/data-grid/schema/declare";
import { SelectBox } from "../../../../component/view/select/box";
import { getTypeSvg } from "../../../../blocks/data-grid/schema/util";
import { Remark } from "../../../../component/view/text";
import { Switch } from "../../../../component/view/switch";
import { useSelectMenuItem } from "../../../../component/view/menu";
import { Rect } from "../../../../src/common/vector/point";
import dayjs from "dayjs";
import { useDatePicker } from "../../../date";
import { useUserPicker } from "../../../at/picker";
import { Avatar } from "../../../../component/view/avator/face";

export class TableFilterView extends EventsComponent {
    get schema() {
        return this.block?.schema;
    }
    block: DataGridView;
    oldFilters: SchemaFilter;
    onOpen(block: DataGridView) {
        this.block = block;
        this.oldFilters = lodash.cloneDeep(this.block.filter);
        this.forceUpdate();
    }
    getFields() {
        var fs = this.schema.fields.findAll(g => g.text && ![FieldType.formula].includes(g.type)).map(fe => {
            return {
                icon: getTypeSvg(fe.type),
                text: fe.text,
                value: fe.id
            }
        });
        return fs;
    }
    getComputedFields(fieldId: string) {
        var field = this.block.schema.fields.find(g => g.id == fieldId);
        if ([FieldType.image, FieldType.video, FieldType.video, FieldType.file].includes(field.type)) {
            return [
                { text: '为空', value: '$isNull' },
                { text: '不为空', value: '$isNotNull' },
            ]
        }
        else if ([FieldType.number].includes(field.type)) {
            return [
                { text: '等于', value: '$eq' },
                { text: '不等于', value: '$ne' },
                { text: '小于', value: '$lt' },
                { text: '大于', value: '$gt' },
                { text: '小于等于', value: '$lte' },
                { text: '大于等于', value: '$gte' },
                { text: '为空', value: '$isNull' },
                { text: '不为空', value: '$isNotNull' },
            ]
        }
        else if ([FieldType.option, FieldType.options].includes(field.type)) {
            return [
                { text: '等于', value: '$eq' },
                { text: '不等于', value: '$ne' },
                { text: '为空', value: '$isNull' },
                { text: '不为空', value: '$isNotNull' },
            ]
        }
        else if ([FieldType.date].includes(field.type)) {
            return [
                { text: '等于', value: '$eq' },
                { text: '不等于', value: '$ne' },
                { text: '早于', value: '$gt' },
                { text: '晚于', value: '$lt' },
                { text: '早于等于', value: '$gte' },
                { text: '晚于等于', value: '$lte' },
                { text: '位于', value: '$in' },
                { text: '为空', value: '$isNull' },
                { text: '不为空', value: '$isNotNull' },
            ]
        }
        else if ([FieldType.text,
        FieldType.textarea,
        FieldType.title,
        FieldType.link,
        FieldType.phone,
        FieldType.email].includes(field.type)) {
            return [
                { text: '等于', value: '$eq' },
                { text: '不等于', value: '$ne' },
                { text: '包含', value: '$contain' },
                { text: '不包含', value: '$notContain' },
                { text: '开头为', value: '$startWidth' },
                { text: '结尾为', value: '$endWidth' },
                { text: '为空', value: '$isNull' },
                { text: '不为空', value: '$isNotNull' },
            ]
        }
        return [
            { text: '为空', value: '$isNull' },
            { text: '不为空', value: '$isNotNull' },
        ]
    }
    onStore = lodash.debounce(async () => {
        await this.block.onManualUpdateProps({ filter: this.oldFilters }, { filter: this.block.filter }, { syncBlock: this.block });
        this.oldFilters = lodash.cloneDeep(this.block.filter);
    }, 800);
    onForceStore = async () => {
        await this.block.onManualUpdateProps({ filter: this.oldFilters }, { filter: this.block.filter }, { syncBlock: this.block });
        this.oldFilters = lodash.cloneDeep(this.block.filter);
        this.forceUpdate();
    }
    renderDateInput(item: SchemaFilter) {
        var self = this;
        var options = [];
        if (item.operator == '$in') {
            options = [
                { text: '具体时间', value: null },
                { text: '今天', value: '0D' },
                { text: '最近3天', value: '-3D' },
                { text: '未来3天', value: '3D' },
                { text: '最近一周', value: '-7D' },
                { text: '未来一周', value: '7D' },
                { text: '最近半月', value: '-0.5M' },
                { text: '最近一月', value: '-1M' },
                { text: '本周', value: 'C0W' },
                { text: '下周', value: 'C1W' },
                { text: '上周', value: 'C-1W' },
                { text: '本月', value: 'C0M' },
                { text: '下月', value: 'C1M' },
                { text: '上月', value: 'C-1M' },
                { text: '今年', value: 'C0Y' },
                { text: '明年', value: 'C1Y' },
                { text: '去年', value: 'C-1Y' },
            ]
        }
        else
            options = [
                { text: '具体时间', value: null },
                { text: '今天', value: '0D' },
                { text: '昨天', value: '-1D' },
                { text: '明天', value: '1D' },
                { text: '一周前', value: '-7D' },
                { text: '一周后', value: '7D' },
                { text: '一月前', value: '-30D' },
                { text: '一月后', value: '30D' },
            ]
        var op = options.find(g => g.value == item.value);
        async function mousedown(item: SchemaFilter, event: React.MouseEvent) {
            var rect = Rect.fromEvent(event)
            var r = await useSelectMenuItem({ roundArea: rect }, options.map(op => {
                return {
                    text: op.text,
                    value: op.value,
                    checkLabel: item.value == op.value
                }
            }), { nickName: 'second' });
            if (r?.item) {
                if (lodash.isNull(r.item.value)) {
                    var rs = await useDatePicker({ roundArea: rect },
                        item.value ? new Date(item.value) : new Date(), {});
                    if (rs) {
                        item.value = rs.getTime();
                        self.onForceStore();
                    }
                }
                else {
                    item.value = r.item.value;
                    self.onForceStore();
                }
            }
        }
        var dateString = '';
        if (item.operator != '$in') {
            if (item.value) dateString = dayjs(new Date(item.value)).format('YYYY-MM-DD');
        }
        else {

        }
        return <div onMouseDown={e => mousedown(item, e)} className="shy-table-filter-view-item-value">
            {op?.text || dateString || '请选择日期'}
        </div>
    }
    renderOptionInput(item: SchemaFilter) {
        var self = this;
        var fe = self.block.schema.fields.find(g => g.id == item.field);
        var options = fe.config?.options || [];
        var op = options.find(g => g.value == item.value);
        async function mousedown(item: SchemaFilter, event: React.MouseEvent) {
            var r = await useSelectMenuItem({ roundArea: Rect.fromEvent(event) }, options.map(op => {
                return {
                    text: op.text,
                    value: op.value,
                    checkLabel: item.value == op.value
                }
            }));
            if (r?.item) {
                item.value = r.item.value;
                self.onForceStore();
            }
        }
        return <div onMouseDown={e => mousedown(item, e)} className="shy-table-filter-view-item-value">
            {op?.text || (item.value ? dayjs(item.value).format('YYYY-MM-DD') : undefined) || '请选择一项'}
        </div>
    }
    renderUserInput(item: SchemaFilter) {
        var self = this;
        async function mousedown(event: React.MouseEvent) {
            var r = await useUserPicker({ roundArea: Rect.fromEvent(event) });
            if (r?.id) {
                item.value = r.id;
                self.onForceStore();
            }
        }
        return <div onMouseDown={e => mousedown(e)} className="shy-table-filter-view-item-user">
            {item.value && <Avatar size={30} userid={item.value}></Avatar>}
            {!item.value && <span>选择用户</span>}
        </div>
    }
    render(): ReactNode {
        if (!this.block) return <></>;
        if (!Array.isArray(this.block.filter?.items)) {
            this.block.filter = { logic: 'and', items: [] };
        }
        var self = this;
        var nameField = this.schema.fields.find(g => g.type == FieldType.title);
        if (!nameField) nameField = this.schema.fields.find(g => g.text ? true : false);
        function addFilter() {
            self.block.filter.items.push({ field: nameField.id, operator: '$eq', value: '' });
            self.onForceStore();
        }
        async function removeFilter(event: React.MouseEvent, filter: SchemaFilter) {
            self.block.filter.items.remove(g => g === filter);
            self.onForceStore();
        }
        return <div className="shy-table-filter-view">
            <div className="shy-table-filter-view-logic">筛选符合下方<SelectBox style={{ margin: '0px 5px' }} value={self.block.filter.logic} border options={[
                { text: '任意', value: 'or' },
                { text: '所有', value: 'and' }
            ]} onChange={e => {
                self.block.filter.logic = e;
                self.onForceStore();
            }}></SelectBox>条件的数据</div>
            {self.block.filter.items.map((item, index) => {
                var fe = self.block.schema.fields.find(g => g.id == item.field);
                return <div className="shy-table-filter-view-item" key={index}>
                    <div className="shy-table-filter-view-item-box">
                        <SelectBox border options={self.getFields()} value={item.field} onChange={e => { item.field = e; self.onForceStore() }}></SelectBox>
                        <SelectBox border options={self.getComputedFields(item.field)} value={item.operator} onChange={e => { item.operator = e; self.onForceStore() }} ></SelectBox>
                        {['$notContain', '$contain', '$startWidth', '$endWidth'].includes(item.operator)
                            ||
                            ([FieldType.text,
                            FieldType.textarea,
                            FieldType.title,
                            FieldType.link,
                            FieldType.phone,
                            FieldType.email].includes(fe.type) && ['$ne', '$eq'].includes(item.operator))
                            &&
                            <Input style={{ width: 120 }} placeholder={'值'} value={item.value} onChange={e => { item.value = e; self.onStore(); }}></Input>}
                        {[FieldType.number, FieldType.autoIncrement].includes(fe.type) && !['$isNull', '$isNOtNull'].includes(item.operator) && <Input type='number' style={{ width: 120 }} placeholder={'值'} value={item.value} onChange={e => { item.value = e; self.onStore(); }}></Input>}
                        {[FieldType.date, FieldType.createDate].includes(fe.type) && !['$isNull', '$isNOtNull'].includes(item.operator) && self.renderDateInput(item)}
                        {[FieldType.option, FieldType.options].includes(fe.type) && !['$isNull', '$isNOtNull'].includes(item.operator) && self.renderOptionInput(item)}
                        {[FieldType.bool].includes(fe.type) && !['$isNull', '$isNOtNull'].includes(item.operator) && <Switch checked={item.value ? true : false} onChange={e => { item.value = e; self.onForceStore() }}></Switch>}
                        {[FieldType.creater, FieldType.modifyer, FieldType.user].includes(fe.type) && !['$isNull', '$isNOtNull'].includes(item.operator) && self.renderUserInput(item)}
                    </div>
                    <Icon style={{ padding: 5 }} size={12} mousedown={e => removeFilter(e, item)} icon={CloseTickSvg} wrapper></Icon>
                </div>
            })}
            {self.block.filter.items.length == 0 && <Remark style={{ margin: 10 }}>还没有添加筛选条件</Remark>}
            <Divider></Divider>
            <div className="shy-table-filter-view-footer">
                <a onClick={e => addFilter()}><Icon size={14} style={{ marginRight: 5 }} icon={PlusSvg}></Icon>添加筛选条件</a>
            </div>
        </div>
    }
}