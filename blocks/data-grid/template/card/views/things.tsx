


import React from "react";
import { ReactNode } from "react";
import { CommentSvg, LikeSvg, } from "../../../../../component/svgs";
import { Avatar } from "../../../../../component/view/avator/face";
import { UserBox } from "../../../../../component/view/avator/user";
import { Icon } from "../../../../../component/view/icon";
import { util } from "../../../../../util/util";
import { FieldType } from "../../../schema/type";
import { CardModel, CardViewCom } from "../factory/observable";
import { CardView } from "../view";
import * as Card1 from "../../../../../src/assert/img/card/card1.png"
import { BlockUrlConstant } from "../../../../../src/block/constant";
import { Divider } from "../../../../../component/view/grid";
import { lst } from "../../../../../i18n/store";

/**
 * 
 * 
 * https://segmentfault.com/jobs
 */
CardModel({
    url: '/things',
    title: ('需求发布'),
    remark:( '适用于需求发布'),
    image: Card1.default,
    forUrls: [BlockUrlConstant.DataGridList],
    props: [
        { name: 'title', text:( '标题'), types: [FieldType.title, FieldType.text], required: true },
        { name: 'author', text: ('作者'), types: [FieldType.creater] },
        { name: 'tags', text: ('分类'), types: [FieldType.option, FieldType.options] },
        { name: 'date', text: ('日期'), types: [FieldType.createDate, FieldType.date] },
        { name: 'comment', text: ('评论'), types: [FieldType.comment] },
        { name: 'like', text: ('点赞'), types: [FieldType.like] },
    ],
    views: [
        { url: BlockUrlConstant.DataGridTable, text: ('问题'), },
        { autoCreate: true, url: BlockUrlConstant.DataGridList, text: ('列表'), },
        { url: BlockUrlConstant.RecordPageView, text:( '问题详情'), }
    ],
    dataList: [
        { title: '评论里面的点赞数量统计不对' },
        { title: '文档标题，选中标题一部分，按delete，发现把文档标题给弄没了，本意是删除标题里面的一部分文字' },
        { title: '图片块，有最小限制，需要支持图片原本的大小、50%等比例缩放' },
        { title: '页面控制台报错' },
        { title: '批量选择块，ctrl+c至其它页面，无反应' },
        { title: '大标题不能通过当前行的#来切换不同级别的标题' },
    ]
})

@CardViewCom('/things')
export class CardPin extends CardView {
    render(): ReactNode {
        var self = this;
        var author = this.getValue<string>('author');
        var title = this.getValue<string>('title');
        var date = this.getValue<Date>('date');
        var comment = this.getValue<{ count: number, users: string[] }>('comment', FieldType.comment);
        var like = this.getValue<{ count: number, users: string[] }>('like', FieldType.like);
        var isLike = this.isEmoji('like');
        return <div className="padding-h-10" onMouseDown={e => self.openEdit(e)}>
            <div className="bold f-16 cursor">{title}</div>
            <div className="flex">
                <UserBox userid={author}>{(user) => {
                    return <>
                        <Avatar size={24} user={user}></Avatar>
                        <a className="cursor gap-l-10 underline-hover text-1">{user.name}</a>
                    </>
                }}</UserBox>
                <div className="remark gap-l-10 f-14">{util.showTime(date)}</div>
                <div className="flex-fixed flex r-gap-5 r-item-hover r-round r-cursor r-padding-w-5   r-flex-center remark">
                    <span onMouseDown={e => self.onUpdateCellInteractive(e, 'like')} className={isLike ? "text-p" : ""}><Icon size={16} icon={LikeSvg}></Icon><span className="gap-l-5 f-14">{like.count}</span></span>
                    <span><Icon size={16} icon={CommentSvg}></Icon><span className="gap-l-5 f-14">{comment.count}</span></span>
                </div>
            </div>
            <Divider></Divider>
        </div>
    }
} 