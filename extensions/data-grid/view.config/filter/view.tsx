import React from "react";
import { SchemaFilter } from "../../../../blocks/data-grid/schema/filter";
import { TableSchema } from "../../../../blocks/data-grid/schema/meta";
import { FieldType } from "../../../../blocks/data-grid/schema/type";
import { SelectBox } from "../../../../component/view/select/box";
import { GetFieldTypeSvg } from "../../../../blocks/data-grid/schema/util";
import { ArrowRightSvg, CheckSvg, CloseSvg, PlusSvg } from "../../../../component/svgs";
import { Divider } from "../../../../component/view/grid";
import { Input } from "../../../../component/view/input";
import { HelpText } from "../../../../component/view/text";
import { lst } from "../../../../i18n/store";
import { S } from "../../../../i18n/view";
import { Icon } from "../../../../component/view/icon";
import { useUserPicker } from "../../../at/picker";
import { Avatar } from "../../../../component/view/avator/face";
import { Rect } from "../../../../src/common/vector/point";
import { useSelectMenuItem } from "../../../../component/view/menu";
import lodash from "lodash";
import { useDatePicker } from "../../../date";
import dayjs from "dayjs";
import { util } from "../../../../util/util";
import { MenuItem, MenuItemType } from "../../../../component/view/menu/declare";
import { Switch } from "../../../../component/view/switch";
import { LinkWs } from "../../../../src/page/declare";

export class FilterView extends React.Component<{
    filter: SchemaFilter,
    schema: TableSchema,
    formSchema?: TableSchema,
    ws?: LinkWs,
    onInput: (filter: SchemaFilter) => void,
    onChange: (filter: SchemaFilter) => void
}> {
    filter: SchemaFilter = { id: util.guid(), logic: 'and', items: [] }
    schema: TableSchema;
    formSchema: TableSchema;
    ws: LinkWs;
    constructor(props) {
        super(props);
        this.filter = props.filter;
        if (!this.filter) this.filter = { id: util.guid(), logic: 'and', items: [] }
        this.schema = props.schema;
        this.formSchema = props.formSchema;
        this.ws = props.ws
    }
    onForceStore() {
        if (typeof this.props.onChange == 'function')
            this.props.onChange(this.filter)
        this.forceUpdate();
    }
    onStore() {
        if (typeof this.props.onInput == 'function')
            this.props.onInput(this.filter)
        this.forceUpdate();
    }
    getFields() {
        var fs = this.schema.visibleFields.findAll(g => g.text && ![FieldType.formula, FieldType.rollup].includes(g.type)).map(fe => {
            var text = fe.text;
            var value = fe.id;
            if (fe.type == FieldType.browse) {
                text += '.' + lst('浏览量')
                value = fe.id + '.count'
            }
            else if (fe.type == FieldType.vote) {
                text += '.' + lst('投票数')
                value = fe.id + '.count'
            }
            else if (fe.type == FieldType.love) {
                text += '.' + lst('喜欢数')
                value = fe.id + '.count'
            }
            else if (fe.type == FieldType.comment) {
                text += '.' + lst('评论数')
                value = fe.id + '.count'
            }
            else if (fe.type == FieldType.like) {
                text += '.' + lst('点赞数')
                value = fe.id + '.count'
            }
            else if (fe.type == FieldType.emoji) {
                text += '.' + lst('表情数')
                value = fe.id + '.count'
            }
            else if ([FieldType.audio, FieldType.image, FieldType.file, FieldType.video].includes(fe.type)) {
                if (fe.config?.isMultiple) {
                    return [
                        { type: MenuItemType.divide },
                        {
                            icon: GetFieldTypeSvg(fe.type),
                            text,
                            value
                        },
                        {
                            icon: GetFieldTypeSvg(fe.type),
                            text: fe.text + '.' + lst('数量'),
                            value: fe.id + ".$size"
                        },
                        {
                            icon: GetFieldTypeSvg(fe.type),
                            text: fe.text + '.' + lst('大小'),
                            value: fe.id + ".$element.size"
                        },
                        { type: MenuItemType.divide }
                    ]
                }
                else {
                    return [
                        { type: MenuItemType.divide },
                        {
                            icon: GetFieldTypeSvg(fe.type),
                            text,
                            value
                        },
                        {
                            icon: GetFieldTypeSvg(fe.type),
                            text: fe.text + '.' + lst('大小'),
                            value: fe.id + ".$element.size"
                        },
                        { type: MenuItemType.divide }
                    ]
                }
            }
            else if (fe.type == FieldType.options) {
                return [
                    { type: MenuItemType.divide },
                    {
                        icon: GetFieldTypeSvg(fe.type),
                        text,
                        value
                    },
                    {
                        icon: GetFieldTypeSvg(fe.type),
                        text: fe.text + '.' + lst('选项数'),
                        value: fe.id + ".$size"
                    },
                    { type: MenuItemType.divide }
                ]
            }
            else if (fe.type == FieldType.relation) {
                return [
                    { type: MenuItemType.divide },
                    {
                        icon: GetFieldTypeSvg(fe.type),
                        text,
                        value
                    },
                    {
                        icon: GetFieldTypeSvg(fe.type),
                        text: fe.text + '.' + lst('关联数'),
                        value: fe.id + ".$size"
                    },
                    { type: MenuItemType.divide }
                ]
            }
            return {
                icon: GetFieldTypeSvg(fe.type),
                text,
                value
            }
        });
        return fs.flat(3);
    }
    getComputedFields(fieldId: string) {
        var fe = fieldId.indexOf('.') > -1 ? fieldId.split('.')[0] : fieldId;
        var ed = fieldId.indexOf('.') > -1 ? fieldId.split('.').last() : null;
        var field = this.schema.fields.find(g => g.id == fe);
        if (!field) return [];
        var type = field.type;
        if (ed) {
            if (ed == '$size') type = FieldType.number;
            else if (ed == 'size') type = FieldType.number;
            else if (ed == 'count') type = FieldType.number;
        }
        if ([
            FieldType.image,
            FieldType.audio,
            FieldType.video,
            FieldType.file
        ].includes(type)) {
            return [
                { text: lst('为空'), value: '$isNull' },
                { text: lst('不为空'), value: '$isNotNull' },
            ]
        }
        else if ([FieldType.number].includes(type)) {
            if (ed == '$size') return [
                { text: lst('等于'), value: '$eq' },
                { text: lst('不等于'), value: '$ne' },
                { text: lst('小于'), value: '$lt' },
                { text: lst('大于'), value: '$gt' },
                { text: lst('小于等于'), value: '$lte' },
                { text: lst('大于等于'), value: '$gte' }
            ]
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
        else if ([FieldType.option, FieldType.options].includes(type)) {
            return [
                { text: lst('等于'), value: '$eq' },
                { text: lst('不等于'), value: '$ne' },
                { text: lst('包含'), value: '$in' },
                { text: lst('不包含'), value: '$notIn' },
                { text: lst('为空'), value: '$isNull' },
                { text: lst('不为空'), value: '$isNotNull' },
            ]
        }
        else if ([FieldType.user, FieldType.creater, FieldType.modifyer].includes(type)) {
            return [
                { text: lst('是'), value: '$eq' },
                { text: lst('不是'), value: '$ne' },
                { text: lst('为空'), value: '$isNull' },
                { text: lst('不为空'), value: '$isNotNull' },
            ]
        }
        else if ([FieldType.date, FieldType.createDate, FieldType.modifyDate].includes(type)) {
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
        else if ([
            FieldType.text,
            FieldType.textarea,
            FieldType.title,
            FieldType.link,
            FieldType.phone,
            FieldType.email,
            FieldType.id
        ].includes(type)) {
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
        else if ([FieldType.bool].includes(type)) {
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
        if (item.operator == '$in' || item.operator == '$notIn') {
            var vs = util.covertToArray(item.value);
            var ops = options.findAll(g => vs.includes(g.value));
            async function mousedown(item: SchemaFilter, event: React.MouseEvent) {
                var r = await useSelectMenuItem({ roundArea: Rect.fromEvent(event) }, options.map(op => {
                    return {
                        text: op.text,
                        value: op.value,
                        checkLabel: item.value == op.value,
                        type: MenuItemType.custom,
                        render(it) {
                            return <div className="flex padding-w-14 h-30 item-hover round cursor">
                                <span className="flex-fixed size-20 round gap-r-10 border" style={{ backgroundColor: op.color }}></span>
                                <span className="flex-auto text f-14">{op.text}</span>
                                {it.value == item.value && <span className="flex-fixed size-24 flex-center"><Icon size={16} icon={CheckSvg}></Icon></span>}
                            </div>
                        }
                    }
                }));
                if (r?.item) {
                    vs = util.covertToArray(item.value);
                    if (vs.includes(r.item.value)) lodash.remove(vs, g => g == r.item.value)
                    else vs.push(r.item.value);
                    item.value = vs;
                    self.onForceStore();
                }
            }
            return <div onMouseDown={e => mousedown(item, e)} className="border box-border round h-26 padding-w-14 flex-center gap-r-10">
                {ops.map(op => {
                    return <span className="gap-r-5" key={op.value} style={{ background: op?.color ? op.color : undefined }}>{op?.text || lst('请选择一项')}</span>
                })}
                {ops.length == 0 && <span>{lst('请选择一项')}</span>}
            </div>
        }
        else {
            var op = options.find(g => g.value == item.value);
            if (!op && self.formSchema) {
                op = self.formSchema.fields.find(g => '@' + g.text == item.value) as any;
                if (op)
                    op = { text: '@' + op.text, value: '@' + op.text } as any;
            }
            async function mousedown(item: SchemaFilter, event: React.MouseEvent) {
                var menus: MenuItem[] = options.map(op => {
                    return {
                        text: op.text,
                        value: op.value,
                        checkLabel: item.value == op.value,
                        type: MenuItemType.custom,
                        render(it) {
                            return <div className="flex padding-w-14 h-30 item-hover round cursor">
                                <span className="flex-fixed size-20 round gap-r-10 border" style={{ backgroundColor: op.color }}></span>
                                <span className="flex-auto text f-14">{op.text}</span>
                                {it.value == item.value && <span className="flex-fixed size-24 flex-center"><Icon size={16} icon={CheckSvg}></Icon></span>}
                            </div>
                        }
                    }
                })
                if (self.formSchema) {
                    var fs = self.formSchema.fields.findAll(g => g.type == FieldType.option || g.type == FieldType.options);
                    if (fs) {
                        menus.push({ type: MenuItemType.divide });
                        menus.push({ type: MenuItemType.text, text: lst('表单字段') })
                        menus.push(...fs.map(f => {
                            return {
                                text: '@' + f.text,
                                value: '@' + f.text,
                                icon: GetFieldTypeSvg(f.type)
                            }
                        }))
                    }
                }
                var r = await useSelectMenuItem({ roundArea: Rect.fromEvent(event) }, menus);
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
    }
    renderUserInput(item: SchemaFilter) {
        var self = this;
        async function mousedown(event: React.MouseEvent) {
            var r = await useUserPicker({
                roundArea: Rect.fromEvent(event)
            },
                self.props?.ws,
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
    renderValue(item: SchemaFilter) {
        var self = this;
        var name = item.field.indexOf('.') > -1 ? item.field.split('.')[0] : item.field;
        var ed = item.field.indexOf('.') > -1 ? item.field.split('.').last() : null;
        var fe = this.schema.fields.find(g => g.id == name);
        var type = fe.type;
        if (ed) {
            if (ed == '$size') type = FieldType.number;
            else if (ed == 'size') type = FieldType.number;
            else if (ed == 'count') type = FieldType.number;
        }
        if (
            ['$notContain', '$contain', '$startWith', '$endWith'].includes(item.operator)
            ||
            ([
                FieldType.text,
                FieldType.textarea,
                FieldType.title,
                FieldType.link,
                FieldType.phone,
                FieldType.email
            ].includes(type) && ['$ne', '$eq'].includes(item.operator))
        )
            return <Input onSearchDrop={async (v) => {
                if (!v) return []
                if (this.formSchema) {
                    var fs = this.formSchema.fields.findAll(g => [
                        FieldType.text,
                        FieldType.textarea,
                        FieldType.title,
                        FieldType.link,
                        FieldType.phone,
                        FieldType.email
                    ].includes(g.type) && ('@' + g.text).startsWith(v));
                    return fs.map(f => {
                        return {
                            value: '@' + f.text,
                            text: '@' + f.text,
                            type: GetFieldTypeSvg(f.type)
                        }
                    })
                }
                return [] as any
            }} className={'gap-r-10'} style={{ width: 120 }} placeholder={lst('值')} value={item.value} onEnter={e => {
                item.value = e;
                self.onForceStore();
            }} onChange={e => {
                item.value = e;
                self.onStore();
            }}></Input>
        else if ([FieldType.number, FieldType.autoIncrement].includes(type) && !['$isNull', '$isNotNull'].includes(item.operator))
            return <Input className={'gap-r-10'} type='number' style={{ width: 120 }} placeholder={lst('值')} value={item.value} onChange={e => { item.value = e; self.onStore(); }}></Input>
        else if ([FieldType.date, FieldType.modifyDate, FieldType.createDate].includes(type) && !['$isNull', '$isNotNull'].includes(item.operator))
            return self.renderDateInput(item)
        else if ([FieldType.option, FieldType.options].includes(type) && !['$isNull', '$isNotNull'].includes(item.operator))
            return self.renderOptionInput(item)
        else if ([FieldType.bool].includes(type) && !['$isNull', '$isNotNull'].includes(item.operator))
            return <Switch className={'gap-r-10'} checked={item.value ? true : false} onChange={e => { item.value = e; self.onForceStore() }}></Switch>
        else if ([FieldType.creater, FieldType.modifyer, FieldType.user].includes(type) && !['$isNull', '$isNotNull'].includes(item.operator))
            return self.renderUserInput(item)
    }
    render() {
        if (!this.schema) return <></>
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
        return <div className="f-14">
            <div className="h-30 flex padding-w-10 gap-w-5 gap-h-10 text-1 f-14">
                <S>筛选符合下方</S><em className="gap-w-5"><SelectBox small value={self.filter.logic} border options={[
                    { text: lst('任意'), value: 'or' },
                    { text: lst('所有'), value: 'and' }
                ]} onChange={e => {
                    self.filter.logic = e;
                    self.onForceStore();
                }}></SelectBox></em><S>条件的数据</S>
            </div>
            <div className={"max-h-300 overflow-y "}>{Array.isArray(self.filter.items) && self.filter.items.map((item, index) => {
                return <div className="flex visible-hover max-h-30 padding-w-10 gap-w-5 gap-h-10" key={index}>
                    <div className="flex-auto flex">
                        <SelectBox className={'gap-r-10'} border options={self.getFields()} value={item.field} onChange={e => {
                            item.field = e;
                            item.value = null;
                            var ops = self.getComputedFields(item.field);
                            if (!ops.some(c => c.value == item.operator)) {
                                item.operator = ops.first().value;
                            }
                            self.onForceStore()
                        }}></SelectBox>
                        <SelectBox className={'gap-r-10'} border options={self.getComputedFields(item.field)} value={item.operator} onChange={e => { item.operator = e; self.onForceStore() }} ></SelectBox>
                        {this.renderValue(item)}
                    </div>
                    <span className="flex-fixed visible flex-center size-24 round item-hover cursor"><Icon size={12} onMousedown={e => removeFilter(e, item)} icon={CloseSvg} ></Icon></span>
                </div>
            })}
            </div>
            {Array.isArray(self.filter.items) && self.filter.items.length > 0 && <Divider></Divider>}
            <div onClick={e => addFilter()} className="h-30  flex cursor item-hover  padding-w-7 gap-w-5 round text-1 f-14">
                <span className="size-20 round flex-center flex-fixed cursor">
                    <Icon size={18} icon={PlusSvg}></Icon>
                </span>
                <span className="flex-auto"><S>添加筛选条件</S></span>
            </div>
            <Divider></Divider>
            <div className="h-30 padding-w-14 flex">
                <HelpText align="left" url={window.shyConfig?.isUS ? "https://shy.red/ws/help/page/46" : "https://shy.live/ws/help/page/1873"}>了解数据表筛选</HelpText>
            </div>
        </div>
    }
    shouldComponentUpdate(nextProps: Readonly<{ filter: SchemaFilter; schema: TableSchema; formSchema?: TableSchema; ws?: LinkWs; onInput: (filter: SchemaFilter) => void; onChange: (filter: SchemaFilter) => void; }>, nextState: Readonly<{}>, nextContext: any): boolean {
        if (!lodash.isEqual(nextProps.filter, this.filter)) {
            this.filter = nextProps.filter;
            if (!this.filter) this.filter = { id: util.guid(), logic: 'and', items: [] }
            this.schema = nextProps.schema;
            this.formSchema = nextProps.formSchema;
            this.ws = nextProps.ws;
            return true;
        }
        return false;
    }
}