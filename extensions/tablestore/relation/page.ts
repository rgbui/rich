import { TableSchema } from "../../../blocks/data-grid/schema/meta";
import { PageLayoutType } from "../../../src/layout/declare";
import { Page } from "../../../src/page";
import { PageDirective } from "../../../src/page/directive";
export function schemaCreatePageFormData(schema: TableSchema, row?: Record<string, any>) {
    return {
        url: '/page',
        pageLayout: { type: PageLayoutType.dbForm },
        views: [
            {
                url: '/view',
                blocks: {
                    // childs: cs
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