import React, { ReactNode } from "react";
import { BlockUrlConstant } from "../../../../../src/block/constant";
import { FieldType } from "../../../schema/type";
import { CardModel, CardViewCom } from "../factory/observable";
import { CardView } from "../view";
import * as Card1 from "../../../../../src/assert/img/card/card1.png";
import { UserBox } from "../../../../../component/view/avator/user";
import { CommentSvg } from "../../../../../component/svgs";
import { Icon } from "../../../../../component/view/icon";
import { UserAvatars } from "../../../../../component/view/avator/users";
import { util } from "../../../../../util/util";
import { Avatar } from "../../../../../component/view/avator/face";

CardModel({
    abled:false,
    url: '/issue',
    title:('事项') ,
    remark: ('工单事项处理'),
    image: Card1.default,
    forUrls: [BlockUrlConstant.DataGridList],
    props: [
        { name: 'title', text: ('标题'), types: [FieldType.title, FieldType.text], required: true },
        { name: 'remark', text: ('描述'), types: [FieldType.plain, FieldType.text] },
        { name: 'author', text:( '作者'), types: [FieldType.creater] },
        { name: 'handler', text: ("处理人"), types: [FieldType.user] },
        { name: 'autoIncrement', text:( "编号"), types: [FieldType.autoIncrement] },
        { name: 'tags', text: ('分类'), types: [FieldType.options, FieldType.option] },
        { name: 'status', text:( '状态'), types: [FieldType.option, FieldType.options] },
        { name: 'date', text:( '日期'), types: [FieldType.createDate, FieldType.date] },
        { name: 'comment', text: ('评论'), types: [FieldType.comment] },
        { name: 'browse', text: ('浏览'), types: [FieldType.browse] },
        { name: 'like', text: ('点赞'), types: [FieldType.like] },
    ],
    views: [
        { url: BlockUrlConstant.DataGridTable, text:( '事项'), },
        { autoCreate: true, url: BlockUrlConstant.DataGridList, text:( '事项列表'), },
        { url: BlockUrlConstant.RecordPageView, text:( '事项详情') }
    ],
    dataList: [
        { title: '评论里面的点赞数量统计不对', remark: '' },
        { title: '文档标题，选中标题一部分，按delete，发现把文档标题给弄没了，本意是删除标题里面的一部分文字', remark: '' },
        { title: '图片块，有最小限制，需要支持图片原本的大小、50%等比例缩放', remark: '' },
        { title: '页面控制台报错', remark: '' },
        { title: '批量选择块，ctrl+c至其它页面，无反应', remark: '' },
        { title: '大标题不能通过当前行的#来切换不同级别的标题', remark: '' },
    ]
})

@CardViewCom('/issue')
export class CardPin extends CardView {
    render(): ReactNode {
        var self = this;
        var autoIncrement = this.getValue<number>('autoIncrement');
        var author = this.getValue<string>('author');
        var handler = this.getValue<string>('handler');
        var tags = this.getValue<{ text: string, color: string }[]>('tags', FieldType.options);
        var status = this.getValue<{ text: string, color: string }[]>('status', FieldType.option);
        var title = this.getValue<string>('title');
        var remark = this.getValue<string>('remark');
        var like = this.getValue<{ count: number, users: string[] }>('like', FieldType.like);
        var browse = this.getValue<{ count: number, users: string[] }>('browse', FieldType.browse);
        var date = this.getValue<Date>('date');
        var comment = this.getValue<{ count: number, users: string[] }>('comment', FieldType.comment);
        return <div onMouseDown={e => self.openEdit(e)}>
            <div className="flex flex-top border-bottom item-hover-light cursor padding-h-10 padding-w-5">
                <div className="flex-auto">
                    <div className="flex">{status[0]?.text && <span className="f-12 gap-r-10">[{status[0]?.text}]</span>}<span className="bold f-16">{title}</span>{tags.map((tag, i) => <em className="round-16 padding-w-10 padding-h-3 gap-w-5 f-12 " key={tag.text} style={{ backgroundColor: tag.color }}>{tag.text}</em>)}</div>
                    <div className="flex remark f-12 gap-t-5">
                        {typeof autoIncrement == 'number' && <span className="gap-r-5">#{autoIncrement}</span>}
                        <UserBox userid={author}>{(user) => {
                            return <> <Avatar size={30} user={user}></Avatar>
                                <a className="cursor underline-hover gap-l-5 text-1">{user.name}</a>
                            </>
                        }}</UserBox>
                        <span className="gap-l-10">{util.showTime(date)}</span>
                    </div>
                </div>
                <div className="flex-fixed flex">
                    <UserAvatars size={30} users={comment.users}></UserAvatars>
                    <span className="flex gap-l-10 r-gap-5">
                        <Icon size={18} icon={CommentSvg}></Icon>
                        <span>{comment.count}</span>
                    </span>
                </div>
            </div>
        </div>
    }
} 