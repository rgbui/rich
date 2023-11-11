import { Page } from "..";
import { BlockUrlConstant } from "../../block/constant";
import { PageLayoutType } from "../declare";


export function BuildTemplate(page: Page) {
    var dr: Record<string, any>;
    if (page.pageLayout?.type == PageLayoutType.docCard) {
        var docs = {
            url: '/page',
            views: [
                {
                    url: '/view',
                    blocks: {
                        childs: [
                            {
                                url: '/card/box',
                                blocks: {
                                    childs: [
                                        { url: '/title' }
                                    ]
                                }
                            },
                            {
                                url: '/card/box',
                                blocks: {
                                    childs: [
                                        { url: '/head' }
                                    ]
                                }
                            }
                        ]
                    }
                }
            ]
        }
        if (page.requireSelectLayout !== true && typeof page.ws.createPageConfig.autoRefPages != 'undefined') {
            docs.views[0].blocks.childs.last().blocks.childs.push({
                url: BlockUrlConstant.RefLinks
            })
        }
        dr = docs;
    }
    else {
        var pageInfo = {
            url: '/page',
            views: [
                {
                    url: '/view',
                    blocks: {
                        childs: [
                            { url: '/title' }
                        ]
                    }
                }
            ]
        }
        if (page.requireSelectLayout !== true && typeof page.ws.createPageConfig.autoRefPages != 'undefined') {
            pageInfo.views[0].blocks.childs.push({
                url: BlockUrlConstant.RefLinks
            })
        }
        dr = pageInfo;
    }
    if (page.ws?.createPageConfig) {
        if (typeof page.ws.createPageConfig.smallFont != 'undefined') {
            dr.smallFont = page.ws.createPageConfig.smallFont
        }
        if (typeof page.ws.createPageConfig.isFullWidth != 'undefined') {
            dr.isFullWidth = page.ws.createPageConfig.isFullWidth
        }
        if (typeof page.ws.createPageConfig.nav != 'undefined') {
            dr.nav = page.ws.createPageConfig.nav
        }
        if (typeof page.ws.createPageConfig.autoRefSubPages != 'undefined') {
            dr.autoRefSubPages = page.ws.createPageConfig.autoRefSubPages
        }
    }
    return dr;
}