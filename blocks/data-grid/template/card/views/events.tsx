
import React from "react";
import { ReactNode } from "react";
import { IconArguments } from "../../../../../extensions/icon/declare";
import { FieldType } from "../../../schema/type";
import { CardModel, CardViewCom } from "../factory/observable";
import { CardView } from "../view";
import * as Card1 from "../../../../../src/assert/img/card/card1.png"
import { BlockUrlConstant } from "../../../../../src/block/constant";
import dayjs from "dayjs";
import { lst } from "../../../../../i18n/store";
import { S } from "../../../../../i18n/view";

/**
 * 
 * https://segmentfault.com/events
 * 
 */
CardModel({
    url: '/events',
    title: ('活动'),
    remark: ('适用于活动举办发布'),
    image: Card1.default,
    forUrls: [BlockUrlConstant.DataGridGallery],
    props: [
        {
            name: 'pic',
            text: ('封面图'),
            types: [
                FieldType.image,
                FieldType.cover,
                FieldType.video
            ],
            required: true
        },
        { name: 'title', text: ('标题'), types: [FieldType.title, FieldType.text] },
        { name: 'date', text: ('报名时间'), types: [FieldType.date] },
        { name: 'types', text: ('类别'), types: [FieldType.option, FieldType.options] },
        { name: 'address', text: ('地址'), types: [FieldType.text] },
        { name: 'users', text: ('报名用户'), types: [FieldType.user] }
    ],
    views: [
        { url: BlockUrlConstant.DataGridTable, text: ('活动'), },
        { autoCreate: true, url: BlockUrlConstant.DataGridGallery, text: ('活动列表'), },
        { url: BlockUrlConstant.RecordPageView, text: ('活动详情'), }
    ],
    dataList: [
        {
            pic: [{ url: 'https://api-w1.shy.live/ws/img?id=1e1a07d5c333421c9cc885775b0ff17c' }],
            title: '花',
            date: new Date(),
            address: '北京'
        },
        {
            pic: [{ url: 'https://api-w1.shy.live/ws/img?id=08e4ff43377b4e13a618a183b3a82dc6' }],
            title: '水果季节',
            date: new Date(),
            address: '上海'
        },
        {
            pic: [{ url: 'https://api-w1.shy.live/ws/img?id=e90c90e3f4634b49a19eceba035d30d8' }],
            title: '盆栽',
            date: dayjs().add(1, 'day').toDate(),
            address: '线上'
        },
        {
            pic: { url: 'https://gd-hbimg.huaban.com/9e1942a5665bad6152682864d34f58ec63afc99a1d202-DByYa3_fw1200webp' },
            title: '古风/和风/玄幻/武侠/古装',
            date: dayjs().add(4, 'day').toDate(),
            address: '线上'
        },
        {
            pic: [{ url: 'https://api-w1.shy.live/ws/img?id=639fd35e2d91409fb7861841d6c6afa6' }],
            title: '花束',
            date: dayjs().add(-1, 'day').toDate(),
            address: '线上'
        },
        {
            pic: [{ url: 'https://api-w1.shy.live/ws/img?id=8206822bcf214b779b8fb05f42e1c55d' }],
            title: '伞',
            date: dayjs().add(-1, 'day').toDate(),
            address: '线上'
        },
    ]
})
@CardViewCom('/events')
export class CardPin extends CardView {
    render(): ReactNode {
        var self = this;
        var pics = this.getValue<IconArguments[]>('pic');
        var title = this.getValue<string>('title');
        var hasPic = Array.isArray(pics) && pics.length > 0;
        var date = this.getValue<Date>('date');
        var address = this.getValue<string>('address');
        return <div onMouseDown={e => self.openEdit(e)} className="flex flex-col flex-full border round">
            <div className="flex-fixed h-150 relative">
                {hasPic && <img className="w100 h100 block  object-center" src={pics[0].url} />}
                {date && date.getTime() > Date.now() && <div className="pos-bottom-full flex flex-end">
                    <span className="bg-green f-14 padding-w-5  round-16 gap-10 cursor text-white"><S>报名中</S></span>
                </div>}
            </div>
            <div className="bold h-30 flex flex-auto text-overflow padding-w-14">{title}</div>
            <div className="flex flex-fixed h-30 remark f-14 padding-w-14">
                <span>{dayjs(date).format('YYYY-MM-DD HH:mm')}</span>
                {address && <span>.{address}</span>}
            </div>
        </div>
    }
} 