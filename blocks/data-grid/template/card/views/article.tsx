

import React, { ReactNode } from "react";
import { CommentSvg, LikeSvg } from "../../../../../component/svgs";
import { Avatar } from "../../../../../component/view/avator/face";
import { UserBox } from "../../../../../component/view/avator/user";
import { Icon } from "../../../../../component/view/icon";
import { IconArguments } from "../../../../../extensions/icon/declare";
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
    group: 'image',
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
        { pic: { url: 'https://gd-hbimg.huaban.com/9e1942a5665bad6152682864d34f58ec63afc99a1d202-DByYa3_fw1200webp' }, title: '古风/和风/玄幻/武侠/古装', remark: 'i.pinimg.com' },
        { pic: { url: 'https://gd-hbimg.huaban.com/2ceb09d869c9ae5561fb7a29c30a7bdf3fcb6fba9823f8-jsuPvR_fw1200webp' }, title: '{东方系列}实拍中国古装女性角色', remark: '' },
        { pic: { url: 'https://gd-hbimg.huaban.com/bb7e72bd5b725e6c6eef09378f213e6818cc85b7101c98-McbbUs_fw1200webp' }, title: '参考 照片 女', remark: '{其他}实拍动态...（现代，古装）' },
        { pic: { url: 'https://gd-hbimg.huaban.com/9e1942a5665bad6152682864d34f58ec63afc99a1d202-DByYa3_fw1200webp' }, title: '古风/和风/玄幻/武侠/古装', remark: 'i.pinimg.com' },
        { pic: { url: 'https://gd-hbimg.huaban.com/2ceb09d869c9ae5561fb7a29c30a7bdf3fcb6fba9823f8-jsuPvR_fw1200webp' }, title: '{东方系列}实拍中国古装女性角色', remark: '' },
        { pic: { url: 'https://gd-hbimg.huaban.com/bb7e72bd5b725e6c6eef09378f213e6818cc85b7101c98-McbbUs_fw1200webp' }, title: '参考 照片 女', remark: '{其他}实拍动态...（现代，古装）' },
    ],
    async blockViewHandle(dg, g) {
        var ps = g.props.toArray(pro => {
            var f = dg.schema.fields.find(x => x.text == pro.text);
            if (f) {
                return {
                    name: f.name,
                    visible: true,
                    bindFieldId: f.id
                }
            }
        })
        await dg.updateProps({
            openRecordSource: 'page',
            cardConfig: {
                auto: false,
                showCover: false,
                coverFieldId: "",
                coverAuto: false,
                showMode: 'define',
                templateProps: {
                    url: g.url,
                    props: ps
                }
            }
        });
    }
})

@CardViewCom('/article')
export class CardPin extends CardView {
    render(): ReactNode {
        var self = this;
        var pics = this.getValue<IconArguments[]>('pic');
        var types = this.getValue<{ value: string }>('types');
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
                <div className="h3">{title}</div>
                <div>{remark}</div>
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
                    <div className="flex-fixed flex r-gap-5 r-item-hover r-round r-cursor r-padding-w-5 r-padding-h-3  r-flex-center">
                        <span><Icon size={16} icon={LikeSvg}></Icon>{like.count}</span>
                        <span><Icon size={16} icon={CommentSvg}></Icon>{comment.count}</span>
                    </div>
                </div>
            </>
        }
        return <div  onMouseDown={e => self.openEdit(e)}>
            <div className="flex">
                {hasPic && <><div className="flex-auto">
                    <img className="w100 block round-16 object-center" src={pics[0].url} />
                </div>
                    <div className="flex-auto">{renderContent()}</div></>
                }
                {!hasPic && <div>{renderContent()}</div>}
            </div>
        </div>
    }
} 