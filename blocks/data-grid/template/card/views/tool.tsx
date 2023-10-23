import { CardModel, CardViewCom } from "../factory/observable";
import * as Card1 from "../../../../../src/assert/img/card/card7.jpg"
import React, { ReactNode } from "react";
import { ResourceArguments } from "../../../../../extensions/icon/declare";
import { FieldType } from "../../../schema/type";
import { CardView } from "../view";
import { BlockUrlConstant } from "../../../../../src/block/constant";
import { autoImageUrl } from "../../../../../net/element.type";
import { LinkSvg, TriangleSvg } from "../../../../../component/svgs";
import { Icon } from "../../../../../component/view/icon";

/**
 * 
 * 原型参考
 * https://ai-bot.cn/
 * 
 */
CardModel({
    url: '/tool',
    title: ('app工具'),
    remark: ('app工具'),
    image: Card1.default,
    forUrls: [BlockUrlConstant.DataGridGallery],
    props: [
        {
            name: 'title',
            text: ('标题'),
            types: [FieldType.title, FieldType.text],
            required: true
        },
        {
            name: 'pic',
            text: ('插图'),
            types: [FieldType.image, FieldType.cover, FieldType.video],
            required: true
        },
        { name: 'remark', text: ('描述'), types: [FieldType.plain] },
    ],
    views: [
        { url: BlockUrlConstant.DataGridTable, text: ('app工具'), },
        { autoCreate: true, url: BlockUrlConstant.DataGridGallery, text: ('app工具列表'), },
        { url: BlockUrlConstant.RecordPageView, text: ('app工具详情'), }
    ],
    dataList: [
        { pic: [{ url: 'https://api-w2.shy.live/ws/img?id=1fcdc66fd4fd47e1a5d375cad8241c1a' }], title: 'Midjourney', remark: 'Midjourney是一个文本生成图像的AI工具' },
        { pic: [{ url: 'https://api-w2.shy.live/ws/img?id=7ef5341c7a224d38a73a39dc459d6b2f' }], title: 'Stable Diffusion', remark: 'Stable Diffusion 是于2022年发布的一个基于深度学习的AI文本到图像生成模型' },
    ]
})
@CardViewCom('/tool')
export class CardPin extends CardView {
    render(): ReactNode {
        var self = this;
        var pics = this.getValue<ResourceArguments[]>('pic');
        var hasPic = Array.isArray(pics) && pics.length > 0;
        var title = this.getValue<string>('title');
        var remark = this.getValue<string>('remark');

        return <div className="cursor round border h-100 item-hover padding-10" onMouseDown={e => self.openEdit(e)}>
            <div className="flex">
                <div className="flex-fixed">
                    {hasPic && <img className="size-80 block round-16 object-center" src={autoImageUrl(pics[0].url, 250)} />}
                </div>
                <div className="flex-auto gap-l-10">
                    <div className="h4">{title}</div>
                    <div className="remark f-12 h-40 l-20 text-overflow-wrap">{remark}</div>
                </div>
            </div>
        </div>
    }
}

CardModel({
    url: '/app/list',
    title: ('app应用'),
    remark: ('app应用列表'),
    image: Card1.default,
    forUrls: [BlockUrlConstant.DataGridGallery],
    props: [
        {
            name: 'title',
            text: ('应用名称'),
            types: [FieldType.title, FieldType.text],
            required: true
        },
        {
            name: 'pic',
            text: ('应用图标'),
            types: [FieldType.image, FieldType.video],
            required: true
        },
        { name: 'remark', text: ('描述'), types: [FieldType.plain] },
        { name: 'like', text: ('喜欢'), types: [FieldType.like] },
        { name: 'tags', text: ('分类'), types: [FieldType.options] },
        { name: 'comment', text: ('评论'), types: [FieldType.comment] },
        { name: 'url', text: '链接', types: [FieldType.link] }
    ],
    views: [
        { url: BlockUrlConstant.DataGridTable, text: ('app应用'), },
        { autoCreate: true, url: BlockUrlConstant.DataGridList, text: ('app应用列表'), },
        { url: BlockUrlConstant.RecordPageView, text: ('app应用详情'), }
    ],
    dataList: [
        { pic: [{ url: 'https://api-w2.shy.live/ws/img?id=1fcdc66fd4fd47e1a5d375cad8241c1a' }], title: 'Midjourney', remark: 'Midjourney是一个文本生成图像的AI工具' },
        { pic: [{ url: 'https://api-w2.shy.live/ws/img?id=7ef5341c7a224d38a73a39dc459d6b2f' }], title: 'Stable Diffusion', remark: 'Stable Diffusion 是于2022年发布的一个基于深度学习的AI文本到图像生成模型' },
    ]
})
@CardViewCom('/app/list')
export class AppList extends CardView {
    render() {
        var self = this;
        var pics = this.getValue<ResourceArguments[]>('pic');
        var hasPic = Array.isArray(pics) && pics.length > 0;
        var title = this.getValue<string>('title');
        var remark = this.getValue<string>('remark');
        // var comment = this.getValue<{ count: number, users: string[] }>('comment', FieldType.comment);
        var like = this.getValue<{ count: number, users: string[] }>('like', FieldType.like);
        var isLike = this.isEmoji('like');
        var tags = this.getValue<{ value: string, text: string, color: string }[]>('tags', FieldType.option);
        var link = this.getValue<string>('url', FieldType.link);
        return <div className="cursor round gap-h-10 visible-hover  item-light-hover padding-10" onMouseDown={e => self.openEdit(e, '/page/dialog')}>
            <div className="flex flex-top flex-full">
                <div className="flex-fixed">
                    {hasPic && <img className="size-80 block  object-center" src={autoImageUrl(pics[0].url, 250)} />}
                </div>
                <div className="flex-auto gap-l-10">
                    <div className="f-16 bold flex"><span>{title}</span><a className="visible gap-l-20" href={link}><Icon size={16} icon={LinkSvg}></Icon></a></div>
                    <div className="remark gap-h-5 f-16 max-h-40 l-20 text-overflow-wrap">{remark}</div>
                    <div className="flex f-12 remark r-gap-r-10">
                        {tags.map((tag, i) => {
                            return <span key={i}>#{tag.text}</span>
                        })}
                    </div>
                </div>
                <div className="flex-fixed">
                    <div className="flex flex-center flex-col size-60 round cursor border " onMouseDown={e => self.onUpdateCellInteractive(e, 'like')} style={{ color: isLike ? "#feb6b0" : undefined, border: isLike ? "1px solid #feb6b0" : undefined }}>
                        <Icon size={16} icon={TriangleSvg}></Icon>
                        <div className="flex-center">{like.count}</div>
                    </div>
                </div>
            </div>
        </div>
    }
} 
