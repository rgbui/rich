import { EChartsOption } from "echarts";
import { FieldType } from "../../schema/type";
import { DataGridChart } from "./charts";
import { loadEchart } from "./load";
import lodash from "lodash";
import { channel } from "../../../../net/channel";
import { util } from "../../../../util/util";
import 'echarts-wordcloud';
import { getPageText } from "../../../../src/page/declare";
import { getDateRange } from "../../../../extensions/date/input";
import dayjs from "dayjs";

export async function mapValue<T = (string | string[])>(
    value: T,
    fieldId: string,
    dg: DataGridChart): Promise<T> {
    var f = dg.schema.fields.find(x => x.id == fieldId || x.name == fieldId);
    if ([FieldType.option, FieldType.options].includes(f.type)) {
        if (Array.isArray(value)) return value.map(x => {
            return f.config?.options.find(g => g.value == x)?.text || x;
        }) as any
        else return f.config?.options.find(g => g.value == value)?.text || value as any
    }
    else if ([FieldType.user, FieldType.creater, FieldType.modifyer].includes(f.type)) {
        var u = await channel.get('/users/basic', { ids: util.covertToArray(value) });
        if (u.ok) {
            var us = u.data.list;
            if (Array.isArray(value)) return value.map(x => {
                return us.find(g => g.id == x)?.name || x;
            }) as any
            else return us.find(g => g.id == value)?.name || value as any
        }
    }
    return value;
}

export async function loadDataGridEcharts(dg: DataGridChart, echarts) {
    var ele = dg.el?.querySelector('.sy-dg-echarts-view') as HTMLElement;
    if (ele) {
        if (typeof dg.myChart == 'undefined') {
            dg.myChart = echarts.init(ele, dg.chart_config?.theme || undefined);
        }
        else {
            dg.myChart.dispose();
            dg.myChart = echarts.init(ele, dg.chart_config?.theme || undefined);
        }
    }
    //    var th= dg.myChart.getTheme(dg.chart_config?.theme|| undefined);
    // console.log(dg.myChart);
}

export async function renderEcharts(dg: DataGridChart) {
    /**
     * 查找field
     * @param fieldId 
     * @returns 
     */
    var gf = (fieldId: string) => {
        if (fieldId) return dg.schema.fields.find(x => x.id == fieldId || x.name == fieldId)
    }
    /**
     * 通过fieldid取数组值
     * @param fieldId 
     * @param name 
     * @returns 
     */
    var gd = (fieldId: string, name?: string) => {
        return dg.data.map(g => g[dg.schema.fields.find(x => x.id == fieldId || x.name == fieldId)?.name || name])
    }
    /**
     * 取指定name的数组值
     * @param name 
     * @param isGuid 去重
     * @returns 
     */
    var gn = (name: string, isGuid?: boolean) => {
        var rs = dg.data.map(g => g[name])
        if (isGuid) return lodash.uniqBy(rs, g => g)
        return rs;
    }
    
    var echarts = await loadEchart();
    await loadDataGridEcharts(dg, echarts);
    var groups: string[] = [];
    groups.push(gf(dg.chart_config?.x_fieldId)?.name);
    groups.push(gf(dg.chart_config?.group_fieldId)?.name);
    lodash.remove(groups, g => g ? false : true);
    if (dg.chart_type == 'gauge') {
        option = {
            tooltip: {
                formatter: '{a} <br/>{b} : {c}%'
            },
            title: {
                text: dg.schemaView?.text,
                subtext: dg.chart_config?.remark,
                left: 'center'
            },
            series: [
                {
                    name: 'Pressure',
                    type: 'gauge',
                    progress: {
                        show: true
                    },
                    detail: {
                        valueAnimation: true,
                        formatter: '{value}'
                    },
                    data: [
                        {
                            value: dg.statisticValue || 0,
                            name: dg.schemaView?.text
                        }
                    ]
                }
            ]
        }
        dg.myChart.setOption(option);
    }
    else if (dg.chart_type == 'calendarHeatmap') {
        var y = gf(dg.chart_config?.x_fieldId)?.name;
        var n = gf(dg.chart_config?.y_fieldId)?.name;
        var unit = dg.chart_config?.x_fieldIdUnit;
        var sd = getDateRange(dg.chart_config?.calendarHeatmap_value, dg.chart_config?.x_fieldIdUnit);
        var ds: [string, number][] = [];

        for (let i = 0; i < 366; i++) {
            var s = i == 0 ? dayjs(sd.start) : dayjs(sd.start).add(i, 'day');
            var dt = s.format('YYYY-MM-DD');
            var r = dg.data.find(g => g[y] == dt);
            if (r) {
                ds.push([
                    s.format('YYYY-MM-DD'),
                    r[n] || 0
                ])
            }
            else ds.push([
                s.format('YYYY-MM-DD'),
                0
            ])
            if (s.isSame(sd.end, 'day')) {
                break;
            }
        }

        var option: EChartsOption = {
            visualMap: {
                show: false,
                min: 0,
                max: 10000
            },
            calendar: {
                range: sd.start.getFullYear()
            },
            series: {
                type: 'heatmap',
                coordinateSystem: 'calendar',
                data: ds
                // data: getVirtualData('2017')
            }
        };
        dg.myChart.setOption(option);
    }
    else if (dg.chart_type == 'graph') {
        var option: EChartsOption = {
            tooltip: {},
            title: {
                text: dg.schemaView?.text,
                subtext: dg.chart_config?.remark,
                left: 'center'
            },
            legend: [
                {
                    data: dg.graphData.categories.map(c => c.name)
                }
            ],
            series: [
                {
                    name: dg.schemaView?.text,
                    type: 'graph',
                    layout: dg.chart_config?.isRadius ? "circular" : 'force',
                    // layout: 'none',
                    data: dg.graphData.nodes.map(c => {
                        return {
                            ...c,
                            symbolSize: c.value,
                            // x: Math.random() * 200,
                            // y: Math.random() * 200
                        }
                    }),
                    links: dg.graphData.links,
                    categories: dg.graphData.categories,
                    roam: true,
                    label: {
                        show: true,
                        position: 'right',
                        formatter: '{b}'
                    },
                    labelLayout: {
                        hideOverlap: true
                    },
                    scaleLimit: {
                        min: 0.4,
                        max: 2
                    },
                    lineStyle: {
                        color: 'source',
                        curveness: 0.3
                    }
                }
            ]
        };
        dg.myChart.setOption(option);
    }
    else if (dg.chart_type == 'wordCloud') {
        var xs = dg.data.map(g => g[groups[0]]);
        xs = await mapValue(xs, dg.chart_config?.x_fieldId, dg) as any[];
        var ys = gd(dg.chart_config?.y_fieldId, 'count');
        option = {
            title: {
                text: dg.schemaView?.text,
                subtext: dg.chart_config?.remark,
                left: 'center'
            },
            series: [{
                type: 'wordCloud',

                // The shape of the "cloud" to draw. Can be any polar equation represented as a
                // callback function, or a keyword present. Available presents are circle (default),
                // cardioid (apple or heart shape curve, the most known polar equation), diamond (
                // alias of square), triangle-forward, triangle, (alias of triangle-upright, pentagon, and star.

                shape: 'circle',

                // Keep aspect ratio of maskImage or 1:1 for shapes
                // This option is supported since echarts-wordcloud@2.1.0
                keepAspect: false,

                // A silhouette image which the white area will be excluded from drawing texts.
                // The shape option will continue to apply as the shape of the cloud to grow.

                // maskImage: maskImage,

                // Folllowing left/top/width/height/right/bottom are used for positioning the word cloud
                // Default to be put in the center and has 75% x 80% size.

                left: 'center',
                top: 'center',
                width: '70%',
                height: '80%',
                right: null,
                bottom: null,

                // Text size range which the value in data will be mapped to.
                // Default to have minimum 12px and maximum 60px size.

                sizeRange: [12, 60],

                // Text rotation range and step in degree. Text will be rotated randomly in range [-90, 90] by rotationStep 45

                rotationRange: [-90, 90],
                rotationStep: 45,

                // size of the grid in pixels for marking the availability of the canvas
                // the larger the grid size, the bigger the gap between words.

                gridSize: 8,

                // set to true to allow word to be drawn partly outside of the canvas.
                // Allow word bigger than the size of the canvas to be drawn
                // This option is supported since echarts-wordcloud@2.1.0
                drawOutOfBound: false,

                // if the font size is too large for the text to be displayed,
                // whether to shrink the text. If it is set to false, the text will
                // not be rendered. If it is set to true, the text will be shrinked.
                // This option is supported since echarts-wordcloud@2.1.0
                shrinkToFit: false,
                // If perform layout animation.
                // NOTE disable it will lead to UI blocking when there is lots of words.
                layoutAnimation: true,
                // Global text style
                textStyle: {
                    fontFamily: 'sans-serif',
                    // fontWeight: 'bold',
                    // Color can be a callback function or a color string
                    // color: function () {
                    //     // Random color
                    //     return 'rgb(' + [
                    //         Math.round(Math.random() * 160),
                    //         Math.round(Math.random() * 160),
                    //         Math.round(Math.random() * 160)
                    //     ].join(',') + ')';
                    // }
                },
                emphasis: {
                    focus: 'self',
                    textStyle: {
                        // textShadowBlur: 10,
                        // textShadowColor: '#333'
                    }
                },
                // Data is an array. Each array item must have name and value property.
                data: xs.map(x => {
                    return {
                        name: x,
                        value: ys[xs.indexOf(x)] || 0
                    }
                })
            }]
        } as any;
        console.log(option);
        dg.myChart.setOption(option);
    }
    else {
        if (dg.chart_type == 'radar' || dg.chart_type == 'pie') {
            groups = groups.slice(0, 1);
        }
        if (groups.length == 1) {
            var xs = dg.data.map(g => g[groups[0]]);
            var xos = lodash.cloneDeep(xs);
            xs = await mapValue(xs, dg.chart_config?.x_fieldId, dg) as any[];
            var ys = gd(dg.chart_config?.y_fieldId, 'count');
            var ys1 = gd(dg.chart_config?.y1_fieldId)
            var ys2 = gd(dg.chart_config?.y2_fieldId)
            var option: EChartsOption = {
                title: {
                    text: dg.schemaView?.text,
                    subtext: dg.chart_config?.remark,
                    left: 'center'
                },
                xAxis: {
                    type: 'category',
                    data: xs
                },
                yAxis: {
                    type: 'value'
                },
                tooltip: {
                    trigger: 'item'
                },
                series: [
                    {
                        name: dg.schemaView?.text,
                        data: ys,
                        type: 'line'
                    }
                ]
            };
            if (dg.chart_config?.isX) {
                (option as any).xAxis.type = 'value';
                delete (option as any).xAxis.data;
                (option as any).yAxis.type = 'category';
                (option as any).yAxis.data = xs;
            }
            switch (dg.chart_type) {
                case 'line':
                    if (dg.chart_config?.isSmooth)
                        lodash.set(option, 'series[0].smooth', true);
                    if (dg.chart_config?.isArea)
                        lodash.set(option, 'series[0].areaStyle', {});
                    break;
                case 'bar':
                    lodash.set(option, 'series[0].type', 'bar');
                    break;
                case 'pie':
                    option = {
                        title: {
                            text: dg.schemaView?.text,
                            subtext: dg.chart_config?.remark,
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
                                name: gf(groups[0])?.text,
                                type: 'pie',
                                radius: dg.chart_config?.isRadius ? ['40%', '70%'] : '50%',
                                data: xs.map(x => {
                                    return {
                                        name: x,
                                        value: ys[xs.indexOf(x)]
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
                    option = {
                        title: {
                            text: dg.schemaView?.text,
                            subtext: dg.chart_config?.remark,
                            left: 'center'
                        },
                        tooltip: {
                            trigger: 'item'
                        },
                        legend: {
                            right: '10%',
                            top: '3%',
                            data: [dg.schemaView?.text]
                        },
                        grid: {
                            left: '8%',
                            top: '10%'
                        },
                        xAxis: {
                            splitLine: {
                                lineStyle: {
                                    type: 'dashed'
                                }
                            }
                        },
                        yAxis: {
                            splitLine: {
                                lineStyle: {
                                    type: 'dashed'
                                }
                            },
                            scale: true
                        },
                        series: [
                            {
                                name: dg.schemaView?.text,
                                data: ys.map((g, i) => [g, ys1 ? ys1[i] : null, ys2 ? ys2[i] : null, xs[i]]),
                                type: 'scatter',
                                // symbolSize: ys2 ? function (data) {
                                //     return Math.sqrt(data[2]) / 5e2;
                                // } : 20,
                                emphasis: {
                                    focus: 'series',
                                    label: {
                                        show: true,
                                        formatter: function (param) {
                                            return param.data[3];
                                        },
                                        position: 'top'
                                    }
                                },
                                itemStyle: {
                                    // shadowBlur: 10,
                                    // shadowColor: 'rgba(120, 36, 50, 0.5)',
                                    // shadowOffsetY: 5,
                                    // color: new echarts.graphic.RadialGradient(0.4, 0.3, 1, [
                                    //     {
                                    //         offset: 0,
                                    //         color: 'rgb(251, 118, 123)'
                                    //     },
                                    //     {
                                    //         offset: 1,
                                    //         color: 'rgb(204, 46, 72)'
                                    //     }
                                    // ])
                                }
                            }
                        ]
                    }
                    break;
                case 'radar':
                    //https://echarts.apache.org/examples/zh/editor.html?c=radar
                    option = {
                        title: {
                            text: dg.schemaView?.text,
                            subtext: dg.chart_config?.remark,
                            left: 'center'
                        },
                        tooltip: { trigger: 'axis' },
                        legend: {
                            data: [dg.schemaView?.text]
                        },
                        radar: {
                            // shape: 'circle',
                            indicator: (dg.chart_config?.aggs || []).map(agg => {
                                var af = gf(agg.fieldId)
                                return { name: af?.text, max: agg.target || 100 }
                            })
                        },
                        series: [
                            {
                                name: dg.schemaView?.text,
                                type: 'radar',
                                tooltip: {
                                    trigger: 'item'
                                },
                                areaStyle: dg.chart_config?.isArea ? {} : undefined,
                                data: await xos.asyncMap(async x => {
                                    var name = await mapValue(x, groups[0], dg);
                                    var r = dg.data.find(c => c[groups[0]] == x);
                                    return {
                                        name: name,
                                        value: (dg.chart_config?.aggs || []).map(agg => {
                                            if (r) {
                                                var af = gf(agg.fieldId)
                                                if (typeof r[af.name] == 'number')
                                                    return Math.min(agg.target || 100, r[af.name])
                                                return r[af.name] || 0
                                            }
                                            return 0;
                                        })
                                    }
                                })
                            }
                        ]
                    }
                    break;
                case 'funnel':
                    option = {
                        title: {
                            text: dg.schemaView?.text,
                            subtext: dg.chart_config?.remark,
                            left: 'center'
                        },
                        tooltip: {
                            trigger: 'item',
                            formatter: '{a}<br/>{b} : {c}'
                        },
                        toolbox: {
                            feature: {
                                dataView: { readOnly: false },
                                restore: {},
                                saveAsImage: {}
                            }
                        },
                        legend: {
                            data: xs
                        },
                        series: [
                            {
                                name: 'Funnel',
                                type: 'funnel',
                                left: '10%',
                                top: 60,
                                bottom: 60,
                                width: '80%',
                                min: 0,
                                max: 100,
                                minSize: '0%',
                                maxSize: '100%',
                                sort: 'descending',
                                gap: 2,
                                label: {
                                    show: true,
                                    position: 'inside'
                                },
                                labelLine: {
                                    length: 10,
                                    lineStyle: {
                                        width: 1,
                                        type: 'solid'
                                    }
                                },
                                itemStyle: {
                                    borderColor: '#fff',
                                    borderWidth: 1
                                },
                                emphasis: {
                                    label: {
                                        fontSize: 20
                                    }
                                },
                                data: xs.map(x => {
                                    return {
                                        name: x,
                                        value: ys[xs.indexOf(x)]
                                    }
                                })
                            }
                        ]
                    }
                    break;
            }
            dg.myChart.setOption(option);
        }
        else if (groups.length > 1) {
            var xs = gn(groups[0], true)
            var xsValues = await mapValue(xs, groups[0], dg) as any[];
            var xs2 = gn(groups[1], true);
            var xs2Values = await mapValue(xs2, groups[1], dg) as any[];
            var yname = dg.schema.fields.find(x => x.id == dg.chart_config?.y_fieldId)?.name || 'count'
            var yname1 = dg.schema.fields.find(x => x.id == dg.chart_config?.y1_fieldId)?.name;
            var yname2 = dg.schema.fields.find(x => x.id == dg.chart_config?.y2_fieldId)?.name;
            var ggs = (g0, g1, name) => {
                if (!name) return null;
                var d = dg.data.find(g => g[groups[0]] === g0 && g[groups[1]] === g1);
                if (d) return d[name]
                else return 0;
            }
            var option: EChartsOption = {
                title: {
                    text: dg.schemaView?.text,
                    subtext: dg.chart_config?.remark,
                    left: 'center'
                },
                xAxis: {
                    type: 'category',
                    data: xsValues
                },
                yAxis: {
                    type: 'value'
                },
                series: await xs2.asyncMap(async x => {
                    return {
                        name: await mapValue(x, groups[1], dg),
                        type: 'line',
                        data: xs.map(c => {
                            return ggs(c, x, yname);
                        })
                    }
                })
            };
            if (dg.chart_config?.isX) {
                (option as any).xAxis.type = 'value';
                delete (option as any).xAxis.data;
                (option as any).yAxis.type = 'category';
                (option as any).yAxis.data = xsValues;
            }
            switch (dg.chart_type) {
                case 'line':
                    if (dg.chart_config?.isSmooth)
                        lodash.set(option, 'series[0].smooth', true);
                    if (dg.chart_config?.isArea)
                        lodash.set(option, 'series[0].areaStyle', {});
                    break;
                case 'bar':
                    if (Array.isArray(option.series))
                        option.series.forEach(g => {
                            lodash.set(g, 'type', 'bar');
                        })
                    // lodash.set(option, 'series[0].type', 'bar');
                    break;
                case 'pie':
                    option = {
                        title: {
                            text: dg.schemaView?.text,
                            subtext: dg.chart_config?.remark,
                            left: 'center'
                        },
                        tooltip: {
                            trigger: 'item'
                        },
                        legend: {
                            orient: 'vertical',
                            left: 'left'
                        },
                        series: await xs2.asyncMap(async x => {
                            return {
                                name: await mapValue(x, groups[1], dg),
                                type: 'pie',
                                data: xs.map(c => {
                                    return ggs(c, x, yname);
                                }),
                                emphasis: {
                                    itemStyle: {
                                        shadowBlur: 10,
                                        shadowOffsetX: 0,
                                        shadowColor: 'rgba(0, 0, 0, 0.5)'
                                    }
                                }
                            }
                        })
                    };
                    break;
                case 'scatter':
                    option = {
                        title: {
                            text: dg.schemaView?.text,
                            subtext: dg.chart_config?.remark,
                            left: 'center'
                        },
                        legend: {
                            right: '10%',
                            top: '3%',
                            data: xs2Values
                        },
                        grid: {
                            left: '8%',
                            top: '10%'
                        },
                        xAxis: {
                            splitLine: {
                                lineStyle: {
                                    type: 'dashed'
                                }
                            }
                        },
                        yAxis: {
                            splitLine: {
                                lineStyle: {
                                    type: 'dashed'
                                }
                            },
                            scale: true
                        },
                        series: await xs2.asyncMap(async x => {
                            var name: string = await mapValue(x, groups[1], dg) as any;
                            return {
                                name: name,
                                data: await xs.asyncMap(async c => {
                                    return [
                                        ggs(c, x, yname),
                                        ggs(c, x, yname1),
                                        ggs(c, x, yname2),
                                        await mapValue(c, groups[0], dg)
                                    ]
                                }),
                                type: 'scatter',
                                emphasis: {
                                    focus: 'series',
                                    label: {
                                        show: true,
                                        formatter: function (param) {
                                            return param.data[3];
                                        },
                                        position: 'top'
                                    }
                                },
                                itemStyle: {
                                    // shadowBlur: 10,
                                    // shadowColor: 'rgba(120, 36, 50, 0.5)',
                                    // shadowOffsetY: 5,
                                    // color: new echarts.graphic.RadialGradient(0.4, 0.3, 1, [
                                    //     {
                                    //         offset: 0,
                                    //         color: 'rgb(251, 118, 123)'
                                    //     },
                                    //     {
                                    //         offset: 1,
                                    //         color: 'rgb(204, 46, 72)'
                                    //     }
                                    // ])
                                }
                            }
                        })
                    }
                    break;
                case 'radar':
                    //https://echarts.apache.org/examples/zh/editor.html?c=radar
                    break;
                case 'funnel':
                    option = {
                        title: {
                            text: dg.schemaView?.text,
                            subtext: dg.chart_config?.remark,
                            left: 'center'
                        },
                        tooltip: {
                            trigger: 'item',
                            formatter: '{a} <br/>{b} : {c}%'
                        },
                        toolbox: {
                            feature: {
                                dataView: { readOnly: false },
                                restore: {},
                                saveAsImage: {}
                            }
                        },
                        legend: {
                            data: xsValues
                        },
                        series: await xs2.asyncMap(async x => {
                            return {
                                name: await mapValue(x, groups[1], dg),
                                type: 'funnel',
                                left: '10%',
                                top: 60,
                                bottom: 60,
                                width: '80%',
                                min: 0,
                                max: 100,
                                minSize: '0%',
                                maxSize: '100%',
                                sort: 'descending',
                                gap: 2,
                                label: {
                                    show: true,
                                    position: 'inside'
                                },
                                labelLine: {
                                    length: 10,
                                    lineStyle: {
                                        width: 1,
                                        type: 'solid'
                                    }
                                },
                                itemStyle: {
                                    borderColor: '#fff',
                                    borderWidth: 1
                                },
                                emphasis: {
                                    label: {
                                        fontSize: 20
                                    }
                                },
                                data: await xs.asyncMap(async c => {
                                    return {
                                        name: await mapValue(c, groups[0], dg),
                                        value: ggs(c, x, yname)
                                    }
                                })
                            }
                        })
                    }
            }
            dg.myChart.setOption(option);
        }
    }
}

export async function loadGraph(dg: DataGridChart) {
    // var echarts = await loadEchart();
    // await loadDataGridEcharts(dg, echarts);
    var size = 200;
    var page = 1;
    var gs = dg.schema.fields.find(x => x.id == dg.chart_config?.group_fieldId)
    var ds = null;
    if (dg.chart_config?.group_fieldId) {
        ds = (await dg.schema.distinct({ filter: dg.filter, field: gs.name }, dg.page.ws)).data.list;
        ds = await mapValue(ds, dg.chart_config?.group_fieldId, dg);
    }
    var sf = dg.schema.fields.find(x => x.id == dg.chart_config?.graph_fieldId);
    var nodes: { id: string, value: number, name: string, category: number }[] = [];
    var links: { source: string, target: string }[] = []
    var categories: { name: string }[] = (ds ? ds as string[] : [dg.schemaView.text]).map(c => { return { name: c as any } })
    //参考https://echarts.apache.org/examples/data/asset/data/les-miserables.json


    var rgs = await dg.schema.list({
        page,
        size,
        filter: dg.filter,
        projects: ['id', 'title', sf.name, ...(gs ? [gs.name] : [])]
    }, dg.page.ws);
    if (rgs.ok) {
        await rgs.data.list.eachAsync(async g => {
            var ggs;
            if (dg.chart_config?.group_fieldId) {
                ggs = g[gs.name];
                await mapValue(ggs, dg.chart_config?.group_fieldId, dg)
            }
            ggs = util.covertToArray(ggs);
            nodes.push({
                id: g.id,
                name: getPageText({ text: g.title }),
                category: ds ? ds.indexOf(ggs[0]) : 0,
                value: 0
            })
            var ccs = util.covertToArray(g[sf.name]);
            ccs.forEach(cs => {
                links.push({
                    source: g.id,
                    target: cs
                })
            })
        })
    }
    var t = Math.ceil(rgs.data.total / size);
    for (let i = 2; i < t; i++) {
        var rbb = await dg.schema.list({
            page: i,
            size,
            filter: dg.filter,
            projects: ['id', 'title', sf.name, ...(gs ? [gs.name] : [])],
            isIgnoreCount: true
        }, dg.page.ws);
        if (rbb.ok) {
            await rbb.data.list.eachAsync(async g => {
                var ggs;
                if (dg.chart_config?.group_fieldId) {
                    ggs = g[gs.name];
                    await mapValue(ggs, dg.chart_config?.group_fieldId, dg)
                }
                ggs = util.covertToArray(ggs);
                nodes.push({
                    id: g.id,
                    name: getPageText({ text: g.title }),
                    category: ds ? ds.indexOf(ggs[0]) : 0,
                    value: 0
                })
                var ccs = util.covertToArray(g[sf.name]);
                ccs.forEach(cs => {
                    links.push({
                        source: g.id,
                        target: cs
                    })
                })
            })
            console.log(nodes, links)
        }
    }
    nodes.forEach(gn => {
        gn.value = links.filter(g => g.target == gn.id).length;
    })
    dg.graphData = {
        nodes,
        links,
        categories
    }


}