import React, { CSSProperties } from "react";
import { ChannelText } from "..";
import { UnreadTextSvg } from "../../../../component/svgs";
import { Icon } from "../../../../component/view/icon";
import { RichTextInput } from "../../../../component/view/rich.input";
import { channel } from "../../../../net/channel";
import { view } from "../../../../src/block/factory/observable";
import { BlockView } from "../../../../src/block/view";
import { util } from "../../../../util/util";
import { ChannelTextType } from "../declare";
import { RenderChannelTextContent } from "./content";

@view('/channel/text')
export class ChannelTextView extends BlockView<ChannelText>{
    renderHead() {
        return <div className="sy-channel-text-head">
            {this.block.unreadTip && <div className="sy-channel-text-unread-tip" >
                <span>自{util.showTime(new Date(this.block.unreadTip.date))}来有{this.block.unreadTip.count}条消息未读</span>
                <a onMouseDown={e =>this.block.onClearUnread()}>标记为已读<Icon size={14} icon={UnreadTextSvg}></Icon></a>
            </div>}
        </div>
    }
    contentEl: HTMLElement;
    renderContent() {
        return <div className="sy-channel-text-content" ref={e => this.contentEl = e}>
            {RenderChannelTextContent(this.block)}
        </div>
    }
    richTextInput: RichTextInput;
    renderInput() {
        return <div className="sy-channel-text-input" data-shy-page-no-focus onMouseDown={e => e.stopPropagation()}>
            <RichTextInput ref={e => this.richTextInput = e} placeholder="回车提交" popOpen={e => this.popOpen(e)} onInput={e => this.onInput(e)} ></RichTextInput>
        </div>
    }
    popOpen(cs: { char: string, span: HTMLElement }) {

    }
    async onInput(data: { files?: File[], content?: string, reply?: { replyId: string } }) {
        if (data.content) {
            var re = await channel.put('/ws/channel/send', {
                roomId: this.block.roomId,
                content: data.content,
                replyId: data.reply?.replyId || undefined
            })
            if (re.data) {
                var chat: ChannelTextType = {
                    id: re.data.id,
                    userid: this.block.page.user.id,
                    createDate: re.data.createDate || new Date(),
                    content: data.content,
                    roomId: this.block.roomId,
                    seq: re.data.seq,
                    replyId: data.reply?.replyId || undefined
                };
                if (chat.replyId) {
                    chat.reply = this.block.chats.find(b => b.id == chat.replyId);
                }
                this.block.chats.push(chat);
                this.forceUpdate(() => this.updateScroll());
            }
        }
        else if (data.files) {
            for (let i = 0; i < data.files.length; i++) {
                var file = data.files[i];
                var d = await channel.post('/ws/upload/file', {
                    file: file,
                    uploadProgress: (event) => {
                        console.log(event, 'ev');
                    }
                });
                if (d) {
                    var re = await channel.put('/ws/channel/send', {
                        roomId: this.block.roomId,
                        file: d.data.file
                    });
                    if (re.data) {
                        this.block.chats.push({
                            id: re.data.id,
                            userid: this.block.page.user.id,
                            createDate: re.data.createDate || new Date(),
                            file: d.data.file,
                            roomId: this.block.roomId,
                            seq: re.data.seq
                        });
                        this.forceUpdate(() => this.updateScroll());
                    }
                }
                await util.delay(20)
            }
        }
    }
    render() {
        var style: CSSProperties = this.block.visibleStyle;
        return <div className='sy-channel-text' style={style}>
            {this.renderHead()}
            {this.renderContent()}
            {this.renderInput()}
        </div>
    }
    updateScroll() {
        if (this.contentEl) {
            console.log('scrollTop', this.contentEl.scrollTop);
            this.contentEl.scrollTop = this.contentEl.scrollHeight + 100;
            setTimeout(() => {
                console.log('scrollTop1', this.contentEl.scrollTop);
                this.contentEl.scrollTop = this.contentEl.scrollHeight + 100;
            }, 300);
        }
    }
    editChannelText: ChannelTextType;
    editRichTextInput: RichTextInput;
}