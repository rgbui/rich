import { channel } from "../../../net/channel";
import { Block } from "../../../src/block";
import { url } from "../../../src/block/factory/observable";
import { PageLayoutType } from "../../../src/page/declare";
import { ChannelTextType } from "./declare";
import "./style.less";
import { KeyboardCode } from "../../../src/common/keys";
import { ChannelTextView } from "./view/view";
import lodash from "lodash";

@url('/channel/text')
export class ChannelText extends Block {
    chats: ChannelTextType[] = [];
    get roomId() {
        return this.page.pageLayout.type == PageLayoutType.textChannel ? this.page.pageItemId : this.syncBlockId
    }
    pageIndex: number = 1;
    isLast: boolean = false;
    unreadTip: { seq: number, count: number, date: number } =null;
    async onClearUnread() {
        this.unreadTip = null;
        await this.setLocalSeq(this.chats.max(x => x.seq));
        this.forceUpdate();
    }
    async loadChannelTextDatas() {
        var localSeq = this.pageIndex == 1 ? await this.getLocalSeq() : null;
        var r = await channel.get('/ws/channel/list',
            {
                roomId: this.roomId,
                page: this.pageIndex,
                seq: localSeq?.seq || undefined
            }
        );
        if (r.ok) {
            if (localSeq) {
                if (r.data.unreadCount) {
                    this.unreadTip = { seq: localSeq.seq, count: r.data.unreadCount, date: localSeq.date }
                }
            }
            if (Array.isArray(r.data.list)) {
                if (r.data.list.length == 0) { this.isLast = true; }
                r.data.list.forEach(d => {
                    if (!this.chats.some(c => c.id == d.id)) {
                        this.chats.push(d)
                    }
                })
            }
            if (this.pageIndex == 1)
                this.setLocalSeq(this.chats.max(x => x.seq));
        }
    }
    async didMounted(): Promise<void> {
        await this.loadChannelTextDatas();
        this.view.forceUpdate(() => (this.view as any).updateScroll());
        channel.sync('/ws/channel/notify', this.channelNotify);
        channel.sync('/ws/channel/patch/notify', this.patchNotify);
        channel.sync('/ws/channel/emoji/notify', this.emojiNotify);
        this.page.keyboardPlate.listener(g => g.is(KeyboardCode.Esc), (ev) => { }, (ev) => {
            var v: ChannelTextView = this.view as any;
            v.editChannelText = null;
            v.forceUpdate();
        }, this.id)
    }
    channelNotify = (data: { workspaceId: string, roomId: string }) => {
        if (this.roomId == data.roomId) {
            this.chats.push(data as any);
            this.setLocalSeq(this.chats.max(x => x.seq));
            this.view.forceUpdate(() => (this.view as any).updateScroll());
        }
    }
    patchNotify = (data: {
        id: string,
        workspaceId: string;
        roomId: string;
        content: string;
        file: any;
        isEdited: boolean;
    }) => {
        if (this.roomId == data.roomId) {
            var c = this.chats.find(g => g.id == data.id);
            if (c) {
                Object.assign(c, data);
            }
            this.view.forceUpdate();
        }
    }
    emojiNotify = (data: { workspaceId: string, id: string, roomId: string, emoji: { emojiId: string, code: string, count: number } }) => {
        if (this.roomId == data.roomId) {
            var c = this.chats.find(g => g.id == data.id);
            if (c) {
                if (!Array.isArray(c.emojis)) c.emojis = [];
                var ec = c.emojis.find(g => g.emojiId == data.emoji.emojiId);
                if (ec) {
                    Object.assign(ec, data.emoji);
                }
                else c.emojis.push(data.emoji)
            }
            this.view.forceUpdate();
        }
    }
    async didUnmounted(): Promise<void> {
        channel.off('/ws/channel/notify', this.channelNotify);
        this.page.keyboardPlate.off(this.id);
    }
    async getLocalSeq(): Promise<{ seq: number, date: number }> {
        var r = await channel.query('/cache/get', { key: this.cacheSeqKey });
        if (r?.seq) {
            return { seq: r.seq, date: r.date };
        }
    }
    async setLocalSeq(seq: number) {
        await channel.act('/cache/set',
            {
                key: this.cacheSeqKey,
                value: { seq, date: Date.now() }
            })
    }
    get cacheSeqKey() {
        return [this.id, this.roomId, 'seq'].join("/")
    }
    scrollTopLoad = lodash.throttle(async () => {
        if (this.isLast == false) {
            this.pageIndex += 1;
            await this.loadChannelTextDatas()
        }
    }, 2000)
}
