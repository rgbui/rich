
import React, { ReactNode } from "react";
import { IconArguments, ResourceArguments } from "../../../../../../extensions/icon/declare";
import { BlockUrlConstant } from "../../../../../../src/block/constant";
import { FieldType } from "../../../../schema/type";
import { CardModel, CardViewCom } from "../../factory/observable";
import { CardView } from "../../view";
import * as Card1 from "../../../../../src/assert/img/card/card7.jpg"
import { UserBox } from "../../../../../../component/view/avator/user";
import { Avatar } from "../../../../../../component/view/avator/face";
import { lst } from "../../../../../../i18n/store";

/**
 * https://segmentfault.com/events
 */
// CardModel('/user/story', () => ({
//     url: '/user/story',
//     title: lst('名片'),
//     image: Card1.default,
//     forUrls: [BlockUrlConstant.DataGridGallery],
//     props: [
//         { name: 'user', text: lst('用户'), types: [FieldType.creater, FieldType.user] },
//         { name: 'logo', text: lst('Logo'), types: [FieldType.image] },
//         { name: 'qr', text: lst('二维码'), types: [FieldType.image] },
//         { name: 'title', text: lst('呢称'), types: [FieldType.title, FieldType.text] },
//         { name: 'profession', text: lst('职业'), types: [FieldType.text] },
//         { name: 'email', text: ('邮箱'), types: [FieldType.email] },
//         { name: 'phone', text: ('手机'), types: [FieldType.phone] },
//         { name: 'address', text: ('地址'), types: [FieldType.text] },
//         { name: 'weixin', text: ('微信'), types: [FieldType.text] },
//         { name: 'company', text: lst('公司'), types: [FieldType.text] },
//         { name: 'url', text: lst('网址'), types: [FieldType.link] },
//         { name: 'introduction', text: lst('简介'), types: [FieldType.text, FieldType.plain] },
//         { name: 'pic', text: lst('名片正面背景图'), types: [FieldType.image] },
//         { name: 'npic', text: lst('名片背面背景图'), types: [FieldType.image] },
//     ],
//     views: [
//         { url: BlockUrlConstant.DataGridTable, text: ('用户故事'), },
//         { autoCreate: true, url: BlockUrlConstant.DataGridGallery, text: ('用户故事-列表'), },
//         { url: BlockUrlConstant.RecordPageView, text: ('故事详情'), }
//     ],
//     dataList: [
//         {
//             title: '',
//             story: '诗云解决了我在工作中遇到的信息孤岛问题，可以预见，未来基于诗云的信息组织能力在非常多的场景中进行协同，可以产生巨大的威力！',
//             introduction: '用户体验专家'
//         },
//         {
//             title: '',
//             story: '记录的作用不在于记录行为本身，而是对未来的可检索性、可连接性与可启发性。我用诗云记录当下的灵感、思考与数据，用诗云启发与重建未来的思考与创造。',
//             introduction: '作词人'
//         },
//         {
//             title: '',
//             story: '我使用诗云做大量日常课业、科研、社工、社团、支教等等记录；同时由于工作原因，我需要一个几乎什么内容都可以往里写、输入快捷、方便整理与演示、可云同步的笔记平台，最令我满意的就是诗云。',
//             introduction: '哈尔滨工业大学 工程物理系'
//         },
//     ]
// }))

// @CardViewCom('/user/story')
// export class CardPin extends CardView {
//     render(): ReactNode {
//         var self = this;
//         var users = this.getValue<string[]>('user', FieldType.user);
//         var userid = users[0];
//         var pic = this.getValue<IconArguments[]>('pic');
//         var npic = this.getValue<IconArguments[]>('npic');
//         var title = this.getValue<string>('title');
//         var story = this.getValue<string>('story');
//         var introduction = this.getValue<string>('introduction');
//         var qr = this.getValue<ResourceArguments[]>('logo');
//         var url = this.getValue<string>('url');
//         var phone = this.getValue<string>('phone');
//         var weixin = this.getValue<string>('weixin');
//         var email = this.getValue<string>('email');
//         var address = this.getValue<string>('address');
//         var profession = this.getValue<string>('profession');
//         var company = this.getValue<string>('company');
//         var isFront=this.getValue<boolean>('isFront');

//         return <div onMouseDown={e => self.openEdit(e)} className="flex flex-col flex-full">
//             <UserBox userid={userid}>
//                 {user => {
//                     return <div className="padding-20 bg-white  shadow round-16" style={{ boxShadow: '0 4px 20px rgba(0,0,0,.07)', borderRadius: 12 }}>
//                         <div className="flex">
//                             <div className="flex-fixed"><Avatar user={user} size={40}></Avatar></div>
//                             <div className="flex-auto gap-l-10">
//                                 <div className="f-18">{title || user.name}</div>
//                                 <div className="remark f-14">{introduction}</div>
//                             </div>
//                         </div>
//                         <div className="f-14 gap-t-10">{story}</div>
//                     </div>
//                 }}
//             </UserBox>
//         </div>
//     }
// } 