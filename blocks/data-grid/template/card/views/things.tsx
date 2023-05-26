


import React from "react";
import { ReactNode } from "react";
import { CommentSvg, DotsSvg, LikeSvg, LoveSvg, TrashSvg, UploadSvg } from "../../../../../component/svgs";
import { Avatar } from "../../../../../component/view/avator/face";
import { UserBox } from "../../../../../component/view/avator/user";
import { Icon } from "../../../../../component/view/icon";
import { useSelectMenuItem } from "../../../../../component/view/menu";
import { MenuItemType } from "../../../../../component/view/menu/declare";
import { BackgroundColorList } from "../../../../../extensions/color/data";
import { IconArguments } from "../../../../../extensions/icon/declare";
import { Rect } from "../../../../../src/common/vector/point";
import { util } from "../../../../../util/util";
import { FieldType } from "../../../schema/type";
import { CardModel, CardViewCom } from "../factory/observable";
import { CardView } from "../view";
import * as Card1 from "../../../../../src/assert/img/card/card1.png"
import { BlockUrlConstant } from "../../../../../src/block/constant";

/**
 * 
 * 
 * https://segmentfault.com/jobs
 */
CardModel({
    url: '/things',
    title: '需求发布',
    remark: '适用于需求发布',
    image: Card1.default,
    group: 'image',
    props: [
        { name: 'title', text: '标题', types: [FieldType.title, FieldType.text], required: true },
        { name: 'author', text: '作者', types: [FieldType.creater] },
        { name: 'tags', text: '分类', types: [FieldType.option, FieldType.options] },
        { name: 'date', text: '日期', types: [FieldType.createDate, FieldType.date] },
        { name: 'comment', text: '评论', types: [FieldType.comment] },
        { name: 'like', text: '点赞', types: [FieldType.like] },
    ],
    views: [
        { url: BlockUrlConstant.DataGridTable, text: '问题', },
        { autoCreate: true, url: BlockUrlConstant.DataGridList, text: '列表', },
        { url: BlockUrlConstant.RecordPageView, text: '问题详情', }
    ],
    dataList: [
        { title: '古风/和风/玄幻/武侠/古装' },
        { title: '{东方系列}实拍中国古装女性角色' },
        { title: '参考 照片 女' },
        { title: '古风/和风/玄幻/武侠/古装' },
        { title: '{东方系列}实拍中国古装女性角色' },
        { title: '参考 照片 女' },
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

@CardViewCom('/things')
export class CardPin extends CardView {
    render(): ReactNode {
        var self = this;
        var isLove = this.isEmoji('like');
        var author = this.getValue<string>('author');
        var title = this.getValue<string>('title');
        var date = this.getValue<Date>('date');
        var comment = this.getValue<{ count: number, users: string[] }>('comment', FieldType.comment);
        var love = this.getValue<{ count: number, users: string[] }>('like', FieldType.like);
        return <div >
            <div className="h2">{title}</div>
            <div className="flex">
                <UserBox userid={author}>{(user) => {
                    return <>
                        <Avatar size={30} user={user}></Avatar>
                        <a className="cursor gap-l-10 underline-hover text-1">{user.name}</a>
                    </>
                }}</UserBox>
                <div className="remark">{util.showTime(date)}</div>
                <div>
                    <span><Icon size={16} icon={LikeSvg}></Icon>{love.count}</span>
                    <span><Icon size={16} icon={CommentSvg}></Icon>{comment.count}</span>
                </div>
            </div>
        </div>
    }
} 