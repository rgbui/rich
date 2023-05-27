


import React from "react";
import { ReactNode } from "react";
import { IconArguments } from "../../../../../extensions/icon/declare";
import { util } from "../../../../../util/util";
import { FieldType } from "../../../schema/type";
import { CardModel, CardViewCom } from "../factory/observable";
import { CardView } from "../view";
import * as Card1 from "../../../../../src/assert/img/card/card1.png"
import { BlockUrlConstant } from "../../../../../src/block/constant";
import dayjs from "dayjs";


/**
 * 
 * https://segmentfault.com/events
 * 
 */
CardModel({
    url: '/events',
    title: '活动事件',
    remark: '适用于活动举办发布',
    image: Card1.default,
    forUrls: [BlockUrlConstant.DataGridGallery],
    props: [
        {
            name: 'pic',
            text: '封面图',
            types: [
                FieldType.image,
                FieldType.cover,
                FieldType.video
            ],
            required: true
        },
        { name: 'title', text: '标题', types: [FieldType.title, FieldType.text] },
        { name: 'date', text: '报名时间', types: [FieldType.date] },
        { name: 'types', text: '类别', types: [FieldType.option, FieldType.options] },
    ],
    views: [
        { url: BlockUrlConstant.DataGridTable, text: '活动', },
        { autoCreate: true, url: BlockUrlConstant.DataGridGallery, text: '活动列表', },
        { url: BlockUrlConstant.RecordPageView, text: '活动详情', }
    ],
    dataList: [
        {
            pic: { url: 'https://gd-hbimg.huaban.com/9e1942a5665bad6152682864d34f58ec63afc99a1d202-DByYa3_fw1200webp' },
            title: '古风/和风/玄幻/武侠/古装',
            date: new Date()
        },
        {
            pic: { url: 'https://gd-hbimg.huaban.com/2ceb09d869c9ae5561fb7a29c30a7bdf3fcb6fba9823f8-jsuPvR_fw1200webp' },
            title: '{东方系列}实拍中国古装女性角色', date: new Date()
        },
        {
            pic: { url: 'https://gd-hbimg.huaban.com/bb7e72bd5b725e6c6eef09378f213e6818cc85b7101c98-McbbUs_fw1200webp' },
            title: '参考 照片 女', date: dayjs().add(1, 'day').toDate()
        },
        {
            pic: { url: 'https://gd-hbimg.huaban.com/9e1942a5665bad6152682864d34f58ec63afc99a1d202-DByYa3_fw1200webp' },
            title: '古风/和风/玄幻/武侠/古装', date: dayjs().add(4, 'day').toDate()
        },
        {
            pic: { url: 'https://gd-hbimg.huaban.com/2ceb09d869c9ae5561fb7a29c30a7bdf3fcb6fba9823f8-jsuPvR_fw1200webp' },
            title: '{东方系列}实拍中国古装女性角色', date: dayjs().add(-1, 'day').toDate()
        },
        {
            pic: { url: 'https://gd-hbimg.huaban.com/bb7e72bd5b725e6c6eef09378f213e6818cc85b7101c98-McbbUs_fw1200webp' },
            title: '参考 照片 女', date: dayjs().add(-1, 'day').toDate()
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
        return <div  onMouseDown={e => self.openEdit(e)} className="flex flex-col ">
            <div className="flex-fixed h-80">
                {hasPic && <img className="w100 block round-16 object-center" src={pics[0].url} />}
            </div>
            <div className="h3 flex-auto">{title}</div>
            <div className="flex flex-fixed h-30 remark">
                <span>{util.showTime(date)}</span>
                <span></span>
            </div>
        </div>
    }
} 