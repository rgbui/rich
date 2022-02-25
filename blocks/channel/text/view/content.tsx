import dayjs from "dayjs";
import React from "react";
import { ChannelText } from "..";
import { Avatar, UserNameLink } from "../../../../component/view/avator/face";
import { ChannelTextType } from "../declare";
export function renderChannelTextContent(block: ChannelText) {
    var dm = block.datas;
    function renderContent(d: ChannelTextType) {
        if (typeof d.file != 'undefined') {

        }
        else if (typeof d.content != 'undefined') {
            return <div className="sy-channel-text-item-content-text">{d.content}</div>;
        }
    }
    function renderItem(d: ChannelTextType) {
        return <div className="sy-channel-text-item" key={d.id}>
            <div className="sy-channel-text-item-avatar"><Avatar userid={d.creater}></Avatar></div>
            <div className="sy-channel-text-item-box">
                <div className="sy-channel-text-item-name"><UserNameLink userid={d.creater}></UserNameLink></div>
                <div className="sy-channel-text-item-content">
                    {renderContent(d)}
                </div>
            </div>
        </div>
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
        return <div className="sy-channel-text-item-tip-date">
            {dateStr}
        </div>
    }
    var ds: JSX.Element[] = [];
    var lastDate: Date;
    for (let i = 0; i < dm.length; i++) {
        var d = dm[i];
        if (lastDate && dayjs(lastDate).diff(d.createDate, 'minute') > 5) {
            ds.push(renderDateTip(d.createDate))
        }
        ds.push(renderItem(d));
        lastDate = d.createDate;
    }
    return ds.reverse();
}