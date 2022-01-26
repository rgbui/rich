import { Block } from "../../../../src/block";
import { BlockFactory } from "../../../../src/block/factory/block.factory";
import { FieldType } from "../../schema/type";
import { ViewField } from "../../schema/view";
export async function createFieldBlock(viewField: ViewField, row: Record<string, any>, block: Block) {
    var cellContent: Block;
    var field = viewField.field;
    var page = block.page;
    switch (field.type) {
        case FieldType.text:
            cellContent = await BlockFactory.createBlock('/field/text', page, {
                value: viewField.getValue(row),
                viewField
            }, this);
            break;
        case FieldType.autoIncrement:
        case FieldType.number:
            cellContent = await BlockFactory.createBlock('/field/number', page, {
                value: viewField.getValue(row),
                viewField
            }, this);
            break;
        case FieldType.modifyDate:
        case FieldType.createDate:
        case FieldType.date:
            cellContent = await BlockFactory.createBlock('/field/date', page, {
                value: viewField.getValue(row),
                viewField
            }, this);
            break;
        case FieldType.option:
            cellContent = await BlockFactory.createBlock('/field/option', page, {
                value: viewField.getValue(row),
                viewField
            }, this);
            break;
        case FieldType.creater:
        case FieldType.modifyer:
            cellContent = await BlockFactory.createBlock('/field/user', page, {
                viewField,
                value: viewField.getValue(row),
            }, this);
            break;
        case FieldType.bool:
            cellContent = await BlockFactory.createBlock('/field/check', page, {
                viewField,
                value: viewField.getValue(row),
            }, this);
            break;

    }
    return cellContent;
}