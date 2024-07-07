import { Page } from "..";
import { Title } from "../../../blocks/interaction/title";
import { channel } from "../../../net/channel";
import { parseElementUrl } from "../../../net/element.type";
import { SyncMessageUrl } from "../../../net/sync.message";
import { BlockUrlConstant } from "../../block/constant";
import { UserAction } from "../../history/action";
import { ActionDirective } from "../../history/declare";
import { LinkPageItem } from "../declare";
import { PageLocation } from "../directive";

export function SyncPage(page: Page)
{

    channel.sync('/page/update/info', page.syncs['/page/update/info'] = (r: { id: string, elementUrl: string, pageInfo: LinkPageItem },
        options: { locationId?: string | number, sockId?: string }) => {
        if (r.elementUrl && page.elementUrl === r.elementUrl || r.id && r.id == page.pageInfo.id) {
            if(page.view.pageBar && options?.locationId != PageLocation.pageBarUpdateInfo) {
                page.view.pageBar.forceUpdate();
            }
            page.forceUpdate();
            page.views.forEach(v => {
                v.forceManualUpdate()
            })
            //console.log('eeee',options?.locationId)
            if (options?.locationId != PageLocation.pageEditTitle) {
                var title = page.find(c => c.url == BlockUrlConstant.Title) as Title;
                if (title) {
                    title.loadPageInfo(true);
                }
                page.forceUpdate();
            }
            var pa = page.parentItems.find(c => r.id && c.id == r.id || r.elementUrl && parseElementUrl(r.elementUrl).id == c.id);
            if (pa) {
                var isUpdate = false;
                if (typeof r.pageInfo.icon != 'undefined') { pa.icon = r.pageInfo.icon; isUpdate = true }
                if (typeof r.pageInfo.text != 'undefined') { pa.text = r.pageInfo.text; isUpdate = true }
                if (isUpdate)
                    page.view.pageBar.forceUpdate();
            }
        }
    })

    channel.sync(SyncMessageUrl.viewOperate, page.syncs[SyncMessageUrl.viewOperate] = async (e: UserAction, op) => {
        if (page.ws?.id == e?.workspaceId) {
            var isJoin: boolean = false;
            /**
             * 页面在切换的过程中，elementUrl 会变化，所以通过id来确认，其它时候，elementUrl是唯一的
             */
            if (e.directive == ActionDirective.onPageTurnLayout) {
                isJoin = page.pe.id == parseElementUrl(e.elementUrl).id;
            }
            console.log(page.elementUrl,e.elementUrl,e);
            if (page.elementUrl == e.elementUrl || isJoin) {
                await page.onSyncUserActions([e], 'notify')
            }
        }
    });
    channel.sync(SyncMessageUrl.viewOperates, page.syncs[SyncMessageUrl.viewOperate] = async (e: UserAction[], op) => {
        var ua = e[0];
        if (ua && page.ws?.id == ua.workspaceId) {
            var isJoin: boolean = false;
            console.log(page.elementUrl,ua.elementUrl,e);
            /**
            * 页面在切换的过程中，elementUrl 会变化，所以通过id来确认，其它时候，elementUrl是唯一的
            */
            if (e.some(s => s.directive == ActionDirective.onPageTurnLayout)) {
                var es = e.find(s => s.directive == ActionDirective.onPageTurnLayout);
                if (page.pe.id == parseElementUrl(es.elementUrl).id) {
                    isJoin = true
                }
            }
            if (page.elementUrl == ua.elementUrl || isJoin) {
                await page.onSyncUserActions(e, 'notify')
            }
        }
    });
}