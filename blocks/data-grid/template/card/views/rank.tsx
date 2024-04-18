
import React from "react";
import { DotsSvg } from "../../../../../component/svgs";
import { UserBox } from "../../../../../component/view/avator/user";
import { MenuItem, MenuItemType } from "../../../../../component/view/menu/declare";
import { ResourceArguments } from "../../../../../extensions/icon/declare";
import { lst } from "../../../../../i18n/store";
import { autoImageUrl } from "../../../../../net/element.type";
import { BlockUrlConstant } from "../../../../../src/block/constant";
import { BlockDirective, BlockRenderRange } from "../../../../../src/block/enum";
import { buildPageData } from "../../../../../src/page/common/create";
import { FieldType } from "../../../schema/type";
import { CardModel, CardViewCom } from "../factory/observable";
import { CardView } from "../view";
import { Icon } from "../../../../../component/view/icon";
import { util } from "../../../../../util/util";

CardModel('/rank',() => ({
    url: '/rank',
    title: lst('排名'),
    forUrls: [BlockUrlConstant.DataGridList],
    props: [
        {
            name: 'title',
            text: lst('标题'),
            types: [FieldType.title, FieldType.text],
            required: true
        },
        {
            name: 'pic',
            text: lst('缩略图'),
            types: [FieldType.image, FieldType.video, FieldType.thumb, FieldType.cover],
            required: true
        },
        { name: 'remark', text: lst('简介'), types: [FieldType.plain, FieldType.text] },
        { name: 'like', text: lst('点赞'), types: [FieldType.like] },
        { name: 'author', text: lst('作者'), types: [FieldType.creater, FieldType.user] },
        { name: 'tags', text: lst('分类'), types: [FieldType.option, FieldType.options] },
        { name: 'date', text: lst('日期'), types: [FieldType.createDate, FieldType.date] },
        { name: 'comment', text: lst('评论'), types: [FieldType.comment] },
        { name: 'browse', text: lst('浏览量'), types: [FieldType.browse] },
    ],
    views: [
        { url: BlockUrlConstant.DataGridTable, text: lst('排名'), },
        { autoCreate: true, url: BlockUrlConstant.DataGridList, text: lst('排名列表'), },
        { url: BlockUrlConstant.RecordPageView, text: lst('排名详情'), }
    ],
    async createDataList() {
        return [
            {
                pic: [{ url: 'https://api-w1.shy.live/ws/img?id=1e1a07d5c333421c9cc885775b0ff17c' }],
                title: '花',
                snap: await buildPageData([
                    'eeeeeeee',
                    { url: BlockUrlConstant.Image, src: { url: 'https://api-w1.shy.live/ws/img?id=1e1a07d5c333421c9cc885775b0ff17c' } },
                    'gggggggggeeee'
                ], { isTitle: true, isComment: true })
            },
            {
                pic: [{ url: 'https://api-w1.shy.live/ws/img?id=08e4ff43377b4e13a618a183b3a82dc6' }], title: '水果季节',
                snap: await buildPageData([
                    'eeeeeeee',
                    { url: BlockUrlConstant.Image, src: { url: 'https://api-w1.shy.live/ws/img?id=08e4ff43377b4e13a618a183b3a82dc6' } },
                    'gggggggggeeee'
                ], { isTitle: true, isComment: true })
            },
            {
                pic: [{ url: 'https://api-w1.shy.live/ws/img?id=e90c90e3f4634b49a19eceba035d30d8' }], title: '盆栽',
                snap: await buildPageData([
                    'eeeeeeee',
                    { url: BlockUrlConstant.Image, src: { url: 'https://api-w1.shy.live/ws/img?id=e90c90e3f4634b49a19eceba035d30d8' } },
                    'gggggggggeeee'
                ], { isTitle: true, isComment: true })
            }
        ]
    }
}))

@CardViewCom('/rank')
export class CardPin extends CardView {
    async onGetMenus(): Promise<MenuItem<string | BlockDirective>[]> {
        var rs = await super.onGetMenus();
        var at = rs.findIndex(x => x.name == 'openSlide');
        if (at > -1)
        {
            var cs = this.cardSettings<{ align: 'left' | 'right', size: number }>({ align: 'left', size: 40 });
            rs.splice(at + 1,
                0,
                { type: MenuItemType.divide },
                {
                    icon: { name: 'byte', code: 'rectangle-one' },
                    text: lst('排名位于'),
                    childs: [
                        { name: 'align', text: lst('居左'), value: 'left', icon: { name: 'byte', code: 'align-left' } },
                        { name: 'align', text: lst('居右'), value: 'right', icon: { name: 'byte', code: 'align-right' } }
                    ]
                },
                {

                    icon: { name: 'byte', code: 'zoom-in' },
                    text: lst('大小'),
                    value: cs.size,
                    childs: [
                        { name: 'size', text: lst('大'), value: 100, checkLabel: cs.size == 100 },
                        { name: 'size', text: lst('中'), value: 70, checkLabel: cs.size == 70 },
                        { name: 'size', text: lst('小'), value: 40, checkLabel: cs.size == 40 }
                    ]
                },
                { type: MenuItemType.divide }
            )
        }
        return rs;
    }
    async onClickContextMenu(item: MenuItem<string | BlockDirective>, event: MouseEvent, options?: { merge?: boolean; }): Promise<void> {
        var self = this;
        if (item.name == 'align') {
            await self.dataGrid.onUpdateProps({ 'cardSettings.align': item.value }, { range: BlockRenderRange.self })
        }
        else if (item.name == 'size') {
            await self.dataGrid.onUpdateProps({ 'cardSettings.size': item.value }, { range: BlockRenderRange.self })
        }
        else await super.onClickContextMenu(item, event, options);
    }
    render() {
        var self = this;
        var pics = this.getValue<ResourceArguments[]>('pic');
        var tags = this.getValue<{ text: string, color: string }[]>('tags', FieldType.option);
        var hasPic = Array.isArray(pics) && pics.length > 0;
        var title = this.getValue<string>('title');
        var remark = this.getValue<string>('remark');
        var cs = this.cardSettings<{ align: 'left' | 'right', size: number }>({ align: 'left', size: 40 });
        var author = this.getValue<string[]>('author', FieldType.user)[0];
        var date = this.getValue<Date>('date');
        var index = this.getRowIndex() + 1;
        var numberSize = '20px';
        if (cs.size == 100) numberSize = '60px';
        else if (cs.size == 70) numberSize = '40px';
        if (cs.align == 'left') {
            return <div onMouseDown={e => this.openEdit(e)} className={"relative gap-h-10 visible-hover " + (hasPic ? "flex  flex-full  " : "")}>
                <div
                    className={"flex-fixed flex-center gap-r-10 " + ("w-40") + " " + (index <= 3 ? "text-p" : "text")}
                    style={{ fontSize: numberSize, fontStyle: 'italic' }}>
                    {index}
                </div>
                {hasPic && <div className="flex-fixed flex-center">
                    <img className={"size-" + cs.size + "  block round  object-center"} src={autoImageUrl(pics[0].url, 120)} />
                </div>}
                <div className={hasPic ? "flex-auto gap-l-10" : ""}>
                    <div className="f-16 bold">{title}</div>
                    {remark && <div className="f-12 remark rows-2">{remark}</div>}
                    {tags.length > 0 && <div className="flex">{tags.map((tag, i) => {
                        return <span className="item-light-hover-focus round padding-w-5 h-20 remark f-12" key={i}>#{tag.text}</span>
                    })}</div>}
                    {author && <div className="flex remark f-12 r-gap-r-5">
                        <UserBox userid={author}>{u => {
                            return <span>{u.name}</span>
                        }}</UserBox>
                        <span>{util.showTime(date)}</span>
                    </div>}
                </div>
                <div className="pos-top-full  flex-end z-2  gap-t-5 r-size-24 r-gap-r-5 r-round r-cursor">
                    {this.isCanEdit && <span onMouseDown={e => self.openMenu(e)} className="bg-dark-1 visible text-white   flex-center">
                        <Icon size={18} icon={DotsSvg}></Icon>
                    </span>}
                </div>
            </div>
        }
        else {

            return <div onMouseDown={e => this.openEdit(e)} className={"relative   gap-h-10  visible-hover  " + (hasPic ? "flex  flex-full  " : "")}>
                {hasPic && <div className="flex-fixed flex-center">
                    <img className={"size-" + cs.size + "  block round  object-center"} src={autoImageUrl(pics[0].url, 120)} />
                </div>}
                <div className={hasPic ? "flex-auto gap-l-10" : ""}>
                    <div className="f-16 bold">{title}</div>
                    {remark && <div className="f-12 remark rows-2">{remark}</div>}
                    {tags.length > 0 && <div className="flex">{tags.map((tag, i) => {
                        return <span className="item-light-hover-focus round padding-w-5 h-20 remark f-12" key={i}>#{tag.text}</span>
                    })}</div>}
                    {author && <div className="flex remark f-12 r-gap-r-5">
                        <UserBox userid={author}>{u => {
                            return <span>{u.name}</span>
                        }}</UserBox>
                        <span>{util.showTime(date)}</span>
                    </div>}
                </div>
                <div
                    className={"flex-fixed flex-center gap-l-10 " + "w-40" + " " + (index <= 3 ? "text-p" : "text")}
                    style={{ fontSize: numberSize, fontStyle: 'italic' }}>
                    {index}
                </div>
                <div className="pos-top pos-right  flex-end z-2  gap-t-5 r-size-24 r-gap-r-5 r-round r-cursor">
                    {this.isCanEdit && <span onMouseDown={e => self.openMenu(e)} className="bg-dark-1 visible text-white   flex-center">
                        <Icon size={18} icon={DotsSvg}></Icon>
                    </span>}
                </div>
            </div>
        }
    }
}