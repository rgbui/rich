import { FieldType } from "../../../blocks/data-grid/schema/type";
import { TableSchema } from "../../../blocks/data-grid/schema/meta";
import { PageLayoutType } from "../../../src/layout/declare";
import { Page } from "../../../src/page";
import { PageDirective } from "../../../src/page/directive";
export function schemaCreatePageFormData(schema: TableSchema, row?: Record<string, any>) {
    var cs: Record<string, any>[] = schema.fields.toArray(field => {
        switch (field.type) {
            case FieldType.text:
            case FieldType.title:
                return {
                    url: '/form/text',
                    value: row ? row[field.name] : undefined,
                    fieldId: field.id,
                    field
                }
                break;
            case FieldType.bool:
                return {
                    url: '/form/check',
                    value: row ? row[field.name] : undefined,
                    fieldId: field.id,
                    field
                }
            case FieldType.date:
                return {
                    url: '/form/date',
                    value: row ? row[field.name] : undefined,
                    fieldId: field.id,
                    field
                }
            case FieldType.number:
                return {
                    url: '/form/number',
                    value: row ? row[field.name] : undefined,
                    fieldId: field.id,
                    field
                }
                break;
            case FieldType.option:
                return {
                    url: '/form/option',
                    value: row ? row[field.name] : undefined,
                    fieldId: field.id,
                    field
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
export async function createFormPage(el: HTMLElement,
    options: { schema: TableSchema, row?: Record<string, any> }) {
    var page = new Page();
    page.on(PageDirective.blur, function (ev) {
        // console.log('blur', ev)
    });
    page.on(PageDirective.focus, function (ev) {
        //console.log('focus', ev);
    });
    page.on(PageDirective.focusAnchor, function (anchor) {
        // console.log('focusAnchor', anchor);
    });
    page.on(PageDirective.history, async function (action) {
        // await item.store.saveHistory(action);
        // await item.store.savePageContent(action, await page.getFile());
    });
    var pageData = schemaCreatePageFormData(options.schema, options.row);
    await page.load(pageData);
    var bound = el.getBoundingClientRect();
    page.render(el, { width: bound.width, height: bound.height });
    return page;
}
