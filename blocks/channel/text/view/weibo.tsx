import React from "react";
import { ChannelText } from "..";
import {
    CommentSvg,
    DotsSvg,
    DownloadSvg,
    FileIconSvg,
    LikeSvg,
    TrashSvg
} from "../../../../component/svgs";
import { Avatar } from "../../../../component/view/avator/face";
import { UserBox } from "../../../../component/view/avator/user";
import { Icon } from "../../../../component/view/icon";
import { useSelectMenuItem } from "../../../../component/view/menu";
import { MenuItemType } from "../../../../component/view/menu/declare";
import { Remark } from "../../../../component/view/text";
import { ChannelTextType } from "../../../../extensions/chats/declare";
import { autoImageUrl } from "../../../../net/element.type";
import { Rect } from "../../../../src/common/vector/point";
import { util } from "../../../../util/util";

export function RenderWeibo(props: { block: ChannelText }) {

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
    async function openProperty(event: React.MouseEvent) {
        var us = await useSelectMenuItem(
            { roundArea: Rect.fromEvent(event) },
            [
                { name: 'comment', text: '评论', icon: CommentSvg },
                { type: MenuItemType.divide },
                { name: 'delete', text: '删除', icon: TrashSvg },
            ]
        )
    }
    function renderWeibo(chat: ChannelTextType) {
        return <div key={chat.id}>
            <UserBox userid={chat.userid}>
                {user=>{
                    return <div className="bg-white relative border-light shadow round-8 gap-15 padding-15">
                        <div className="flex-top">
                            <div className="flex-fixed size-40 gap-r-10">
                                <Avatar size={40} user={user}></Avatar>
                            </div>
                            <div className="flex-auto">
                                <div className="bold f-14"><a className="text">{user.name}</a></div>
                                <div className="remark f-12">{util.showTime(chat.createDate)}</div>
                                <div className="text-1 gap-h-10">
                                    {renderContent(chat)}
                                </div>
                                <div className="flex text-1 f-12 gap-t-5 r-flex-center r-round  r-cursor r-item-hover r-gap-r-10">
                                    <span className="h-30 padding-w-5 gap-r-30"><Icon size={16} icon={LikeSvg}></Icon><em className="gap-l-5">{chat.likeCount || '点赞'}</em></span>
                                    <span className="h-30 padding-w-5"><Icon size={16} icon={CommentSvg}></Icon><em className="gap-l-5">{chat.commentCount || "评论"}</em></span>
                                </div>
                            </div>
                            <div className="pos-top-right gap-r-15 gap-t-15 flex " onMouseDown={e => openProperty(e)}>
                                <span className="size-30 round cursor item-hover flex-center"><Icon icon={DotsSvg}></Icon></span>
                            </div>
                        </div>
                    </div>
                }}
            </UserBox>
        </div>
    }
    return <div >
        {props.block.chats.map(chat => {
            return renderWeibo(chat)
        })}
    </div>
}