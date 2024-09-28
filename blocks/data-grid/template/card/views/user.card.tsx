
import React from "react";
import { BlockUrlConstant } from "../../../../../src/block/constant";
import { FieldType } from "../../../schema/type";
import { CardModel, CardViewCom } from "../factory/observable";
import { CardView } from "../view";
import * as Card1 from "../../../../../src/assert/img/card/card3.png"
import { UserBox } from "../../../../../component/view/avator/user";
import { Avatar } from "../../../../../component/view/avator/face";
import { lst } from "../../../../../i18n/store";
import { Icon } from "../../../../../component/view/icon";
import { DotsSvg } from "../../../../../component/svgs";
import { MenuItem, MenuItemType } from "../../../../../component/view/menu/declare";
import { BlockDirective, BlockRenderRange } from "../../../../../src/block/enum";

/**
 * https://segmentfault.com/events
 * 
 */
CardModel('/user/story', () => ({
    url: '/user/story',
    title: lst('用户卡'),
    image: Card1.default,
    renderCover() {
        return <div>
            <div className=" flex gap-5 r-gap-w-3">

                <div>
                    <div className="h-16" style={{ color: 'var(--bg)' }}>
                        <Icon size={16} icon={{ name: "byte", code: 'me' }}></Icon>
                    </div>
                    <div>
                        <div className="flex-center"><div className="bg h-5 w70" ></div></div>
                        <div className="gap-t-5 bg h-5"></div>
                    </div>
                </div>

                <div>
                    <div className="h-16" style={{ color: 'var(--bg)' }}>
                        <Icon size={16} icon={{ name: "byte", code: 'me' }}></Icon>
                    </div>
                    <div>
                        <div className="flex-center"><div className="bg h-5 w70" ></div></div>
                        <div className="gap-t-5 bg h-5"></div>
                    </div>
                </div>

                <div>
                    <div className="h-16" style={{ color: 'var(--bg)' }}>
                        <Icon size={16} icon={{ name: "byte", code: 'me' }}></Icon>
                    </div>
                    <div>
                        <div className="flex-center"><div className="bg h-5 w70" ></div></div>
                        <div className="gap-t-5 bg h-5"></div>
                    </div>
                </div>

            </div>
        </div>
    },
    forUrls: [BlockUrlConstant.DataGridGallery],
    props: [
        { name: 'user', text: lst('用户'), types: [FieldType.user, FieldType.creater], required: true },
        { name: 'indr', text: lst('介绍'), types: [FieldType.text, FieldType.title], required: true },
        { name: 'title', text: lst('称呼'), types: [FieldType.title, FieldType.text] },
        { name: 'profession', text: lst('职业'), types: [FieldType.text, FieldType.title, FieldType.option, FieldType.options] },
        { name: 'address', text: lst('所在地'), types: [FieldType.text, FieldType.title, FieldType.option] },
    ],
    views: [
        { url: BlockUrlConstant.DataGridTable, text: lst('用户卡'), },
        { autoCreate: true, url: BlockUrlConstant.DataGridGallery, text: lst('用户卡列表'), },
        { url: BlockUrlConstant.RecordPageView, text: lst('用户卡详情'), }
    ],
    dataList: [
        {
            title: '赵雪',
            user: window.shyConfig?.isDev ? undefined : ['51d9393f2d3a4f289bef315df198ca76'],
            indr: '"诗云"这个工具帮我解决了工作中遇到的信息孤立问题。可以想象，未来在许多不同的场合，如果大家都能用诗云来组织和整理信息，那么它将极大地提升我们的协作效率，发挥出巨大的作用！',
            profession: '用户体验专家',
            address: '上海'
        },
        {
            title: '陈真真',
            user: window.shyConfig?.isDev ? undefined : ['02fb751585794bafb64f0c3954fd4f82'],
            indr: '记录的目的不在于单纯的记录行为，而在于将来能够方便地查找、关联和激发新的想法。我用“诗云”这个工具来记录我当下的灵感、思考和重要信息，同时期望它能够在未来帮助我重新点燃思考的火花，促进新的创造。',
            profession: '高中老师',
            address: '长沙'
        },
        {
            title: '张泽民',
            user: window.shyConfig?.isDev ? undefined : ['d1e3fedeac2442f3baacae88aff6b732'],
            indr: '我用诗云来记录我日常的学业、科研、社区服务、社团活动、支教等事情。同时，因为工作的关系，我需要一个能写各种内容、输入快速、整理和展示方便、还能云端同步的笔记工具，而诗云就是我最满意的选择。',
            profession: '哈尔滨工业大学 工程物理系',
            address: '黑河'
        }
    ]
}))

@CardViewCom('/user/story')
export class CardPin extends CardView {
    async onGetMenus() {
        var rs = await super.onGetMenus();
        var at = rs.findIndex(x => x.name == 'openSlide');
        if (at > -1) {
            var cs = this.cardSettings<{ cardDisplay: string, size: number }>({ cardDisplay: 'card-1', size: 40 });
            rs.splice(at + 1,
                0,
                { type: MenuItemType.divide },
                {
                    icon: { name: 'byte', code: 'rectangle-one' },
                    text: lst('展示'),
                    childs: [
                        { name: 'cardDisplay', text: '卡片1', checkLabel: cs.cardDisplay == 'card-1' ? true : false, value: 'card-1' },
                        { name: 'cardDisplay', text: '卡片2', checkLabel: cs.cardDisplay == 'card-2' ? true : false, value: 'card-2' },
                        { name: 'cardDisplay', text: '卡片3', checkLabel: cs.cardDisplay == 'card-3' ? true : false, value: 'card-3' },
                        { name: 'cardDisplay', text: '卡片4', checkLabel: cs.cardDisplay == 'card-4' ? true : false, value: 'card-4' }
                    ]
                },
                { type: MenuItemType.divide }
            )
        }
        return rs;
    }
    async onClickContextMenu(item: MenuItem<string | BlockDirective>, event: MouseEvent, options?: { merge?: boolean; }): Promise<void> {
        var self = this;
        if (item.name == 'cardDisplay') {
            await self.dataGrid.onUpdateProps({ 'cardSettings.cardDisplay': item.value }, { range: BlockRenderRange.self })
            self.dataGrid.forceUpdateAllViews();
        }
        else await super.onClickContextMenu(item, event, options);
    }
    render() {
        var self = this;
        var users = this.getValue<string[]>('user', FieldType.user);
        var userid = users[0];
        if (!userid) userid = this.getValue<string>('creater', FieldType.creater)
        var title = this.getValue<string>('title');
        var indr = this.getValue<string>('indr');
        var profession = this.getValue<string>('profession');
        var address = this.getValue<string>('address');
        var cs = this.cardSettings<{ cardDisplay: string }>({ cardDisplay: 'card-1' });
        if (cs.cardDisplay == 'card-1') {
            return <div
                onMouseDown={e => self.openEdit(e)}
                className="relative visible-hover flex flex-col flex-full">
                <UserBox userid={userid}>
                    {user => {
                        return <div
                            className="padding-10 bg-white  card-border round"
                        >
                            <div className="flex flex-top">
                                <div className="flex-fixed"><Avatar user={user} size={40}></Avatar></div>
                                <div className="flex-auto gap-l-10">
                                    <div className="f-18 flex">
                                        <span>{title || user.name}</span>
                                        <div className="remark f-14 gap-l-10">{address}</div>
                                    </div>
                                    <div className="remark f-14 rows-2">{profession}</div>
                                </div>
                            </div>
                            <div className="f-14 gap-t-10">{indr}</div>
                        </div>
                    }}
                </UserBox>
                <div className="pos-top pos-right flex-end z-2  gap-t-5 r-size-24 r-gap-r-5 r-round r-cursor">
                    {this.isCanEdit && <span onMouseDown={e => self.openMenu(e)} className="item-hover remark visible    flex-center">
                        <Icon size={18} icon={DotsSvg}></Icon>
                    </span>}
                </div>
            </div>
        }
        else if (cs.cardDisplay == 'card-2') {
            return <div
                onMouseDown={e => self.openEdit(e)}
                className=" flex flex-col flex-full relative visible-hover">
                <div style={{ marginTop: 50 }} className="relative padding-10  round ">
                    <div>
                        <UserBox userid={userid}>
                            {user => {
                                return <div>
                                    <div className="h-50" >
                                        <div style={{ top: -50 }} className="pos flex-center w100">
                                            <Avatar user={user} hideStatus size={100}></Avatar>
                                        </div>
                                    </div>
                                    <div className="flex-center">
                                        <span className="bold f-16">{title || user.name}</span>
                                    </div>
                                    {profession && <div className="remark flex-center ">{profession}</div>}
                                </div>
                            }}
                        </UserBox>
                    </div>
                    <div className="f-14 gap-t-10">{indr}</div>
                </div>

                <div className="pos-top pos-right flex-end z-2  gap-t-5 r-size-24 r-gap-r-5 r-round r-cursor">
                    {this.isCanEdit && <span onMouseDown={e => self.openMenu(e)} className="item-hover remark visible    flex-center">
                        <Icon size={18} icon={DotsSvg}></Icon>
                    </span>}
                </div>
            </div>
        }
        else if (cs.cardDisplay == 'card-3') {
            return <div
                onMouseDown={e => self.openEdit(e)}
                className="relative flex flex-col flex-full visible-hover">
                <UserBox userid={userid}>
                    {user => {
                        return <div
                            className="padding-10 bg-white  card-border round "
                        >
                            <div className="flex">
                                <div className="flex-fixed"><Avatar user={user} size={40}></Avatar></div>
                                <div className="flex-auto gap-l-10">
                                    <div className="flex flex-top">
                                        <span className="f-16 bold flex-fixed">{title || user.name}</span>
                                        <div className="remark f-14 gap-l-10 flex-auto overflow">{profession}</div>
                                    </div>
                                    <div className="remark f-14 rows-2">{indr}</div>
                                </div>
                            </div>
                        </div>
                    }}
                </UserBox>
                <div className="pos-top pos-right flex-end z-2  gap-t-5 r-size-24 r-gap-r-5 r-round r-cursor">
                    {this.isCanEdit && <span onMouseDown={e => self.openMenu(e)} className="item-hover remark visible    flex-center">
                        <Icon size={18} icon={DotsSvg}></Icon>
                    </span>}
                </div>
            </div>
        }
        else if (cs.cardDisplay == 'card-4') {
            return <div
                onMouseDown={e => self.openEdit(e)}
                className=" flex flex-col flex-full relative visible-hover">
                <div>
                    <UserBox userid={userid}>
                        {user => {
                            return <div>
                                <div className=" flex-center w100">
                                    <Avatar user={user} hideStatus size={100}></Avatar>
                                </div>
                                <div className="flex-center">
                                    <span className="bold f-14">{title || user.name}</span>
                                </div>
                                {profession && <div className="f-14 remark flex-center ">{profession}</div>}
                            </div>
                        }}
                    </UserBox>
                </div>
                <div className="pos-top pos-right flex-end z-2  gap-t-5 r-size-24 r-gap-r-5 r-round r-cursor">
                    {this.isCanEdit && <span onMouseDown={e => self.openMenu(e)} className="item-hover remark visible    flex-center">
                        <Icon size={18} icon={DotsSvg}></Icon>
                    </span>}
                </div>
            </div>
        }
    }
} 