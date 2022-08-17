import lodash from "lodash";
import React, { CSSProperties } from "react";
import { ChannelText } from "..";
import { EditSvg, UnreadTextSvg } from "../../../../component/svgs";
import { useForm } from "../../../../component/view/form/dialoug";
import { Icon } from "../../../../component/view/icon";
import { Loading } from "../../../../component/view/loading";
import { RichTextInput } from "../../../../component/view/rich.input";
import { Remark } from "../../../../component/view/text";
import { LinkPageItem } from "../../../../extensions/at/declare";
import { useIconPicker } from "../../../../extensions/icon";
import { channel } from "../../../../net/channel";
import { view } from "../../../../src/block/factory/observable";
import { BlockView } from "../../../../src/block/view";
import { Rect } from "../../../../src/common/vector/point";
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
    async openEdit(event: React.MouseEvent) {
        var f = await useForm({
            fields: [{ name: 'text', text: '标题', type: 'input' }, { name: 'description', text: '描述', type: 'textarea' }],
            title: '编辑讨论话题',
            remark: '',
            model: { text: this.block.pageInfo?.text||'新页面', description: this.block.pageInfo?.description },
            checkModel: async (model) => {
                if (!model.text) return '标题不能为空';
            }
        });
        if (f) {
            channel.air('/page/update/info', { id: this.block.page.pageInfo?.id, pageInfo: { ...f } })
        }
    }
    renderPageTitle() {
        var self = this;
        async function changeIcon(event: React.MouseEvent) {
            event.stopPropagation();
            var icon = await useIconPicker({ roundArea: Rect.fromEvent(event) });
            if (typeof icon != 'undefined') {
                channel.air('/page/update/info', { id: self.block.page.pageInfo?.id, pageInfo: { icon } })
            }
        }
        if (this.block.page.pageLayout.type == PageLayoutType.textChannel) {
            return <div className="gap-20 visible-hover">
                <Icon className={'item-hover round cursor'} onMousedown={e => changeIcon(e)} size={72} icon={this.block?.pageInfo?.icon}></Icon>
                <div className="h2 flex"><span>{this.block?.pageInfo?.text || '新页面'}</span><span className="flex-center round gap-l-5 cursor item-hover flex-line size-24 visible"><Icon onClick={e => this.openEdit(e)} size={18} icon={EditSvg}></Icon></span></div>
                <div className="text">{this.block.pageInfo?.description}</div>
            </div>
        }
        else return <></>
    }
    async didMount() {
        channel.sync('/page/update/info', this.updatePageInfo);
        await this.block.loadPageInfo();
    }
    updatePageInfo = (r: { id: string, pageInfo: LinkPageItem }) => {
        var { id, pageInfo } = r;
        if (this.block.pageInfo?.id == id && id) {
            var isUpdate: boolean = false;
            if (typeof pageInfo.text != 'undefined' && pageInfo.text != this.block.pageInfo.text) {
                this.block.pageInfo.text = pageInfo.text;
                isUpdate = true;
            }
            if (typeof pageInfo.description != 'undefined' && pageInfo.description != this.block.pageInfo.description) {
                this.block.pageInfo.description = pageInfo.description;
                isUpdate = true;
            }
            if (typeof pageInfo.icon != 'undefined' && !lodash.isNull(pageInfo.icon) && JSON.stringify(pageInfo.icon) != JSON.stringify(this.block.pageInfo.icon)) {
                this.block.pageInfo.icon = lodash.cloneDeep(pageInfo.icon);
                isUpdate = true;
            }
            if (isUpdate) {
                this.forceUpdate();
            }
        }
    }
    willUnmount() {
        channel.off('/page/update/info', this.updatePageInfo);
    }
    renderContent() {
        return <div className="sy-channel-text-content" onWheel={this.wheel} ref={e => this.contentEl = e}>
            {this.block&& this.renderPageTitle()}
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
                            this.forceUpdate()
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
        if (this.contentEl && this.contentEl.scrollTop < 60) {
            await this.block.scrollTopLoad();
        }
    }
    updateScroll() {
        if (this.contentEl) {
            this.contentEl.scrollTop = this.contentEl.scrollHeight + 100;
            setTimeout(() => {
                this.contentEl.scrollTop = this.contentEl.scrollHeight + 100;
            }, 300);
        }
    }
    editChannelText: ChannelTextType;
    editRichTextInput: RichTextInput;
}


