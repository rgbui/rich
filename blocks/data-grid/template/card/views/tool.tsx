import { CardModel, CardViewCom } from "../factory/observable";
import * as Card1 from "../../../../../src/assert/img/card/card1.png"
import React, { ReactNode } from "react";
import { UploadSvg, TrashSvg, LoveSvg, DotsSvg } from "../../../../../component/svgs";
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
import { CardView } from "../view";
import { BlockUrlConstant } from "../../../../../src/block/constant";
import { autoImageUrl } from "../../../../../net/element.type";

/**
 * 
 * 原型参考
 * https://ai-bot.cn/
 * 
 */
CardModel({
    url: '/tool',
    title: 'app工具',
    remark: 'app工具',
    image: Card1.default,
    group: 'image',
    props: [
        {
            name: 'pic',
            text: '插图',
            types: [FieldType.image, FieldType.cover, FieldType.video],
            required: true
        },
        {
            name: 'title',
            text: '标题',
            types: [FieldType.title, FieldType.text],
            required: true
        },
        { name: 'remark', text: '描述', types: [FieldType.text] },
    ],
    views: [
        { url: BlockUrlConstant.DataGridTable, text: 'app工具', },
        { autoCreate: true, url: BlockUrlConstant.DataGridGallery, text: 'app工具列表', },
        { url: BlockUrlConstant.RecordPageView, text: 'app工具详情', }
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
@CardViewCom('/tool')
export class CardPin extends CardView {
    render(): ReactNode {
        var self = this;
        var pics = this.getValue<IconArguments[]>('pic');
        var hasPic = Array.isArray(pics) && pics.length > 0;
        var title = this.getValue<string>('title');
        var remark = this.getValue<string>('remark');

        return <div className="shadow cursor round box-border h-100 item-hover padding-10" onMouseDown={e => self.openEdit(e)}>
            <div className="flex">
                <div className="flex-fixed">
                    {hasPic && <img className="size-80 block round-16 object-center" src={autoImageUrl(pics[0].url, 250)} />}
                </div>
                <div className="flex-auto gap-l-10">
                    <div className="h4">{title}</div>
                    <div className="remark">{remark}</div>
                </div>
            </div>
        </div>
    }
} 