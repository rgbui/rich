
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
        { name: 'user', text: lst('用户'), types: [FieldType.user] },
        { name: 'title', text: lst('称呼'), types: [FieldType.title, FieldType.text] },
        { name: 'profession', text: lst('职业'), types: [FieldType.text] },
        { name: 'indr', text: lst('介绍'), types: [FieldType.text] },
        { name: 'address', text: lst('所在地'), types: [FieldType.text] },
    ],
    views: [
        { url: BlockUrlConstant.DataGridTable, text: lst('用户卡'), },
        { autoCreate: true, url: BlockUrlConstant.DataGridGallery, text: lst('用户卡列表'), },
        { url: BlockUrlConstant.RecordPageView, text: lst('用户卡详情'), }
    ],
    dataList: [
        {
            title: '张三',
            indr: '诗云解决了我在工作中遇到的信息孤岛问题，可以预见，未来基于诗云的信息组织能力在非常多的场景中进行协同，可以产生巨大的威力！',
            profession: '用户体验专家'
        },
        {
            title: '李四',
            indr: '记录的作用不在于记录行为本身，而是对未来的可检索性、可连接性与可启发性。我用诗云记录当下的灵感、思考与数据，用诗云启发与重建未来的思考与创造。',
            profession: '作词人'
        },
        {
            title: '王五',
            indr: '我使用诗云做大量日常课业、科研、社工、社团、支教等等记录；同时由于工作原因，我需要一个几乎什么内容都可以往里写、输入快捷、方便整理与演示、可云同步的笔记平台，最令我满意的就是诗云。',
            profession: '哈尔滨工业大学 工程物理系'
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
                {user=>{
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