import React from "react";
import { Edit1Svg, TrashSvg, DotsSvg } from "../../../../../component/svgs";

import { useSelectMenuItem } from "../../../../../component/view/menu";
import { MenuItemType } from "../../../../../component/view/menu/declare";
import { ResourceArguments } from "../../../../../extensions/icon/declare";
import { lst } from "../../../../../i18n/store";
import { autoImageUrl } from "../../../../../net/element.type";
import { BlockUrlConstant } from "../../../../../src/block/constant";
import { BlockRenderRange } from "../../../../../src/block/enum";
import { Rect } from "../../../../../src/common/vector/point";
import { buildPageData } from "../../../../../src/page/common/create";
import { FieldType } from "../../../schema/type";
import { CardModel, CardViewCom } from "../factory/observable";
import { CardView } from "../view";
import { Icon } from "../../../../../component/view/icon";
import { UserBox } from "../../../../../component/view/avator/user";
import { util } from "../../../../../util/util";


CardModel('/text/image', () => ({
    url: '/text/image',
    title: lst('图文'),
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
            types: [FieldType.image, FieldType.video,FieldType.thumb,  FieldType.cover],
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
        { url: BlockUrlConstant.DataGridTable, text: ('文章'), },
        { autoCreate: true, url: BlockUrlConstant.DataGridList, text: ('文章列表'), },
        { url: BlockUrlConstant.RecordPageView, text: ('文章详情'), }
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

@CardViewCom('/text/image')
export class CardPin extends CardView {
    async openMenu(event: React.MouseEvent) {
        var self = this;
        var ele = event.currentTarget as HTMLElement;
        event.stopPropagation();
        var cs = this.cardSettings<{ align: 'left' | 'right', size: number }>({ align: 'left', size: 40 });
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
                        value: cs.align,
                        options: [
                            { text: lst('居左'), value: 'left' },
                            { text: lst('居右'), value: 'right' }
                        ]
                    },
                    {
                        name: 'size',
                        icon: { name: 'byte', code: 'zoom-in' },
                        text: lst('大小'),
                        type: MenuItemType.select,
                        value: cs.size,
                        options: [
                            { text: lst('大'), value: 100 },
                            { text: lst('中'), value: 70 },
                            { text: lst('小'), value: 40 }
                        ]
                    },
                    { type: MenuItemType.divide },
                    { name: 'remove', icon: TrashSvg, text: lst('删除') }
                ], {
                    async input(item) {
                        if (item.name == 'align')
                            await self.dataGrid.onUpdateProps({ 'cardSettings.align': item.value }, { range: BlockRenderRange.self })
                        else if (item.name == 'size')
                            await self.dataGrid.onUpdateProps({ 'cardSettings.size': item.value }, { range: BlockRenderRange.self })
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
        var title = this.getValue<string>('title');
        var remark = this.getValue<string>('remark');
        var cs = this.cardSettings<{ align: 'left' | 'right', size: number }>({ align: 'left', size: 40 });
        var author = this.getValue<string[]>('author', FieldType.user)[0];
        var date = this.getValue<Date>('date');
        if (cs.align == 'left') {

            return <div onMouseDown={e => this.openEdit(e)} className={"relative gap-h-10 visible-hover " + (hasPic ? "flex  flex-full  " : "")}>
                {hasPic && <div className="flex-fixed">
                    <img className={"size-" + cs.size + "  block round  object-center"} src={autoImageUrl(pics[0].url, 120)} />
                </div>}
                <div className={hasPic ? "flex-auto gap-l-10" : ""}>
                    <div className="f-16 bold">{title}</div>
                    <div className="f-12 remark rows-2" style={{ minHeight: cs.size >= 70 ? 40 : undefined }}>{remark}</div>
                    {tags.length > 0 && <div className="flex">{tags.map((tag, i) => {
                        return <span className="item-light-hover-focus round padding-w-5 h-20" key={i}>#{tag.text}</span>
                    })}</div>}
                    {author && <div className="flex remark f-12 r-gap-r-5">
                        <UserBox userid={author}>{u => {
                            return <span>{u.name}</span>
                        }}</UserBox>
                        <span>{util.showTime(date)}</span>
                    </div>}
                </div>
                <div className="pos-top pos-right  flex-end z-2  gap-t-5 r-size-24 r-gap-r-5 r-round r-cursor">
                    {this.isCanEdit && <span onMouseDown={e => self.openMenu(e)} className="bg-dark-1 visible text-white   flex-center">
                        <Icon size={18} icon={DotsSvg}></Icon>
                    </span>}
                </div>
            </div>
        }
        else {
            return <div onMouseDown={e => this.openEdit(e)} className={"relative  gap-h-10  visible-hover  " + (hasPic ? "flex  flex-full  " : "")}>
                <div className={hasPic ? "flex-auto gap-r-10" : ""}>
                    <div className="f-16 bold">{title}</div>
                    <div className="f-12 remark rows-2" style={{ minHeight: cs.size >= 70 ? 40 : undefined }}>{remark}</div>
                    {tags.length > 0 && <div className="flex">{tags.map((tag, i) => {
                        return <span className="item-light-hover-focus round padding-w-5 h-20" key={i}>#{tag.text}</span>
                    })}</div>}
                    {author && <div className="flex remark f-12 r-gap-r-5">
                        <UserBox userid={author}>{u => {
                            return <span>{u.name}</span>
                        }}</UserBox>
                        <span>{util.showTime(date)}</span>
                    </div>}
                </div>
                {hasPic && <div className="flex-fixed">
                    <img className={"size-" + cs.size + " block round  object-center"} src={autoImageUrl(pics[0].url, 120)} />
                </div>}
                <div className="pos-top pos-right  flex-end z-2  gap-t-5 r-size-24 r-gap-r-5 r-round r-cursor">
                    {this.isCanEdit && <span onMouseDown={e => self.openMenu(e)} className="bg-dark-1 visible text-white   flex-center">
                        <Icon size={18} icon={DotsSvg}></Icon>
                    </span>}
                </div>
            </div>
        }
    }
}