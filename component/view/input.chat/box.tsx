import React from "react";
import { Icon } from "../icon";
import { AiSvg, CloseSvg, EmojiSvg, FileSvg, PlusSvg, TrashSvg, UploadSvg } from "../../svgs";
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
    disabledInputQuote?: boolean
    className?: string[] | string,
    searchRobots?: () => Promise<RobotInfo[]>,
}>{
    el: HTMLElement;
    render(): React.ReactNode {
        var richClassList: string[] = ["shy-rich-input-editor"];
        if (this.props.className) {
            if (Array.isArray(this.props.className)) richClassList.push(...this.props.className)
            else richClassList.push(this.props.className)
        }
        var width = 120;
        var height = 160;
        return <div className="shy-rich-input" ref={e => this.el = e}>
            {this.uploadFiles.length > 0 && <div className="shy-rich-input-files round-16 flex" style={{
                left: -10,
                right: -10,
                height: height + 20,
                top: (0 - (height + 30 + 1))
            }}>
                {this.uploadFiles.map(uf => {
                    return <div key={uf.id} className="relative visible-hover item-hover border round-16 overflow-hidden gap-w-10" style={{ width, height }}>
                        {uf.speed && <div
                            style={{ width, height }}
                            className="flex-center overflow-hidden">
                            <span>{uf.speed}</span>
                        </div>}
                        {uf.file?.mime == 'image' && <img
                            style={{
                                width,
                                height,
                                objectFit: 'contain',
                                objectPosition: '50% 50%'
                            }}
                            src={uf.file.url} />}
                        {uf.file?.mime && <div className="flex-center remark flex-col " style={{ width, height }}>
                            <Icon size={48} icon={FileSvg}></Icon>
                            <span>{uf.file?.name}<span className="gap-l-5">{util.byteToString(uf?.file.size)}</span></span>
                        </div>}
                        <div className="pos bg-white item-hover flex-center round visible cursor size-20" style={{ top: 10, right: 10 }} onClick={e => {
                            lodash.remove(this.uploadFiles, g => g == uf)
                            this.forceUpdate()
                        }} ><Icon size={16} icon={TrashSvg}></Icon></div>
                    </div>
                })}
            </div>}
            {this.reply && <div className="shy-rich-input-reply">
                <span className="shy-rich-input-reply-content">{this.reply.text}</span>
                <ToolTip overlay={lst('取消回复')}><span className="shy-rich-input-reply-operators" onMouseDown={e => this.clearReply()}><a><Icon size={12} icon={CloseSvg}></Icon></a></span></ToolTip>
            </div>}
            {this.errorTip && <div className="shy-rich-input-error">
                <span className="shy-rich-input-error-content">{this.errorTip}</span>
                <ToolTip overlay={lst('清理错误提示')}><span className="shy-rich-input-error-operators" onMouseDown={e => this.clearError()}><a><Icon size={12} icon={CloseSvg}></Icon></a></span></ToolTip>
            </div>}
            <div className="flex flex-top">
                <span className="flex-fixed size-24 round flex-center cursor item-hover">
                    {this.cp?.currentRobot && <Avatar size={24} userid={this.cp.currentRobot.robotId}></Avatar>}
                    {!this.cp?.currentRobot && <Icon onMousedown={e => this.openAddFile(e)} size={18} icon={PlusSvg}></Icon>}
                </span>
                <div className="flex-auto l-24" >
                    <ChatInput
                        box={this}
                        ref={e => this.cp = e}
                        placeholder={this.props.placeholder}
                        onPasteFiles={e => this.onUploadFiles(e)}
                        disabled={this.props.disabled}
                        readonly={this.props.readonly}
                        height={this.props.height}
                        value={this.props.value}
                        onInput={e => { }}
                        allowNewLine={this.props.allowNewLine}
                        spellCheck={this.props.spellCheck}
                        onEnter={e => { this.onEnter() }}
                        searchUser={this.props.searchUser}
                        disabledInputQuote={this.props.disabledInputQuote}
                        searchRobots={this.props.searchRobots}
                    ></ChatInput>
                </div>
                <ToolTip overlay={lst('添加表情')}><span className="flex-fixed size-24 round flex-center cursor item-hover"><Icon size={18} onMousedown={e => this.openEmoji(e)} icon={EmojiSvg}></Icon></span></ToolTip>
            </div>
        </div>
    }
    cp: ChatInput;
    async openAddFile(event: React.MouseEvent) {
        if (this.props.disabled) return;
        if (this.props.readonly) return;
        var menus: MenuItem<string>[] = [
            { name: 'addFile', text: lst('上传附件'), icon: UploadSvg }
        ]
        if (typeof this.props.searchRobots == 'function') {
            menus.push({ type: MenuItemType.divide });
            menus.push({ name: 'addRobot', text: lst('机器人指令'), icon: AiSvg });
        }
        var re = await useSelectMenuItem({ roundArea: Rect.fromEvent(event) }, menus);
        if (re) {
            if (re.item.name == 'addFile') {
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
            else if (re?.item?.name == 'addRobot') {
                this.cp.onCommandInput()
            }
        }
    }
    async openEmoji(event: React.MouseEvent) {
        if (this.props.disabled) return;
        if (this.props.readonly) return;
        this.cp.rememberCursor();
        var re = await useOpenEmoji({
            roundArea: Rect.fromEvent(event),
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
                fr.speed = `${file.name}-`+lst('上传成功');
                var g = lodash.cloneDeep(d.data.file) as any;
                g.text = g.name;
                delete g.name;
                fr.file = { name: 'upload', ...g }
            }
            else {
                fr.speed = `${file.name}-`+lst('上传失败');
                this.openEror(`${file.name}-`+lst('上传失败'))
                this.forceUpdate();
                await util.delay(3e3);
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
}