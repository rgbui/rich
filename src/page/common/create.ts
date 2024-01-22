
import { Page } from "..";
import { BlockUrlConstant } from "../../block/constant";
import { LinkWs, PageLayoutType } from "../declare";


/***
 * 
 * 
 * @param blocks
 * {url:BlockUrlConstant.Image,src:{}}
 */
export async function buildPageData(blocks: (Record<string, any> | string)[],
    options?: { isTitle?: boolean, isComment?: boolean }) {
    var ps: {}[] = [];
    if (!(options?.isTitle == false)) {
        ps.push({ url: BlockUrlConstant.Title })
    }
    for (let i = 0; i < blocks.length; i++) {
        var block = blocks[i];
        if (typeof block == 'string') {
            ps.push({ url: BlockUrlConstant.TextSpan, content: block })
        }
        else if (typeof block.url == 'string') {
            ps.push(block)
        }
    }
    if (options?.isComment) {
        ps.push({ url: BlockUrlConstant.Comment })
    }

    var page = new Page();
    page.pageLayout = { type: PageLayoutType.doc };
    await page.load({
        views: [{
            url: BlockUrlConstant.View,
            blocks: {
                childs: ps
            }
        }]
    });
    return await page.getString()
}

export async function buildPage(blocks: (Record<string, any> | string)[],
    options?: { isTitle?: boolean, isComment?: boolean }, ws?: LinkWs) {
    var ps: {}[] = [];
    if (!(options?.isTitle == false)) {
        ps.push({ url: BlockUrlConstant.Title })
    }
    for (let i = 0; i < blocks.length; i++) {
        var block = blocks[i];
        if (typeof block == 'string') {
            ps.push({ url: BlockUrlConstant.TextSpan, content: block })
        }
        else if (typeof block.url == 'string') {
            ps.push(block)
        }
    }
    if (options?.isComment) {
        ps.push({ url: BlockUrlConstant.Comment })
    }
    var page = new Page();
    page.pageLayout = { type: PageLayoutType.doc };
    page.requireSelectLayout = false;
    if (ws?.createPageConfig)
    {
        if (typeof ws.createPageConfig.smallFont != 'undefined') {
            page.smallFont = ws.createPageConfig.smallFont
        }
        if (typeof ws.createPageConfig.isFullWidth != 'undefined') {
            page.isFullWidth = ws.createPageConfig.isFullWidth
        }
        if (typeof ws.createPageConfig.nav != 'undefined') {
            page.nav = ws.createPageConfig.nav
        }
        if (typeof ws.createPageConfig.autoRefSubPages != 'undefined') {
            page.autoRefSubPages = ws.createPageConfig.autoRefSubPages
        }
    }
    await page.load({
        views: [{
            url: BlockUrlConstant.View,
            blocks: {
                childs: ps
            }
        }]
    });
    return page;
}




