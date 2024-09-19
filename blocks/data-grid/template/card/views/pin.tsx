


import React from "react";
import { DotsSvg, LoveFillSvg, LoveSvg, UploadSvg } from "../../../../../component/svgs";
import { Avatar } from "../../../../../component/view/avator/face";
import { UserBox } from "../../../../../component/view/avator/user";
import { Icon } from "../../../../../component/view/icon";
import { MenuItem, MenuItemType } from "../../../../../component/view/menu/declare";
import { BackgroundColorList } from "../../../../../extensions/color/data";
import { ResourceArguments } from "../../../../../extensions/icon/declare";
import { Rect } from "../../../../../src/common/vector/point";
import { util } from "../../../../../util/util";
import { FieldType } from "../../../schema/type";
import { CardModel, CardViewCom } from "../factory/observable";
import { CardView } from "../view";
import * as Card1 from "../../../../../src/assert/img/card/card1.png"
import { BlockUrlConstant } from "../../../../../src/block/constant";
import { autoImageUrl } from "../../../../../net/element.type";
import { lst } from "../../../../../i18n/store";
import { S } from "../../../../../i18n/view";
import { useUserCard } from "../../../../../component/view/avator/card";
import { BlockDirective, BlockRenderRange } from "../../../../../src/block/enum";

CardModel('/card/pinterest', () => ({
    url: '/card/pinterest',
    title: lst('图片库'),
    image: Card1.default,
    forUrls: [BlockUrlConstant.DataGridGallery],
    props: [
        { name: 'pic', text: lst('图片'), types: [FieldType.image, FieldType.video], required: true },
        { name: 'author', text: lst('作者'), types: [FieldType.creater] },
        { name: 'title', text: lst('标题'), types: [FieldType.title, FieldType.text] },
        { name: 'remark', text: lst('描述'), types: [FieldType.text] },
        { name: 'like', text: lst('点赞'), types: [FieldType.like], required: true },
        { name: 'tags', text: lst('标签'), types: [FieldType.options, FieldType.option] }
    ],
    views: [
        { url: BlockUrlConstant.DataGridTable, text: lst('图片列表'), },
        { autoCreate: true, url: BlockUrlConstant.DataGridGallery, text: lst('图片瀑布流'), },
        { url: BlockUrlConstant.RecordPageView, text: lst('图片详情'), }
    ],
    dataList: [
        { pic: [{ url: 'https://api-w1.shy.live/ws/img?id=9b6807dd3e0944d0ab2e219c81eb14c7' }], title: lst(''), remark: '' },
        { pic: [{ url: 'https://api-w1.shy.live/ws/img?id=8d28df8026574bb3976b97777f348400' }], title: lst(''), remark: '' },
        { pic: [{ url: 'https://api-w1.shy.live/ws/img?id=c42313fa6a764e4dafb424f7d872d8b6' }], title: lst(''), remark: '' },
        { pic: [{ url: 'https://api-w2.shy.live/ws/img?id=693fcef8a235488d9e77e40c4d79bc3d' }], title: lst(''), remark: '' },
        { pic: [{ url: 'https://api-w2.shy.live/ws/img?id=536ea56f5e324db2bd9db43d59be32b8' }], title: lst(''), remark: '' },
        { pic: [{ url: 'https://api-w2.shy.live/ws/img?id=b319195db5574084bc858207558247fb' }], title: lst(''), remark: '' },
        { pic: [{ url: 'https://api-w2.shy.live/ws/img?id=e9bd01a2d6174a7b842cfc296b8af4f6' }], title: lst(''), remark: '' }
    ]
}))

@CardViewCom('/card/pinterest')
export class CardPin extends CardView {
    async onGetMenus(): Promise<MenuItem<string | BlockDirective>[]> {
        var rs = await super.onGetMenus();
        var at = rs.findIndex(x => x.name == 'openSlide');
        if (at > -1) {
            var cs = this.cardSettings<{ cardDisplay: string, size: number }>({ cardDisplay: 'card-1', size: 40 });
            rs.splice(at + 1,
                0,
                { type: MenuItemType.divide },
                {
                    icon: { name: 'byte', code: 'rectangle-one' },
                    text: lst('展示'),
                    childs: [
                        { name: 'cardDisplay', text: '卡片1', checkLabel: cs.cardDisplay == 'card-1' ? true : false, value: 'card-1' },
                        { name: 'cardDisplay', text: '卡片2', checkLabel: cs.cardDisplay == 'card-2' ? true : false, value: 'card-2' },
                        { name: 'cardDisplay', text: '卡片3', checkLabel: cs.cardDisplay == 'card-3' ? true : false, value: 'card-3' },
                        // { name: 'cardDisplay', text: '卡片4', checkLabel: cs.cardDisplay == 'card-4' ? true : false, value: 'card-4' }
                    ]
                },
                { type: MenuItemType.divide }
            )
            rs.splice(at + 2, 0,
                { type: MenuItemType.divide },
                { name: 'replace', icon: UploadSvg, text: lst('替换') },
                { type: MenuItemType.divide }
            )
        }
        return rs;
    }
    async onClickContextMenu(item: MenuItem<string | BlockDirective>, event: MouseEvent, options?: { merge?: boolean; }): Promise<void> {
        var self = this;
        if (item.name == 'replace') {
            var rect = Rect.fromEvent(event);
            await self.uploadImage('pic', rect, 'title')
        }
        else if (item.name == 'cardDisplay') {
            await self.dataGrid.onUpdateProps({ 'cardSettings.cardDisplay': item.value }, { range: BlockRenderRange.self })
            self.dataGrid.forceUpdateAllViews();
        }
        else await super.onClickContextMenu(item, event, options);
    }
    render() {
        var self = this;
        var pics = this.getValue<ResourceArguments[]>('pic');
        if (pics && !Array.isArray(pics)) pics = [pics];
        var author = this.getValue<string[]>('author', FieldType.user)[0];
        var title = this.getValue<string>('title');
        var remark = this.getValue<string>('remark');
        var hasPic = Array.isArray(pics) && pics.length > 0;
        var like = this.getValue<{ count: number, users: string[] }>('like', FieldType.like);
        var isLike = this.isEmoji('like')
        var tags = this.getValue<{ text: string, color: string }[]>('tags', FieldType.options);
        var cs = this.cardSettings<{ cardDisplay: string }>({ cardDisplay: 'card-1' });
        if (cs.cardDisplay == 'card-1') {
            return <div className="w100 relative visible-hover" onMouseDown={e => self.openEdit(e)}>
                {pics && pics[0] && <div style={{
                    width: '100%',/* 宽度自适应 */
                    height: 0, /* 高度为0 */
                    paddingBottom: '100%', /* 通过padding控制高度，这里设置为与宽度相同，实现正方形 */
                    position: 'relative'/* 相对定位 */
                }}><img className="round" src={autoImageUrl(pics[0].url, 500)} style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',/* 根据需要选择fill, contain, cover等 */
                    backgroundColor: BackgroundColorList().randomOf().color
                }} />
                </div>}
                {title && <div className="f-16 padding-w-10  gap-h-5 bold break-all">{title}</div>}
                {remark && <div className="remark padding-w-10 f-14 gap-h-5 break-all">{remark}</div>}
                {author && <div className="padding-w-10 gap-h-5">
                    <UserBox userid={author}>{(user) => {
                        return <div onMouseDown={e => {
                            e.stopPropagation();
                            useUserCard({ roundArea: Rect.fromEle(e.currentTarget as HTMLElement) }, { user, ws: this.dataGrid.page.ws })
                        }} className="flex" >
                            <a className="cursor   f-14   text-1 ">{user.name}</a>
                        </div>
                    }}</UserBox>
                </div>}
                <div className="pos-top pos-right  flex-end z-2  gap-t-5 r-size-24 r-gap-r-5 r-round r-cursor">
                    {this.isCanEdit && <span onMouseDown={e => self.openMenu(e)} className="bg-dark-1 visible text-white   flex-center">
                        <Icon size={18} icon={DotsSvg}></Icon>
                    </span>}
                </div>
            </div>
        }
        else if (cs.cardDisplay == 'card-2') {
            return <div className="w100 relative visible-hover" onMouseDown={e => self.openEdit(e)}>
                {author && <div className="text-1 padding-w-10  f-14 gap-h-5 flex">
                    <UserBox userid={author}>{(user) => {
                        return <div onMouseDown={e => {
                            e.stopPropagation();
                            useUserCard({ roundArea: Rect.fromEle(e.currentTarget as HTMLElement) }, { user, ws: this.dataGrid.page.ws })
                        }} className="flex" >
                            <Avatar size={24} user={user}></Avatar>
                            <a className="cursor gap-l-5 underline-hover text-1 ">{user.name}</a>
                        </div>
                    }}</UserBox>
                </div>}
                <div className="visible-hover gap-h-5 padding-w-10 max-h-300 overflow-hidden round-bottom-8 relative">
                    {hasPic && <img className="w100 block round-8 object-center" src={autoImageUrl(pics[0].url, 500)} style={{ backgroundColor: BackgroundColorList().randomOf().color }} />}
                </div>
                {title && <div className="text-1 f-16 bold padding-w-10  gap-h-5 bold break-all">{title}</div>}
                {remark && <div className="remark padding-w-10 f-14 gap-h-5 break-all">{remark}</div>}
                <div className="pos-top pos-right  flex-end z-2  gap-t-5 r-size-24 r-gap-r-5 r-round r-cursor">
                    {this.isCanEdit && <span onMouseDown={e => self.openMenu(e)} className="bg-dark-1 visible text-white   flex-center">
                        <Icon size={18} icon={DotsSvg}></Icon>
                    </span>}
                </div>
            </div>
        }
        else {
            return <div className="w100" onMouseDown={e => self.openEdit(e)}>
                <div className="visible-hover max-h-600 overflow-hidden round-bottom-8 relative">
                    {hasPic && <img className="w100 block round-8 object-center" src={autoImageUrl(pics[0].url, 500)} style={{ backgroundColor: BackgroundColorList().randomOf().color }} />}
                    {!hasPic && <div className={'round-8'} style={{
                        height: util.getRandom(150, 300),
                        backgroundColor: BackgroundColorList().randomOf().color
                    }}></div>}
                    {!hasPic && <div className="pos-center z-4 ">
                        <span onMouseDown={e => this.uploadImage('pic', e, 'title')} className="padding-w-5 visible  bg-dark-1 text-white round cursor flex">
                            <span className="size-20 flex-center flex-inline"><Icon size={16} icon={UploadSvg}></Icon></span>
                            <span className="f-14"><S>上传图片</S></span>
                        </span>
                    </div>}
                    <div className="mask-1 visible pos-inset z-1  round-8"></div>
                    <div className="pos-top pos-right  flex-end z-2  gap-t-5 r-size-24 r-gap-r-5 r-round r-cursor">
                        {this.isCanEdit && <span onMouseDown={e => self.openMenu(e)} className="bg-dark-1 visible text-white   flex-center">
                            <Icon size={18} icon={DotsSvg}></Icon>
                        </span>}
                    </div>
                </div>
                {tags && tags.length > 0 && <div className="padding-w-10  gap-h-5 flex">
                    {tags.map((t, i) => {
                        return <span className="round-16 padding-w-10 item-light-hover-focus h-24 flex-center f-12 gap-r-10" key={i}>{t.text}</span>
                    })}
                </div>}
                {title && <div className="text-1 padding-w-10  gap-h-5 bold break-all">{title}</div>}
                {remark && <div className="remark padding-w-10 f-12 gap-h-5 break-all">{remark}</div>}
                <div className="text-1 padding-w-10  f-14 gap-h-5 flex">
                    <div className="flex-fixed flex">
                        <UserBox userid={author}>{(user) => {
                            return <div onMouseDown={e => {
                                e.stopPropagation();
                                useUserCard({ roundArea: Rect.fromEle(e.currentTarget as HTMLElement) }, { user, ws: this.dataGrid.page.ws })
                            }} className="flex" >
                                <Avatar user={user}></Avatar>
                                <a className="cursor gap-l-5 underline-hover text-1 ">{user.name}</a>
                            </div>
                        }}</UserBox>
                    </div>
                    <div className="flex-auto flex-end">
                        <span onMouseDown={e => self.onUpdateCellInteractive(e, 'like')} className={"circle flex-center cursor" + (isLike ? " text-p" : " text-1")}>
                            <Icon size={16} icon={isLike ? LoveFillSvg : LoveSvg}></Icon>
                        </span>
                        {like.count > 0 && <span className="text-1 cursor gap-l-5">{like.count}</span>}
                    </div>
                </div>
            </div>
        }
    }
} 