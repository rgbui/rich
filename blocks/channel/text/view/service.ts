import lodash from "lodash";
import { ChannelText } from "..";
import { useSelectMenuItem } from "../../../../component/view/menu";
import { MenuItem } from "../../../../component/view/menu/declare";
import { useOpenEmoji } from "../../../../extensions/emoji";
import { channel } from "../../../../net/channel";
import { getElementUrl, ElementType } from "../../../../net/element.type";
import { Block } from "../../../../src/block";
import { TextEle } from "../../../../src/common/text.ele";
import { Rect } from "../../../../src/common/vector/point";
import { PageLayoutType } from "../../../../src/page/declare";
import { ChannelTextType } from "../declare";
import { ChannelTextView } from "./view";

export class ChatChannelService {
    private static getOp(block: Block, d: ChannelTextType) {
        var op = block.el.querySelector('[data-channel-text-id=\"' + d.id + '\"] .sy-channel-text-item-operators');
        op.classList.add('operating');
        return op;
    }
    static async addEmoji(block: Block, d: ChannelTextType, e: React.MouseEvent) {
        var op = this.getOp(block, d);
        var re = await useOpenEmoji({
            roundArea: Rect.fromEvent(e),
            direction: 'top',
            align: 'end'
        });
        var result = await channel.put('/ws/channel/emoji', {
            elementUrl: getElementUrl(ElementType.RoomChat,
                block.page.pageLayout.type == PageLayoutType.textChannel ? block.page.pageItemId : block.syncBlockId,
                d.id),
            emoji: {
                emojiId: re.code,
                code: re.code
            }
        });
        if (!Array.isArray(d.emojis)) {
            d.emojis = [];
        }
        var em = d.emojis.find(g => g.emojiId == result.data.emoji.emojiId);
        if (em) {
            Object.assign(em, result.data.emoji)
        }
        else d.emojis.push(result.data.emoji);
        op.classList.remove('operating');
        block.view.forceUpdate();
    }
    static editEmoji = lodash.throttle(async (block: Block,
        d: ChannelTextType,
        emoji: { emojiId: string; code?: string; count: number; }) => {
        var result = await channel.put('/ws/channel/emoji', {
            elementUrl: getElementUrl(ElementType.RoomChat,
                block.page.pageLayout.type == PageLayoutType.textChannel ? block.page.pageItemId : block.syncBlockId,
                d.id),
            emoji: {
                emojiId: emoji.emojiId,
                code: emoji.code
            }
        });
        if (!Array.isArray(d.emojis)) {
            d.emojis = [];
        }
        var em = d.emojis.find(g => g.emojiId == result.data.emoji.emojiId);
        if (em) {
            Object.assign(em, result.data.emoji)
        }
        else d.emojis.push(result.data.emoji);
        block.view.forceUpdate();
    }, 1000)
    static async openEdit(block: Block, d: ChannelTextType) {
        var view: ChannelTextView = block.view as ChannelTextView;
        view.editChannelText = d;
        view.forceUpdate();
    }
    static async closeEdit(block: Block, d: ChannelTextType) {
        var view: ChannelTextView = block.view as ChannelTextView;
        view.editChannelText = null;
        view.forceUpdate();
    }
    static async edit(block: ChannelText, d: ChannelTextType, data: { files?: File[], content?: string, reply?: { replyId: string } }) {
        var view: ChannelTextView = block.view as ChannelTextView;
        view.editChannelText = null;
        view.forceUpdate();
        if (data.content) {
            var re = await channel.patch('/ws/channel/patch', {
                id: d.id,
                roomId: block.roomId,
                content: data.content
            });
            if (re.ok) {
                d.content = data.content;
                d.isEdited = true;
                block.view.forceUpdate();
            }
        }
    }
    static async redit(block: Block, d: ChannelTextType) {
        var view: ChannelTextView = block.view as ChannelTextView;
        view.richTextInput.onReplaceInsert(d.content);
    }
    static async reply(block: Block, d: ChannelTextType) {
        var view: ChannelTextView = block.view as ChannelTextView;
        var use = await channel.get('/user/basic', { userid: d.userid });
        var c = TextEle.filterHtml(d.content);
        view.richTextInput.openReply({ text: `回复${use.data.user.name}:${c}`, replyId: d.id })
    }
    static async report(block: Block, d: ChannelTextType) {

    }
    static async del(block: Block, d: ChannelTextType) {
        var op = this.getOp(block, d);
        d.isDeleted = true;
        var r = await channel.del('/ws/channel/cancel', { roomId: block.page.pageItemId, id: d.id });
        op.classList.remove('operating');
        block.view.forceUpdate();
    }
    static async openProperty(block: Block, d: ChannelTextType, event: React.MouseEvent) {
        var op = this.getOp(block, d);
        var items: MenuItem<string>[] = [];
        if (d.userid == block.page.user.id) {
            items.push({ name: 'edit', text: '编辑' });
            items.push({ name: 'delete', text: '删除' });
        }
        else {
            items.push({ name: 'reply', text: '回复' });
            items.push({ name: 'report', disabled: true, text: '举报' });
        }
        var r = await useSelectMenuItem({ roundArea: Rect.fromEvent(event) },
            items
        );
        if (r?.item) {
            if (r.item.name == 'report') {
                await ChatChannelService.report(block, d);
            }
            else if (r.item.name == 'edit') {
                await ChatChannelService.openEdit(block, d)
            }
            else if (r.item.name == 'reply') {
                await ChatChannelService.reply(block, d)
            }
            else if (r.item.name == 'delete') {
                await ChatChannelService.del(block, d);
            }
        }
        op.classList.remove('operating');
    }
}


