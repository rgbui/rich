import dayjs from "dayjs";
import React from "react";
import { ChannelText } from "..";
import { DotsSvg, Emoji1Svg, ReplySvg, Edit1Svg, FileIconSvg, DownloadSvg } from "../../../../component/svgs";
import { Avatar } from "../../../../component/view/avator/face";
import { UserBox } from "../../../../component/view/avator/user";
import { Icon } from "../../../../component/view/icon";
import { Loading } from "../../../../component/view/loading";
import { RichTextInput } from "../../../../component/view/rich.input";
import { Remark } from "../../../../component/view/text";
import { autoImageUrl } from "../../../../net/element.type";
import { util } from "../../../../util/util";
import { ChannelTextType } from "../declare";
import { ChatChannelService } from "./service";
import { ChannelTextView } from "./view";

export function RenderChannelTextContent(block: ChannelText) {
    var dm = block.chats.sort((x, y) => {
        if (x.createDate.getTime() > y.createDate.getTime()) return 1
        else return -1;
    });
    var view: ChannelTextView = block.view as ChannelTextView;
    function renderContent(d: ChannelTextType) {
        if (d.file) {
            if (d.file.mime == 'image') {
                return <div className='shy-user-channel-chat-image' >
                    <img src={autoImageUrl(d.file.url, 500)} />
                </div>
            }
            else if (d.file.mime == 'video') {
                return <div className='shy-user-channel-chat-video' >
                    <video controls src={d.file.url}></video>
                </div>
            }
            else return <div className='shy-user-channel-chat-file' >
                <div className="shy-user-channel-chat-file-content">
                    <Icon size={40} icon={FileIconSvg}></Icon>
                    <div className='shy-user-channel-chat-file-content-info' >
                        <span>{d.file.name}</span>
                        <Remark>{util.byteToString(d.file.size)}</Remark>
                    </div>
                    <a href={d.file.url} download={d.file.name}>
                        <Icon size={30} icon={DownloadSvg}></Icon>
                    </a>
                </div>
            </div>
        }
        else {
            return <div className='shy-user-channel-chat-content'>
                <span dangerouslySetInnerHTML={{ __html: d.content }}></span>
                {d.isEdited && <span className="sy-channel-text-edited-tip">(已编辑)</span>}
            </div>
        }
    }
    function renderDateTip(date: Date) {
        var dateStr = '';
        var now = dayjs(new Date());
        var day = dayjs(date);
        if (now.diff(day, 'hour') < 24) {
            dateStr = day.format('HH:mm')
        }
        else if (now.diff(day, 'day') < 7) {
            var d = day.day();
            var w = ['日', '一', '二', '三', '四', '五', '六'][d];
            dateStr = `周${w}${day.format(' HH:mm')}`
        }
        else dateStr = day.format('YYYY-MM-DD HH:mm')
        return <div key={date.getTime()} className="sy-channel-text-item-tip-date">
            <div className="line"></div>
            <span className="text">{dateStr}</span>
        </div>
    }
    function renderItem(d: ChannelTextType, noUser: boolean) {
        if (d.isDeleted) {
            if (d.userid == block.page.user.id) {
                return <div key={d.id} className="sy-channel-text-item-deleted"><Remark>你撤回了一条消息<a onClick={e => ChatChannelService.redit(block, d)}>重新编辑</a></Remark></div>
            }
            else return <div key={d.id} className="sy-channel-text-item-deleted"><Remark><UserBox userid={d.userid}>{us => <span>"{us.name}"</span>}</UserBox>撤回了一条消息</Remark></div>
        }
        return <div data-channel-text-id={d.id} className={"sy-channel-text-item" + (noUser ? " no-user" : "")} key={d.id}>
            {d.reply && <div className="sy-channel-text-item-reply">
                <UserBox userid={d.reply.userid}>{us => {
                    return < ><Avatar user={us} userid={d.userid} size={16}></Avatar>
                        <div className="sy-channel-text-item-reply-content">{renderContent(d.reply)}</div>
                    </>
                }}</UserBox>
            </div>}
            {d.id && d.id == view.editChannelText?.id && <div key={d.id} className="sy-channel-text-item-edited">
                <UserBox userid={d.userid}>{us => {
                    return <>
                        <div className="sy-channel-text-item-edited-content">
                            <Avatar user={us} userid={d.userid} size={40}></Avatar>
                            <div className="sy-channel-text-item-edited-content-wrapper" >
                                <div className="sy-channel-text-item-head"><a>{us.name}</a><span>{util.showTime(d.createDate)}</span></div>
                                <div className="sy-channel-text-item-edited-content-input">
                                    <RichTextInput
                                        ref={e => view.editRichTextInput = e}
                                        placeholder="回车提交"
                                        allowUploadFile={false}
                                        content={d.content}
                                        popOpen={e => view.popOpen(e)}
                                        onInput={e => ChatChannelService.edit(block, d, e)} ></RichTextInput>
                                </div>
                            </div>
                        </div>
                        <div className="sy-channel-text-item-edited-tip">ESC键<a onClick={e => ChatChannelService.closeEdit(block, d)}>取消</a>•回车键<a onMouseDown={e => view.editRichTextInput.send()}>保存</a></div>
                    </>
                }}</UserBox>
            </div>
            }
            {!(d.id == view.editChannelText?.id) && !noUser && <UserBox userid={d.userid}>{us => {
                return <div className="sy-channel-text-item-box" >
                    <Avatar user={us} userid={d.userid} size={40}></Avatar>
                    <div className="sy-channel-text-item-wrapper" >
                        <div className="sy-channel-text-item-head"><a>{us.name}</a><span>{util.showTime(d.createDate)}</span></div>
                        <div className="sy-channel-text-item-content">{renderContent(d)}</div>
                    </div>
                </div>
            }}</UserBox>}
            {!(d.id == view.editChannelText?.id) && noUser && <div className="sy-channel-text-item-box" >
                <div className="sy-channel-text-item-date">{dayjs(d.createDate).format('HH:mm')}</div>
                <div className="sy-channel-text-item-wrapper" >
                    <div className="sy-channel-text-item-content">{renderContent(d)}</div>
                </div>
            </div>}
            {Array.isArray(d.emojis) && <div className="sy-channel-text-item-emojis">{d.emojis.filter(g => g.count > 0).map(em => {
                return <a onMouseDown={e => ChatChannelService.editEmoji(block, d, em)} key={em.emojiId} >
                    <span>{em.code}</span>
                    <span>{em.count}</span>
                </a>
            })}</div>}
            {!(d.id == view.editChannelText?.id) && <div className="sy-channel-text-item-operators">
                <span onMouseDown={e => ChatChannelService.addEmoji(block, d, e)}><Icon size={16} icon={Emoji1Svg}></Icon></span>
                {d.userid == block.page.user.id && <span onMouseDown={e => ChatChannelService.openEdit(block, d)}><Icon size={16} icon={Edit1Svg}></Icon></span>}
                {d.userid != block.page.user.id && <span onMouseDown={e => ChatChannelService.reply(block, d)}><Icon size={16} icon={ReplySvg}></Icon></span>}
                <span onMouseDown={e => ChatChannelService.openProperty(block, d, e)}><Icon size={16} icon={DotsSvg}></Icon></span>
            </div>}
        </div>
    }
    function renderUploadFile(uf) {
        return <div className="sy-channel-text-upload" key={uf.id}>
            <Avatar user={block.page.user} userid={block.page.user.id} size={40}></Avatar>
            <div className="sy-channel-text-upload-content">
                <Loading></Loading>
                <span style={{ display: 'inline-block', marginLeft: 5 }}>{uf.speed}</span>
            </div>
        </div>
    }
    var ds: JSX.Element[] = [];
    var splitLastDate: Date;
    var lastUserid: string = '';
    var lastDate: Date;
    for (let i = 0; i < dm.length; i++) {
        var d = dm[i];
        var noUser: boolean = false;
        if (lastUserid == d.userid && lastDate && d.createDate && (d.createDate.getTime() - lastDate.getTime()) < 1000 * 60 * 3)
            noUser = true;
        if (!splitLastDate || splitLastDate && dayjs(d.createDate).diff(splitLastDate, 'minute') > 5) {
            ds.push(renderDateTip(d.createDate))
            splitLastDate = d.createDate;
        }
        lastDate = d.createDate;
        ds.push(renderItem(d, noUser));
        lastUserid = d.userid;
    }
    (block.view as any).uploadFiles.each(uf => {
        ds.push(renderUploadFile(uf));
    })
    return ds;
}