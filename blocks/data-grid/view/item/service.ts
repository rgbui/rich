import { Block } from "../../../../src/block";
import { BlockFactory } from "../../../../src/block/factory/block.factory";
import { FieldType } from "../../schema/type";
import { ViewField } from "../../schema/view";
export async function createFieldBlock(viewField: ViewField, data: { row: Record<string, any>, index: number }, block: Block) {
    var cellContent: Block;
    var row = data.row;
    var field = viewField.field;
    var page = block.page;
    if (viewField.type == 'check') {
        cellContent = await BlockFactory.createBlock('/field/row/check', page, {
            viewField
        }, block);
    }
    else if (viewField.type == 'rowNum') {
        cellContent = await BlockFactory.createBlock('/field/row/num', page, {
            viewField
        }, block);
    }
    else if (field) {
        switch (field.type) {
            case FieldType.text:
                cellContent = await BlockFactory.createBlock('/field/text', page, {
                    value: viewField.getValue(row),
                    viewField
                }, block);
                break;
            case FieldType.autoIncrement:
            case FieldType.number:
                cellContent = await BlockFactory.createBlock('/field/number', page, {
                    value: viewField.getValue(row),
                    viewField
                }, block);
                break;
            case FieldType.modifyDate:
            case FieldType.createDate:
            case FieldType.date:
                cellContent = await BlockFactory.createBlock('/field/date', page, {
                    value: viewField.getValue(row),
                    viewField
                }, block);
                break;
            case FieldType.option:
                cellContent = await BlockFactory.createBlock('/field/option', page, {
                    value: viewField.getValue(row),
                    viewField
                }, block);
                break;
            case FieldType.creater:
            case FieldType.modifyer:
                cellContent = await BlockFactory.createBlock('/field/user', page, {
                    viewField,
                    value: viewField.getValue(row),
                }, block);
                break;
            case FieldType.bool:
                cellContent = await BlockFactory.createBlock('/field/check', page, {
                    viewField,
                    value: viewField.getValue(row),
                }, block);
                break;
            case FieldType.emoji:
                cellContent = await BlockFactory.createBlock('/field/emoji', page, {
                    viewField,
                    value: viewField.getValue(row),
                }, block);
                break;
            case FieldType.relation:
                cellContent = await BlockFactory.createBlock('/field/relation', page, {
                    viewField,
                    value: viewField.getValue(row),
                }, block);
                break;
            case FieldType.file:
                cellContent = await BlockFactory.createBlock('/field/file', page, {
                    viewField,
                    value: viewField.getValue(row),
                }, block);
                break;
            case FieldType.image:
                cellContent = await BlockFactory.createBlock('/field/image', page, {
                    viewField,
                    value: viewField.getValue(row),
                }, block);
                break;
            case FieldType.comment:
                cellContent = await BlockFactory.createBlock('/field/comment', page, {
                    viewField,
                    value: viewField.getValue(row),
                }, block);
                break;
        }
    }
    return cellContent;
}