import React, { ReactNode } from "react";
import * as Card1 from "../../../../../src/assert/img/card/card1.png"
import { FieldType } from "../../../../schema/type";
import { CardModel, CardViewCom } from "../../factory/observable";
import { CardView } from "../../view";
import { BlockUrlConstant } from "../../../../../../src/block/constant";
import { Avatar } from "../../../../../../component/view/avator/face";
import { UserBox } from "../../../../../../component/view/avator/user";
import { util } from "../../../../../../util/util";
import { S } from "../../../../../../i18n/view";

/**
 * 
 * https://segmentfault.com/questions
 * 
 */
// CardModel({ abled:false,
//     url: '/questions',
//     title: ('问题'),
//     remark: ('问答'),
//     image: Card1.default,
//     forUrls: [BlockUrlConstant.DataGridList],
//     props: [
//         {
//             name: 'title',
//             text: ('标题'),
//             types: [FieldType.title, FieldType.text],
//             required: true
//         },
//         { name: 'remark', text:( '描述'), types: [FieldType.plain, FieldType.text] },
//         { name: 'author', text:( '作者'), types: [FieldType.creater] },
//         { name: 'tags', text:( '分类'), types: [FieldType.option, FieldType.options] },
//         { name: 'date', text:( '日期'), types: [FieldType.createDate, FieldType.date] },
//         { name: 'comment', text: ('评论'), types: [FieldType.comment] },
//         { name: 'browse', text:( '浏览'), types: [FieldType.browse] },
//         { name: 'like', text: ('点赞'), types: [FieldType.like] },
//     ],
//     views: [
//         { url: BlockUrlConstant.DataGridTable, text: ('问题'), },
//         { autoCreate: true, url: BlockUrlConstant.DataGridList, text: ('列表'), },
//         { url: BlockUrlConstant.RecordPageView, text: ('问题详情'), }
//     ],
//     dataList: [
//         { title: '评论里面的点赞数量统计不对', remark: '' },
//         { title: '文档标题，选中标题一部分，按delete，发现把文档标题给弄没了，本意是删除标题里面的一部分文字', remark: '' },
//         { title: '图片块，有最小限制，需要支持图片原本的大小、50%等比例缩放', remark: '' },
//         { title: '页面控制台报错', remark: '' },
//         { title: '批量选择块，ctrl+c至其它页面，无反应', remark: '' },
//         { title: '大标题不能通过当前行的#来切换不同级别的标题', remark: '' },
//     ]
// })

// @CardViewCom('/questions')
// export class CardPin extends CardView {
//     render(): ReactNode {
//         var self = this;
//         var author = this.getValue<string>('author');
//         var title = this.getValue<string>('title');
//         var remark = this.getValue<string>('remark');
//         var date = this.getValue<Date>('date');
//         var tags = this.getValue<{ text: string, color: string }[]>('tags', FieldType.options);
//         var like = this.getValue<{ count: number, users: string[] }>('like', FieldType.like);
//         var browse = this.getValue<{ count: number, users: string[] }>('browse', FieldType.browse);
//         return <div className="w100" onMouseDown={e => self.openEdit(e)}>
//             <div className="flex flex-top border-bottom padding-h-10 ">
//                 <div className="flex-fixed flex f-14 r-gap-r-10">
//                     <div className="flex flex-col flex-center remark size-50 round border">
//                         <span>{like.count}</span>
//                         <span><S>点赞</S></span>
//                     </div>
//                     {/*<div className="flex flex-col flex-center  remark size-50  round border">
//                         <span>{browse.count}</span>
//                         <span>阅读</span>
//                     </div>*/}
//                 </div>
//                 <div className="flex-auto">
//                     <div className="h4">{title}</div>
//                     <div className="h-20 text-overflow l-20">{(remark || "").slice(0, 80)}</div>
//                     <div className="flex">
//                         <div className="flex-auto flex r-gap-r-10">
//                             {tags.map(tag => {
//                                 return <span key={tag.text} data-hover-style={JSON.stringify({ backgroundColor: 'rgb(208,227,241)' })} style={{ backgroundColor: 'rgb(225, 236, 244)', color: 'rgb(57, 115, 157)' }} className="padding-w-10 f-12 padding-h-3 round ">{tag.text}</span>
//                             })}
//                         </div>
//                         <div className="flex-fixed flex">
//                             <UserBox userid={author}>{(user) => {
//                                 return <>
//                                     <Avatar size={20} user={user}></Avatar>
//                                     <a className="cursor gap-l-10 underline-hover text-1">{user.name}</a>
//                                 </>
//                             }}</UserBox>
//                             <span className="remark gap-l-10 f-12">{util.showTime(date)}</span>
//                         </div>
//                     </div>
//                 </div>
//             </div>
//         </div>
//     }
// } 