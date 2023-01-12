import { FieldType } from "./type";
import {
    AudioSvg,
    BlogSvg,
    CollectionBoardSvg,
    CollectionCalendarSvg,
    CollectionGallerySvg,
    CollectionListSvg,
    CollectTableSvg,
    CommentSvg,
    EmojiSvg,
    FlagSvg,
    LikeSvg,
    LoveSvg,
    OpposeSvg,
    PictureSvg,
    ReportSvg,
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

export function GetFieldTypeSvg(type: FieldType) {
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
            return PictureSvg
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
        case FieldType.modifyer:
            return TypesCreateBySvg
        case FieldType.relation:
            return TypesRelationSvg;
        case FieldType.rollup:
            return TypesRollupSvg;
        case FieldType.comment:
            return CommentSvg;
        case FieldType.button:
            return TypesButtonSvg;
        case FieldType.emoji:
            return EmojiSvg
        case FieldType.love:
            return LoveSvg
        case FieldType.like:
            return LikeSvg
        case FieldType.vote:
            return FlagSvg
        case FieldType.oppose:
            return OpposeSvg
        case FieldType.report:
            return ReportSvg
        case FieldType.blog:
        case FieldType.rich:
            return BlogSvg;
        case FieldType.autoIncrement:
            return RowNoSvg
        case FieldType.title:
            return TypesTitleSvg
        default:
            return TypesStringSvg
    }
}

export function getSchemaViewIcon(url: string) {
    switch (url) {
        case '/data-grid/table':
            return CollectTableSvg
            break;
        case '/data-grid/board':
            return CollectionBoardSvg
            break;
        case '/data-grid/gallery':
            return CollectionGallerySvg
            break;
        case '/data-grid/list':
            return CollectionListSvg
            break;
        case '/data-grid/calendar':
            return CollectionCalendarSvg
            break;
    }
}

export function getSchemaViews() {
    return [
        { url: '/data-grid/table', text: '表格' },
        { url: '/data-grid/gallery', text: '卡片' },
        { url: '/data-grid/board', text: '看板' },
        { url: '/data-grid/list', text: '列表' },
        { url: '/data-grid/calendar', text: '日历' }
    ]
}

export function getSchemaFieldMenus(map: (list: any) => any) {
    var menus = [
        {
            type: MenuItemType.text,
            text: '基础'
        },
        ...map([
            { text: '文本', value: FieldType.text },
            //{ text: '多行文本', value: FieldType.textarea },
            { text: '数字', value: FieldType.number },
            //{ text: '价钱', value: FieldType.price },
            { text: '单选', value: FieldType.option },
            { text: '多选', value: FieldType.options },
            { text: '勾选', value: FieldType.bool },
            { text: '日期', value: FieldType.date },
            { text: '图像', value: FieldType.image },
            { text: '音频', value: FieldType.audio },
            { text: '视频', value: FieldType.video },
            { text: '文件', value: FieldType.file },
            { text: '用户', value: FieldType.user },
            { text: '邮箱', value: FieldType.email },
            { text: '手机号', value: FieldType.phone },
            { text: '网址', value: FieldType.link },
            { text: '富文本', value: FieldType.rich },
            // { text: '位置', value: FieldType.geolocation },
            { text: '关联', value: FieldType.relation },
            { text: '统计', value: FieldType.rollup },
            { text: '公式', value: FieldType.formula },
            { text: '自动编号', value: FieldType.autoIncrement },
            { text: '文档', value: FieldType.blog },
        ]),
        { type: MenuItemType.text, text: '交互' },
        ...map([
            { text: '喜欢', value: FieldType.love },
            { text: '点赞', value: FieldType.like },
            { text: '反对', value: FieldType.oppose },
            // { text: '投票', value: FieldType.vote },
            { text: '表情', value: FieldType.emoji },
            { text: '评论', value: FieldType.comment },
            //{ text: '举报', value: FieldType.report },
            { text: '操作按钮', value: FieldType.button },
            // { text: '收藏', value: FieldType.favourite },
            // { text: '分享', value: FieldType.share },
            // { text: '打赏', value: FieldType.donate },
            // { text: '购买', value: FieldType.buy },
            // { text: '置顶', value: FieldType.top },
            // { text: '浏览', value: FieldType.browse },
        ]),
        { type: MenuItemType.text, text: '原始' },
        ...map([
            { text: '创建人', value: FieldType.creater },
            { text: '创建时间', value: FieldType.createDate },
            { text: '修改人', value: FieldType.modifyer },
            { text: '修改时间', value: FieldType.modifyDate },
            // { text: '修改情况', value: FieldType.modifyDynamic },
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