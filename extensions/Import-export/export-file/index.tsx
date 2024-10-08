import React from "react";
import { EventsComponent } from "../../../component/lib/events.component";
import { Page } from "../../../src/page";
import { Button } from "../../../component/view/button";
import { SelectBox } from "../../../component/view/select/box";
import { channel } from "../../../net/channel";
import { util } from "../../../util/util";
import { lst } from "../../../i18n/store";
import { S } from "../../../i18n/view";
import { HelpText } from "../../../component/view/text";

export default class ExportFile extends EventsComponent {
    render() {
        return <div className="w-300 round padding-14">
            <div className="flex">
                <span className="flex-auto remark f-12 "><S>仅支持单文件导出</S></span>
                <div className="flex-fixed ">
                    <HelpText url={window.shyConfig?.isUS ? "https://help.shy.red/page/71#e72EUw6QxP19ff3RxfowCS" : "https://help.shy.live/page/1869#9jTtjTXApVBuTjZTwBHR88"}><S>了解数据导出</S></HelpText>
                </div>
            </div>
            <div className="gap-b-10 gap-t-5">
                <SelectBox dropAlign="full" border options={this.getOptions()} value={this.type} onChange={e => { this.type = e; this.forceUpdate() }}></SelectBox>
            </div>
            <div>
                <Button block onClick={(e, b) => this.onExport(b)}><S>导出</S></Button>
            </div>
        </div>
    }
    page: Page;
    type: string = 'markdown';
    getOptions() {
        if (this.page?.ws?.datasource == 'private-local') {
            return [
                { text: 'Markdown', value: "markdown" },
                { text: 'JSON', value: 'json' }
            ]
        }
        return [
            { text: 'Markdown', value: "markdown" },
            // { text: 'HTML', value: 'html' },
            { text: 'PDF', value: 'pdf' },
            { text: lst('图片'), value: 'png' },
            { text: 'JSON', value: 'json' }
        ]
    }
    onOpen(options: { page: Page }) {
        this.page = options.page;
        this.forceUpdate();
    }
    async onExport(button: Button) {
        button.loading = true;
        try {
            if (this.type == 'markdown') {
                await util.downloadFileByData(await this.page.getMd(), (this.page.getPageDataInfo()?.text || lst('页面')) + ".md")
            }
            else if (this.type == 'html') {

            }
            else if (this.type == 'json') {
                await util.downloadFileByData(await this.page.getString(), (this.page.getPageDataInfo()?.text || lst('页面')) + ".json")
            }
            else if (this.type == 'png') {
                var ws = this.page.ws
                var r = await channel.post('/screenshot/png', { url: ws.url + "/pc?url=" + encodeURIComponent(this.page.elementUrl) + "&wsId=" + ws.id });
                if (r?.data) {
                    await util.downloadFile(r.data.file.url, (this.page.getPageDataInfo()?.text || lst('图片')) + ".png")
                }
            }
            else if (this.type == 'pdf') {
                var ws = this.page.ws
                var r = await channel.post('/screenshot/pdf', { url: ws.url + "/pc?url=" + encodeURIComponent(this.page.elementUrl) + "&wsId=" + ws.id });
                if (r?.data) {
                    await util.downloadFile(r.data.file.url, (this.page.getPageDataInfo()?.text || lst('页面')) + ".pdf")
                }
            }
        }
        catch (ex) {
            console.error(ex)
        }
        finally {
            button.loading = false;
        }

    }
}

