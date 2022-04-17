import { channel } from "../../../net/channel";
import { Block } from "../../../src/block";
import { url } from "../../../src/block/factory/observable";
import { PageLayoutType } from "../../../src/page/declare";
import { ChannelTextType } from "./declare";
import "./style.less";

@url('/channel/text')
export class ChannelText extends Block {
    chats: ChannelTextType[] = [];
    get roomId() {
        return this.page.pageLayout.type == PageLayoutType.textChannel ? this.page.pageItemId : this.syncBlockId
    }
    async loadChannelTextDatas() {
        var r = await channel.get('/ws/channel/list',
            { roomId: this.roomId }
        );
        if (r.ok) {
            if (Array.isArray(r.data.list)) {
                this.chats = r.data.list;
            }
        }
    }
    async didMounted(): Promise<void> {
        await this.loadChannelTextDatas();
        this.view.forceUpdate(()=>(this.view as any).updateScroll());
        channel.sync('/ws/channel/notify', this.channelNotify)
    }
    channelNotify = (data: { workspaceId: string, roomId: string }) => {
        if (this.roomId == data.roomId) {
            this.chats.push(data as any);
            this.view.forceUpdate(()=>(this.view as any).updateScroll());
        }
    }
    async didUnmounted(): Promise<void> {
        channel.off('/ws/channel/notify', this.channelNotify)
    }
}
