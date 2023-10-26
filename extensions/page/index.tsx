import React from "react";
import { Page } from "../../src/page";
import { Rect } from "../../src/common/vector/point";
import { PageDirective } from "../../src/page/directive";
import { ViewOperate } from "../../src/history/action";
import { channel } from "../../net/channel";
import { AtomPermission } from "../../src/page/permission";
import lodash from "lodash";
import { PageLayoutType } from "../../src/page/declare";
export function PageContentView(props: {
    elementUrl?: string,
    wsId?: string,
    canEdit?: boolean,
    hideDocTitle?: boolean,
    type?: PageLayoutType,
    requireSelectLayout?: boolean
}) {
    var el = React.useRef(null)
    async function load() {
        var e: string, wsId: string;
        e = props.elementUrl;
        wsId = props.wsId;
        var ws = await channel.get('/ws/create/object', { wsId })
        var r = await channel.get('/view/snap/query/readonly', {
            elementUrl: e,
            ws: ws
            // wsId: wsId,
            // seq: -1,
            // readonly: false
        });
        if (r.ok) {
            var pd = { operates: r.data.operates as ViewOperate[] || [], content: r.data.content ? JSON.parse(r.data.content) : {} }
            var page = new Page();
            page.ws = ws;
            var item = await channel.get('/page/query/elementUrl', { ws: ws, elementUrl: e })
            page.pageInfo = item;
            page.edit = props.canEdit ? props.canEdit : false;
            page.openSource = 'page'
            page.isSchemaRecordViewTemplate = false;
            page.customElementUrl = e;
            page.readonly = props.canEdit ? false : true;
            page.bar = false;
            page.hideDocTitle = props.hideDocTitle || false;
            page.requireSelectLayout = typeof props.requireSelectLayout == 'boolean' ? props.requireSelectLayout : true;
            if (typeof props.type != 'undefined') {
                page.pageLayout = { type: props.type }
            }
            if (props.canEdit) {
                page.currentPermissions = {
                    isOwner: false,
                    isWs: false,
                    netPermissions: [AtomPermission.channelEdit, AtomPermission.dbEdit, AtomPermission.docEdit],
                    permissions: [AtomPermission.channelEdit, AtomPermission.dbEdit, AtomPermission.docEdit],
                    //memberPermissions?: { userid?: string, roleId?: string, permissions?: AtomPermission[] }[];
                }
            }
            else {
                page.currentPermissions = {
                    isOwner: false,
                    isWs: false,
                    netPermissions: [AtomPermission.channelView, AtomPermission.dbView, AtomPermission.docView],
                    permissions: [AtomPermission.channelView, AtomPermission.dbView, AtomPermission.docView]
                    //memberPermissions?: { userid?: string, roleId?: string, permissions?: AtomPermission[] }[];
                }
            }
            await page.load(pd.content, pd.operates);
            var bound = Rect.fromEle(el.current);
            page.on(PageDirective.mounted, async () => {
                if (typeof (window as any).puppeteer_page_load == 'function' && !props.elementUrl)
                    (window as any).puppeteer_page_load();
            })
            if (props.canEdit) {
                var laySave = lodash.debounce(async () => {
                    await channel.put('/view/snap/direct', {
                        wsId,
                        elementUrl: e,
                        content: await page.getString(),
                        plain: await page.getPlain(),
                        text: page.pageInfo?.text,
                        thumb: await page.getThumb(),
                    })
                }, 2e3);
                page.on(PageDirective.history, laySave);
            }
            page.render(el.current, {
                width: bound.width,
                height: bound.height
            });
        }
    }
    React.useEffect(() => {
        load()
    }, [])
    return <div ref={e => el.current = e}>
    </div>
}