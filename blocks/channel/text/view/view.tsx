import lodash from "lodash";
import React, { CSSProperties } from "react";
import { ChannelText } from "..";
import { Edit1Svg, TopicSvg, UnreadTextSvg } from "../../../../component/svgs";
import { useForm } from "../../../../component/view/form/dialoug";
import { Icon } from "../../../../component/view/icon";
import { Markdown } from "../../../../component/view/markdown";
import { Spin } from "../../../../component/view/spin";
import { channel } from "../../../../net/channel";
import { view } from "../../../../src/block/factory/observable";
import { BlockView } from "../../../../src/block/view";
import { TextEle } from "../../../../src/common/text.ele";
import { LinkPageItem, PageLayoutType } from "../../../../src/page/declare";
import { util } from "../../../../util/util";
import { ChannelTextType } from "../declare";
import { RenderChats } from "./chats";
import { ChatInputType, InputChatBox } from "../../../../component/view/input.chat/box";
import { lst } from "../../../../i18n/store";
import { S, Sp } from "../../../../i18n/view";
import { AgentRequest } from "../../../../net/ai/robot";

@view('/channel/text')
export class ChannelTextView extends BlockView<ChannelText>{
    contentEl: HTMLElement;
    async openEdit(event: React.MouseEvent) {
        var pd = this.block.page.getPageDataInfo();
        var model = { text: pd?.text || '', description: pd?.description }
        var f = await useForm({
            head: false,
            fields: [{ name: 'text', text: lst('频道名称'), type: 'input' }, { name: 'description', text: lst('频道描述'), type: 'textarea' }],
            title: lst('编辑讨论话题'),
            remark: '',
            footer: false,
            model: lodash.cloneDeep(model),
            checkModel: async (model) => {
                if (!model.text) return lst('标题不能为空');
            }
        });
        if (f && !lodash.isEqual(f, model)) {
            this.props.block.page.onUpdatePageData({ ...f });
        }
    }
    renderPageTitle() {
        var pd = this.block.page.getPageDataInfo();
        if (this.block.page.pageLayout.type == PageLayoutType.textChannel) {
            return <div className="gap-20 visible-hover">
                <Icon className={'item-hover round cursor'} onMousedown={e => {
                    e.stopPropagation();
                    this.block.page.onChangeIcon(e)
                }} size={72} icon={pd?.icon || TopicSvg}></Icon>
                <div className="h1 flex"><span>{pd?.text || lst('新话题')}</span>{this.block.page.isCanManage && <span className="flex-center round gap-l-5 cursor item-hover flex-line size-24 visible"><Icon onClick={e => this.openEdit(e)} size={18} icon={Edit1Svg}></Icon></span>}</div>
                {pd?.description && <div className="text-1 f-14">
                    <Markdown md={pd?.description}></Markdown>
                </div>}
            </div>
        }
        else return <></>
    }
    async didMount() {
        channel.sync('/page/update/info', this.updatePageInfo);
        await this.block.loadPageInfo();
    }
    updatePageInfo = (r: { id: string, elementUrl: string, pageInfo: LinkPageItem }) => {
        var page = this.props.block.page;
        if (r.elementUrl && page.elementUrl === r.elementUrl || r.id && r.id == r.pageInfo.id) {
            this.forceUpdate();
        }
    }
    willUnmount() {
        channel.off('/page/update/info', this.updatePageInfo);
    }
    async redit(d: ChannelTextType) {
        this.inputChatBox.onReplaceInsert(d.content);
    }
    async reply(d: ChannelTextType) {
        var use = await channel.get('/user/basic', { userid: d.userid });
        var c = TextEle.filterHtml(d.content);
        this.inputChatBox.openReply({ text: lst('回复') + `${use.data.user.name}:${c}`, replyId: d.id })
    }
    inputChatBox: InputChatBox;
    uploadFiles: { id: string, speed: string }[] = [];
    async onRobotInput(data: ChatInputType, options: {
        isAt: boolean,
        replyId?: string,
    }) {
        //机器要指令
        var gr;
        var loadding = false;
        return new Promise(async (resolve, reject) => {
            await AgentRequest(data.robot, data.args.ask, {
                isAt: options.isAt,
            }, async (result) => {
                if (!gr && !loadding) {
                    loadding = true;
                    var cr = await channel.put('/ws/channel/send', {
                        roomId: this.block.roomId,
                        content: result.content,
                        robotId: data.robot.robotId,
                        files: result.files || undefined,
                        replyId: options.replyId
                    })
                    if (cr.data) {
                        var chat: ChannelTextType = {
                            id: cr.data.id,
                            userid: data.robot.robotId,
                            createDate: cr.data.createDate || new Date(),
                            content: result.content,
                            roomId: this.block.roomId,
                            seq: cr.data.seq,
                            files: result.files || [],
                            replyId: options.replyId
                        };
                        this.block.chats.push(chat);
                        if (options.replyId) {
                            chat.reply = this.block.chats.find(g => g.id == options.replyId);
                        }
                        await this.block.setLocalSeq(cr.data.seq);
                        gr = chat;
                        loadding = false;
                        this.forceUpdate(() => this.updateScroll());
                    }
                }
                else {
                    if (result.done) {
                        await channel.patch('/ws/channel/patch', {
                            id: gr.id,
                            roomId: this.block.roomId,
                            content: result.content,
                            isEdited: false,
                            files: result.files || undefined
                        });
                        resolve(true)
                    }
                    var c = this.block.chats.find(g => g.id == gr.id);
                    if (c) {
                        c.content = result.content
                        if (Array.isArray(result.files))
                            c.files = result.files || [];
                        this.forceUpdate(() => this.updateScroll());
                    }
                }
            })
        })
    }
    async onInput(data: ChatInputType) {
        if (data.robot) {
            this.onRobotInput(data, { isAt: false });
        }
        else {
            var re = await channel.put('/ws/channel/send', {
                roomId: this.block.roomId,
                content: data.content,
                files: data.files,
                replyId: data?.replyId || undefined,
                mentions: data.mentions
            })
            if (re.data) {
                var chat: ChannelTextType = {
                    id: re.data.id,
                    userid: this.block.page.user.id,
                    createDate: re.data.createDate || new Date(),
                    content: data.content,
                    roomId: this.block.roomId,
                    seq: re.data.seq,
                    files: data.files,
                    replyId: data?.replyId || undefined
                };
                if (chat.replyId) {
                    chat.reply = this.block.chats.find(b => b.id == chat.replyId);
                }
                this.block.chats.push(chat);
                await this.block.setLocalSeq(re.data.seq);
                this.forceUpdate(() => this.updateScroll());
            }
            if (Array.isArray(data.mentions) && data.mentions.length > 0) {
                var ws = await this.block.page.ws.getWsRobots();
                if (data.mentions.every(c => ws.some(w => w.robotId == c))) {
                    var message = data.content;
                    message = message.replace(/<a[\s]+class\="at-user"[^>]+>@[^@]+<\/a>/, '');
                    message = message.replace(/<\/?[^>]+>/g, "");
                    //@所有机器人
                    var dm = ws.findAll(g => data.mentions.some(c => c == g.robotId));
                    for (let i = 0; i < dm.length; i++) {
                        var robot = dm[i];
                        if (robot.abledCommandModel !== true) {
                            var task = robot.tasks[0];
                            if (task) {
                                await this.onRobotInput({
                                    robot: robot,
                                    task: task,
                                    args: {
                                        'ask': message
                                    }
                                }, { isAt: true, replyId: re.data.id }
                                );
                            }
                        }
                        else {
                            var task = robot.tasks.find(g => g.main == true);
                            if (task) {
                                await this.onRobotInput({
                                    robot: robot,
                                    task: task,
                                    args: {
                                        [task.args[0].name]: message
                                    }
                                }, { isAt: true, replyId: re.data.id }
                                );
                            }
                        }
                    }
                    return;
                }
            }
            if (this.block.page.pageInfo.speak == 'only') {
                this.block.loadHasAbledSend(true);
            }
        }
    }
    renderChats() {
        var style: CSSProperties = {};
        if (this.isPageLayoutTextChannel) {
            style.height = this.block.page.pageVisibleHeight;
            style.position = 'relative';
            // style.overflowY = 'auto';
        }
        return <div style={style}>
            <div onWheel={this.wheel}
                ref={e => this.contentEl = e}
                style={{ height: this.block.page.pageVisibleHeight }}
                className="overflow-y border-box">
                <div className="sy-channel-text-head">
                    {this.block.unreadTip && <div className="sy-channel-text-unread-tip" >
                        <span><Sp text="自{date}来有{count}条消息未读" data={{ count: this.block.unreadTip.count, date: util.showTime(new Date(this.block.unreadTip.date)) }}>自{util.showTime(new Date(this.block.unreadTip.date))}来有{this.block.unreadTip.count}条消息未读</Sp></span>
                        <a onMouseDown={e => this.block.onClearUnread()}><S>标记为已读</S><Icon size={14} icon={UnreadTextSvg}></Icon></a>
                    </div>}
                </div>
                <div className="sy-channel-text-content  padding-b-150 ">
                    {this.block && this.renderPageTitle()}
                    {this.block.pageIndex > 2 && this.block.isLast && <div className="sy-channel-text-tip f-12 remark">无记录了</div>}
                    {this.block.loading && <div className="sy-channel-text-loading"><Spin></Spin></div>}
                    {RenderChats(this.block, {
                        reditChat: (d) => this.redit(d),
                        replyChat: (d) => this.reply(d)
                    })}
                </div>
            </div>
            <div className="sy-channel-text-input" data-shy-page-no-focus onMouseDown={e => e.stopPropagation()}>
                <div className="sy-channel-text-input-wrapper">
                    <InputChatBox
                        ws={this.block.page.ws}
                        disabled={this.block.abledSend && this.block.page.user?.id ? false : true}
                        placeholder={this.block.abledSend && this.block.page.user?.id ? lst("回车提交") : (this.block.page.user?.id ? lst("您不能发言") : lst("请登录发言"))}
                        ref={e => this.inputChatBox = e}
                        onChange={e => this.onInput(e)}
                        searchUser={this.searchUser}
                        searchRobots={this.searchRobot}
                    ></InputChatBox>
                </div>
            </div>
        </div>
    }
    searchUser = async (text: string) => {
        var r = await channel.get('/ws/member/word/query', { word: text, ws: this.block.page.ws });
        if (r.ok) {
            return r.data.list.map(c => {
                return {
                    ...c,
                    id: c.userid,
                }
            }) as any
        }
        else return []
    }
    searchRobot = async () => {
        var g = await this.block.page.ws.getWsRobots();
        return g;
    }
    get isPageLayoutTextChannel() {
        return this.block.page.pageLayout.type == PageLayoutType.textChannel;
    }
    renderView() {
        var style: CSSProperties = this.block.visibleStyle;
        var classList: string[] = ['sy-channel-text'];
        if (this.isPageLayoutTextChannel) {
            delete style.padding;
            delete style.paddingTop;
            delete style.paddingBottom;
            delete style.paddingLeft;
            delete style.paddingRight;
            style.height = this.block.page.pageVisibleHeight;
        }
        return <div className={classList.join(" ")} style={style}>
            {this.renderChats()}
        </div>
    }
    loadding: boolean = false;
    wheel = async (e) => {
        if (this.contentEl && this.contentEl.scrollTop < 60) {
            await this.block.scrollTopLoad();
        }
    }
    async updateScroll() {
        if (this.contentEl) {
            this.contentEl.scrollTop = this.contentEl.scrollHeight + 100;
            await util.delay(300);
            this.contentEl.scrollTop = this.contentEl.scrollHeight + 100;
        }
    }
    editChannelText: ChannelTextType;
    editRichTextInput: InputChatBox;
}


