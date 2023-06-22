import React, { ReactNode } from "react";
import { Avatar } from "../../../../../component/view/avator/face";
import { UserBox } from "../../../../../component/view/avator/user";
import { ResourceArguments } from "../../../../../extensions/icon/declare";
import { autoImageUrl } from "../../../../../net/element.type";
import * as Card1 from "../../../../../src/assert/img/card/card8.jpg"
import { BlockUrlConstant } from "../../../../../src/block/constant";
import { util } from "../../../../../util/util";
import { FieldType } from "../../../schema/type";
import { CardModel, CardViewCom } from "../factory/observable";
import { CardView } from "../view";
import { LikeSvg, CommentSvg } from "../../../../../component/svgs";
import { Icon } from "../../../../../component/view/icon";
import { buildPageData } from "../../../../../src/page/common/create";

CardModel({
    url: '/list/tizhi',
    title: '贴子',
    remark: '适用于发贴讨论',
    image: Card1.default,
    forUrls: [BlockUrlConstant.DataGridList],
    props: [
        { name: 'pic', text: '缩略图', types: [FieldType.thumb, FieldType.image, FieldType.video], required: true },
        { name: 'author', text: '作者', types: [FieldType.creater] },
        { name: 'title', text: '标题', types: [FieldType.title, FieldType.text] },
        { name: 'remark', text: '描述', types: [FieldType.plain, FieldType.text] },
        { name: 'like', text: '喜欢', types: [FieldType.like] },
        { name: 'comment', text: '评论', types: [FieldType.comment] },
        { name: 'createDate', text: "创建日期", types: [FieldType.createDate] }
    ],
    views: [
        { url: BlockUrlConstant.DataGridTable, text: '贴子表格', },
        { autoCreate: true, url: BlockUrlConstant.DataGridList, text: '贴子', },
        { url: BlockUrlConstant.RecordPageView, text: '贴子详情', }
    ],
    async createDataList() {
        return [
            {
                pic: [{ url: 'https://api-w1.shy.live/ws/img?id=1e1a07d5c333421c9cc885775b0ff17c' }],
                title: '花',
                snap: await buildPageData([
                    'eeeeeeee',
                    { url: BlockUrlConstant.Image, src: { url: 'https://api-w1.shy.live/ws/img?id=1e1a07d5c333421c9cc885775b0ff17c' } },
                    'gggggggggeeee'
                ], { isTitle: true, isComment: true })
            },
            {
                pic: [{ url: 'https://api-w1.shy.live/ws/img?id=08e4ff43377b4e13a618a183b3a82dc6' }], title: '水果季节',
                snap: await buildPageData([
                    'eeeeeeee',
                    { url: BlockUrlConstant.Image, src: { url: 'https://api-w1.shy.live/ws/img?id=08e4ff43377b4e13a618a183b3a82dc6' } },
                    'gggggggggeeee'
                ], { isTitle: true, isComment: true })
            },
            {
                pic: [{ url: 'https://api-w1.shy.live/ws/img?id=e90c90e3f4634b49a19eceba035d30d8' }], title: '盆栽',
                snap: await buildPageData([
                    'eeeeeeee',
                    { url: BlockUrlConstant.Image, src: { url: 'https://api-w1.shy.live/ws/img?id=e90c90e3f4634b49a19eceba035d30d8' } },
                    'gggggggggeeee'
                ], { isTitle: true, isComment: true })
            },
            {
                pic: [{ url: 'https://api-w1.shy.live/ws/img?id=639fd35e2d91409fb7861841d6c6afa6' }], title: '花束',
                snap: await buildPageData([
                    'eeeeeeee',
                    { url: BlockUrlConstant.Image, src: { url: 'https://api-w1.shy.live/ws/img?id=639fd35e2d91409fb7861841d6c6afa6' } },
                    'gggggggggeeee'
                ], { isTitle: true, isComment: true })
            },
            {
                pic: [{ url: 'https://api-w1.shy.live/ws/img?id=8206822bcf214b779b8fb05f42e1c55d' }], title: '伞',
                snap: await buildPageData([
                    'eeeeeeee',
                    { url: BlockUrlConstant.Image, src: { url: 'https://api-w1.shy.live/ws/img?id=8206822bcf214b779b8fb05f42e1c55d' } },
                    'gggggggggeeee'
                ], { isTitle: true, isComment: true })
            },
            {
                pic: [{ url: 'https://api-w1.shy.live/ws/img?id=b7f399c7ffb5429c9ae7f521266735b6' }], title: '照片 女',
                snap: await buildPageData([
                    'eeeeeeee',
                    { url: BlockUrlConstant.Image, src: { url: 'https://api-w1.shy.live/ws/img?id=b7f399c7ffb5429c9ae7f521266735b6' } },
                    'gggggggggeeee'
                ], { isTitle: true, isComment: true })
            },
        ]
    }

})
@CardViewCom('/list/tizhi')
export class CardTiZhi extends CardView {
    render(): ReactNode {
        var self = this;
        var pics = this.getValue<ResourceArguments[]>('pic', FieldType.cover);
        if (pics && !Array.isArray(pics)) pics = [pics];
        var author = this.getValue<string>('author');
        var title = this.getValue<string>('title');
        var remark = this.getValue<string>('remark');
        var createDate = this.getValue<Date>('createDate');
        var like = this.getValue<{ count: number, users: string[] }>('like', FieldType.like);
        var isLike = this.isEmoji('like')
        var comment = this.getValue<{ count: number, users: string[] }>('comment', FieldType.comment);
        return <div className="w100 round padding-10 border gap-b-20" onMouseDown={e => self.openEdit(e, '/page/slide')}>
            <div className="h4 f-14 gap-h-5  break-all">
                {title}
            </div>
            <div className="flex f-12">
                <span className="flex-fixed flex">
                    <UserBox userid={author}>{(user) => {
                        return <>
                            <Avatar size={20} user={user}></Avatar>
                            <a className="cursor gap-l-5 underline-hover text-1 bold">{user.name}</a>
                        </>
                    }}</UserBox>
                </span>
                <span className="remark gap-l-10">{util.showTime(createDate)}&nbsp;发表了贴子</span>
            </div>
            <div className="gap-h-10 f-14">
                {remark || '还没有发表内容'}
            </div>
            <div className="flex">
                {pics.slice(0, 6).map(pic => {
                    return <div key={pic.url} className="w-120 h-150 gap-r-10">
                        <img className="w100 h100 obj-center round-8" src={autoImageUrl(pic.url, 500)} />
                    </div>
                })}
            </div>
            <div className="flex r-flex-fixed gap-t-10 r-gap-r-10 r-round r-item-hover r-padding-w-5  r-cursor r-flex">
                <span onMouseDown={e => self.onUpdateCellInteractive(e, 'like')} className={isLike ? "text-p" : ""}><Icon size={16} icon={LikeSvg}></Icon><span className="gap-l-5 f-14">{like.count}</span></span>
                <span><Icon size={16} icon={CommentSvg}></Icon><span className="gap-l-5 f-14">{comment.count}</span></span>
            </div>
        </div>
    }
} 