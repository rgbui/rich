import { TableSchema } from "../../../blocks/data-grid/schema/meta";
import { PageLayoutType } from "../../../src/page/declare";
import { Page } from "../../../src/page";
import { PageDirective } from "../../../src/page/directive";
import { ElementType, getElementUrl } from "../../../net/element.type";

export function schemaCreatePageFormData(
    schema: TableSchema,
    datas: Record<string, any>[]
) {
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
                        schemaId: schema.id,
                        checkItems: datas,
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
    options: {
        schema: TableSchema,
        datas: any[],
        isMultiple: boolean
    }) {
    var page = new Page();
    page.customElementUrl = getElementUrl(
        ElementType.SchemaView,
        options.schema.id,
        options.schema.views[0].id
    );
    page.pageInfo = options.schema;

    page.on(PageDirective.history, async function (action) {

    });
    var pageData = schemaCreatePageFormData(options.schema, options.datas);
    await page.load(pageData);
    page.render(el, { width: 600, height: 400 });
    return page;
}