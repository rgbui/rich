import { FieldType } from "./type";
import {
    AudioSvg,
    CollectionBoardSvg,
    CollectionCalendarSvg,
    CollectionGallerySvg,
    CollectionListSvg,
    CollectTableSvg,
    CommentSvg,
    EmojiSvg,
    EyeSvg,
    LikeSvg,
    LoveSvg,
    OpposeSvg,
    PicSvg,
    RowNoSvg,
    TypesButtonSvg,
    TypesCheckboxSvg,
    TypesCreateAtSvg,
    TypesCreateBySvg,
    TypesDateSvg,
    TypesEmailSvg,
    TypesFileSvg,
    TypesFormulaSvg,
    TypesLinkSvg,
    TypesMultipleSelectSvg,
    TypesNumberSvg,
    TypesPersonSvg,
    TypesPhoneSvg,
    TypesRelationSvg,
    TypesRollupSvg,
    TypesSelectSvg,
    TypesStringSvg,
    TypesTitleSvg,
    VideoSvg
} from "../../../component/svgs";
import { MenuItemType } from "../../../component/view/menu/declare";
import { TableSchema, TableSchemaView } from "./meta";
import { Field } from "./field";
import dayjs from "dayjs";
import lodash from "lodash";
import { lst } from "../../../i18n/store";
import { IconValueType } from "../../../component/view/icon";
import * as BarBackground from "../../../src/assert/img/bar-background.webp";
import * as Line from "../../../src/assert/img/line-simple.webp";
import * as Pie from "../../../src/assert/img/pie-simple.webp";
import * as Scatter from "../../../src/assert/img/scatter-simple.webp";
import * as Graph from "../../../src/assert/img/graph-label-overlap.webp";
import * as Funnel from "../../../src/assert/img/funnel.webp";
import * as Gauge from "../../../src/assert/img/gauge.webp";
import * as WordCloud from "../../../src/assert/img/word-cloud.png";
import * as Radar from "../../../src/assert/img/radar.webp";
import * as Summary from "../../../src/assert/img/summary.png";

export function GetFieldTypeSvg(type: FieldType): IconValueType {
    switch (type) {
        case FieldType.bool:
            return TypesCheckboxSvg
        case FieldType.option:
            return TypesSelectSvg
        case FieldType.options:
            return TypesMultipleSelectSvg
        case FieldType.file:
            return TypesFileSvg
        case FieldType.image:
            return PicSvg
        case FieldType.audio:
            return AudioSvg;
        case FieldType.video:
            return VideoSvg;
        case FieldType.link:
            return TypesLinkSvg
        case FieldType.phone:
            return TypesPhoneSvg
        case FieldType.email:
            return TypesEmailSvg
        case FieldType.date:
            return TypesDateSvg
        case FieldType.user:
            return TypesPersonSvg
        case FieldType.text:
            return TypesStringSvg
        case FieldType.number:
            return TypesNumberSvg;
        case FieldType.formula:
            return TypesFormulaSvg
        case FieldType.createDate:
        case FieldType.modifyDate:
            return TypesCreateAtSvg
        case FieldType.creater:
            return { name: 'byte', code: 'people' }
        case FieldType.modifyer:
            return { name: 'byte', code: 'edit-name' }
        case FieldType.relation:
            return TypesRelationSvg;
        case FieldType.rollup:
            return TypesRollupSvg;
        case FieldType.comment:
            return { name: 'byte', code: 'message' };
        case FieldType.button:
            return TypesButtonSvg;
        case FieldType.emoji:
            return EmojiSvg
        case FieldType.love:
            return LoveSvg
        case FieldType.like:
            return LikeSvg
        case FieldType.oppose:
            return OpposeSvg
        case FieldType.vote:
            return { name: 'byte', code: 'ticket-one' }
        case FieldType.autoIncrement:
            return { name: "byte", code: 'ordered-list' }
        case FieldType.title:
            return TypesTitleSvg
        case FieldType.browse:
            return EyeSvg;
        case FieldType.id:
            return { name: 'byte', code: 'adobe-indesign' }
        case FieldType.parentId:
            return { name: 'byte', code: 'arrow-right-up' }
        case FieldType.subs:
            return { name: 'byte', code: 'list-two' }
        default:
            return TypesStringSvg
    }
}

export function getSchemaViewIcon(view: TableSchemaView): IconValueType {
    if (view?.icon) return view.icon;

    var url = view?.url;
    if (!url) return CollectTableSvg
    if (url.indexOf('?') > 0) url = url.substring(0, url.indexOf('?'))
    switch (url) {
        case '/data-grid/table':
            return CollectTableSvg
        case '/data-grid/board':
            return CollectionBoardSvg
        case '/data-grid/gallery':
            return CollectionGallerySvg
        case '/data-grid/list':
            return CollectionListSvg
        case '/data-grid/calendar':
            return CollectionCalendarSvg
        case '/data-grid/charts':
        case '/data-grid/statistic/value':
            return { name: 'bytedance-icon', code: 'chart-pie-one' }
        default:
            return CollectTableSvg
    }
}

export function getChartViews() {
    var menus = [
        {
            title: lst('折线图'),
            url: '/data-grid/charts?{"chart_type":"line"}',
            remark: '',
            name: 'line',
            image: Line.default,
            icon: { name: 'byte', code: 'chart-line' }
        },
        {
            title: lst('柱状图'),
            url: '/data-grid/charts?{"chart_type":"bar"}',
            remark: 'bar',
            name: 'bar',
            image: BarBackground.default,
            icon: { name: 'byte', code: 'chart-histogram' }
        },
        {
            title: lst('饼图'),
            url: '/data-grid/charts?{"chart_type":"pie"}',
            remark: '',
            name: 'pie',
            icon: { name: 'byte', code: 'chart-pie' },
            image: Pie.default
        },
        {
            title: lst('漏斗图'),
            url: '/data-grid/charts?{"chart_type":"funnel"}',
            remark: '',
            name: 'funnel',
            image: Funnel.default,
            icon: { name: 'byte', code: 'filter' }
        },
        { type: MenuItemType.divide },
        {
            title: lst('散点图'),
            url: '/data-grid/charts?{"chart_type":"scatter"}',
            remark: '',
            name: 'scatter',
            image: Scatter.default,
            icon: { name: 'byte', code: 'chart-scatter' }
        },
        {
            title: lst('雷达图'),
            url: '/data-grid/charts?{"chart_type":"radar"}',
            remark: '',
            name: 'radar',
            image: Radar.default,
            icon: { name: 'byte', code: 'radar-chart' }
        },
        // { type: MenuItemType.divide },
        // {
        //     title: lst('日历热力图'),
        //     url: '/data-grid/charts?{"chart_type":"calendarHeatmap"}',
        //     name: 'calendarHeatmap',
        //     remark: '',
        //     image: Summary.default,
        //     icon:{name:'byte',code:'calendar-dot'}
        // },
        { type: MenuItemType.divide },
        {
            title: lst('关系图'),
            url: '/data-grid/charts?{"chart_type":"graph"}',
            remark: '',
            name: 'graph',
            image: Graph.default,
            icon: { name: 'byte', code: 'circular-connection' }
        },
        { type: MenuItemType.divide },
        {
            title: lst('仪表盘'),
            url: '/data-grid/charts?{"chart_type":"gauge"}',
            remark: '',
            name: 'gauge',
            image: Gauge.default,
            icon: { name: 'byte', code: 'speed-one' }
        },
        {
            title: lst('统计与指标'),
            url: '/data-grid/charts?{"chart_type":"summary"}',
            name: 'summary',
            remark: '',
            image: Summary.default,
            icon: { name: 'byte', code: 'mark' }
        },
        { type: MenuItemType.divide },
        {
            title: lst('字符云'),
            url: '/data-grid/charts?{"chart_type":"wordCloud"}',
            name: 'wordCloud',
            remark: '',
            image: WordCloud.default,
            icon: { name: 'byte', code: 'cloudy' }
        }

    ]
    return menus;
}

/**
 * 
 * @returns 
 */
export function getSchemaViews() {
    return [
        { url: '/data-grid/table', text: lst('表格') },
        { url: '/data-grid/gallery', text: lst('卡片') },
        { url: '/data-grid/board', text: lst('看板') },
        { url: '/data-grid/list', text: lst('列表') },
        { url: '/data-grid/calendar', text: lst('日历') }
    ]
}

export function getSchemaFieldMenus(map: (list: any) => any) {
    var menus = [
        {
            type: MenuItemType.text,
            text: lst('基础')
        },
        ...map([
            { text: lst('文本'), value: FieldType.text },
            { text: lst('数字'), value: FieldType.number },
            //{ text: '价钱', value: FieldType.price },
            { text: lst('单选'), value: FieldType.option },
            { text: lst('多选'), value: FieldType.options },
            { text: lst('勾选'), value: FieldType.bool },
            { text: lst('日期'), value: FieldType.date },
            { text: lst('图像'), value: FieldType.image },
            { text: lst('音频'), value: FieldType.audio },
            { text: lst('视频'), value: FieldType.video },
            { text: lst('文件'), value: FieldType.file },
            { text: lst('用户'), value: FieldType.user },
            { text: lst('邮箱'), value: FieldType.email },
            { text: lst('手机号'), value: FieldType.phone },
            { text: lst('网址'), value: FieldType.link },
        ]),
        { type: MenuItemType.text, text: lst('高级') },
        ...map([
            // { text: '位置', value: FieldType.geolocation },
            { text: lst('关联'), value: FieldType.relation },
            { text: lst('统计'), value: FieldType.rollup },
            { text: lst('公式'), value: FieldType.formula },
        ]),
        { type: MenuItemType.text, text: lst('交互') },
        ...map([
            { text: lst('喜欢'), value: FieldType.love },
            { text: lst('点赞'), value: FieldType.like },
            // { text: lst('反对'), value: FieldType.oppose },

            { text: lst('表情'), value: FieldType.emoji },
            { text: lst('评论'), value: FieldType.comment },
            // { text: '操作按钮', value: FieldType.button }
            { text: '浏览', value: FieldType.browse },
            { text: '投票', value: FieldType.vote }
        ]),
        { type: MenuItemType.text, text: lst('默认') },
        ...map([
            { text: lst('自动编号'), value: FieldType.autoIncrement },
            { text: lst('创建人'), value: FieldType.creater },
            { text: lst('创建时间'), value: FieldType.createDate },
            { text: lst('修改人'), value: FieldType.modifyer },
            { text: lst('修改时间'), value: FieldType.modifyDate },
        ])
    ];
    return menus;
}

export function getFieldMenus() {
    function map(arr) {
        return arr.map(a => {
            return {
                text: a.text,
                value: a.value,
                name: 'turnFieldType',
                icon: GetFieldTypeSvg(a.value)
            }
        })
    }
    return getSchemaFieldMenus(map);
}

export function cacFormulaValue(schema: TableSchema, field: Field, row: Record<string, any>) {
    try {
        if (field?.config?.formula?.jsCode) {
            var registerFns = {
                replaceAll(str, oldStr, newStr) {
                    var reg = new RegExp(oldStr, 'g');
                    return str.replace(reg, newStr)
                },
                toNumber(str, def) {
                    var g = parseFloat(str);
                    if (isNaN(g)) {
                        if (typeof def == 'number') return def;
                    }
                    return g;
                },
                toInt(str, def) {
                    var g = parseInt(str);
                    if (isNaN(g)) {
                        if (typeof def == 'number') return def;
                    }
                    return g;
                },
                toDate(str, format, def) {
                    var g = dayjs(str, format);
                    if (g.isValid) {
                        return g.toDate()
                    }
                    if (def instanceof Date) return def;
                    else if (typeof def == 'string') return dayjs(def).toDate()
                },
                toDateFormat(date, format) {
                    return dayjs(date).format(format)
                },
                dateAdd(d, num, unit) {
                    return dayjs(d).add(num, unit).toDate()
                }
            };
            var funCode = `function(row,fns){ 
${schema.fields.map(r => { return `var ${r.name}=row.${r.name};` }).join("\n")}
${Object.keys(registerFns).map(g => { return `var ${g}=fns.${g};` }).join("\n")}
return ${field.config.formula.jsCode}
                }`
            var fx = eval('(' + funCode + ')');
            var result = fx.apply(row, [row, registerFns])
            if (typeof result == 'undefined') result = ''
            else if (lodash.isNull(result)) result = ''
            else if (lodash.isNaN(result)) result = ''
            if (typeof result != 'string') result = result.toString();
            return result;
        }
    }
    catch (ex) {
        console.error(ex);
        return '';
    }
}

