import { FieldType } from "./type";
import {
    CollectionBoardSvg,
    CollectionCalendarSvg,
    CollectionGallerySvg,
    CollectionListSvg,
    EmojiSvg,
    LikeSvg,
    LoveSvg,
    OpposeSvg,
    PicSvg,
    TypesButtonSvg,
    TypesCheckboxSvg,
    TypesEmailSvg,
    TypesFormulaSvg,
    TypesLinkSvg,
    TypesMultipleSelectSvg,
    TypesNumberSvg,
    TypesPhoneSvg,
    TypesSelectSvg,
    TypesStringSvg,
    TypesTitleSvg
} from "../../../component/svgs";
import { MenuItem, MenuItemType } from "../../../component/view/menu/declare";
import { TableSchemaView } from "./meta";
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
import { Field } from "./field";

export function GetFieldTypeSvg(field: Field): IconValueType {
    if (field?.icon) return field.icon;
    var type = field?.type;
    switch (type) {
        case FieldType.bool:
            return TypesCheckboxSvg
        case FieldType.option:
            return TypesSelectSvg
        case FieldType.options:
            return TypesMultipleSelectSvg
        case FieldType.file:
            return { name: 'byte', code: 'link' }
        case FieldType.image:
            return PicSvg
        case FieldType.audio:
            return { name: 'byte', code: 'audio-file' };
        case FieldType.video:
            return { name: 'byte', code: 'video-two' };
        case FieldType.link:
            return TypesLinkSvg
        case FieldType.phone:
            return TypesPhoneSvg
        case FieldType.email:
            return TypesEmailSvg
        case FieldType.date:
            return { name: 'byte', code: 'calendar-dot' }
        case FieldType.user:
            return { name: 'byte', code: 'people' }
        case FieldType.text:
            return TypesStringSvg
        case FieldType.number:
            return TypesNumberSvg;
        case FieldType.formula:
            return TypesFormulaSvg
        case FieldType.createDate:
        case FieldType.modifyDate:
            return { name: 'byte', code: 'time' }
        case FieldType.creater:
            return { name: 'byte', code: 'me' }
        case FieldType.modifyer:
            return { name: 'byte', code: 'me' }
        case FieldType.relation:
            return { name: 'byte', code: 'transform' };
        case FieldType.rollup:
            return { name: 'byte', code: 'find' };
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
            return { name: 'byte', code: 'preview-open' };
        case FieldType.id:
            return { name: 'byte', code: 'adobe-indesign' }
        case FieldType.parentId:
            return { name: 'byte', code: 'arrow-right-up' }
        case FieldType.subs:
            return { name: 'byte', code: 'list-two' }
        case FieldType.thumb:
            return { name: 'byte', code: 'pic-one' }
        default:
            return TypesStringSvg
    }
}

export function getSchemaViewIcon(view: TableSchemaView): IconValueType {
    if (view?.icon) return lodash.cloneDeep(view.icon);
    var url = view?.url;
    if (!url) return { name: 'byte', code: 'table' }
    if (url.indexOf('?') > 0) url = url.substring(0, url.indexOf('?'))
    switch (url) {
        case '/data-grid/table':
            return { name: 'byte', code: 'table' };
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
            return { name: 'byte', code: 'table' }
    }
}
export function getChartViews() {
    var menus = [
        {
            text: lst('折线图'),
            url: '/data-grid/charts?{"chart_type":"line"}',
            remark: '',
            name: 'line',
            image: Line.default,
            icon: { name: 'byte', code: 'chart-line' }
        },
        {
            text: lst('柱状图'),
            url: '/data-grid/charts?{"chart_type":"bar"}',
            remark: 'bar',
            name: 'bar',
            image: BarBackground.default,
            icon: { name: 'byte', code: 'chart-histogram' }
        },
        {
            text: lst('饼图'),
            url: '/data-grid/charts?{"chart_type":"pie"}',
            remark: '',
            name: 'pie',
            icon: { name: 'byte', code: 'chart-pie' },
            image: Pie.default
        },
        {
            text: lst('漏斗图'),
            url: '/data-grid/charts?{"chart_type":"funnel"}',
            remark: '',
            name: 'funnel',
            image: Funnel.default,
            icon: { name: 'byte', code: 'filter' }
        },
        { type: MenuItemType.divide },
        {
            text: lst('散点图'),
            url: '/data-grid/charts?{"chart_type":"scatter"}',
            remark: '',
            name: 'scatter',
            image: Scatter.default,
            icon: { name: 'byte', code: 'chart-scatter' }
        },
        {
            text: lst('雷达图'),
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
            text: lst('关系图'),
            url: '/data-grid/charts?{"chart_type":"graph"}',
            remark: '',
            name: 'graph',
            image: Graph.default,
            icon: { name: 'byte', code: 'circular-connection' }
        },
        { type: MenuItemType.divide },
        {
            text: lst('仪表盘'),
            url: '/data-grid/charts?{"chart_type":"gauge"}',
            remark: '',
            name: 'gauge',
            image: Gauge.default,
            icon: { name: 'byte', code: 'speed-one' }
        },
        {
            text: lst('统计与指标'),
            url: '/data-grid/charts?{"chart_type":"summary"}',
            name: 'summary',
            remark: '',
            image: Summary.default,
            icon: { name: 'byte', code: 'mark' }
        },
        { type: MenuItemType.divide },
        {
            text: lst('字符云'),
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
        { url: '/data-grid/gallery', text: lst('相册') },
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
            { text: lst('电话'), value: FieldType.phone },
            { text: lst('网址'), value: FieldType.link },
        ]),
        { type: MenuItemType.text, text: lst('高级') },
        ...map([
            // { text: '位置', value: FieldType.geolocation },
            { text: lst('关联'), value: FieldType.relation },
            { text: lst('查询引用'), value: FieldType.rollup },
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


export function searchFieldItems(types: FieldType[]) {
    var list: any[] = [];
    function map(arr) {
        return arr.map(a => {
            if (a.value && types.includes(a.value))
                list.push(a);
            return
        })
    }
    getSchemaFieldMenus(map);
    return list;
}

export function getFieldMenus() {
    function map(arr) {
        return arr.map(a => {
            return {
                text: a.text,
                value: a.value,
                name: 'turnFieldType',
                icon: GetFieldTypeSvg({ type: a.value } as any)
            }
        })
    }
    return getSchemaFieldMenus(map);
}


export function getFieldStatItems(type: FieldType) {
    if (!type) return [];
    var items: MenuItem[] = [
        { text: lst('无'), value: 'none' },
        { text: lst('总行数'), value: 'total' },
        { text: lst('统计唯一值数量'), value: 'uniqueValue' },
        { text: lst('未填写'), value: 'notFilled' },
        { text: lst('已填写'), value: 'filled' },
        { text: lst('未填写占比'), value: 'notFilledPercent' },
        { text: lst('已填写占比'), value: 'filledPercent' },
    ];
    if ([FieldType.rollup, FieldType.formula].includes(type)) {
        items = [
            { text: lst('无'), value: 'none' },
            { text: lst('总行数'), value: 'total' }
        ]
    }
    if ([FieldType.bool].includes(type)) {
        items = [
            { text: lst('无'), value: 'none' },
            { text: lst('总行数'), value: 'total' },
            { text: lst('已选中行数'), value: 'checked' },
            { text: lst('未选中行数'), value: 'notChecked' },
            { text: lst('已选中占比'), value: 'checkedPercent' },
            { text: lst('未选中占比'), value: 'notCheckedPercent' },
        ]
    }
    if ([FieldType.date, FieldType.createDate, FieldType.modifyDate].includes(type)) {
        items.push(
            ...[
                { type: MenuItemType.divide },
                { text: lst('最早'), value: 'dateMin' },
                { text: lst('最晚'), value: 'dateMax' },
                { text: lst('日期范围'), value: 'dateRange' },
            ]
        )
    }
    if ([FieldType.number, FieldType.autoIncrement, FieldType.price].includes(type)) {
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

