

import React from "react";
import { CommentSvg, DotsSvg, Edit1Svg, EyeSvg, LikeSvg, TrashSvg, UploadSvg } from "../../../../../component/svgs";
import { Avatar } from "../../../../../component/view/avator/face";
import { UserBox } from "../../../../../component/view/avator/user";
import { Icon } from "../../../../../component/view/icon";
import { ResourceArguments } from "../../../../../extensions/icon/declare";
import * as Card1 from "../../../../../src/assert/img/card/card1.png"
import { FieldType } from "../../../schema/type";
import { CardModel, CardViewCom } from "../factory/observable";
import { CardView } from "../view";
import { BlockUrlConstant } from "../../../../../src/block/constant";
import { buildPageData } from "../../../../../src/page/common/create";
import { lst } from "../../../../../i18n/store";
import { autoImageUrl } from "../../../../../net/element.type";
import dayjs from "dayjs";
import { Rect } from "../../../../../src/common/vector/point";
import { useSelectMenuItem } from "../../../../../component/view/menu";
import { MenuItemType } from "../../../../../component/view/menu/declare";
import { BlockRenderRange } from "../../../../../src/block/enum";
import { util } from "../../../../../util/util";
import { loadPageUrlData } from "../../create";
import { OptionBackgroundColorList } from "../../../../../extensions/color/data";
import { Divider } from "../../../../../component/view/grid";

/**
 * 
 * 原型参考
 * https://sspai.com/
 * 
 */
CardModel('/article', () => ({
    url: '/article',
    title: lst('文章'),
    image: Card1.default,
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
            types: [FieldType.thumb, FieldType.image, FieldType.cover, FieldType.video],
            required: true
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
                        color: OptionBackgroundColorList().randomOf().color
                    },
                    {
                        text: lst('工作'),
                        value: '2',
                        color: OptionBackgroundColorList().randomOf().color
                    },
                    {
                        text: lst('咨询'),
                        value: '3',
                        color: OptionBackgroundColorList().randomOf().color
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
                pic: [{ url: 'https://api-w1.shy.live/ws/img?id=08e4ff43377b4e13a618a183b3a82dc6' }],
                title: '红肉水果',
                snap: await loadPageUrlData('红肉水果'),
                tags: '1'
            },
            {
                pic: [{ url: 'https://api-w1.shy.live/ws/img?id=e90c90e3f4634b49a19eceba035d30d8' }],
                title: '如何种植盆栽',
                snap: await loadPageUrlData("如何种植盆栽"),
                tags: '2'
            },
            {
                pic: [{ url: 'https://api-w1.shy.live/ws/img?id=1e1a07d5c333421c9cc885775b0ff17c' }],
                title: '花',
                snap: await buildPageData([
                    { url: BlockUrlConstant.Image, src: { url: 'https://api-w1.shy.live/ws/img?id=1e1a07d5c333421c9cc885775b0ff17c' } },
                ], { isTitle: true, isComment: true }),
                tags: '3'
            },
        ]
    }
}))

@CardViewCom('/article')
export class CardPin extends CardView {
    async openMenu(event: React.MouseEvent) {
        var self = this;
        var ele = event.currentTarget as HTMLElement;
        event.stopPropagation();
        var action = async () => {
            ele.classList.remove('visible');
            try {
                var rect = Rect.fromEvent(event);
                var r = await useSelectMenuItem({ roundArea: rect }, [
                    { name: 'open', icon: Edit1Svg, text: lst('编辑') },
                    {
                        name: 'align',
                        icon: { name: 'byte', code: 'align-text-both' },
                        text: lst('对齐'),
                        type: MenuItemType.select,
                        options: [
                            { text: lst('居左'), value: 'left' },
                            { text: lst('居右'), value: 'right' }
                        ]
                    },
                    { type: MenuItemType.divide },
                    { name: 'remove', icon: TrashSvg, text: lst('删除') }
                ], {
                    async input(item) {
                        if (item.name == 'align')
                            await self.dataGrid.onUpdateProps({ 'cardSettings.align': item.value }, { range: BlockRenderRange.self })
                    },
                    click(item, event, clickName, mp) {

                    },
                });
                if (r) {
                    if (r.item.name == 'align') {
                        await self.dataGrid.onUpdateProps({ 'cardSettings.align': r.item.value }, { range: BlockRenderRange.self })
                    }
                    else if (r.item.name == 'remove') {
                        await self.deleteItem();
                    }
                    else if (r.item.name == 'open') {
                        await self.openEdit();
                    }
                }
            }
            catch (ex) {

            }
            finally {
                ele.classList.add('visible')
            }
        }
        if (this.dataGrid) this.dataGrid.onDataGridTool(async () => await action())
        else await action();
    }
    render() {
        var self = this;
        var pics = this.getValue<ResourceArguments[]>('pic');
        var tags = this.getValue<{ text: string, color: string }[]>('tags', FieldType.option);
        var hasPic = Array.isArray(pics) && pics.length > 0;
        var author = this.getValue<string[]>('author')[0];
        var title = this.getValue<string>('title');
        var remark = this.getValue<string>('remark');
        var date = this.getValue<Date>('date');
        var comment = this.getValue<{ count: number, users: string[] }>('comment', FieldType.comment);
        var like = this.getValue<{ count: number, users: string[] }>('like', FieldType.like);
        var isLike = this.isEmoji('like');
        var cs = this.cardSettings<{ align: 'left' | 'right' }>({ align: 'left' });
        var browse = this.getValue<{ count: number, users: string[] }>('browse', FieldType.browse);
        if (cs.align == 'left' || !cs.align) {
            return <div><div onMouseDown={e => this.openEdit()} className={"relative gap-h-10 visible-hover " + (hasPic ? "flex  flex-full  " : "")}>
                {hasPic && <div className="flex-fixed">
                    <img className="w-180 h-120 block round  object-center" src={autoImageUrl(pics[0].url, 250)} />
                </div>}
                <div className={"flex flex-col flex-full " + (hasPic ? "flex-auto gap-l-10" : "")}>
                    <div className="f-16 bold flex-fixed">
                        <a href={this.props.item.dataLink} onClick={e => {
                            e.preventDefault()
                        }} style={{ color: 'inherit', textDecoration: 'none' }}>{title}</a>
                    </div>
                    <div className="flex-auto">
                        {remark && <div className="f-12 remark rows-3">{remark}</div>}
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
                            <span className="flex"><Icon size={16} icon={CommentSvg}></Icon><span className="gap-l-5 f-14">{comment.count}</span></span>
                        </div>
                    </div>
                </div>
                <div className="pos-top-full  flex-end z-2  gap-t-5 r-size-24 r-gap-r-5 r-round r-cursor">
                    {this.isCanEdit && <span onMouseDown={e => self.openMenu(e)} className="visible item-hover   flex-center">
                        <Icon size={18} icon={DotsSvg}></Icon>
                    </span>}
                </div>
            </div>
                <Divider></Divider>
            </div>
        }
        else {
            return <div><div onMouseDown={e => this.openEdit(e)} className={"relative  gap-h-10  visible-hover " + (hasPic ? "flex  flex-full  " : "")}>
                <div className={" " + (hasPic ? "flex-auto gap-r-10" : "")}>
                    <div className="f-16 bold"> <a href={this.props.item.dataLink} onClick={e => {
                        e.preventDefault()
                    }} style={{ color: 'inherit', textDecoration: 'none' }}>{title}</a></div>
                    <div className="f-12 remark min-h-60 rows-3">{remark}</div>
                    {tags.length > 0 && <div className="flex gap-h-5">{tags.map((tag, i) => {
                        return <span className="item-light-hover-focus f-12 remark flex-center round padding-w-5 h-20" key={i}>#{tag.text}</span>
                    })}</div>}
                    <div className="f-12 remark flex r-gap-r-10">
                        <UserBox userid={author}>{(user) => {
                            return <a className="cursor gap-l-5 underline-hover text-1">{user.name}</a>
                        }}</UserBox>
                        <span className="gap-w-5">{dayjs(date).format('YYYY-MM-DD')}</span>
                        <span onMouseDown={e => self.onUpdateCellInteractive(e, 'like')} className={"flex " + (isLike ? "fill-p" : " text-hover")}><Icon size={14} icon={LikeSvg}></Icon><span className="gap-l-5 f-14">{like.count}</span></span>
                        <span className="flex"><Icon size={14} icon={CommentSvg}></Icon><span className="gap-l-5 f-14">{comment.count}</span></span>
                    </div>
                </div>
                {hasPic && <div className="flex-fixed ">
                    <img className="w-100 h-60 block round  object-center" src={autoImageUrl(pics[0].url, 250)} />
                </div>}
                <div className="pos-top pos-right  flex-end z-2  gap-t-5 r-size-24 r-gap-r-5 r-round r-cursor">
                    {this.isCanEdit && <span onMouseDown={e => self.openMenu(e)} className="bg-dark-1 visible text-white   flex-center">
                        <Icon size={18} icon={DotsSvg}></Icon>
                    </span>}
                </div>
            </div>
                <Divider></Divider>
            </div>
        }
    }
}