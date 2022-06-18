import React, { CSSProperties } from "react";
import { ChannelText } from "..";
import { UnreadTextSvg } from "../../../../component/svgs";
import { Icon } from "../../../../component/view/icon";
import { Loading } from "../../../../component/view/loading";
import { RichTextInput } from "../../../../component/view/rich.input";
import { Remark } from "../../../../component/view/text";
import { channel } from "../../../../net/channel";
import { view } from "../../../../src/block/factory/observable";
import { BlockView } from "../../../../src/block/view";
import { PageLayoutType } from "../../../../src/page/declare";
import { util } from "../../../../util/util";
import { ChannelTextType } from "../declare";
import { RenderChannelTextContent } from "./content";

@view('/channel/text')
export class ChannelTextView extends BlockView<ChannelText>{
    renderHead() {
        return <div className="sy-channel-text-head">
            {this.block.unreadTip && <div className="sy-channel-text-unread-tip" >
                <span>自{util.showTime(new Date(this.block.unreadTip.date))}来有{this.block.unreadTip.count}条消息未读</span>
                <a onMouseDown={e => this.block.onClearUnread()}>标记为已读<Icon size={14} icon={UnreadTextSvg}></Icon></a>
            </div>}
        </div>
    }
    contentEl: HTMLElement;
    renderContent() {
        return <div className="sy-channel-text-content" onWheel={this.wheel} ref={e => this.contentEl = e}>
            {this.block.pageIndex > 2 && this.block.isLast && <div className="sy-channel-text-tip"><Remark>无记录了</Remark></div>}
            {this.block.loading && <div className="sy-channel-text-loading"><Loading></Loading></div>}
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
    uploadFiles: { id: string, speed: string }[] = [];
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
                await this.block.setLocalSeq(re.data.seq);
                this.forceUpdate(() => this.updateScroll());
            }
        }
        else if (data.files) {
            for (let i = 0; i < data.files.length; i++) {
                var id = util.guid();
                var file = data.files[i];
                var fr = { id, speed: `${file.name}-读取中...` };
                this.uploadFiles.push(fr);
                this.forceUpdate(() => this.updateScroll());
                var d = await channel.post('/ws/upload/file', {
                    file,
                    uploadProgress: (event) => {
                        if (event.lengthComputable) {
                            fr.speed = `${file.name}-${util.byteToString(event.total)}(${(100 * event.loaded / event.total).toFixed(2)}%)`;
                            this.forceUpdate();
                        }
                    }
                });
                if (d) {
                    fr.speed = `${file.name}-上传完成`;
                    this.forceUpdate();
                    var re = await channel.put('/ws/channel/send', {
                        roomId: this.block.roomId,
                        file: d.data.file
                    });
                    if (re.data) {
                        this.uploadFiles.remove(g => g.id == fr.id);
                        this.block.chats.push({
                            id: re.data.id,
                            userid: this.block.page.user.id,
                            createDate: re.data.createDate || new Date(),
                            file: d.data.file,
                            roomId: this.block.roomId,
                            seq: re.data.seq
                        });
                        await this.block.setLocalSeq(re.data.seq);
                        this.forceUpdate(() => this.updateScroll());
                    }
                }
                await util.delay(20)
            }
        }
    }
    render() {
        var style: CSSProperties = this.block.visibleStyle;
        if (this.block.page.pageLayout.type == PageLayoutType.textChannel) {
            delete style.padding;
        }
        return <div className='sy-channel-text' style={style}>
            {this.renderHead()}
            {this.renderContent()}
            {this.renderInput()}
        </div>
    }
    loadding: boolean = false;
    wheel = async (e) => {
        if (this.block.el && this.block.el.scrollTop < 60) {
            await this.block.scrollTopLoad();
        }
    }
    updateScroll() {
        if (this.contentEl) {
            console.log('scrollTop', this.contentEl.scrollTop);
            this.contentEl.scrollTop = this.contentEl.scrollHeight + 100;
            setTimeout(() => {
                console.log('scrollTop1', this.contentEl.scrollTop);
                this.contentEl.scrollTop = this.contentEl.scrollHeight + 100;
                console.log('scrollTop3', this.contentEl.scrollTop);
            }, 300);
        }
    }
    editChannelText: ChannelTextType;
    editRichTextInput: RichTextInput;
}