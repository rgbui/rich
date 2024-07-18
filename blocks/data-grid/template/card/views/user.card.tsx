
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

/**
 * https://segmentfault.com/events
 * 
 */
CardModel('/user/story', () => ({
    url: '/user/story',
    title: lst('用户卡'),
    image: Card1.default,
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
    render() {
        var self = this;
        var users = this.getValue<string[]>('user', FieldType.user);
        var userid = users[0];
        if (!userid) userid = this.getValue<string>('creater', FieldType.creater)
        var title = this.getValue<string>('title');
        var indr = this.getValue<string>('indr');
        var profession = this.getValue<string>('profession');
        var address = this.getValue<string>('address');
        return <div
            onMouseDown={e => self.openEdit(e)}
            className="relative flex flex-col flex-full">
            <UserBox userid={userid}>
                {user => {
                    return <div
                        className="padding-20 bg-white  shadow-s round border"
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
} 