import React from "react";
import { Icon, IconValueType } from "../../../../component/view/icon";
import { Block } from "../../../../src/block";
import { prop, url, view } from "../../../../src/block/factory/observable";
import { BlockView } from "../../../../src/block/view";
import { ArrowLeftSvg, ArrowRightSvg, BrowserSvg, DatasourceSvg, DotsSvg, DuplicateSvg, LinkSvg, LoopSvg, PlusSvg, TrashSvg } from "../../../../component/svgs";
import { TableSchema } from "../../schema/meta";
import { Tip } from "../../../../component/view/tooltip/tip";
import { getSchemaViewIcon } from "../../schema/util";
import lodash from "lodash";
import { useSelectMenuItem } from "../../../../component/view/menu";
import { MenuItem, MenuItemType } from "../../../../component/view/menu/declare";
import { lst } from "../../../../i18n/store";
import { BlockChildKey, BlockUrlConstant } from "../../../../src/block/constant";
import { BlockDirective, BlockRenderRange } from "../../../../src/block/enum";
import { MouseDragger } from "../../../../src/common/dragger";
import { ghostView } from "../../../../src/common/ghost";
import { Rect, Point } from "../../../../src/common/vector/point";
import { ActionDirective } from "../../../../src/history/declare";
import { RenderToolOperators } from "../components/tool";
import { DataGridView } from "../base";
import { DataGridChart } from "../statistic/charts";
import { useDataSourceView } from "../../../../extensions/data-grid/datasource";
import { BlockFactory } from "../../../../src/block/factory/block.factory";
import { util } from "../../../../util/util";
import "./style.less";

@url('/data-grid/tab')
export class DataGridTab extends Block {
    get allBlockKeys(): BlockChildKey[] {
        return [
            BlockChildKey.childs,
            BlockChildKey.otherChilds
        ]
    }
    @prop()
    tabItems: { schemaId: string, viewId: string, viewText?: string, viewIcon?: IconValueType }[] = [];
    refTables: TableSchema[] = [];
    @prop()
    displayMode: 'border' | 'top-line' | 'button' = 'top-line';
    @prop()
    align: 'left' | 'center' = 'left';
    tabIndex: number = 0;
    blocks: { childs: Block[], otherChilds: Block[] } = { childs: [], otherChilds: [] };
    async didMounted() {
        this.loadItems();
    }
    async loadItems() {
        var i = 0;
        for (let item of this.tabItems) {
            var ts = await TableSchema.loadTableSchema(item.schemaId, this.page.ws);
            if (!this.refTables.some(s => s.id == ts.id)) {
                this.refTables.push(ts);
            }
            var sv = ts.listViews.find(c => c.id == item.viewId);
            if (this.otherChilds.length <= i) {
                var nb = await BlockFactory.createBlock(BlockUrlConstant.DataGridTabPage, this.page, {
                    blocks: {
                        childs: [
                            {
                                url: sv.url,
                                schemaId: ts.id,
                                syncBlockId: sv.id
                            }
                        ]
                    }
                }, this,
                );
                this.otherChilds.push(nb);
            }
            i += 1;
        }
        this.forceUpdate();
    }
    async onOpenAddTabView(event: React.MouseEvent) {
        var self = this;
        await this.onDataGridTool(async () => {
            var rect = Rect.fromEle(event.currentTarget as HTMLElement);
            var g = await useDataSourceView({ roundArea: rect }, {
                tableId: this.dataGridBlock.schema.id,
                viewId: this.dataGridBlock.syncBlockId,
                selectView: true,
                editTable: true
            });
            if (g) {
                if (typeof g != 'string' && g.type == 'view') {
                    var s = this.refTables.find(s => s.id == (g as any).tableId)
                    if (!s) {
                        s = await TableSchema.loadTableSchema(g.tableId, this.page.ws);
                        this.refTables.push(s)
                    }
                    var view = s.listViews.find(c => c.id == (g as any).viewId);
                    await this.page.onAction('onTabAddItem', async () => {
                        var items = lodash.cloneDeep(this.tabItems);
                        items.push({
                            schemaId: s.id,
                            viewId: view.id,
                            viewText: view.text,
                            viewIcon: view.icon
                        });
                        await this.updateProps({ tabItems: items }, BlockRenderRange.self);
                        await this.page.createBlock(BlockUrlConstant.DataGridTabPage, {
                            blocks: {
                                childs: [
                                    {
                                        url: view.url,
                                        schemaId: s.id,
                                        syncBlockId: view.id
                                    }
                                ]
                            }
                        },
                            this,
                            this.blocks.otherChilds.length,
                            BlockChildKey.otherChilds
                        );
                        this.tabIndex = this.tabItems.length - 1;
                    })
                }
            }
        })
    }
    async onTabeItemContextmenu(rect: Rect, at: number) {
        if (!this.isCanEdit()) return;
        if (!this.dataGridBlock) return;
        await this.onDataGridTool(async () => {
            var self = this;
            var view = self.dataGridBlock.schemaView;
            var items: MenuItem<BlockDirective | string>[] = [
                {
                    name: 'name',
                    type: MenuItemType.inputTitleAndIcon,
                    value: view.text,
                    icon: getSchemaViewIcon(view)
                },
                { type: MenuItemType.divide },
                {
                    text: lst("切换视图"),
                    icon: LoopSvg,
                    childs: [
                        {
                            type: MenuItemType.container,
                            drag: true,
                            name: 'viewContainer',
                            childs: [
                                ...self.dataGridBlock.schema.views.findAll(g => ![BlockUrlConstant.RecordPageView].includes(g.url as any)).map(v => {
                                    return {
                                        name: 'turn',
                                        text: v.text,
                                        type: MenuItemType.drag,
                                        value: v.id,
                                        icon: getSchemaViewIcon(v),
                                        checkLabel: v.id == self.dataGridBlock.schemaView?.id,
                                        btns: [
                                            { icon: DotsSvg, name: 'property' }
                                        ]
                                    }
                                }),
                                { type: MenuItemType.divide },
                                { name: 'addView', type: MenuItemType.button, text: lst('创建视图') }
                            ]
                        }
                    ]
                },
                { text: lst('配置视图'), name: 'viewConfig', icon: { name: 'byte', code: 'setting-one' } as IconValueType },
                { type: MenuItemType.divide },
                { text: lst('数据源'), name: 'datasource', icon: DatasourceSvg },
                { type: MenuItemType.divide },
                { name: 'link', icon: LinkSvg, text: lst('复制视图链接') },
                { type: MenuItemType.divide },
                { name: 'prev', text: lst('前移'), disabled: at == 0 ? true : false, icon: ArrowLeftSvg },
                { name: 'after', text: lst('后移'), disabled: at == this.childs.length - 1 ? true : false, icon: ArrowRightSvg },
                { type: MenuItemType.divide },
                { name: 'delete', icon: TrashSvg, text: lst('移除视图') },
            ];
            var um = await useSelectMenuItem(
                { roundArea: rect },
                items,
                {
                    async click(item, ev, name, mp) {
                        mp.onFree();
                        try {
                            if (item.name == 'turn') {
                                var rs: MenuItem<BlockDirective | string>[] = [];
                                if (item.value == view?.id) {
                                    rs.push(...[
                                        { name: 'duplicate', icon: DuplicateSvg, text: lst('复制') }
                                    ])
                                }
                                else
                                    rs.push(...[
                                        {
                                            name: 'name',
                                            type: MenuItemType.inputTitleAndIcon,
                                            icon: getSchemaViewIcon(view),
                                            value: item.text,
                                            text: lst('编辑视图名'),
                                        },
                                        { type: MenuItemType.divide },
                                        { name: 'delete', disabled: item.value == view?.id, icon: TrashSvg, text: lst('删除') }
                                    ])
                                var rg = await useSelectMenuItem({ roundArea: Rect.fromEvent(ev) },
                                    rs,
                                    { nickName: 'second' }
                                );
                                if (rg?.item) {
                                    if (rg?.item.name == 'delete') {
                                        self.dataGridBlock.schema.onSchemaOperate([{ name: 'removeSchemaView', id: item.value }])
                                        items.arrayJsonRemove('childs', g => g === item);
                                        mp.updateItems(items);
                                    }
                                }
                                var props: Record<string, any> = {};
                                var rn = rs.find(g => g.name == 'name');
                                if (rn.value != item.text && rn.value) {
                                    props.text = rn.value;
                                }
                                if (!lodash.isEqual(rn.icon, item.icon)) {
                                    props.icon = rn.icon;
                                }
                                if (Object.keys(props).length > 0) {
                                    await self.dataGridBlock.schema.onSchemaOperate([
                                        { name: 'updateSchemaView', id: item.value, data: props }
                                    ]);
                                    if (props.text) item.text = props.text || item.text;
                                    if (props.icon) item.icon = props.icon || item.icon;
                                    mp.updateItems(items);
                                    if (props.text && view.url.startsWith('/data-grid/charts')) {
                                        await (self.dataGridBlock as DataGridChart).renderEcharts();
                                    }
                                }
                            }
                        }
                        catch (ex) {

                        }
                        finally {
                            mp.onUnfree()
                        }
                    },
                    input(item) {
                        if (item.name == 'viewContainer') {
                            var [from, to] = item.value;
                            self.dataGridBlock.onSchemaViewMove(self.dataGridBlock.schema.views[from].id, from, to);
                        }
                    }
                }
            );
            if (um) {
                if (um.item.name == 'delete') {
                    this.page.onAction(ActionDirective.onTabRemoveItem, async () => {
                        await self.dataGridBlock.closest(x => x.url == BlockUrlConstant.DataGridTabPage).delete();
                        var items = lodash.cloneDeep(this.tabItems);
                        items.remove(items[at]);
                        if (items.length == 1) {
                            var cs = this.blocks.otherChilds[0].childs;
                            await this.parent.appendArray(cs, this.at, this.parentKey);
                            await this.delete();
                        }
                        else {
                            await this.updateProps({ tabItems: items }, BlockRenderRange.self)
                            var pre = at - 1;
                            if (pre < 0) pre = 0;
                            this.tabIndex = pre;
                        }
                    })
                }
                else if (um.item.name == 'after') {
                    this.page.onAction(ActionDirective.onTabExchangeItem, async () => {
                        this.tabIndex = at + 1;
                        var items = lodash.cloneDeep(this.tabItems);
                        var current = items[at + 1];
                        items[at + 1] = items[at];
                        items[at] = current;
                        await this.updateProps({ tabItems: items }, BlockRenderRange.self)
                    })
                }
                else if (um.item.name == 'prev') {
                    this.page.onAction(ActionDirective.onTabExchangeItem, async () => {
                        this.tabIndex = at - 1;
                        var items = lodash.cloneDeep(this.tabItems);
                        var current = items[at - 1];
                        items[at - 1] = items[at];
                        items[at] = current;
                        await this.updateProps({ tabItems: items }, BlockRenderRange.self)
                    })
                }
                else if (um.item.name == 'turn') {
                    await self.dataGridBlock.onDataGridTurnView(um.item.value);
                }
                else if (um.item.name == 'viewConfig') {
                    await self.dataGridBlock.onOpenViewConfig(rect);
                }
                else if (um.item.name == 'datasource') {
                    await self.dataGridBlock.onOpenDataSource(rect);
                }
                else if (um.item.name == 'link') {
                    await self.dataGridBlock.onCopyLink();
                }
            }
            var props: Record<string, any> = {};
            var rn = items.find(g => g.name == 'name');
            if (rn.value != view.text && rn.value) {
                props.text = rn.value;
            }
            if (!lodash.isEqual(rn.icon, getSchemaViewIcon(view))) {
                props.icon = rn.icon;
            }
            if (Object.keys(props).length > 0) {
                await self.dataGridBlock.onSchemaViewUpdate(view.id, {
                    ...props
                });
            }
        })
    }
    async onDraggerItem(event: React.MouseEvent, at: number) {
        var rect = Rect.fromEle(event.currentTarget as HTMLElement);
        if (event.button == 2) {
            return await this.onTabeItemContextmenu(rect, at);
        }
        var ele = event.currentTarget as HTMLElement;
        var parent = ele.parentElement;
        var self = this;
        var he = parent.querySelector('.hover') as HTMLElement;
        if (he) {
            he.classList.remove('hover');
        }
        ele.classList.add('hover');
        var ne = ele.nextElementSibling as HTMLElement;
        MouseDragger({
            event,
            moveStart() {
                ghostView.load(ele, { point: Point.from(event) });
                ele.classList.add('dragging')
                ele.style.pointerEvents = 'none';
            },
            move(ev) {
                ghostView.move(Point.from(ev));
                var el = ev.target as HTMLElement;
                var overTh = el.closest('.sy-data-grid-tab-item') as HTMLElement;
                if (overTh && parent.contains(overTh) && !overTh.classList.contains('sy-data-grid-tab-item-plus')) {
                    var rect = Rect.fromEle(overTh);
                    if (ev.pageX < rect.center) {
                        parent.insertBefore(ele, overTh);
                    }
                    else {
                        var next = overTh.nextElementSibling;
                        if (next) parent.insertBefore(ele, next)
                        else parent.appendChild(ele)
                    }
                }
            },
            moveEnd(ev, isMove) {
                if (isMove) {
                    ghostView.unload();
                    ele.classList.remove('dragging')
                    ele.style.pointerEvents = 'auto';
                    ele.classList.remove('hover');
                    var cs = Array.from(parent.querySelectorAll('.sy-data-grid-tab-item'));
                    var currentAt = cs.findIndex(g => g === ele);
                    if (ne) {
                        parent.insertBefore(ele, ne);
                    }
                    else {
                        parent.appendChild(ele);
                    }
                    if (at !== currentAt) {
                        self.page.onAction(ActionDirective.onTabExchangeItem, async () => {
                            self.tabIndex = currentAt;
                            var items = lodash.cloneDeep(self.tabItems);
                            items.move(items[at], currentAt);
                            await self.updateProps({ tabItems: items }, BlockRenderRange.self)
                        })
                    }
                }
                else {
                    if (self.tabIndex == at) {
                        self.onTabeItemContextmenu(rect, at);
                    }
                    else {
                        self.tabIndex = at;
                        self.forceUpdate()
                    }
                }
            }
        })
    }
    get dataGridBlock() {
        var ocs = this.blocks.otherChilds;
        var item = this.tabItems[this.tabIndex];
        var oc = ocs.find(g => g.exists(c => (c as DataGridView).schemaId == item.schemaId && c.syncBlockId == item.viewId) ? true : false)
        if (oc) return oc.find(c => (c as DataGridView).schemaId == item.schemaId && c.syncBlockId == item.viewId) as DataGridView;
    }
    async updateView(dg: DataGridView) {
        var items = lodash.cloneDeep(this.tabItems);
        var item = items[this.tabIndex];
        item.schemaId = dg.schemaId;
        item.viewId = dg.syncBlockId;
        if (!this.refTables.some(s => s.id == item.schemaId)) {
            if (dg.schema && dg.schema?.id == item.schemaId) {
                this.refTables.push(dg.schema);
            }
            else {
                var s = await TableSchema.loadTableSchema(item.schemaId, this.page.ws);
                this.refTables.push(s);
            }
        }
        await this.updateProps({ tabItems: items }, BlockRenderRange.self)
    }
    get tabPages() {
        if (this.el)
            return this.el.querySelector('.sy-data-grid-tab-item-panel') as HTMLElement;
    }
    isOver: boolean = false;
    onOver(isOver: boolean) {
        if (this.renderToolOperators && this.renderToolOperators.isOpenTool) return;
        this.isOver = isOver;
        if (this.renderToolOperators) this.renderToolOperators.forceUpdate();
    }
    renderToolOperators: RenderToolOperators;
    async onDataGridTool(fn: () => Promise<void>) {
        try {
            if (this.renderToolOperators)
                this.renderToolOperators.isOpenTool = true;
            await fn();
        }
        catch (ex) {
            this.page.onError(ex);
        }
        finally {
            if (this.renderToolOperators) {
                this.renderToolOperators.isOpenTool = false;
                var cb = this.getVisibleContentBound();
                this.onOver(cb.contain(Point.from(this.page.kit.operator.moveEvent)))
            }
        }
    }
    async onGetContextMenus() {
        var rs = await super.onGetContextMenus();
        var rg = rs.find(g => g.name == 'text-center');
        if (rg) {
            // rg.text = lst('标签项')
            var pos = rs.findIndex(g => g == rg);
            var at = this.tabIndex;
            var ns: MenuItem<string | BlockDirective>[] = [];
            ns.push({
                text: lst('显示'),
                icon: BrowserSvg,
                childs: [
                    // { name: 'displayMode', text: lst('卡片'), value: 'border', checkLabel: this.displayMode == 'border' },
                    { name: 'displayMode', text: lst('线型'), value: 'top-line', checkLabel: this.displayMode == 'top-line' },
                    { name: 'displayMode', text: lst('按钮'), value: 'button', checkLabel: this.displayMode == 'button' }
                ]
            })
            lodash.remove(rs, g => g.name == 'color');
            rs.splice(pos + 1, 0, ...ns)
            lodash.remove(rs, g => g === rg);
        }
        return rs;
    }
    async onClickContextMenu(item: MenuItem<string | BlockDirective>, e) {
        var at = this.tabIndex;
        switch (item.name) {
            case 'displayMode':
                await this.onUpdateProps({ displayMode: item.value }, { range: BlockRenderRange.self })
                return;
        }
        return await super.onClickContextMenu(item, e);
    }
    getVisibleHandleCursorPoint() {
        var bound = this.getVisibleContentBound()
        if (bound) {
            var pos = Point.from(bound);
            pos = pos.move(0, 3 + 7 + util.remToPx(this.page.lineHeight) / 2);
            return pos;
        }
    }
}

@view('/data-grid/tab')
export class DataGridTabView extends BlockView<DataGridTab>{
    renderView(): React.ReactNode {
        return <div

            className="sy-data-grid-tab"
            onMouseEnter={e => this.block.onOver(true)}
            onMouseLeave={e => this.block.onOver(false)}

            style={this.block.visibleStyle}>
            <div style={this.block.contentStyle}>
                <div className={"flex sy-data-grid-tab-items " + (" sy-data-grid-tab-" + this.block.displayMode + " ") + (this.block.align == 'center' ? "flex-center" : "")}>
                    <div className=" flex-auto flex">
                        {this.block.tabItems.map((item, index) => {
                            var tr = this.block.refTables.find(c => c.id == item.schemaId);
                            var v = tr?.listViews.find(c => c.id == item.viewId);
                            return <div onMouseDown={e => {
                                e.stopPropagation();
                                this.block.onDraggerItem(e, index)
                            }} className={"sy-data-grid-tab-item flex-center  " + (index == this.block.tabIndex ? "sy-data-grid-tab-item-hover" : "")} key={index}>
                                <div className={"flex  round cursor max-w-220 f-14 " + (this.block.displayMode == 'button' ? "" : " item-hover")}>
                                    <div className="size-24 flex-center  "><Icon icon={getSchemaViewIcon(v)} className={' ' + (this.block.tabIndex == index ? " text" : " remark")} size={16}></Icon></div>
                                    <span className={"gap-r-5 f-14 " + (this.block.tabIndex == index ? "bold" : "")}>{v?.text || item.viewText}</span>
                                </div>
                            </div>
                        })}
                        {this.block.isCanEdit() && <Tip text="添加视图"><div
                            style={{ display: this.block.isOver ? "flex" : "none" }}
                            onMouseDown={e => {
                                this.block.onOpenAddTabView(e)
                            }} className="sy-data-grid-tab-item-plus flex-center round size-20 gap-l-5 item-hover cursor">
                            <Icon size={16} icon={PlusSvg}></Icon>
                        </div></Tip>}
                    </div>
                    {this.block.dataGridBlock && <div className="flex-fixed">
                        <RenderToolOperators ref={e => this.block.renderToolOperators = e} dataGridTab={this.block} block={this.block.dataGridBlock}></RenderToolOperators>
                    </div>}
                </div>
                <div className="sy-data-grid-tab-item-panel">
                    {this.block.blocks.otherChilds.map((b, i) => {
                        return <div key={b.id} style={{ display: this.block?.dataGridBlock?.parent === b ? "block" : "none" }}>
                            <b.viewComponent block={b}></b.viewComponent>
                        </div>
                    })}
                </div>
            </div>
        </div>
    }
}