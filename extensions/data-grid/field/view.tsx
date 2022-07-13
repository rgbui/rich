import { FieldType } from "../../../blocks/data-grid/schema/type";
import { getTypeSvg } from "../../../blocks/data-grid/schema/util";
import { MenuItemType } from "../../../component/view/menu/declare";
export function getMenus() {
    function map(arr) {
        return arr.map(a => {
            return {
                text: a.text,
                value: a.value,
                icon: getTypeSvg(a.value)
            }
        })
    }
    var menus = [
        { type: MenuItemType.text, text: '基础' },
        ...map([
            { text: '文本', value: FieldType.text },
            // { text: '多行文本', value: FieldType.textarea },
            { text: '数字', value: FieldType.number },
            // { text: '价钱', value: FieldType.price },
            { text: '单选', value: FieldType.option },
            { text: '多选', value: FieldType.options },
            { text: '勾选', value: FieldType.bool },
            { text: '日期', value: FieldType.date },
            { text: '图像', value: FieldType.image },
            // { text: '音频', value: FieldType.audio },
            { text: '视频', value: FieldType.video },
            { text: '文件', value: FieldType.file },
            { text: '用户', value: FieldType.user },
            { text: '邮箱', value: FieldType.email },
            { text: '手机号', value: FieldType.phone },
            { text: '网址', value: FieldType.link },
            // { text: '位置', value: FieldType.geolocation },
            { text: '关联', value: FieldType.relation },
            { text: '统计', value: FieldType.rollup },
            { text: '公式', value: FieldType.formula }
        ]),
        // { type: MenuItemType.text, text: '交互' },
        ...map([
            // { text: '反应', value: FieldType.emoji },
            // { text: '评论', value: FieldType.comment },
            // { text: '收藏', value: FieldType.favourite },
            // { text: '分享', value: FieldType.share },
            // { text: '打赏', value: FieldType.donate },
            // { text: '购买', value: FieldType.buy },
            // { text: '浏览访问', value: FieldType.browse },
        ]),
        // { type: MenuItemType.text, text: '高级' },
        // ...map([
        //{ text: '自动编号', value: FieldType.autoIncrement },
        //{ text: '操作按钮', value: FieldType.button },
        //{ text: '置顶', value: FieldType.top },
        // { text: '创建人', value: FieldType.creater },
        // { text: '创建时间', value: FieldType.createDate },
        // { text: '修改人', value: FieldType.modifyer },
        // { text: '修改时间', value: FieldType.modifyDate },
        // { text: '修改情况', value: FieldType.modifyDate },
        // ])
    ];
    return menus;
}


