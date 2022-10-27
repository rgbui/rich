import { PageLayoutType } from "../../../src/page/declare";
import { Field } from "../schema/field";
import { TableSchema } from "../schema/meta";
import { FieldType } from "../schema/type";

export function SchemaCreatePageFormData(schema: TableSchema) {
    var cs: Record<string, any>[] = schema.initUserFields.toArray(field => {
        var r = GetFieldFormBlockInfo(field);
        if (r) return r;
    })
    return {
        url: '/page',
        pageLayout: { type: PageLayoutType.dbForm },
        views: [
            {
                url: '/view',
                blocks: {
                    childs: cs
                }
            }
        ]
    }
}

export function GetFieldFormBlockInfo(field: Field) {
    switch (field.type) {
        case FieldType.text:
        case FieldType.title:
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
    }
}

