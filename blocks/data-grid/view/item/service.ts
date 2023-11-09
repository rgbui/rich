import { TableStoreItem } from ".";
import { Block } from "../../../../src/block";
import { BlockFactory } from "../../../../src/block/factory/block.factory";
import { DataGridItemRecord } from "./record";
import { FieldType } from "../../schema/type";
import { ViewField } from "../../schema/view";
export async function createFieldBlock(viewField: ViewField, block: TableStoreItem | DataGridItemRecord) {
    var cellContent: Block;
    var row = block.dataRow;
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
            case FieldType.title:
                cellContent = await BlockFactory.createBlock('/field/title', page, {
                    value: viewField.getValue(row),
                    viewField
                }, block);
                break;
            case FieldType.text:
                cellContent = await BlockFactory.createBlock('/field/text', page, {
                    value: viewField.getValue(row),
                    viewField
                }, block);
                break;
            case FieldType.rich:
                cellContent = await BlockFactory.createBlock('/field/rich', page, {
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
            case FieldType.options:
            case FieldType.option:
                cellContent = await BlockFactory.createBlock('/field/option', page, {
                    value: viewField.getValue(row),
                    viewField
                }, block);
                break;
            case FieldType.user:
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
            case FieldType.vote:
            case FieldType.report:
            case FieldType.oppose:
            case FieldType.like:
            case FieldType.love:
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
            case FieldType.audio:
                cellContent = await BlockFactory.createBlock('/field/audio', page, {
                    viewField,
                    value: viewField.getValue(row),
                }, block);
                break;
            case FieldType.video:
                cellContent = await BlockFactory.createBlock('/field/video', page, {
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
            case FieldType.email:
                cellContent = await BlockFactory.createBlock('/field/email', page, {
                    viewField,
                    value: viewField.getValue(row),
                }, block);
                break;
            case FieldType.phone:
                cellContent = await BlockFactory.createBlock('/field/phone', page, {
                    viewField,
                    value: viewField.getValue(row),
                }, block);
                break;
            case FieldType.blog:
                cellContent = await BlockFactory.createBlock('/field/blog', page, {
                    viewField,
                    value: viewField.getValue(row),
                }, block);
                break;
            case FieldType.link:
                cellContent = await BlockFactory.createBlock('/field/url', page, {
                    viewField,
                    value: viewField.getValue(row),
                }, block);
                break;
            case FieldType.formula:
                cellContent = await BlockFactory.createBlock('/field/formula', page, {
                    viewField,
                    //value: viewField.getValue(row),
                }, block);
                break;
            case FieldType.button:
                cellContent = await BlockFactory.createBlock('/field/button', page, {
                    viewField,
                    value: viewField.getValue(row),
                }, block);
                break;
            case FieldType.rollup:
                cellContent = await BlockFactory.createBlock('/field/rollup', page, {
                    viewField,
                    value: viewField.getValue(row),
                }, block);
                break;
            case FieldType.browse:
                cellContent = await BlockFactory.createBlock('/field/browse', page, {
                    viewField,
                    value: viewField.getValue(row),
                }, block);
                break;
        }
    }
    return cellContent;
}

export interface CardConfig {
    auto: boolean,
    showCover: boolean,
    coverFieldId: string,
    coverAuto: boolean,
    showField: 'none' | 'nowrap' | 'wrap',
    showMode: 'default' | 'define',
    templateProps: {
        url?: string,
        props?: {
            name: string,
            visible: boolean,
            /**
             * 弃用
             */
            bindFieldId?: string,
            /**
             * 以这个为准
             */
            bindFieldIds?:string[]
        }[]
    }
}