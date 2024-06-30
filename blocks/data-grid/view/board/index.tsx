import { prop, url, view } from "../../../../src/block/factory/observable";
import { BlockView } from "../../../../src/block/view";
import React from 'react';
import { DataGridView } from "../base";
import { FieldType } from "../../schema/type";
import { TableGridItem } from "../item";
import { DataGridTool } from "../components/tool";
import { CheckSvg, EyeHideSvg, EyeSvg, PlusSvg } from "../../../../component/svgs";
import { Icon } from "../../../../component/view/icon";
import { lst } from "../../../../i18n/store";
import { S } from "../../../../i18n/view";
import { Spin, SpinBox } from "../../../../component/view/spin";
import { useSelectMenuItem } from "../../../../component/view/menu";
import { Rect } from "../../../../src/common/vector/point";
import lodash from "lodash";
import { Confirm } from "../../../../component/lib/confirm";
import { MenuItemType } from "../../../../component/view/menu/declare";
import { BlockRenderRange } from "../../../../src/block/enum";
import { DataGridOptionType } from "../../schema/field";
import { util } from "../../../../util/util";
import { ShyAlert } from "../../../../component/lib/alert";
import { CardConfig } from "../item/service";
import './style.less';
import { OptionBackgroundColorList } from "../../../../extensions/color/data";
import { DataGridGroup } from "../components/group";
import { BoardContent } from "./content";
import { GroupHeadType, GroupIdType } from "../declare";
import { Divider } from "../../../../component/view/grid";
import { DropDirection } from "../../../../src/kit/handle/direction";
import { Block } from "../../../../src/block";
import { ScrollXDataGridBoard } from "./xscroll";
import { ObserverWidth } from "../../../../src/common/Observer.width";

@url('/data-grid/board')
export class TableStoreBoard extends DataGridView {
    @prop()
    groupFieldId: string;
    @prop()
    hideGroups: string[] = [];
    @prop()
    statField: { fieldId: string, stat: string } = { fieldId: '', stat: '' };
    get groupField() {
        return this.schema.fields.find(g => g.id == this.groupFieldId);
    }
    groupStats: {
        /**
         * groupId 具体指里面的option的值
         */
        groupId: string,
        count?: number | Date,
        total?: number | Date
        groupViewId?: GroupIdType
    }[] = [];
    dataGroups: {
        name: string,
        group: string,
        color: string,
        fill: string,
        value: string,
    }[] = [];
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
                if (this.groupField.type == FieldType.options || this.groupField.type == FieldType.option) {
                    var ops = this.groupField.config.options || [];
                    this.dataGroups = ops.map(op => {
                        return {
                            name: name,
                            group: op.text,
                            color: op.color,
                            fill: op.fill,
                            value: op.value,
                        }
                    });
                    this.dataGroups.push({
                        name: name,
                        group: null,
                        value: null,
                        color: null,
                        fill: null
                    })
                }
                if (this.hasGroup) {
                    var rcc = await this.schema.boardGroup({
                        group: this.groupFieldId,
                        hideGroups: this.hideGroups,
                        page: this.pageIndex,
                        size: this.size,
                        filter: this.getSearchFilter(),
                        sorts: this.getSearchSorts(),
                        groupView: this.groupView
                    }, this.page.ws);
                    var list = [];
                    this.dataGroupHeads = []
                    if (rcc.ok) {
                        var rd = (rcc.data as any).groupList as { id: GroupIdType, count: number, total?: number, boardGroupList: { id: string, total: number, list: any[] }[] }[];
                        if (Array.isArray(rd)) {
                            rd.forEach(rr => {
                                rr.boardGroupList.forEach(g => {
                                    g.list.forEach(cc => {
                                        cc.__group = rr.id;
                                        list.push(cc);
                                    })
                                    this.groupStats.push({
                                        groupId: g.id,
                                        count: g.total,
                                        groupViewId: rr.id,
                                    })
                                })
                                this.dataGroupHeads.push({
                                    id: rr.id,
                                    spread: false,
                                    count: rr.count,
                                    total: rr.total,
                                    value: rr.id,
                                    text: rr.id as any
                                })
                            })
                        }
                    }
                    if (this.groupView.sort == 'asc') {
                        this.dataGroupHeads.sort((a, b) => {
                            if (lodash.isNull(b.id)) return -1;
                            if (typeof (a.id as any)?.min == 'number') {
                                return (a.id as any).min > (b.id as any).min ? 1 : -1
                            }
                            return a.id > b.id ? 1 : -1
                        })
                        var nd = this.dataGroupHeads.find(g => lodash.isNull(g.id));
                        if (nd) {
                            lodash.remove(this.dataGroupHeads, c => lodash.isNull(c.id));
                            this.dataGroupHeads.splice(0, 0, nd);
                        }
                    }
                    else if (this.groupView.sort == 'desc') {
                        this.dataGroupHeads.sort((a, b) => {
                            if (lodash.isNull(a.id)) return -1;
                            if (typeof (a.id as any)?.min == 'number') {
                                return (a.id as any).min < (b.id as any).min ? 1 : -1
                            }
                            return a.id < b.id ? 1 : -1
                        })
                        var nd = this.dataGroupHeads.find(g => lodash.isNull(g.id));
                        if (nd) {
                            lodash.remove(this.dataGroupHeads, c => lodash.isNull(c.id));
                            this.dataGroupHeads.push(nd);
                        }
                    }
                    this.data = list;
                }
                else {
                    var rc = await this.schema.boardGroup({
                        group: this.groupFieldId,
                        hideGroups: this.hideGroups,
                        page: this.pageIndex,
                        size: this.size,
                        filter: this.getSearchFilter(),
                        sorts: this.getSearchSorts()
                    }, this.page.ws);
                    var list = [];
                    if (rc.ok) {
                        rc.data.list.each(g => {
                            if (Array.isArray(g.list))
                                list.push(...g.list);
                            if (typeof g.total == 'number') {
                                this.groupStats.push({
                                    groupId: g.id,
                                    count: g.total
                                })
                            }
                        })
                    }
                    this.data = list;
                }
            }
        }
    }
    async onAddGroup(dg: ArrayOf<TableStoreBoard['dataGroups']>, groupHead?: GroupHeadType) {
        if (dg?.name) {
            var ds = this.groupStats.find(g => g.groupId == dg.value)
            if (groupHead) ds = this.groupStats.find(g => g.groupId == dg.value && lodash.isEqual(g.groupViewId, groupHead.id));
            if (ds && typeof ds.count == 'number') ds.count += 1;
            var props = this.getGroupCreateDataProps(groupHead);
            if (groupHead && Object.keys(props).length > 0) {
                if (typeof groupHead.count == 'number') groupHead.count += 1;
            }
            props[dg.name] = dg.value;
            await this.onSyncAddRow(props, undefined, undefined, groupHead ? false : true, async (row) => {
                if (groupHead) {
                    row.__group = groupHead.id;
                    this.forceManualUpdate()
                }
            });
        }
    }
    async onOpenGroupEdit(dg: ArrayOf<TableStoreBoard['dataGroups']>, event: React.MouseEvent, groupHead?: GroupHeadType) {
        await this.onDataGridTool(async () => {
            var isS = this.hideGroups.some(s => s == dg.value)
            var r = await useSelectMenuItem({ roundArea: Rect.fromEle(event.currentTarget as HTMLElement) }, [
                { name: isS ? "cancel" : 'hidden', icon: isS ? EyeHideSvg : EyeSvg, text: isS ? lst('取消隐藏') : lst('隐藏') },
                // { type: MenuItemType.divide },
                // { name: 'addRow', icon: PlusSvg, text: lst('新增数据') },
                // { type: MenuItemType.divide },
                { name: 'deleteAllRows', icon: { name: 'bytedance-icon', code: 'clear' }, text: lst('删除数据') },
                { name: 'deleteGroup', icon: { name: 'bytedance-icon', code: 'delete-two' }, text: lst('删除数据及分组') },
                { type: MenuItemType.divide },
                { type: MenuItemType.text, text: lst('颜色') },
                ...OptionBackgroundColorList().map(b => {
                    return {
                        name: 'color',
                        value: { fill: b.fill, textColor: b.color },
                        text: b.text,
                        type: MenuItemType.custom,
                        render(item) {
                            return <div className="flex padding-w-5 gap-w-5 h-30 item-hover round cursor">
                                <span className="flex-fixed size-20 gap-l-3 round gap-r-10 border" style={{ backgroundColor: item.value.fill, color: item.value.textColor }}></span>
                                <span className="flex-auto text f-14">{b.text}</span>
                                {(dg.color && dg.color == item.value.fill || dg.color == item.value.fill) &&
                                    <span className="flex-fixed size-24 flex-center"><Icon size={16} icon={CheckSvg}></Icon></span>
                                }
                            </div>
                        }
                    }
                }),
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
                        await this.schema.rowRemovesByFilter({ [dg.name]: dg.value }, this.id)
                        // dg.count = 0;
                        var ds = this.groupStats.find(g => g.groupId == dg.value)
                        if (groupHead) ds = this.groupStats.find(g => g.groupId == dg.value && lodash.isEqual(g.groupViewId, groupHead.id));
                        if (ds) ds.count = 0;
                        lodash.remove(this.data, c => c[dg.name] == dg.value);
                        this.forceManualUpdate()
                    }
                }
                else if (r.item.name == 'deleteGroup') {
                    if (await Confirm(lst('确定要删除分组吗'))) {
                        await this.schema.rowRemovesByFilter({ [dg.name]: dg.value }, this.id)
                        var ds = this.groupStats.find(g => g.groupId == dg.value)
                        if (groupHead) ds = this.groupStats.find(g => g.groupId == dg.value && lodash.isEqual(g.groupViewId, groupHead.id));
                        if (ds) ds.count = 0;
                        lodash.remove(this.data, c => c[dg.name] == dg.value);
                        lodash.remove(this.dataGroups, c => c.value == dg.value);
                        var field = this.schema.fields.find(f => f.id == this.groupFieldId);
                        var cg = lodash.cloneDeep(field.config);
                        lodash.remove(cg.options, c => c.value == dg.value);
                        await this.onUpdateField(this.groupField, { config: cg })
                    }
                }
                else if (r.item.name == 'addRow') {

                    await this.onAddGroup(dg, groupHead);
                    if (isS) ShyAlert(lst('添加成功'))
                }
                else if (r.item.name == 'color') {
                    dg.color = r.item.value.textColor;
                    dg.fill = r.item.value.fill;
                    var ops = lodash.cloneDeep(this.groupField.config?.options)
                    var opp = ops?.find(op => op.value == dg.value);
                    if (opp) {
                        opp.textColor = r.item.value.textColor;
                        opp.fill = r.item.value.fill;
                    }
                    var cfg = lodash.cloneDeep(this.groupField.config);
                    cfg.options = ops;
                    await this.onUpdateField(this.groupField, { config: cfg });
                }
            }
        })
    }
    async onAddNewGroup(event: React.MouseEvent) {
        await this.onDataGridTool(async () => {
            var ops = lodash.cloneDeep(this.groupField.config.options || []);
            var or = OptionBackgroundColorList().findAll(g => ops.some(s => s.color && s.color == g.fill || s.fill && s.fill == g.fill) ? false : true).randomOf();
            if (!or) or = OptionBackgroundColorList().randomOf();

            var op: DataGridOptionType = { text: '', value: util.guid(), fill: or.fill, textColor: or.color };
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
                    fill: op.fill
                    // count: 0
                })
                await this.onUpdateField(this.groupField, { config });
            }
        })
    }
    async onRemoveRow(id: string) {
        await super.onRemoveRow(id);
        await this.loadData();
        this.forceManualUpdate();
    }
    async onCloneRow(this: DataGridView, data: any) {
        await super.onCloneRow(data);
        await this.loadData();
        this.forceManualUpdate();
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
        return this.cardConfig?.auto || this.cardConfig?.showMode == 'define'
    }
    async drop(blocks: Block[],
        direction: DropDirection,
        dropData?: Record<string, any>) {

        var dragRow = blocks[0] as TableGridItem;
        if (direction == DropDirection.inner && dropData && Object.keys(dropData).length > 0) {
            var ke = Object.keys(dropData)[0];
            await this.schema.rowUpdate({ dataId: dragRow.dataRow.id, data: dropData }, this?.id);
            var d = dragRow.dataGrid.data.find(c => c.id == dragRow.dataRow.id);
            Object.assign(d, dropData);
            this.forceManualUpdate();
            return;
        }
        await super.drop(blocks, direction, dropData);
    }
    // async loadSchemaStats() {
    //     if (!this.statField?.fieldId) return;
    //     if (!this.schema) return;
    //     // this.statFieldsList.loading = true;
    //     // this.statFieldsList.error = '';
    //     try {
    //         var rs = await this.schema.boardFieldStat({
    //             group: this.groupFieldId,
    //             hideGroups: this.hideGroups,
    //             stat: this.statField,
    //             filter: this.getSearchFilter(),
    //             isIgnoreEmpty: this.hideGroups.includes('empty')
    //         }, this.page.ws)
    //         if (Array.isArray(rs.data?.stats)) {
    //             rs.data.stats.forEach(c => {
    //                 var dg = this.dataGroups.find(g => g.value == c.id);
    //                 if (dg) {
    //                     dg.count = c.value;
    //                     dg.total = c.total;
    //                 }
    //             })
    //         }
    //         // var rs = await this.schema.statFields({ stats: this.statFields, filter: this.getSearchFilter() },
    //         //     this.page.ws
    //         // );
    //         // this.statFieldsList.stats = rs.data.stats;
    //         // this.statFieldsList.loaded = true;
    //         // this.statFieldsList.error = '';
    //     }
    //     catch (ex) {
    //         // this.statFieldsList.error = '加载统计数据失败'
    //     }
    //     finally {
    //         // this.statFieldsList.loading = false;
    //     }
    // }
}

@view('/data-grid/board')
export class TableStoreBoardView extends BlockView<TableStoreBoard> {
    renderCreateTable() {
        if (this.block.isLoading) return <Spin block></Spin>
        return !this.block.schema && this.block.isCanEdit() && <div className="item-hover item-hover-focus padding-5 cursor round flex" onClick={e => this.block.onCreateTableSchema()}>
            {this.block.willCreateSchema && <Spin></Spin>}
            <span className="size-24 flex-center remark"><Icon size={16} icon={{ name: 'byte', code: 'table' }}></Icon></span>
            <span className="remark"><S>添加或创建数据表</S></span>
        </div>
    }
    renderView() {
        return <div style={this.block.visibleStyle}><div style={this.block.contentStyle}>
            <div className='sy-data-grid-board'
                onMouseMove={e => this.block.onOver(true)}
                onMouseEnter={e => this.block.onOver(true)}
                onMouseLeave={e => this.block.onOver(false)}>
                <DataGridTool block={this.block}></DataGridTool>
                {this.block.hasGroup && <Divider></Divider>}
                {this.renderCreateTable()}
                <SpinBox spin={this.block.isLoadingData}>
                    <ScrollXDataGridBoard ref={e => this.xd = e} block={this.block}>
                        <DataGridGroup block={this.block} renderRowContent={(b, c, g) => {
                            return <BoardContent groupHead={g} block={b} childs={c}></BoardContent>
                        }}></DataGridGroup>
                    </ScrollXDataGridBoard>
                </SpinBox>
            </div>
        </div>
            {this.renderComment()}
        </div>
    }
    didMount(): void {
        if (this.block.el) {
            ObserverWidth.width(this.block.el, this.widthChange)
        }
    }
    willUnmount(): void {
        if (this.block.el) {
            ObserverWidth.cancel(this.block.el);
        }
    }

    xd: ScrollXDataGridBoard;
    widthChange = lodash.debounce(() => {
        if (this.xd) {
            this.xd.AdjustWidth()
        }
    }, 300)
}