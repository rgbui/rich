

import React, { ReactNode } from "react";
import { CommentSvg, LikeSvg } from "../../../../../component/svgs";
import { Avatar } from "../../../../../component/view/avator/face";
import { UserBox } from "../../../../../component/view/avator/user";
import { Icon } from "../../../../../component/view/icon";
import { ResourceArguments } from "../../../../../extensions/icon/declare";
import * as Card1 from "../../../../../src/assert/img/card/card1.png"
import { util } from "../../../../../util/util";
import { FieldType } from "../../../schema/type";
import { CardModel, CardViewCom } from "../factory/observable";
import { CardView } from "../view";
import { BlockUrlConstant } from "../../../../../src/block/constant";

/**
 * 
 * 原型参考
 * https://sspai.com/
 * 
 */
CardModel({
    url: '/article',
    title: '文章',
    remark: '文章详情',
    image: Card1.default,
    forUrls: [BlockUrlConstant.DataGridList],
    props: [
        {
            name: 'pic',
            text: '封面图',
            types: [FieldType.thumb, FieldType.image, FieldType.cover, FieldType.video],
            required: true
        },
        {
            name: 'title',
            text: '标题',
            types: [FieldType.title, FieldType.text],
            required: true
        },
        { name: 'remark', text: '描述', types: [FieldType.plain, FieldType.text] },
        { name: 'like', text: '喜欢', types: [FieldType.like] },
        { name: 'author', text: '作者', types: [FieldType.creater] },
        { name: 'types', text: '分类', types: [FieldType.option, FieldType.options] },
        { name: 'date', text: '日期', types: [FieldType.createDate, FieldType.date] },
        { name: 'comment', text: '评论', types: [FieldType.comment] },
    ],
    views: [
        { url: BlockUrlConstant.DataGridTable, text: '文章', },
        { autoCreate: true, url: BlockUrlConstant.DataGridList, text: '列表', },
        { url: BlockUrlConstant.RecordPageView, text: '文章详情', }
    ],
    dataList: [
        {
            pic: [{ url: 'https://api-w1.shy.live/ws/img?id=1e1a07d5c333421c9cc885775b0ff17c' }], title: '花',
            remark: ''
        },
        {
            pic: [{ url: 'https://api-w1.shy.live/ws/img?id=08e4ff43377b4e13a618a183b3a82dc6' }], title: '水果季节',
            remark: ''
        },
        {
            pic: [{ url: 'https://api-w1.shy.live/ws/img?id=e90c90e3f4634b49a19eceba035d30d8' }], title: '盆栽',
            remark: ''
        },
        {
            pic: [{ url: 'https://api-w1.shy.live/ws/img?id=639fd35e2d91409fb7861841d6c6afa6' }], title: '花束',
            remark: ''
        },
        {
            pic: [{ url: 'https://api-w1.shy.live/ws/img?id=8206822bcf214b779b8fb05f42e1c55d' }], title: '伞',
            remark: ''
        },
        {
            pic: [{ url: 'https://api-w1.shy.live/ws/img?id=b7f399c7ffb5429c9ae7f521266735b6' }], title: '照片 女',
            remark: ''
        },
    ]
})

@CardViewCom('/article')
export class CardPin extends CardView {
    render(): ReactNode {
        var self = this;
        var pics = this.getValue<ResourceArguments[]>('pic');
        var types = this.getValue<{ value: string }>('types', FieldType.option);
        var hasPic = Array.isArray(pics) && pics.length > 0;
        var author = this.getValue<string>('author');
        var title = this.getValue<string>('title');
        var remark = this.getValue<string>('remark');
        var date = this.getValue<Date>('date');
        var comment = this.getValue<{ count: number, users: string[] }>('comment', FieldType.comment);
        var like = this.getValue<{ count: number, users: string[] }>('like', FieldType.like);
        var isLike = this.isEmoji('like');

        function renderContent() {
            return <>
                <div className="h4">{title}</div>
                <div className="remark f-14">{remark}</div>
                <div className="flex">
                    <div className="flex-auto flex">
                        <UserBox userid={author}>{(user) => {
                            return <>
                                <Avatar size={30} user={user}></Avatar>
                                <a className="cursor gap-l-10 underline-hover text-1">{user.name}</a>
                            </>
                        }}</UserBox>
                        <span className="remark f-12 gap-l-10">{util.showTime(date)}</span>
                    </div>
                    <div className="flex-fixed flex r-gap-5 r-item-hover r-round r-cursor r-padding-w-5 r-padding-h-2  r-flex-center">
                        <span><Icon size={16} icon={LikeSvg}></Icon><span className="gap-l-5">{like.count}</span></span>
                        <span><Icon size={16} icon={CommentSvg}></Icon><span className="gap-l-5">{comment.count}</span></span>
                    </div>
                </div>
            </>
        }
        return <div onMouseDown={e => self.openEdit(e)}>
            <div className="flex round shadow item-hover gap-h-10">
                {hasPic && <><div className="flex-fixed">
                    <img className="w-300 h-200 block  object-center" src={pics[0].url} />
                </div>
                    <div className="flex-auto padding-10">{renderContent()}</div>
                </>
                }
                {!hasPic && <div className="padding-10">{renderContent()}</div>}
            </div>
        </div>
    }
} 