import React, { ReactNode } from "react";
import { SchemaFilter } from "../../../../blocks/data-grid/schema/declare";
import { TableSchema } from "../../../../blocks/data-grid/schema/meta";
import dayjs from "dayjs";
import lodash from "lodash";
import { FieldType } from "../../../../blocks/data-grid/schema/type";
import { GetFieldTypeSvg } from "../../../../blocks/data-grid/schema/util";
import { ArrowRightSvg, CheckSvg, CloseSvg, PlusSvg } from "../../../../component/svgs";
import { Avatar } from "../../../../component/view/avator/face";
import { Divider } from "../../../../component/view/grid";
import { Input } from "../../../../component/view/input";
import { useSelectMenuItem } from "../../../../component/view/menu";
import { MenuItemType } from "../../../../component/view/menu/declare";
import { SelectBox } from "../../../../component/view/select/box";
import { lst } from "../../../../i18n/store";
import { S } from "../../../../i18n/view";
import { Rect } from "../../../../src/common/vector/point";
import { useUserPicker } from "../../../at/picker";
import { useDatePicker } from "../../../date";
import { Icon } from "../../../../component/view/icon";
import { Switch } from "../../../../component/view/switch";
import { LinkWs } from "../../../../src/page/declare";
import { PopoverSingleton } from "../../../popover/popover";
import { PopoverPosition } from "../../../popover/position";
import { EventsComponent } from "../../../../component/lib/events.component";

export class CustomTableFilterView extends EventsComponent {
    getFields() {
        var fs = this.schema.initUserFields.findAll(g => g.text && ![FieldType.formula].includes(g.type)).map(fe => {
            return {
                icon: GetFieldTypeSvg(fe.type),
                text: fe.text,
                value: fe.id
            }
        });
        return fs;
    }
    getComputedFields(fieldId: string) {
        var field = this.schema.fields.find(g => g.id == fieldId);
        if ([FieldType.image, FieldType.video, FieldType.video, FieldType.file].includes(field.type)) {
            return [
                { text: lst('为空'), value: '$isNull' },
                { text: lst('不为空'), value: '$isNotNull' },
            ]
        }
        else if ([FieldType.number].includes(field.type)) {
            return [
                { text: lst('等于'), value: '$eq' },
                { text: lst('不等于'), value: '$ne' },
                { text: lst('小于'), value: '$lt' },
                { text: lst('大于'), value: '$gt' },
                { text: lst('小于等于'), value: '$lte' },
                { text: lst('大于等于'), value: '$gte' },
                { text: lst('为空'), value: '$isNull' },
                { text: lst('不为空'), value: '$isNotNull' },
            ]
        }
        else if ([FieldType.option, FieldType.options].includes(field.type)) {
            return [
                { text: lst('等于'), value: '$eq' },
                { text: lst('不等于'), value: '$ne' },
                { text: lst('为空'), value: '$isNull' },
                { text: lst('不为空'), value: '$isNotNull' },
            ]
        }
        else if ([FieldType.user, FieldType.creater, FieldType.modifyer].includes(field.type)) {
            return [
                { text: lst('是'), value: '$eq' },
                { text: lst('不是'), value: '$ne' },
                { text: lst('为空'), value: '$isNull' },
                { text: lst('不为空'), value: '$isNotNull' },
            ]
        }
        else if ([FieldType.date, FieldType.createDate, FieldType.modifyDate].includes(field.type)) {
            return [
                { text: lst('等于'), value: '$eq' },
                { text: lst('不等于'), value: '$ne' },
                { text: lst('早于'), value: '$gt' },
                { text: lst('晚于'), value: '$lt' },
                { text: lst('早于等于'), value: '$gte' },
                { text: lst('晚于等于'), value: '$lte' },
                { text: lst('位于'), value: '$in' },
                { text: lst('为空'), value: '$isNull' },
                { text: lst('不为空'), value: '$isNotNull' },
            ]
        }
        else if ([FieldType.text,
        FieldType.textarea,
        FieldType.title,
        FieldType.link,
        FieldType.phone,
        FieldType.email].includes(field.type)) {
            return [
                { text: lst('等于'), value: '$eq' },
                { text: lst('不等于'), value: '$ne' },
                { text: lst('包含'), value: '$contain' },
                { text: lst('不包含'), value: '$notContain' },
                { text: lst('开头为'), value: '$startWith' },
                { text: lst('结尾为'), value: '$endWith' },
                { text: lst('为空'), value: '$isNull' },
                { text: lst('不为空'), value: '$isNotNull' }
            ]
        }
        else if ([FieldType.bool].includes(field.type)) {
            return [
                { text: lst('等于'), value: '$eq' },
                { text: lst('不等于'), value: '$ne' },
                { text: lst('为空'), value: '$isNull' },
                { text: lst('不为空'), value: '$isNotNull' },
            ]
        }
        return [
            { text: lst('为空'), value: '$isNull' },
            { text: lst('不为空'), value: '$isNotNull' },
        ]
    }
    onStore = lodash.debounce(async () => {
        this.emit('change', lodash.cloneDeep(this.filter))
    }, 800);
    onForceStore = async () => {
        this.emit('change', lodash.cloneDeep(this.filter))
        this.forceUpdate();
    }
    renderDateInput(item: SchemaFilter) {
        var self = this;
        var options = [];
        if (item.operator == '$in') {
            options = [
                { text: lst('具体时间'), value: null },
                { text: lst('今天'), value: '0D' },
                { text: lst('最近3天'), value: '-3D' },
                { text: lst('未来3天'), value: '3D' },
                { text: lst('最近一周'), value: '-7D' },
                { text: lst('未来一周'), value: '7D' },
                { text: lst('最近半月'), value: '-0.5M' },
                { text: lst('最近一月'), value: '-1M' },
                { text: lst('下周'), value: 'C1W' },
                { text: lst('本周'), value: 'C0W' },
                { text: lst('上周'), value: 'C-1W' },
                { text: lst('本月'), value: 'C0M' },
                { text: lst('下月'), value: 'C1M' },
                { text: lst('上月'), value: 'C-1M' },
                { text: lst('今年'), value: 'C0Y' },
                { text: lst('明年'), value: 'C1Y' },
                { text: lst('去年'), value: 'C-1Y' },
            ]
        }
        else
            options = [
                { text: lst('具体时间'), value: null },
                { text: lst('今天'), value: '0D' },
                { text: lst('昨天'), value: '-1D' },
                { text: lst('明天'), value: '1D' },
                { text: lst('一周前'), value: '-7D' },
                { text: lst('一周后'), value: '7D' },
                { text: lst('一月前'), value: '-30D' },
                { text: lst('一月后'), value: '30D' },
            ]
        var op = options.find(g => g.value == item.value);
        async function mousedown(item: SchemaFilter, event: React.MouseEvent) {
            event.stopPropagation();
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
                    if (item.operator == '$in') {
                        var rs = await useDatePicker({ roundArea: rect }, new Date())
                        if (rs) {
                            item.value = [new Date().getTime(), rs.getTime()];
                            self.onForceStore();
                        }
                        else item.value = [new Date().getTime(), new Date().getTime()]
                    }
                    else {
                        var rs = await useDatePicker({ roundArea: rect },
                            item.value ? new Date(item.value) : new Date(), {});
                        if (rs) {
                            item.value = rs.getTime();
                            self.onForceStore();
                        }
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
            if (item.value) {
                var dd = dayjs(new Date(item.value));
                if (dd.isValid()) dateString = dayjs(new Date(item.value)).format('YYYY-MM-DD');
                else dateString = '';
            }
        }
        else {

        }
        async function setDateValue(pos: number, event: React.MouseEvent) {
            var rect = Rect.fromEvent(event)
            var rs = await useDatePicker({ roundArea: rect }, new Date(item.value[pos]))
            if (rs) {
                item.value[pos] = rs.getTime();
                self.onForceStore();
            }
        }
        if (item.operator == '$in' && !op) {
            if (!Array.isArray(item.value)) item.value = [Date.now(), Date.now()];
            var from = dayjs(new Date(item.value[0])).format('YYYY-MM-DD');
            var to = dayjs(new Date(item.value[1])).format('YYYY-MM-DD');
            return <div style={{ minWidth: 220 }} className="border  box-border round h-26 padding-w-14 flex-center gap-r-10">
                <span onMouseDown={e => setDateValue(0, e)}>{from}</span>
                <span className="gap-w-5"><Icon size={12} icon={ArrowRightSvg}></Icon></span>
                <span onMouseDown={e => setDateValue(1, e)}>{to}</span>
            </div>
        }
        return <div onClick={e => mousedown(item, e)} className="border box-border round h-26 padding-w-14 flex-center gap-r-10">
            {op?.text || dateString || lst('请选择日期')}
        </div>
    }
    renderOptionInput(item: SchemaFilter) {
        var self = this;
        var fe = self.schema.fields.find(g => g.id == item.field);
        var options = fe.config?.options || [];
        var op = options.find(g => g.value == item.value);
        async function mousedown(item: SchemaFilter, event: React.MouseEvent) {
            var r = await useSelectMenuItem({ roundArea: Rect.fromEvent(event) }, options.map(op => {
                return {
                    text: op.text,
                    value: op.value,
                    checkLabel: item.value == op.value,
                    type: MenuItemType.custom,
                    render(it) {
                        return <div className="flex padding-w-10 gap-w-5  h-30 item-hover round cursor">
                            <span className="flex-fixed size-20 round gap-r-10 border" style={{ backgroundColor: op.color }}></span>
                            <span className="flex-auto text f-14">{op.text}</span>
                            {it.value == item.value && <span className="flex-fixed size-24 flex-center"><Icon size={16} icon={CheckSvg}></Icon></span>}
                        </div>
                    }
                }
            }));
            if (r?.item) {
                item.value = r.item.value;
                self.onForceStore();
            }
        }
        return <div onMouseDown={e => mousedown(item, e)} className="border box-border round h-26 padding-w-14 flex-center gap-r-10">
            {op?.color && <span className="circle size-20 gap-r-5" style={{ background: op?.color ? op.color : undefined }}></span>}
            <span>{op?.text || lst('请选择一项')}</span>
        </div>
    }
    renderUserInput(item: SchemaFilter) {
        var self = this;
        async function mousedown(event: React.MouseEvent) {
            var r = await useUserPicker({
                roundArea: Rect.fromEvent(event)
            },
                self?.ws,
                { ignoreUserAll: true }
            );
            if (r?.id) {
                item.value = r.id;
                self.onForceStore();
            }
        }
        return <div onMouseDown={e => mousedown(e)} className="border box-border round h-26 padding-w-14 flex-center gap-r-10">
            {item.value && <Avatar size={20} userid={item.value}></Avatar>}
            {!item.value && <span><S>选择用户</S></span>}
        </div>
    }
    render(): ReactNode {
        if (!this.schema) return <></>;
        if (!Array.isArray(this.filter?.items)) {
            this.filter = { logic: 'and', items: [] };
        }
        var self = this;
        var nameField = this.schema.fields.find(g => g.type == FieldType.title);
        if (!nameField) nameField = this.schema.fields.find(g => g.text ? true : false);
        function addFilter() {
            self.filter.items.push({ field: nameField.id, operator: '$eq', value: '' });
            self.onForceStore();
        }
        async function removeFilter(event: React.MouseEvent, filter: SchemaFilter) {
            self.filter.items.remove(g => g === filter);
            self.onForceStore();
        }
        return <div className="f-14 w-400 min-h-30">
            <div className="h-30 flex padding-w-14 gap-t-10">
                <S>筛选符合下方</S><em className="gap-w-5"><SelectBox small value={self.filter.logic} border options={[
                    { text: lst('任意'), value: 'or' },
                    { text: lst('所有'), value: 'and' }
                ]} onChange={e => {
                    self.filter.logic = e;
                    self.onForceStore();
                }}></SelectBox></em><S>条件的数据</S>
            </div>
            <div className="max-h-300 overflow-y">{self.filter.items.map((item, index) => {
                var fe = self.schema.fields.find(g => g.id == item.field);
                return <div className="flex visible-hover max-h-30 padding-w-14 gap-h-10" key={index}>
                    <div className="flex-auto flex">
                        <SelectBox small className={'gap-r-10'} border options={self.getFields()} value={item.field} onChange={e => {
                            item.field = e;
                            item.value = null;
                            self.onForceStore()
                        }}></SelectBox>
                        <SelectBox small className={'gap-r-10'} border options={self.getComputedFields(item.field)} value={item.operator} onChange={e => { item.operator = e; self.onForceStore() }} ></SelectBox>
                        {
                            (
                                ['$notContain', '$contain', '$startWith', '$endWith'].includes(item.operator)
                                ||
                                ([
                                    FieldType.text,
                                    FieldType.textarea,
                                    FieldType.title,
                                    FieldType.link,
                                    FieldType.phone,
                                    FieldType.email
                                ].includes(fe.type) && ['$ne', '$eq'].includes(item.operator))
                            )
                            &&
                            <Input className={'gap-r-10'} style={{ width: 120 }} placeholder={lst('值')} value={item.value} onChange={e => { item.value = e; self.onStore(); }}></Input>}
                        {[FieldType.number, FieldType.autoIncrement].includes(fe.type) && !['$isNull', '$isNotNull'].includes(item.operator) && <Input className={'gap-r-10'} type='number' style={{ width: 120 }} placeholder={lst('值')} value={item.value} onChange={e => { item.value = e; self.onStore(); }}></Input>}
                        {[FieldType.date, FieldType.modifyDate, FieldType.createDate].includes(fe.type) && !['$isNull', '$isNotNull'].includes(item.operator) && self.renderDateInput(item)}
                        {[FieldType.option, FieldType.options].includes(fe.type) && !['$isNull', '$isNotNull'].includes(item.operator) && self.renderOptionInput(item)}
                        {[FieldType.bool].includes(fe.type) && !['$isNull', '$isNotNull'].includes(item.operator) && <Switch className={'gap-r-10'} checked={item.value ? true : false} onChange={e => { item.value = e; self.onForceStore() }}></Switch>}
                        {[FieldType.creater, FieldType.modifyer, FieldType.user].includes(fe.type) && !['$isNull', '$isNotNull'].includes(item.operator) && self.renderUserInput(item)}
                    </div>
                    <span className="flex-fixed visible flex-center size-24 round item-hover cursor"><Icon size={12} onMousedown={e => removeFilter(e, item)} icon={CloseSvg} ></Icon></span>
                </div>
            })}
            </div>
            <Divider></Divider>
            <div onClick={e => addFilter()} className="h-30  flex cursor item-hover padding-w-14">
                <span className="size-24 round flex-center flex-fixed cursor"><Icon size={20} icon={PlusSvg}></Icon></span>
                <span className="flex-auto"><S>添加筛选条件</S></span>
            </div>
        </div>
    }
    open(options: {
        schema: TableSchema,
        filter: SchemaFilter,
        ws: LinkWs,
    }) {
        Object.assign(this, options);
        this.forceUpdate();
    }
    schema: TableSchema
    filter: SchemaFilter;
    ws: LinkWs
}

export async function useCustomTableFilter(pos: PopoverPosition,
    option: {
        schema: TableSchema,
        filter: SchemaFilter,
        ws: LinkWs,
        onChange(filter: SchemaFilter): void
    }) {
    let popover = await PopoverSingleton(CustomTableFilterView, { mask: true });
    let fv = await popover.open(pos);
    fv.open(option);
    return new Promise((resolve: (data: string | { tableId: string, viewId: string, type: 'view' | 'form', viewUrl?: string }) => void, reject) => {
        fv.only('close', () => {
            popover.close();
            resolve(undefined);
        })
        fv.only('change', (g) => {
            if (typeof option.onChange == 'function') option.onChange(g);
        })
        popover.only('close', () => {
            resolve(undefined);
        })
    })
}