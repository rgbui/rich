import React from "react";
import { DotsSvg } from "../../../../../component/svgs";
import { ResourceArguments } from "../../../../../extensions/icon/declare";
import { lst } from "../../../../../i18n/store";
import { autoImageUrl } from "../../../../../net/element.type";
import { BlockUrlConstant } from "../../../../../src/block/constant";
import { FieldType } from "../../../schema/type";
import { CardModel, CardViewCom } from "../factory/observable";
import { CardView } from "../view";
import { Icon } from "../../../../../component/view/icon";
import { BackgroundColorList } from "../../../../../extensions/color/data";
import * as Card9 from "../../../../../src/assert/img/card/card9.png";

/***
 * 
 * https://www.zhipin.com/shanghai/?ka=header-home
 * 
 */
CardModel('/job', () => ({
    url: '/job',
    title: lst('招聘'),
    image: Card9.default,
    forUrls: [BlockUrlConstant.DataGridGallery],
    props: [
        { name: 'jobTitle', text: lst('职位名称'), types: [FieldType.title, FieldType.text, FieldType.option] },
        { name: 'jobDescription', text: lst('工作职责描述'), types: [FieldType.plain] },
        { name: 'isShelf', text: lst('是否发布'), types: [FieldType.bool] },
        {
            name: 'tags',
            text: lst('标签'),
            types: [FieldType.options, FieldType.option],
            config: {
                options: [
                    { text: lst('五险一金'), value: '1', color: BackgroundColorList().randomOf()?.color },
                    { text: lst('定期体检'), value: '2', color: BackgroundColorList().randomOf()?.color },
                    { text: lst('加班补助'), value: '3', color: BackgroundColorList().randomOf()?.color },
                    { text: lst('年终奖'), value: '4', color: BackgroundColorList().randomOf()?.color },
                    { text: lst('带薪年假'), value: '5', color: BackgroundColorList().randomOf()?.color },
                    { text: lst('员工旅游'), value: '6', color: BackgroundColorList().randomOf()?.color },
                    { text: lst('通讯补贴'), value: '7', color: BackgroundColorList().randomOf()?.color },
                    { text: lst('节日福利'), value: '8', color: BackgroundColorList().randomOf()?.color },
                    { text: lst('零食下午茶'), value: '9', color: BackgroundColorList().randomOf()?.color }
                ]
            }
        },
        { name: 'city', text: lst('城市'), types: [FieldType.text, FieldType.option] },
        {
            name: 'experience',
            text: lst('经验'),
            types: [FieldType.option],
            config: {
                options: [
                    { text: lst('不限'), value: '1', color: BackgroundColorList().randomOf()?.color },
                    { text: lst('在校生'), value: '2', color: BackgroundColorList().randomOf()?.color },
                    { text: lst('应届生'), value: '3', color: BackgroundColorList().randomOf()?.color },
                    { text: lst('经验不限'), value: '4', color: BackgroundColorList().randomOf()?.color },
                    { text: lst('1年以内'), value: '5', color: BackgroundColorList().randomOf()?.color },
                    { text: lst('1-3年'), value: '6', color: BackgroundColorList().randomOf()?.color },
                    { text: lst('3-5年'), value: '7', color: BackgroundColorList().randomOf()?.color },
                    { text: lst('5-10年'), value: '8', color: BackgroundColorList().randomOf()?.color },
                    { text: lst('10年以上'), value: '9', color: BackgroundColorList().randomOf()?.color }
                ]
            }
        },
        {
            name: 'edu',
            text: lst('学历'),
            types: [FieldType.option],
            config: {
                options: [
                    { text: lst('不限'), value: '1', color: BackgroundColorList().randomOf()?.color },
                    { text: lst('大专'), value: '2', color: BackgroundColorList().randomOf()?.color },
                    { text: lst('本科'), value: '3', color: BackgroundColorList().randomOf()?.color },
                    { text: lst('硕士'), value: '4', color: BackgroundColorList().randomOf()?.color },
                    { text: lst('博士'), value: '5', color: BackgroundColorList().randomOf()?.color },
                ]
            }
        },
        {
            name: 'salary',
            text: lst('薪资'),
            types: [FieldType.option, FieldType.text],
            config: {
                options: [
                    { text: lst('面谈'), value: '1', color: BackgroundColorList().randomOf()?.color },
                    { text: lst('3K以下'), value: '2', color: BackgroundColorList().randomOf()?.color },
                    { text: lst('3-5K'), value: '3', color: BackgroundColorList().randomOf()?.color },
                    { text: lst('5-10K'), value: '4', color: BackgroundColorList().randomOf()?.color },
                    { text: lst('10-20K'), value: '5', color: BackgroundColorList().randomOf()?.color },
                    { text: lst('20-50K'), value: '6', color: BackgroundColorList().randomOf()?.color },
                    { text: lst('50K以上'), value: '7', color: BackgroundColorList().randomOf()?.color },
                ]
            }
        },
        { name: 'companyLogo', text: lst('公司logo'), types: [FieldType.image] },
        { name: 'company', text: lst('公司名称'), types: [FieldType.text] },
        {
            name: 'companyCategory',
            text: lst('公司类别'),
            types: [FieldType.text, FieldType.option]
        },
        {
            name: 'companySize', text: lst('公司规模'), types: [FieldType.option],
            config: {
                options: [
                    { text: lst('0-20人'), value: '1', color: BackgroundColorList().randomOf()?.color },
                    { text: lst('20-99人'), value: '2', color: BackgroundColorList().randomOf()?.color },
                    { text: lst('100-499人'), value: '3', color: BackgroundColorList().randomOf()?.color },
                    { text: lst('500-999人'), value: '4', color: BackgroundColorList().randomOf()?.color },
                    { text: lst('10000人以上'), value: '5', color: BackgroundColorList().randomOf()?.color }
                ]
            }
        }
    ],
    views: [
        { url: BlockUrlConstant.DataGridTable, text: lst('招聘'), },
        { autoCreate: true, url: BlockUrlConstant.DataGridGallery, text: lst('招聘列表'), },
        { url: BlockUrlConstant.RecordPageView, text: lst('招聘详情'), }
    ],
    dataList: [
        {
            jobTitle: '高级前端开发工程师',
            sisShelf: true,
            tags: ["1", "2", "3", "4", "5", "6", "7", "8", "9"],
            city: '上海',
            experience: '7',
            edu: '3',
            salary: '6',
            companyLogo: [{ url: 'https://api-m2.shy.live/img?id=414b082f75104ed993ba50a8a731dde7&width=120' }],
            company: '诗云科技',
            companyCategory: '互联网',
            companySize: '1'
        },
        {
            jobTitle: '语音/视频/图形开发工程师',
            sisShelf: true,
            tags: ["1", "2", "3", "4", "5", "6", "7", "8", "9"],
            city: '上海',
            experience: '7',
            edu: '4',
            salary: '6',
            companyLogo: [{ url: 'https://api-m2.shy.live/img?id=414b082f75104ed993ba50a8a731dde7&width=120' }],
            company: '诗云科技',
            companyCategory: '互联网',
            companySize: '1'
        }
    ]
}))

@CardViewCom('/job')
export class CardJob extends CardView {
    render() {
        var self = this;
        var tags = this.getValue<{ text: string, color: string }[]>('tags', FieldType.option);
        var pics = this.getValue<ResourceArguments[]>('companyLogo');
        var hasPic = Array.isArray(pics) && pics.length > 0;
        var city = this.getValue<string>('city');
        var experience = this.getValue<{ text: string, color: string }[]>('experience', FieldType.option);
        var edu = this.getValue<{ text: string, color: string }[]>('edu', FieldType.option);
        var salary = this.getValue<{ text: string, color: string }[]>('salary', FieldType.option);
        var company = this.getValue<string>('company');
        var companySize = this.getValue<{ text: string, color: string }[]>('companySize', FieldType.option);
        var jobTitle = this.getValue<string>('jobTitle');
        var companyCategory = this.getValue<string>('companyCategory');
        return <div
            onMouseDown={e => self.openEdit(e)}
            className="relative visible-hover  padding-t-10 round bg-white border-light">
            <div className="flex gap-h-5 padding-w-10">
                <div className="flex-auto bold text-overflow text-p-hover gap-r-10">{jobTitle}</div>
                <div className="flex-fixed">
                    <span className="text-p" style={{ fontSize: '24px' }}>{salary[0]?.text}</span>
                </div>
            </div>

            <div className="flex flex-wrap r-gap-h-5  padding-w-10 r-item-light-hover-focus r-padding-w-5 r-round  r-gap-r-5 f-12 remark">
                <span>{experience[0]?.text}</span>
                <span>{edu[0]?.text}</span>
                {tags && tags.slice(0, 4).map((tag, i) => {
                    return <span key={i}>{tag.text}</span>
                })}
            </div>

            <div className="flex padding-h-5  padding-w-10 item-light-hover-focus">
                <div className="flex-auto flex">
                    {hasPic && <img src={autoImageUrl(pics[0].url, 50)} className="flex-fixed size-30 circle obj-center gap-r-5" />}
                    <span className="flex-auto text-overflow f-12 remark">{company}</span>
                </div>
                <div className="flex-fixed flex f-12 remark">
                    <span className="gap-r-3">{[companyCategory, companySize[0]?.text].join("/")}</span>
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