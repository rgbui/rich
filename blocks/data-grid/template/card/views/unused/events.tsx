
import React from "react";
import { ReactNode } from "react";
import { IconArguments } from "../../../../../../extensions/icon/declare";
import { FieldType } from "../../../../schema/type";
import { CardModel, CardViewCom } from "../../factory/observable";
import { CardView } from "../../view";
import * as Card1 from "../../../../../src/assert/img/card/card1.png"
import { BlockUrlConstant } from "../../../../../../src/block/constant";
import dayjs from "dayjs";
import { lst } from "../../../../../../i18n/store";
import { S } from "../../../../../../i18n/view";
import { DotsSvg, Edit1Svg, EyeSvg, TrashSvg } from "../../../../../../component/svgs";
import { Avatar } from "../../../../../../component/view/avator/face";
import { UserBox } from "../../../../../../component/view/avator/user";
import { Icon } from "../../../../../../component/view/icon";
import { useSelectMenuItem } from "../../../../../../component/view/menu";
import { MenuItemType } from "../../../../../../component/view/menu/declare";
import { Rect } from "../../../../../../src/common/vector/point";

/**
 * 
 * https://segmentfault.com/events
 * 
 */
CardModel('/events', () => ({
    url: '/events',
    title: lst('活动'),
    image: Card1.default,
    forUrls: [BlockUrlConstant.DataGridGallery],
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
        { name: 'browse', text: lst('浏览量'), types: [FieldType.browse] },
        { name: 'tags', text: lst('分类'), types: [FieldType.option, FieldType.options] },
    ],
    views: [
        { url: BlockUrlConstant.DataGridTable, text: lst('活动'), },
        { autoCreate: true, url: BlockUrlConstant.DataGridGallery, text: lst('活动列表'), },
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

        var isDue = dayjs(endDate || startDate).isBefore(dayjs(), 'day');
        var ed = dayjs(endDate);
        var remark = this.getValue<string>('remark');
        var address = this.getValue<string>('address');
        var author = this.getValue<string>('author');
        var browse = this.getValue<{ count: number, users: string[] }>('browse', FieldType.browse);

        var memberCount = this.getValue<number>('memberCount', FieldType.number);
        var users = this.getValue<string[]>('users', FieldType.user);
        return <div onMouseDown={e => self.openEdit(e)} className="flex relative visible-hover flex-col flex-full border round">
            <div className="flex-fixed h-150 relative">
                {hasPic && <img className="w100 h100 block  object-center round-top" src={pics[0].url} />}
                {!isDue && <div className="pos-bottom-full flex flex-end">
                    <span className="bg-green f-14 padding-w-5  round-16 gap-10 cursor text-white"><S>报名中</S></span>
                </div>}
            </div>
            <div className="flex flex-col flex-full padding-w-10">
                <div className="bold  h-30 flex flex-auto text-overflow ">{title}</div>
                {remark && <div className="remark gap-h-5 f-12 gap-h-5">{remark}</div>}
                <div className="flex flex-fixed h-30 remark f-14 text-p ">
                    {/* <Icon size={16} className={'gap-r-5'} icon={{ name: 'byte', code: 'time' }}></Icon> */}
                    <span>{dayjs(startDate).format('YY/MM/DD HH:mm')}</span>
                    {endDate && <span>～{ed.isSame(dayjs(startDate), 'day') ? ed.format("HH:mm") : "DD/HH:mm"}</span>}
                </div>
                <div className="flex f-14">
                    {address && <span className="flex-fixed flex">{address}</span>}
                    <span className={" remark flex-auto flex flex-end " + (isDue ? "" : "")}><Icon size={16} icon={{ name: 'byte', code: 'peoples' }} className={'gap-r-5 remark'}></Icon>{users.length} / {(typeof memberCount == 'number' && memberCount > 0 ? memberCount : lst('不限'))}</span>
                </div>
                <div className="flex gap-h-5">
                    <div className="flex-fixed flex">
                        <UserBox userid={author}>{(user) => {
                            return <>
                                <Avatar size={20} user={user}></Avatar>
                                <a className="cursor gap-l-5 underline-hover text-1">{user.name}</a>
                            </>
                        }}</UserBox>
                    </div>
                    <div className="flex-auto flex-end flex remark f-14">
                        <span className="flex"><Icon size={16} icon={EyeSvg}></Icon><span className="gap-l-5 f-14">{browse?.count || 0}</span></span>
                    </div>
                </div>
            </div>
            <div className="pos-top-full  flex-end z-2  gap-t-5 r-size-24 r-gap-r-5 r-round r-cursor">
                {this.isCanEdit && <span onMouseDown={e => self.openMenu(e)} className="bg-dark-1 visible text-white   flex-center">
                    <Icon size={18} icon={DotsSvg}></Icon>
                </span>}
            </div>

        </div>
    }
} 