


import React from "react";

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
import { lst } from "../../../../../i18n/store";

/**
 * 
 * 
 * https://segmentfault.com/jobs
 * 
 */
CardModel('/things', () => ({
    url: '/things',
    title: lst('发布需求'),
    image: Card1.default,
    forUrls: [BlockUrlConstant.DataGridList],
    props: [
        { name: 'title', text: lst('标题'), types: [FieldType.title, FieldType.text], required: true },
        { name: 'author', text: lst('发布人'), types: [FieldType.creater] },
        { name: 'tags', text: lst('分类'), types: [FieldType.option, FieldType.options] },
        { name: 'date', text: lst('日期'), types: [FieldType.createDate, FieldType.date] },
        { name: 'comment', text: lst('评论'), types: [FieldType.comment] },
        { name: 'like', text: lst('点赞'), types: [FieldType.like] },
        { name: 'remark', text: lst('简介'), types: [FieldType.plain, FieldType.text] },
        { name: 'expire', text: lst('有效期'), types: [FieldType.date] }
    ],
    views: [
        { url: BlockUrlConstant.DataGridTable, text: lst('需求'), },
        { autoCreate: true, url: BlockUrlConstant.DataGridList, text:  lst('需求'), },
        { url: BlockUrlConstant.RecordPageView, text:  lst('需求详情'), }
    ],
    dataList: [
        { title: '评论里面的点赞数量统计不对' },
        { title: '文档标题，选中标题一部分，按delete，发现把文档标题给弄没了，本意是删除标题里面的一部分文字' },
        { title: '图片块，有最小限制，需要支持图片原本的大小、50%等比例缩放' },
        { title: '页面控制台报错' },
        { title: '批量选择块，ctrl+c至其它页面，无反应' },
        { title: '大标题不能通过当前行的#来切换不同级别的标题' },
    ]
}))

@CardViewCom('/things')
export class CardPin extends CardView {
    render() {
        var self = this;
        var author = this.getValue<string>('author');
        var title = this.getValue<string>('title');
        var date = this.getValue<Date>('date');
        var comment = this.getValue<{ count: number, users: string[] }>('comment', FieldType.comment);
        var like = this.getValue<{ count: number, users: string[] }>('like', FieldType.like);
        var isLike = this.isEmoji('like');
        var expire = this.getValue<Date>('expire');
        var remark = this.getValue<string>('remark');

        return <div className="padding-h-10 border-bottom" onMouseDown={e => self.openEdit(e)}>
            <div className="bold f-16 cursor">{title}</div>
            {remark && <div className="f-12 gap-h-5 remark">{remark}</div>}
            <div className="flex">
                <UserBox userid={author}>{(user) => {
                    return <div className="flex-fixed flex">
                        <Avatar size={24} user={user}></Avatar>
                        <a className="cursor gap-l-10 underline-hover text-1">{user.name}</a>
                    </div>
                }}</UserBox>
                <div className="remark gap-l-10 f-14">{util.showTime(expire instanceof Date ? expire : date)}</div>
                <div className="flex-fixed flex r-gap-5  r-round r-cursor r-padding-w-5   r-flex-center remark">
                    <span onMouseDown={e => self.onUpdateCellInteractive(e, 'like')} className={'flex h-20 '+(isLike ? "fill-p" : " text-hover")}><Icon size={16} icon={LikeSvg}></Icon>{like.count > 0 && <span className="gap-l-5 f-14">{like.count}</span>}</span>
                    <span className="flex"><Icon size={16} icon={CommentSvg}></Icon>{comment.count > 0 && <span className="gap-l-5 f-14">{comment.count}</span>}</span>
                </div>
            </div>
        </div>
    }
} 