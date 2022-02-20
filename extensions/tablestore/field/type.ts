import { FieldType } from "../../../blocks/data-grid/schema/type";

export var TableFieldTypes: { text: string, value: any }[] = [
    { text: '单行文本', value: FieldType.text },
    { text: '多行文本', value: FieldType.textarea },
    { text: '数字', value: FieldType.number },
    { text: '单选', value: FieldType.option },
    { text: '多选', value: FieldType.options },
    { text: '勾选', value: FieldType.bool },
    { text: '日期', value: FieldType.date },
    { text: '图像', value: FieldType.image },
    { text: '文件', value: FieldType.file },


    { text: '用户', value: FieldType.user },
    { text: '邮箱', value: FieldType.email },
    { text: '手机号', value: FieldType.phone },
    { text: '网址', value: FieldType.link },


    { text: '关联', value: FieldType.relation },
    { text: '统计', value: FieldType.rollup },
    { text: '公式', value: FieldType.formula },

    /**
     * 互动
     */


    { text: '自动编号', value: FieldType.autoIncrement },
    { text: '操作按钮', value: FieldType.button },
    { text: '创建人', value: FieldType.creater },
    { text: '创建时间', value: FieldType.createDate },
    { text: '修改人', value: FieldType.modifyer },
    { text: '修改时间', value: FieldType.modifyDate },
];