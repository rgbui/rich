import lodash from "lodash";
import React from "react";
import { GetFieldTypeSvg, getChartViews, getSchemaViewIcon } from "../../../blocks/data-grid/schema/util";
import { CardFactory } from "../../../blocks/data-grid/template/card/factory/factory";
import { EventsComponent } from "../../../component/lib/events.component";
import { MenuItem, MenuItemType } from "../../../component/view/menu/declare";
import { MenuView } from "../../../component/view/menu/menu";
import { lst } from "../../../i18n/store";
import { BlockUrlConstant } from "../../../src/block/constant";
import { BlockRenderRange } from "../../../src/block/enum";
import { Rect } from "../../../src/common/vector/point";
import { DataGridChartConfig } from ".";
import { Input } from "../../../component/view/input";
import { S } from "../../../i18n/view";
import { TableStatisticValue } from "../../../blocks/data-grid/view/statistic/value";
import { ColorInput } from "../../../component/view/color/input";
import { SelectBox } from "../../../component/view/select/box";
import { DataGridChart } from "../../../blocks/data-grid/view/statistic/charts";
import { FieldType } from "../../../blocks/data-grid/schema/type";
import { CheckSvg } from "../../../component/svgs";
import { Icon } from "../../../component/view/icon";
import { getEchartTheme } from "../../../blocks/data-grid/view/statistic/load";

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
                icon: this.block.schemaView.icon || getSchemaViewIcon(this.block.schemaView.url) || { name: 'byte', code: 'chart-proportion' },
            },
            { type: MenuItemType.divide },
            // {
            //     text: lst('视图'),
            //     icon: LoopSvg,
            //     childs: [
            //         ...getSchemaViews().map(v => {
            //             return {
            //                 name: "toggleView",
            //                 value: v.url,
            //                 text: v.text,
            //                 icon: getSchemaViewIcon(v.url),
            //                 checkLabel: !this.block.getCardUrl() && this.block.url == v.url
            //             }
            //         }),
            //         {
            //             text: lst('数据视图'),
            //             icon: { name: 'bytedance-icon', code: 'application-two' },
            //             childsStyle: { width: 300 },
            //             childs: [
            //                 { text: lst('选择数据视图'), type: MenuItemType.text },
            //                 ...cms.map(c => {
            //                     return {
            //                         type: MenuItemType.custom,
            //                         name: 'dataView',
            //                         value: c.url,
            //                         render(item, view) {
            //                             return <div className="flex-full relative item-hover round padding-w-14 padding-h-10">
            //                                 <div className="flex-fixed">
            //                                     <img src={c.image} className="obj-center h-60 w-120" />
            //                                 </div>
            //                                 <div className="flex-auto gap-l-10">
            //                                     <div>{c.title}</div>
            //                                     <div className="remark">{c.remark}</div>
            //                                 </div>
            //                                 {self.block.getCardUrl() == c.url && <div className="pos pos-right pos-t-5 pos-r-5 size-20 cursor round">
            //                                     <Icon size={16} icon={CheckSvg}></Icon>
            //                                 </div>}
            //                             </div>
            //                         }
            //                     }
            //                 })
            //             ]
            //         }
            //     ]
            // },
            // { type: MenuItemType.divide }
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
            maxHeight: 300,
            paddingTop: 10,
            paddingBottom: 5,
            overflowY: 'auto'
        }} items={this.getItems()}></MenuView>
    }
    renderPropertys() {

        if (this.block.url == '/data-grid/statistic/value') {
            var b = (this.block as any) as TableStatisticValue;
            function getSOptions() {
                return [
                    { text: lst('未填写'), value: '$isEmpty' },
                    { text: lst('已填写'), value: '$isNotEmpty' },
                    { text: lst('未填写占比'), value: '$isEmptyPer' },
                    { text: lst('已填写占比'), value: '$isNotEmptyPer' },
                ]
            }
            return <div>

                <div>
                    <div><span><S>统计记录总数</S></span><span><S>统计记录字段</S></span></div>
                    <div>
                        <span><SelectBox
                            onChange={e => {
                                b.onLazyUpdateProps(
                                    { 'statisticConfig.fieldId': e },
                                    { range: BlockRenderRange.self }
                                )
                            }}
                            value={b.statisticConfig.fieldId}
                            options={this.schema.fields.map(f => {
                                return {
                                    icon: GetFieldTypeSvg(f.type),
                                    text: f.text,
                                    value: f.id
                                }
                            })}></SelectBox></span>
                        <span><SelectBox
                            value={b.statisticConfig.indicator}
                            onChange={e => {
                                b.onLazyUpdateProps({ 'statisticConfig.indicator': e }, { range: BlockRenderRange.self })
                            }}
                            options={getSOptions()}></SelectBox></span>
                    </div>
                </div>

                <div>
                    <div><S>添加统计值的说明</S></div>
                    <div><Input
                        value={b.statisticConfig.title}
                        onChange={e => {
                            b.onLazyUpdateProps({ 'statisticConfig.title': e }, { range: BlockRenderRange.self })
                        }}
                        onEnter={e => {
                            b.onUpdateProps({ 'statisticConfig.title': e }, { range: BlockRenderRange.self })
                        }}
                    ></Input></div>
                </div>
                <div>
                    <div><S>添加目标值</S></div>
                    <div><Input
                        value={b.statisticConfig?.targetValue.toString()}
                        onChange={e => {
                            var ec = parseFloat(e);
                            if (isNaN(ec)) return;
                            b.onLazyUpdateProps({ 'statisticConfig.targetValue': ec }, { range: BlockRenderRange.self })
                        }}
                        onEnter={(e => {
                            var ec = parseFloat(e);
                            if (isNaN(ec)) return;
                            b.onUpdateProps({ 'statisticConfig.targetValue': ec }, { range: BlockRenderRange.self })
                        })}

                    ></Input></div>
                </div>
                <div>
                    <div><S>配色</S></div>
                    <div>
                        <ColorInput color={b.statisticConfig?.color}
                            onChange={e => {
                                b.onLazyUpdateProps({ 'statisticConfig.color': e }, { range: BlockRenderRange.self })
                            }}
                        ></ColorInput>
                    </div>
                </div>
            </div>
        }
        else {
            var EchartThemes = getEchartTheme()
            var bc = (this.block as any) as DataGridChart;
            function getSOptions() {
                return [
                    { text: lst('求和'), value: '$sum' },
                    { text: lst('平均'), value: '$avg' },
                    { text: lst('最小值'), value: '$min' },
                    { text: lst('最大'), value: '$max' },
                ]
            }
            var charts = getChartViews();
            var numberField = this.schema.fields.find(g => g.type == FieldType.number);
            return <div className="gap-b-14 r-gap-h-5">
                <div className="flex gap-w-10 padding-w-5 padding-h-3 round item-hover">
                    <div className="flex-auto"><S>图表</S></div>
                    <div className="flex-fixed">
                        <SelectBox textAlign="right" options={charts.map(c => {
                            return {
                                text: c.title,
                                value: c.name
                            }
                        })} onChange={async e => {
                            await bc.onUpdateProps({ chart_type: e }, { range: BlockRenderRange.self })
                            await bc.didMounted();
                            this.forceUpdate()
                        }} value={bc.chart_type}></SelectBox>
                    </div>
                </div>
                <div className="flex gap-w-10 padding-w-5 padding-h-3 round item-hover">
                    <div className="flex-fixed"><S text="维度_X轴">维度(X轴)</S></div>
                    <div className={"flex-auto " + (this.schema.isType(bc.chart_config.x_fieldId, FieldType.date, FieldType.createDate, FieldType.modifyDate) ? " flex-end" : "")}>
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
                <div className="flex gap-w-10 padding-w-5 padding-h-3 round">
                    <span className="flex-fixed gap-r-10">
                        <S text='数值_Y轴'>数值（Y 轴）</S>
                    </span>
                    <div className="flex-auto flex  r-round r-cursor r-padding-h-3 r-padding-w-3 r-flex-center r-w50 ">
                        <span onMouseDown={async e => {
                            await bc.onUpdateProps({ 'chart_config.y_fieldId': '' }, { range: BlockRenderRange.self })
                            await bc.didMounted();
                            this.forceUpdate()
                        }}
                            className={" " + (bc.chart_config.y_fieldId ? "" : "item-hover-focus")}><S>统计记录总数</S></span>
                        <span
                            onMouseDown={async e => {
                                await bc.onUpdateProps({ 'chart_config.y_fieldId': this.schema.fields.find(g => g.type == FieldType.number)?.id }, { range: BlockRenderRange.self })
                                await bc.didMounted();
                                this.forceUpdate();
                            }}
                            className={" " + (bc.chart_config.y_fieldId && numberField ? "item-hover-focus" : "") + (numberField ? " " : " remark")}
                        ><S>统计记录字段</S></span>
                    </div>
                </div>
                {
                    bc.chart_config.y_fieldId && <div className="flex gap-w-10 border gap-b-10 padding-w-5 padding-h-3 round ">
                        <span className="w50 gap-r-10">
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
                        <span className="w50 gap-l-10"><SelectBox textAlign="right"
                            value={bc.chart_config?.y_aggregate}
                            onChange={async e => {
                                await bc.onUpdateProps({ 'chart_config.y_aggregate': e }, { range: BlockRenderRange.self })
                                await bc.didMounted();
                                this.forceUpdate()
                            }}
                            options={getSOptions()}></SelectBox></span>
                    </div>
                }
                <div className="flex gap-w-10 padding-w-5 padding-h-3 round item-hover">
                    <div className="flex-auto"><S>字段分组</S></div>
                    <div className={"flex-fixed" + (this.schema.isType(bc.chart_config?.group_fieldId, FieldType.createDate, FieldType.date, FieldType.modifyDate) ? " flex-end" : "")}>
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
                </div>
                <div className="flex gap-w-10 padding-w-5 padding-h-3 round item-hover">
                    <div className="flex-auto"><S>排序</S></div>
                    <div className={"flex-fixed"}>
                        <SelectBox
                            textAlign="right"
                            value={bc.chart_config?.sort_x}
                            dropHeight={150}
                            onChange={async e => {
                                await bc.onUpdateProps({ 'chart_config.sort_x': e }, { range: BlockRenderRange.self })
                                await bc.didMounted();
                                this.forceUpdate()
                            }}
                            options={[
                                { text: lst('无'), value: 'none', icon: { name: 'bytedance-icon', code: 'square' } },
                                { type: MenuItemType.divide },
                                { text: lst('升序'), value: 'asc', icon: { name: "bytedance-icon", code: 'arrow-up' } },
                                { text: lst('降序'), value: 'desc', icon: { name: "bytedance-icon", code: 'arrow-down' } }
                            ]}></SelectBox>
                    </div>
                </div>
                <div className="flex gap-w-10 padding-w-5 padding-h-3 round item-hover">
                    <div className="flex-auto"><S>主题</S></div>
                    <div className={"flex-fixed"}>
                        <SelectBox
                            textAlign="right"
                            value={bc.chart_config?.theme}
                            dropHeight={150}
                            onChange={async e => {
                                console.log(e);
                                await bc.onUpdateProps({ 'chart_config.theme': e }, { range: BlockRenderRange.self })
                                await bc.didMounted();
                                console.log(bc.chart_config?.theme);
                                this.forceUpdate()
                            }}
                            options={EchartThemes.map(ec => {
                                return {
                                    text: ec.text,
                                    value: ec.name,
                                    type: MenuItemType.custom,
                                    render(item, view) {
                                        return <div className="flex gap-h-10">
                                            <span className="flex-fixed size-24 flex-center">
                                                {item.value == bc.chart_config?.theme && <Icon size={18} icon={CheckSvg}></Icon>}
                                            </span>
                                            <div className="flex-auto border gap-r-10" dangerouslySetInnerHTML={{ __html: ec.html }}></div>
                                        </div>
                                    },
                                }
                            })}></SelectBox>
                    </div>
                </div>
            </div >
        }
    }
    render() {
        if (!this.block) return <></>
        return <div>
            {this.renderItems()}
            {this.renderPropertys()}
        </div>
    }
}