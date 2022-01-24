import { FieldType } from "../../../blocks/table-store/schema/type";

export var TableFieldTypes: { text: string, value: any }[] = [
    { text: '单行文本', value: FieldType.text },
    { text: '多行文本', value: FieldType.textarea },
    { text: '数字', value: FieldType.number },
    { text: '单选', value: FieldType.option },
    { text: '多选', value: FieldType.options },
    { text: '勾选', value: FieldType.bool },
    { text: '日期', value: FieldType.date },
    { text: '关联', value: FieldType.relation },
    { text: '统计', value: FieldType.rollup },
    { text: '公式', value: FieldType.formula },
];