


import React from "react";
import { ReactNode } from "react";
import { DotsSvg, LoveSvg, TrashSvg, UploadSvg } from "../../../../../component/svgs";
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


/**
 * 
 * 
 * https://segmentfault.com/events
 */
CardModel({
    url: '/card/pinterest',
    title: '活动事件',
    remark: '适用于摄影等图像展示',
    image: Card1.default,
    group: 'image',
    props: [
        {
            name: 'cover',
            text: '封面图',
            types: [FieldType.image, FieldType.cover, FieldType.video],
            required: true
        },
        { name: 'title', text: '标题', types: [FieldType.title, FieldType.text] },
        { name: 'date', text: '报名时间', types: [FieldType.date] },
        { name: 'remark', text: '描述', types: [FieldType.plain, FieldType.text] },
    ]
})
@CardViewCom('/card/pinterest')
export class CardPin extends CardView {
    render(): ReactNode {
        var self = this;
        var pics = this.getValue<IconArguments[]>('cover');
        var author = this.getValue<string>('author');
        var title = this.getValue<string>('title');
        var remark = this.getValue<string>('remark');
        var hasPic = Array.isArray(pics) && pics.length > 0;
        var love = this.getValue<string>('like');
        var isLove = this.isEmoji('like')
        async function openProperty(event: React.MouseEvent) {
            event.stopPropagation();
            var rect = Rect.fromEvent(event);
            var r = await useSelectMenuItem({ roundArea: rect }, [
                { name: 'replace', icon: UploadSvg, text: '替换' },
                { type: MenuItemType.divide },
                { name: 'close', icon: TrashSvg, text: '删除' }
            ]);
            if (r) {
                if (r.item.name == 'replace') {
                    await self.uploadImage('cover', rect)
                }
                else if (r.item.name == 'close') {
                    await self.deleteItem();
                }
            }
        }
        return <div className="w100" onMouseDown={e => self.openEdit(e)}>
            <div className="visible-hover max-h-600 overflow-hidden round-bottom-16 relative">
                {hasPic && <img className="w100 block round-16 object-center" src={pics[0].url} style={{ backgroundColor: BackgroundColorList.randomOf().color }} />}
                {!hasPic && <div className={'round-16'} style={{ height: util.getRandom(150, 300), backgroundColor: BackgroundColorList.randomOf().color }}></div>}
                {!hasPic && <div className="pos-center z-4 visible">
                    <span onMouseDown={e => this.uploadImage('cover', e)} className="padding-w-10 padding-h-3 bg-white item-white-hover round-8 cursor flex">
                        <span className="size-24 flex-center flex-inline"><Icon icon={UploadSvg}></Icon></span>
                        <span className="f-14 text-1">上传图片</span>
                    </span>
                </div>}
                <div className="mask-1 visible pos-inset z-1  round-16"></div>
                <div className="pos-bottom-full  flex-end z-2 visible gap-b-5 r-size-24 r-gap-r-5 r-circle r-cursor">
                    <span onMouseDown={e => self.onUpdateCellInteractive(e, 'like')} className={"flex-center" + (isLove ? " bg-primary text-white" : " bg-white  item-white-hover text-1")}>
                        <Icon icon={LoveSvg}></Icon>
                    </span>
                    <span onMouseDown={e => openProperty(e)} className="bg-white item-white-hover   flex-center">
                        <Icon size={18} icon={DotsSvg}></Icon>
                    </span>
                </div>
            </div>
            <div className="text-1 padding-w-8 f-14 gap-h-5 bold">
                {title}
            </div>
            <div className="text-1 padding-w-8  f-14 gap-h-5 flex">
                <UserBox userid={author}>{(user) => {
                    return <>
                        <Avatar size={30} user={user}></Avatar>
                        <a className="cursor gap-l-10 underline-hover text-1">{user.name}</a>
                    </>
                }}</UserBox>
            </div>
            <div className="remark gap-h-10">{remark}</div>
        </div>
    }
} 