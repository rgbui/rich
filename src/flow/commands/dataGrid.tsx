import React from "react";
import { Icon } from "../../../component/view/icon";
import { FlowCommand, FlowCommandView } from "../command";
import { flow, flowView } from "../factory/observable";
import { S } from "../../../i18n/view";
import { TableSchema } from "../../../blocks/data-grid/schema/meta";
import { Rect } from "../../common/vector/point";
import { useDataSourceView } from "../../../extensions/data-grid/datasource";
import { ChevronDownSvg, CloseSvg, CollectTableSvg, Edit1Svg, PlusSvg, TrashSvg } from "../../../component/svgs";
import { SelectBox } from "../../../component/view/select/box";
import { lst } from "../../../i18n/store";
import { BlockUrlConstant } from "../../block/constant";
import { GetFieldTypeSvg } from "../../../blocks/data-grid/schema/util";
import { FieldType } from "../../../blocks/data-grid/schema/type";
import { useSelectMenuItem } from "../../../component/view/menu";
import { util } from "../../../util/util";
import { MenuItemType } from "../../../component/view/menu/declare";
import lodash from "lodash";
import { Input } from "../../../component/view/input";
import { InputNumber } from "../../../component/view/input/number";
import { Avatar } from "../../../component/view/avator/face";
import { useDatePicker } from "../../../extensions/date";
import dayjs from "dayjs";
import { Switch } from "../../../component/view/switch";
import { useUserPicker } from "../../../extensions/at/picker";
import { channel } from "../../../net/channel";
import { getElementUrl, ElementType } from "../../../net/element.type";
import { Page } from "../../page";
import { SchemaFilter } from "../../../blocks/data-grid/schema/filter";
import { useCustomTableFilter } from "../../../extensions/data-grid/view.config/filter/custom";
import { useTableStoreOption } from "../../../extensions/data-grid/option/option";

@flow('/addRecords')
export class AddRecordsCommand extends FlowCommand {
    constructor() {
        super();
    }
    schemaId: string = '';
    schema: TableSchema;
    schemaViewId: string = '';
    fields: { id: string, fieldId: string, value: any, operator?: string }[] = [];
    get schemaView() {
        if (this.schema) return this.schema.views.find(g => g.id == this.schemaViewId)
    }
    get editFields() {
        return this.schema.fields.findAll(g => [
            FieldType.title,
            FieldType.date,
            FieldType.number,
            FieldType.user,
            FieldType.option,
            FieldType.options,
            FieldType.email,
            FieldType.link,
            FieldType.phone,
            FieldType.bool
        ].includes(g.type))
    }
    async get() {
        var json = await super.get();
        json.schemaId = this.schemaId;
        json.schemaViewId = this.schemaViewId;
        json.fields = lodash.cloneDeep(this.fields);
        return json;
    }
    async clone() {
        var json = await super.clone();
        json.schemaId = this.schemaId;
        json.schemaViewId = this.schemaViewId;
        json.fields = lodash.cloneDeep(this.fields);
        return json;
    }
    async excute() {
        await this.loadSchema()
        if (!this.schemaViewId) {
            var data: Record<string, any> = {};
            this.fields.forEach(f => {
                var fe = this.schema.fields.find(g => g.id == f.fieldId);
                if (fe) {
                    data[fe.name] = lodash.cloneDeep(f.value);
                }
            });
            await this.schema.rowAdd({ data });
        }
        else {
            var data: Record<string, any> = {};
            this.fields.forEach(f => {
                var fe = this.schema.fields.find(g => g.id == f.fieldId);
                if (fe) {
                    data[fe.name] = lodash.cloneDeep(f.value);
                }
            });
            await channel.act('/page/dialog', {
                elementUrl: getElementUrl(ElementType.SchemaRecordView, this.schema.id, this.schemaViewId),
                config: {
                    force: true,
                    isCanEdit: true,
                    initData: lodash.cloneDeep(data)
                }
            })
        }
    }
    async loadSchema() {
        if (!this.schema) {
            this.schema = await TableSchema.loadTableSchema(this.schemaId,
                this.flow.ws
            );
            if (this.view) this.view.forceUpdate()
            console.log(this.schema);
        }
    }
}


function renderFieldInput(view: AddRecordsCommandView | EditRecordsCommandView, field) {
    var fe = view.command.schema.fields.find(g => g.id == field.fieldId);
    switch (fe.type) {
        case FieldType.email:
        case FieldType.link:
        case FieldType.phone:
        case FieldType.title:
            return <Input value={field.value} onChange={e => field.value = e}></Input>
        case FieldType.date:
            var dateMaps = [
                { text: lst('具体时间'), value: null },
                { type: MenuItemType.divide },
                { text: lst('今天'), value: '0D' },
                { text: lst('昨天'), value: '-1D' },
                { text: lst('明天'), value: '1D' },
                { text: lst('一周前'), value: '-7D' },
                { text: lst('一周后'), value: '7D' },
                { text: lst('一月前'), value: '-30D' },
                { text: lst('一月后'), value: '30D' },
                { type: MenuItemType.divide },
                { name: 'delete', icon: TrashSvg, text: lst('删除') }
            ]
            return <span
                className="item-hover remark round padding-w-5 padding-h-3 cursor"
                onMouseDown={async e => {
                    var rect = Rect.fromEle(e.currentTarget as HTMLElement);
                    var dm = await useSelectMenuItem({ roundArea: rect }, dateMaps);
                    if (dm) {
                        if (dm.item.name == 'delete') {
                            field.value = '';
                            view.forceUpdate();
                        }
                        else if (dm.item.value === null) {
                            var r = await useDatePicker({ roundArea: rect },
                                typeof field.value == 'number' ? new Date(field.value) : undefined, { includeTime: true });
                            if (r) {
                                field.value = r.getTime();
                                view.forceUpdate();
                            }
                        }
                        else {
                            field.value = dm.item.value;
                            view.forceUpdate();
                        }
                    }
                }}>{field.value && (typeof field.value == 'string' ? dateMaps.find(c => c.value == field.value)?.text : dayjs(field.value).format('YYYY-MM-DD HH:mm:ss')) || <S>添加日期</S>}</span>
        case FieldType.number:
            return <InputNumber value={field.value} onChange={e => { field.value = e; this.forceUpdate() }}></InputNumber>
        case FieldType.user:
            var openUser = async (e: React.MouseEvent) => {
                var ru = await useUserPicker({ roundArea: Rect.fromEle(e.currentTarget as HTMLElement) }, this.command.flow.ws, { ignoreUserAll: true });
                if (ru) {
                    field.value = ru.id;
                    view.forceUpdate();
                }
            }
            return field.value && <span onMouseDown={e => openUser(e)}>
                {field.value && <Avatar userid={field.value}></Avatar>}
                {!field.value && <span className="item-hover remark round padding-w-5" ><S>添加用户</S></span>}
            </span>
        case FieldType.option:
            var op = (fe.config?.options || []).find(g => g.value == field.value);
            var selectOp = async (event) => {
                var r = await useTableStoreOption({ roundArea: Rect.fromEle(event.currentTarget as HTMLElement) }, op?.value, {
                    isEdit: false,
                    options: (fe.config?.options || []),
                    multiple: false
                })
                if (typeof r != 'undefined') {
                    field.value = r[0].value;
                    view.forceUpdate()
                }
            }
            if (!op) return <span className="item-hover remark round padding-h-3 padding-w-5 cursor" onMouseDown={e => selectOp(e)}><S>选择项</S></span>
            return <span className="padding-w-5 round cursor  f-14 padding-h-2  l-16 " onMouseDown={e => selectOp(e)} style={{ background: op.color }}>{op?.text}</span>
        case FieldType.options:
            var ops = (fe.config?.options || []).findAll(g => Array.isArray(field.value) && field.value.includes(g.value));
            var selectOp = async (event) => {
                var r = await useTableStoreOption({ roundArea: Rect.fromEle(event.currentTarget as HTMLElement) }, ops.map(c => c.value), {
                    isEdit: false,
                    options: (fe.config?.options || []),
                    multiple: true
                })
                if (Array.isArray(r)) {
                    field.value = r.map(c => c.value);
                    view.forceUpdate()
                }
            }
            if (ops.length == 0) return <span className="item-hover remark round padding-h-3 padding-w-5" onMouseDown={e => selectOp(e)}><S>选择项</S></span>
            return <span className="flex ">{
                ops.map((op, index) => {
                    return <span key={op.value}
                        className="padding-w-5 round cursor flex"
                        onMouseDown={e => selectOp(e)}
                        style={{ background: op.color }}>
                        <em className="gap-r-3  f-14 padding-h-2  l-16 ">{op?.text}</em>
                        <Icon
                            size={12}
                            className={'remark'}
                            icon={CloseSvg}
                            onMousedown={e => {
                                e.stopPropagation();
                                lodash.remove(field.value, g => g == op.value);
                                this.forceUpdate();
                            }}
                        ></Icon>
                    </span>
                })}</span>
        case FieldType.bool:
            return <span><Switch checked={field.value} onChange={e => {
                field.value = e;
                this.forceUpdate();
            }}></Switch></span>
    }
}


@flowView('/addRecords')
export class AddRecordsCommandView extends FlowCommandView<AddRecordsCommand> {
    componentDidMount(): void {
        this.command.loadSchema().then(() => {
            this.forceUpdate();
        })
    }
    async openSelectTable(event: React.MouseEvent) {
        var r = await useDataSourceView({ roundArea: Rect.fromEle(event.currentTarget as HTMLElement) }, { selectView: false, tableId: this.command.schemaId || undefined })
        if (r) {
            this.command.schemaId = r as any;
            this.command.schema = await TableSchema.loadTableSchema(this.command.schemaId,
                this.command.flow.ws
            );
            this.command.fields = [];
            this.forceUpdate();
        }
    }
    async addField(event: React.MouseEvent) {
        if (!this.command.schema) return;
        var vfs = this.command.editFields.findAll(g => !this.command.fields.some(s => s.fieldId == g.id));
        if (vfs.length > 0) {
            var r = await useSelectMenuItem({ roundArea: Rect.fromEle(event.currentTarget as HTMLElement) }, [
                ...vfs.map(n => {
                    return {
                        icon: GetFieldTypeSvg(n.type),
                        text: n.text,
                        value: n.id
                    }
                })
            ]);
            if (r?.item) {
                this.command.fields.push({ fieldId: r.item.value, id: util.guid(), value: '', operator: '' })
                this.forceUpdate()
            }
        }
    }
    async changeField(event: React.MouseEvent, field) {
        var vfs = this.command.editFields.findAll(g => !this.command.fields.some(s => s.fieldId == g.id));
        var r = await useSelectMenuItem({ roundArea: Rect.fromEle(event.currentTarget as HTMLElement) }, [
            ...vfs.map(n => {
                return {
                    icon: GetFieldTypeSvg(n.type),
                    text: n.text,
                    value: n.id
                }
            }),
            { type: MenuItemType.divide, visible: vfs.length > 0 },
            { name: 'delete', text: lst('删除'), icon: TrashSvg }
        ]);
        if (r?.item) {
            if (r.item.name == 'delete') {
                lodash.remove(this.command.fields, g => g.id == field.id)
            }
            else {
                field.fieldId = r.item.value;
                field.value = '';
            }
            this.forceUpdate()
        }
    }
    renderView() {
        return <div>
            {this.renderHead(<Icon size={18} icon={{ name: 'byte', code: 'add' }}></Icon>,
                <><S>添加数据至</S>
                    {this.command.schema && <span className="item-hover remark  padding-w-5 round cursor flex" onMouseDown={e => this.openSelectTable(e)}><Icon size={16} icon={this.command.schema.icon || { name: 'byte', code: 'table' }}></Icon>{this.command.schema?.text}</span>}
                    {!this.command.schema && <span className="item-hover remark  padding-w-5 round cursor " onMouseDown={e => this.openSelectTable(e)}><S>选择数据表</S></span>}
                </>)}
            <div>
                {this.command.schema && <div className="flex gap-h-10">
                    <span className="flex-auto gap-l-10"><S>打开视图模板</S></span>
                    <SelectBox className={'flex-fixed item-hover remark  round padding-l-5'} onChange={e => this.command.onUpdateProps({ schemaViewId: e })} value={this.command.schemaViewId} options={[
                        { text: lst('关闭'), value: '' },
                        { type: MenuItemType.divide, visible: this.command.schema.views.findAll(g => [BlockUrlConstant.RecordPageView].includes(g.url as any)).length > 0 },
                        ...this.command.schema.views.findAll(g => [BlockUrlConstant.RecordPageView].includes(g.url as any)).map(n => ({
                            text: n.text,
                            value: n.id
                        }))
                    ]}></SelectBox>
                </div>}
                {this.command.schema && this.command.fields.map(f => {
                    var fe = this.command.schema.fields.find(g => g.id == f.fieldId);
                    return <div className="flex gap-h-10" key={f.id}>
                        <span className="flex-fixed w-120 flex-end " onMouseDown={e => this.changeField(e, f)}>
                            <span className="flex item-hover round padding-w-5 cursor">
                                <span className="flex-center remark">
                                    <Icon size={16} icon={GetFieldTypeSvg(fe.type)}></Icon>
                                </span>
                                <span className="gap-l-5">{fe.text}</span>
                                <Icon className={'remark'} size={16} icon={ChevronDownSvg}></Icon>
                            </span>
                        </span>
                        <span className="flex-auto gap-l-10">
                            {renderFieldInput(this, f)}
                        </span>
                    </div>
                })}
                {this.command.schema && <div onMouseDown={e => this.addField(e)}><span className="gap-l-10 item-hover remark   round padding-w-5 cursor h-24 flex flex-line"><Icon icon={PlusSvg} size={16} className={'flex-center size-20'}></Icon><S>添加字段值</S><Icon icon={ChevronDownSvg}></Icon></span></div>}
            </div>
        </div>
    }
}

@flow('/editRecords')
export class EditRecordsCommand extends FlowCommand {
    constructor() {
        super();
    }
    schemaId: string = '';
    schema: TableSchema;
    schemaViewId: string = '';
    fields: { id: string, fieldId: string, value: any, operator?: string }[] = [];
    filter: SchemaFilter;
    get schemaView() {
        if (this.schema) return this.schema.views.find(g => g.id == this.schemaViewId)
    }
    get editFields() {
        return this.schema.fields.findAll(g => [
            FieldType.title,
            FieldType.date,
            FieldType.number,
            FieldType.user,
            FieldType.option,
            FieldType.options,
            FieldType.email,
            FieldType.link,
            FieldType.phone,
            FieldType.bool
        ].includes(g.type))
    }
    async get() {
        var json = await super.get();
        json.schemaId = this.schemaId;
        json.schemaViewId = this.schemaViewId;
        json.fields = lodash.cloneDeep(this.fields);
        return json;
    }
    async clone() {
        var json = await super.clone();
        json.schemaId = this.schemaId;
        json.schemaViewId = this.schemaViewId;
        json.fields = lodash.cloneDeep(this.fields);
        return json;
    }
    async excute() {
        await this.loadSchema()
        if (!this.schemaViewId) {
            var data: Record<string, any> = {};
            this.fields.forEach(f => {
                var fe = this.schema.fields.find(g => g.id == f.fieldId);
                if (fe) {
                    data[fe.name] = lodash.cloneDeep(f.value);
                }
            });
            await this.schema.rowUpdateAll({ data, filter: this.filter }, this.flow.ws);
        }
        else {
            var data: Record<string, any> = {};
            this.fields.forEach(f => {
                var fe = this.schema.fields.find(g => g.id == f.fieldId);
                if (fe) {
                    data[fe.name] = lodash.cloneDeep(f.value);
                }
            });
            var dialougPage: Page = await channel.act('/page/dialog', {
                elementUrl: getElementUrl(ElementType.SchemaRecordView, this.schema.id, this.schemaViewId),
                config: {
                    force: true,
                    isCanEdit: true,
                    initData: lodash.cloneDeep(data)
                }
            })
            if (dialougPage) {
                dialougPage.onPageSave();
                var newRow = await dialougPage.getSchemaRow();
                if (newRow) await this.schema.rowUpdateAll({ data: newRow, filter: this.filter }, this.flow.ws);
            }
            await channel.act('/page/dialog', { elementUrl: null });
        }
    }
    async loadSchema() {
        if (!this.schema) {
            this.schema = await TableSchema.loadTableSchema(this.schemaId,
                this.flow.ws
            );
            if (this.view) this.view.forceUpdate()
            console.log(this.schema);
        }
    }
}

@flowView('/editRecords')
export class EditRecordsCommandView extends FlowCommandView<EditRecordsCommand> {
    async openSelectTable(event: React.MouseEvent) {
        await AddRecordsCommandView.prototype.openSelectTable.call(this, event);
    }
    async addField(event: React.MouseEvent) {
        await AddRecordsCommandView.prototype.addField.call(this, event);

    }
    async changeField(event: React.MouseEvent, field) {
        await AddRecordsCommandView.prototype.changeField.call(this, event, field);
    }
    async onFilter(event: React.MouseEvent) {
        await useCustomTableFilter({ align: 'end', roundArea: Rect.fromEle(event.currentTarget as HTMLElement) }, {
            schema: this.command.schema,
            filter: this.command.filter || {},
            ws: this.command.flow.ws,
            formSchema: this.command.flow.buttonBlock.page.schema,
            onChange: async (filter: SchemaFilter) => {
                this.command.filter = lodash.cloneDeep(filter);
                this.forceUpdate();
            }
        })
    }
    renderView() {
        return <div>
            {this.renderHead(<Icon size={18} icon={Edit1Svg}></Icon>,
                <><S>编辑数据</S>
                    {this.command.schema && <span className="item-hover remark  padding-w-5 round cursor flex" onMouseDown={e => this.openSelectTable(e)}><Icon size={16} className={'gap-r-3'} icon={this.command.schema.icon || { name: 'byte', code: 'table' }}></Icon>{this.command.schema?.text}</span>}
                    {!this.command.schema && <span className="item-hover remark  padding-w-5 round cursor " onMouseDown={e => this.openSelectTable(e)}><S>选择数据表</S></span>}
                </>)}
            <div>
                {this.command.schema && <div className="flex gap-h-10">
                    <span className="flex-auto gap-l-10"><S>是否打开编辑视图</S></span>
                    <SelectBox className={'flex-fixed item-hover remark  round padding-l-5'} onChange={e => this.command.onUpdateProps({ schemaViewId: e })} value={this.command.schemaViewId} options={[
                        { text: lst('关闭'), value: '' },
                        { type: MenuItemType.divide, visible: this.command.schema.views.length > 0 },
                        ...this.command.schema.views.findAll(g => [BlockUrlConstant.RecordPageView].includes(g.url as any)).map(n => ({
                            text: n.text,
                            value: n.id
                        }))
                    ]}></SelectBox>
                </div>}
                {this.command.schema && <div className="flex gap-h-10 ">
                    <span className="flex-auto  gap-l-10"><S>编辑满足</S></span>
                    <span onMouseDown={e => this.onFilter(e)} className="flex-fixed item-hover remark  padding-w-5 round cursor">
                        {this.command.filter?.items?.length || ''}<S>条件</S>
                    </span>
                </div>}
                {this.command.schema && this.command.fields.map(f => {
                    var fe = this.command.schema.fields.find(g => g.id == f.fieldId);
                    return <div className="flex gap-h-10" key={f.id}>
                        <span className="flex-fixed w-120 flex-end " onMouseDown={e => this.changeField(e, f)}>
                            <span className="flex item-hover round padding-w-5 cursor">
                                <span className="flex-center remark">
                                    <Icon size={16} icon={GetFieldTypeSvg(fe.type)}></Icon>
                                </span>
                                <span className="gap-l-5">{fe.text}</span>
                                <Icon className={'remark'} size={16} icon={ChevronDownSvg}></Icon>
                            </span>
                        </span>
                        <span className="flex-auto gap-l-10">
                            {renderFieldInput(this, f)}
                        </span>
                    </div>
                })}
                {this.command.schema && <div onMouseDown={e => this.addField(e)}><span className="gap-l-10 item-hover remark  round padding-w-5 cursor h-24 flex flex-line"><Icon icon={PlusSvg} size={16} className={'flex-center size-20'}></Icon><S>添加字段值</S><Icon className={'gap-l-3'} icon={ChevronDownSvg} size={14}></Icon></span></div>}
            </div>
        </div>
    }
}

@flow('/batchEditRecords')
export class BatchEditRecordsCommand extends FlowCommand {
    constructor() {
        super();
    }
    schemaId: string = '';
    schema: TableSchema;
    schemaViewId: string = '';
    get schemaView() {
        if (this.schema) return this.schema.views.find(g => g.id == this.schemaViewId)
    }
}

@flowView('/batchEditRecords')
export class BatchRecordsCommandView extends FlowCommandView<EditRecordsCommand> {
    renderView() {
        return <div>
            {this.renderHead(<Icon size={16} icon={{ name: 'bytedance-icon', code: 'helpcenter' }}></Icon>,
                <><S>添加数据至</S>
                    {this.command.schema && <span>{this.command.schema?.text}</span>}
                    {!this.command.schema && <span><S>数据表</S></span>}
                    {this.command.schema && <span>
                        {this.command.schemaView && <span>{this.command.schemaView?.text}</span>}
                        {!this.command.schemaView && <span><S>选择视图模板</S></span>}
                    </span>}
                </>)}
            <div>
                <div><S>设置字段值</S></div>
            </div>
        </div>
    }
}


@flow('/batchDeleteRecords')
export class BatchDeleteRecordsCommand extends FlowCommand {
    constructor() {
        super();
    }
    schemaId: string = '';
    schema: TableSchema;
    schemaViewId: string = '';
    get schemaView() {
        if (this.schema) return this.schema.views.find(g => g.id == this.schemaViewId)
    }
}

@flowView('/batchDeleteRecords')
export class BatchDeleteRecordsCommandView extends FlowCommandView<EditRecordsCommand> {
    renderView() {
        return <div>
            {this.renderHead(<Icon size={16} icon={{ name: 'bytedance-icon', code: 'helpcenter' }}></Icon>,
                <><S>添加数据至</S>
                    {this.command.schema && <span>{this.command.schema?.text}</span>}
                    {!this.command.schema && <span><S>数据表</S></span>}
                    {this.command.schema && <span>
                        {this.command.schemaView && <span>{this.command.schemaView?.text}</span>}
                        {!this.command.schemaView && <span><S>选择视图模板</S></span>}
                    </span>}
                </>)}
            <div>
                <div><S>设置字段值</S></div>
            </div>
        </div>
    }
}