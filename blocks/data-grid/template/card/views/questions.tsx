import React, { ReactNode } from "react";
import * as Card1 from "../../../../../src/assert/img/card/card1.png"
import { FieldType } from "../../../schema/type";

import { CardView } from "../view";
import { BlockUrlConstant } from "../../../../../src/block/constant";
import { CardModel, CardViewCom } from "../factory/observable";
import { Icon } from "../../../../../component/view/icon";
import { DotsSvg, TriangleSvg } from "../../../../../component/svgs";
import { UserAvatars } from "../../../../../component/view/avator/users";

/**
 * 
 * https://segmentfault.com/questions
 * 
 */
CardModel('/questions',
    () => ({
        url: '/questions',
        title: ('问答'),
        image: Card1.default,
        forUrls: [BlockUrlConstant.DataGridList],
        props: [
            {
                name: 'title',
                text: ('问题'),
                types: [FieldType.title, FieldType.text],
                required: true
            },
            { name: 'remark', text: ('描述'), types: [FieldType.plain, FieldType.text] },
            { name: 'author', text: ('作者'), types: [FieldType.creater] },
            { name: 'tags', text: ('分类'), types: [FieldType.option, FieldType.options] },
            { name: 'date', text: ('日期'), types: [FieldType.createDate, FieldType.date] },
            { name: 'comment', text: ('评论'), types: [FieldType.comment] },
            { name: 'browse', text: ('浏览'), types: [FieldType.browse] },
            { name: 'like', text: ('点赞'), types: [FieldType.like] },
        ],
        views: [
            { url: BlockUrlConstant.DataGridTable, text: ('问题'), },
            { autoCreate: true, url: BlockUrlConstant.DataGridList, text: ('列表'), },
            { url: BlockUrlConstant.RecordPageView, text: ('问题详情'), }
        ],
        dataList: [
            { title: '评论里面的点赞数量统计不对', remark: '' },
            { title: '文档标题，选中标题一部分，按delete，发现把文档标题给弄没了，本意是删除标题里面的一部分文字', remark: '' },
            { title: '图片块，有最小限制，需要支持图片原本的大小、50%等比例缩放', remark: '' },
            { title: '页面控制台报错', remark: '' },
            { title: '批量选择块，ctrl+c至其它页面，无反应', remark: '' },
            { title: '大标题不能通过当前行的#来切换不同级别的标题', remark: '' },
        ]
    }))

@CardViewCom('/questions')
export class CardPin extends CardView {
    render(): ReactNode {
        var self = this;
        // var author = this.getValue<string>('author');
        var title = this.getValue<string>('title');
        var remark = this.getValue<string>('remark');
        // var date = this.getValue<Date>('date');
        var tags = this.getValue<{ text: string, color: string }[]>('tags', FieldType.options);
        var like = this.getValue<{ count: number, users: string[] }>('like', FieldType.like);
        var isVote = this.isEmoji('like');
        // var browse = this.getValue<{ count: number, users: string[] }>('browse', FieldType.browse);
        var comment = this.getValue<{ count: number, users: string[] }>('comment', FieldType.comment);
        // console.log('like', like);

        return <div className="w100 relative visible-hover" onMouseDown={e => self.openEdit(e)}>
            <div className="flex  border-bottom padding-h-10 ">
                <div
                    style={{ borderWidth: 2 }}
                    onMouseDown={e => this.onUpdateCellInteractive(e, 'like')}
                    className={"flex-fixed cursor flex-center flex-col  gap-r-10 " + ("size-" + 40) + " " + (isVote ? "border-p round-8" : "border round-8")}
                >
                    <Icon size={12} className={isVote ? "fill-p" : "remark"} icon={TriangleSvg}></Icon>
                    <span className={isVote ? "text-p" : 'text-1'}>{like?.count}</span>
                </div>
                <div className="flex-auto">
                    <div style={{
                        whiteSpace: 'pre-wrap',
                    }} className="f-16 l-20 h-20  bold text-overflow">{title}</div>
                    {remark && <div className="h-20 text-1 f-14 text-overflow l-20">{(remark || "").slice(0, 80)}</div>}
                </div>
                <div className="flex-fixed  flex r-gap-r-10">
                    {tags.map(tag => {
                        return <span key={tag.text} data-hover-style={JSON.stringify({ backgroundColor: 'rgb(208,227,241)' })} style={{ backgroundColor: 'rgb(225, 236, 244)', color: 'rgb(57, 115, 157)' }} className="padding-w-10 f-12 padding-h-3 round ">{tag.text}</span>
                    })}
                </div>
                <div className="flex-fixed flex">
                    <span><UserAvatars size={20} users={like.users}></UserAvatars></span>
                </div>
                <div className="flex-fixed h-30 min-w-100 flex  flex-end text-hover cursor ">
                    <Icon size={16} icon={{ name: 'byte', code: 'message' }}></Icon>
                    <span className="gap-l-5 f-14">{comment.count}</span>
                </div>
            </div>
            <div className="pos-top pos-right flex-end z-2  gap-t-5 r-size-24 r-gap-r-5 r-round r-cursor">
                {this.isCanEdit && <span
                    onMouseDown={e => self.openMenu(e)}
                    className="item-hover remark visible flex-center">
                    <Icon size={18} icon={DotsSvg}></Icon>
                </span>}
            </div>
        </div>
    }
} 