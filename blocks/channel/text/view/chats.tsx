import React from "react";
import { ChannelText } from "..";
import { ViewChats } from "../../../../extensions/chats";
import { EmojiCode } from "../../../../extensions/emoji/store";
import { channel } from "../../../../net/channel";
import { getElementUrl, ElementType } from "../../../../net/element.type";
import { PageLayoutType } from "../../../../src/page/declare";
import { ChannelTextType } from "../declare";

export function RenderChats(
    block: ChannelText,
    props: {
        reditChat(d: ChannelTextType): any,
        replyChat(d: ChannelTextType): any
    }) {
    var delChat = async (d: ChannelTextType) => {
        var r = await channel.del('/ws/channel/cancel', { roomId: block.page.pageInfo?.id, id: d.id });
        block.view.forceUpdate();
        return r;
    }
    var emojiChat = async (d: ChannelTextType, re: Partial<EmojiCode>) => {
        return await channel.put('/ws/channel/emoji', {
            elementUrl: getElementUrl(ElementType.RoomChat,
                block.page.pageLayout.type == PageLayoutType.textChannel ? block.page.pageInfo.id : block.syncBlockId,
                d.id
            ),
            emoji: {
                emojiId: re.code,
                code: re.code
            }
        });
    }
    var patchChat = async (d: ChannelTextType, data: { content: string }) => {
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
        return re;
    }
    var reportChat = async (d: ChannelTextType) => {

    }
    return <ViewChats
        user={block.page.user}
        chats={block.chats}
        redit={props.reditChat}
        delChat={delChat}
        emojiChat={emojiChat}
        patchChat={patchChat}
        reportChat={reportChat}
        replyChat={props.replyChat}
    >
    </ViewChats>
}