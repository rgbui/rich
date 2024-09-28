
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
import { Edit1Svg, TrashSvg } from "../../../../../component/svgs";
import { Icon } from "../../../../../component/view/icon";
import { useSelectMenuItem } from "../../../../../component/view/menu";
import { MenuItemType } from "../../../../../component/view/menu/declare";
import { Rect } from "../../../../../src/common/vector/point";
import { UserAvatars } from "../../../../../component/view/avator/users";

/**
 * 
 * https://segmentfault.com/events
 * 
 */
CardModel('/events', () => ({
    url: '/events',
    title: lst('事件'),
    image: Card1.default,
    renderCover() {
        return <div className="gap-h-5 flex flex-top">

            <div className="flex-fixed w-6 round h-30 bg gap-w-5">

            </div>

            <div className="flex-auto">
                <div className="h-20">
                    <div className=" bg h-5  w40"></div>
                    <div className=" bg h-5 gap-t-3  w80"></div>
                </div>
                <div className="h-20">
                    <div className=" bg h-5  w40"></div>
                    <div className=" bg h-5 gap-t-3  w80"></div>
                </div>
            </div>

        </div>
    },
    forUrls: [BlockUrlConstant.DataGridList],
    props: [
        {
            name: 'pic',
            text: lst('活动海报'),
            types: [
                FieldType.image,
                FieldType.cover,
                FieldType.video
            ],
            required: true
        },
        { name: 'title', text: lst('主题'), types: [FieldType.title, FieldType.text] },
        { name: 'remark', text: lst('描述'), types: [FieldType.plain, FieldType.text] },
        { name: 'startDate', text: lst('活动开始时间'), types: [FieldType.date] },
        { name: 'endDate', text: lst('活动结束时间'), types: [FieldType.date] },
        { name: 'address', text: lst('地点'), types: [FieldType.text] },
        { name: 'users', text: lst('报名用户'), types: [FieldType.user] },
        { name: 'author', text: lst('发布人'), types: [FieldType.creater, FieldType.user] },
        { name: 'memberCount', text: lst('参加活动总人数'), types: [FieldType.number] },
        { name: 'comment', text: lst('评论'), types: [FieldType.comment] },
        // { name: 'browse', text: lst('浏览量'), types: [FieldType.browse] },
        { name: 'tags', text: lst('分类'), types: [FieldType.option, FieldType.options] },
    ],
    views: [
        { url: BlockUrlConstant.DataGridTable, text: lst('活动'), },
        { autoCreate: true, url: BlockUrlConstant.DataGridList, text: lst('活动列表'), },
        { url: BlockUrlConstant.RecordPageView, text: lst('活动详情'), }
    ],
    dataList: [
        {
            pic: [{ url: 'https://api-w1.shy.live/ws/img?id=1e1a07d5c333421c9cc885775b0ff17c' }],
            title: '花',
            startDate: dayjs().add(1, 'day').toDate(),
            endDate: dayjs().add(1, 'day').add(1, 'hour').toDate(),
            address: '北京',
            memberCount: 100,
        },
        {
            pic: [{ url: 'https://api-w1.shy.live/ws/img?id=08e4ff43377b4e13a618a183b3a82dc6' }],
            title: '水果季节',
            startDate: dayjs().add(1, 'day').toDate(),
            endDate: dayjs().add(1, 'day').add(1, 'hour').toDate(),
            address: '上海',
            memberCount: 300
        },
        {
            pic: [{ url: 'https://api-w1.shy.live/ws/img?id=e90c90e3f4634b49a19eceba035d30d8' }],
            title: '盆栽',
            startDate: dayjs().add(1, 'day').toDate(),
            endDate: dayjs().add(1, 'day').add(1, 'hour').toDate(),
            address: '线上',
            memberCount: 300
        },
        {
            pic: { url: 'https://gd-hbimg.huaban.com/9e1942a5665bad6152682864d34f58ec63afc99a1d202-DByYa3_fw1200webp' },
            title: '古风/和风/玄幻/武侠/古装',
            startDate: dayjs().add(1, 'day').toDate(),
            endDate: dayjs().add(1, 'day').add(1, 'hour').toDate(),
            address: '线上',
            memberCount: 200
        }
    ]
}))

@CardViewCom('/events')
export class CardPin extends CardView {
    async openMenu(event: React.MouseEvent) {
        var self = this;
        var ele = event.currentTarget as HTMLElement;
        event.stopPropagation();
        var action = async () => {
            ele.classList.remove('visible');
            try {
                var rect = Rect.fromEvent(event);
                var r = await useSelectMenuItem({ roundArea: rect }, [
                    { name: 'open', icon: Edit1Svg, text: lst('编辑') },
                    { type: MenuItemType.divide },
                    { name: 'remove', icon: TrashSvg, text: lst('删除') }
                ], {
                    async input(item) {

                    },
                    click(item, event, clickName, mp) {

                    },
                });
                if (r) {
                    if (r.item.name == 'remove') {
                        await self.deleteItem();
                    }
                    else if (r.item.name == 'open') {
                        await self.openEdit();
                    }
                }
            }
            catch (ex) {

            }
            finally {
                ele.classList.add('visible')
            }
        }
        if (this.dataGrid) this.dataGrid.onDataGridTool(async () => await action())
        else await action();
    }
    render(): ReactNode {
        var self = this;
        var pics = this.getValue<IconArguments[]>('pic');
        var title = this.getValue<string>('title');
        var hasPic = Array.isArray(pics) && pics.length > 0;
        var startDate = this.getValue<Date>('startDate', FieldType.date);
        var endDate = this.getValue<Date>('endDate', FieldType.date);

        // var isDue = dayjs(endDate || startDate).isBefore(dayjs(), 'day');
        var ed = dayjs(endDate);
        // var remark = this.getValue<string>('remark');
        var address = this.getValue<string>('address');
        // var author = this.getValue<string>('author');
        // var browse = this.getValue<{ count: number, users: string[] }>('browse', FieldType.browse);
        var memberCount = this.getValue<number>('memberCount', FieldType.number);
        var users = this.getValue<string[]>('users', FieldType.user);

        var week = dayjs(startDate).week();
        var weekString = week == 1 ? '周一' : week == 2 ? '周二' : week == 3 ? '周三' : week == 4 ? '周四' : week == 5 ? '周五' : week == 6 ? '周六' : '周日';
        return <div onMouseDown={e => self.openEdit(e)} className="flex relative visible-hover flex-col flex-full round">
            <div className="pos" style={{ top: 0, left: 0, bottom: 0, width: 10 }}>
                <div className="w-4  bg-3 h100 pos" style={{ top: 0, left: 0, marginLeft: 3 }}></div>
                <div className="size-10 circle bg-4" style={{ marginTop: 17 }}></div>
            </div>
            <div className="gap-h-10">
                <div className="gap-l-20"><span className="bold f-14">{dayjs(startDate).format('MM月DD日')}</span><span className="f-14 gap-l-5">{weekString}</span></div>
                <div className="card-border-hover gap-l-40 gap-t-10 round padding-w-10 r-gap-h-10 relative">
                    <div className="flex remark">{dayjs(startDate).format('HH:mm')} {endDate && <span>～{ed.isSame(dayjs(startDate), 'day') ? ed.format("HH:mm") : "DD/HH:mm"}</span>}</div>
                    <div className="f-16 bold l-24">{title}</div>
                    <div className="flex remark">
                        <span><UserAvatars size={20} users={users}></UserAvatars></span>
                        <Icon size={16} icon={{ name: 'byte', code: 'peoples' }} className={'gap-w-5 remark'}></Icon>
                        <span>{users.length} / {(typeof memberCount == 'number' && memberCount > 0 ? memberCount : lst('不限'))}</span></div>
                    {address && <div className="flex "><Icon className={'text-1'} size={16} icon={{ name: "byte", code: 'local' }}></Icon> <span className="gap-l-10 remark f-14">{address}</span></div>}
                    {hasPic && <div><img src={pics[0].url} style={{ top: 10, right: 10, maxHeight: 80 }} className="pos w-150  object-center round"></img></div>}
                </div>
            </div>
        </div>
    }
} 