
import { Page } from "..";
import { BlockUrlConstant } from "../../block/constant";
import { PageLayoutType } from "../declare";


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


