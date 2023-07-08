import React from "react";
import { EventsComponent } from "../../component/lib/events.component";
import { PopoverSingleton } from "../popover/popover";
import { Page } from "../../src/page";
import { Button } from "../../component/view/button";
import { SelectBox } from "../../component/view/select/box";
import { channel } from "../../net/channel";
import { util } from "../../util/util";

class ExportFile extends EventsComponent {
    render() {
        return <div className="w-180 round padding-14 ">
            <div className="h4">导出</div>
            <div>
                <SelectBox options={[
                    { text: 'Markdown', value: "markdown" },
                    // { text: 'HTML', value: 'html' },
                    { text: 'PDF', value: 'pdf' },
                    { text: '图片', value: 'png' },
                    { text: 'JSON', value: 'json' }
                ]} value={this.type} onChange={e => { this.type = e; this.forceUpdate() }}></SelectBox>
            </div>
            <div className="remark f-12 gap-h-10">仅支持单文件导出</div>
            <div className="flex">
                <Button block onClick={(e, b) => this.onExport(b)}>导出</Button>
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
                await util.downloadFileByData(await this.page.getMd(), (this.page.getPageDataInfo()?.text || '页面') + ".md")
            }
            else if (this.type == 'html') {

            }
            else if (this.type == 'json') {
                await util.downloadFileByData(await this.page.getString(), (this.page.getPageDataInfo()?.text || '页面') + ".json")
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