import { PopoverPosition } from "../../../component/popover/position";
import { PopoverSingleton } from "../../../component/popover/popover";
import { FieldType, getFilterRollupFields, OnlyFieldTypes } from "../../../blocks/data-grid/schema/type";
import { Field, FieldConfig } from "../../../blocks/data-grid/schema/field";
import React from "react";
import { TableSchema } from "../../../blocks/data-grid/schema/meta";
import { getFieldStatItems, GetFieldTypeSvg } from "../../../blocks/data-grid/schema/util";
import { EventsComponent } from "../../../component/lib/events.component";
import { ChevronDownSvg } from "../../../component/svgs";
import { useSelectMenuItem } from "../../../component/view/menu";
import { Rect } from "../../../src/common/vector/point";
import { useOpenEmoji } from "../../emoji";
import { getMenus } from "./view";
import { Divider } from "../../../component/view/grid";
import { Icon } from "../../../component/view/icon";
import { Input } from "../../../component/view/input";
import { Switch } from "../../../component/view/switch";
import { getEmoji } from "../../../net/element.type";
import { DataGridView } from "../../../blocks/data-grid/view/base";
import lodash from "lodash";
import { MenuItem, MenuItemType } from "../../../component/view/menu/declare";
import { lst } from "../../../i18n/store";
import { S } from "../../../i18n/view";
import { HelpText } from "../../../component/view/text";
import { useFormula } from "../formula/lazy";
import { useFilterInput } from "../../../component/view/input/filter";
import { IconArguments } from "../../icon/declare";
import './style.less';
import { util } from "../../../util/util";

export class TableFieldView extends EventsComponent {
    onSave() {
        var self = this;
        self.emit('save', {
            text: self.text,
            type: self.type,
            config: lodash.cloneDeep(self.config)
        });
    }
    get() {
        var self = this;
        if (self.type == FieldType.relation && self.config.relationDouble) {
            if (!self.config.relationFieldText) {
                self.config.relationFieldText = self.dataGrid.schema.text;
            }
        }
        return {
            text: self.text || self.maybeFieldText,
            type: self.type,
            icon: self.icon,
            config: lodash.cloneDeep(self.config)
        }
    }
    async openSelectRelationTable(event: React.MouseEvent) {
        event.stopPropagation();
        var rect = Rect.fromEle(event.currentTarget as HTMLElement);
        var items: MenuItem[] = [];
        items.push({ text: lst('选择关联的数据表'), type: MenuItemType.text });
        var rs: MenuItem[] = [];
        this.relationSchemas.forEach(g => {
            rs.push({
                text: g.text,
                icon: g.icon || { name: 'byte', code: 'table' },
                value: g.id,
                checkLabel: g.id == this.config.relationTableId,
                remark: util.showTime(g.createDate)
            })
        });
        items.push({
            type: MenuItemType.container,
            containerHeight: 300,
            childs: rs
        })
        var r = await useSelectMenuItem({ roundArea: rect }, items);
        if (r) {
            var sch = this.relationSchemas.find(g => g.id == r.item.value)
            this.maybeFieldText = sch.text;
            await this.onChangeConfig({ relationTableId: r.item.value as string });
        }
    }
    async openSelectType(event: React.MouseEvent) {
        event.stopPropagation();
        var menus = getMenus();
        var os = this.dataGrid.schema.fields.filter(g => g.visible !== false && OnlyFieldTypes.includes(g.type));
        if (os.length > 0) {
            menus = menus.filter(g => !os.some(s => s.type == g.value));
        }
        var um = await useFilterInput(
            {
                roundArea: Rect.fromEle(event.currentTarget as HTMLElement),
                direction: 'left',
                align: 'center'
            },
            {
                options: menus,
                placeholder: lst('搜索字段类型'),
                width: 250,
                height: 400
            });
        if (um) {
            await this.changeType(um.value);
        }
    }
    input: Input;
    maybeFieldText: string = '';
    render() {
        var self = this;
        var ms = getMenus();
        var tm = ms.find(g => g.value == this.type);
        return <div className="w-300 f-14 text">
            <div className="flex  h-20 gap-t-5 f-14 padding-w-10 text-1 b-500">
                <span>{this.fieldId ? lst("编辑字段") : lst("新增字段")}</span>
            </div>
            <Divider></Divider>
            <div className="max-h-250 overflow-y">
                <div className="gap-h-5  h-28 gap-w-5 padding-w-5 flex round">
                    <div className="flex-fixed size-24 cursor gap-r-10 border round  flex-center">
                        <Icon size={16} icon={this.icon || GetFieldTypeSvg({ type: this.type } as any)}></Icon>
                    </div>
                    <div className="flex-auto">
                        <Input focusSelectionAll onEnter={e => {
                            this.text = e;
                            this.onSave()
                        }} placeholder={this.maybeFieldText || lst('字段名称')}
                            ref={e => this.input = e}
                            onChange={e => this.text = e}
                            value={this.text}></Input>
                    </div>
                </div>
                <div className="gap-h-5  h-28 gap-w-5 padding-w-5 flex round item-hover-light cursor" onClick={e => this.openSelectType(e)}>
                    <div className="flex-auto  f-14"><S>字段类型</S></div>
                    <div className="flex-fixed flex remark">
                        <span className="flex-fixed flex-center  size-20  cursor  round "><Icon size={14} icon={GetFieldTypeSvg({ type: this.type } as any)}></Icon></span>
                        <span className="flex-fixed ">{tm?.text}</span>
                        <span className="flex-fixed size-20 round  flex-center">
                            <Icon size={14} icon={ChevronDownSvg}></Icon>
                        </span>
                    </div>
                </div>
                {this.renderRelation()}
                {this.renderRollup()}
                {this.renderFormula()}
                {this.renderMultiple()}
                {this.renderEmoji()}
            </div>
            <Divider></Divider>
            <div className="gap-h-5 flex  h-28 gap-w-5 padding-w-5">
                <HelpText url={window.shyConfig?.isUS ? "https://help.shy.red/page/43#2PRKjiNkLmU6w4xciiy1t1" : "https://help.shy.live/page/1871#gVnf6Ar2iF5wa2fS2KpLws"}><S>了解数据表字段</S></HelpText>
            </div>
        </div>
    }
    renderMultiple() {
        if ([
            FieldType.file,
            FieldType.video,
            FieldType.user,
            FieldType.image,
            FieldType.audio
        ].includes(this.type)) {
            return <div className="gap-h-5  h-28 gap-w-5 padding-w-5 flex round item-hover-light cursor ">
                <span className="flex-auto"><S>是否允许多个</S></span>
                <div className="flex-fixed flxe-end"><Switch onChange={e => this.onChangeConfig({ isMultiple: e })} checked={this.config?.isMultiple ? true : false}></Switch></div>
            </div>
        }
        else return <></>
    }
    renderRelation() {
        if (this.type != FieldType.relation) return <></>
        var rt = this.relationSchemas.find(g => g.id == this.config.relationTableId)
        return <>
            <div className="gap-h-5  h-28 gap-w-5 padding-w-5 flex round item-hover-light cursor" onClick={e => this.openSelectRelationTable(e)}>
                <div className="flex-auto gap-b-5"><S>关联表格</S></div>
                <div className="flex-fixed flex remark">
                    <span className="flex-center  size-20  flex-fix cursor  round "><Icon size={14} icon={rt?.icon || { name: 'byte', code: 'table' }}></Icon></span>
                    <span className="flex-auto ">{rt?.text}</span>
                    <span className="flex-fixed size-20 round  flex-center">
                        <Icon size={14} icon={ChevronDownSvg}></Icon>
                    </span>
                </div>
            </div>
            {this.config.relationTableId && <div>
                <Divider></Divider>
                <div className="gap-h-5  h-28 gap-w-5 padding-w-5 flex round item-hover-light cursor">
                    <span className="flex-auto "><S>是否一对多</S></span>
                    <div className="flex-fixed"><Switch onChange={e => this.onChangeConfig({ isMultiple: e })} checked={this.config?.isMultiple ? true : false}></Switch></div>
                </div>
                <div className="gap-h-5  h-28 gap-w-5 padding-w-5 flex round item-hover-light cursor">
                    <span className="flex-auto "><S>是否双向关联</S></span>
                    <div className="flex-fixed"><Switch disabled={this.fieldId ? true : false} onChange={e => this.onChangeConfig({ relationDouble: e })} checked={this.config?.relationDouble ? true : false}></Switch></div>
                </div>

                {this.config?.relationDouble && <div className="gap-h-5 gap-w-5 padding-w-5">
                    <div className="remark f-12"><S>创建关联字段</S></div>
                    <div className="h-26 cursor">
                        <Input readonly={this.fieldId ? true : false}
                            placeholder={this.dataGrid.schema?.text}
                            value={this.config.relationFieldText} onChange={e => {
                                this.config.relationFieldText = e;
                                this.forceUpdate()
                            }}></Input>
                    </div>
                </div>}

            </div>}
        </>
    }
    renderRollup() {
        var self = this;
        if (this.type != FieldType.rollup) return <></>;
        var rs = this.dataGrid.schema.fields.findAll(g => g.type == FieldType.relation);
        if (rs.length == 0) return <>
            <div className="flex-center gap-h-5 remark">
                <S text="没有关联的表无法检索引用">没有关联的数据表,无法检索引用</S>
            </div>
        </>
        var relationField = rs.find(g => g.id == this.config.rollupRelationFieldId)
        var rollTableSchema = this.relationSchemas.find(g => g.id == relationField?.config?.relationTableId);
        async function selectRelationFields(event: React.MouseEvent) {
            var rect = Rect.fromEle(event.currentTarget as HTMLElement)
            var r = await useSelectMenuItem({ roundArea: rect }, rs.map(r => {
                return {
                    icon: GetFieldTypeSvg(r),
                    text: r.text,
                    value: r.id,
                    checkLabel: r.id == self.config.rollupRelationFieldId
                }
            }), {
                width: rect.width,
            });
            if (r?.item) {
                self.config.rollupRelationFieldId = r.item.value;
                var re = self.dataGrid.schema.fields.find(g => g.id == r.item.value);
                var sch = self.relationSchemas.find(g => g.id == re.config.relationTableId);
                if (!(self.config.rollupFieldId && sch.fields.some(g => g.id == self.config.rollupFieldId))) {
                    self.config.rollupFieldId = sch.fields.find(g => g.type == FieldType.title)?.id;
                }
                self.forceUpdate();
            }
        }
        var vfs = getFilterRollupFields(rollTableSchema.visibleFields)
        async function selectField(event: React.MouseEvent) {
            var rect = Rect.fromEle(event.currentTarget as HTMLElement)
            var r = await useSelectMenuItem({ roundArea: rect }, vfs.map(r => {
                return {
                    text: r.text,
                    value: r.id,
                    icon: GetFieldTypeSvg(r),
                    checkLabel: r.id == self.config.rollupFieldId
                }
            }), {
                width: rect.width,
            });
            if (r?.item) {
                self.config.rollupFieldId = r.item.value;
                self.maybeFieldText = r.item.text;
                self.forceUpdate();
            }
        }
        var f = vfs.find(g => g.id == self.config.rollupFieldId);
        var statMenus = getFieldStatItems(f?.type);
        statMenus.splice(0, 1, {
            text: lst('显示原值'),
            value: 'origin',
        }, {
            text: lst('显示唯一原值'),
            value: 'uniqueOrigin',
        }, { type: MenuItemType.divide });
        async function selectS(event: React.MouseEvent) {
            var rect = Rect.fromEle(event.currentTarget as HTMLElement)
            var r = await useSelectMenuItem({ roundArea: rect }, statMenus.map(r => {
                return {
                    text: r.text,
                    value: r.value,
                    type: r.type,
                    checkLabel: self.config.rollupStatistic == r.value
                }
            }), {
                width: rect.width,
            });
            if (r?.item) {
                self.config.rollupStatistic = r.item.value;
                self.forceUpdate()
            }
        }
        return <>
            <div onClick={e => selectRelationFields(e)} className="gap-h-5  h-28 gap-w-5 padding-w-5 flex round item-hover-light cursor">
                <div className="flex-auto "><S>关联字段</S></div>
                <div
                    className="flex flex-fixed  remark">
                    <span className="flex-center  size-24  flex-fix cursor  round "><Icon size={14} icon={GetFieldTypeSvg(relationField)}></Icon></span>
                    <span className="flex-auto ">{relationField?.text}</span>
                    <span className="flex-fixed size-24 round  flex-center">
                        <Icon size={14} icon={ChevronDownSvg}></Icon>
                    </span>
                </div>
            </div>
            {rollTableSchema?.visibleFields && <>
                <div onClick={e => selectField(e)} className="gap-h-5  h-28 gap-w-5 padding-w-5 flex round item-hover-light cursor">
                    <label className="flex-auto "><S>字段</S></label>
                    <div className="flex remark flex-fixed ">
                        <span className="flex-center  size-20  flex-fix cursor  round "> <Icon size={16} className={'text-1'} icon={GetFieldTypeSvg(rollTableSchema.visibleFields.find(g => g.id == this.config.rollupFieldId))}></Icon></span>
                        <span className="flex-auto ">{rollTableSchema.visibleFields.find(g => g.id == this.config.rollupFieldId)?.text}</span>
                        <span className="flex-fixed size-20 round  flex-center">
                            <Icon size={14} icon={ChevronDownSvg}></Icon>
                        </span>
                    </div>
                </div>
                {this.config.rollupFieldId && <div onClick={e => selectS(e)} className="gap-h-5  h-28 gap-w-5 padding-w-5 flex round item-hover-light cursor">
                    <label className="flex-auto"><S>计算</S></label>
                    <div className="flex remark flex-fixed ">
                        <span className="flex-center  size-20  flex-fix cursor  round "> <Icon icon={statMenus.find(g => g.value == this.config.rollupStatistic)?.icon as any} size={16} className={'text-1'} ></Icon></span>
                        <span className="flex-auto ">{statMenus.find(g => g.value == this.config.rollupStatistic)?.text}</span>
                        <span className="flex-fixed size-20 round  flex-center">
                            <Icon size={14} icon={ChevronDownSvg}></Icon>
                        </span>
                    </div>
                </div>}
            </>
            }
        </>
    }
    renderFormula() {
        if (this.type != FieldType.formula) return <></>
        var openEditFormula = async (event: React.MouseEvent) => {
            var formula = await useFormula({ roundArea: Rect.fromEle(event.currentTarget as HTMLElement) }, {
                schema: this.dataGrid.schema,
                formula: this.config?.formula?.formula || ''
            });
            if (!lodash.isUndefined(formula)) this.config.formula = formula;
        }
        return <div onMouseDown={e => openEditFormula(e)} className="gap-h-5  h-28 gap-w-5 padding-w-5 flex round item-hover-light cursor">
            <div className="flex-auto "><S>公式</S></div>
            <div className="flex-fixed flex remark">
                <span className="flex-auto "><S>编辑</S></span>
                <span className="flex-fixed size-20 round  flex-center">
                    <Icon size={14} icon={ChevronDownSvg}></Icon>
                </span>
            </div>
        </div>
    }
    renderEmoji() {
        if ([FieldType.emoji].includes(this.type)) {
            return <div onClick={e => this.onSetEmoji(e)} className="gap-h-5  h-28 gap-w-5 padding-w-5 flex round item-hover-light cursor">
                <div className="flex-auto "><S>表情</S></div>
                <div className="flex flex-fixed remark ">
                    {this.config?.emoji?.code && <span className="f-20 l-20 size-20 round item-hover" dangerouslySetInnerHTML={{ __html: getEmoji(this.config?.emoji?.code) }}></span>}
                    {!this.config?.emoji?.code && <span><S>编辑</S></span>}
                    <span className="flex-fixed size-20 round  flex-center">
                        <Icon size={14} icon={ChevronDownSvg}></Icon>
                    </span>
                </div>
            </div>
        }
        else return <></>
    }
    async changeType(type: FieldType) {
        if (this.type != type) {
            var m = getMenus();
            this.type = type;
            var item = m.find(g => g.value == this.type);
            this.maybeFieldText = item?.text;
            if (!this.fieldId) {
                if (type == FieldType.relation) {
                    if (lodash.isUndefined(this.config.isMultiple))
                        this.config.isMultiple = true;
                    if (!this.config.relationTableId) {
                        this.config.relationTableId = this.relationSchemas.find(g => g.id != this.dataGrid.schema.id)?.id;
                        this.maybeFieldText = this.relationSchemas.find(g => g.id != this.dataGrid.schema.id)?.text;
                    }
                    if (!this.config.relationTableId) {
                        this.config.relationTableId = this.dataGrid.schema.id;
                        this.maybeFieldText = this.dataGrid.schema.text;
                    }
                }
                else if (type == FieldType.user) {
                    if (lodash.isUndefined(this.config.isMultiple))
                        this.config.isMultiple = false
                }
                else if (type == FieldType.file || type == FieldType.audio || type == FieldType.video || type == FieldType.image) {
                    if (lodash.isUndefined(this.config.isMultiple))
                        this.config.isMultiple = true;
                }
                else if (type == FieldType.rollup) {
                    if (!this.config.rollupStatistic) {
                        this.config.rollupStatistic = 'origin'
                    }
                    if (this.config.rollupRelationFieldId) {
                        if (!this.dataGrid.schema.fields.some(s => s.type == FieldType.relation && s.id == this.config.rollupRelationFieldId)) {
                            this.config.rollupRelationFieldId = undefined;
                        }
                    }
                    if (!this.config.rollupRelationFieldId) {
                        this.config.rollupRelationFieldId = this.dataGrid.schema.fields.find(g => g.type == FieldType.relation)?.id;
                    }
                    var rf = this.dataGrid.schema.fields.find(g => g.id == this.config.rollupRelationFieldId);
                    var rt = this.relationSchemas.find(g => g.id == rf.config.relationTableId);
                    if (rt && this.config.rollupFieldId && !rt.fields.some(c => c.id == this.config.rollupFieldId)) {
                        this.config.rollupFieldId = undefined;
                    }
                    if (rt && !this.config.rollupFieldId) {
                        this.config.rollupFieldId = rt.fields.find(g => g.type == FieldType.title)?.id;
                        this.maybeFieldText = rt.fields.find(g => g.type == FieldType.title)?.text;
                    }
                }
            }
            this.forceUpdate();
        }
    }
    private relationSchemas: TableSchema[] = [];

    async onSetEmoji(e: React.MouseEvent) {
        var r = await useOpenEmoji({ roundArea: Rect.fromEvent(e) });
        if (r) {
            await this.onChangeConfig({ emoji: r })
        }
    }

    private text: string = '';
    private icon: IconArguments;
    private type: FieldType;
    private config: FieldConfig = {};
    private fieldId: string = '';
    private dataGrid: DataGridView;
    async open(options: {
        field?: Field,
        dataGrid: DataGridView
    }) {
        this.fieldId = options?.field?.id || '';
        this.text = options.field?.text || '';
        this.type = options.field?.type || FieldType.text;
        this.icon = options?.field?.icon || null;
        this.config = lodash.cloneDeep(options.field?.config || {});
        this.relationSchemas = [];
        this.dataGrid = options.dataGrid;
        await TableSchema.onLoadAll()
        this.relationSchemas = TableSchema.getSchemas(this.dataGrid?.page?.ws?.id)
        console.log(this.relationSchemas,'relationSchemas....');
        this.forceUpdate();
    }
    async onChangeConfig(config: Partial<FieldConfig>) {
        Object.assign(this.config, config);
        this.forceUpdate();
    }
}

export async function useTableStoreAddField(pos: PopoverPosition,
    option: {
        field?: Field,
        dataGrid: DataGridView
    }) {
    let popover = await PopoverSingleton(TableFieldView, { mask: true });
    let fv = await popover.open(pos);
    fv.open(option);
    return new Promise((resolve: (data: { text: string, type: FieldType, config?: FieldConfig }) => void, reject) => {
        fv.only('save', (data: { text: string, type: FieldType, config?: FieldConfig }) => {
            popover.close();
            resolve(data);
        });
        fv.only('close', () => {
            popover.close();
            resolve(fv.get());
        })
        popover.only('close', () => {
            resolve(fv.get());
        })
    })
}