import { Page } from "../../src/page";
import { LinkPageItem } from "../at/declare";

export async function createFormPage(el: HTMLElement, content: any, item: LinkPageItem) {
    var page = new Page();
    page.pageInfo = item;
    page.readonly = true;
    var pageData = typeof content == 'string' ? JSON.parse(content) : content;
    await page.load(pageData);
    var bound = el.getBoundingClientRect();
    page.render(el, { width: bound.width, height: bound.height });
    return page;
}