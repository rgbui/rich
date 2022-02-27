import { PageLayoutType } from "../../../src/layout/declare";
import { TableSchema } from "../schema/meta";
import { FieldType } from "../schema/type";

export function schemaCreatePageFormData(schema: TableSchema) {
    var cs: Record<string, any>[] = schema.fields.toArray(field => {
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