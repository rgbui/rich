import { Page } from "..";
import { Title } from "../../../blocks/interaction/title";
import { channel } from "../../../net/channel";
import { SyncMessageUrl } from "../../../net/sync.message";
import { BlockUrlConstant } from "../../block/constant";
import { UserAction } from "../../history/action";
import { LinkPageItem } from "../declare";
import { PageLocation } from "../directive";
export function SyncPage(page: Page) {

    channel.sync('/page/update/info', page.syncs['/page/update/info'] = (r: { id: string, elementUrl: string, pageInfo: LinkPageItem },
        options: { locationId?: string | number, sockId?: string }) => {
        if (r.elementUrl && page.elementUrl === r.elementUrl || r.id && r.id == page.pageInfo.id) {
            if (page.view.pageBar && options?.locationId != PageLocation.pageBarUpdateInfo) {
                page.view.pageBar.forceUpdate();
            }
            if (options?.locationId != PageLocation.pageEditTitle) {
                var title = page.find(c => c.url == BlockUrlConstant.Title) as Title;
                if (title) {
                    title.loadPageInfo(true);
                }
                page.forceUpdate();
            }
        }
    })

    channel.sync(SyncMessageUrl.viewOperate, page.syncs[SyncMessageUrl.viewOperate] = async (e: UserAction, op) => {
        if (page.ws?.id == e.workspaceId) {
            if (page.elementUrl == e.elementUrl) {
                await page.onSyncUserActions([e], 'notify')
            }
        }
    });
    channel.sync(SyncMessageUrl.viewOperates, page.syncs[SyncMessageUrl.viewOperate] = async (e: UserAction[], op) => {
        var ua = e[0];
        if (page.ws?.id == ua.workspaceId) {
            if (page.elementUrl == ua.elementUrl) {
                await page.onSyncUserActions(e, 'notify')
            }
        }
    });
}