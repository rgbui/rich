import React from "react";
import { EventsComponent } from "../../component/lib/events.component";
import { SearchListType } from "../../component/types";
import { Button } from "../../component/view/button";
import { Icon } from "../../component/view/icon";
import { PageTemplateTypeGroups } from "../../src/page/declare";
import { IconArguments, ResourceArguments } from "../icon/declare";
import { PopoverSingleton } from "../../component/popover/popover";
import { ChevronDownSvg, PageSvg } from "../../component/svgs";
import { channel } from "../../net/channel";
import { S } from "../../i18n/view";
import { Input } from "../../component/view/input";
import { ElementType, getElementUrl } from "../../net/element.type";
import { Avatar } from "../../component/view/avator/face";
import { lst } from "../../i18n/store";
import lodash from "lodash";

export interface PageTemplateType {
    id: string,
    text: string,
    icon: IconArguments,
    classify: string,
    description: string,
    file: ResourceArguments,
    type: 'page' | 'workspace',
    previewCover: ResourceArguments,
    tags: string[],
    mime: 'page' | 'db' | 'channel' | 'ppt',
    useCount?: number,
    creater?: string,
    userid?: string,
    sourceWorkspaceId?: string,
    sourcePageId?: string,
    sourceElementUrl?: string
}

export class TemplateView extends EventsComponent {
    renderSide() {
        return <div
            style={{
                backgroundColor: 'rgb(251,251,250)'
            }}
            className="flex-fixed flex flex-col flex-full w-200 border-right">
            <div className="flex-fixed gap-h-10 gap-w-10">
                <Input placeholder={lst('搜索模板')} clear value={this.templateList.word} onEnter={e => {
                    this.templateList.word = e;
                    this.forceUpdate();
                }} onClear={() => {
                    this.templateList.word = '';
                    this.forceUpdate();
                }} onChange={e => {
                    this.templateList.word = e;
                    this.forceUpdate();
                }}
                ></Input>
            </div>
            <div className="flex-auto overflow-y " >
                {!this.templateList.word && this.typeGroups.map((tg, i) => {
                    var ts = this.templateList.list.findAll(g => g.classify == tg.text);
                    if (ts.length == 0) return <div key={i}></div>
                    return <div className="gap-b-10 gap-t-10" key={i}>
                        <div onClick={e => {
                            tg.spread = tg.spread ? false : true;
                            this.forceUpdate();
                        }} className="f-12 flex  cursor padding-w-5 item-hover-light">
                            <span className={"ts size-24 flex-center flex-fixed " + (tg.spread == true ? "" : "angle-90-")}>
                                <Icon className={'text-1'} size={16} icon={ChevronDownSvg}></Icon>
                            </span>
                            <span className="flex-auto">{tg.text}</span>
                        </div>
                        {tg.spread !== false && <div>
                            {ts.map((tl, j) => {
                                return <div onMouseDown={e => {
                                    this.onSetTemplate(tl);
                                }} className={"h-30 gap-h-3 flex round cursor item-hover-light padding-w-10 " + (this.currentPageTemplate === tl ? " item-hover-focus" : "")} key={tl.id}>
                                    <span className="flex-center size-24 rounc cursor flex-fixed"><Icon size={18} icon={tl.icon || PageSvg}></Icon></span>
                                    <span className="gap-l-5 text-overflow flex-auto">{tl.text}</span>
                                </div>
                            })}
                        </div>}
                    </div>
                })}
                {this.templateList.word && this.getSearchList().map((tl, i) => {
                    return <div onMouseDown={e => {
                        this.onSetTemplate(tl);
                    }} className={"h-30 gap-h-3 flex round cursor item-hover-light padding-w-10 " + (this.currentPageTemplate === tl ? " item-hover-focus" : "")} key={tl.id}>
                        <span className="flex-center size-24 rounc cursor flex-fixed"><Icon size={18} icon={tl.icon || PageSvg}></Icon></span>
                        <span className="gap-l-5 text-overflow flex-auto">{tl.text}</span>
                    </div>
                })}
            </div>
            <div className="border-top padding-10">
                <div className="flex gap-h-3">
                    <span className="f-14"><S>更多模板</S></span>
                    <a target={'_blank'} href={window.shyConfig?.isUS ? "https://template.shy.red/" : "https://template.shy.live/"} className="gap-l-3 size-14 flex-center flex-fixed"><Icon size={14} icon={{ name: 'byte', code: 'arrow-right-up' }}></Icon></a>
                </div>
                <div className="remark f-12"><S>发现更多诗云用户创建的模板</S></div>
            </div>
        </div>
    }
    typeGroups = PageTemplateTypeGroups;
    templateList: SearchListType<PageTemplateType, { mime: string, tags: string[], type: string }> = { type: '', mime: 'page', loading: false, tags: [], total: 0, list: [], page: 1, size: 20 }
    getSearchList() {
        return this.templateList.list.filter(c => {
            return c.text?.indexOf(this.templateList.word) > -1 || c.description && c.description.indexOf(this.templateList.word) > -1
        })
    }
    async onSearch() {
        try {
            this.templateList.loading = true;
            this.forceUpdate();
            var rs = await channel.get('/search/workspace/template', {
                page: this.templateList.page,
                word: this.templateList.word,
                size: this.templateList.size
            });
            if (rs) {
                // rs.data = {
                //     "list": [
                //         {
                //             "text": "网盘",
                //             "url": "https://api-s2.shy.live/file?id=8d952b655f2f4961a3b34b96ef0d2aca",
                //             "description": null,
                //             "type": "page",
                //             "sourceWorkspaceId": "4JXQ8D3y-3",
                //             "file": {
                //                 "ext": "",
                //                 "id": "8d952b655f2f4961a3b34b96ef0d2aca",
                //                 "filePath": "D:\\files\\store\\service2\\2023_11_13_0\\8d952b655f2f4961a3b34b96ef0d2aca",
                //                 "relativeFilePath": "\\service2\\2023_11_13_0\\8d952b655f2f4961a3b34b96ef0d2aca",
                //                 "size": 5453,
                //                 "md5": "1419D5D6BADB849BD4A1B8D21B3839A3",
                //                 "url": "https://api-s2.shy.live/file?id=8d952b655f2f4961a3b34b96ef0d2aca",
                //                 "mime": "unknow",
                //                 "filename": "file",
                //                 "creater": "4EFGvb8P-2",
                //                 "source": "download",
                //                 "downloadUrl": "https://api-w1.shy.live/ws/file?id=d1471725c1574fbcb7d835dfb1e715e1",
                //                 "isRobotGenerated": false,
                //                 "createDate<d>": 1699807473077
                //             },
                //             "icon": {
                //                 "name": "bytedance-icon",
                //                 "code": "file-cabinet",
                //                 "color": "rgb(217,115,13)"
                //             },
                //             "classify": [
                //                 "个人"
                //             ],
                //             "tags": [
                //                 "个人工作"
                //             ],
                //             "sourcePageId": "kTrzarZ5PrFcA2LfMVXEpy",
                //             "sourceElementUrl": "/PageItem/kTrzarZ5PrFcA2LfMVXEpy",
                //             "creater": "4EFGvb8P-2",
                //             "userid": "4EFGvb8P-2",
                //             "approve": false,
                //             "id": "30b3f97a79d24b7e9adfd6ddb87696a6",
                //             "useCount": 8,
                //             "previewCover": null,
                //             "isSysAutoCreateWorkspaceTemplate": false,
                //             "createDate<d>": 1699807439734
                //         },
                //         {
                //             "text": "我的宠物主页",
                //             "url": "https://api-s1.shy.live/file?id=cf7c3ac3e0b54cd388518e92510b1ba9",
                //             "description": null,
                //             "type": "page",
                //             "sourceWorkspaceId": "4JXQ8D3y-3",
                //             "file": {
                //                 "ext": "",
                //                 "id": "cf7c3ac3e0b54cd388518e92510b1ba9",
                //                 "filePath": "D:\\files\\store\\service1\\2023_11_13_0\\cf7c3ac3e0b54cd388518e92510b1ba9",
                //                 "relativeFilePath": "\\service1\\2023_11_13_0\\cf7c3ac3e0b54cd388518e92510b1ba9",
                //                 "size": 8227,
                //                 "md5": "AB64C8F1DEF54723873A7BE02483B21F",
                //                 "url": "https://api-s1.shy.live/file?id=cf7c3ac3e0b54cd388518e92510b1ba9",
                //                 "mime": "unknow",
                //                 "filename": "file",
                //                 "creater": "4EFGvb8P-2",
                //                 "source": "download",
                //                 "downloadUrl": "https://api-w1.shy.live/ws/file?id=2cb9776df07d440f9d5c0eef6b8fd634",
                //                 "isRobotGenerated": false,
                //                 "createDate<d>": 1699805411069
                //             },
                //             "icon": {
                //                 "name": "emoji",
                //                 "code": "🐱"
                //             },
                //             "classify": [
                //                 "个人"
                //             ],
                //             "tags": [
                //                 "业余爱好"
                //             ],
                //             "sourcePageId": "4K5ybQ7l-3-1sK",
                //             "sourceElementUrl": "/PageItem/4K5ybQ7l-3-1sK",
                //             "creater": "4EFGvb8P-2",
                //             "userid": "4EFGvb8P-2",
                //             "approve": false,
                //             "id": "17bfa490ce85464aa05c57b24f3a5e7e",
                //             "useCount": 3,
                //             "previewCover": null,
                //             "isSysAutoCreateWorkspaceTemplate": false,
                //             "createDate<d>": 1699805411116
                //         },
                //         {
                //             "text": "招聘信息",
                //             "url": "https://api-s2.shy.live/file?id=4a5bf0fb794044a9b47e8bf1d115c282",
                //             "description": "这是团队对外的职位招聘信息，编辑完成后，点击右上角 ，选择 公开分享页面 即可对外发布",
                //             "type": "page",
                //             "sourceWorkspaceId": "4JXQ8D3y-3",
                //             "file": {
                //                 "ext": "",
                //                 "id": "4a5bf0fb794044a9b47e8bf1d115c282",
                //                 "filePath": "D:\\files\\store\\service2\\2023_11_13_0\\4a5bf0fb794044a9b47e8bf1d115c282",
                //                 "relativeFilePath": "\\service2\\2023_11_13_0\\4a5bf0fb794044a9b47e8bf1d115c282",
                //                 "size": 7854,
                //                 "md5": "01CC1977D2E59F0E190BA909593930FD",
                //                 "url": "https://api-s2.shy.live/file?id=4a5bf0fb794044a9b47e8bf1d115c282",
                //                 "mime": "unknow",
                //                 "filename": "file",
                //                 "creater": "4EFGvb8P-2",
                //                 "source": "download",
                //                 "downloadUrl": "https://api-w1.shy.live/ws/file?id=15942b90bb414bffafe223633321100a",
                //                 "isRobotGenerated": false,
                //                 "createDate<d>": 1699805170541
                //             },
                //             "icon": null,
                //             "classify": [
                //                 "工作"
                //             ],
                //             "tags": [
                //                 "招聘"
                //             ],
                //             "sourcePageId": "dBJDorSku8MYzzP1QhaBUP",
                //             "sourceElementUrl": "/PageItem/dBJDorSku8MYzzP1QhaBUP",
                //             "creater": "4EFGvb8P-2",
                //             "userid": "4EFGvb8P-2",
                //             "approve": false,
                //             "id": "ed9e2d3721a649aaa3ea369782f9553e",
                //             "useCount": 2,
                //             "previewCover": null,
                //             "isSysAutoCreateWorkspaceTemplate": false,
                //             "createDate<d>": 1699805170589
                //         },
                //         {
                //             "text": "行程安排",
                //             "url": "https://api-s2.shy.live/file?id=8a1ae0e927d04ab9b7d0dd72e70a82da",
                //             "description": null,
                //             "type": "page",
                //             "sourceWorkspaceId": "4JXQ8D3y-3",
                //             "file": {
                //                 "ext": "",
                //                 "id": "8a1ae0e927d04ab9b7d0dd72e70a82da",
                //                 "filePath": "D:\\files\\store\\service2\\2023_11_13_0\\8a1ae0e927d04ab9b7d0dd72e70a82da",
                //                 "relativeFilePath": "\\service2\\2023_11_13_0\\8a1ae0e927d04ab9b7d0dd72e70a82da",
                //                 "size": 6309,
                //                 "md5": "CE3AE459458B0ECE3CE7E6FEE118FD4E",
                //                 "url": "https://api-s2.shy.live/file?id=8a1ae0e927d04ab9b7d0dd72e70a82da",
                //                 "mime": "unknow",
                //                 "filename": "file",
                //                 "creater": "4EFGvb8P-2",
                //                 "source": "download",
                //                 "downloadUrl": "https://api-w1.shy.live/ws/file?id=bbb1fc260e7f4cfa8cc3a667a128274f",
                //                 "isRobotGenerated": false,
                //                 "createDate<d>": 1699806832027
                //             },
                //             "icon": {
                //                 "name": "emoji",
                //                 "code": "🚕"
                //             },
                //             "classify": [
                //                 "个人"
                //             ],
                //             "tags": [
                //                 "旅行"
                //             ],
                //             "sourcePageId": "4K5ybQ7l-3-V8",
                //             "sourceElementUrl": "/PageItem/4K5ybQ7l-3-V8",
                //             "creater": "4EFGvb8P-2",
                //             "userid": "4EFGvb8P-2",
                //             "approve": false,
                //             "id": "ca09684c02c4466593a89960237ce1a3",
                //             "useCount": 2,
                //             "previewCover": null,
                //             "isSysAutoCreateWorkspaceTemplate": false,
                //             "createDate<d>": 1699806832065
                //         },
                //         {
                //             "text": "OKR模板",
                //             "url": "https://api-s1.shy.live/file?id=856369c579b34600b3c906556a58b860",
                //             "description": "OKR工作法，是一个以目标为导向，关键结果为过程的一种高效管理方法。O表示目标（Objective），KR表示关键结果（Key Results），目标就是指想做什么事情，关键结果就是指如何确认做到了那件事",
                //             "type": "page",
                //             "sourceWorkspaceId": "4JXQ8D3y-3",
                //             "file": {
                //                 "ext": "",
                //                 "id": "856369c579b34600b3c906556a58b860",
                //                 "filePath": "D:\\files\\store\\service1\\2023_11_13_0\\856369c579b34600b3c906556a58b860",
                //                 "relativeFilePath": "\\service1\\2023_11_13_0\\856369c579b34600b3c906556a58b860",
                //                 "size": 7056,
                //                 "md5": "6749193CAF190CF188291CC84ECE6881",
                //                 "url": "https://api-s1.shy.live/file?id=856369c579b34600b3c906556a58b860",
                //                 "mime": "unknow",
                //                 "filename": "file",
                //                 "creater": "4EFGvb8P-2",
                //                 "source": "download",
                //                 "downloadUrl": "https://api-w1.shy.live/ws/file?id=3b08bd7ee89949c1ad3bf381550d0189",
                //                 "isRobotGenerated": false,
                //                 "createDate<d>": 1699805092778
                //             },
                //             "icon": null,
                //             "classify": [
                //                 "工作"
                //             ],
                //             "tags": [
                //                 "人员与组织"
                //             ],
                //             "sourcePageId": "p84AcFYWCQ9mJBSLPQvqpj",
                //             "sourceElementUrl": "/PageItem/p84AcFYWCQ9mJBSLPQvqpj",
                //             "creater": "4EFGvb8P-2",
                //             "userid": "4EFGvb8P-2",
                //             "approve": false,
                //             "id": "6b722efa624c46c2ac584b8c6eff72e6",
                //             "useCount": 1,
                //             "previewCover": null,
                //             "isSysAutoCreateWorkspaceTemplate": false,
                //             "createDate<d>": 1699805092916
                //         },
                //         {
                //             "text": "课程管理",
                //             "url": "https://api-s1.shy.live/file?id=66bc5ede3afa448e91b2a080807d3e71",
                //             "description": "这套课程管理模板以 课程-章-节 树形结构组织课程内容，这套模版可以帮助教育工作者快速整理相关内容",
                //             "type": "page",
                //             "sourceWorkspaceId": "4JXQ8D3y-3",
                //             "file": {
                //                 "ext": "",
                //                 "id": "66bc5ede3afa448e91b2a080807d3e71",
                //                 "filePath": "D:\\files\\store\\service1\\2023_11_13_0\\66bc5ede3afa448e91b2a080807d3e71",
                //                 "relativeFilePath": "\\service1\\2023_11_13_0\\66bc5ede3afa448e91b2a080807d3e71",
                //                 "size": 18227,
                //                 "md5": "C737899B924509FC891116DA89B8807E",
                //                 "url": "https://api-s1.shy.live/file?id=66bc5ede3afa448e91b2a080807d3e71",
                //                 "mime": "unknow",
                //                 "filename": "file",
                //                 "creater": "4EFGvb8P-2",
                //                 "source": "download",
                //                 "downloadUrl": "https://api-w1.shy.live/ws/file?id=614be335026b470b83d0367d37c42719",
                //                 "isRobotGenerated": false,
                //                 "createDate<d>": 1699805274021
                //             },
                //             "icon": null,
                //             "classify": [
                //                 "教育"
                //             ],
                //             "tags": [
                //                 "教学"
                //             ],
                //             "sourcePageId": "diezEBXJqZUyNXNXSJMfXy",
                //             "sourceElementUrl": "/PageItem/diezEBXJqZUyNXNXSJMfXy",
                //             "creater": "4EFGvb8P-2",
                //             "userid": "4EFGvb8P-2",
                //             "approve": false,
                //             "id": "fd2f7f342cd84c4da692c3129ce9cf40",
                //             "useCount": 1,
                //             "previewCover": null,
                //             "isSysAutoCreateWorkspaceTemplate": false,
                //             "createDate<d>": 1699805274059
                //         },
                //         {
                //             "text": "复盘总结",
                //             "url": "https://api-s2.shy.live/file?id=d814edf03d1b41a08e4ad75ed55efa35",
                //             "description": "小事及时复盘、大事阶段性复盘，事后全面复盘",
                //             "type": "page",
                //             "sourceWorkspaceId": "4JXQ8D3y-3",
                //             "file": {
                //                 "ext": "",
                //                 "id": "d814edf03d1b41a08e4ad75ed55efa35",
                //                 "filePath": "D:\\files\\store\\service2\\2023_11_13_0\\d814edf03d1b41a08e4ad75ed55efa35",
                //                 "relativeFilePath": "\\service2\\2023_11_13_0\\d814edf03d1b41a08e4ad75ed55efa35",
                //                 "size": 6462,
                //                 "md5": "C1CD1157B612E48A81D8C3C1190D0438",
                //                 "url": "https://api-s2.shy.live/file?id=d814edf03d1b41a08e4ad75ed55efa35",
                //                 "mime": "unknow",
                //                 "filename": "file",
                //                 "creater": "4EFGvb8P-2",
                //                 "source": "download",
                //                 "downloadUrl": "https://api-w1.shy.live/ws/file?id=b32254d485384da494cf124459d20b82",
                //                 "isRobotGenerated": false,
                //                 "createDate<d>": 1699806922255
                //             },
                //             "icon": {
                //                 "name": "emoji",
                //                 "code": "🗓️"
                //             },
                //             "classify": [
                //                 "项目"
                //             ],
                //             "tags": [
                //                 "问题跟踪"
                //             ],
                //             "sourcePageId": "q1DKQ2RKZfUhYLsGbYXg6v",
                //             "sourceElementUrl": "/PageItem/q1DKQ2RKZfUhYLsGbYXg6v",
                //             "creater": "4EFGvb8P-2",
                //             "userid": "4EFGvb8P-2",
                //             "approve": false,
                //             "id": "4b3126828459431d8dbaa11e08946867",
                //             "useCount": 1,
                //             "previewCover": null,
                //             "isSysAutoCreateWorkspaceTemplate": false,
                //             "createDate<d>": 1699806922290
                //         },
                //         {
                //             "text": "教学大纲",
                //             "url": "https://api-s1.shy.live/file?id=815dc135b9b648768f5e815311aaf246",
                //             "description": "写明本课程在专业人才培养方案中的地位及作用，旨在对学生完成哪些方面的教育。",
                //             "type": "page",
                //             "sourceWorkspaceId": "4JXQ8D3y-3",
                //             "file": {
                //                 "ext": "",
                //                 "id": "815dc135b9b648768f5e815311aaf246",
                //                 "filePath": "D:\\files\\store\\service1\\2023_11_13_0\\815dc135b9b648768f5e815311aaf246",
                //                 "relativeFilePath": "\\service1\\2023_11_13_0\\815dc135b9b648768f5e815311aaf246",
                //                 "size": 7181,
                //                 "md5": "469C124C34710AD3E88F69BA47970C1C",
                //                 "url": "https://api-s1.shy.live/file?id=815dc135b9b648768f5e815311aaf246",
                //                 "mime": "unknow",
                //                 "filename": "file",
                //                 "creater": "4EFGvb8P-2",
                //                 "source": "download",
                //                 "downloadUrl": "https://api-w1.shy.live/ws/file?id=88e5cad2ee2b493ebba894f0071c4db9",
                //                 "isRobotGenerated": false,
                //                 "createDate<d>": 1699807098445
                //             },
                //             "icon": {
                //                 "name": "emoji",
                //                 "code": "📖"
                //             },
                //             "classify": [
                //                 "教育"
                //             ],
                //             "tags": [
                //                 "教学"
                //             ],
                //             "sourcePageId": "4K3xaSVl-3-xw",
                //             "sourceElementUrl": "/PageItem/4K3xaSVl-3-xw",
                //             "creater": "4EFGvb8P-2",
                //             "userid": "4EFGvb8P-2",
                //             "approve": false,
                //             "id": "daca996c4e6c4fd98fb3f39f49bd8fc4",
                //             "useCount": 1,
                //             "previewCover": null,
                //             "isSysAutoCreateWorkspaceTemplate": false,
                //             "createDate<d>": 1699807098484
                //         },
                //         {
                //             "text": "我的简历",
                //             "url": "https://api-s1.shy.live/file?id=b7d6a154fb01420f825d564ae13e16cd",
                //             "description": "90后个人简历",
                //             "type": "page",
                //             "sourceWorkspaceId": "4JXQ8D3y-3",
                //             "file": {
                //                 "ext": "",
                //                 "id": "b7d6a154fb01420f825d564ae13e16cd",
                //                 "filePath": "D:\\files\\store\\service1\\2023_11_13_0\\b7d6a154fb01420f825d564ae13e16cd",
                //                 "relativeFilePath": "\\service1\\2023_11_13_0\\b7d6a154fb01420f825d564ae13e16cd",
                //                 "size": 8236,
                //                 "md5": "C6B3D771BD812366C0E212130BACB0FB",
                //                 "url": "https://api-s1.shy.live/file?id=b7d6a154fb01420f825d564ae13e16cd",
                //                 "mime": "unknow",
                //                 "filename": "file",
                //                 "creater": "4EFGvb8P-2",
                //                 "source": "download",
                //                 "downloadUrl": "https://api-w1.shy.live/ws/file?id=d0e62328985e4e1b9b2bb3fc447862e9",
                //                 "isRobotGenerated": false,
                //                 "createDate<d>": 1699805006238
                //             },
                //             "icon": null,
                //             "classify": [
                //                 "个人"
                //             ],
                //             "tags": [
                //                 "指南"
                //             ],
                //             "sourcePageId": "bg2MfPyJtzSYABaCJETA5i",
                //             "sourceElementUrl": "/PageItem/bg2MfPyJtzSYABaCJETA5i",
                //             "creater": "4EFGvb8P-2",
                //             "userid": "4EFGvb8P-2",
                //             "approve": false,
                //             "id": "c6a0f4d5dba94ac69b9839406f88b43b",
                //             "useCount": 0,
                //             "previewCover": null,
                //             "isSysAutoCreateWorkspaceTemplate": false,
                //             "createDate<d>": 1699805006485
                //         },
                //         {
                //             "text": "产品更新日志",
                //             "url": "https://api-s1.shy.live/file?id=64ff6cde688f4d1b941df0067790e38e",
                //             "description": "您可以将此页作为您的APP、网站或项目的更新日志/最新进展进行分享，时刻让用户保持同步。",
                //             "type": "page",
                //             "sourceWorkspaceId": "4JXQ8D3y-3",
                //             "file": {
                //                 "ext": "",
                //                 "id": "64ff6cde688f4d1b941df0067790e38e",
                //                 "filePath": "D:\\files\\store\\service1\\2023_11_13_0\\64ff6cde688f4d1b941df0067790e38e",
                //                 "relativeFilePath": "\\service1\\2023_11_13_0\\64ff6cde688f4d1b941df0067790e38e",
                //                 "size": 8308,
                //                 "md5": "DC5EC21F83D3EF5380CEDE5E11AEFF21",
                //                 "url": "https://api-s1.shy.live/file?id=64ff6cde688f4d1b941df0067790e38e",
                //                 "mime": "unknow",
                //                 "filename": "file",
                //                 "creater": "4EFGvb8P-2",
                //                 "source": "download",
                //                 "downloadUrl": "https://api-w1.shy.live/ws/file?id=ae6daf4c35944a4597d50442723a854e",
                //                 "isRobotGenerated": false,
                //                 "createDate<d>": 1699805132281
                //             },
                //             "icon": null,
                //             "classify": [
                //                 "工作"
                //             ],
                //             "tags": [
                //                 "产品"
                //             ],
                //             "sourcePageId": "4hBj8zyvr7AEzRVpbxvSan",
                //             "sourceElementUrl": "/PageItem/4hBj8zyvr7AEzRVpbxvSan",
                //             "creater": "4EFGvb8P-2",
                //             "userid": "4EFGvb8P-2",
                //             "approve": false,
                //             "id": "7802024a3f4149828ef9d72f431a1d29",
                //             "useCount": 0,
                //             "previewCover": null,
                //             "isSysAutoCreateWorkspaceTemplate": false,
                //             "createDate<d>": 1699805132378
                //         },
                //         {
                //             "text": "团队空间主页",
                //             "url": "https://api-s2.shy.live/file?id=1483adfdacb048368e1cbf7764752e70",
                //             "description": "本模板可以作为团队空间的主页和总的入口，团队空间主页提供了一个中心化的信息平台，使团队成员能够在同一地方访问和共享项目、文档、任务、日历、讨论和其他信息。",
                //             "type": "page",
                //             "sourceWorkspaceId": "4JXQ8D3y-3",
                //             "file": {
                //                 "ext": "",
                //                 "id": "1483adfdacb048368e1cbf7764752e70",
                //                 "filePath": "D:\\files\\store\\service2\\2023_11_13_0\\1483adfdacb048368e1cbf7764752e70",
                //                 "relativeFilePath": "\\service2\\2023_11_13_0\\1483adfdacb048368e1cbf7764752e70",
                //                 "size": 103970,
                //                 "md5": "5936C39D1E83B2A0A357B26EA19366D0",
                //                 "url": "https://api-s2.shy.live/file?id=1483adfdacb048368e1cbf7764752e70",
                //                 "mime": "unknow",
                //                 "filename": "file",
                //                 "creater": "4EFGvb8P-2",
                //                 "source": "download",
                //                 "downloadUrl": "https://api-w1.shy.live/ws/file?id=9e77a4eea78c4dcda18080712f330f91",
                //                 "isRobotGenerated": false,
                //                 "createDate<d>": 1699805321759
                //             },
                //             "icon": {
                //                 "name": "emoji",
                //                 "code": "🍻"
                //             },
                //             "classify": [
                //                 "工作"
                //             ],
                //             "tags": [
                //                 "人员与组织"
                //             ],
                //             "sourcePageId": "4K4u404V-2-12S",
                //             "sourceElementUrl": "/PageItem/4K4u404V-2-12S",
                //             "creater": "4EFGvb8P-2",
                //             "userid": "4EFGvb8P-2",
                //             "approve": false,
                //             "id": "aaa2f7c117a043f685c7ccc74ab7614e",
                //             "useCount": 0,
                //             "previewCover": null,
                //             "isSysAutoCreateWorkspaceTemplate": false,
                //             "createDate<d>": 1699805321803
                //         },
                //         {
                //             "text": "服务条款",
                //             "url": "https://api-s2.shy.live/file?id=92904c8410294d01bb072f6c9c33be2f",
                //             "description": "您可以使用该模板撰写关于您的产品的服务条款并公开此页面",
                //             "type": "page",
                //             "sourceWorkspaceId": "4JXQ8D3y-3",
                //             "file": {
                //                 "ext": "",
                //                 "id": "92904c8410294d01bb072f6c9c33be2f",
                //                 "filePath": "D:\\files\\store\\service2\\2023_11_13_0\\92904c8410294d01bb072f6c9c33be2f",
                //                 "relativeFilePath": "\\service2\\2023_11_13_0\\92904c8410294d01bb072f6c9c33be2f",
                //                 "size": 11690,
                //                 "md5": "72944C4AF9560FCC2AE261798166CE86",
                //                 "url": "https://api-s2.shy.live/file?id=92904c8410294d01bb072f6c9c33be2f",
                //                 "mime": "unknow",
                //                 "filename": "file",
                //                 "creater": "4EFGvb8P-2",
                //                 "source": "download",
                //                 "downloadUrl": "https://api-w1.shy.live/ws/file?id=c92b83cc29f5411f997a48fd33cfd335",
                //                 "isRobotGenerated": false,
                //                 "createDate<d>": 1699807284298
                //             },
                //             "icon": {
                //                 "name": "emoji",
                //                 "code": "🗒️"
                //             },
                //             "classify": [
                //                 "项目"
                //             ],
                //             "tags": [
                //                 "指南"
                //             ],
                //             "sourcePageId": "jCPTUAjfV4YmKdoDUFa2Do",
                //             "sourceElementUrl": "/PageItem/jCPTUAjfV4YmKdoDUFa2Do",
                //             "creater": "4EFGvb8P-2",
                //             "userid": "4EFGvb8P-2",
                //             "approve": false,
                //             "id": "ba194a16a718405cbe258cbfa7141cbc",
                //             "useCount": 0,
                //             "previewCover": null,
                //             "isSysAutoCreateWorkspaceTemplate": false,
                //             "createDate<d>": 1699807258908
                //         }
                //     ],
                //     "total": 12,
                //     "page": 1,
                //     "size": 20
                // }
                this.templateList.list = rs.data.list;
                this.templateList.page = rs.data.page;
                this.templateList.size = rs.data.size;
                this.templateList.total = rs.data.total;
            }
        }
        catch (ex) {

        }
        finally {
            this.templateList.loading = false;
            this.forceUpdate();
        }
    }
    onLazySearch = lodash.debounce(() => {
        this.onSearch();
    }, 1000);
    iframe: HTMLIFrameElement;
    async onSetTemplate(pageTemplate: PageTemplateType) {
        this.currentPageTemplate = pageTemplate;
        if (!this.iframe.getAttribute('src')) {
            var su = pageTemplate.sourceElementUrl;
            if (!su) su = getElementUrl(ElementType.PageItem, this.currentPageTemplate.sourcePageId)
            var url = `/ws/${this.currentPageTemplate.sourceWorkspaceId}/r?url=` + encodeURIComponent(su);
            url = url + "&accessWorkspace=embed";
            if (window.shyConfig?.isPro) {
                url = (window.shyConfig.isUS ? "https://shy.red" : 'https://shy.live') + url
            }
            this.iframe.setAttribute('src', url);
        }
        else {
            this.iframe.contentWindow.postMessage(JSON.stringify({ name: 'openPageByTemplate', data: pageTemplate }), "*");
        }
        this.forceUpdate();
    }
    async onSelect(pageTemplate: PageTemplateType) {
        await channel.post('/workspace/template/useCount', { id: pageTemplate.id });
        this.emit('save', pageTemplate);
    }
    renderContent() {
        return <div className="flex-auto relative flex flex-col flex-full">
            <div className="flex-auto">
                <iframe ref={e => this.iframe = e} className="w100 h100 no-border"></iframe>
            </div>
            {this.currentPageTemplate && <div
                className="flex-fixed flex gap-16 padding-20 border round-16 "
                style={{
                    backgroundColor: 'rgb(251,251,250)'
                }}
            >
                <div className="flex-auto">
                    <div className="bold f-16">{this.currentPageTemplate.text}</div>
                    <div className="gap-h-10"><Avatar showName size={28} userid={this.currentPageTemplate.userid}></Avatar></div>
                    <div className="remark " style={{
                        maxWidth: 600
                    }}>{this.currentPageTemplate.description}</div>
                </div>
                <div className="flex-fixed">
                    <Button onClick={e => this.onSelect(this.currentPageTemplate)}><S>使用模板</S></Button>
                </div>
            </div>}
        </div>
    }
    render() {
        var w = window.innerWidth;
        var classList: string[] = ['vh90', 'vw90', 'user-none'];
        return <div className={classList.join(" ")}>
            <div className="flex flex-full h100">
                {this.renderSide()}
                {this.renderContent()}
            </div>
        </div>
    }
    open() {

    }
    currentPageTemplate: PageTemplateType = null;
    componentDidMount(): void {
        this.load();
    }
    async load() {
        await this.onSearch();
        if (this.templateList.list.length > 0) {
            await this.onSetTemplate(this.templateList.list[0]);
        }
    }
}

export async function useTemplateView() {
    let popover = await PopoverSingleton(TemplateView, { mask: true, shadow: true });
    let fv = await popover.open({ center: true });
    fv.open();
    return new Promise((resolve: (pageTemplate: PageTemplateType) => void, reject) => {
        fv.only('close', () => {
            popover.close();
            resolve(null);
        });
        fv.only('save', (pageTemplate: PageTemplateType) => {
            popover.close();
            resolve(pageTemplate)
        })
        popover.only('close', () => {
            resolve(null);
        });
    })
}

