import { prop, url, view } from "../../../../src/block/factory/observable";
import { BlockView } from "../../../../src/block/view";
import React from 'react';
import { DataGridView } from "../base";
import { FieldType } from "../../schema/type";
import { BlockFactory } from "../../../../src/block/factory/block.factory";
import { TableStoreItem } from "../item";
import { DataGridTool } from "../components/tool";
import { CollectTableSvg, DotsSvg, EyeHideSvg, EyeSvg, PlusSvg } from "../../../../component/svgs";
import { Icon } from "../../../../component/view/icon";
import { lst } from "../../../../i18n/store";
import { S } from "../../../../i18n/view";
import { Spin } from "../../../../component/view/spin";
import { useSelectMenuItem } from "../../../../component/view/menu";
import { Rect } from "../../../../src/common/vector/point";
import lodash from "lodash";
import { Confirm } from "../../../../component/lib/confirm";
import { MenuItemType } from "../../../../component/view/menu/declare";
import { BlockRenderRange } from "../../../../src/block/enum";
import { OptionBackgroundColorList } from "../../../../extensions/data-grid/option/option";
import { DataGridOptionType } from "../../schema/field";
import { util } from "../../../../util/util";
import { ShyAlert } from "../../../../component/lib/alert";
import { Tip } from "../../../../component/view/tooltip/tip";
import { CardConfig } from "../item/service";
import { Block } from "../../../../src/block";
import { CardFactory } from "../../template/card/factory/factory";
import './style.less';

@url('/data-grid/board')
export class TableStoreBoard extends DataGridView {
    @prop()
    groupFieldId: string;
    @prop()
    hideGroups: string[] = [];
    get groupField() {
        return this.schema.fields.find(g => g.id == this.groupFieldId);
    }
    dataGroups: { name: string, group: string, color: string, value: string, count: number }[] = [];
    async loadData() {
        if (!this.groupFieldId) {
            this.groupFieldId = this.fields.find(g => g.field?.type == FieldType.option || g.field?.type == FieldType.options)?.field?.id;
            if (!this.groupFieldId) {
                this.groupFieldId = this.schema.fields.find(g => g.type == FieldType.option || g?.type == FieldType.options)?.id;
            }
        }
        if (this.groupField) {
            if (this.schema) {
                var name = this.groupField.name;
                var r = await this.schema.group({ group: name }, this.page.ws);
                if (r.data) {
                    var keys = r.data.list.map(l => l[name]);
                    var rl = await this.schema.all({ page: 1, filter: { [name]: { $in: keys } } }, this.page.ws);
                    this.data = rl.data.list;
                    if (this.groupField.type == FieldType.options || this.groupField.type == FieldType.option) {
                        var ops = this.groupField.config.options || [];
                        this.dataGroups = ops.map(op => {
                            return {
                                name: name,
                                group: op.text,
                                color: op.color,
                                value: op.value,
                                count: r.data.list.find(g => g[name] == op.value)?.count || 0
                            }
                        });
                        if (keys.exists(g => g === null)) {
                            this.dataGroups.push({
                                name: null,
                                group: null,
                                value: null,
                                color: null,
                                count: r.data.list.find(g => g[name] === null)?.count || 0
                            })
                        };
                    }
                }
            }
        }
    }
    async createItem() {
        this.blocks.childs = [];
        var name = this.groupField.name;
        for (let i = 0; i < this.dataGroups.length; i++) {
            var dg = this.dataGroups[i];
            var list = this.data.findAll(x => {
                if (dg.group === null && typeof x[name] == 'undefined') return true;
                else if (x[name] == dg.value) return true;
                else return false;
            });
            await list.eachAsync(async row => {
                var rowBlock: TableStoreItem = await BlockFactory.createBlock('/data-grid/item', this.page, { mark: dg.group, dataId: row.id }, this) as TableStoreItem;
                this.blocks.childs.push(rowBlock);
                await rowBlock.createElements();
            })
        }
    }
    async onAddGroup(dg: ArrayOf<TableStoreBoard['dataGroups']>) {
        if (dg?.name) {
            dg.count += 1;
            await this.onAddRow({ [dg.name]: dg.value });
        }
    }
    async onOpenGroupEdit(dg: ArrayOf<TableStoreBoard['dataGroups']>, event: React.MouseEvent) {
        await this.onDataGridTool(async () => {
            var isS = this.hideGroups.some(s => s == dg.value)
            var r = await useSelectMenuItem({ roundArea: Rect.fromEle(event.currentTarget as HTMLElement) }, [
                { name: isS ? "cancel" : 'hidden', icon: isS ? EyeHideSvg : EyeSvg, text: isS ? lst('取消隐藏') : lst('隐藏') },
                { type: MenuItemType.divide },
                { name: 'addRow', icon: PlusSvg, text: lst('新增数据') },
                { type: MenuItemType.divide },
                { name: 'deleteAllRows', icon: { name: 'bytedance-icon', code: 'clear' }, text: lst('删除数据') },
                { name: 'deleteGroup', icon: { name: 'bytedance-icon', code: 'delete-two' }, text: lst('删除数据及分组') }
            ]);
            if (r?.item) {
                if (r.item.name == 'hidden') {
                    var rg = lodash.cloneDeep(this.hideGroups);
                    rg.push(dg.value);
                    await this.onUpdateProps({ hideGroups: rg }, { range: BlockRenderRange.self });
                }
                else if (r.item.name == 'cancel') {
                    var rg = lodash.cloneDeep(this.hideGroups);
                    lodash.remove(rg, c => c == dg.value);
                    await this.onUpdateProps({ hideGroups: rg }, { range: BlockRenderRange.self });
                }
                else if (r.item.name == 'deleteAllRows') {
                    if (await Confirm(lst('确定要删除分组下面的所有数据吗'))) {
                        await this.schema.rowRemovesByFilter({ [dg.name]: dg.value })
                        dg.count = 0;
                        lodash.remove(this.data, c => c[dg.name] == dg.value);
                        this.forceUpdate()
                    }
                }
                else if (r.item.name == 'deleteGroup') {
                    if (await Confirm(lst('确定要删除分组吗'))) {
                        await this.schema.rowRemovesByFilter({ [dg.name]: dg.value })
                        dg.count = 0;
                        lodash.remove(this.data, c => c[dg.name] == dg.value);
                        lodash.remove(this.dataGroups, c => c.value == dg.value);
                        var field = this.schema.fields.find(f => f.id == this.groupFieldId);
                        var cg = lodash.cloneDeep(field.config);
                        lodash.remove(cg.options, c => c.value == dg.value);
                        await this.onUpdateField(this.groupField, { config: cg })
                    }
                }
                else if (r.item.name == 'addRow') {
                    dg.count += 1;
                    await this.onAddGroup(dg);
                    if (isS) ShyAlert(lst('添加成功'))
                }
            }
        })
    }
    async onAddNewGroup(event: React.MouseEvent) {
        await this.onDataGridTool(async () => {
            var ops = lodash.cloneDeep(this.groupField.config.options || []);
            var or = OptionBackgroundColorList().find(g => ops.some(s => s.color == g.color) ? false : true);
            var op: DataGridOptionType = { text: '', value: util.guid(), color: or?.color || OptionBackgroundColorList[0].color };
            await this.onOpenFieldOptions(ops, op, event);
            if (op.text) {
                ops.push(op);
                var config = lodash.cloneDeep(this.groupField.config);
                if (typeof config == 'undefined') config = {};
                config.options = ops;
                this.dataGroups.push({
                    name: this.groupField.name,
                    group: op.text,
                    value: op.value,
                    color: op.color,
                    count: 0
                })
                await this.onUpdateField(this.groupField, { config });
            }
        })
    }
    async onRemoveRow(id: string) {
        await super.onRemoveRow(id);
        await this.loadData();
        this.forceUpdate();
    }
    async onCloneRow(this: DataGridView, data: any) {
        await super.onCloneRow(data);
        await this.loadData();
        this.forceUpdate();
    }
    @prop()
    cardConfig: CardConfig = {
        auto: false,
        showCover: false,
        coverFieldId: "",
        showField: 'none',
        coverAuto: false,
        showMode: 'default',
        templateProps: {}
    };
    getCardUrl() {
        if (this.cardConfig?.showMode == 'define') {
            return this.cardConfig.templateProps.url;
        }
    }
    get isCardAuto() {
        return this.cardConfig?.auto || this.cardConfig.showMode == 'define'
    }
}

@view('/data-grid/board')
export class TableStoreBoardView extends BlockView<TableStoreBoard>{
    renderGroup(dg: ArrayOf<TableStoreBoard['dataGroups']>, index: number) {
        var cs = this.block.childs.findAll(g => g.mark == dg.group);
        return <div className="sy-data-grid-board-group visible-hover" key={index}>
            <div className="sy-data-grid-board-group-head">
                <span className="flex-auto"><span className="text-overflow padding-w-6 f-14 padding-h-2  l-16" style={{ backgroundColor: dg.color || undefined }}>{dg.group || lst('未定义')}</span><label>{dg.count}</label></span>
                {this.block.isCanEdit() && <div className="flex-fixed flex">
                    <div onMouseDown={e => {
                        e.stopPropagation();
                        this.block.onOpenGroupEdit(dg, e);
                    }} className="flex-center flex-fixed cursor size-24 round item-hover"><Icon size={16} icon={DotsSvg}></Icon></div>
                    <div onMouseDown={e => this.block.onAddGroup(dg)} className="flex-center flex-fixed cursor size-24 round item-hover">
                        <Icon icon={PlusSvg} size={16}></Icon>
                    </div>
                </div>
                }
            </div>
            <div className="sy-data-grid-board-group-childs">
                {cs.map(c => {
                    return <div key={c.id}>{this.renderItem(c)}</div>
                })}
                {this.block.isCanEdit() && <div onMouseDown={e => this.block.onAddGroup(dg)} className="f-12 gap-b-10 visible item-hover item-hover-light-focus flex text-1 round h-30 cursor">
                    <Icon size={18} className={'gap-l-10'} icon={PlusSvg}></Icon>
                    <S>新增</S>
                </div>}
            </div>
        </div>
    }
    renderItem(itemBlock: Block) {
        if (this.block.cardConfig.showMode == 'define' && this.block.cardConfig.templateProps.url) {
            var CV = CardFactory.getCardView(this.block.cardConfig.templateProps.url);
            if (CV) return <CV item={itemBlock as any} dataGrid={this.block}></CV>
        }
        return <itemBlock.viewComponent block={itemBlock}></itemBlock.viewComponent>
    }
    renderCreateTable() {
        return !this.block.schema && this.block.isCanEdit() && <div className="item-hover item-hover-focus cursor round flex" onClick={e => this.block.onCreateTableSchema()}>
            {this.block.willCreateSchema && <Spin></Spin>}
            <span className="size-24 flex-center remark"><Icon size={16} icon={CollectTableSvg}></Icon></span>
            <span className="remark"><S>创建数据表格</S></span>
        </div>
    }
    renderAddGroup() {
        return <div className="sy-data-grid-board-group visible-hover" >
            <div className="item-hover flex-center round h-30 cursor remark" onMouseDown={e => this.block.onAddNewGroup(e)}><Icon icon={PlusSvg}></Icon><S>新增分组</S></div>
            {this.block.hideGroups.length > 0 && this.block.hideGroups.map(hg => {
                var dg = this.block.dataGroups.find(c => c.value == hg)
                return <div className="flex" key={hg}>
                    <span className="flex-auto">
                        <span className="text-overflow padding-w-6  f-14 padding-h-2  l-16 round " style={{ backgroundColor: dg?.color }}>{dg?.group || lst('未定义')}</span>
                        <label className="remark f-12 gap-l-5">{dg?.count}</label>
                    </span>
                    <Tip text='取消隐藏分组'><span onMouseDown={e => {
                        e.stopPropagation();
                        var hgs = lodash.cloneDeep(this.block.hideGroups);
                        lodash.remove(hgs, c => c == hg);
                        this.block.onUpdateProps({ hideGroups: hgs }, { range: BlockRenderRange.self });
                    }} className="flex-fixed size-24 round item-hover cursor flex-center">
                        <Icon icon={EyeHideSvg} size={18}></Icon>
                    </span></Tip>
                    <span onMouseDown={e => {
                        e.stopPropagation();
                        this.block.onOpenGroupEdit(dg, e);
                    }} className="flex-fixed size-24 round item-hover cursor  flex-center">
                        <Icon icon={DotsSvg} size={18}></Icon>
                    </span>
                </div>
            })}
        </div>
    }
    renderView() {
        return <div className='sy-data-grid-board' onMouseEnter={e => this.block.onOver(true)}
            onMouseLeave={e => this.block.onOver(false)}>
            <DataGridTool block={this.block}></DataGridTool>
            <div className="sy-data-grid-board-list">
                {this.block.dataGroups.findAll(g => this.block.hideGroups.some(s => s == g.value) ? false : true).map((dg, i) => {
                    return this.renderGroup(dg, i)
                })}
                {this.block.isCanEdit() && this.renderAddGroup()}
            </div>
            {this.renderCreateTable()}
        </div>
    }
}