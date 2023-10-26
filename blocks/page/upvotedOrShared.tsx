import { Block } from "../../src/block";
import { url, view } from "../../src/block/factory/observable";
import { BlockView } from "../../src/block/view";
import React from "react";
import { DotsSvg, LikeSvg, LinkSvg } from "../../component/svgs";
import { Icon } from "../../component/view/icon";
import { UserAvatars } from "../../component/view/avator/users";
import { FieldType } from "../data-grid/schema/type";
import { ElementType, getElementUrl } from "../../net/element.type";
import { channel } from "../../net/channel";
import lodash from "lodash";
import { BoxTip } from "../../component/view/tooltip/box";
import { S } from "../../i18n/view";
import { CopyAlert } from "../../component/copy";
import { lst } from "../../i18n/store";

/***
 * 点赞或分享
 */
@url('/page/UpvotedOrShared')
export class UpvotedOrShared extends Block {
    async didMounted() {
        var elementUrl: string;
        if (this.page.formRowData) {
            elementUrl = getElementUrl(ElementType.SchemaFieldNameData,
                this.page.schema.id,
                FieldType[FieldType.like],
                this.page.formRowData.id
            )
        }
        else {
            elementUrl = getElementUrl(ElementType.PageItemEmoji, this.page.pageInfo.id, FieldType[FieldType.like])
        }
        var r = await channel.get('/user/interactives',
            {

                schemaId: this.page.schema?.id,
                ids: this.page.formRowData ? [this.page.formRowData.id] : [],
                ws: this.page.ws,
                es: [elementUrl]
            });
        if (r.ok) {
            this.userEmojis = r.data.list;
        }
    }
    userEmojis: Record<string, string[]> = {};
}
@view('/page/UpvotedOrShared')
export class UpvotedOrSharedView extends BlockView<UpvotedOrShared>{
    async onLike() {
        var elementUrl: string;
        if (this.block.page.formRowData) {
            elementUrl = getElementUrl(ElementType.SchemaFieldNameData,
                this.block.page.schema.id,
                FieldType[FieldType.like],
                this.block.page.formRowData.id
            )
        }
        else {
            elementUrl = getElementUrl(ElementType.PageItemEmoji, this.block.page.pageInfo.id, FieldType[FieldType.like])
        }
        var r = await channel.patch('/interactive/emoji', {
            elementUrl: elementUrl,
            fieldName: FieldType[FieldType.like]
        });
        if (r.ok) {
            if (this.block.page.formRowData) {
                if (typeof this.block.page.formRowData[FieldType[FieldType.like]] == 'undefined') this.block.page.formRowData[FieldType[FieldType.like]] = { count: 0, users: [] };
                this.block.page.formRowData[FieldType[FieldType.like]].count = r.data.count;
                if (r.data.exists) this.block.page.formRowData[FieldType[FieldType.like]].users.push(this.block.page.user?.id)
                else lodash.remove(this.block.page.formRowData[FieldType[FieldType.like]].users, g => g == this.block.page.user?.id)
                if (r.data.exists) this.block.userEmojis.like.push(this.block.page.formRowData.id)
                else lodash.remove(this.block.userEmojis.like, g => g == this.block.page.formRowData.id)
            }
            else {
                if (typeof this.block.page.pageInfo) {
                    if (typeof this.block.page.pageInfo[FieldType[FieldType.like]] == 'undefined') this.block.page.pageInfo[FieldType[FieldType.like]] = { count: 0, users: [] };
                    this.block.page.pageInfo[FieldType[FieldType.like]].count = r.data.count;
                    if (r.data.exists) this.block.page.pageInfo[FieldType[FieldType.like]].users.push(this.block.page.user?.id)
                    else lodash.remove(this.block.page.pageInfo[FieldType[FieldType.like]].users, g => g == this.block.page.user?.id)
                    if (r.data.exists) this.block.userEmojis.like.push(this.block.page.pageInfo.id)
                    else lodash.remove(this.block.userEmojis.like, g => g == this.block.page.pageInfo.id)
                }
            }
            this.forceUpdate();
        }
    }
    async onWxShare(type: 'weixin' | 'weibo') {
        var pd = this.block.page.getPageDataInfo();
        channel.act('/shy/share', {
            type,
            title: pd.text,
            description: pd.description,
            url: this.block.page.pageUrl
        })
    }
    renderView() {
        var likeCount = 0;
        var users: string[] = [];
        var isLike: boolean = false;
        if (this.block.page.formRowData) {
            var v = this.block.page.formRowData[FieldType[FieldType.like]];
            if (v) {
                likeCount = v.count;
                users = v.users;
                isLike = this.block.userEmojis.like.includes(this.block.page.formRowData.id)
            }
        }
        else if (this.block.page.pageInfo) {
            var v = this.block.page.pageInfo[FieldType[FieldType.like]];
            if (v) {
                likeCount = v.count;
                users = v.users;
                isLike = this.block.userEmojis.like.includes(this.block.page.pageInfo.id)
            }
        }
        return <div style={this.block.visibleStyle}>
            <div className="flex">
                <div className="flex-fixed flex">
                    <span onMouseDown={e => this.onLike()} className={"padding-w-5 padding-h-3 round " + (isLike ? " border-primary bg-primary text-white" : " text-1 item-hover border")}><Icon icon={LikeSvg}></Icon>{likeCount > 0 && <span>{likeCount}</span>}</span>
                    <span className="gap-r-10"><UserAvatars users={users}></UserAvatars></span>
                </div>
                <div className="flex-auto flex-end r-flex-center r-round-24 r-item-hover r-gap-l-5">
                    <BoxTip overlay={<div className=" r-padding-w-10 r-padding-h-5 r-flex">
                        <div className="flex" onMouseDown={e => CopyAlert(this.block.page.pageUrl, lst('已复制链接'))}><span><Icon icon={LinkSvg}></Icon></span><span><S>复制链接</S></span></div>
                        <div className="flex" onMouseDown={e => { this.onWxShare('weixin') }}><span><Icon icon={{ name: 'bytedance-icon', code: "friends-circle" }}></Icon></span><span><S>微信分享</S></span></div>
                        {/* <div className="flex"  onMouseDown={e => { this.onWxShare('weibo') }}><span><Icon icon={{ name: 'bytedance-icon', code: "weibo" }}></Icon></span><S>微博分享</S></div> */}
                    </div>}>
                        <span><Icon icon={{ name: 'bytedance-icon', code: "send" }}></Icon></span>
                    </BoxTip>
                    {this.block.isCanEdit() && <span onMouseDown={e => this.block.onContextmenu(e.nativeEvent)} ><Icon icon={DotsSvg}></Icon></span>}
                </div>
            </div>
        </div>
    }
}