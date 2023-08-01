

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
import { buildPageData } from "../../../../../src/page/common/create";
import { Divider } from "../../../../../component/view/grid";
import { lst } from "../../../../../i18n/store";

/**
 * 
 * 原型参考
 * https://sspai.com/
 * 
 */
CardModel({
    url: '/article',
    title: lst('文章'),
    remark: lst('适用于强调图文'),
    image: Card1.default,
    forUrls: [BlockUrlConstant.DataGridList],
    props: [
        {
            name: 'pic',
            text: lst('封面图'),
            types: [FieldType.thumb, FieldType.image, FieldType.cover, FieldType.video],
            required: true
        },
        {
            name: 'title',
            text: lst('标题'),
            types: [FieldType.title, FieldType.text],
            required: true
        },
        { name: 'remark', text: lst('描述'), types: [FieldType.plain, FieldType.text] },
        { name: 'like', text: lst('喜欢'), types: [FieldType.like] },
        { name: 'author', text: lst('作者'), types: [FieldType.creater] },
        { name: 'types', text: lst('分类'), types: [FieldType.option, FieldType.options] },
        { name: 'date', text: lst('日期'), types: [FieldType.createDate, FieldType.date] },
        { name: 'comment', text: lst('评论'), types: [FieldType.comment] },
    ],
    views: [
        { url: BlockUrlConstant.DataGridTable, text: lst('文章'), },
        { autoCreate: true, url: BlockUrlConstant.DataGridList, text: lst('列表'), },
        { url: BlockUrlConstant.RecordPageView, text: lst('文章详情'), }
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
                <div className="h4 flex-fixed">{title}</div>
                <div className="remark f-14 flex-auto">{remark}</div>
                <div className="flex flex-fixed">
                    <div className="flex-auto flex">
                        <UserBox userid={author}>{(user) => {
                            return <>
                                <Avatar size={24} user={user}></Avatar>
                                <a className="cursor gap-l-5 underline-hover text-1">{user.name}</a>
                            </>
                        }}</UserBox>
                        <span className="remark f-12 gap-l-10">{util.showTime(date)}</span>
                    </div>
                    <div className="flex-fixed flex r-gap-5 r-item-hover r-round r-cursor r-padding-w-5 r-padding-h-2  r-flex-center remark">
                        <span onMouseDown={e => self.onUpdateCellInteractive(e, 'like')} className={isLike ? "text-p" : ""}><Icon size={16} icon={LikeSvg}></Icon><span className="gap-l-5 f-14">{like.count}</span></span>
                        <span><Icon size={16} icon={CommentSvg}></Icon><span className="gap-l-5 f-14">{comment.count}</span></span>
                    </div>
                </div>
            </>
        }
        return <div onMouseDown={e => self.openEdit(e)}>
            <div className="flex flex-full round border  gap-h-10">
                {hasPic && <><div className="flex-fixed">
                    <img className="w-300 max-h-300 block  object-center" src={pics[0].url} />
                </div>
                    <div className="flex-auto padding-10 flex flex-col flex-full">{renderContent()}</div>
                </>
                }
                {!hasPic && <div className="padding-10 flex flex-col flex-full">{renderContent()}</div>}
            </div>
        </div>
    }
}


/**
 * 
 * 原型参考
 * https://sspai.com/
 * 
 */
CardModel({
    url: '/article/content',
    title: lst('文章'),
    remark:lst( '适用于文章列表'),
    image: Card1.default,
    forUrls: [BlockUrlConstant.DataGridList],
    props: [
        {
            name: 'pic',
            text:lst( '封面图'),
            types: [FieldType.thumb, FieldType.image, FieldType.cover, FieldType.video],
            required: true
        },
        {
            name: 'title',
            text: lst('标题'),
            types: [FieldType.title, FieldType.text],
            required: true
        },
        { name: 'remark', text: lst('描述'), types: [FieldType.plain, FieldType.text] },
        { name: 'like', text:lst( '喜欢'), types: [FieldType.like] },
        { name: 'author', text: lst('作者'), types: [FieldType.creater] },
        { name: 'types', text:lst( '分类'), types: [FieldType.option, FieldType.options] },
        { name: 'date', text:lst( '日期'), types: [FieldType.createDate, FieldType.date] },
        { name: 'comment', text: lst('评论'), types: [FieldType.comment] },
    ],
    views: [
        { url: BlockUrlConstant.DataGridTable, text:lst( '文章'), },
        { autoCreate: true, url: BlockUrlConstant.DataGridList, text: lst('列表'), },
        { url: BlockUrlConstant.RecordPageView, text: lst('文章详情'), }
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


@CardViewCom('/article/content')
export class CardContentPin extends CardView {
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
                <div className="f-18 fold flex-fixed">{title}</div>
                <div className="remark f-12 flex-auto">{remark}</div>
                <div className="flex flex-fixed">
                    <div className="flex-auto flex">
                        <UserBox userid={author}>{(user) => {
                            return <>
                                <Avatar size={24} user={user}></Avatar>
                                <a className="cursor gap-l-5 underline-hover text-1">{user.name}</a>
                            </>
                        }}</UserBox>
                        <span className="remark f-12 gap-l-10">{util.showTime(date)}</span>
                    </div>
                    <div className="flex-fixed flex r-gap-5 r-item-hover r-round r-cursor r-padding-w-5 r-padding-h-2  r-flex-center remark">
                        <span onMouseDown={e => self.onUpdateCellInteractive(e, 'like')} className={isLike ? "text-p" : ""}><Icon size={16} icon={LikeSvg}></Icon><span className="gap-l-5 f-14">{like.count}</span></span>
                        <span><Icon size={16} icon={CommentSvg}></Icon><span className="gap-l-5 f-14">{comment.count}</span></span>
                    </div>
                </div>
            </>
        }
        return <div onMouseDown={e => self.openEdit(e)}>
            <div className="flex flex-full round border  gap-h-10">
                <div className="flex-auto padding-10 flex flex-col ">{renderContent()}</div>
                {hasPic && <><div className="flex-fixed">
                    <img className="w-150 max-h-80 block  object-center" src={pics[0].url} />
                </div>
                </>
                }
                {!hasPic && <div className="padding-10 flex flex-col ">{renderContent()}</div>}
            </div>
            <Divider></Divider>
        </div>
    }
} 