
import React from "react";
import { DotsSvg } from "../../../../../../component/svgs";
import { UserBox } from "../../../../../../component/view/avator/user";
import { MenuItem, MenuItemType } from "../../../../../../component/view/menu/declare";
import { ResourceArguments } from "../../../../../../extensions/icon/declare";
import { lst } from "../../../../../../i18n/store";
import { autoImageUrl } from "../../../../../../net/element.type";
import { BlockUrlConstant } from "../../../../../../src/block/constant";
import { BlockDirective, BlockRenderRange } from "../../../../../../src/block/enum";
import { buildPageData } from "../../../../../../src/page/common/create";
import { FieldType } from "../../../../schema/type";
import { CardModel, CardViewCom } from "../../factory/observable";
import { CardView } from "../../view";
import { Icon } from "../../../../../../component/view/icon";
import { util } from "../../../../../../util/util";
import * as Card1 from "../../../../../../src/assert/img/card/card10.png";

CardModel('/rank', () => ({
    url: '/rank',
    title: lst('排名'),
    forUrls: [BlockUrlConstant.DataGridList],
    image: Card1.default,
    props: [
        {
            name: 'title',
            text: lst('标题'),
            types: [FieldType.title, FieldType.text],
            required: true
        },
        {
            name: 'pic',
            text: lst('插图'),
            types: [FieldType.image, FieldType.video, FieldType.thumb, FieldType.cover]
        },
        { name: 'remark', text: lst('简介'), types: [FieldType.text, FieldType.plain] },
        { name: 'author', text: lst('作者'), types: [FieldType.creater, FieldType.user] },
        { name: 'tags', text: lst('分类'), types: [FieldType.option, FieldType.options] },
        { name: 'date', text: lst('日期'), types: [FieldType.createDate, FieldType.date] }
    ],
    views: [
        { url: BlockUrlConstant.DataGridTable, text: lst('排名'), },
        { autoCreate: true, url: BlockUrlConstant.DataGridList, text: lst('排名列表'), },
        { url: BlockUrlConstant.RecordPageView, text: lst('排名详情'), }
    ],
    async createDataList() {
        return [
            {
                pic: [{ url: 'https://api-w2.shy.live/ws/img?id=4b473a7ac43041bfbc030272d3abdca5' }],
                title: '诗云',
                remark: '诗云是一款知识协作生产力工具，它旨在帮助用户更高效地进行知识管理和协作',
                snap: await buildPageData([
                    { url: BlockUrlConstant.Image, src: { url: 'https://api-w2.shy.live/ws/img?id=4b473a7ac43041bfbc030272d3abdca5' } },
                    '诗云是一款知识协作生产力工具，它旨在帮助用户更高效地进行知识管理和协作'
                ], { isTitle: true, isComment: true })
            },
            {
                title: "Notion",
                remark: 'Notion 是一款全面的数字化协作工作管理工具，它集成了笔记、知识库和任务管理等功能，使个人和团队能够在一个平台上高效地进行信息组织、协作和项目管理。',
                pic: [{ url: 'https://api-w2.shy.live/ws/img?id=a639fe861c6e4be5a252eceb784e87f3' }],
                snap: await buildPageData([

                    { url: BlockUrlConstant.Image, src: { url: 'https://api-w2.shy.live/ws/img?id=a639fe861c6e4be5a252eceb784e87f3' } },
                    'Notion 是一款全面的数字化协作工作管理工具，它集成了笔记、知识库和任务管理等功能，使个人和团队能够在一个平台上高效地进行信息组织、协作和项目管理。'
                ], { isTitle: true, isComment: true })
            },
            {
                title: "滴答",
                remark: '滴答清单是一款实用的时间管理和任务规划工具，它帮助用户有效地记录、安排和追踪任务。',
                pic: [{ url: 'https://api-w2.shy.live/ws/img?id=32f9c9dd73d64358ae7b57f345b77128' }],
                snap: await buildPageData([
                    { url: BlockUrlConstant.Image, src: {url: 'https://api-w2.shy.live/ws/img?id=32f9c9dd73d64358ae7b57f345b77128' } },
                    '滴答清单是一款实用的时间管理和任务规划工具，它帮助用户有效地记录、安排和追踪任务。'
                ], { isTitle: true, isComment: true })
            }
        ]
    }
}))

@CardViewCom('/rank')
export class CardPin extends CardView {
    async onGetMenus()
    {
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
            return <div onMouseDown={e => this.openEdit(e)} className={"relative gap-h-10 visible-hover flex  flex-full"}>
                <div
                    className={"flex-fixed flex-center gap-r-10 " + ("w-40") + " " + (index <= 3 ? "text-p" : "text")}
                    style={{ fontSize: numberSize, fontStyle: 'italic' }}>
                    {index}
                </div>
                {hasPic && <div className="flex-fixed flex-center">
                    <img className={"size-" + cs.size + "  block round  object-center"} src={autoImageUrl(pics[0].url, 120)} />
                </div>}
                <div className={"flex-auto gap-l-10"}>
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
                <div className="pos-top-right  flex-end z-2  gap-t-5 r-size-24 r-gap-r-5 r-round r-cursor">
                    {this.isCanEdit && <span onMouseDown={e => self.openMenu(e)} className="bg-dark-1 visible text-white   flex-center">
                        <Icon size={18} icon={DotsSvg}></Icon>
                    </span>}
                </div>
            </div>
        }
    }
}