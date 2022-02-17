import { FieldType } from "../../../blocks/data-grid/schema/type";
import { TableSchema } from "../../../blocks/data-grid/schema/meta";
import { PageLayoutType } from "../../../src/layout/declare";
import { Page } from "../../../src/page";
import { PageDirective } from "../../../src/page/directive";
import { channel } from "../../../net/channel";
export function schemaCreatePageFormData(schema: TableSchema, row?: Record<string, any>) {
    var cs: Record<string, any>[] = schema.fields.toArray(field => {
        switch (field.type) {
            case FieldType.text:
            case FieldType.title:
                return {
                    url: '/form/text',
                    value: row ? row[field.name] : undefined,
                    fieldId: field.id
                }
                break;
            case FieldType.bool:
                return {
                    url: '/form/check',
                    value: row ? row[field.name] : undefined,
                    fieldId: field.id
                }
            case FieldType.date:
                return {
                    url: '/form/date',
                    value: row ? row[field.name] : undefined,
                    fieldId: field.id
                }
            case FieldType.number:
                return {
                    url: '/form/number',
                    value: row ? row[field.name] : undefined,
                    fieldId: field.id
                }
                break;
            case FieldType.option:
                return {
                    url: '/form/option',
                    value: row ? row[field.name] : undefined,
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

export async function createFormPage(el: HTMLElement,
    options: {
        schema: TableSchema,
        recordViewId: string,
        row?: Record<string, any>
    }) {
    var page = new Page();
    page.schema = options.schema;
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
        var syncBlocks = action.syncBlock();
        if (syncBlocks.length > 0) {
            syncBlocks.eachAsync(async (block) => {
                var r = await channel.act('/page/view/operator', {
                    syncBlockId: block.syncBlockId,
                    operate: action.get()
                });
                await channel.act('/page/view/snap', {
                    syncBlockId: block.syncBlockId,
                    seq: r.seq,
                    content: await block.getString()
                });
            })
        }
        else {
            var r = await channel.act('/page/view/operator', {
                syncBlockId: options.recordViewId,
                operate: action.get()
            });
            await channel.act('/page/view/snap', {
                syncBlockId: options.recordViewId,
                seq: r.seq,
                content: await page.getString()
            });
        }
    });
    var pageData: Record<string, any>;
    var r = await channel.get('/page/sync/block', { syncBlockId: options.recordViewId });
    if (r.ok && r.data.content) {
        pageData = r.data.content as any;
        if (typeof pageData == 'string') pageData = JSON.parse(pageData);
    }
    if (!pageData) pageData = schemaCreatePageFormData(options.schema, options.row);
    await page.load(pageData);
    var bound = el.getBoundingClientRect();
    page.render(el, { width: bound.width, height: bound.height });
    return page;
}
