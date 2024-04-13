import lodash from "lodash";
import React from "react";
import { GetFieldTypeSvg, getChartViews, getSchemaViewIcon, getSchemaViews } from "../../../blocks/data-grid/schema/util";
import { CardFactory } from "../../../blocks/data-grid/template/card/factory/factory";
import { EventsComponent } from "../../../component/lib/events.component";
import { MenuItem, MenuItemType } from "../../../component/view/menu/declare";
import { MenuView } from "../../../component/view/menu/menu";
import { lst } from "../../../i18n/store";
import { BlockUrlConstant } from "../../../src/block/constant";
import { BlockRenderRange } from "../../../src/block/enum";
import { Rect } from "../../../src/common/vector/point";
import { DataGridChartConfig } from ".";
import { S } from "../../../i18n/view";
import { SelectBox } from "../../../component/view/select/box";
import { DataGridChart } from "../../../blocks/data-grid/view/statistic/charts";
import { FieldType } from "../../../blocks/data-grid/schema/type";
import { CheckSvg, CloseSvg, LoopSvg, PlusSvg } from "../../../component/svgs";
import { Icon } from "../../../component/view/icon";
import { getEchartTheme } from "../../../blocks/data-grid/view/statistic/load";
import { Divider } from "../../../component/view/grid";
import { Switch } from "../../../component/view/switch";
import { renderEcharts } from "../../../blocks/data-grid/view/statistic/render";
import { InputNumber } from "../../../component/view/input/number";
import { DynamicDateInput } from "../../date/input";

export class DataGridChartViewConfig extends EventsComponent<{ gc: DataGridChartConfig }> {
    get schema() {
        return this.block?.schema
    }
    block: DataGridChart
    getItems(): MenuItem[] {
        var self = this;
        var cms = CardFactory.getCardModels(this.schema);
        var baseItems: MenuItem[] = [
            {
                value: this.block.schemaView.text,
                name: 'viewText',
                type: MenuItemType.inputTitleAndIcon,
                icon: getSchemaViewIcon(this.block.schemaView) || { name: 'byte', code: 'chart-proportion' },
            },
            { type: MenuItemType.gap },
            {
                text: lst('视图'),
                icon: LoopSvg,
                childs: [
                    ...getSchemaViews().map(v => {
                        return {
                            name: "toggleView",
                            value: v.url,
                            text: v.text,
                            icon: getSchemaViewIcon(v as any),
                            checkLabel: !this.block.getCardUrl() && this.block.url == v.url
                        }
                    }),
                    {
                        text: lst('数据视图'),
                        icon: { name: 'bytedance-icon', code: 'application-two' },
                        childsStyle: { width: 300 },
                        childs: [
                            { text: lst('选择数据视图'), type: MenuItemType.text },
                            ...cms.map(c => {
                                return {
                                    type: MenuItemType.custom,
                                    name: 'dataView',
                                    value: c.model.url,
                                    render(item, view) {
                                        return <div className="flex-full relative item-hover round padding-w-14 padding-h-10">
                                            <div className="flex-fixed">
                                                <img src={c.model.image} className="obj-center h-60 w-120" />
                                            </div>
                                            <div className="flex-auto gap-l-10">
                                                <div>{c.model.title}</div>
                                                <div className="remark">{c.model.remark}</div>
                                            </div>
                                            {self.block.getCardUrl() == c.model.url && <div className="pos pos-right pos-t-5 pos-r-5 size-20 cursor round">
                                                <Icon size={16} icon={CheckSvg}></Icon>
                                            </div>}
                                        </div>
                                    }
                                }
                            })
                        ]
                    }
                ]
            },
            { type: MenuItemType.divide }
        ]
        return baseItems
    }
    onOpen(block: DataGridChart) {
        this.block = block;
        this.forceUpdate();
    }
    onStoreViewText = lodash.debounce((value) => {
        var self = this;
        self.block.onSchemaViewUpdate(self.block.syncBlockId, { text: value });
    }, 700)
    renderItems() {
        var self = this;
        async function input(item) {
            if (item.name == 'size') self.block.onChangeSize(item.value)
            else if (item.name == 'noTitle') self.block.onUpdateProps({ noTitle: !item.checked }, { range: BlockRenderRange.self });
            else if (item.name == 'openRecordSource') self.block.onUpdateProps({ openRecordSource: item.value }, {})
            else if (item.name == 'createRecordSource') self.block.onUpdateProps({ createRecordSource: item.value }, {})
            else if (item.name == 'showRowNum') self.block.onShowRowNum(item.checked);
            else if (item.name == 'checkRow') {
                await self.block.onShowCheck(item.checked ? "checkbox" : 'none');
            }
            else if (item.name == 'showPager') {
                await self.block.onExtendTriggerBlock(BlockUrlConstant.DataGridPage, {}, !self.block.hasTriggerBlock(BlockUrlConstant.DataGridPage))
            }
            else if (item.name == 'noHead') {
                await self.block.onUpdateProps({ noHead: !item.checked }, { range: BlockRenderRange.self });
            }
            else if (['gallerySize', 'cardConfig.showField', 'dateFieldId', 'groupFieldId'].includes(item.name)) {
                await self.block.onUpdateProps({ [item.name]: item.value }, { range: BlockRenderRange.self });
            }
            else if (item.name == 'viewText') {
                if (self.block.schemaView.text != item.value)
                    self.onStoreViewText(item.value);
                else if (!lodash.isEqual(self.block.schemaView.icon, item.icon))
                    self.block.onSchemaViewUpdate(self.block.syncBlockId, { icon: item.icon });
            }
            else if (item.name == 'lock') {
                self.block.onTableSchemaLock(item.checked);
            }
        }
        function select(item, event) {
            if (item?.name == 'datasource') {
                self.block.onOpenDataSource(Rect.fromEvent(event));
            }
            else if (item?.name == 'toggleView') {
                self.block.onDataGridChangeView(item.value);
                self.props.gc.onClose();
            }
            else if (item?.name == 'dataView') {
                self.block.onDataGridChangeViewByTemplate(item.value);
                self.props.gc.onClose();
            }
        }
        function click(item) {

        }
        return <MenuView input={input} select={select} click={click} style={{
            paddingTop: 10,
        }} items={this.getItems()}></MenuView>
    }
    get bc() {
        return (this.block as any) as DataGridChart;
    }
    getChartMessage() {
        if (this.bc?.chart_type == 'graph') {
            var f = this.schema.fields.find(g => g.type == FieldType.relation);
            if (f) {
                if (f.config?.relationTableId == this.schema.id) return false;
            }
            return <div className="error f-12"><S text='graph统计意义'>存在关联字段且关联表指向自身，关系图才有意义</S></div>
        }
        else if (this.bc?.chart_type == 'radar') {
            var ns = this.schema.fields.findAll(g => g.type == FieldType.number);
            if (ns.length < 3) return <div className="error f-12"><S text='radar统计意义'>存在至少三个数值字段的统计,雷达图才有意义</S></div>
        }
        else if (this.bc?.chart_type == 'scatter') {
            var ns = this.schema.fields.findAll(g => g.type == FieldType.number);
            if (ns.length < 2) return <div className="error f-12"><S text='scatter统计意义'>存在两到三个数值字段的统计，散点图才有意义</S></div>
        }
        return false;
    }
    async changeChartType(type) {
        var props: Record<string, any> = {
            chart_type: type
        }
        if (type == 'radar') {
            var nfs = this.schema.fields.findAll(g => g.type == FieldType.number);
            if (nfs.length > 2) {
                if (!(Array.isArray(this.bc.chart_config?.aggs) && this.bc.chart_config?.aggs.length > 2)) {
                    props['chart_config.aggs'] = nfs.slice(0, 3).map(f => {
                        return {
                            fieldId: f.id,
                            aggregate: '$sum',
                            target: 100
                        }
                    })
                }
            }
        }
        else if (type == 'scatter') {
            var nfs = this.schema.fields.findAll(g => g.type == FieldType.number);
            if (nfs.length >= 2) {
                if (!this.bc.chart_config?.y_fieldId) {
                    props['chart_config.y_fieldId'] = nfs[0]?.id;
                    props['chart_config.y_aggregate'] = '$sum';
                }
                if (!this.bc.chart_config?.y1_fieldId) {
                    props['chart_config.y1_fieldId'] = nfs[1]?.id;
                    props['chart_config.y1_aggregate'] = '$sum';
                }
            }
        }
        else if (type == 'graph') {
            var nc = this.schema.fields.find(g => g.type == FieldType.relation);
            if (nc) {
                if (!this.bc.chart_config?.graph_fieldId)
                    props['chart_config.graph_fieldId'] = nc.id;
            }
        }
        else if (type == 'calendarHeatmap') {

        }
        await this.bc.onUpdateProps(props, { range: BlockRenderRange.self })
        await this.bc.didMounted();
        this.forceUpdate()
    }
    renderPropertys() {
        var EchartThemes = getEchartTheme()
        var bc = (this.block as any) as DataGridChart;
        var charts = getChartViews();
        var cm = this.getChartMessage();
        return <div className="gap-b-14 r-gap-h-5">
            <div className="flex gap-w-10 padding-w-5 padding-h-3 round item-hover">
                <div className="flex-auto"><S>图表</S></div>
                <div className="flex-fixed">
                    <SelectBox
                        textAlign="right"
                        options={charts.map(c => {
                            if (c.type == MenuItemType.divide) return c as any;
                            return {
                                text: c.text,
                                icon: c.icon,
                                type: MenuItemType.item,
                                value: c.name
                            }
                        })}
                        onChange={async e => {
                            this.changeChartType(e)
                        }} value={bc.chart_type}></SelectBox>
                </div>
            </div>
            {cm && <div className="gap-w-10">{cm}</div>}
            {!cm && <div>
                {!["calendarHeatmap", "summary"].includes(bc.chart_type) && <div className="flex gap-w-10 padding-w-5 padding-h-3 round item-hover gap-h-5">
                    <div className="flex-auto"><S>主题</S></div>
                    <div className={"flex-fixed"}>
                        <SelectBox
                            textAlign="right"
                            value={bc.chart_config?.theme}
                            dropHeight={150}
                            dropWidth={230}
                            onChange={async e => {
                                await bc.onUpdateProps({ 'chart_config.theme': e }, { range: BlockRenderRange.self })
                                await bc.didMounted();
                                this.forceUpdate()
                            }}
                            options={EchartThemes.map(ec => {
                                return {
                                    text: ec.text,
                                    value: ec.name,
                                    type: MenuItemType.custom,
                                    render(item, view) {
                                        return <div className="flex gap-h-5 padding-w-10 cursor round item-hover">
                                            <span className="flex-fixed size-24 flex-center">
                                                {item.value == bc.chart_config?.theme && <Icon size={18} icon={CheckSvg}></Icon>}
                                            </span>
                                            <span className="flex-fixed gap-r-10 text-1 w-60">{item.text}</span>
                                            <div className="flex-auto flex-end " dangerouslySetInnerHTML={{ __html: ec.html }}></div>
                                        </div>
                                    },
                                }
                            })}></SelectBox>
                    </div>
                </div>}
                {bc.chart_type == 'line' && <>
                    <div className="flex gap-w-10 padding-w-5 padding-h-3 round  item-hover gap-h-5">
                        <div className="flex-auto"><S>面积</S></div>
                        <div className={"flex-fixed"}>
                            <Switch checked={bc.chart_config?.isArea}
                                onChange={async e => {
                                    await bc.onUpdateProps({ 'chart_config.isArea': e }, { range: BlockRenderRange.self })
                                    await renderEcharts(bc);
                                    this.forceUpdate()
                                }}
                            ></Switch>
                        </div>
                    </div>
                    <div className="flex gap-w-10 padding-w-5 padding-h-3 round  item-hover gap-h-5">
                        <div className="flex-auto"><S>平滑</S></div>
                        <div className={"flex-fixed"}>
                            <Switch checked={bc.chart_config?.isSmooth}
                                onChange={async e => {
                                    await bc.onUpdateProps({ 'chart_config.isSmooth': e }, { range: BlockRenderRange.self })
                                    await renderEcharts(bc);
                                    this.forceUpdate()
                                }}
                            ></Switch>
                        </div>
                    </div>
                    <div className="flex gap-w-10 padding-w-5 padding-h-3 round  item-hover gap-h-5">
                        <div className="flex-auto"><S>水平</S></div>
                        <div className={"flex-fixed"}>
                            <Switch checked={bc.chart_config?.isX}
                                onChange={async e => {
                                    await bc.onUpdateProps({ 'chart_config.isX': e }, { range: BlockRenderRange.self })
                                    await renderEcharts(bc);
                                    this.forceUpdate()
                                }}
                            ></Switch>
                        </div>
                    </div>
                </>}
                {bc.chart_type == 'radar' && <>
                    <div className="flex gap-w-10 padding-w-5 padding-h-3 round  item-hover gap-h-5">
                        <div className="flex-auto"><S>面积</S></div>
                        <div className={"flex-fixed"}>
                            <Switch checked={bc.chart_config?.isArea}
                                onChange={async e => {
                                    await bc.onUpdateProps({ 'chart_config.isArea': e }, { range: BlockRenderRange.self })
                                    await renderEcharts(bc);
                                    this.forceUpdate()
                                }}
                            ></Switch>
                        </div>
                    </div>
                </>}
                {bc.chart_type == 'graph' && <>
                    <div className="flex gap-w-10 padding-w-5 padding-h-3 round  item-hover gap-h-5">
                        <div className="flex-auto"><S>环形</S></div>
                        <div className={"flex-fixed"}>
                            <Switch checked={bc.chart_config?.isRadius}
                                onChange={async e => {
                                    await bc.onUpdateProps({ 'chart_config.isRadius': e }, { range: BlockRenderRange.self })
                                    await renderEcharts(bc);
                                    this.forceUpdate()
                                }}
                            ></Switch>
                        </div>
                    </div>
                </>}
                {bc.chart_type == 'bar' && <>
                    <div className="flex gap-w-10 padding-w-5 padding-h-3 round  item-hover gap-h-5">
                        <div className="flex-auto"><S>水平</S></div>
                        <div className={"flex-fixed"}>
                            <Switch checked={bc.chart_config?.isX}
                                onChange={async e => {
                                    await bc.onUpdateProps({ 'chart_config.isX': e }, { range: BlockRenderRange.self })
                                    await renderEcharts(bc);
                                    this.forceUpdate()
                                }}
                            ></Switch>
                        </div>
                    </div>
                </>}
                {bc.chart_type == 'pie' && <div className="flex gap-w-10 padding-w-5 padding-h-3 round  item-hover gap-h-5">
                    <div className="flex-auto"><S>环形</S></div>
                    <div className={"flex-fixed"}>
                        <Switch checked={bc.chart_config?.isRadius}
                            onChange={async e => {
                                await bc.onUpdateProps({ 'chart_config.isRadius': e }, { range: BlockRenderRange.self })
                                await renderEcharts(bc);
                                this.forceUpdate()
                            }}
                        ></Switch>
                    </div>
                </div>}
                <Divider></Divider>
                {this.renderAggs()}
                {!["wordCloud", 'pie', 'gauge', "summary", "calendarHeatmap", "radar"].includes(bc.chart_type) && <div className="flex gap-w-10 padding-w-5 padding-h-3 round item-hover">
                    <div className="flex-fixed"><S>字段分组</S></div>
                    <div className={"flex-auto flex-end " + (this.schema.isType(bc.chart_config?.group_fieldId, FieldType.createDate, FieldType.date, FieldType.modifyDate) ? " flex-end" : "")}>
                        <SelectBox
                            textAlign="right"
                            value={bc.chart_config?.group_fieldId}
                            dropHeight={150}
                            onChange={async e => {
                                var sf = this.block.schema.fields.find(g => g.id == e);
                                var props = {
                                    'chart_config.group_fieldId': e
                                }
                                if (sf && [FieldType.createDate, FieldType.date, FieldType.modifyDate].includes(sf.type)) {
                                    if (!bc.chart_config.group_fieldIdUnit)
                                        props['chart_config.group_fieldIdUnit'] = 'day';
                                }
                                else {
                                    props['chart_config.group_fieldIdUnit'] = '';
                                }
                                await bc.onUpdateProps(props, { range: BlockRenderRange.self })
                                await bc.didMounted();
                                this.forceUpdate()
                            }}
                            options={[
                                { text: '无', value: '', icon: { name: 'bytedance-icon', code: 'square' } },
                                { type: MenuItemType.divide },
                                ...this.schema.fields.findAll(g => [
                                    FieldType.title,
                                    FieldType.date,
                                    FieldType.createDate,
                                    FieldType.user,
                                    FieldType.number,
                                    FieldType.creater,
                                    FieldType.option,
                                    FieldType.options,
                                    FieldType.modifyDate,
                                    FieldType.modifyer
                                ].includes(g.type) && bc?.chart_config.y_fieldId != g.id).map(f => {
                                    return {
                                        text: f.text,
                                        icon: GetFieldTypeSvg(f.type),
                                        value: f.id
                                    }
                                })]}></SelectBox>
                        {
                            this.schema.isType(bc.chart_config?.group_fieldId, FieldType.createDate, FieldType.date, FieldType.modifyDate) && <SelectBox
                                textAlign="right"
                                value={bc.chart_config?.group_fieldIdUnit || 'year'}
                                className={'gap-l-10'}
                                onChange={async e => {
                                    await bc.onUpdateProps({ 'chart_config.group_fieldIdUnit': e }, { range: BlockRenderRange.self })
                                    await bc.didMounted();
                                    this.forceUpdate()
                                }}
                                options={[
                                    { text: lst('按年'), value: 'year' },
                                    { text: lst('按月'), value: 'month' },
                                    { text: lst('按周'), value: 'week' },
                                    { text: lst('按日'), value: 'day' },
                                ]}
                            >
                            </SelectBox>
                        }
                    </div>
                </div>}
            </div>}
        </div>
    }

    renderAggs() {
        var bc = (this.block as any) as DataGridChart;
        function getSOptions() {
            return [
                { text: lst('求和'), value: '$sum', icon: { name: 'byte', code: 'formula' } },
                { text: lst('平均'), value: '$avg', icon: { name: 'byte', code: 'average' } },
                { text: lst('最小'), value: '$min', icon: { name: 'byte', code: 'min' } },
                { text: lst('最大'), value: '$max', icon: { name: 'byte', code: 'maximum' } },
            ] as MenuItem<string>[];
        }
        var numberField = this.schema.fields.find(g => g.type == FieldType.number);
        if (bc.chart_type == 'radar') {
            var nfs = this.schema.fields.findAll(g => g.type == FieldType.number);
            return <div>
                <div className="gap-w-10"><span className="f-12 remark"><S>统计</S></span></div>
                <div className="flex gap-w-10 padding-w-5 padding-h-3 round gap-h-5 item-hover">
                    <div className="flex-fixed gap-r-10"><S text="维度_X轴">维度(X轴)</S></div>
                    <div className={"flex-auto flex flex-end "}>
                        <SelectBox textAlign="right" dropHeight={150}
                            value={bc.chart_config?.x_fieldId}
                            onChange={async e => {
                                var sf = this.schema.fields.find(g => g.id == e);
                                var props = {
                                    'chart_config.x_fieldId': e
                                }
                                if (sf && [FieldType.createDate, FieldType.date, FieldType.modifyDate].includes(sf.type)) {
                                    if (!bc.chart_config.x_fieldIdUnit)
                                        props['bc.chart_config.x_fieldIdUnit'] = 'day';
                                }
                                else {
                                    props['bc.chart_config.x_fieldIdUnit'] = '';
                                }
                                await bc.onUpdateProps(props, { range: BlockRenderRange.self })
                                await bc.didMounted();
                                this.forceUpdate()
                            }}
                            options={this.schema.fields.findAll(g => [
                                FieldType.title,
                                FieldType.date,
                                FieldType.createDate,
                                FieldType.user,
                                FieldType.number,
                                FieldType.creater,
                                FieldType.option,
                                FieldType.options,
                                FieldType.modifyDate,
                                FieldType.modifyer
                            ].includes(g.type)).map(f => {
                                return {
                                    text: f.text,
                                    icon: GetFieldTypeSvg(f.type),
                                    value: f.id
                                }
                            })}></SelectBox>
                        {
                            this.schema.isType(bc.chart_config.x_fieldId, FieldType.date, FieldType.createDate, FieldType.modifyDate) &&
                            <SelectBox
                                className={'gap-l-10'}
                                textAlign="right"
                                value={bc.chart_config?.x_fieldIdUnit}
                                onChange={async e => {
                                    await bc.onUpdateProps({ 'chart_config.x_fieldIdUnit': e }, { range: BlockRenderRange.self })
                                    await bc.didMounted();
                                    this.forceUpdate()
                                }}
                                options={[
                                    { text: lst('按年'), value: 'year' },
                                    { text: lst('按月'), value: 'month' },
                                    { text: lst('按周'), value: 'week' },
                                    { text: lst('按日'), value: 'day' },
                                ]}
                            >
                            </SelectBox>
                        }
                    </div>
                </div>
                <div className="border round gap-h-5 gap-w-10">
                    {(bc.chart_config?.aggs || []).map((agg, i) => {
                        return <div key={i} className="flex visible-hover gap-w-10 item-hover gap-h-5 padding-w-5 padding-h-3 round ">
                            <span className="flex-fixed gap-r-10 w-80 ">
                                <SelectBox onChange={async e => {
                                    await bc.onUpdateProps(
                                        { 'chart_config.aggs': bc.chart_config.aggs.map((a, ai) => i == ai ? { ...a, fieldId: e } : a) },
                                        { range: BlockRenderRange.self }
                                    )
                                    await bc.didMounted();
                                    this.forceUpdate();
                                }}
                                    dropHeight={150}
                                    value={agg.fieldId}
                                    options={this.schema.fields.findAll(g => [FieldType.number].includes(g.type)).map(f => {
                                        return {
                                            icon: GetFieldTypeSvg(f.type),
                                            text: f.text,
                                            value: f.id
                                        }
                                    })}></SelectBox>
                            </span>
                            <span className="flex-fixed gap-r-10 w-60 "><SelectBox textAlign="right"
                                value={agg.aggregate}
                                onChange={async e => {
                                    await bc.onUpdateProps(
                                        { 'chart_config.aggs': bc.chart_config.aggs.map((a, ai) => i == ai ? { ...a, aggregate: e } : a) },
                                        { range: BlockRenderRange.self }
                                    )
                                    await bc.didMounted();
                                    this.forceUpdate()
                                }}
                                options={getSOptions()}></SelectBox></span>
                            <span className="flex-fixed gap-r-10 w-60">
                                <InputNumber size={'small'} style={{ width: 60 }} placeholder={lst('输入指标')} value={agg.target} onChange={async e => {
                                    await bc.onLazyUpdateProps({
                                        'chart_config.aggs': bc.chart_config.aggs.map((a, ai) => i == ai ? { ...a, target: e } : a)
                                    }, {
                                        range: BlockRenderRange.self, cb: async () => {
                                            await bc.didMounted();
                                            this.forceUpdate()
                                        }
                                    })
                                }}></InputNumber>
                            </span>
                            <span className="flex-fixed  w-20 flex-end">
                                {i >= 3 && <span onMouseDown={async e => {
                                    bc.chart_config.aggs.splice(i, 1);
                                    await bc.onUpdateProps({ 'chart_config.aggs': bc.chart_config.aggs }, { range: BlockRenderRange.self })
                                    await bc.didMounted();
                                    this.forceUpdate()
                                }} className={"size-20 flex-center item-hover cursor visible round"}>
                                    <Icon icon={CloseSvg} size={14}></Icon>
                                </span>
                                }
                            </span>
                        </div>
                    })}
                    {nfs.length > bc.chart_config.aggs.length && <div onMouseDown={async e => {
                        var aggs = lodash.cloneDeep(bc.chart_config.aggs)
                        aggs.push({
                            fieldId: nfs.first()?.id,
                            aggregate: '$sum',
                            target: 100,
                            sort: 'none'
                        });
                        await bc.onUpdateProps(
                            { 'chart_config.aggs': bc.chart_config.aggs },
                            { range: BlockRenderRange.self }
                        )
                        await bc.didMounted();
                        this.forceUpdate();
                    }} className="flex gap-w-10 cursor  item-hover gap-h-5 padding-w-5 padding-h-3 round">
                        <Icon size={16} icon={PlusSvg}></Icon>
                        <span><S>添加雷达图指标</S></span>
                    </div>}
                </div>
            </div>
        }
        else if (bc.chart_type == 'scatter') {
            return <div>
                <div className="gap-w-10"><span className="f-12 remark"><S>统计</S></span></div>
                <div className="flex gap-w-10 padding-w-5 padding-h-3 round gap-h-5 item-hover">
                    <div className="flex-fixed gap-r-10"><S text="维度_X轴">维度(X轴)</S></div>
                    <div className={"flex-auto flex flex-end "}>
                        <SelectBox textAlign="right" dropHeight={150}
                            value={bc.chart_config?.x_fieldId}
                            onChange={async e => {
                                var sf = this.schema.fields.find(g => g.id == e);
                                var props = {
                                    'chart_config.x_fieldId': e
                                }
                                if (sf && [FieldType.createDate, FieldType.date, FieldType.modifyDate].includes(sf.type)) {
                                    if (!bc.chart_config.x_fieldIdUnit)
                                        props['bc.chart_config.x_fieldIdUnit'] = 'day';
                                }
                                else {
                                    props['bc.chart_config.x_fieldIdUnit'] = '';
                                }
                                await bc.onUpdateProps(props, { range: BlockRenderRange.self })
                                await bc.didMounted();
                                this.forceUpdate()
                            }}
                            options={this.schema.fields.findAll(g => [
                                FieldType.title,
                                FieldType.date,
                                FieldType.createDate,
                                FieldType.user,
                                FieldType.number,
                                FieldType.creater,
                                FieldType.option,
                                FieldType.options,
                                FieldType.modifyDate,
                                FieldType.modifyer
                            ].includes(g.type)).map(f => {
                                return {
                                    text: f.text,
                                    icon: GetFieldTypeSvg(f.type),
                                    value: f.id
                                }
                            })}></SelectBox>
                        {
                            this.schema.isType(bc.chart_config.x_fieldId, FieldType.date, FieldType.createDate, FieldType.modifyDate) &&
                            <SelectBox
                                className={'gap-l-10'}
                                textAlign="right"
                                value={bc.chart_config?.x_fieldIdUnit}
                                onChange={async e => {
                                    await bc.onUpdateProps({ 'chart_config.x_fieldIdUnit': e }, { range: BlockRenderRange.self })
                                    await bc.didMounted();
                                    this.forceUpdate()
                                }}
                                options={[
                                    { text: lst('按年'), value: 'year' },
                                    { text: lst('按月'), value: 'month' },
                                    { text: lst('按周'), value: 'week' },
                                    { text: lst('按日'), value: 'day' },
                                ]}
                            >
                            </SelectBox>
                        }
                    </div>
                </div>
                <div className="border round gap-h-5 gap-w-10">
                    <div className="flex gap-w-10 item-hover gap-h-5 padding-w-5 padding-h-3 round ">
                        <span className=" gap-r-10">
                            <SelectBox onChange={async e => {
                                await bc.onUpdateProps(
                                    { 'chart_config.y_fieldId': e },
                                    { range: BlockRenderRange.self }
                                )
                                await bc.didMounted();
                                this.forceUpdate();
                            }}
                                dropHeight={150}
                                value={bc.chart_config?.y_fieldId}
                                options={this.schema.fields.findAll(g => [FieldType.number].includes(g.type)).map(f => {
                                    return {
                                        icon: GetFieldTypeSvg(f.type),
                                        text: f.text,
                                        value: f.id
                                    }
                                })}></SelectBox>
                        </span>
                        <span className=" gap-l-10"><SelectBox textAlign="right"
                            value={bc.chart_config?.y_aggregate}
                            onChange={async e => {
                                await bc.onUpdateProps({ 'chart_config.y_aggregate': e }, { range: BlockRenderRange.self })
                                await bc.didMounted();
                                this.forceUpdate()
                            }}
                            options={getSOptions()}></SelectBox></span>
                    </div>
                    <div className="flex gap-w-10  item-hover gap-h-5 padding-w-5 padding-h-3 round ">
                        <span className=" gap-r-10">
                            <SelectBox onChange={async e => {
                                await bc.onUpdateProps(
                                    { 'chart_config.y1_fieldId': e },
                                    { range: BlockRenderRange.self }
                                )
                                await bc.didMounted();
                                this.forceUpdate();
                            }}
                                dropHeight={150}
                                value={bc.chart_config?.y1_fieldId}
                                options={this.schema.fields.findAll(g => [FieldType.number].includes(g.type)).map(f => {
                                    return {
                                        icon: GetFieldTypeSvg(f.type),
                                        text: f.text,
                                        value: f.id
                                    }
                                })}></SelectBox>
                        </span>
                        <span className=" gap-l-10"><SelectBox textAlign="right"
                            value={bc.chart_config?.y1_aggregate}
                            onChange={async e => {
                                await bc.onUpdateProps({ 'chart_config.y1_aggregate': e }, { range: BlockRenderRange.self })
                                await bc.didMounted();
                                this.forceUpdate()
                            }}
                            options={getSOptions()}></SelectBox></span>
                    </div>
                    <div className="flex gap-w-10  item-hover gap-h-5 padding-w-5 padding-h-3 round ">
                        <span className="gap-r-10">
                            <SelectBox onChange={async e => {
                                await bc.onUpdateProps(
                                    { 'chart_config.y2_fieldId': e },
                                    { range: BlockRenderRange.self }
                                )
                                await bc.didMounted();
                                this.forceUpdate();
                            }}
                                dropHeight={150}
                                value={bc.chart_config?.y2_fieldId}
                                options={[
                                    { icon: { name: 'byte', code: 'square' }, text: lst('无'), value: '' },
                                    { type: MenuItemType.divide },
                                    ...this.schema.fields.findAll(g => [FieldType.number].includes(g.type)).map(f => {
                                        return {
                                            icon: GetFieldTypeSvg(f.type),
                                            text: f.text,
                                            value: f.id
                                        }
                                    })]}></SelectBox>
                        </span>
                        {bc.chart_config?.y2_fieldId && <span className=" gap-l-10"><SelectBox textAlign="right"
                            value={bc.chart_config?.y2_aggregate}
                            onChange={async e => {
                                await bc.onUpdateProps({ 'chart_config.y2_aggregate': e }, { range: BlockRenderRange.self })
                                await bc.didMounted();
                                this.forceUpdate()
                            }}
                            options={getSOptions()}></SelectBox></span>}
                    </div>
                </div>
            </div>
        }
        else if (bc.chart_type == 'graph') {
            return <div className="flex gap-w-10 gap-h-5 item-hover padding-w-5 padding-h-3 round ">
                <span className="flex-fixed"><S>关系</S></span>
                <span className="flex-auto flex-end gap-l-10">
                    <SelectBox onChange={async e => {
                        await bc.onUpdateProps(
                            { 'chart_config.graph_fieldId': e },
                            { range: BlockRenderRange.self }
                        )
                        await bc.didMounted();
                        this.forceUpdate();
                    }}
                        dropHeight={150}
                        value={bc.chart_config?.graph_fieldId}
                        options={this.schema.fields.findAll(g => [FieldType.relation].includes(g.type)).map(f => {
                            return {
                                icon: GetFieldTypeSvg(f.type),
                                text: f.text,
                                value: f.id
                            }
                        })}></SelectBox>
                </span>
            </div>
        }
        else if (bc.chart_type == 'gauge' || bc.chart_type == 'summary') {
            return <div>
                <div className="flex gap-w-10 padding-w-5 padding-h-3 round gap-h-5 item-hover">
                    <span className="flex-fixed"><S>统计</S></span>
                    <span className="flex-auto flex-end gap-r-10">
                        <SelectBox onChange={async e => {
                            await bc.onUpdateProps(
                                { 'chart_config.y_fieldId': e },
                                { range: BlockRenderRange.self }
                            )
                            await bc.didMounted();
                            this.forceUpdate();
                        }}
                            dropHeight={150}
                            value={bc.chart_config?.y_fieldId}
                            options={[
                                { icon: { name: 'byte', code: 'square' }, text: lst('总量'), value: '' },
                                { type: MenuItemType.divide },
                                ...this.schema.fields.findAll(g => [FieldType.number].includes(g.type)).map(f => {
                                    return {
                                        icon: GetFieldTypeSvg(f.type),
                                        text: f.text,
                                        value: f.id
                                    }
                                })]}></SelectBox>
                    </span>
                    {bc.chart_config.y_fieldId && <span className=" gap-l-10"><SelectBox textAlign="right"
                        value={bc.chart_config?.y_aggregate}
                        onChange={async e => {
                            await bc.onUpdateProps({ 'chart_config.y_aggregate': e }, { range: BlockRenderRange.self })
                            await bc.didMounted();
                            this.forceUpdate()
                        }}
                        options={getSOptions()}></SelectBox></span>}
                </div>
                <div className="flex gap-w-10 padding-w-5 padding-h-3 round gap-h-5 item-hover">
                    <span className="flex-fixed"><S>指标</S></span>
                    <span className="flex-auto flex-end "><InputNumber
                        size='small'
                        placeholder={lst("请输入指标")}
                        style={{ width: 100 }}
                        value={this.bc.chart_config?.targetValue}
                        onChange={async e => {
                            await this.bc.onLazyUpdateProps({
                                'chart_config.targetValue': e
                            },
                                {
                                    range: BlockRenderRange.self,
                                    cb: async () => {
                                        await bc.renderEcharts()
                                        this.forceUpdate();
                                    }
                                })
                        }}></InputNumber></span>
                </div>
            </div>
        }
        else if (bc.chart_type == 'calendarHeatmap') {
            return <div>
                <div className="gap-w-10"><span className="f-12 remark"><S>统计</S></span></div>
                <div className="flex gap-w-10 padding-w-5 padding-h-3 round gap-h-5 item-hover">
                    <div className="flex-fixed gap-r-10"><S text="维度_X轴">维度(X轴)</S></div>
                    <div className={"flex-auto flex flex-end "}>
                        <SelectBox textAlign="right" dropHeight={150}
                            value={bc.chart_config?.x_fieldId}
                            onChange={async e => {
                                var sf = this.schema.fields.find(g => g.id == e);
                                var props = {
                                    'chart_config.x_fieldId': e
                                }
                                if (sf && [FieldType.createDate, FieldType.date, FieldType.modifyDate].includes(sf.type)) {
                                    if (!bc.chart_config.x_fieldIdUnit)
                                        props['bc.chart_config.x_fieldIdUnit'] = 'day';
                                }
                                else {
                                    props['bc.chart_config.x_fieldIdUnit'] = '';
                                }
                                await bc.onUpdateProps(props, { range: BlockRenderRange.self })
                                await bc.didMounted();
                                this.forceUpdate()
                            }}
                            options={this.schema.fields.findAll(g => [
                                FieldType.date,
                                FieldType.createDate,
                                FieldType.modifyDate,
                            ].includes(g.type)).map(f => {
                                return {
                                    text: f.text,
                                    icon: GetFieldTypeSvg(f.type),
                                    value: f.id
                                }
                            })}></SelectBox>
                        {
                            this.schema.isType(bc.chart_config.x_fieldId, FieldType.date, FieldType.createDate, FieldType.modifyDate) &&
                            <SelectBox
                                className={'gap-l-10'}
                                textAlign="right"
                                value={bc.chart_config?.x_fieldIdUnit}
                                onChange={async e => {
                                    await bc.onUpdateProps({ 'chart_config.x_fieldIdUnit': e }, { range: BlockRenderRange.self })
                                    await bc.didMounted();
                                    this.forceUpdate()
                                }}
                                options={[
                                    { text: lst('按年'), value: 'year' },
                                    { text: lst('按月'), value: 'month' },
                                    { text: lst('按周'), value: 'week' },
                                    { text: lst('按日'), value: 'day' },
                                    { text: lst('按小时'), value: 'hour' }
                                ]}
                            >
                            </SelectBox>
                        }
                    </div>
                </div>
                <div className="flex gap-w-10 gap-h-5 item-hover padding-w-5 padding-h-3 round">
                    <span className="flex-fixed gap-r-10">
                        <S text='数值_Y轴'>数值（Y 轴）</S>
                    </span>
                    <div className="flex-auto flex flex-end  r-round r-cursor r-padding-h-3 r-padding-w-3 r-flex-center r-w60 ">
                        <span onMouseDown={async e => {
                            await bc.onUpdateProps({ 'chart_config.y_fieldId': '' }, { range: BlockRenderRange.self })
                            await bc.didMounted();
                            this.forceUpdate()
                        }}
                            className={" " + (bc.chart_config.y_fieldId ? "" : "item-hover-focus")}><S>统计总数</S></span>
                        <span
                            onMouseDown={async e => {
                                await bc.onUpdateProps({ 'chart_config.y_fieldId': this.schema.fields.find(g => g.type == FieldType.number)?.id }, { range: BlockRenderRange.self })
                                await bc.didMounted();
                                this.forceUpdate();
                            }}
                            className={" " + (bc.chart_config.y_fieldId && numberField ? "item-hover-focus" : "") + (numberField ? " " : " remark")}
                        ><S>聚合统计</S></span>
                    </div>
                </div>
                {
                    bc.chart_config.y_fieldId && <div className="flex gap-w-10 gap-h-5 item-hover padding-w-5 padding-h-3 round ">
                        <span className=" gap-r-10">
                            <SelectBox onChange={async e => {
                                await bc.onUpdateProps(
                                    { 'chart_config.y_fieldId': e },
                                    { range: BlockRenderRange.self }
                                )
                                await bc.didMounted();
                                this.forceUpdate();
                            }}
                                dropHeight={150}
                                value={bc.chart_config?.y_fieldId}
                                options={this.schema.fields.findAll(g => [FieldType.number].includes(g.type)).map(f => {
                                    return {
                                        icon: GetFieldTypeSvg(f.type),
                                        text: f.text,
                                        value: f.id
                                    }
                                })}></SelectBox>
                        </span>
                        <span className=" gap-l-10"><SelectBox textAlign="right"
                            value={bc.chart_config?.y_aggregate}
                            onChange={async e => {
                                await bc.onUpdateProps({ 'chart_config.y_aggregate': e }, { range: BlockRenderRange.self })
                                await bc.didMounted();
                                this.forceUpdate()
                            }}
                            options={getSOptions()}></SelectBox></span>
                    </div>
                }
                <div className="flex gap-w-10 padding-w-5 padding-h-3 round gap-h-5 item-hover">
                    <span className="flex-fixed"><S>时间范围</S></span>
                    <span className="flex-auto flex flex-end gap-r-10">
                        <span className="flex-fixed gap-l-10">
                            <DynamicDateInput
                                mode={bc.chart_config.x_fieldIdUnit}
                                value={bc.chart_config?.calendarHeatmap_value}
                                size={'small'}
                                onChange={async e => {
                                    await bc.onUpdateProps(
                                        {
                                            'chart_config.calendarHeatmap_value': e
                                        },
                                        { range: BlockRenderRange.self }
                                    )
                                    await bc.didMounted();
                                    this.forceUpdate();
                                }}></DynamicDateInput>
                        </span>
                    </span>
                </div>
            </div>
        }
        return <div>
            <div className="gap-w-10"><span className="f-12 remark"><S>统计</S></span></div>
            <div className="flex gap-w-10 padding-w-5 padding-h-3 round gap-h-5 item-hover">
                <div className="flex-fixed gap-r-10"><S text="维度_X轴">维度(X轴)</S></div>
                <div className={"flex-auto flex flex-end "}>
                    <SelectBox textAlign="right" dropHeight={150}
                        value={bc.chart_config?.x_fieldId}
                        onChange={async e => {
                            var sf = this.schema.fields.find(g => g.id == e);
                            var props = {
                                'chart_config.x_fieldId': e
                            }
                            if (sf && [FieldType.createDate, FieldType.date, FieldType.modifyDate].includes(sf.type)) {
                                if (!bc.chart_config.x_fieldIdUnit)
                                    props['bc.chart_config.x_fieldIdUnit'] = 'day';
                            }
                            else {
                                props['bc.chart_config.x_fieldIdUnit'] = '';
                            }
                            await bc.onUpdateProps(props, { range: BlockRenderRange.self })
                            await bc.didMounted();
                            this.forceUpdate()
                        }}
                        options={this.schema.fields.findAll(g => [
                            FieldType.title,
                            FieldType.date,
                            FieldType.createDate,
                            FieldType.user,
                            FieldType.number,
                            FieldType.creater,
                            FieldType.option,
                            FieldType.options,
                            FieldType.modifyDate,
                            FieldType.modifyer
                        ].includes(g.type)).map(f => {
                            return {
                                text: f.text,
                                icon: GetFieldTypeSvg(f.type),
                                value: f.id
                            }
                        })}></SelectBox>
                    {
                        this.schema.isType(bc.chart_config.x_fieldId, FieldType.date, FieldType.createDate, FieldType.modifyDate) &&
                        <SelectBox
                            className={'gap-l-10'}
                            textAlign="right"
                            value={bc.chart_config?.x_fieldIdUnit}
                            onChange={async e => {
                                await bc.onUpdateProps({ 'chart_config.x_fieldIdUnit': e }, { range: BlockRenderRange.self })
                                await bc.didMounted();
                                this.forceUpdate()
                            }}
                            options={[
                                { text: lst('按年'), value: 'year' },
                                { text: lst('按月'), value: 'month' },
                                { text: lst('按周'), value: 'week' },
                                { text: lst('按日'), value: 'day' },
                            ]}
                        >
                        </SelectBox>
                    }
                </div>
            </div>
            <div className="flex gap-w-10 gap-h-5 item-hover padding-w-5 padding-h-3 round">
                <span className="flex-fixed gap-r-10">
                    <S text='数值_Y轴'>数值（Y 轴）</S>
                </span>
                <div className="flex-auto flex flex-end  r-round r-cursor r-padding-h-3 r-padding-w-3 r-flex-center r-w60 ">
                    <span onMouseDown={async e => {
                        await bc.onUpdateProps({ 'chart_config.y_fieldId': '' }, { range: BlockRenderRange.self })
                        await bc.didMounted();
                        this.forceUpdate()
                    }}
                        className={" " + (bc.chart_config.y_fieldId ? "" : "item-hover-focus")}><S>统计总数</S></span>
                    <span
                        onMouseDown={async e => {
                            await bc.onUpdateProps({ 'chart_config.y_fieldId': this.schema.fields.find(g => g.type == FieldType.number)?.id }, { range: BlockRenderRange.self })
                            await bc.didMounted();
                            this.forceUpdate();
                        }}
                        className={" " + (bc.chart_config.y_fieldId && numberField ? "item-hover-focus" : "") + (numberField ? " " : " remark")}
                    ><S>聚合统计</S></span>
                </div>
            </div>
            {
                bc.chart_config.y_fieldId && <div className="flex gap-w-10 gap-h-5 item-hover padding-w-5 padding-h-3 round ">
                    <span className=" gap-r-10">
                        <SelectBox onChange={async e => {
                            await bc.onUpdateProps(
                                { 'chart_config.y_fieldId': e },
                                { range: BlockRenderRange.self }
                            )
                            await bc.didMounted();
                            this.forceUpdate();
                        }}
                            dropHeight={150}
                            value={bc.chart_config?.y_fieldId}
                            options={this.schema.fields.findAll(g => [FieldType.number].includes(g.type)).map(f => {
                                return {
                                    icon: GetFieldTypeSvg(f.type),
                                    text: f.text,
                                    value: f.id
                                }
                            })}></SelectBox>
                    </span>
                    <span className=" gap-l-10"><SelectBox textAlign="right"
                        value={bc.chart_config?.y_aggregate}
                        onChange={async e => {
                            await bc.onUpdateProps({ 'chart_config.y_aggregate': e }, { range: BlockRenderRange.self })
                            await bc.didMounted();
                            this.forceUpdate()
                        }}
                        options={getSOptions()}></SelectBox></span>
                </div>
            }
        </div>
    }
    render() {
        if (!this.block) return <></>
        return <div>
            {this.renderItems()}
            {this.renderPropertys()}
        </div>
    }
}