import React from "react"
import { TableStoreBoard } from "."
import { Block } from "../../../../src/block"
import { DataGridView } from "../base"
import lodash from "lodash"

import { DotsSvg, PlusSvg, EyeHideSvg } from "../../../../component/svgs"
import { useSelectMenuItem } from "../../../../component/view/menu"
import { MenuItem, MenuItemType } from "../../../../component/view/menu/declare"
import { Tip } from "../../../../component/view/tooltip/tip"
import { lst } from "../../../../i18n/store"
import { S, Sp } from "../../../../i18n/view"
import { BlockRenderRange } from "../../../../src/block/enum"
import { Rect } from "../../../../src/common/vector/point"
import { FieldType } from "../../schema/type"
import { GetFieldTypeSvg } from "../../schema/util"
import { ViewField } from "../../schema/view"
import { CardFactory } from "../../template/card/factory/factory"
import { Icon } from "../../../../component/view/icon"
import { ToolTip } from "../../../../component/view/tooltip"
import { DataGridTableItem } from "../table/row"
import { TableGridItem } from "../item"
import { GenreConsistency } from "../../../../net/genre"
import { useInputIconAndText } from "../../../../component/view/input/iconAndText"

export class BoardContent extends React.Component<{
    block: Block,
    childs?: Block[],
    groupHead?: ArrayOf<DataGridView['dataGroupHeads']>
}> {
    get block() {
        return this.props.block as TableStoreBoard
    }
    get groupHead() {
        return this.props.groupHead;
    }
    onDrag(event: React.MouseEvent,
        block: TableGridItem) {
        if (this.block.dataGridIsCanEdit()) {
            // event.stopPropagation();
            this.block.page.kit.handle.onDirectDrag(block, event.nativeEvent, {
                isOnlyDrag: true,
                notDragFun: (ev) => {

                    this.block.onOpenEditForm(block.dataId)
                }
            });
        }
        else {
            this.block.onOpenEditForm(block.dataId)
        }
    }
    async onOpenFieldStat(e: React.MouseEvent) {
        var getField = (f: ViewField) => {
            var items: MenuItem[] = [
                // { text: lst('无'), value: 'none' },
                { text: lst('总行数'), value: 'total' },
                { text: lst('唯一值'), value: 'uniqueValue' },
                { text: lst('未填写'), value: 'notFilled' },
                { text: lst('已填写'), value: 'filled' },
                { text: lst('未填写占比'), value: 'notFilledPercent' },
                { text: lst('已填写占比'), value: 'filledPercent' },
            ];
            if ([FieldType.date, FieldType.createDate, FieldType.modifyDate].includes(f.field?.type)) {
                items.push(
                    ...[
                        { type: MenuItemType.divide },
                        { text: lst('最早'), value: 'dateMin' },
                        { text: lst('最晚'), value: 'dateMax' },
                        { text: lst('时间差'), value: 'dateRange' },
                    ]
                )
            }
            if ([FieldType.number, FieldType.autoIncrement, FieldType.price].includes(f.field?.type)) {
                items.push(
                    ...[
                        { type: MenuItemType.divide },
                        { text: lst('求和'), value: 'sum' },
                        { text: lst('平均'), value: 'agv' },
                        { text: lst('最小'), value: 'min' },
                        { text: lst('最大'), value: 'max' },
                        { text: lst('数字范围'), value: 'range' },
                    ]
                )
            }
            return items;
        }
        var items = this.block.fields.findAll(c => c.field && this.block.groupFieldId != c.field?.id ? true : false).map(f => {
            var cs = getField(f);
            cs.forEach(c => {
                if (typeof c.value == 'string') {
                    c.value = { id: f.id, value: c.value };
                    if (this.block.statField?.fieldId)
                        c.checkLabel = this.block.statField.fieldId == f.id && this.block.statField.stat == c.value;
                }
            })
            return {
                text: f.field.name,
                icon: GetFieldTypeSvg(f.field),
                childs: cs
            } as MenuItem;
        });
        var r = await useSelectMenuItem(
            { roundArea: Rect.fromEle(e.currentTarget as HTMLElement) },
            items);
        if (r) {
            await this.block.onUpdateProps({ statField: r.item.value });
        }
    }
    async onChangeGroupTitle(dg: ArrayOf<TableStoreBoard['dataGroups']>, event: React.MouseEvent) {
        var r = await useInputIconAndText({ roundArea: Rect.fromEle(event.currentTarget as HTMLElement) },
            {
                text: dg.group,
                ignoreIcon: true
            });
        if (r) {
            if (r.text && r.text != dg.group) {
                dg.group = r.text;
                var ops = lodash.cloneDeep(this.block.groupField.config?.options)
                var opp = ops?.find(op => op.value == dg.value);
                if (opp) {
                    opp.text = r.text;
                }
                var cfg = lodash.cloneDeep(this.block.groupField.config);
                cfg.options = ops;
                await this.block.onUpdateField(this.block.groupField, { config: cfg });
            }
        }
    }
    renderGroup(dg: ArrayOf<TableStoreBoard['dataGroups']>, index: number) {
        var bs = this.props.childs || this.block.childs;
        var name = dg.name;
        var cs = bs.findAll(g => {
            var x = (g as DataGridTableItem).dataRow;
            if (lodash.isNull(dg.value) && (lodash.isUndefined(x[name]) || Array.isArray(x[name]) && lodash.isEqual(x[name], []) || lodash.isNull(x[name]))) return true;
            else if (x[name] === dg.value || Array.isArray(x[name]) && x[name].includes(dg.value)) return true;
            else return false;
        })
        var ds = this.block.groupStats.find(g => g.groupId == dg.value)
        if (this.props.groupHead) ds = this.block.groupStats.find(g => g.groupId == dg.value && lodash.isEqual(g.groupViewId, this.props.groupHead.id));

        return <div
            className="sy-data-grid-board-group visible-hover"
            data-block-drop-panel={JSON.stringify(GenreConsistency.transform({
                [this.block.groupField.name]: dg.value
            }))}
            key={index}>
            <div className="sy-data-grid-board-group-head">
                <span className="flex-auto">
                    {!dg.group && <span className="text-1"><Sp text={'无{group}的数据'}
                        view={{ group: <em className="bold padding-w-3">{this.block.groupField.text}</em> }}></Sp></span>}
                    {dg.group && <span onMouseDown={e => {
                        e.stopPropagation();
                        this.onChangeGroupTitle(dg, e);
                    }} className="text-overflow cursor padding-w-6 f-14 padding-h-2  l-16" style={{ backgroundColor: dg.fill||dg.color || undefined,color:dg.textColor||'inherit' }}>{dg.group || lst('未定义')}</span>}
                    <label>{ds?.count}</label>
                </span>
                {this.block.isCanEdit() && <div className="flex-fixed flex">
                    <div onMouseDown={e => {
                        e.stopPropagation();
                        this.block.onOpenGroupEdit(dg, e, this.props.groupHead);
                    }} className="visible flex-center flex-fixed cursor size-24 round item-hover remark"><Icon size={16} icon={DotsSvg}></Icon></div>
                    <ToolTip overlay={<S>添加记录</S>}><div onMouseDown={e => this.block.onAddGroup(dg, this.props.groupHead)} className="visible remark flex-center flex-fixed cursor size-24 round item-hover">
                        <Icon icon={PlusSvg} size={18}></Icon>
                    </div></ToolTip>
                </div>
                }
            </div>
            <div className="sy-data-grid-board-group-childs gap-t-5">
                {cs.map(c => {
                    return <div onMouseDown={e => this.onDrag(e, c as any)} key={c.id}>{this.renderItem(c)}</div>
                })}
                {this.block.isCanEdit() && <ToolTip overlay={lst('新增数据')}><div onMouseDown={e => this.block.onAddGroup(dg, this.props.groupHead)} className=" gap-b-10 visible item-hover item-hover-light-focus flex-center text-1 round h-30 cursor">
                    <Icon size={18} icon={PlusSvg}></Icon>
                </div></ToolTip>
                }
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
    renderAddGroup() {
        var hgs = this.block.hideGroups;
        if (hgs.includes(null)) {
            hgs.remove(c => c === null);
            hgs.push(null)
        }
        return <div className="sy-data-grid-board-group visible-hover" >
            <div className="item-hover flex-center round h-30 cursor remark" onMouseDown={e => this.block.onAddNewGroup(e)}><Icon icon={PlusSvg}></Icon><S>新增分组</S></div>
            {hgs.length > 0 && hgs.map(hg => {
                var dg = this.block.dataGroups.find(c => c.value == hg)
                var ds = this.block.groupStats.find(g => g.groupId == dg.value)
                if (this.props.groupHead) ds = this.block.groupStats.find(g => g.groupId == dg.value && lodash.isEqual(g.groupViewId, this.props.groupHead.id));

                return <div className="flex min-h-30 visible-hover" key={hg}>
                    <span className="flex-auto">
                        {!dg.group && <span className="text-1"><Sp text={'无{group}的数据'}
                            view={{ group: <em className="bold padding-w-3">{this.block.groupField.text}</em> }}></Sp></span>}
                        {dg.group && <span className="text-overflow padding-w-6  f-14 padding-h-2  l-16 round cursor" style={{ backgroundColor: dg?.color }}>{dg?.group}</span>}
                        <label className="remark f-12 gap-l-5">{ds?.count}</label>
                    </span>
                    <Tip text='取消隐藏分组'><span onMouseDown={e => {
                        e.stopPropagation();
                        var hgs = lodash.cloneDeep(this.block.hideGroups);
                        lodash.remove(hgs, c => c == hg);
                        this.block.onUpdateProps({ hideGroups: hgs }, { range: BlockRenderRange.self });
                    }} className="flex-fixed visible  size-24 remark round item-hover cursor flex-center">
                        <Icon icon={EyeHideSvg} size={18}></Icon>
                    </span></Tip>
                    <span onMouseDown={e => {
                        e.stopPropagation();
                        this.block.onOpenGroupEdit(dg, e, this.props.groupHead);
                    }} className="flex-fixed visible size-24 remark round item-hover cursor  flex-center">
                        <Icon icon={DotsSvg} size={18}></Icon>
                    </span>
                </div>
            })}
        </div>
    }
    render() {
        return this.block.schema && <div className="sy-data-grid-board-list">
            {this.block.dataGroups.findAll(g => this.block.hideGroups.some(s => s == g.value) ? false : true).map((dg, i) => {
                return this.renderGroup(dg, i)
            })}
            {this.block.dataGridIsCanEdit() && this.renderAddGroup()}
        </div>
    }
}