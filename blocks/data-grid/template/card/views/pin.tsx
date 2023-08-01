

import React from "react";
import { ReactNode } from "react";
import { DotsSvg, LoveFillSvg, LoveSvg, TrashSvg, UploadSvg } from "../../../../../component/svgs";
import { Avatar } from "../../../../../component/view/avator/face";
import { UserBox } from "../../../../../component/view/avator/user";
import { Icon } from "../../../../../component/view/icon";
import { useSelectMenuItem } from "../../../../../component/view/menu";
import { MenuItemType } from "../../../../../component/view/menu/declare";
import { BackgroundColorList } from "../../../../../extensions/color/data";
import { ResourceArguments } from "../../../../../extensions/icon/declare";
import { Rect } from "../../../../../src/common/vector/point";
import { util } from "../../../../../util/util";
import { FieldType } from "../../../schema/type";
import { CardModel, CardViewCom } from "../factory/observable";
import { CardView } from "../view";
import * as Card1 from "../../../../../src/assert/img/card/card8.jpg"
import { BlockUrlConstant } from "../../../../../src/block/constant";
import { autoImageUrl } from "../../../../../net/element.type";
import { lst } from "../../../../../i18n/store";
import { S } from "../../../../../i18n/view";

CardModel({
    url: '/card/pinterest',
    title:lst('瀑布流图片') ,
    remark: lst('适用于摄影等图像展示'),
    image: Card1.default,
    forUrls: [BlockUrlConstant.DataGridGallery],
    props: [
        { name: 'pic', text:lst( '封面图'), types: [FieldType.image, FieldType.video], required: true },
        { name: 'author', text: lst('作者'), types: [FieldType.creater] },
        { name: 'title', text:lst( '标题'), types: [FieldType.title, FieldType.text] },
        { name: 'remark', text: lst('描述'), types: [FieldType.text] },
        { name: 'like', text: lst('喜欢'), types: [FieldType.like] }
    ],
    views: [
        { url: BlockUrlConstant.DataGridTable, text: lst('列表'), },
        { autoCreate: true, url: BlockUrlConstant.DataGridGallery, text: lst('相册'), },
        { url: BlockUrlConstant.RecordPageView, text: lst('图片详情'), }
    ],
    dataList: [
        { pic: [{ url: 'https://api-w1.shy.live/ws/img?id=1e1a07d5c333421c9cc885775b0ff17c' }], title: '花', remark: '' },
        { pic: [{ url: 'https://api-w1.shy.live/ws/img?id=08e4ff43377b4e13a618a183b3a82dc6' }], title: '水果季节', remark: '' },
        { pic: [{ url: 'https://api-w1.shy.live/ws/img?id=e90c90e3f4634b49a19eceba035d30d8' }], title: '盆栽', remark: '' },
        { pic: [{ url: 'https://api-w1.shy.live/ws/img?id=639fd35e2d91409fb7861841d6c6afa6' }], title: '花束', remark: '' },
        { pic: [{ url: 'https://api-w1.shy.live/ws/img?id=8206822bcf214b779b8fb05f42e1c55d' }], title: '伞', remark: '' },
        { pic: [{ url: 'https://api-w1.shy.live/ws/img?id=b7f399c7ffb5429c9ae7f521266735b6' }], title: '照片 女', remark: '' },
    ]
})
@CardViewCom('/card/pinterest')
export class CardPin extends CardView {
    render(): ReactNode {
        var self = this;
        var pics = this.getValue<ResourceArguments[]>('pic');
        if (pics && !Array.isArray(pics)) pics = [pics];
        var author = this.getValue<string>('author');
        var title = this.getValue<string>('title');
        var remark = this.getValue<string>('remark');
        var hasPic = Array.isArray(pics) && pics.length > 0;
        var like = this.getValue<{ count: number, users: string[] }>('like', FieldType.like);
        var isLike = this.isEmoji('like')
        async function openProperty(event: React.MouseEvent) {
            event.stopPropagation();
            var rect = Rect.fromEvent(event);
            var r = await useSelectMenuItem({ roundArea: rect }, [
                { name: 'replace', icon: UploadSvg, text: lst('替换') },
                { type: MenuItemType.divide },
                { name: 'close', icon: TrashSvg, text:lst( '删除') }
            ]);
            if (r) {
                if (r.item.name == 'replace') {
                    await self.uploadImage('pic', rect, 'title')
                }
                else if (r.item.name == 'close') {
                    await self.deleteItem();
                }
            }
        }
        return <div className="w100" onMouseDown={e => self.openEdit(e)}>
            <div className="visible-hover max-h-600 overflow-hidden round-bottom-16 relative">
                {hasPic && <img className="w100 block round-16 object-center" src={autoImageUrl(pics[0].url, 500)} style={{ backgroundColor: BackgroundColorList.randomOf().color }} />}
                {!hasPic && <div className={'round-16'} style={{ height: util.getRandom(150, 300), backgroundColor: BackgroundColorList.randomOf().color }}></div>}
                {!hasPic && <div className="pos-center z-4 visible">
                    <span onMouseDown={e => this.uploadImage('pic', e, 'title')} className="padding-w-10 padding-h-3 bg-white item-white-hover round-8 cursor flex">
                        <span className="size-24 flex-center flex-inline"><Icon icon={UploadSvg}></Icon></span>
                        <span className="f-14 text-1"><S>上传图片</S></span>
                    </span>
                </div>}
                <div className="mask-1 visible pos-inset z-1  round-16"></div>
                <div className="pos-top-full  flex-end z-2 visible gap-t-5 r-size-24 r-gap-r-5 r-circle r-cursor">
                    {this.isCanEdit && <span onMouseDown={e => openProperty(e)} className="bg-white item-white-hover   flex-center">
                        <Icon size={18} icon={DotsSvg}></Icon>
                    </span>}
                </div>
            </div>
            <div className="text-1 padding-w-8 f-14 gap-h-5 bold break-all">
                {title || remark}
            </div>
            <div className="text-1 padding-w-8  f-14 gap-h-5 flex">
                <div className="flex-fixed flex">
                    <UserBox userid={author}>{(user) => {
                        return <>
                            <Avatar size={24} user={user}></Avatar>
                            <a className="cursor gap-l-5 underline-hover text-1">{user.name}</a>
                        </>
                    }}</UserBox>
                </div>
                <div className="flex-auto flex-end">
                    <span onMouseDown={e => self.onUpdateCellInteractive(e, 'like')} className={"circle flex-center cursor" + (isLike ? " text-p" : " text-1")}>
                        <Icon icon={isLike ? LoveFillSvg : LoveSvg}></Icon>
                    </span>
                    {like.count > 0 && <span className="text-1 cursor gap-l-5">{like.count}</span>}
                </div>
            </div>
        </div>
    }
} 