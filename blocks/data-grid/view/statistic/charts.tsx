import React, { CSSProperties } from "react";
import { prop, url, view } from "../../../../src/block/factory/observable";
import { BlockView } from "../../../../src/block/view";
import { TableSchema } from "../../schema/meta";
import { DataGridTurns } from "../../turn";
import { Icon } from "../../../../component/view/icon";
import { DotsSvg, SettingsSvg } from "../../../../component/svgs";
import { MouseDragger } from "../../../../src/common/dragger";
import { Point, Rect } from "../../../../src/common/vector/point";
import { DataGridView } from "../base";
import { useDataGridChartConfig } from "../../../../extensions/data-grid/echarts";
import { FieldType } from "../../schema/type";
import { loadGraph, renderEcharts } from "./render";
import { SchemaFilter, SchemaFilterJoin } from "../../schema/filter";
import { getDateRange } from "../../../../extensions/date/input";
import { Spin } from "../../../../component/view/spin";
import { S } from "../../../../i18n/view";
import { useSelectMenuItem } from "../../../../component/view/menu";
import { MenuItem, MenuItemType } from "../../../../component/view/menu/declare";
import { lst } from "../../../../i18n/store";
import { util } from "../../../../util/util";
import { BlockRenderRange } from "../../../../src/block/enum";

@url('/data-grid/charts')
export class DataGridChart extends DataGridView {
    @prop()
    chart_type: 'line' | 'bar' | 'pie' | 'scatter' | 'radar' | 'funnel' | 'gauge' | 'wordCloud' | 'summary' | 'graph' | 'calendarHeatmap' = 'line';
    @prop()
    chart_config: {
        remark?: string,
        x_fieldId?: string,
        x_fieldIdUnit?: 'year' | 'day' | 'month' | 'hour' | 'week',
        group_fieldId?: string,
        group_fieldIdUnit?: 'year' | 'day' | 'month' | 'hour' | 'week',
        graph_fieldId?: string,
        y_fieldId?: string,
        y_aggregate?: string,
        y_sort?: 'none' | 'asc' | 'desc',
        y1_fieldId?: string,
        y1_aggregate?: string,
        y1_sort?: 'none' | 'asc' | 'desc',
        y2_fieldId?: string,
        y2_aggregate?: string,
        y2_sort?: 'none' | 'asc' | 'desc',
        calendarHeatmap_value?: string | number,
        aggs?: { fieldId: string, aggregate: string, sort: 'none' | 'asc' | 'desc', target?: number }[],
        sort_x?: 'none' | 'asc' | 'desc',
        theme?: string,
        isX?: boolean,
        isArea?: boolean,
        isSmooth?: boolean,
        isRadius?: boolean,
        targetValue?: number,
        color?: string,
        /**
         * 表示是否为堆叠
         */
        stack?: boolean,
    } = {
            sort_x: 'none',
            theme: 'wonderland',
            x_fieldIdUnit: 'month',
            group_fieldIdUnit: 'month',
        }
    @prop()
    align: 'left' | 'right' | 'center' = 'center';
    viewProps: string[] = [
        'canvasWidth',
        'canvasHeight',
        'align'
    ];
    @prop()
    canvasWidth: number = 300;
    @prop()
    canvasHeight: number = 200;
    async onGetTurnUrls() {
        return DataGridTurns.urls
    }
    async getWillTurnData(url: string) {
        return await DataGridTurns.turn(this, url);
    }
    async loadSchema() {
        if (this.schemaId && !this.schema) {
            var schema = await TableSchema.loadTableSchema(this.schemaId, this.page.ws)
            if (schema)
                await schema.cacPermissions();
        }
    }
    data: any[] = [];
    statisticValue: number;
    graphData: {
        nodes: { id: string, value: number, name: string, category: number }[],
        links: { source: string, target: string }[],
        categories: { name: string }[]
    } = {
            nodes: [],
            links: [],
            categories: []
        }
    async loadData() {
        if (this.schema) {
            if (this.chart_type == 'graph') {
                await loadGraph(this);
            }
            else if (this.chart_type == 'calendarHeatmap') {
                var groups: string[] = [];
                var aggregate: Record<string, any> = {}
                if (!this.chart_config?.x_fieldId) {
                    var s = this.schema.fields.find(g => [FieldType.createDate, FieldType.date, FieldType.modifyDate].includes(g.type));
                    if (s) {
                        this.chart_config.x_fieldId = s.id;
                        this.chart_config.x_fieldIdUnit = 'year';
                    }
                }
                if (this.chart_config?.x_fieldId) {
                    var sf = this.schema.fields.find(x => x.id == this.chart_config?.x_fieldId);
                    if (sf) {
                        if ([FieldType.createDate, FieldType.date, FieldType.modifyDate].includes(sf.type))
                            groups.push(sf?.name + (this.chart_config?.x_fieldIdUnit ? "." + this.chart_config?.x_fieldIdUnit : ''))
                        else groups.push(sf.name);
                    }
                }
                if (this.chart_config?.y_fieldId) {
                    var name = this.schema.fields.find(x => x.id == this.chart_config?.y_fieldId)?.name;
                    if (this.chart_config?.y_aggregate) aggregate[name] = { [this.chart_config?.y_aggregate]: '$' + name };
                    else aggregate[name] = { $sum: 1 }
                }
                var sd = getDateRange(this.chart_config?.calendarHeatmap_value, this.chart_config?.x_fieldIdUnit);
                var rangeFilter: SchemaFilter = {
                    logic: 'and',
                    items: [
                        {
                            field: this.chart_config?.x_fieldId,
                            operator: 'gte',
                            value: sd.start
                        },
                        {
                            field: this.chart_config?.x_fieldId,
                            operator: 'lte',
                            value: sd.end
                        }
                    ]
                }
                var filter = SchemaFilterJoin(rangeFilter, this.filter);
                var r = await this.schema.statistics({
                    page: 1,
                    groups,
                    filter: filter,
                    aggregate: aggregate
                }, this.page.ws)
                if (r.ok) {
                    var da = r.data.list;
                    this.data = da;
                }
            }
            else if (this.chart_type == 'gauge' || this.chart_type == 'summary') {
                var name = this.schema.fields.find(x => x.id == this.chart_config?.y_fieldId)?.name;
                var rcc = await this.schema.statisticValue({
                    filter: this.filter,
                    fieldName: name || "id",
                    indicator: name ? this.chart_config?.y1_aggregate : "$count"
                }, this.page.ws);
                if (rcc?.ok) {
                    this.statisticValue = rcc.data.value;
                }
            }
            else if (this.chart_type == 'radar') {
                var groups: string[] = [];
                var aggregate: Record<string, any> = {}
                if (!this.chart_config?.x_fieldId) {
                    var s = this.schema.fields.find(g => g.type == FieldType.option || g.type == FieldType.options);
                    if (s) {
                        this.chart_config.x_fieldId = s.id;
                    }
                    else {
                        s = this.schema.fields.find(g => g.type == FieldType.creater);
                        if (s) {
                            this.chart_config.x_fieldId = s.id;
                        }
                    }
                }
                if (this.chart_config?.x_fieldId) {
                    var sf = this.schema.fields.find(x => x.id == this.chart_config?.x_fieldId);
                    if (sf) {
                        if ([FieldType.createDate, FieldType.date, FieldType.modifyDate].includes(sf.type))
                            groups.push(sf?.name + (this.chart_config?.x_fieldIdUnit ? "." + this.chart_config?.x_fieldIdUnit : ''))
                        else groups.push(sf.name);
                    }
                }
                if (this.chart_config?.group_fieldId) {
                    if (sf) {
                        var sf = this.schema.fields.find(x => x.id == this.chart_config?.group_fieldId);
                        if ([FieldType.createDate, FieldType.date, FieldType.modifyDate].includes(sf.type))
                            groups.push(sf?.name + (this.chart_config?.group_fieldIdUnit ? "." + this.chart_config?.group_fieldIdUnit : ''))
                        else groups.push(sf.name);
                    }
                }
                this.chart_config?.aggs?.forEach(agg => {
                    var sf = this.schema.fields.find(x => x.id == agg.fieldId);
                    if (sf) {
                        aggregate[sf.name] = { [agg.aggregate]: '$' + sf.name };
                    }
                })
                var r = await this.schema.statistics({
                    page: 1,
                    groups,
                    filter: this.filter,
                    aggregate: aggregate
                }, this.page.ws)
                if (r.ok) {
                    var da = r.data.list;
                    var name = this.schema.fields.find(x => x.id == this.chart_config?.y_fieldId)?.name || 'count'
                    this.data = da;
                }
            }
            else {
                var groups: string[] = [];
                var aggregate: Record<string, any> = {}
                if (!this.chart_config?.x_fieldId) {
                    var s = this.schema.fields.find(g => g.type == FieldType.option || g.type == FieldType.options);
                    if (s) {
                        this.chart_config.x_fieldId = s.id;
                    }
                    else {
                        s = this.schema.fields.find(g => g.type == FieldType.creater);
                        if (s) {
                            this.chart_config.x_fieldId = s.id;
                        }
                    }
                }
                if (this.chart_config?.x_fieldId) {
                    var sf = this.schema.fields.find(x => x.id == this.chart_config?.x_fieldId);
                    if (sf) {
                        if ([FieldType.createDate, FieldType.date, FieldType.modifyDate].includes(sf.type))
                            groups.push(sf?.name + (this.chart_config?.x_fieldIdUnit ? "." + this.chart_config?.x_fieldIdUnit : ''))
                        else groups.push(sf.name);
                    }
                }
                if (this.chart_config?.group_fieldId) {
                    if (sf) {
                        var sf = this.schema.fields.find(x => x.id == this.chart_config?.group_fieldId);
                        if ([FieldType.createDate, FieldType.date, FieldType.modifyDate].includes(sf.type))
                            groups.push(sf?.name + (this.chart_config?.group_fieldIdUnit ? "." + this.chart_config?.group_fieldIdUnit : ''))
                        else groups.push(sf.name);
                    }
                }
                if (this.chart_config?.y_fieldId) {
                    var name = this.schema.fields.find(x => x.id == this.chart_config?.y_fieldId)?.name;
                    if (this.chart_config?.y_aggregate) aggregate[name] = { [this.chart_config?.y_aggregate]: '$' + name };
                    else aggregate[name] = { $sum: 1 }
                }
                if (this.chart_config?.y1_fieldId) {
                    var name = this.schema.fields.find(x => x.id == this.chart_config?.y1_fieldId)?.name;
                    if (this.chart_config?.y1_aggregate) aggregate[name] = { [this.chart_config?.y1_aggregate]: '$' + name };
                    else aggregate[name] = { $sum: 1 }
                }
                if (this.chart_config?.y2_fieldId) {
                    var name = this.schema.fields.find(x => x.id == this.chart_config?.y2_fieldId)?.name;
                    if (this.chart_config?.y2_aggregate) aggregate[name] = { [this.chart_config?.y2_aggregate]: '$' + name };
                    else aggregate[name] = { $sum: 1 }
                }
                if (this.chart_type == 'wordCloud' || this.chart_type == 'pie') {
                    groups = groups.slice(0, 1);
                    aggregate = {}
                    if (this.chart_config?.y_fieldId) {
                        var name = this.schema.fields.find(x => x.id == this.chart_config?.y_fieldId)?.name;
                        if (this.chart_config?.y_aggregate) aggregate[name] = { [this.chart_config?.y_aggregate]: '$' + name };
                        else aggregate[name] = { $sum: 1 }
                    }
                }
                var r = await this.schema.statistics({
                    page: 1,
                    groups,
                    filter: this.filter,
                    aggregate: aggregate
                }, this.page.ws)
                if (r.ok) {
                    var da = r.data.list;
                    var name = this.schema.fields.find(x => x.id == this.chart_config?.y_fieldId)?.name || 'count'
                    if (this.chart_config.sort_x != 'none') {
                        da.sort((a, b) => {
                            if (this.chart_config.sort_x == 'asc') {
                                return a[name] - b[name]
                            } else {
                                return b[name] - a[name]
                            }
                        })
                    }
                    this.data = da;
                }
            }
        }
    }
    async didMounted() {
        this.onBlockLoadData(async () => {
            await this.loadDataGrid();
        })
    }
    async loadDataGrid() {
        try {
           
            this.isLoading = true;
            if (this.view) this.forceManualUpdate()
            await this.loadSchema();
        console.log('xxx');
            await this.loadRelationSchemas();
            console.log('sss',this.schema);
            if (this.schema) {
                await this.loadData();
                await this.loadRelationDatas();
                await this.renderEcharts();
                this.emit('loadDataGrided');
            }
        }
        catch (ex) {

        }
        finally {
            this.isLoading = false;
            if (this.view) this.forceManualUpdate()
        }
    }
    async loadRelationDatas(parentId?: string) {
        var xfield = this.schema.fields.find(g => g.id == this.chart_config?.x_fieldId)
        if (xfield && xfield.type == FieldType.relation) {
            var ids = this.data.map(g => g[xfield.name])
            var sea = this.relationSchemas.find(g => g.id == xfield.config.relationTableId)
            if (sea) {
                var rd = await sea.all({ page: 1, filter: { id: { $in: ids } } }, this.page.ws)
                if (rd.ok) {
                    this.relationDatas.set(xfield.config.relationTableId, rd.data.list)
                }
            }
        }
        if (this.chart_config.group_fieldId) {
            var gfield = this.schema.fields.find(g => g.id == this.chart_config.group_fieldId)
            if (gfield && gfield.type == FieldType.relation) {
                var ids = this.data.map(g => g[gfield.name])
                var sea = this.relationSchemas.find(g => g.id == gfield.config.relationTableId)
                if (sea) {
                    var rd = await sea.all({ page: 1, filter: { id: { $in: ids } } }, this.page.ws)
                    if (rd.ok) {
                        this.relationDatas.set(gfield.config.relationTableId, rd.data.list)
                    }
                }
            }
        }
    }
    myChart
    async onOpenEchartsConfig(rect: Rect) {
        await useDataGridChartConfig({ roundArea: rect }, { dataGrid: this })
    }
    async renderEcharts() {
        await renderEcharts(this);
    }
    getVisibleContentBound() {
        var img = (this.view as any).imageWrapper;
        if (img) {
            return Rect.fromEle(img);
        }
        return super.getVisibleContentBound();
    }
    async onOpenViewConfig(rect: Rect, mode?: 'view' | 'field' | 'sort' | 'filter' | 'group') {
        await this.onOpenEchartsConfig(rect);
    }
    async onDataGridCreate(rect?: Rect) {
        if (!rect) {
            rect = Rect.fromEle(this.el);
            rect = new Rect(rect.left, rect.top, 200, 40)
        }
        await TableSchema.onLoadAll()
        var schemas = TableSchema.getSchemas(this.page.ws?.id);
        var items: MenuItem[] = [];
        items.push({ type: MenuItemType.input, name: 'name', placeholder: '请输入图表名称' })
        var rs: MenuItem[] = [];
        schemas.forEach(sch => {
            rs.push({
                type: MenuItemType.item,
                text: sch.text,
                icon: sch.icon,
                value: sch.id,
                remark: util.showTime(sch.createDate)
            })
        })
        items.push({ type: MenuItemType.gap });
        items.push({
            type: MenuItemType.select,
            name: 'schemaId',
            options: rs,
            text: lst('选择数据源')
        })
        items.push({ type: MenuItemType.gap });
        items.push({
            type: MenuItemType.button,
            text: lst('创建图表'),
            buttonClick: 'select'
        })
        var rc = await useSelectMenuItem({ roundArea: rect }, items, { width: 300 });
        var sid = items.find(c => c.name == 'schemaId')?.value as string;
        if (sid) {
            var schema = await TableSchema.loadTableSchema(sid, this.page.ws);
            await schema.cacPermissions();
            var name = items.find(g => g.name == 'name')?.value || lst('数据图表');
            var sv = await this.schema.createSchemaView(name, this.url, this.id);
            this.page.onAction('openView', async () => {
                await this.updateProps({
                    schemaId: this.schema.id,
                    syncBlockId: sv.view.id
                })
            }, {
                disabledSyncBlock: true
            });
            schema.cacPermissions();
            await this.loadDataGrid();
        }
    }
    getVisibleHandleCursorPoint(): Point {
        var point = super.getVisibleHandleCursorPoint();
        if (point) {
            point = point.move(0, -5);
        }
        return point;
    }
    async onReloadData(this: DataGridView, beforeAction?: () => Promise<void>): Promise<void> {
        await this.onLoadingAction(async () => {
            try {
                if (typeof beforeAction == 'function') await beforeAction()
            }
            catch (ex) {
                console.error(ex);
            }
            await this.loadDataGrid();
            this.referenceBlockers.forEach(b => {
                b.forceManualUpdate();
            })
        })
    }
}

@view('/data-grid/charts')
export class DataGridChartView extends BlockView<DataGridChart> {
    onMousedown(event: React.MouseEvent, operator: 'bottom-right' | 'bottom-left') {
        event.stopPropagation();
        var el = this.block.el;
        var bound = el.getBoundingClientRect();
        var self = this;
        MouseDragger<{ event: React.MouseEvent, realWidth: number, realHeight: number }>({
            event,
            moveStart(ev, data) {
                data.realWidth = self.block.canvasWidth;
                data.realHeight = self.block.canvasHeight;
                data.event = ev as any;
                self.forceUpdate();
            },
            moving(ev, data, isEnd, isM) {
                if (!isM) return
                var dy = ev.clientY - data.event.clientY;
                var height = data.realHeight + dy;
                height = Math.max(40, height);
                var dx = ev.clientX - data.event.clientX;
                if (operator == 'bottom-left') dx = -dx;
                var width: number;
                width = data.realWidth + dx * 2;
                width = Math.max(100, width);
                width = Math.min(bound.width, width);
                self.imageWrapper.style.width = width + "px";
                self.imageWrapper.style.height = height + "px";
                if (self.block.myChart) self.block.myChart.resize({ width: width, height: height });
                if (isEnd) {
                    self.block.page.onAction('OnUpdateProps', async () => {
                        await self.block.updateProps({
                            canvasWidth: width,
                            canvasHeight: height
                        }, BlockRenderRange.self)
                    }, {
                        disabledSyncBlock: true
                    })
                }
            }
        })
    }
    imageWrapper: HTMLDivElement;
    renderView() {
        return <div className='sy-dg-charts' style={this.block.visibleStyle}>
            <div style={this.block.contentStyle}>
                {this.renderCreateTable()}
                {this.renderContent()}
                {this.renderComment()}
            </div>
        </div>
    }
    renderCreateTable() {
        if (this.block.isLoading) return <Spin block></Spin>
        return !this.block.schema && this.block.page.isCanEdit && <div className="item-hover item-hover-focus padding-5 cursor round flex" onClick={e => this.block.onCreateTableSchema()}>
            <span className="size-24 flex-center remark"><Icon size={16} icon={{ name: 'byte', code: 'table' }}></Icon></span>
            <span className="remark"><S>选择数据源创建图表</S></span>
        </div>
    }
    renderContent() {
        var style: CSSProperties = {
            justifyContent: 'center'
        }
        if (this.block.align == 'left') style.justifyContent = 'flex-start';
        else if (this.block.align == 'right') style.justifyContent = 'flex-end';
        if (!this.block.schema) style.display = 'none';
        return <div className="flex-center" style={style}>
            <div className="relative visible-hover  border  round " ref={e => this.imageWrapper = e} style={{
                width: this.block.canvasWidth,
                maxWidth: '100%',
                height: this.block.canvasHeight
            }}>
                <div className="sy-dg-echarts-view w100 h100"
                    style={{
                        display: ['summary'].includes(this.block.chart_type) ? 'none' : 'block'
                    }} ></div>
                {this.block.chart_type == 'summary' && <div className="flex-center flex-col  w100 h100">
                    <div className="gap-h-10" style={{ fontSize: 20, fontWeight: 'bold', lineHeight: '20px' }}>{this.block.schemaView?.text}</div>
                    {this.block.chart_config.remark && <div className="gap-h-10 text-1 f-14" style={{ fontSize: 20, lineHeight: 20 }}>{this.block.chart_config.remark}</div>}
                    <div className="gap-t-20 gap-b-10" style={{ fontSize: 100, lineHeight: '160px', color: this.block.chart_config?.color }}>{this.block.statisticValue}</div>
                    {this.block.chart_config?.targetValue && <div className="remark f-16">
                        <span>{(this.block.statisticValue * 100 / this.block.chart_config?.targetValue).toFixed(2)}%</span>
                    </div>}
                </div>}
                {this.block.isCanEdit() && <>
                    <div className="sy-block-resize-bottom-right visible" onMouseDown={e => this.onMousedown(e, 'bottom-right')}></div>
                    <div className="sy-block-resize-bottom-left visible" onMouseDown={e => this.onMousedown(e, 'bottom-left')}></div>
                    <div className="flex visible pos-top-right top-5 right-5 flex-center round  shadow-s border ">
                        <span onMouseDown={async e => {
                            e.stopPropagation();
                            var pa = e.currentTarget.parentElement;
                            pa.classList.remove('visible');
                            try {
                                await this.block.onOpenEchartsConfig(Rect.fromEle(e.currentTarget as HTMLElement));
                            }
                            catch (ex) {

                            }
                            finally {
                                pa.classList.add('visible');
                            }
                        }} className="round-l-4 bg-hover size-24 flex-center cursor border-right"><Icon size={18} icon={SettingsSvg}></Icon></span>
                        <span onMouseDown={async e => {
                            e.stopPropagation();
                            var pa = e.currentTarget.parentElement;
                            pa.classList.remove('visible');
                            await this.block.onContextmenu(e.nativeEvent);
                            pa.classList.add('visible');
                        }} className="round-r-4 bg-hover size-24 flex-center cursor"><Icon size={18} icon={DotsSvg}></Icon></span>
                    </div>
                </>}
            </div>
        </div>
    }
}