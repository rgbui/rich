
import { TableSchema } from "../../../blocks/data-grid/schema/meta";
import { Page } from "../../../src/page";
import { PageDirective } from "../../../src/page/directive";
import { channel } from "../../../net/channel";
import { schemaCreatePageFormData } from "../../../blocks/data-grid/element/service";
export async function createFormPage(el: HTMLElement,
    options: {
        schema: TableSchema,
        recordViewId: string,
        row?: Record<string, any>
    }) {
    var page = new Page();
    page.schema = options.schema;
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
    if (r.ok && r.data.content && Object.keys(r.data.content).length > 0) {
        pageData = r.data.content as any;
        if (typeof pageData == 'string') pageData = JSON.parse(pageData);
    }
    if (!pageData) pageData = schemaCreatePageFormData(options.schema);
    await page.load(pageData);
    if (options.row) page.loadSchemaRecord(options.row);
    var bound = el.getBoundingClientRect();
    page.render(el, { width: bound.width, height: bound.height });
    return page;
}


