import { channel } from "../../../net/channel";
import { Block } from "../../../src/block";
import { url } from "../../../src/block/factory/observable";
import { LinkPageItem, PageLayoutType } from "../../../src/page/declare";
import { ChannelTextType } from "./declare";
import { KeyboardCode } from "../../../src/common/keys";
import { ChannelTextView } from "./view/view";
import lodash from "lodash";
import { ElementType, getElementUrl, parseElementUrl } from "../../../net/element.type";
import { Rect } from "../../../src/common/vector/point";
import { util } from "../../../util/util";
import { AtomPermission } from "../../../src/page/permission";
import "./style.less";

@url('/channel/text')
export class ChannelText extends Block {
    chats: ChannelTextType[] = [];
    get roomId() {
        return this.page.pageLayout.type == PageLayoutType.textChannel ? this.page.pageInfo.id : this.syncBlockId
    }
    get isShowHandleBlock() {
        return this.page.pageLayout.type == PageLayoutType.textChannel ? false : true;
    }
    get elementUrl() {
        return getElementUrl(ElementType.Room, this.roomId);
    }
    pageIndex: number = 1;
    /**
     * 是否加载完毕
     */
    isChatsOver: boolean = false;
    unreadTip: { seq: number, count: number, date: number } = null;
    async onClearUnread() {
        this.unreadTip = null;
        await this.setLocalSeq(this.chats.max(x => x.seq));
        this.forceManualUpdate();
    }
    loading: boolean = false;
    async loadChannelTextDatas() {
        var hasIncrementChats = false;
        try {
            var localSeq = this.pageIndex == 1 ? await this.getLocalSeq() : null;
            var r = await channel.get('/ws/channel/list',
                {
                    roomId: this.roomId,
                    page: this.pageIndex,
                    seq: localSeq?.seq || undefined,
                    ws: this.page.ws
                }
            );
            if (r.ok) {
                if (localSeq) {
                    if (r.data.unreadCount) {
                        this.unreadTip = { seq: localSeq.seq, count: r.data.unreadCount, date: localSeq.date }
                    }
                }
                if (Array.isArray(r.data.list)) {
                    if (r.data.list.length == 0) { this.isChatsOver = true; }
                    else if (r.data.list.length > 0) hasIncrementChats = true;
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
        catch (ex) {
            console.error(ex);
        }
        finally {
            return hasIncrementChats;
        }
    }
    abledSend: boolean = false;
    async loadHasAbledSend(force?: boolean) {
        this.abledSend = true;
        if (!this.isAllow(AtomPermission.pageEdit, AtomPermission.dbEdit, AtomPermission.dbFull, AtomPermission.pageFull)) {
            this.abledSend = false;
        }
        if (this.pageInfo?.speak == 'only') {
            var r = await channel.get('/ws/channel/abled/send', { ws: this.page.ws, roomId: this.roomId });
            if (r.ok) {
                this.abledSend = r.data.abled;
            }
            else this.abledSend = false;
        }
        else if (this.pageInfo?.speak == 'unspeak') {
            this.abledSend = false;
        }
        if (force == true) this.forceManualUpdate()
    }
    async didMounted(): Promise<void> {
        await this.onBlockLoadData(async () => {
            this.loading = true;
            await this.forceManualUpdate();
            await this.loadPageInfo();
            await this.loadChannelTextDatas();
            await this.loadHasAbledSend();
            this.loading = false;
            await this.forceManualUpdate();
            (this.view as any).updateScroll()

            channel.sync('/ws/channel/notify', this.channelNotify);
            channel.sync('/ws/channel/patch/notify', this.patchNotify);
            channel.sync('/ws/channel/emoji/notify', this.emojiNotify);
            channel.sync('/page/update/info', this.updatePageInfo);
            this.page.keyboardPlate.listener(g => g.is(KeyboardCode.Esc), (ev) => { }, (ev) => {
                var v: ChannelTextView = this.view as any;
                v.editChannelText = null;
                v.forceUpdate();
            }, this.id)
        })
    }
    channelNotify = (data: { workspaceId: string, roomId: string }) => {
        if (this.roomId == data.roomId) {
            this.chats.push(data as any);
            this.setLocalSeq(this.chats.max(x => x.seq));
            this.forceManualUpdate().then(() => {
                (this.view as any).updateScroll()
            })
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
    updatePageInfo = (r: { id: string, elementUrl: string, pageInfo: LinkPageItem }) => {
        var isUpdate: boolean = false;

        if (r.elementUrl && parseElementUrl(r.elementUrl).type == ElementType.Room && parseElementUrl(r.elementUrl)?.id == this.roomId) {
            isUpdate = true;
        }
        else if (r.id == this.roomId) {
            isUpdate = true;
        }
        if (isUpdate) {
            if (this.pageInfo) {
                Object.assign(this.pageInfo, r.pageInfo);

                if (r.pageInfo?.speak) {
                    this.loadHasAbledSend(true)
                }
                else this.forceManualUpdate()
            }
        }
    }
    async didUnmounted() {
        channel.off('/ws/channel/notify', this.channelNotify);
        channel.off('/ws/channel/patch/notify', this.patchNotify);
        channel.off('/ws/channel/emoji/notify', this.emojiNotify);
        channel.off('/page/update/info', this.updatePageInfo);
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
    scrollTopLoad = lodash.debounce(async () => {
        if (this.isChatsOver == false) {
            if (this.loading) return;
            this.pageIndex += 1;
            this.loading = true;
            this.forceManualUpdate();
            var td = this.chats.findMin(g => g.createDate.getTime());
            var isIncrementChats = await this.loadChannelTextDatas();
            this.loading = false;
            await this.forceManualUpdate();
            if (isIncrementChats) {
                var ce = (this.view as any).contentEl as HTMLElement
                var it = ce.querySelector(`[data-channel-text-id='${td.id}']`);
                if (it) {
                    ce.scrollTop = Rect.fromEle(it as HTMLElement).top - Rect.fromEle(ce).top;
                }
                await util.delay(1000)
                var it = ce.querySelector(`[data-channel-text-id='${td.id}']`);
                if (it) {
                    ce.scrollTop = Rect.fromEle(it as HTMLElement).top - Rect.fromEle(ce).top;
                }
            }
        }
    }, 1200)
    pageInfo: LinkPageItem = null;
    async loadPageInfo() {
        var r = await channel.get('/page/query/info', {
            ws: this.page.ws,
            id: this.roomId
        });
        if (r.ok) {
            this.pageInfo = r.data;
        }
    }
    async getMd() {
        var ws = this.page.ws;
        return `[${this.pageInfo.text}](${ws.url + '/r?url=' + window.encodeURIComponent(this.elementUrl)})`
    }
}
