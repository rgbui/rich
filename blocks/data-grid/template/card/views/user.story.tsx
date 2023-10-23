
import React, { ReactNode } from "react";
import { IconArguments } from "../../../../../extensions/icon/declare";
import { BlockUrlConstant } from "../../../../../src/block/constant";
import { FieldType } from "../../../schema/type";
import { CardModel, CardViewCom } from "../factory/observable";
import { CardView } from "../view";
import * as Card1 from "../../../../../src/assert/img/card/card7.jpg"
import { UserBox } from "../../../../../component/view/avator/user";
import { Avatar } from "../../../../../component/view/avator/face";


/**
 * 
 * https://segmentfault.com/events
 * 
 */
CardModel({
    url: '/user/story',
    title: ('用户故事'),
    remark: ('适用用户案例画像'),
    image: Card1.default,
    forUrls: [BlockUrlConstant.DataGridGallery],
    props: [

        { name: 'user', text: ('用户'), types: [FieldType.user] },
        { name: 'title', text: ('称呼'), types: [FieldType.title, FieldType.text] },
        { name: 'introduction', text: ('简介'), types: [FieldType.text] },
        { name: 'story', text: ('故事'), types: [FieldType.text] },

    ],
    views: [
        { url: BlockUrlConstant.DataGridTable, text: ('用户故事'), },
        { autoCreate: true, url: BlockUrlConstant.DataGridGallery, text: ('用户故事-列表'), },
        { url: BlockUrlConstant.RecordPageView, text: ('故事详情'), }
    ],
    dataList: [
        {
            title: '',
            story: '诗云解决了我在工作中遇到的信息孤岛问题，可以预见，未来基于诗云的信息组织能力在非常多的场景中进行协同，可以产生巨大的威力！',
            introduction: '用户体验专家'
        },
        {
            title: '',
            story: '记录的作用不在于记录行为本身，而是对未来的可检索性、可连接性与可启发性。我用诗云记录当下的灵感、思考与数据，用诗云启发与重建未来的思考与创造。',
            introduction: '作词人'
        },
        {
            title: '',
            story: '我使用诗云做大量日常课业、科研、社工、社团、支教等等记录；同时由于工作原因，我需要一个几乎什么内容都可以往里写、输入快捷、方便整理与演示、可云同步的笔记平台，最令我满意的就是诗云。',
            introduction: '哈尔滨工业大学 工程物理系'
        },
    ]
})
@CardViewCom('/user/story')
export class CardPin extends CardView {
    render(): ReactNode {
        var self = this;
        var users = this.getValue<string[]>('user', FieldType.user);
        var userid = users[0];
        if (!userid) userid = this.getValue<string>('creater', FieldType.creater)
        var pics = this.getValue<IconArguments[]>('pic');
        var title = this.getValue<string>('title');
        var story = this.getValue<string>('story');
        var introduction = this.getValue<string>('introduction');
        return <div onMouseDown={e => self.openEdit(e)} className="flex flex-col flex-full">
            <UserBox userid={userid}>
                {user => {
                    return <div className="padding-20 bg-white  shadow round-16" style={{ boxShadow: '0 4px 20px rgba(0,0,0,.07)', borderRadius: 12 }}>
                        <div className="flex">
                            <div className="flex-fixed"><Avatar user={user} size={40}></Avatar></div>
                            <div className="flex-auto gap-l-10">
                                <div className="f-18">{title || user.name}</div>
                                <div className="remark f-14">{introduction}</div>
                            </div>
                        </div>
                        <div className="f-14 gap-t-10">{story}</div>
                    </div>
                }}
            </UserBox>
        </div>
    }
} 