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
        var fs = this.schema.fields.findAll(g => g.text ? true : false).map(fe => {
            return {
                icon: getTypeSvg(fe.type),
                text: fe.text,
                value: fe.id
            }
        });
        return fs;
    }
    getFieldType(field: string) {
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
                { text: '小于', value: '$contain' },
                { text: '大于', value: '$notContain' },
                { text: '小于等于', value: '$startWidth' },
                { text: '大于等于', value: '$endWidth' },
                { text: '为空', value: '$isNull' },
                { text: '不为空', value: '$isNotNull' },
            ]
        }
        else if ([FieldType.date].includes(field.type)) {
            return [
                { text: '等于', value: '$eq' },
                { text: '不等于', value: '$ne' },
                { text: '早于', value: '$contain' },
                { text: '晚于', value: '$notContain' },
                { text: '早于等于', value: '$startWidth' },
                { text: '晚于等于', value: '$endWidth' },
                { text: '位于', value: '$endWidth' },
                { text: '为空', value: '$isNull' },
                { text: '不为空', value: '$isNotNull' },
            ]
        }
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
    onStore = lodash.debounce(async () => {
        await this.block.onManualUpdateProps({ filter: this.oldFilters }, { filter: this.block.filter });
        this.oldFilters = lodash.cloneDeep(this.block.filter);
    }, 800);
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
            self.onStore();
            self.forceUpdate();
        }
        async function removeFilter(event: React.MouseEvent, filter: SchemaFilter) {
            self.block.filter.items.remove(g => g === filter);
            self.onStore();
            self.forceUpdate();
        }
        return <div className="shy-table-filter-view">
            <div className="shy-table-filter-view-logic">筛选符合下方<SelectBox style={{ margin: '0px 5px' }} value={self.block.filter.logic} border options={[
                { text: '任意', value: 'or' },
                { text: '所有', value: 'and' }
            ]} onChange={e => {
                self.block.filter.logic = e;
                self.onStore();
                self.forceUpdate();
            }}></SelectBox>条件的数据</div>
            {self.block.filter.items.map((item, index) => {
                return <div className="shy-table-filter-view-item" key={index}>
                    <div className="shy-table-filter-view-item-box">       <SelectBox border options={self.getFields()} value={item.field} onChange={e => { item.field = e; self.onStore(); self.forceUpdate() }}></SelectBox>
                        <SelectBox border options={self.getFieldType(item.field)} computedOptions={async () => self.getComputedFields(item.field)} value={item.operator} onChange={e => { item.operator = e; self.onStore(); self.forceUpdate() }} ></SelectBox>
                        <Input style={{ width: 80 }} placeholder={'值'} value={item.value} onChange={e => { item.value = e; self.onStore(); }}></Input></div>
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