import React, { ReactNode } from "react";
import { UploadSvg, TrashSvg, LoveSvg, DotsSvg } from "../../../../../component/svgs";
import { Avatar } from "../../../../../component/view/avator/face";
import { UserBox } from "../../../../../component/view/avator/user";
import { Icon } from "../../../../../component/view/icon";
import { useSelectMenuItem } from "../../../../../component/view/menu";
import { MenuItemType } from "../../../../../component/view/menu/declare";
import { BackgroundColorList } from "../../../../../extensions/color/data";
import { IconArguments } from "../../../../../extensions/icon/declare";
import * as Card1 from "../../../../../src/assert/img/card/card1.png"
import { Rect } from "../../../../../src/common/vector/point";
import { util } from "../../../../../util/util";
import { FieldType } from "../../../schema/type";
import { CardModel, CardViewCom } from "../factory/observable";
import { CardView } from "../view";
import { BlockUrlConstant } from "../../../../../src/block/constant";

/**
 * https://segmentfault.com/questions
 */
CardModel({
    url: '/questions',
    title: '问题',
    remark: '问答',
    image: Card1.default,
    group: 'image',
    props: [
        {
            name: 'title',
            text: '标题',
            types: [FieldType.title, FieldType.text],
            required: true
        },
        { name: 'remark', text: '描述', types: [FieldType.plain, FieldType.text] },
        { name: 'author', text: '作者', types: [FieldType.creater] },
        { name: 'tags', text: '分类', types: [FieldType.option, FieldType.options] },
        { name: 'date', text: '日期', types: [FieldType.createDate, FieldType.date] },
        { name: 'comment', text: '评论', types: [FieldType.comment] },
        { name: 'browse', text: '浏览', types: [FieldType.browse] },
        { name: 'like', text: '点赞', types: [FieldType.like] },
    ],
    views: [
        { url: BlockUrlConstant.DataGridTable, text: '问题', },
        { autoCreate: true, url: BlockUrlConstant.DataGridList, text: '列表', },
        { url: BlockUrlConstant.RecordPageView, text: '问题详情', }
    ],
    dataList: [
        { title: '古风/和风/玄幻/武侠/古装', remark: 'i.pinimg.com' },
        { title: '{东方系列}实拍中国古装女性角色', remark: '' },
        { title: '参考 照片 女', remark: '{其他}实拍动态...（现代，古装）' },
        { title: '古风/和风/玄幻/武侠/古装', remark: 'i.pinimg.com' },
        { title: '{东方系列}实拍中国古装女性角色', remark: '' },
        { title: '参考 照片 女', remark: '{其他}实拍动态...（现代，古装）' },
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

@CardViewCom('/questions')
export class CardPin extends CardView {
    render(): ReactNode {
        var self = this;
        var author = this.getValue<string>('author');
        var title = this.getValue<string>('title');
        var remark = this.getValue<string>('remark');
        var like = this.getValue<{ count: number, users: string[] }>('like', FieldType.like);
        var browse = this.getValue<{ count: number, users: string[] }>('browse', FieldType.browse);

        return <div className="w100" onMouseDown={e => self.openEdit(e)}>
            <div className="flex">
                <div className="flex-fixed flex">
                    <div>
                        <span>{like.count}</span>
                        <span>点赞</span>
                    </div>
                    <div>
                        <span>{browse.count}</span>
                        <span>阅读</span>
                    </div>
                </div>
                <div className="flex-auto">
                    <div className="h3">{title}</div>
                    <div className="flex"></div>
                </div>
            </div>
        </div>
    }
} 