import lodash from "lodash";
import { Page } from "../../src/page";

export async function createFormPage(el: HTMLElement, content: any, shyPage: Page) {
    var page = new Page();
    page.ws = shyPage.ws;
    page.openSource = 'snap';
    page.pageInfo = shyPage.pageInfo;
    page.pageLayout = shyPage.pageLayout;
    page.customElementUrl = shyPage.customElementUrl;
    page.readonly = true;
    page.currentPermissions = lodash.cloneDeep(shyPage.currentPermissions);
    var pageData = typeof content == 'string' ? JSON.parse(content) : content;
    await page.load(pageData);
    var bound = el.getBoundingClientRect();
    page.render(el, { width: bound.width, height: bound.height });
    return page;
}