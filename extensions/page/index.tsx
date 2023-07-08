import React from "react";
import { Page } from "../../src/page";
import { Rect } from "../../src/common/vector/point";
import { PageDirective } from "../../src/page/directive";
import { ViewOperate } from "../../src/history/action";
import { channel } from "../../net/channel";
export function PageContentView(props: { elementUrl?: string, wsId?: string }) {
    var el = React.useRef(null)
    async function load() {
        var e: string, wsId: string;
        e = props.elementUrl;
        wsId = props.wsId;
        var ws = await channel.get('/ws/create/object', { wsId })
        var r = await channel.get('/view/snap/query/readonly', {
            elementUrl: e,
            wsId: wsId,
            // seq: -1,
            // readonly: false
        });
        if (r.ok) {
            var pd = { operates: r.data.operates as ViewOperate[] || [], content: r.data.content ? JSON.parse(r.data.content) : {} }
            var page = new Page();
            page.ws = ws;
            var item = await channel.get('/page/query/elementUrl', { elementUrl: e })
            page.pageInfo = item;
            page.edit = false;
            page.openSource = 'page'
            page.isSchemaRecordViewTemplate = false;
            page.customElementUrl = e;
            page.readonly = true;
            page.bar = false;
            await page.cachCurrentPermissions();
            await page.load(pd.content, pd.operates);
            var bound = Rect.fromEle(el.current);
            page.on(PageDirective.mounted, async () => {
                if (typeof (window as any).puppeteer_page_load == 'function' && !props.elementUrl)
                    (window as any).puppeteer_page_load();
            })
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