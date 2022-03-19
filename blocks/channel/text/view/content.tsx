import dayjs from "dayjs";
import React from "react";
import { ChannelText } from "..";
import { Avatar } from "../../../../component/view/avator/face";
import { ChannelTextType } from "../declare";
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
        else if (day.isSame(now, 'week')) {
            var d = day.day();
            var w = ['日', '一', '二', '三', '四点', '五', '六'][d];
            dateStr = `周${w}${day.format(' HH:mm')}`
        }
        else dateStr = day.format('YYYY-MM-DD HH:mm')
        return <div key={date.getTime()} className="sy-channel-text-item-tip-date">
            {dateStr}
        </div>
    }
    function renderItem(d: ChannelTextType) {
        return <div className="sy-channel-text-item" key={d.id}>
            <Avatar size={40} userid={d.userid} showSn={false} showName>{renderContent(d)}</Avatar>
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