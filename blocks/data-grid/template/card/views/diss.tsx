import React from "react";
import { Avatar } from "../../../../../component/view/avator/face";
import { UserBox, UserBoxs } from "../../../../../component/view/avator/user";
import { ResourceArguments } from "../../../../../extensions/icon/declare";
import { autoImageUrl } from "../../../../../net/element.type";
import * as Card1 from "../../../../../src/assert/img/card/card8.png"
import { BlockUrlConstant } from "../../../../../src/block/constant";
import { util } from "../../../../../util/util";
import { FieldType } from "../../../schema/type";
import { CardModel, CardViewCom } from "../factory/observable";
import { CardView } from "../view";
import { LikeSvg, DotsSvg, Edit1Svg, TrashSvg } from "../../../../../component/svgs";
import { Icon } from "../../../../../component/view/icon";
import { buildPageData } from "../../../../../src/page/common/create";
import { lst } from "../../../../../i18n/store";
import { S } from "../../../../../i18n/view";
import { UserAvatars } from "../../../../../component/view/avator/users";
import { CommentListView } from "../../../../../extensions/comment/list";
import { Rect } from "../../../../../src/common/vector/point";
import { MenuItemType } from "../../../../../component/view/menu/declare";
import { useSelectMenuItem } from "../../../../../component/view/menu";
import { BlockRenderRange } from "../../../../../src/block/enum";
import { useImageViewer } from "../../../../../component/view/image.preview";

CardModel('/list/tizhi', () => ({
    url: '/list/tizhi',
    title: '讨论',
    renderCover() {
        return <div className="gap-h-5">
            <div className="flex gap-w-5 gap-b-3">
                <div className="flex-fixed size-16 circle bg " style={{ color: 'var(--bg)' }}></div>
                <div className="flex-auto bg h-5  round gap-l-5 w80"></div>
            </div>
            <div className="gap-w-5">
                <div className=" bg h-5 round gap-b-3"></div>
                <div className=" bg h-5  round w70"></div>
            </div>
        </div>
    },
    image: Card1.default,
    forUrls: [BlockUrlConstant.DataGridList],
    props: [
        { name: 'author', text: lst('作者'), types: [FieldType.creater] },
        { name: 'pic', text: lst('缩略图'), types: [FieldType.thumb, FieldType.image, FieldType.video], required: true },
        { name: 'title', text: lst('标题'), types: [FieldType.title, FieldType.text] },
        { name: 'remark', text: lst('描述'), types: [FieldType.plain, FieldType.text] },
        { name: 'like', text: lst('喜欢'), types: [FieldType.like] },
        { name: 'comment', text: lst('评论'), types: [FieldType.comment] },
        { name: 'createDate', text: lst("创建日期"), types: [FieldType.createDate] }
    ],
    views: [
        { url: BlockUrlConstant.DataGridTable, text: lst('话题'), },
        { autoCreate: true, url: BlockUrlConstant.DataGridList, text: lst('话题列表'), },
        { url: BlockUrlConstant.RecordPageView, text: lst('话题详情'), }
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

@CardViewCom('/list/tizhi')
export class CardTiZhi extends CardView {
    commentSpread: boolean = false;
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
                    if (r.item.name == 'remove') {
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
        var pics = this.getValue<ResourceArguments[]>('pic', FieldType.cover);
        if (pics && !Array.isArray(pics)) pics = [pics];
        var author = this.getValue<string[]>('author', FieldType.user)[0];
        var remark = this.getValue<string>('remark');
        var createDate = this.getValue<Date>('createDate');
        var like = this.getValue<{ count: number, users: string[] }>('like', FieldType.like);
        var isLike = this.isEmoji('like')
        var title = this.getValue<string>('title');
        var comment = this.getValue<{ count: number, users: string[] }>('comment', FieldType.comment);
        console.log('like', like);

        return <div className="w100 round padding-10 card-border gap-b-20 visible-hover" onMouseDown={e => self.openEdit(e)}>

            <UserBox userid={author}>{(user) => {
                return <div className="flex flex">
                    <div className="flex-fixed"><Avatar size={30} user={user}></Avatar></div>
                    <div className="flex-auto gap-l-5">
                        <div className="bold f-14 l-16">{user.name}</div>
                        <div className="remark f-12 l-16">{util.showTime(createDate)}&nbsp;</div>
                    </div>
                    <div className="flex-fixed">
                        <span className="size-24 cursor flex-center round item-hover visile" onMouseDown={e => this.openMenu(e)}><Icon icon={DotsSvg}></Icon></span>
                    </div>
                </div>
            }}</UserBox>

            {title && <div>
                <div className="h-20 gap-t-10 text f-16 bold">{title}</div>
            </div>}

            {remark && <div className="gap-h-10 f-14  text-1">
                {remark}
            </div>}

            <div className="flex flex-wrap gap-h-20">
                {pics.slice(0, 1).map(pic => {
                    return <div onMouseDown={e => {
                        e.stopPropagation();
                        useImageViewer(pic, pics);
                    }} key={pic.url} className="h-120 gap-r-10">
                        <img className="h100 obj-center round-8" src={autoImageUrl(pic.url, 500)} />
                    </div>
                })}
            </div>

            <div className="flex r-flex-fixed gap-t-10 r-gap-r-10 r-padding-w-10 remark     r-cursor r-flex">
                <span
                    onMouseDown={e => self.onUpdateCellInteractive(e, 'like')}
                    className={"h-30 border-light item-hover round-8 " + (isLike ? "fill-p" : " text-hover")}>
                    <Icon size={16} icon={LikeSvg}></Icon>
                    <span className="gap-l-5 f-14">{like.count}</span>
                </span>
                <span
                    className="h-30 flex border-light flex-center text-hover cursor item-hover round-8"
                    onMouseDown={e => {
                        e.stopPropagation()
                        this.commentSpread = this.commentSpread ? false : true;
                        this.forceUpdate();
                    }}><Icon size={16} icon={{ name: 'byte', code: 'message' }}></Icon>
                    <span className="gap-l-5 f-14">{comment.count}</span>
                </span>
            </div>
            {like.users?.length > 0 && <div className="gap-h-5 flex">
                <UserAvatars size={20} users={like.users}></UserAvatars>
                <UserBoxs userids={like.users}>{(users) => {
                    return <span className="remark f-12 gap-l-10"><S text="{name}等{total}人都觉得的很赞" data={{ name: users.map(c => c.name).join(","), total: like.count || like.users.length }}></S></span>
                }}</UserBoxs>
            </div>}
            {this.commentSpread && <div className="gap-h-5" onMouseDown={e => {
                e.stopPropagation();
            }}>
                <CommentListView ws={this.dataGrid.page.ws} userid={this.dataGrid.page.user?.id} elementUrl={this.props.item.elementUrl}></CommentListView>
            </div>}
        </div>
    }
} 