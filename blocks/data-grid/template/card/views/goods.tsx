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
import { DotsSvg, UploadSvg } from "../../../../../component/svgs";
import { MenuItem, MenuItemType } from "../../../../../component/view/menu/declare";
import { BlockDirective, BlockRenderRange } from "../../../../../src/block/enum";
import { Rect } from "../../../../../src/common/vector/point";
import { Avatar } from "../../../../../component/view/avator/face";
import { UserBox } from "../../../../../component/view/avator/user";
import { channel } from "../../../../../net/channel";
import * as Card1 from "../../../../../src/assert/img/card/card4.png"

CardModel('/goods', () => ({
    url: '/goods',
    title: lst('商品'),
    forUrls: [BlockUrlConstant.DataGridGallery],
    image: Card1.default,
    props: [
        { name: 'author', text: lst('用户'), types: [FieldType.creater] },
        { name: 'title', text: lst('商品名'), types: [FieldType.title, FieldType.text], required: true },
        { name: 'pic', text: lst('商品图片'), types: [FieldType.image, FieldType.thumb, FieldType.cover, FieldType.video], required: true },
        { name: 'price', text: lst('价格'), types: [FieldType.number], required: true },
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
            },
            required: true
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
            pic: [{ url: 'https://api-w1.shy.live/ws/img?id=cb002dd452134418ad288c2b8db84198' }],
            price: 198,
            count: 100,
            soldCount: 1000,
            address: '广东',
            tags: ['1', '2'],
        },
        {
            title: '美瑞衣橱新中式国风羽绒服连衣裙女冬季2023新款加绒加厚两件套装',
            pic: [{ url: 'https://api-w1.shy.live/ws/img?id=c445a3e7efbb4a6db836e85804688453' }],
            price: 388,
            count: 100,
            soldCount: 30,
            address: '江苏',
            tags: ['2'],
        },
        {
            title: 'nasa美式拼接假两件棉服外套女2023潮情侣爆款新加厚棉衣袄子冬装',
            pic: [{ url: 'https://api-w1.shy.live/ws/img?id=d6ee0331614942faa050c7fca640c55d' }],
            price: 588,
            count: 100,
            soldCount: 10,
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
        var cs = this.cardSettings<{ autoSize: boolean }>({ autoSize: true });
        if (at > -1) {
            rs.splice(at + 1, 0,
                { type: MenuItemType.divide },
                { name: 'autoSize', checked: cs.autoSize, type: MenuItemType.switch, icon: { name: 'byte', code: 'auto-height-one' }, text: lst('自适应高度') },
                { name: 'replace', icon: UploadSvg, text: lst('上传商品图片') },
                { type: MenuItemType.divide }
            )
        }
        return rs;
    }
    async onContextMenuInput(item: MenuItem<string | BlockDirective>, options?: { merge?: boolean; }): Promise<void> {
        if (item.name == 'autoSize') {
            await this.dataGrid.onUpdateProps({ 'cardSettings.autoSize': item.checked }, { range: BlockRenderRange.self })
        }
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
        var soldCount = this.getValue<number>('soldCount');
        var price = this.getValue<number>('price');
        var tags = this.getValue<{ text: string, color: string }[]>('tags', FieldType.option);
        var pics = this.getValue<ResourceArguments[]>('pic');
        var tags = this.getValue<{ text: string, color: string }[]>('tags', FieldType.option);
        var hasPic = Array.isArray(pics) && pics.length > 0;
        var author = this.getValue<string[]>('author', FieldType.user)[0];
        var cs = this.cardSettings<{ autoSize: boolean }>({ autoSize: true });
        return <div onMouseDown={e => self.openEdit(e)} className="relative visible-hover">
            <div className="pos-top pos-right  flex-end z-2  gap-t-5 r-size-24 r-gap-r-5 r-round r-cursor">
                {this.isCanEdit && <span onMouseDown={e => self.openMenu(e)} className="bg-dark-1 visible text-white   flex-center">
                    <Icon size={18} icon={DotsSvg}></Icon>
                </span>}
            </div>
            {hasPic && <div className="flex-fixed flex-center" >
                <img className={"w100 block round  object-center" + (cs.autoSize ? " max-h-600 overflow-hidden" : " h-200 ")} src={autoImageUrl(pics[0].url || (pics[0] as any).src, 250)} />
            </div>}
            <div className="text-1 rows-2 padding-w-10  gap-h-5 bold break-all">{title}</div>
            <div className="flex padding-w-10 gap-h-10 ">
                <span className="flex-auto text-p">￥<em style={{ fontSize: '30px' }}>{util.showPrice(price)}</em></span>
                <span className="flex-fixed f-14 remark gap-w-10"><Sp text="{count}人付款" data={{ count: soldCount }}>{soldCount}人付款</Sp></span>
                <span className="flex-fixed f-14 remark">{address}</span>
            </div>
            {tags.length > 0 && <div className="padding-w-10 gap-h-10 flex flex-wrap">
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