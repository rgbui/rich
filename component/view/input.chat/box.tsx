import React from "react";
import { Icon } from "../icon";
import { AiSvg, CloseSvg, EmojiSvg, FileSvg, PublishSvg, TrashSvg, UploadSvg } from "../../svgs";
import { ChatInput } from "./chat";
import { useOpenEmoji } from "../../../extensions/emoji";
import { Rect } from "../../../src/common/vector/point";
import { InsertSelectionText } from "./util";
import { util } from "../../../util/util";
import { OpenMultipleFileDialoug } from "../../file";
import { useSelectMenuItem } from "../menu";
import { RobotInfo, RobotTask, UserBasic } from "../../../types/user";
import { channel } from "../../../net/channel";
import { ResourceArguments } from "../../../extensions/icon/declare";
import lodash from "lodash";
import { MenuItem, MenuItemType } from "../menu/declare";
import { Avatar } from "../avator/face";
import { ToolTip } from "../tooltip";
import { lst } from "../../../i18n/store";
import { LinkWs } from "../../../src/page/declare";
import { S } from "../../../i18n/view";

export type ChatInputType = {
    content?: string,
    isQuote?: boolean,
    files?: ResourceArguments[],
    replyId?: string,
    mentions?: string[],
    robot?: RobotInfo;
    task?: RobotTask;
    args?: Record<string, any>;
}

export class InputChatBox extends React.Component<{
    userid?: string,
    placeholder?: string;
    disabled?: boolean,
    readonly?: boolean,
    height?: number,
    value?: string,
    onChange?: (ct: ChatInputType) => void,
    allowNewLine?: boolean,
    spellCheck?: boolean,
    onEnter?: (ct: ChatInputType) => void,
    searchUser?: (word?: string) => Promise<UserBasic[]>,
    disabledInputQuote?: boolean,
    disabledUploadFiles?: boolean,
    disabledTextStyle?: boolean,
    disabledRobot?: boolean,
    className?: string[] | string,
    searchRobots?: () => Promise<RobotInfo[]>,
    ws?: LinkWs,
    disabledUsers?: boolean,
    display?: 'channel' | 'comment' | 'redit'
}> {
    el: HTMLElement;
    render() {
        var richClassList: string[] = ["shy-rich-input-editor"];
        if (this.props.className) {
            if (Array.isArray(this.props.className)) richClassList.push(...this.props.className)
            else richClassList.push(this.props.className)
        }
        var width = 120;
        var height = 160;

        return <div className="shy-rich-input" style={{
            zIndex: this.props.display == 'comment' ? 100 : 0
        }} ref={e => this.el = e}>
            {this.uploadFiles.length > 0 && <div className="shy-rich-input-files bg-white-1 round-16 flex" style={{
                left: -10,
                right: -10,
                height: height + 20,
                top: (0 - (height + 20 + (this.props.display == 'comment' ? 0 : 10) + 1))
            }}>
                {this.uploadFiles.map(uf => {
                    return <div key={uf.id} className="relative visible-hover item-hover border-light shadow-s round-16 overflow-hidden gap-w-10" style={{ width, height }}>
                        {uf.speed && <div
                            style={{ width, height }}
                            className="flex-center overflow-hidden">
                            <span className="f-14">{uf.speed}</span>
                        </div>}
                        {uf.file?.mime == 'image' && <img
                            className="object-center w100 h100"
                            src={uf.file.url} />}
                        {uf.file?.mime && <div className="flex-center remark flex-col " style={{ width, height }}>
                            <Icon size={48} icon={FileSvg}></Icon>
                            <span className="gap-10 text-overflow">{uf.file?.filename}<span className="gap-l-5 f-12 remark">{util.byteToString(uf?.file.size)}</span></span>
                        </div>}
                        <div className="pos item-hover-button flex-center round visible cursor size-20" style={{ top: 10, right: 10 }} onClick={e => {
                            lodash.remove(this.uploadFiles, g => g == uf)
                            this.forceUpdate()
                        }} ><Icon size={16} icon={TrashSvg}></Icon></div>
                    </div>
                })}
            </div>}
            {this.reply && <div className="shy-rich-input-reply flex padding-w-10 bg-white-1">
                <span className="shy-rich-input-reply-content f-12 flex-auto text-overflow">{(this.reply.text || "").slice(0, 50)}</span>
                <ToolTip overlay={lst('取消回复')}><span className="shy-rich-input-reply-operators flex-fixed flex-center cursor size-20 item-hover round" onMouseDown={e => this.clearReply()}><Icon size={12} icon={CloseSvg}></Icon></span></ToolTip>
            </div>}
            {this.errorTip && <div className="shy-rich-input-error bg-white-1">
                <span className="shy-rich-input-error-content">{this.errorTip}</span>
                <ToolTip overlay={lst('清理错误提示')}><span className="shy-rich-input-error-operators" onMouseDown={e => this.clearError()}><a><Icon size={12} icon={CloseSvg}></Icon></a></span></ToolTip>
            </div>}
            {this.renderRichInput()}
        </div>
    }
    renderRichInput() {
        if (this.props.display == 'comment') {
            return <div className="flex flex-top">
                <span className="flex-fixed size-24 round flex-center cursor">
                    {this.props.userid && <Avatar size={24} userid={this.props.userid}></Avatar>}
                </span>
                <div className="flex-auto l-24" >
                    <ChatInput
                        box={this}
                        ref={e => this.cp = e}
                    ></ChatInput>
                </div>
                <ToolTip overlay={lst('添加表情')}><span className="flex-fixed size-24 gap-l-5 round flex-center cursor item-hover"><Icon size={16} onMousedown={e => this.openEmoji(e)} icon={EmojiSvg}></Icon></span></ToolTip>
                {this.props.disabledUploadFiles !== true && <ToolTip overlay={lst('添加附件')}><span className="flex-fixed size-24  gap-l-5 round flex-center cursor item-hover"><Icon size={16} onMousedown={e => this.onAddFile()} icon={UploadSvg}></Icon></span></ToolTip>}
                <ToolTip overlay={<div>
                    <div className="flex"><span style={{ color: '#bbb' }}>Enter</span><span className="gap-l-5"><S>发送</S></span></div>
                    <div className="flex"><span style={{ color: '#bbb' }}>Shift+Enter</span><span className="gap-l-5"><S>换行</S></span></div>
                </div>}><span className="flex-fixed size-24 gap-l-5 round flex-center cursor item-hover"><Icon size={16} onMousedown={e => this.onEnter()} icon={PublishSvg}></Icon></span></ToolTip>
            </div>
        }
        else if (this.props.display == 'redit') {
            return <ChatInput
                box={this}
                ref={e => this.cp = e}
            ></ChatInput>
        }
        else {
            return <div className="flex flex-top">
                <span className="flex-fixed size-24 round flex-center cursor item-hover">
                    {this.cp?.currentRobot && <Avatar size={24} userid={this.cp.currentRobot.robotId}></Avatar>}
                    {!this.cp?.currentRobot && <Icon onMousedown={e => this.openCommand(e)} size={18} icon={{ name: 'byte', code: 'add-one' }}></Icon>}
                </span>
                <div className="flex-auto l-24" >
                    <ChatInput
                        box={this}
                        ref={e => this.cp = e}
                    ></ChatInput>
                </div>
                <ToolTip overlay={lst('添加表情')}><span className="flex-fixed size-24 round flex-center cursor item-hover"><Icon size={18} onMousedown={e => this.openEmoji(e)} icon={EmojiSvg}></Icon></span></ToolTip>
            </div>
        }
    }
    cp: ChatInput;
    async openCommand(event: React.MouseEvent) {
        if (this.props.disabled) return;
        if (this.props.readonly) return;
        var menus: MenuItem<string>[] = [
            { name: 'addFile', text: lst('上传附件'), icon: UploadSvg }
        ]
        if (typeof this.props.searchRobots == 'function') {
            menus.push({ type: MenuItemType.divide });
            menus.push({ name: 'addRobot', text: lst('机器人指令'), icon: AiSvg });
        }
        var re = await useSelectMenuItem({ roundArea: Rect.fromEle(event.currentTarget as HTMLElement) }, menus);
        if (re) {
            if (re.item.name == 'addFile') {
                this.onAddFile();
            }
            else if (re?.item?.name == 'addRobot') {
                this.cp.onCommandInput()
            }
        }
    }
    async onAddFile() {
        var files = await OpenMultipleFileDialoug();
        var size = 1024 * 1024 * 1024;
        var rs = files.filter(g => g.size > size);
        if (rs.length > 0) {
            this.openEror(`${rs.map(r => r.name + `(${util.byteToString(r.size)})`).join(",")}${lst('文件大于1G,暂不支持上传')}`)
        }
        files = files.filter(g => g.size <= size);
        if (files.length > 0) {
            this.onUploadFiles(files);
        }
    }
    async openEmoji(event: React.MouseEvent) {
        if (this.props.disabled) return;
        if (this.props.readonly) return;
        this.cp.rememberCursor();
        var re = await useOpenEmoji({
            roundArea: Rect.fromEle((event.currentTarget as HTMLElement).parentNode as HTMLElement),
            direction: 'top',
            align: 'end'
        });
        setTimeout(() => {
            this.cp.setCursor();
            if (re) {
                InsertSelectionText(re.code);
            }
        }, 100);
    }
    reply: { text: string, replyId: string }
    openReply(reply: { text: string, replyId: string }) {
        this.reply = reply;
        this.cp.rememberCursor();
        this.forceUpdate(() => {
            this.cp.setCursor()
        })
    }
    clearReply() {
        if (this.reply) {
            this.reply = null;
            this.cp.rememberCursor();
            this.forceUpdate(() => {
                this.cp.setCursor()
            })
        }
    }
    errorTip: string = '';
    clearError() {
        if (this.errorTime) { clearTimeout(this.errorTime); this.errorTime = null; }
        this.errorTip = '';
        this.cp.rememberCursor();
        this.forceUpdate(() => {
            this.cp.setCursor()
        })
    }
    errorTime
    openEror(error: string) {
        this.errorTip = error;
        this.cp.rememberCursor();
        this.forceUpdate(() => {
            this.cp.setCursor()
        })
        if (this.errorTime) { clearTimeout(this.errorTime); this.errorTime = null; }
        this.errorTime = setTimeout(() => {
            if (this.errorTime) { clearTimeout(this.errorTime); this.errorTime = null; }
            this.clearError();
        }, 10e3);
    }
    onReplaceInsert(value: any) {
        this.cp.richEl.innerHTML = value;
    }
    async onUploadFiles(files: File[]) {
        for (let i = 0; i < files.length; i++) {
            var id = util.guid();
            var file = files[i];
            var fr: ArrayOf<InputChatBox['uploadFiles']> = { id, size: file.size, text: file.name, speed: `${file.name}-准备上传中...` };
            this.uploadFiles.push(fr);
            if (this.props.ws) {
                var d = await channel.post('/ws/upload/file', {
                    file,
                    uploadProgress: (event) => {
                        if (event.lengthComputable) {
                            fr.speed = `${file.name}-${util.byteToString(event.total)}(${(100 * event.loaded / event.total).toFixed(2)}%)`;
                            this.forceUpdate()
                        }
                    }
                });
                if (d.ok) {
                    fr.speed = `${file.name}-` + lst('上传成功');
                    var g = lodash.cloneDeep(d.data.file) as any;
                    g.text = g.name;
                    delete g.name;
                    fr.file = { name: 'upload', ...g }
                }
                else {
                    fr.speed = `${file.name}-` + lst('上传失败');
                    this.openEror(`${file.name}-` + lst('上传失败'))
                    this.forceUpdate();
                    await util.delay(3e3);
                }
            }
            else {
                var dc = await channel.post('/user/upload/file', {
                    file,
                    uploadProgress: (event) => {
                        if (event.lengthComputable) {
                            fr.speed = `${file.name}-${util.byteToString(event.total)}(${(100 * event.loaded / event.total).toFixed(2)}%)`;
                            this.forceUpdate()
                        }
                    }
                })
                if (dc.ok) {
                    fr.speed = `${file.name}-` + lst('上传成功');
                    var g = lodash.cloneDeep(dc.data.file) as any;
                    g.text = g.name;
                    delete g.name;
                    fr.file = { name: 'upload', ...g }
                }
                else {
                    fr.speed = `${file.name}-` + lst('上传失败');
                    this.openEror(`${file.name}-` + lst('上传失败'))
                    this.forceUpdate();
                    await util.delay(3e3);
                }
            }
            fr.speed = ``;
            this.forceUpdate()
            await util.delay(20)
        }
    }
    uploadFiles: {
        text?: string,
        file?: ResourceArguments,
        speed?: string,
        size?: number,
        id?: string
    }[] = [];
    onEnter() {
        this.props.onChange({
            content: this.cp.getValue(),
            isQuote: this.cp.isQuote,
            replyId: this.reply ? this.reply.replyId : null,
            files: this.uploadFiles.filter(g => g.file ? true : false).map(f => f.file),
            mentions: this.cp.getMentionUsers(),
            ...this.cp.getCommandValue()
        })
        this.reply = null;
        this.cp.isQuote = false;
        this.cp.richEl.innerHTML = '';
        var sel = window.getSelection();
        sel.collapse(this.cp.richEl, 0);
        this.uploadFiles = [];
        this.cp.currentCommand = null;
        this.cp.currentRobot = null;
        this.forceUpdate()
    }
    componentDidUpdate(prevProps: Readonly<{ placeholder?: string; disabled?: boolean; readonly?: boolean; height?: number; value?: string; onChange?: (ct: ChatInputType) => void; allowNewLine?: boolean; spellCheck?: boolean; onEnter?: (ct: ChatInputType) => void; searchUser?: (word: string) => Promise<UserBasic[]>; disabledInputQuote?: boolean; className?: string[] | string; searchRobots?: () => Promise<RobotInfo[]>; }>, prevState: Readonly<{}>, snapshot?: any): void {
        if (this.props.disabled != prevProps.disabled) {
            this.forceUpdate()
        }
    }
    onFocus() {
        if (this.cp) {
            this.cp.onFocus()
        }
    }
}