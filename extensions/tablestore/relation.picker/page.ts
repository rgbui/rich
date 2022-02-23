import { TableSchema } from "../../../blocks/data-grid/schema/meta";
import { PageLayoutType } from "../../../src/layout/declare";
import { Page } from "../../../src/page";
import { PageDirective } from "../../../src/page/directive";
export function schemaCreatePageFormData(schema: TableSchema, ids: string[]) {
    var view = schema.views[0];
    return {
        url: '/page',
        pageLayout: { type: PageLayoutType.dbPickRecord },
        views: [
            {
                url: '/view',
                blocks: {
                    childs: [{
                        url: view.url,
                        syncBlockId: view.id,
                    }]
                }
            }
        ]
    }
}
/**
 * 这里创建一个查询的页面视图
 * 然后供用户挑选
 */
export async function createFormPage(el: HTMLElement,
    options: { schema: TableSchema, ids: string[], isMultiple: boolean }) {
    var page = new Page();
    page.on(PageDirective.history, async function (action) {
        // await item.store.saveHistory(action);
        // await item.store.savePageContent(action, await page.getFile());
    });
    var pageData = schemaCreatePageFormData(options.schema, options.ids);
    console.log(pageData);
    await page.load(pageData);
    page.render(el, { width: 600, height: 500 });
    return page;
}