import React from "react";
import { lst } from "../../../../../i18n/store";
import { BlockUrlConstant } from "../../../../../src/block/constant";
import { FieldType } from "../../../schema/type";
import { CardModel, CardViewCom } from "../factory/observable";
import { CardView } from "../view";
import { ResourceArguments } from "../../../../../extensions/icon/declare";
import { autoImageUrl } from "../../../../../net/element.type";
import { Icon } from "../../../../../component/view/icon";
import { util } from "../../../../../util/util";
import { Sp } from "../../../../../i18n/view";
import { BackgroundColorList } from "../../../../../extensions/color/data";
import { Avatar } from "../../../../../component/view/avator/face";
import { UserBox } from "../../../../../component/view/avator/user";
import { channel } from "../../../../../net/channel";
import { DotsSvg, UploadSvg } from "../../../../../component/svgs";
import { MenuItem, MenuItemType } from "../../../../../component/view/menu/declare";
import { BlockDirective } from "../../../../../src/block/enum";
import { Rect } from "../../../../../src/common/vector/point";

CardModel('/goods', () => ({
    url: '/goods',
    title: lst('商品'),
    forUrls: [BlockUrlConstant.DataGridGallery],
    props: [
        { name: 'author', text: lst('用户'), types: [FieldType.creater] },
        { name: 'title', text: lst('商品名'), types: [FieldType.title, FieldType.text] },
        { name: 'remark', text: lst('商品描述'), types: [FieldType.plain] },
        { name: 'pic', text: lst('缩略图'), types: [FieldType.image, FieldType.thumb, FieldType.cover, FieldType.video], required: true },
        { name: 'price', text: lst('价格'), types: [FieldType.number] },
        { name: 'comment', text: lst('评论'), types: [FieldType.comment] },
        { name: 'count', text: lst('数量'), types: [FieldType.number] },
        { name: 'soldCount', text: lst('已售数量'), types: [FieldType.number] },
        { name: 'isShelf', text: lst('是否上架'), types: [FieldType.bool] },
        {
            name: 'tags',
            text: lst('分类'),
            types: [FieldType.options, FieldType.option],
            config: {
                options: [
                    { text: lst('包邮'), value: '1', color: BackgroundColorList().randomOf()?.color },
                    { text: lst('新品'), value: '2', color: BackgroundColorList().randomOf()?.color },
                    { text: lst('赚送险费'), value: '3', color: BackgroundColorList().randomOf()?.color }
                ]
            }
        },
        { name: 'date', text: lst('日期'), types: [FieldType.createDate, FieldType.date] },
        { name: 'address', text: lst('地址'), types: [FieldType.text] },
    ],
    views: [
        { url: BlockUrlConstant.DataGridTable, text: lst('商品'), },
        { autoCreate: true, url: BlockUrlConstant.DataGridGallery, text: lst('商品列表'), },
        { url: BlockUrlConstant.RecordPageView, text: lst('商品详情'), }
    ],
    dataList: [
        {
            title: '西装外套女春秋新款职业高级感西服修身气质套装设计感职场上衣',
            pic: [{ src: 'https://img.alicdn.com/imgextra/i2/25721340/O1CN01TApTcg1Lllbudla9B_!!0-saturn_solar.jpg_460x460q90.jpg_.webp' }],
            price: 168,
            count: 100,
            soldCount: 100,
            address: '广东',
            tags: ['1', '2'],
        },
        {
            title: '美瑞衣橱新中式国风羽绒服连衣裙女冬季2023新款加绒加厚两件套装',
            pic: [{ src: 'https://g-search3.alicdn.com/img/bao/uploaded/i4/i1/2096952851/O1CN0138V7tz1Wvo5jBSeJm_!!0-item_pic.jpg_460x460q90.jpg_.webp' }],
            price: 168,
            count: 100,
            soldCount: 100,
            address: '江苏',
            tags: ['2'],
        },
        {
            title: 'nasa美式拼接假两件棉服外套女2023潮情侣爆款新加厚棉衣袄子冬装',
            pic: [{ src: 'https://img.alicdn.com/imgextra/i2/25721340/O1CN01TApTcg1Lllbudla9B_!!0-saturn_solar.jpg_460x460q90.jpg_.webphttps://picasso.alicdn.com/imgextra/O1CNA1JTcfib1MXOpZhuOU9_!!3254611444-0-psf.jpg_460x460q90.jpg_.webp' }],
            price: 168,
            count: 100,
            soldCount: 100,
            address: '浙江',
            tags: ['3'],
        }
    ]
}))

@CardViewCom('/goods')
export class CardPin extends CardView {
    async onGetMenus() {
        var rs = await super.onGetMenus();
        var at = rs.findIndex(x => x.name == 'openSlide');
        if (at > -1) {
            rs.splice(at + 1, 0,
                { type: MenuItemType.divide },
                { name: 'replace', icon: UploadSvg, text: lst('上传商品图片') },
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
        else await super.onClickContextMenu(item, event, options);
    }
    render() {
        var self = this;
        var title = this.getValue<string>('title');
        var address = this.getValue<string>('address');
        var count = this.getValue<number>('count');
        var soldCount = this.getValue<number>('soldCount');
        var price = this.getValue<number>('price');
        var tags = this.getValue<{ text: string, color: string }[]>('tags', FieldType.option);
        var pics = this.getValue<ResourceArguments[]>('pic');
        var tags = this.getValue<{ text: string, color: string }[]>('tags', FieldType.option);
        var hasPic = Array.isArray(pics) && pics.length > 0;
        var author = this.getValue<string[]>('author', FieldType.user)[0];
        return <div onMouseDown={e => self.openEdit(e)} className="relative visible-hover">
            <div className="pos-top pos-right  flex-end z-2  gap-t-5 r-size-24 r-gap-r-5 r-round r-cursor">
                {this.isCanEdit && <span onMouseDown={e => self.openMenu(e)} className="bg-dark-1 visible text-white   flex-center">
                    <Icon size={18} icon={DotsSvg}></Icon>
                </span>}
            </div>
            {hasPic && <div className="flex-fixed flex-center" >
                <img className="h-200 w100 block round  object-center" src={autoImageUrl(pics[0].url, 250)} />
            </div>}
            <div className="text-1 rows-2 padding-w-10  gap-h-5 bold break-all">{title}</div>
            <div className="flex padding-w-10 gap-h-5 ">
                <span className="flex-auto text-p">￥<em style={{ fontSize: '30px' }}>{util.showPrice(price)}</em></span>
                <span className="flex-fixed f-14 remark gap-w-10"><Sp text="{count}人付款" data={{ count: soldCount }}>{count}人付款</Sp></span>
                <span className="flex-fixed f-14 remark">{address}</span>
            </div>
            {tags.length > 0 && <div className="padding-w-10  gap-h-5 flex flex-wrap">
                {tags.map((t, i) => {
                    return <span className="round-16 padding-w-5 border-p h-20 text-p flex-center f-12 gap-r-10" key={i}>{t.text}</span>
                })}
            </div>}
            {author && <UserBox userid={author}>{(user) => {
                return <div className="flex-fixed flex gap-w-10">
                    <span className="flex-auto flex">
                        <Avatar showName showCard size={20} userid={author}></Avatar>
                    </span>
                    <span onMouseDown={async e => {
                        e.stopPropagation();
                        await channel.act('/open/user/private/channel', { userid: user.id });
                    }} className="flex-fixed flex-center cursor  size-24 item-hover round remark">
                        <Icon size={16} icon={{ name: 'byte', code: 'message' }}></Icon>
                    </span>
                </div>
            }}</UserBox>}
        </div>
    }
} 