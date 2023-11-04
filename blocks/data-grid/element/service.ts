
import { Field } from "../schema/field";
import { FieldType } from "../schema/type";

export function GetFieldFormBlockInfo(field: Field)
{
    switch (field.type)
    {
        case FieldType.text:
        case FieldType.title:
        case FieldType.email:
        case FieldType.phone:
        case FieldType.link:
            return {
                url: '/form/text',
                fieldId: field.id
            }
            break;
        case FieldType.bool:
            return {
                url: '/form/check',
                fieldId: field.id
            }
        case FieldType.date:
            return {
                url: '/form/date',
                fieldId: field.id
            }
        case FieldType.number:
            return {
                url: '/form/number',
                fieldId: field.id
            }
            break;
        case FieldType.option:
            return {
                url: '/form/option',
                fieldId: field.id
            }
            break;
        case FieldType.image:
            return {
                url: '/form/image',
                fieldId: field.id
            }
            break;
        case FieldType.audio:
        case FieldType.file:
        case FieldType.video:
            return {
                url: '/form/file',
                fieldId: field.id
            }
            break;
        case FieldType.relation:
            return {
                url: '/form/relation',
                fieldId: field.id
            }
            break;
        case FieldType.user:
            return {
                url: '/form/user',
                fieldId: field.id
            }
            break;
        case FieldType.rich:
            return {
                url: '/form/rich',
                fieldId: field.id
            }
        case FieldType.emoji:
        case FieldType.like:
        case FieldType.love:
        case FieldType.oppose:
            return {
                url: '/form/emoji',
                fieldId: field.id
            }
    }
}

