import dayjs from "dayjs";
import React from "react";
import { ChannelText } from "..";
import { DotsSvg, Emoji1Svg, ReplySvg, Edit1Svg } from "../../../../component/svgs";
import { Avatar } from "../../../../component/view/avator/face";
import { UserBox } from "../../../../component/view/avator/user";
import { Icon } from "../../../../component/view/icon";
import { useSelectMenuItem } from "../../../../component/view/menu";
import { MenuItemType } from "../../../../component/view/menu/declare";
import { Block } from "../../../../src/block";
import { Rect } from "../../../../src/common/vector/point";
import { util } from "../../../../util/util";
import { ChannelTextType } from "../declare";

async function addEmoji(d: ChannelTextType, e: React.MouseEvent) {

}
async function edit(d: ChannelTextType) {

}
async function reply(d: ChannelTextType) {

}
async function report(d: ChannelTextType) {

}
async function del(d: ChannelTextType) {

}
async function openProperty(block: Block, d: ChannelTextType, event: React.MouseEvent) {
    var items: MenuItemType<string>[] = [];
    if (d.userid == block.page.user.id) {
        items.push({ name: 'edit', text: '编辑' });
        items.push({ name: 'delete', text: '删除' });
    }
    else {
        items.push({ name: 'reply', text: '回复' });
        items.push({ name: 'report', text: '举报' });
    }
    var r = await useSelectMenuItem({ roundArea: Rect.fromEvent(event) },
        items
    );
    if (r?.item) {
        if (r.item.name == 'report') {
            await report(d);
        }
        else if (r.item.name == 'edit') {
            await edit(d)
        }
        else if (r.item.name == 'reply') {
            await reply(d)
        }
        else if (r.item.name == 'delete') {
            await del(d);
        }
    }
}
export function renderChannelTextContent(block: ChannelText) {
    var dm = block.chats;
    function renderContent(d: ChannelTextType) {
        if (d.file) {
            if (d.file.mime == 'image') {
                return <div className='shy-user-channel-chat-image' >
                    <img src={d.file.url} />
                </div>
            }
            else if (d.file.mime == 'video') {
                return <div className='shy-user-channel-chat-video' >
                    <video src={d.file.url}></video>
                </div>
            }
            else return <div className='shy-user-channel-chat-file' >
                <a download={d.file.url}>{d.file.name}</a>
            </div>
        }
        else {
            return <div className='shy-user-channel-chat-content' dangerouslySetInnerHTML={{ __html: d.content }}></div>
        }
    }
    function renderDateTip(date: Date) {
        var dateStr = '';
        var now = new Date();
        var day = dayjs(date);
        if (day.diff(now, 'hour') < 24) {
            dateStr = day.format('HH:mm')
        }
        else if (day.diff(now, 'day') < 7) {
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
    function renderItem(d: ChannelTextType) {
        return <div className="sy-channel-text-item" key={d.id}>
            <UserBox userid={d.userid}>{us => {
                return <div className="sy-channel-text-item-box" >
                    <Avatar userid={d.userid} size={40}></Avatar>
                    <div className="sy-channel-text-item-wrapper" >
                        <div className="sy-channel-text-item-head"><a>{us.name}</a><span>{util.showTime(d.createDate)}</span></div>
                        <div className="sy-channel-text-item-content">{renderContent(d)}</div>
                    </div>
                </div>
            }}</UserBox>
            <div className="sy-channel-text-item-operators">
                <span onMouseDown={e => addEmoji(d, e)}><Icon size={16} icon={Emoji1Svg}></Icon></span>
                {d.userid == block.page.user.id && <span onMouseDown={e => edit(d)}><Icon size={16} icon={Edit1Svg}></Icon></span>}
                {d.userid != block.page.user.id && <span onMouseDown={e => reply(d)}><Icon size={16} icon={ReplySvg}></Icon></span>}
                <span onMouseDown={e => openProperty(block, d, e)}><Icon size={16} icon={DotsSvg}></Icon></span>
            </div>
        </div>
    }
    var ds: JSX.Element[] = [];
    var lastDate: Date;
    for (let i = 0; i < dm.length; i++) {
        var d = dm[i];
        if (!lastDate || lastDate && dayjs(d.createDate).diff(lastDate, 'minute') > 5) {
            ds.push(renderDateTip(d.createDate))
            lastDate = d.createDate;
        }
        ds.push(renderItem(d));
    }
    return ds;
}