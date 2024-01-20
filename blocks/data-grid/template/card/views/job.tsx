import React from "react";
import { Edit1Svg, UploadSvg, TrashSvg, DotsSvg } from "../../../../../component/svgs";
import { useSelectMenuItem } from "../../../../../component/view/menu";
import { MenuItemType } from "../../../../../component/view/menu/declare";
import { ResourceArguments } from "../../../../../extensions/icon/declare";
import { lst } from "../../../../../i18n/store";
import { autoImageUrl } from "../../../../../net/element.type";
import { BlockUrlConstant } from "../../../../../src/block/constant";
import { Rect } from "../../../../../src/common/vector/point";
import { FieldType } from "../../../schema/type";
import { CardModel, CardViewCom } from "../factory/observable";
import { CardView } from "../view";
import { Icon } from "../../../../../component/view/icon";

/***
 * 
 * https://www.zhipin.com/shanghai/?ka=header-home
 * 
 */
CardModel('/job', () => ({
    url: '/job',
    title: lst('招聘'),
    forUrls: [BlockUrlConstant.DataGridGallery],
    props: [
        { name: 'user', text: lst('发布人'), types: [FieldType.creater] },
        { name: 'title', text: lst('职位名称'), types: [FieldType.title, FieldType.text] },
        { name: 'jobTitle', text: lst('职位名称'), types: [FieldType.text] },
        { name: 'jobDescription', text: lst('工作职责描述'), types: [FieldType.plain] },
        { name: 'comment', text: lst('评论'), types: [FieldType.comment] },
        { name: 'isShelf', text: lst('是否发布'), types: [FieldType.bool] },
        { name: 'tags', text: lst('标签'), types: [FieldType.options, FieldType.option] },
        { name: 'date', text: lst('日期'), types: [FieldType.createDate, FieldType.date] },
        { name: 'city', text: lst('城市'), types: [FieldType.text] },
        { name: 'experience', text: lst('经验'), types: [FieldType.option] },
        { name: 'edu', text: lst('学历'), types: [FieldType.option] },
        { name: 'salary', text: lst('薪资'), types: [FieldType.text] },
        { name: 'companyLogo', text: lst('公司logo'), types: [FieldType.image] },
        { name: 'company', text: lst('公司名称'), types: [FieldType.text] },
        { name: 'companyCategory', text: lst('公司类别'), types: [FieldType.option] },
        { name: 'companySize', text: lst('公司规模'), types: [FieldType.option] }
    ],
    views: [
        { url: BlockUrlConstant.DataGridTable, text: lst('招聘'), },
        { autoCreate: true, url: BlockUrlConstant.DataGridGallery, text: lst('招聘列表'), },
        { url: BlockUrlConstant.RecordPageView, text: lst('招聘详情'), }
    ],
    dataList: [
        {
            title: '',
            story: '诗云解决了我在工作中遇到的信息孤岛问题，可以预见，未来基于诗云的信息组织能力在非常多的场景中进行协同，可以产生巨大的威力！',
            introduction: '用户体验专家'
        },
        {
            title: '',
            story: '记录的作用不在于记录行为本身，而是对未来的可检索性、可连接性与可启发性。我用诗云记录当下的灵感、思考与数据，用诗云启发与重建未来的思考与创造。',
            introduction: '作词人'
        },
        {
            title: '',
            story: '我使用诗云做大量日常课业、科研、社工、社团、支教等等记录；同时由于工作原因，我需要一个几乎什么内容都可以往里写、输入快捷、方便整理与演示、可云同步的笔记平台，最令我满意的就是诗云。',
            introduction: '哈尔滨工业大学 工程物理系'
        }
    ]
}))

@CardViewCom('/job')
export class CardJob extends CardView {
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
                    // { name: 'replace', icon: UploadSvg, text: lst('替换') },
                    { type: MenuItemType.divide },
                    { name: 'remove', icon: TrashSvg, text: lst('删除') }
                ]);
                if (r) {
                    if (r.item.name == 'replace') {
                        await self.uploadImage('pic', rect, 'title')
                    }
                    else if (r.item.name == 'remove') {
                        await self.deleteItem();
                    }
                    else if (r.item.name == 'open') {
                        await self.openEdit(event);
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
        var title = this.getValue<string>('title');
        var tags = this.getValue<{ text: string, color: string }[]>('tags', FieldType.option);
        var pics = this.getValue<ResourceArguments[]>('companyLogo');
        var hasPic = Array.isArray(pics) && pics.length > 0;
        var city = this.getValue<string>('city');
        var experience = this.getValue<{ text: string, color: string }[]>('experience', FieldType.option);
        var edu = this.getValue<{ text: string, color: string }[]>('edu', FieldType.option);
        var salary = this.getValue<string>('salary');
        var company = this.getValue<string>('company');
        var companyCategory = this.getValue<{ text: string, color: string }[]>('companyCategory', FieldType.option);
        var jobTitle = this.getValue<string>('jobTitle');



        return <div onMouseDown={e => self.openEdit(e)} className="relative visible-hover  padding-t-10 round-16 bg-white border-light">

            <div className="flex gap-h-5 padding-w-10">
                <div className="flex-auto bold text-overflow text-p-hover">{jobTitle || title}</div>
                <div className="flex-fixed">
                    <span className="text-p" style={{ fontSize: '24px' }}>{salary}</span>
                </div>
            </div>

            <div className="flex gap-h-5  padding-w-10 r-item-light-hover-focus r-padding-w-5 r-round r-gap-r-5 r-gap-r-5 f-12 remark">
                <span>{experience[0]?.text}</span>
                <span>{edu[0]?.text}</span>
                {tags && tags.map((tag, i) => {
                    return <span key={i}>{tag}</span>
                })}
            </div>

            <div className="flex padding-h-5  padding-w-10 item-light-hover-focus">
                <div className="flex-auto flex">
                    {hasPic && <img src={autoImageUrl(pics[0].url, 50)} className="flex-fixed size-30 circle obj-center gap-r-5" />}
                    <span className="flex-auto text-overflow f-12 remark">{company}</span>
                    {/* <span>{companySize[0]?.text}</span> */}
                </div>
                <div className="flex-fixed flex f-12 remark">
                    <span className="gap-r-3">{companyCategory[0]?.text}</span>
                    <span>{city}</span>
                </div>
            </div>

            <div className="pos-top pos-right  flex-end z-2  gap-t-5 r-size-24 r-gap-r-5 r-round r-cursor">
                {this.isCanEdit && <span onMouseDown={e => self.openMenu(e)} className="bg-dark-1 visible text-white   flex-center">
                    <Icon size={18} icon={DotsSvg}></Icon>
                </span>}
            </div>

        </div>
    }
} 