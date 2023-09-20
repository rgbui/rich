import React, { CSSProperties } from "react";
import { prop, url, view } from "../../../../src/block/factory/observable";
import { BlockView } from "../../../../src/block/view";
import { TableSchema } from "../../schema/meta";
import { DataGridTurns } from "../../turn";
import { loadEchart } from "./load";
import { Icon } from "../../../../component/view/icon";
import { DatasourceSvg, DotsSvg, DuplicateSvg, LinkSvg, LoopSvg, SettingsSvg, TrashSvg } from "../../../../component/svgs";
import { MouseDragger } from "../../../../src/common/dragger";
import { useSelectMenuItem } from "../../../../component/view/menu";
import { MenuItem, MenuItemType } from "../../../../component/view/menu/declare";
import { BlockDirective } from "../../../../src/block/enum";
import { Point, Rect } from "../../../../src/common/vector/point";
import lodash from "lodash";
import { lst } from "../../../../i18n/store";
import { ElementType } from "../../../../net/element.type";
import { BlockUrlConstant } from "../../../../src/block/constant";
import { getSchemaViewIcon } from "../../schema/util";
import { DataGridView } from "../base";
import { useDataGridChartConfig } from "../../../../extensions/data-grid/echarts";
import { EChartsOption } from "echarts";

@url('/data-grid/charts')
export class DataGridChart extends DataGridView {
    @prop()
    chart_type: 'line' | 'bar' | 'pie' | 'scatter' = 'line';
    @prop()
    chart_config: {
        x_fieldId?: string,
        x_fieldIdUnit?: string,
        group_fieldId?: string,
        group_fieldIdUnit?: string,
        y_fieldId?: string,
        y_aggregate?: string,
        sort_x?: 'none' | 'asc' | 'desc',
        theme?: string,
    } = {
            sort_x: 'none'
        }
    @prop()
    align: 'left' | 'right' | 'center' = 'center';
    @prop()
    canvasWith: number = 300;
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
            this.schema = await TableSchema.loadTableSchema(this.schemaId, this.page.ws)
        }
    }
    data: any[] = [];
    async loadData() {
        if (this.schema) {
            var groups: string[] = [];
            var aggregate: Record<string, any> = {}
            if (this.chart_config?.x_fieldId) {
                groups.push(this.schema.fields.find(x => x.id == this.chart_config?.x_fieldId)?.name + (this.chart_config?.x_fieldIdUnit ? "." + this.chart_config?.x_fieldIdUnit : ''))
            }
            if (this.chart_config?.group_fieldId) {
                groups.push(this.schema.fields.find(x => x.id == this.chart_config?.group_fieldId)?.name + (this.chart_config?.group_fieldIdUnit ? "." + this.chart_config?.group_fieldIdUnit : ''))
            }
            if (this.chart_config?.y_fieldId) {
                var name = this.schema.fields.find(x => x.id == this.chart_config?.y_fieldId)?.name;
                if (this.chart_config?.y_aggregate) aggregate[name] = { [this.chart_config?.y_aggregate]: '$' + name };
                else aggregate[name] = { $sum: 1 }
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
    async didMounted() {
        await this.loadSchema();
        await this.loadData();
        await this.renderEcharts();
        this.forceUpdate();
    }
    myChart
    async renderEcharts() {
        var ele = this.el?.querySelector('.sy-dg-echarts-view') as HTMLElement;
        if (ele) {
            var echarts = await loadEchart();
            if (typeof this.myChart == 'undefined') {
                this.myChart = echarts.init(ele, this.chart_config?.theme || undefined);
            }
            else {
                this.myChart.dispose();
                this.myChart = echarts.init(ele, this.chart_config?.theme || undefined);
            }
            var xs = this.data.map(g => g[this.schema.fields.find(x => x.id == this.chart_config?.x_fieldId)?.name])
            var ys = this.data.map(g => g[this.schema.fields.find(x => x.id == this.chart_config?.y_fieldId)?.name || 'count'])
            var option: EChartsOption = {
                xAxis: {
                    type: 'category',
                    data: xs
                },
                yAxis: {
                    type: 'value'
                },
                series: [
                    {
                        data: ys,
                        type: 'line'
                    }
                ]
            };
            switch (this.chart_type) {
                case 'line':
                    break;
                case 'bar':
                    lodash.set(option, 'series[0].type', 'bar');
                    break;
                case 'pie':
                    option = {
                        title: {
                            text: this.schemaView?.text,
                            // subtext: 'Fake Data',
                            left: 'center'
                        },
                        tooltip: {
                            trigger: 'item'
                        },
                        legend: {
                            orient: 'vertical',
                            left: 'left'
                        },
                        series: [
                            {
                                name: this.schema.fields.find(x => x.id == this.chart_config?.x_fieldId)?.text,
                                type: 'pie',
                                radius: '50%',
                                data: this.data.map(g => {
                                    return {
                                        name: g[this.schema.fields.find(x => x.id == this.chart_config?.x_fieldId)?.name],
                                        value: g[this.schema.fields.find(x => x.id == this.chart_config?.y_fieldId)?.name || 'count']
                                    }
                                }),
                                emphasis: {
                                    itemStyle: {
                                        shadowBlur: 10,
                                        shadowOffsetX: 0,
                                        shadowColor: 'rgba(0, 0, 0, 0.5)'
                                    }
                                }
                            }
                        ]
                    };
                    break;
                case 'scatter':
                    break;
            }
            this.myChart.setOption(option);
        }
    }
    async onContextmenu(event: Point | MouseEvent) {
        var self = this;
        var rect = event instanceof Point ? new Rect(event.x, event.y, 0, 0) : Rect.fromEvent(event)
        function getMenuItems() {
            var items: MenuItem<BlockDirective | string>[] = [];
            items.push(...[
                {
                    name: 'name',
                    type: MenuItemType.inputTitleAndIcon,
                    value: self.schemaView?.text,
                    icon: self.schemaView.icon || getSchemaViewIcon(self.schemaView?.url),
                    text: lst('编辑视图名'),
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
                                ...self.schema.views.findAll(g => ![BlockUrlConstant.RecordPageView].includes(g.url as any)).map(v => {
                                    return {
                                        name: 'turn',
                                        text: v.text,
                                        type: MenuItemType.drag,
                                        value: v.id,
                                        icon: v.icon || getSchemaViewIcon(v.url),
                                        checkLabel: v.id == self.schemaView?.id,
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
                { text: lst('配置视图'), name: 'viewConfig', icon: SettingsSvg },
                { type: MenuItemType.divide },
                { text: lst('数据源'), name: 'datasource', icon: DatasourceSvg },
                { type: MenuItemType.divide },
                { name: 'link', icon: LinkSvg, text: lst('复制视图链接') },
                { type: MenuItemType.divide },
                { name: 'clone', icon: DuplicateSvg, text: lst('复制视图') },
                { name: 'delete', icon: TrashSvg, text: lst('移除视图') },
            ]);
            if (self.page.pe.type == ElementType.Schema) {
                items.splice(-7, 2);
                items.splice(-1, 1);
            }
            return items;
        }
        var view = self.schemaView;
        var items: MenuItem<BlockDirective | string>[] = getMenuItems();
        var rname = items.find(g => g.name == 'name');
        var r = await useSelectMenuItem({ roundArea: rect }, items, {
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
                                    icon: item.icon || getSchemaViewIcon(item.url),
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
                                self.schema.onSchemaOperate([{ name: 'removeSchemaView', id: item.value }])
                                items.arrayJsonRemove('childs', g => g === item);
                                mp.updateItems(items);
                            }
                        }
                        var rn = rs.find(g => g.name == 'name');
                        if (rn.value != item.text && rn.value) {
                            self.schema.onSchemaOperate([
                                { name: 'updateSchemaView', id: item.value, data: { text: rn.value } }
                            ]);
                            item.text = rn.value;
                            mp.updateItems(items);
                        }
                        if (!lodash.isEqual(rn.icon, item.icon)) {
                            self.schema.onSchemaOperate([
                                { name: 'updateSchemaView', id: item.value, data: { icon: rn.icon } }
                            ]);
                            item.icon = rn.icon;
                            mp.updateItems(items);
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
                    self.onSchemaViewMove(self.schema.views[from].id, from, to);
                }
            }
        });
        if (r?.item?.name) {
            if (r.item.name == 'link') {
                self.onCopyViewLink();
            }
            else if (r.item.name == 'delete') {
                self.onDelete();
            }
            else if (r.item.name == 'datasource') {
                self.onOpenDataSource(rect);
            }
            else if (r.item.name == 'turn') {
                self.onDataGridTurnView(r.item.value);
            }
            else if (r.item.name == 'viewConfig') {
                self.onOpenEchartsConfig(rect);
            }
            else if (r.item.name == 'clone') {
                self.onCopySchemaView();
            }
            else if (r.item.name == 'addView') {
                await self.onAddCreateTableView();
            }
        }
        if (rname.value != self.schemaView.text && rname.value) {
            self.onSchemaViewUpdate(view?.id, { text: rname.value });
        }
        if (!lodash.isEqual(rname.icon, self.schemaView.icon)) {
            self.onSchemaViewUpdate(view?.id, { icon: rname.icon });
        }
    }
    async onOpenEchartsConfig(rect: Rect) {
        await useDataGridChartConfig({ roundArea: rect }, { dataGrid: this })
    }
}

@view('/data-grid/charts')
export class DataGridChartView extends BlockView<DataGridChart>{
    onMousedown(event: React.MouseEvent, operator: 'bottom-right' | 'bottom-left') {
        event.stopPropagation();
        var el = this.block.el;
        var bound = el.getBoundingClientRect();
        var self = this;
        MouseDragger<{ event: React.MouseEvent, realWidth: number, realHeight: number }>({
            event,
            moveStart(ev, data) {
                data.realWidth = self.block.canvasWith;
                data.realHeight = self.block.canvasHeight;
                data.event = ev as any;
                self.forceUpdate();
            },
            moving(ev, data, isEnd) {
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
                    self.block.onUpdateProps({ canvasWith: width, canvasHeight: height });
                    self.forceUpdate();
                }
            }
        })
    }
    imageWrapper: HTMLDivElement;
    renderView() {
        var style: CSSProperties = {
            justifyContent: 'center'
        }
        if (this.block.align == 'left') style.justifyContent = 'flex-start'
        else if (this.block.align == 'right') style.justifyContent = 'flex-end'
        return <div className='sy-dg-charts visible-hover'>
            <div className="flex-center" style={style}>
                <div className="relative" ref={e => this.imageWrapper = e} style={{ width: this.block.canvasWith, height: this.block.canvasHeight }}>
                    <div className="sy-dg-echarts-view w100 h100" ></div>
                    {this.block.isCanEdit() && <>
                        <div className="sy-block-resize-bottom-right visible" onMouseDown={e => this.onMousedown(e, 'bottom-right')}></div>
                        <div className="sy-block-resize-bottom-left visible" onMouseDown={e => this.onMousedown(e, 'bottom-left')}></div>
                        <div className="flex visible pos-top-right gap-10 ">
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
                            }} className="size-24 round flex-center bg-dark cursor  text-white gap-r-10"><Icon size={18} icon={SettingsSvg}></Icon></span>
                            <span onMouseDown={async e => {
                                e.stopPropagation();
                                var pa = e.currentTarget.parentElement;
                                pa.classList.remove('visible');
                                await this.block.onContextmenu(e.nativeEvent);
                                pa.classList.add('visible');

                            }} className="size-24 round flex-center bg-dark cursor  text-white "><Icon size={18} icon={DotsSvg}></Icon></span>
                        </div>
                    </>}
                </div>

            </div>

        </div>
    }
}