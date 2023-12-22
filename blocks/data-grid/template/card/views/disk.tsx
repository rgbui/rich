import React, { ReactNode } from "react";
import { DotsSvg, PicSvg, VideoSvg, AudioSvg, FileSvg, DownloadSvg, EditSvg, Edit1Svg, TrashSvg } from "../../../../../component/svgs";
import { Icon } from "../../../../../component/view/icon";
import { ResourceArguments } from "../../../../../extensions/icon/declare";
import * as Card1 from "../../../../../src/assert/img/card/card8.jpg"
import { BlockUrlConstant } from "../../../../../src/block/constant";
import { util } from "../../../../../util/util";
import { FieldType } from "../../../schema/type";
import { CardModel, CardViewCom } from "../factory/observable";
import { CardView } from "../view";
import { useSelectMenuItem } from "../../../../../component/view/menu";
import { Rect } from "../../../../../src/common/vector/point";
import { MenuItem, MenuItemType } from "../../../../../component/view/menu/declare";

CardModel({
    url: '/list/disk',
    title:( '网盘'),
    remark:('适用于管理文件') ,
    image: Card1.default,
    forUrls: [BlockUrlConstant.DataGridList],
    props: [
        { name: 'file', text: ('文件'), types: [FieldType.file], required: true },
        { name: 'title', text: ('标题'), types: [FieldType.title, FieldType.text] },
        { name: 'remark', text: ('描述'), types: [FieldType.plain, FieldType.text] },
        { name: 'createDate', text: ("创建日期"), types: [FieldType.createDate] }
    ],
    views: [
        { url: BlockUrlConstant.DataGridTable, text:('文件') , },
        { autoCreate: true, url: BlockUrlConstant.DataGridList, text: ('文件列表'), },
        { url: BlockUrlConstant.RecordPageView, text: ('文件详情'), }
    ],
    dataList: [
        { file: [{ size: 50, filename: 'kankan.png', ext: '.png', url: 'https://api-w1.shy.live/ws/img?id=1e1a07d5c333421c9cc885775b0ff17c' }], title: '花', remark: '' },
        { file: [{ size: 50, filename: 'kankan.png', ext: '.png', url: 'https://api-w1.shy.live/ws/img?id=08e4ff43377b4e13a618a183b3a82dc6' }], title: '水果季节', remark: '' },
        { file: [{ size: 50, filename: 'kankan.png', ext: '.png', url: 'https://api-w1.shy.live/ws/img?id=e90c90e3f4634b49a19eceba035d30d8' }], title: '盆栽', remark: '' },
        { file: [{ size: 50, filename: 'kankan.png', ext: '.png', url: 'https://api-w1.shy.live/ws/img?id=639fd35e2d91409fb7861841d6c6afa6' }], title: '花束', remark: '' },
        { file: [{ size: 50, filename: 'kankan.png', ext: '.png', url: 'https://api-w1.shy.live/ws/img?id=8206822bcf214b779b8fb05f42e1c55d' }], title: '伞', remark: '' },
        { file: [{ size: 50, filename: 'kankan.png', ext: '.png', url: 'https://api-w1.shy.live/ws/img?id=b7f399c7ffb5429c9ae7f521266735b6' }], title: '照片 女', remark: '' },
    ]
})
@CardViewCom('/list/disk')
export class CardPin extends CardView {
    render(): ReactNode {
        var self = this;
        var pics = this.getValue<ResourceArguments[]>('file', FieldType.file);
        if (pics && !Array.isArray(pics)) pics = [pics];
        var title = this.getValue<string>('title');
        var createDate = this.getValue<Date>('createDate');
        function getExtElement(ext) {
            var me = util.getFileMime(ext);
            if (me == 'image') { return <Icon size={20} icon={PicSvg}></Icon> }
            else if (me == 'video') { return <Icon size={20} icon={VideoSvg}></Icon> }
            else if (me == 'audio') return <Icon size={20} icon={AudioSvg}></Icon>
            else return <Icon size={20} icon={FileSvg}></Icon>
        }
        async function openProperty(e: React.MouseEvent) {
            e.stopPropagation();
            var rs: MenuItem<string>[] = [
                { name: 'download', text:( '下载'), icon: DownloadSvg },
                { name: 'edit', text:('编辑') , disabled: self.isCanEdit ? false : true, icon: Edit1Svg },
                { type: MenuItemType.divide },
                { name: 'delete', text:( '删除'), disabled: self.isCanEdit ? false : true, icon: TrashSvg }
            ]
            if (!self.isCanEdit) {
                rs = [
                    { name: 'download', text:('下载') , icon: DownloadSvg },
                ]
            }
            var r = await useSelectMenuItem(
                { roundArea: Rect.fromEle(e.currentTarget as HTMLElement) },
                rs
            );
            if (r) {
                if (r.item?.name == 'download') {
                    util.downloadFile(pics[0].url, pics[0].filename)
                }
                else if (r.item?.name == 'edit') {
                    self.openEdit(e);
                }
                else if (r?.item.name == 'delete') {
                    self.deleteItem();
                }
            }
        }
        return <div className="w100 flex visible-hover item-hover padding-5 cursor round" onMouseDown={e => self.openEdit(e)}>
            <div className="flex-auto flex">
                <div className="flex-auto flex">
                    <span className="gap-r-5 flex-center">{getExtElement(pics[0].ext)}</span>
                    <span>{title || pics[0].filename}</span>
                </div>
                <div onMouseDown={e => (openProperty(e))} className="flex-fixed visible item-hover size-24 round cursor flex-center">
                    <Icon icon={DotsSvg}></Icon>
                </div>
            </div>
            <div className="flex-fixed gap-w-10 remark">{util.showTime(createDate)}</div>
            <div className="flex-fixed gap-w-10 remark">{util.byteToString(pics[0].size)}</div>
        </div>
    }
} 