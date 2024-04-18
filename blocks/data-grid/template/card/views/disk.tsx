import React from "react";
import { DotsSvg, PicSvg, VideoSvg, AudioSvg, FileSvg, DownloadSvg } from "../../../../../component/svgs";
import { Icon } from "../../../../../component/view/icon";
import { ResourceArguments } from "../../../../../extensions/icon/declare";
import * as Card1 from "../../../../../src/assert/img/card/card8.jpg"
import { BlockUrlConstant } from "../../../../../src/block/constant";
import { util } from "../../../../../util/util";
import { FieldType } from "../../../schema/type";
import { CardModel, CardViewCom } from "../factory/observable";
import { CardView } from "../view";
import { MenuItem, MenuItemType } from "../../../../../component/view/menu/declare";
import { lst } from "../../../../../i18n/store";
import { Avatar } from "../../../../../component/view/avator/face";
import dayjs from "dayjs";
import { BlockDirective } from "../../../../../src/block/enum";

CardModel('/list/disk', () => ({
    url: '/list/disk',
    title: lst('文件'),
    image: Card1.default,
    forUrls: [BlockUrlConstant.DataGridList],
    props: [
        { name: 'file', text: lst('文件'), types: [FieldType.file], required: true },
        { name: 'title', text: lst('标题'), types: [FieldType.title, FieldType.text] },
        { name: 'remark', text: lst('描述'), types: [FieldType.plain, FieldType.text] },
        { name: 'createDate', text: lst("创建日期"), types: [FieldType.createDate] },
        { name: 'tags', text: lst('分类'), types: [FieldType.option, FieldType.options] },
        { name: 'author', text: lst('作者'), types: [FieldType.creater, FieldType.user] },
    ],
    views: [
        { url: BlockUrlConstant.DataGridTable, text: lst('文件'), },
        { autoCreate: true, url: BlockUrlConstant.DataGridList, text: lst('文件列表'), },
        { url: BlockUrlConstant.RecordPageView, text: lst('文件详情'), }
    ],
    dataList: [
        { title: '花', remark: '', file: [{ size: 50, filename: 'kankan.png', ext: '.png', url: 'https://api-w1.shy.live/ws/img?id=1e1a07d5c333421c9cc885775b0ff17c' }], },
        { title: '水果季节', remark: '', file: [{ size: 50, filename: 'kankan.png', ext: '.png', url: 'https://api-w1.shy.live/ws/img?id=08e4ff43377b4e13a618a183b3a82dc6' }], },
        { title: '盆栽', remark: '', file: [{ size: 50, filename: 'kankan.png', ext: '.png', url: 'https://api-w1.shy.live/ws/img?id=e90c90e3f4634b49a19eceba035d30d8' }], },
    ]
}))

@CardViewCom('/list/disk')
export class CardPin extends CardView {
    async onGetMenus() {
        var rs = await super.onGetMenus();
        var at = rs.findIndex(x => x.name == 'openSlide');
        if (at > -1) {
            rs.splice(at + 1, 0,
                { type: MenuItemType.divide },
                { name: 'download', text: ('下载文件'), icon: DownloadSvg },
                { name: 'look', text: ('查看文件'), icon: { name: 'byte', code: 'arrow-right-up' } },
                { type: MenuItemType.divide }
            )
        }
        return rs;
    }
    async onClickContextMenu(item: MenuItem<string | BlockDirective>, event: MouseEvent, options?: { merge?: boolean; }): Promise<void> {
        var self = this;
        if (item.name == 'download') {
            var title = this.getValue<string>('title');
            var pics = this.getValue<ResourceArguments[]>('file', FieldType.file);
            await util.downloadFile(pics[0].url, title || pics[0].filename)
        }
        else if (item.name == 'look') {
            var pics = this.getValue<ResourceArguments[]>('file', FieldType.file);
            if (pics[0]?.url) {
                window.open(pics[0]?.url)
            }
        }
        else await super.onClickContextMenu(item, event, options);
    }
    async download(e: React.MouseEvent, url: string, filename: string) {
        e.stopPropagation();
        await util.downloadFile(url, filename)
    }
    render() {
        var self = this;
        var pics = this.getValue<ResourceArguments[]>('file', FieldType.file);
        var title = this.getValue<string>('title');
        var createDate = this.getValue<Date>('createDate');
        var author = this.getValue<string[]>('author', FieldType.user)[0];
        var tags = this.getValue<{ text: string, color: string }[]>('tags', FieldType.option);
        var size = 18;
        function getExtElement(ext) {
            var me = util.getFileMime(ext);
            if (me == 'image') { return <Icon size={size} icon={PicSvg}></Icon> }
            else if (me == 'video') { return <Icon size={size} icon={VideoSvg}></Icon> }
            else if (me == 'audio') return <Icon size={size} icon={AudioSvg}></Icon>
            else return <Icon size={size} icon={FileSvg}></Icon>
        }
        return <div className="w100 flex  item-light-hover padding-5 cursor round" onMouseDown={e => self.openEdit(e)}>
            <div className="flex-auto flex">
                <div className="flex-fixed flex">
                    <span className="gap-r-5 flex-center text-1">{getExtElement(pics[0].ext)}</span>
                    <span >{title || pics[0].filename}</span>
                </div>
                <div className="flex-fixed gap-l-20 flex">
                    {tags.length > 0 && tags.map((tag, i) => {
                        return <span className="padding-w-5 gap-r-5 l-20 h-20 f-14 round" style={{ backgroundColor: tag.color }} key={i}>{tag.text}</span>
                    })}
                </div>
            </div>
            {author && <div className="flex-fixed gap-w-10">
                <Avatar size={20} userid={author}></Avatar>
            </div>}
            <div onMouseDown={e => (this.download(e, pics[0]?.url, title || pics[0]?.filename))} className="flex-fixed remark text-over item-hover size-24 round cursor gap-w-5 flex-center">
                <Icon size={16} icon={DownloadSvg}></Icon>
            </div>
            <div onMouseDown={e => (this.openMenu(e))} className="flex-fixed remark text-over  item-hover size-24 round cursor gap-w-5 flex-center">
                <Icon size={16} icon={DotsSvg}></Icon>
            </div>
            <div className="flex-fixed gap-w-10 remark f-12">{util.byteToString(pics[0].size)}</div>
            <div className="flex-fixed gap-w-10 remark f-12">{dayjs(createDate).format('YYYY-MM-HH')}</div>
        </div>
    }
} 