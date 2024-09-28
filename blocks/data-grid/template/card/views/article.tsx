

import React from "react";
import { DotsSvg, EyeSvg, LikeSvg } from "../../../../../component/svgs";
import { Avatar } from "../../../../../component/view/avator/face";
import { UserBox } from "../../../../../component/view/avator/user";
import { Icon } from "../../../../../component/view/icon";
import { ResourceArguments } from "../../../../../extensions/icon/declare";
import * as Card1 from "../../../../../src/assert/img/card/card2.png"
import { FieldType } from "../../../schema/type";
import { CardModel, CardViewCom } from "../factory/observable";
import { CardView } from "../view";
import { BlockUrlConstant } from "../../../../../src/block/constant";
import { buildPageData } from "../../../../../src/page/common/create";
import { lst } from "../../../../../i18n/store";
import { autoImageUrl } from "../../../../../net/element.type";
import dayjs from "dayjs";
import { MenuItem, MenuItemType } from "../../../../../component/view/menu/declare";
import { BlockDirective, BlockRenderRange } from "../../../../../src/block/enum";
import { util } from "../../../../../util/util";
import { loadPageUrlData } from "../../create";
import { OptionColorRandom } from "../../../../../extensions/color/data";
import { Divider } from "../../../../../component/view/grid";
import { useSelectMenuItem } from "../../../../../component/view/menu";
import { Rect } from "../../../../../src/common/vector/point";
import { useOpenReport } from "../../../../../extensions/report";

/**
 * 
 * 原型参考
 * https://sspai.com/
 * 
 */
CardModel('/article', () => ({
    url: '/article',
    title: lst('图文'),
    image: Card1.default,
    renderCover() {
        return <div>
            <div className="flex">
                <div className="flex-fixed gap-l-5 gap-h-5 flex-center h-24" style={{ color: 'var(--bg)' }}>
                    <Icon size={24} icon={{ name: "byte", code: 'picture' }}></Icon>
                </div>
                <div className="flex-auto gap-w-5 gap-h-5">
                    <div className="bg h-5 w70" ></div>
                    <div className="gap-t-5 bg h-10"></div>
                </div>
            </div>
        </div>
    },
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
            text: lst('插图'),
            types: [FieldType.thumb, FieldType.image, FieldType.cover, FieldType.video]
        },
        { name: 'remark', text: lst('简介'), types: [FieldType.plain, FieldType.text] },
        { name: 'like', text: lst('点赞'), types: [FieldType.like] },
        { name: 'author', text: lst('作者'), types: [FieldType.creater, FieldType.user] },
        {
            name: 'tags',
            text: lst('分类'),
            types: [FieldType.option, FieldType.options],
            config: {
                options: [
                    {
                        text: lst('生活'),
                        value: '1',
                        ...OptionColorRandom()
                    },
                    {
                        text: lst('工作'),
                        value: '2',
                        ...OptionColorRandom()
                    },
                    {
                        text: lst('咨询'),
                        value: '3',
                        ...OptionColorRandom()
                    }
                ]
            }
        },
        { name: 'date', text: lst('日期'), types: [FieldType.createDate, FieldType.date] },
        { name: 'comment', text: lst('评论'), types: [FieldType.comment] },
        { name: 'browse', text: lst('浏览量'), types: [FieldType.browse] },
    ],
    async createViews() {
        return [
            {
                url: BlockUrlConstant.DataGridTable,
                text: lst('文章')
            },
            { autoCreate: true, url: BlockUrlConstant.DataGridList, text: lst('文章列表'), },
            {
                url: BlockUrlConstant.RecordPageView,
                text: lst('文章详情'),
                snap: await buildPageData([
                    '',
                    ''
                ], { isTitle: true, isComment: true })
            }
        ]
    },
    async createDataList() {
        return [
            {
                pic: [{ url: 'https://api-w1.shy.live/ws/img?id=3a144b9275b848c4b4382eab4d3027c6' }],
                title: '如何才能保持自己对生活的热爱',
                snap: await loadPageUrlData('如何才能保持自己对生活的热爱'),
                tags: '1'
            },
            {
                pic: [{ url: 'https://api-w1.shy.live/ws/img?id=3e4cfb20708e44c0925d0dbb1a647e99' }],
                title: '如何整理信息做笔记',
                snap: await loadPageUrlData("如何整理信息做笔记"),
                tags: '2'
            }
        ]
    }
}))

@CardViewCom('/article')
export class CardPin extends CardView {
    async onGetMenus(): Promise<MenuItem<string | BlockDirective>[]> {
        var rs = await super.onGetMenus();
        var at = rs.findIndex(x => x.name == 'openSlide');
        var cs = this.cardSettings<{ cardDisplay: string, rank: boolean, align: 'left' | 'right' }>({ cardDisplay: 'card-1', rank: false, align: 'left' });
        if (at > -1) {
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
                        { name: 'cardDisplay', text: '卡片4', checkLabel: cs.cardDisplay == 'card-4' ? true : false, value: 'card-4' }
                    ]
                },
                { type: MenuItemType.divide },
                {
                    type: MenuItemType.switch,
                    text: lst('排名'),
                    checked: cs.rank,
                    name: 'rank'
                }
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
        else if (item.name == 'cardDisplay') {
            await self.dataGrid.onUpdateProps({ 'cardSettings.cardDisplay': item.value }, { range: BlockRenderRange.self })
            self.dataGrid.forceUpdateAllViews();
        }
        else if (item.name == 'rank') {
            await self.dataGrid.onUpdateProps({ 'cardSettings.rank': item.value }, { range: BlockRenderRange.self })
            self.dataGrid.forceUpdateAllViews();
        }
        else await super.onClickContextMenu(item, event, options);
    }
    async onContextMenuInput(item: MenuItem<BlockDirective | string>, options?: { merge?: boolean }) {
        var self = this;
        if (item.name == 'rank') {
            await self.dataGrid.onUpdateProps({ 'cardSettings.rank': item.value }, { range: BlockRenderRange.self })
            self.dataGrid.forceUpdateAllViews();
        }
        else await super.onContextMenuInput(item, options);
    }
    async onProperty(event: React.MouseEvent, options?: { elementUrl?: string, content?: string }) {
        event.stopPropagation();
        var r = await useSelectMenuItem(
            { roundArea: Rect.fromEle(event.currentTarget as HTMLElement) },
            [{ name: 'report', text: lst('举报'), icon: { name: 'bytedance-icon', code: 'harm' } }]
        );
        if (r?.item?.name) {
            if (r.item.name == 'report') {
                await useOpenReport({
                    userid: this.dataGrid.page.user?.id,
                    reportElementUrl: options?.elementUrl,
                    reportContent: options?.content
                });
            }
        }
    }
    render() {
        var self = this;
        var pics = this.getValue<ResourceArguments[]>('pic');
        var tags = this.getValue<{ text: string, color: string }[]>('tags', FieldType.option);
        var hasPic = Array.isArray(pics) && pics.length > 0;
        var author = this.getValue<string[]>('author', FieldType.creater)[0];
        var title = this.getValue<string>('title');
        var remark = this.getValue<string>('remark');
        var date = this.getValue<Date>('date');
        var comment = this.getValue<{ count: number, users: string[] }>('comment', FieldType.comment);
        var like = this.getValue<{ count: number, users: string[] }>('like', FieldType.like);
        var isLike = this.isEmoji('like');
        var cs = this.cardSettings<{ cardDisplay: string, rank: boolean, }>({ rank: false, cardDisplay: 'card-1' });
        var browse = this.getValue<{ count: number, users: string[] }>('browse', FieldType.browse);
        var index = this.getRowIndex() + 1;
        if (cs.cardDisplay == 'card-1') {
            return <div>
                <div onMouseDown={e => this.openEdit()} className={"relative gap-h-10 visible-hover " + (hasPic ? "flex  flex-full  " : "")}>
                    {cs.rank && <div
                        className={"flex-fixed flex-center gap-r-10 " + ("w-40") + " " + (index <= 3 ? "text-p" : "text")}
                        style={{ fontSize: '40px', fontStyle: 'italic' }}>
                        {index}
                    </div>}
                    {hasPic && <div className="flex-fixed">
                        <img style={{ height: 140 }} className="w-200 h-150 block round  object-center" src={autoImageUrl(pics[0].url, 250)} />
                    </div>}
                    <div className={"flex flex-col flex-full " + (hasPic ? "flex-auto gap-l-10" : "")}>
                        <div className="f-16 bold flex-fixed">
                            <a href={this.props.item.dataLink} onClick={e => {
                                e.preventDefault()
                            }} style={{ color: 'inherit', textDecoration: 'none' }}>{title}</a>
                        </div>
                        <div className="flex-auto">
                            {remark && <div className="f-14 remark rows-3">{remark}</div>}
                            {tags.length > 0 && <div className="flex gap-h-5">{tags.map((tag, i) => {
                                return <span className="item-light-hover-focus f-12 remark flex-center round padding-w-5 h-20" key={i}>#{tag.text}</span>
                            })}</div>}
                        </div>
                        <div className="flex flex-fixed">
                            {author && <div className="flex-fixed flex">
                                <UserBox userid={author}>{(user) => {
                                    return <div className="flex gap-r-10">
                                        <Avatar size={24} user={user}></Avatar>
                                        <a className="cursor gap-l-5 underline-hover text-1">{user.name}</a>
                                    </div>
                                }}</UserBox><span className="remark f-12">{util.showTime(date)}</span>
                            </div>}
                            <div className="flex-auto flex flex-end remark">
                                <span className="flex gap-r-15"><Icon size={16} icon={EyeSvg}></Icon><span className="gap-l-5 f-14">{browse.count}</span></span>
                                <span className={"cursor  flex gap-r-15 " + (isLike ? "fill-p" : "text-hover")} onMouseDown={e => self.onUpdateCellInteractive(e, 'like')}><Icon size={16} icon={LikeSvg}></Icon><span className="gap-l-5 f-14">{like.count}</span></span>
                                <span className="flex"><Icon size={16} icon={{ name: 'byte', code: 'message' }}></Icon><span className="gap-l-5 f-14">{comment.count}</span></span>
                            </div>
                        </div>
                    </div>
                    <div className="pos-t-r z-2   r-size-24  r-round r-cursor">
                        {this.isCanEdit && <span onMouseDown={e => self.openMenu(e)} className="visible item-hover   flex-center">
                            <Icon size={18} icon={DotsSvg}></Icon>
                        </span>}
                    </div>
                </div>
                <Divider></Divider>
            </div>
        }
        else if (cs.cardDisplay == 'card-2') {
            return <div><div onMouseDown={e => this.openEdit(e)} className={"relative  gap-h-10  visible-hover " + (hasPic ? "flex  flex-full  " : "")}>
                {cs.rank && <div
                    className={"flex-fixed flex-center gap-r-10 " + ("w-40") + " " + (index <= 3 ? "text-p" : "text")}
                    style={{ fontSize: '40px', fontStyle: 'italic' }}>
                    {index}
                </div>}
                <div className={" " + (hasPic ? "flex-auto gap-r-10" : "")}>
                    <div className="f-16 bold"> <a href={this.props.item.dataLink} onClick={e => {
                        e.preventDefault()
                    }} style={{ color: 'inherit', textDecoration: 'none' }}>{title}</a></div>
                    <div className="f-14 remark min-h-60 rows-3">{remark}</div>
                    {tags.length > 0 && <div className="flex gap-h-5">{tags.map((tag, i) => {
                        return <span className="item-light-hover-focus f-12 remark flex-center round padding-w-5 h-20" key={i}>#{tag.text}</span>
                    })}</div>}
                    <div className="f-12 remark flex r-gap-r-10">
                        <UserBox userid={author}>{(user) => {
                            return <a className="cursor gap-l-5 underline-hover text-1">{user.name}</a>
                        }}</UserBox>
                        <span className="gap-w-5">{dayjs(date).format('YYYY-MM-DD')}</span>
                        <span onMouseDown={e => self.onUpdateCellInteractive(e, 'like')} className={"flex " + (isLike ? "fill-p" : " text-hover")}><Icon size={14} icon={LikeSvg}></Icon><span className="gap-l-5 f-14">{like.count}</span></span>
                        <span className="flex"><Icon size={14} icon={{ name: 'byte', code: 'message' }}></Icon><span className="gap-l-5 f-14">{comment.count}</span></span>
                    </div>
                </div>
                {hasPic && <div className="flex-fixed ">
                    <img draggable={false} style={{ height: 140 }} className="w-200 h-150 block round  object-center" src={autoImageUrl(pics[0].url, 250)} />
                </div>}
                <div className="pos-t-r  z-2   r-size-24  r-round r-cursor">
                    {this.isCanEdit && <span onMouseDown={e => self.openMenu(e)} className="bg-dark-1 visible text-white   flex-center">
                        <Icon size={18} icon={DotsSvg}></Icon>
                    </span>}
                </div>
            </div>
                <Divider></Divider>
            </div>
        }
        else if (cs.cardDisplay == 'card-3') {
            return <div>
                <div onMouseDown={e => this.openEdit()} className={"relative gap-h-10 visible-hover "}>

                    <div className="gap-h-10">
                        <div className="f-16 bold">
                            <a href={this.props.item.dataLink} onClick={e => {
                                e.preventDefault()
                            }} style={{ color: 'inherit', textDecoration: 'none' }}>{title}</a>
                        </div>
                    </div>

                    <div className="flex flex-top flex-full">
                        {hasPic && <div className="flex-fixed gap-r-10">
                            <img style={{ height: 140 }} className="w-180 h-120 block round  object-center" src={autoImageUrl(pics[0].url, 250)} />
                        </div>}
                        <div className="flex-auto">
                            {remark && <div className="f-14 remark rows-3">{remark}</div>}
                            {tags.length > 0 && <div className="flex gap-h-5">{tags.map((tag, i) => {
                                return <span className="item-light-hover-focus f-12 remark flex-center round padding-w-5 h-20" key={i}>#{tag.text}</span>
                            })}</div>}
                        </div>
                    </div>

                    <div className="flex r-gap-r-10 gap-h-10">

                        <span
                            onMouseDown={e => self.onUpdateCellInteractive(e, 'like')}
                            className={"cursor flex-center  padding-w-10 h-30 round  f-14" + (isLike ? " border-primary bg-primary text-white" : " border-0 bg-p-light text-p")}><Icon size={16} icon={LikeSvg}></Icon>{like?.count > 0 && <span className="gap-l-3">{like?.count}</span>}</span>
                        <span className="flex"><Icon size={16} icon={{ name: 'byte', code: 'message' }}></Icon><span className="gap-l-5 f-14">{comment.count}</span></span>

                        <span onMouseDown={e => self.onProperty(e)}
                            className="visible item-hover   flex-center size-24 cursor round">
                            <Icon size={18} icon={DotsSvg}></Icon>
                        </span>

                    </div>

                    <div className="pos-t-r z-2   r-size-24  r-round r-cursor">
                        {this.isCanEdit && <span onMouseDown={e => self.openMenu(e)} className="visible item-hover   flex-center">
                            <Icon size={18} icon={DotsSvg}></Icon>
                        </span>}
                    </div>
                </div>
                <Divider></Divider>
            </div>
        }
        else if (cs.cardDisplay == 'card-4') {
            return <div><div onMouseDown={e => this.openEdit()} className={"relative gap-h-10 visible-hover " + (hasPic ? "flex  flex-full  " : "")}>
                {cs.rank && <div
                    className={"flex-fixed flex-center gap-r-10 " + ("w-40") + " " + (index <= 3 ? "text-p" : "text")}
                    style={{ fontSize: '40px', fontStyle: 'italic' }}>
                    {index}
                </div>}
                {hasPic && <div className="flex-fixed">
                    <img className="size-60 block round-8  object-center" src={autoImageUrl(pics[0].url, 250)} />
                </div>}
                <div className={" " + (hasPic ? "flex-auto gap-l-10" : "")}>
                    <div >
                        <a className="f-14 bold" href={this.props.item.dataLink} onClick={e => {
                            e.preventDefault()
                        }} style={{ color: 'inherit', textDecoration: 'none' }}>{title}</a>
                    </div>
                    {remark && <div className="f-14 remark rows-2">{remark}</div>}
                    {tags.length > 0 && <div className="flex gap-h-5">{tags.map((tag, i) => {
                        return <span className="item-light-hover-focus f-12 remark flex-center round padding-w-5 h-20" key={i}>#{tag.text}</span>
                    })}</div>}
                </div>
                <div className="pos-t-r z-2   r-size-24  r-round r-cursor">
                    {this.isCanEdit && <span onMouseDown={e => self.openMenu(e)} className="visible item-hover   flex-center">
                        <Icon size={18} icon={DotsSvg}></Icon>
                    </span>}
                </div>
            </div>
            </div>
        }
    }
}