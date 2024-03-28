import React from "react";
import { EventsComponent } from "../../component/lib/events.component";
import { PopoverSingleton } from "../../component/popover/popover";
import { Page } from "../../src/page";
import { Button } from "../../component/view/button";
import { SelectBox } from "../../component/view/select/box";
import { channel } from "../../net/channel";
import { util } from "../../util/util";
import { lst } from "../../i18n/store";
import { S } from "../../i18n/view";
import { HelpText } from "../../component/view/text";

class ExportFile extends EventsComponent {
    render() {
        return <div className="w-300 round padding-14">
            <div className="flex">
                <span className="flex-auto remark f-12 "><S>仅支持单文件导出</S></span>
                <div className="flex-fixed ">
                    <HelpText url={window.shyConfig?.isUS ? "https://help.shy.live/page/1869#9jTtjTXApVBuTjZTwBHR88" : "https://help.shy.live/page/1869#9jTtjTXApVBuTjZTwBHR88"}><S>了解数据导出</S></HelpText>
                </div>
            </div>
            <div className="gap-b-10 gap-t-5">
                <SelectBox dropAlign="full" border options={[
                    { text: 'Markdown', value: "markdown" },
                    // { text: 'HTML', value: 'html' },
                    { text: 'PDF', value: 'pdf' },
                    { text: lst('图片'), value: 'png' },
                    { text: 'JSON', value: 'json' }
                ]} value={this.type} onChange={e => { this.type = e; this.forceUpdate() }}></SelectBox>
            </div>
            <div>
                <Button block onClick={(e, b) => this.onExport(b)}><S>导出</S></Button>
            </div>
        </div>
    }
    page: Page;
    type: string = 'markdown';
    onOpen(options: { page: Page }) {
        this.page = options.page;
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
                    await util.downloadFile(r.data.file.url, this.page.getPageDataInfo()?.text)
                }
            }
            else if (this.type == 'pdf') {
                var ws = this.page.ws
                var r = await channel.post('/screenshot/pdf', { url: ws.url + "/pc?url=" + encodeURIComponent(this.page.elementUrl) + "&wsId=" + ws.id });
                if (r?.data) {
                    await util.downloadFile(r.data.file.url, this.page.getPageDataInfo()?.text)
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

export async function useExportFile(options?: { page: Page }) {
    let popover = await PopoverSingleton(ExportFile, { slow: true });
    let filePicker = await popover.open({ center: true, centerTop: 100 });
    filePicker.onOpen(options)
    return new Promise((resolve: (data: any) => void, reject) => {
        popover.only('close', () => {
            resolve(null)
        })
    })
}