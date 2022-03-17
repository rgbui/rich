import React, { CSSProperties } from "react";
import { ChannelText } from "..";
import { RichTextInput } from "../../../../component/view/rich.input";
import { channel } from "../../../../net/channel";
import { view } from "../../../../src/block/factory/observable";
import { BlockView } from "../../../../src/block/view";
import { PageLayoutType } from "../../../../src/layout/declare";
import { renderChannelTextContent } from "./content";

@view('/channel/text')
export class ChannelTextView extends BlockView<ChannelText>{
    renderHead() {
        return <div className="sy-channel-text-head"></div>
    }
    renderContent() {
        return <div className="sy-channel-text-content">
            {renderChannelTextContent(this.block)}
        </div>
    }
    renderInput() {
        return <div className="sy-channel-text-input" data-shy-page-no-focus onMouseDown={e => e.stopPropagation()}>
            <RichTextInput popOpen={e => this.popOpen(e)} onInput={e => this.onInput(e)} ></RichTextInput>
        </div>
    }
    popOpen(cs: { char: string, span: HTMLElement }) {

    }
    async onInput(data: { files?: File[], content?: string }) {
        if (data.content) {
            var re = await channel.put('/ws/channel/send', {
                roomId: this.block.roomId,
                content: data.content,
            });
            if (re.data) {
                this.block.chats.push({
                    id: re.data.id,
                    userid: this.block.page.user.id,
                    createDate: re.data.createDate || new Date(),
                    content: data.content,
                    roomId: this.block.roomId,
                    seq: re.data.seq
                });
                this.forceUpdate();
            }
        }
    }
    render() {
        var style: CSSProperties = this.block.visibleStyle;
        if (this.block.page.pageLayout.type == PageLayoutType.textChannel) {
            style.minHeight = this.block.page.pageVisibleHeight - 30;
        }
        return <div className='sy-channel-text' style={style}>
            {this.renderHead()}
            {this.renderContent()}
            {this.renderInput()}
        </div>
    }
}