
import React from "react";
import { DotsSvg, TriangleSvg } from "../../../../../component/svgs";
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
import * as Card1 from "../../../../../src/assert/img/card/card6.png";

CardModel('/voted', () => ({
    url: '/voted',
    title: lst('投票'),
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
            text: lst('图标'),
            types: [FieldType.image, FieldType.video, FieldType.thumb, FieldType.cover]
        },
        { name: 'remark', text: lst('简介'), types: [FieldType.text, FieldType.plain] },
        {
            name: 'vote', text: lst('投票'), types: [FieldType.vote],
            required: true
        },
        { name: 'author', text: lst('作者'), types: [FieldType.creater, FieldType.user] },
        { name: 'tags', text: lst('分类'), types: [FieldType.option, FieldType.options] },
        { name: 'date', text: lst('日期'), types: [FieldType.createDate, FieldType.date] }
    ],
    views: [
        { url: BlockUrlConstant.DataGridTable, text: ('投票'), },
        { autoCreate: true, url: BlockUrlConstant.DataGridList, text: ('投票列表'), },
        { url: BlockUrlConstant.RecordPageView, text: ('投票详情'), }
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
                    { url: BlockUrlConstant.Image, src: { url: 'https://api-w2.shy.live/ws/img?id=32f9c9dd73d64358ae7b57f345b77128' } },
                    '滴答清单是一款实用的时间管理和任务规划工具，它帮助用户有效地记录、安排和追踪任务。'
                ], { isTitle: true, isComment: true })
            }
        ]
    }
}))

@CardViewCom('/voted')
export class CardPin extends CardView {
    async onGetMenus() {
        var rs = await super.onGetMenus();
        var at = rs.findIndex(x => x.name == 'openSlide');
        if (at > -1) {
            var cs = this.cardSettings<{ align: 'left' | 'right', size: number }>({ align: 'left', size: 40 });
            rs.splice(at + 1,
                0,
                { type: MenuItemType.divide },
                {
                    icon: { name: 'byte', code: 'rectangle-one' },
                    text: lst('投票位于'),
                    childs: [
                        { name: 'align', text: lst('居左'), checkLabel: cs.align == 'left' ? true : false, value: 'left', icon: { name: 'byte', code: 'align-left' } },
                        { name: 'align', text: lst('居右'), checkLabel: cs.align == 'right' ? true : false, value: 'right', icon: { name: 'byte', code: 'align-right' } }
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
            self.dataGrid.forceUpdateAllViews();
        }
        else if (item.name == 'size') {
            await self.dataGrid.onUpdateProps({ 'cardSettings.size': item.value }, { range: BlockRenderRange.self })
            self.dataGrid.forceUpdateAllViews();
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
        var vote = this.getValue<{ count: number, users: string[] }>('vote', FieldType.vote);
        var isVote = this.isEmoji('vote');
        if (cs.align == 'left') {
            return <div
                onMouseDown={e => this.openEdit(e)}
                className={"relative card-border round padding-10 gap-h-10 visible-hover  flex"}>
                <div
                    style={{ borderWidth: 2 }}
                    onMouseDown={e => this.onUpdateCellInteractive(e, 'vote')}
                    className={"flex-fixed cursor flex-center flex-col  gap-r-10 " + ("size-" + 50) + " " + (isVote ? "border-p round-8" : "border round-8")}
                >
                    <Icon size={12} className={isVote ? "fill-p" : "text-1"} icon={TriangleSvg}></Icon>
                    <span className={isVote ? "text-p" : 'text-1'}>{vote?.count}</span>
                </div>
                {hasPic && <div className="flex-fixed flex-center">
                    <img draggable={false} className={"size-" + cs.size + "  block round  object-center"} src={autoImageUrl(pics[0].url, 120)} />
                </div>}
                <div className={"flex-auto gap-l-10"}>
                    <div className="f-16 bold">{title}</div>
                    {remark && <div className="f-14 remark rows-2">{remark}</div>}
                    {tags.length > 0 && <div className="flex">{tags.map((tag, i) => {
                        return <span className="item-light-hover-focus f-14 text-1 round padding-w-5 h-20" key={i}>#{tag.text}</span>
                    })}</div>}
                    {author && <div className="flex remark f-12 r-gap-r-5">
                        <UserBox userid={author}>{u => {
                            return <span>{u.name}</span>
                        }}</UserBox>
                        <span>{util.showTime(date)}</span>
                    </div>}
                </div>
                <div className="pos-top pos-right flex-end z-2  gap-t-5 r-size-24 r-gap-r-5 r-round r-cursor">
                    {this.isCanEdit && <span onMouseDown={e => self.openMenu(e)} className="item-hover remark visible    flex-center">
                        <Icon size={18} icon={DotsSvg}></Icon>
                    </span>}
                </div>
            </div>
        }
        else {
            return <div onMouseDown={e => this.openEdit(e)} className={"relative  card-border round padding-10   gap-h-10  visible-hover  flex"}>
                {hasPic && <div className="flex-fixed flex-center">
                    <img draggable={false} className={"size-" + cs.size + "  block round  object-center"} src={autoImageUrl(pics[0].url, 120)} />
                </div>}
                <div className={hasPic ? "flex-auto gap-l-10" : ""}>
                    <div className="f-16 bold">{title}</div>
                    {remark && <div className="f-14 remark rows-2">{remark}</div>}
                    {tags.length > 0 && <div className="flex">{tags.map((tag, i) => {
                        return <span className="item-light-hover-focus round padding-w-5 h-20 f-14 text-1 " key={i}>#{tag.text}</span>
                    })}</div>}
                    {author && <div className="flex remark f-12 r-gap-r-5">
                        <UserBox userid={author}>{u => {
                            return <span>{u.name}</span>
                        }}</UserBox>
                        <span>{util.showTime(date)}</span>
                    </div>}
                </div>
                <div
                    onMouseDown={e => this.onUpdateCellInteractive(e, 'vote')}
                    className={"flex-fixed cursor  flex flex-col flex-center  gap-r-10 " + ("size-" + 50) + " " + (isVote ? "border-p round-8" : "border round-8")}
                >
                    <Icon className={isVote ? "fill-p" : "text-1"} icon={{ name: 'byte', code: 'up-one' }}></Icon>
                    <span className={isVote ? "text-p" : 'text-1'}>{vote?.count}</span>
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